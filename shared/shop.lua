--[[
    Live shop layout: categories (tabs) and vehicle tiers.
    Defaults seed into dj_305donator_shop_meta; admins add/remove them in-game.
]]

Shop = Shop or {}

Shop.RESERVED = {
    dashboard = true,
    inventory = true,
    admin = true,
    pets = true,
    open = true,
    close = true,
    purchase = true,
    gift = true,
    redeem = true,
}

Shop.GRANT_TYPES = {
    vehicle = true,
    weapon = true,
    item = true,
    bundle = true,
    mixed = true,
}

local function trim(value)
    if type(value) ~= 'string' then
        return ''
    end
    return value:match('^%s*(.-)%s*$') or ''
end

function Shop.Slug(value, fallback)
    local s = trim(value):lower():gsub('[^a-z0-9]+', '_'):gsub('^_+', ''):gsub('_+$', '')
    if s == '' then
        s = fallback or 'item'
    end
    return s:sub(1, 32)
end

function Shop.DefaultCategories()
    return {
        { id = 'vehicles', label = 'Vehicles', grantType = 'vehicle', usesTiers = true, gated = 'none', timed = false, builtin = true, enabled = true, sort = 10 },
        { id = 'weapons', label = 'Weapons', grantType = 'weapon', usesTiers = false, gated = 'none', timed = false, builtin = true, enabled = true, sort = 20 },
        { id = 'extras', label = 'Extra Items', grantType = 'item', usesTiers = false, gated = 'none', timed = false, builtin = true, enabled = true, sort = 30 },
        { id = 'bundles', label = 'Bundles', grantType = 'bundle', usesTiers = false, gated = 'none', timed = false, builtin = true, enabled = true, sort = 40 },
        { id = 'gangs', label = 'Gang Store', grantType = 'mixed', usesTiers = false, gated = 'gang', timed = false, builtin = true, enabled = true, sort = 50 },
        { id = 'exclusives', label = 'City Exclusives', grantType = 'mixed', usesTiers = false, gated = 'none', timed = false, builtin = true, enabled = true, sort = 60 },
        { id = 'limited', label = 'Limited Time', grantType = 'mixed', usesTiers = false, gated = 'none', timed = true, builtin = true, enabled = true, sort = 70 },
    }
end

function Shop.DefaultTiers()
    return {
        { id = 'emerald', label = 'Emerald', builtin = true, enabled = true, sort = 10 },
        { id = 'sapphire', label = 'Sapphire', builtin = true, enabled = true, sort = 20 },
        { id = 'blackdiamond', label = 'Black Diamond', builtin = true, enabled = true, sort = 30 },
    }
end

Shop.TIER_ALIASES = {
    bronze = 'emerald',
    silver = 'sapphire',
    gold = 'blackdiamond',
    black_diamond = 'blackdiamond',
    ['black diamond'] = 'blackdiamond',
    diamond = 'blackdiamond',
}

local function copyRow(row)
    local out = {}
    for k, v in pairs(row) do
        out[k] = v
    end
    return out
end

local function sortByOrder(list)
    table.sort(list, function(a, b)
        if a.sort == b.sort then
            return a.id < b.id
        end
        return (a.sort or 0) < (b.sort or 0)
    end)
    return list
end

function Shop.ResetToDefaults()
    Shop.categories = {}
    Shop.categoryMap = {}
    Shop.tiers = {}
    Shop.tierMap = {}
    for _, row in ipairs(Shop.DefaultCategories()) do
        local copy = copyRow(row)
        Shop.categories[#Shop.categories + 1] = copy
        Shop.categoryMap[copy.id] = copy
    end
    for _, row in ipairs(Shop.DefaultTiers()) do
        local copy = copyRow(row)
        Shop.tiers[#Shop.tiers + 1] = copy
        Shop.tierMap[copy.id] = copy
    end
end

local function decodeData(raw)
    if type(raw) == 'table' then
        return raw
    end
    if type(raw) ~= 'string' or raw == '' then
        return {}
    end
    local ok, decoded = pcall(json.decode, raw)
    if ok and type(decoded) == 'table' then
        return decoded
    end
    return {}
end

function Shop.CategoryFromMeta(row)
    if not row then
        return nil
    end
    local data = decodeData(row.data)
    local id = Shop.Slug(row.meta_id or row.id or data.id)
    if id == '' or Shop.RESERVED[id] then
        return nil
    end
    local grantType = tostring(data.grantType or 'item')
    if not Shop.GRANT_TYPES[grantType] then
        grantType = 'item'
    end
    local gated = tostring(data.gated or 'none')
    if gated ~= 'gang' and gated ~= 'admin' then
        gated = 'none'
    end
    return {
        id = id,
        label = trim(row.label) ~= '' and trim(row.label) or id,
        grantType = grantType,
        usesTiers = data.usesTiers == true,
        gated = gated,
        timed = data.timed == true,
        builtin = data.builtin == true,
        enabled = tonumber(row.enabled) ~= 0,
        sort = tonumber(row.sort_order) or 0,
    }
end

function Shop.TierFromMeta(row)
    if not row then
        return nil
    end
    local data = decodeData(row.data)
    local id = Shop.Slug(row.meta_id or row.id or data.id)
    if id == '' then
        return nil
    end
    return {
        id = id,
        label = trim(row.label) ~= '' and trim(row.label) or id,
        builtin = data.builtin == true,
        enabled = tonumber(row.enabled) ~= 0,
        sort = tonumber(row.sort_order) or 0,
    }
end

function Shop.Apply(categoryRows, tierRows)
    local categories, categoryMap = {}, {}
    for i = 1, #(categoryRows or {}) do
        local cat = Shop.CategoryFromMeta(categoryRows[i])
        if cat and not categoryMap[cat.id] then
            categories[#categories + 1] = cat
            categoryMap[cat.id] = cat
        end
    end
    if #categories == 0 then
        Shop.ResetToDefaults()
        categories, categoryMap = Shop.categories, Shop.categoryMap
    end

    local tiers, tierMap = {}, {}
    for i = 1, #(tierRows or {}) do
        local tier = Shop.TierFromMeta(tierRows[i])
        if tier and not tierMap[tier.id] then
            tiers[#tiers + 1] = tier
            tierMap[tier.id] = tier
        end
    end
    if #tiers == 0 then
        for _, row in ipairs(Shop.DefaultTiers()) do
            local copy = copyRow(row)
            tiers[#tiers + 1] = copy
            tierMap[copy.id] = copy
        end
    end

    Shop.categories = sortByOrder(categories)
    Shop.categoryMap = categoryMap
    Shop.tiers = sortByOrder(tiers)
    Shop.tierMap = tierMap
end

function Shop.GetCategory(id)
    return id and Shop.categoryMap[id] or nil
end

function Shop.IsCategory(id)
    return Shop.GetCategory(id) ~= nil
end

function Shop.AllCategories()
    return Shop.categories or {}
end

function Shop.EnabledCategories()
    local out = {}
    for i = 1, #Shop.AllCategories() do
        local cat = Shop.categories[i]
        if cat.enabled then
            out[#out + 1] = cat
        end
    end
    return out
end

function Shop.UsesTiers(id)
    local cat = Shop.GetCategory(id)
    return cat and cat.usesTiers == true
end

function Shop.GrantType(id)
    local cat = Shop.GetCategory(id)
    return cat and cat.grantType or 'item'
end

function Shop.IsGang(id)
    local cat = Shop.GetCategory(id)
    return cat and cat.gated == 'gang'
end

function Shop.IsTimed(id)
    local cat = Shop.GetCategory(id)
    return cat and cat.timed == true
end

function Shop.EnabledTiers()
    local out = {}
    for i = 1, #(Shop.tiers or {}) do
        local tier = Shop.tiers[i]
        if tier.enabled then
            out[#out + 1] = tier
        end
    end
    if #out == 0 then
        return Shop.DefaultTiers()
    end
    return out
end

function Shop.TierIds()
    local ids = {}
    for i = 1, #Shop.EnabledTiers() do
        ids[#ids + 1] = Shop.EnabledTiers()[i].id
    end
    return ids
end

function Shop.DefaultTier()
    local tiers = Shop.EnabledTiers()
    return tiers[1] and tiers[1].id or 'emerald'
end

function Shop.IsTier(id)
    return id and Shop.tierMap[id] ~= nil and Shop.tierMap[id].enabled ~= false
end

function Shop.GetTier(id)
    return id and Shop.tierMap[id] or nil
end

function Shop.ClientCategories(isAdmin, isGangMember)
    local out = {}
    for i = 1, #Shop.AllCategories() do
        local cat = Shop.categories[i]
        if cat.enabled or isAdmin then
            if cat.gated ~= 'gang' or isGangMember or isAdmin then
                out[#out + 1] = {
                    id = cat.id,
                    label = cat.label,
                    grantType = cat.grantType,
                    usesTiers = cat.usesTiers,
                    gated = cat.gated,
                    timed = cat.timed,
                    builtin = cat.builtin,
                    enabled = cat.enabled,
                    sort = cat.sort,
                }
            end
        end
    end
    return out
end

function Shop.ClientTiers()
    local out = {}
    for i = 1, #Shop.EnabledTiers() do
        local tier = Shop.EnabledTiers()[i]
        out[#out + 1] = {
            id = tier.id,
            label = tier.label,
            builtin = tier.builtin,
            enabled = tier.enabled,
            sort = tier.sort,
        }
    end
    return out
end

function Shop.AdminCategories()
    return Shop.ClientCategories(true, true)
end

function Shop.AdminTiers()
    local out = {}
    for i = 1, #(Shop.tiers or {}) do
        local tier = Shop.tiers[i]
        out[#out + 1] = {
            id = tier.id,
            label = tier.label,
            builtin = tier.builtin,
            enabled = tier.enabled,
            sort = tier.sort,
        }
    end
    return out
end

function Shop.EncodeCategory(cat)
    return json.encode({
        grantType = cat.grantType,
        usesTiers = cat.usesTiers and true or false,
        gated = cat.gated or 'none',
        timed = cat.timed and true or false,
        builtin = cat.builtin and true or false,
    })
end

function Shop.EncodeTier(tier)
    return json.encode({
        builtin = tier.builtin and true or false,
    })
end

Shop.ResetToDefaults()
