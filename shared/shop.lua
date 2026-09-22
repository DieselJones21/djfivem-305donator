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
        { id = 'vehicles', label = 'Vehicles', grantType = 'vehicle', usesTiers = true, tierGroup = 'vehicle', gated = 'none', timed = false, builtin = true, enabled = true, sort = 10 },
        { id = 'weapons', label = 'Weapons', grantType = 'weapon', usesTiers = true, tierGroup = 'weapon', gated = 'none', timed = false, builtin = true, enabled = true, sort = 20 },
        { id = 'extras', label = 'Extra Items', grantType = 'item', usesTiers = false, gated = 'none', timed = false, builtin = true, enabled = true, sort = 30 },
        { id = 'bundles', label = 'Bundles', grantType = 'bundle', usesTiers = false, gated = 'none', timed = false, builtin = true, enabled = true, sort = 40 },
        { id = 'gangs', label = 'Gang Store', grantType = 'mixed', usesTiers = false, gated = 'gang', timed = false, builtin = true, enabled = true, sort = 50 },
        { id = 'exclusives', label = 'City Exclusives', grantType = 'mixed', usesTiers = false, gated = 'none', timed = false, builtin = true, enabled = true, sort = 60 },
        { id = 'limited', label = 'Limited Time', grantType = 'mixed', usesTiers = false, gated = 'none', timed = true, builtin = true, enabled = true, sort = 70 },
    }
end

function Shop.DefaultTiers()
    return {
        { id = 'bronze', label = 'Bronze', builtin = true, enabled = true, sort = 10 },
        { id = 'silver', label = 'Silver', builtin = true, enabled = true, sort = 20 },
        { id = 'gold', label = 'Gold', builtin = true, enabled = true, sort = 30 },
    }
end

function Shop.DefaultWeaponTiers()
    return {
        { id = 'melee', label = 'Melee', builtin = true, enabled = true, sort = 10 },
        { id = 'pistol', label = 'Pistol', builtin = true, enabled = true, sort = 20 },
        { id = 'smg', label = 'SMG', builtin = true, enabled = true, sort = 30 },
        { id = 'rifles', label = 'Rifles', builtin = true, enabled = true, sort = 40 },
    }
end

Shop.TIER_ALIASES = {
    vehicle = {
        emerald = 'bronze',
        sapphire = 'silver',
        blackdiamond = 'gold',
        black_diamond = 'gold',
        ['black diamond'] = 'gold',
        diamond = 'gold',
    },
    weapon = {
        pistols = 'pistol',
        smgs = 'smg',
        rifle = 'rifles',
        melee_weapons = 'melee',
    },
}

function Shop.NormalizeGroup(group)
    if group == 'weapon' or group == 'weapontier' then
        return 'weapon'
    end
    return 'vehicle'
end

function Shop.MetaKind(group)
    return Shop.NormalizeGroup(group) == 'weapon' and 'weapontier' or 'tier'
end

function Shop.InferTierGroup(cat)
    if type(cat) ~= 'table' then
        return 'vehicle'
    end
    if cat.tierGroup == 'weapon' or cat.tierGroup == 'vehicle' then
        return cat.tierGroup
    end
    if cat.grantType == 'weapon' then
        return 'weapon'
    end
    return 'vehicle'
end

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

local function applyTierList(rows, defaults)
    local tiers, tierMap = {}, {}
    for i = 1, #(rows or {}) do
        local tier = Shop.TierFromMeta(rows[i])
        if tier and not tierMap[tier.id] then
            tiers[#tiers + 1] = tier
            tierMap[tier.id] = tier
        end
    end
    if #tiers == 0 then
        for _, row in ipairs(defaults()) do
            local copy = copyRow(row)
            tiers[#tiers + 1] = copy
            tierMap[copy.id] = copy
        end
    end
    return sortByOrder(tiers), tierMap
end

function Shop.ResetToDefaults()
    Shop.categories = {}
    Shop.categoryMap = {}
    Shop.tiers = {}
    Shop.tierMap = {}
    Shop.weaponTiers = {}
    Shop.weaponTierMap = {}
    for _, row in ipairs(Shop.DefaultCategories()) do
        local copy = copyRow(row)
        Shop.categories[#Shop.categories + 1] = copy
        Shop.categoryMap[copy.id] = copy
    end
    Shop.tiers, Shop.tierMap = applyTierList(nil, Shop.DefaultTiers)
    Shop.weaponTiers, Shop.weaponTierMap = applyTierList(nil, Shop.DefaultWeaponTiers)
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
    local usesTiers = data.usesTiers == true
    local tierGroup = tostring(data.tierGroup or '')
    if tierGroup ~= 'weapon' and tierGroup ~= 'vehicle' then
        tierGroup = grantType == 'weapon' and 'weapon' or 'vehicle'
    end
    if id == 'weapons' and data.usesTiers == nil then
        usesTiers = true
        tierGroup = 'weapon'
    end
    return {
        id = id,
        label = trim(row.label) ~= '' and trim(row.label) or id,
        grantType = grantType,
        usesTiers = usesTiers,
        tierGroup = usesTiers and tierGroup or nil,
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

function Shop.Apply(categoryRows, vehicleTierRows, weaponTierRows)
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

    Shop.categories = sortByOrder(categories)
    Shop.categoryMap = categoryMap
    Shop.tiers, Shop.tierMap = applyTierList(vehicleTierRows, Shop.DefaultTiers)
    Shop.weaponTiers, Shop.weaponTierMap = applyTierList(weaponTierRows, Shop.DefaultWeaponTiers)
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

function Shop.TierGroup(id)
    return Shop.InferTierGroup(Shop.GetCategory(id))
end

function Shop.CategoryIdsForGroup(group)
    group = Shop.NormalizeGroup(group)
    local out = {}
    for i = 1, #Shop.AllCategories() do
        local cat = Shop.categories[i]
        if cat.usesTiers and Shop.TierGroup(cat.id) == group then
            out[#out + 1] = cat.id
        end
    end
    return out
end

function Shop.TiersOf(group)
    if Shop.NormalizeGroup(group) == 'weapon' then
        return Shop.weaponTiers or {}
    end
    return Shop.tiers or {}
end

function Shop.TierMapOf(group)
    if Shop.NormalizeGroup(group) == 'weapon' then
        return Shop.weaponTierMap or {}
    end
    return Shop.tierMap or {}
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

function Shop.EnabledTiers(group)
    local out = {}
    local list = Shop.TiersOf(group)
    for i = 1, #list do
        local tier = list[i]
        if tier.enabled then
            out[#out + 1] = tier
        end
    end
    if #out == 0 then
        return Shop.NormalizeGroup(group) == 'weapon' and Shop.DefaultWeaponTiers() or Shop.DefaultTiers()
    end
    return out
end

function Shop.TierIds(group)
    local ids = {}
    local tiers = Shop.EnabledTiers(group)
    for i = 1, #tiers do
        ids[#ids + 1] = tiers[i].id
    end
    return ids
end

function Shop.DefaultTier(group)
    local tiers = Shop.EnabledTiers(group)
    if Shop.NormalizeGroup(group) == 'weapon' then
        return tiers[1] and tiers[1].id or 'pistol'
    end
    return tiers[1] and tiers[1].id or 'bronze'
end

function Shop.IsTier(id, group)
    local map = Shop.TierMapOf(group)
    return id and map[id] ~= nil and map[id].enabled ~= false
end

function Shop.GetTier(id, group)
    if not id then
        return nil
    end
    if group then
        return Shop.TierMapOf(group)[id]
    end
    return (Shop.tierMap and Shop.tierMap[id]) or (Shop.weaponTierMap and Shop.weaponTierMap[id]) or nil
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
                    tierGroup = cat.usesTiers and Shop.InferTierGroup(cat) or nil,
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

function Shop.ClientTiers(group)
    local out = {}
    local tiers = Shop.EnabledTiers(group)
    for i = 1, #tiers do
        local tier = tiers[i]
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

function Shop.AdminTiers(group)
    local out = {}
    local list = Shop.TiersOf(group)
    for i = 1, #list do
        local tier = list[i]
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
        tierGroup = cat.usesTiers and Shop.InferTierGroup(cat) or nil,
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
