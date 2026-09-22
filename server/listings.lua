Listings = {}

local PREFIX = {
    vehicles = 'veh',
    weapons = 'wep',
    extras = 'ext',
    bundles = 'bdl',
    pets = 'pet',
    exclusives = 'ex',
    limited = 'lim',
    gangs = 'gang',
}

local function trim(value)
    if type(value) ~= 'string' then
        return ''
    end
    return value:match('^%s*(.-)%s*$') or ''
end

local function slug(value)
    local s = trim(value):lower():gsub('[^a-z0-9]+', '_'):gsub('^_+', ''):gsub('_+$', '')
    if s == '' then
        s = 'listing'
    end
    return s:sub(1, 40)
end

local function toBool(value)
    return value == true or value == 1 or value == '1' or value == 'true' or value == 'on'
end

local function toInt(value, fallback)
    local n = tonumber(value)
    if n == nil then
        return fallback
    end
    return math.floor(n)
end

local function parseExtras(payload)
    local raw = payload and (payload.bundleItems or payload.extras)
    if type(raw) == 'string' and raw ~= '' then
        local ok, decoded = pcall(json.decode, raw)
        if ok then
            raw = decoded
        else
            return {}
        end
    end
    if type(raw) ~= 'table' then
        return {}
    end
    local extras = {}
    local function push(row)
        if type(row) ~= 'table' then
            return
        end
        local name = trim(row.item or row.name or '')
        local count = math.max(1, toInt(row.count, 1))
        if name ~= '' then
            extras[#extras + 1] = { item = name, count = count }
        end
    end
    -- JSON arrays are 1-based; some NUI payloads keep a 0 index.
    if raw[0] ~= nil then
        for i = 0, #raw do
            push(raw[i])
        end
    elseif #raw > 0 then
        for i = 1, #raw do
            push(raw[i])
        end
    else
        for _, row in pairs(raw) do
            push(row)
        end
    end
    return extras
end

local function prettyName(value)
    local s = trim(value):gsub('^WEAPON_', ''):gsub('[_%-]+', ' ')
    s = s:gsub('(%a)([%w]*)', function(first, rest)
        return first:upper() .. rest:lower()
    end)
    return trim(s)
end

local function uniqueId(category, label, requested)
    local base = trim(requested)
    if base == '' then
        base = ('%s_%s'):format(PREFIX[category] or 'item', slug(label))
    else
        base = slug(base)
    end
    if not GetCatalogItem(base) then
        return base
    end
    local i = 2
    while GetCatalogItem(base .. '_' .. i) do
        i = i + 1
    end
    return base .. '_' .. i
end

function Listings.Normalize(payload, existingId)
    if type(payload) ~= 'table' then
        return nil, 'invalid'
    end
    local category = trim(payload.category)
    if category == 'pets' then
        -- leftover pet editor is hidden; keep grants working if a row is saved somehow
    elseif not Shop.IsCategory(category) then
        return nil, 'invalid_category'
    end
    local itemName = trim(payload.itemName or payload.item or payload.weapon or '')
    local model = trim(payload.model or '')
    local label = trim(payload.label or payload.name)
    if label == '' then
        if model ~= '' then
            label = prettyName(model)
        elseif itemName ~= '' then
            local oxLabel
            if OxInv and OxInv.Describe then
                local _, data = OxInv.Describe(itemName)
                oxLabel = data and data.label
            end
            label = oxLabel or prettyName(itemName)
        end
    end
    if label == '' then
        return nil, 'invalid_label'
    end
    local price = toInt(payload.price, nil)
    if not price or price < 0 then
        return nil, 'invalid_price'
    end
    local petModel = trim(payload.petModel or '')
    local image = trim(payload.image or payload.imageUrl or '')
    local count = math.max(1, toInt(payload.count, 1))
    local ammo = toInt(payload.ammo, nil)
    local stock = toInt(payload.stock, nil)
    if stock and stock < 0 then
        stock = nil
    end
    local grantType = Shop.GrantType(category)
    if category == 'pets' then
        grantType = 'mixed'
    end
    local usesTiers = Shop.UsesTiers(category)
    local tier = trim(payload.tier)
    if usesTiers then
        tier = NormalizeTier(tier)
        if not Shop.IsTier(tier) then
            tier = Shop.DefaultTier()
        end
    else
        tier = nil
    end

    local extras = parseExtras(payload)

    if grantType == 'vehicle' and model == '' then
        return nil, 'missing_model'
    end
    if grantType == 'weapon' and itemName == '' then
        return nil, 'missing_item'
    end
    if grantType == 'item' and itemName == '' and model == '' then
        return nil, 'missing_item'
    end
    if grantType == 'bundle' and #extras < 2 then
        return nil, 'missing_bundle'
    end
    if grantType == 'mixed' and model == '' and itemName == '' and petModel == '' and #extras < 1 then
        return nil, 'missing_item'
    end
    if category == 'pets' and petModel == '' then
        return nil, 'missing_pet'
    end

    local requested = trim(payload.id or payload.itemId)
    if requested == '' and itemName ~= '' and category ~= 'vehicles' then
        requested = itemName
    end
    local id
    if existingId and existingId ~= '' then
        id = existingId
    elseif requested ~= '' then
        id = slug(requested)
        if GetCatalogItem(id) then
            return nil, 'listing_exists'
        end
    else
        id = uniqueId(category, label, '')
    end
    local item = {
        id = id,
        category = category,
        tier = tier,
        label = label,
        description = trim(payload.description),
        price = price,
        unique = toBool(payload.unique),
        stock = stock,
        image = image ~= '' and image or nil,
        imageKey = trim(payload.imageKey) ~= '' and trim(payload.imageKey) or nil,
        garageId = trim(payload.garageId) ~= '' and trim(payload.garageId) or nil,
        garageType = trim(payload.garageType) ~= '' and trim(payload.garageType) or nil,
        limitedFrom = trim(payload.limitedFrom) ~= '' and trim(payload.limitedFrom) or nil,
        limitedUntil = trim(payload.limitedUntil) ~= '' and trim(payload.limitedUntil) or nil,
    }

    if model ~= '' then
        item.model = model
        if not item.imageKey then
            item.imageKey = model
        end
    end

    if grantType ~= 'bundle' then
        if grantType == 'weapon' or (itemName ~= '' and itemName:upper():find('^WEAPON_')) then
            item.weapon = itemName:upper()
            item.item = item.weapon
            item.ammo = ammo
            if not item.imageKey then
                item.imageKey = item.item
            end
        elseif itemName ~= '' then
            item.item = itemName
            if not item.imageKey then
                item.imageKey = itemName
            end
        end
    end

    if grantType == 'bundle' then
        item.extras = extras
        if extras[1] and not item.imageKey then
            item.imageKey = extras[1].item
        end
    elseif grantType == 'item' or (item.item and not item.model and not item.weapon and category ~= 'pets') then
        item.extras = {
            { item = item.item or itemName, count = count },
        }
    end

    if petModel ~= '' then
        item.petModel = petModel
        if not item.imageKey then
            item.imageKey = itemName ~= '' and itemName or id
        end
    end

    if category == 'pets' and item.unique == false then
        item.unique = true
    end

    return item
end

function Listings.FromRow(row)
    if not row then
        return nil
    end
    local extras = {}
    if row.extras and row.extras ~= '' then
        local ok, decoded = pcall(json.decode, row.extras)
        if ok and type(decoded) == 'table' then
            extras = decoded
        end
    end
    local item = {
        id = row.item_id,
        category = row.category,
        tier = row.tier and NormalizeTier(row.tier) or nil,
        label = row.label,
        description = row.description,
        price = tonumber(row.price) or 0,
        image = row.image ~= '' and row.image or nil,
        imageKey = row.image_key ~= '' and row.image_key or nil,
        item = row.item_name ~= '' and row.item_name or nil,
        weapon = row.weapon ~= '' and row.weapon or nil,
        model = row.model ~= '' and row.model or nil,
        petModel = row.pet_model ~= '' and row.pet_model or nil,
        ammo = tonumber(row.ammo),
        unique = tonumber(row.unique_item) == 1,
        stock = tonumber(row.stock),
        limitedFrom = row.limited_from ~= '' and row.limited_from or nil,
        limitedUntil = row.limited_until ~= '' and row.limited_until or nil,
        garageId = row.garage_id ~= '' and row.garage_id or nil,
        garageType = row.garage_type ~= '' and row.garage_type or nil,
        extras = extras,
    }
    if (not item.extras or #item.extras == 0) and item.item and not item.model and not item.weapon and not item.petModel then
        item.extras = { { item = item.item, count = tonumber(row.item_count) or 1 } }
    end
    return item
end

function Listings.Rebuild()
    CatalogReset()
    local rows = DB.GetListings()
    for i = 1, #rows do
        CatalogPut(Listings.FromRow(rows[i]))
    end
end

function Listings.Save(payload, existingId)
    local item, err = Listings.Normalize(payload, existingId)
    if not item then
        return nil, err
    end
    DB.UpsertListing(item, payload.count)
    Listings.Rebuild()
    return GetCatalogItem(item.id)
end

function Listings.Delete(itemId)
    if not itemId or itemId == '' then
        return false
    end
    DB.DeleteListing(itemId)
    Listings.Rebuild()
    return true
end

function Listings.EditorRows()
    local all = CatalogAll()
    local out = {}
    for i = 1, #all do
        local item = all[i]
        out[#out + 1] = {
            id = item.id,
            category = item.category,
            tier = item.tier,
            label = item.label,
            description = item.description,
            price = item.price,
            image = item.image,
            imageKey = item.imageKey,
            item = item.item,
            weapon = item.weapon,
            model = item.model,
            petModel = item.petModel,
            ammo = item.ammo,
            unique = item.unique,
            stock = item.stock,
            limitedFrom = item.limitedFrom,
            limitedUntil = item.limitedUntil,
            garageId = item.garageId,
            garageType = item.garageType,
            extras = item.extras,
            count = item.extras and item.extras[1] and item.extras[1].count or 1,
        }
    end
    return out
end

function Listings.ReloadShop()
    Shop.Apply(DB.GetShopMeta('category'), DB.GetShopMeta('tier'))
    TiersRefresh()
    Listings.Rebuild()
end

local function nextSort(kind)
    local maxSort = 0
    local rows = kind == 'tier' and Shop.tiers or Shop.categories
    for i = 1, #(rows or {}) do
        if (rows[i].sort or 0) > maxSort then
            maxSort = rows[i].sort
        end
    end
    return maxSort + 10
end

function Listings.SaveCategory(payload)
    if type(payload) ~= 'table' then
        return nil, 'invalid'
    end
    local existingId = trim(payload.id or payload.metaId)
    local existing = existingId ~= '' and Shop.GetCategory(existingId) or nil
    local label = trim(payload.label)
    if label == '' then
        return nil, 'invalid_tab_label'
    end
    local id = existing and existing.id or Shop.Slug(payload.newId or label, 'tab')
    if Shop.RESERVED[id] then
        return nil, 'reserved_tab'
    end
    if not existing and Shop.GetCategory(id) then
        return nil, 'tab_exists'
    end
    local grantType = tostring(payload.grantType or (existing and existing.grantType) or 'item')
    if not Shop.GRANT_TYPES[grantType] then
        grantType = 'item'
    end
    local gated = tostring(payload.gated or (existing and existing.gated) or 'none')
    if gated ~= 'gang' then
        gated = 'none'
    end
    local usesTiers = toBool(payload.usesTiers)
    if existing and existing.builtin then
        grantType = existing.grantType
        usesTiers = existing.usesTiers
    elseif grantType == 'vehicle' then
        usesTiers = payload.usesTiers == nil and true or usesTiers
    end
    local timed = existing and existing.timed or toBool(payload.timed)
    if existing and existing.builtin then
        timed = existing.timed
    end
    local enabled = payload.enabled
    if enabled == nil then
        enabled = existing and existing.enabled
    else
        enabled = toBool(enabled)
    end
    if enabled == nil then
        enabled = true
    end
    local row = {
        id = id,
        label = label,
        grantType = grantType,
        usesTiers = usesTiers,
        gated = gated,
        timed = timed,
        builtin = existing and existing.builtin or false,
        enabled = enabled,
        sort = existing and existing.sort or nextSort('category'),
    }
    DB.UpsertShopMeta('category', row)
    Listings.ReloadShop()
    return Shop.GetCategory(id)
end

function Listings.DeleteCategory(id)
    id = trim(id)
    local cat = Shop.GetCategory(id)
    if not cat then
        return nil, 'invalid_category'
    end
    if cat.builtin then
        cat.enabled = false
        DB.UpsertShopMeta('category', cat)
        Listings.ReloadShop()
        return cat, nil, 'hidden'
    end
    if DB.CountListingsInCategory(id) > 0 then
        return nil, 'category_in_use'
    end
    DB.DeleteShopMeta('category', id)
    Listings.ReloadShop()
    return true
end

function Listings.MoveCategory(id, direction)
    id = trim(id)
    local list = Shop.categories or {}
    local index
    for i = 1, #list do
        if list[i].id == id then
            index = i
            break
        end
    end
    if not index then
        return nil, 'invalid_category'
    end
    local swapWith = index + (tonumber(direction) or 0)
    if swapWith < 1 or swapWith > #list then
        return Shop.GetCategory(id)
    end
    local a, b = list[index], list[swapWith]
    a.sort, b.sort = b.sort, a.sort
    if a.sort == b.sort then
        a.sort = a.sort + (direction > 0 and 1 or -1)
    end
    DB.UpsertShopMeta('category', a)
    DB.UpsertShopMeta('category', b)
    Listings.ReloadShop()
    return Shop.GetCategory(id)
end

function Listings.SaveTier(payload)
    if type(payload) ~= 'table' then
        return nil, 'invalid'
    end
    local existingId = trim(payload.id)
    local existing = existingId ~= '' and Shop.GetTier(existingId) or nil
    local label = trim(payload.label)
    if label == '' then
        return nil, 'invalid_tier_label'
    end
    local id = existing and existing.id or Shop.Slug(payload.newId or label, 'tier')
    if id == '' then
        return nil, 'invalid_tier_label'
    end
    if not existing and Shop.GetTier(id) then
        return nil, 'tier_exists'
    end
    local enabled = payload.enabled
    if enabled == nil then
        enabled = existing and existing.enabled
    else
        enabled = toBool(enabled)
    end
    if enabled == nil then
        enabled = true
    end
    local row = {
        id = id,
        label = label,
        builtin = existing and existing.builtin or false,
        enabled = enabled,
        sort = existing and existing.sort or nextSort('tier'),
    }
    DB.UpsertShopMeta('tier', row)
    Listings.ReloadShop()
    return Shop.GetTier(id)
end

function Listings.DeleteTier(id)
    id = trim(id)
    local tier = Shop.GetTier(id)
    if not tier then
        return nil, 'invalid_tier'
    end
    local enabled = Shop.EnabledTiers()
    local remaining = 0
    for i = 1, #enabled do
        if enabled[i].id ~= id then
            remaining = remaining + 1
        end
    end
    if remaining < 1 then
        return nil, 'last_tier'
    end
    local fallback = Shop.DefaultTier()
    if fallback == id then
        for i = 1, #enabled do
            if enabled[i].id ~= id then
                fallback = enabled[i].id
                break
            end
        end
    end
    if DB.CountListingsInTier(id) > 0 then
        DB.ReassignListingTier(id, fallback)
    end
    DB.DeleteShopMeta('tier', id)
    Listings.ReloadShop()
    return true, fallback
end

function Listings.MoveTier(id, direction)
    id = trim(id)
    local list = Shop.tiers or {}
    local index
    for i = 1, #list do
        if list[i].id == id then
            index = i
            break
        end
    end
    if not index then
        return nil, 'invalid_tier'
    end
    local swapWith = index + (tonumber(direction) or 0)
    if swapWith < 1 or swapWith > #list then
        return Shop.GetTier(id)
    end
    local a, b = list[index], list[swapWith]
    a.sort, b.sort = b.sort, a.sort
    if a.sort == b.sort then
        a.sort = a.sort + (direction > 0 and 1 or -1)
    end
    DB.UpsertShopMeta('tier', a)
    DB.UpsertShopMeta('tier', b)
    Listings.ReloadShop()
    return Shop.GetTier(id)
end

