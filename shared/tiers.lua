--[[
    Vehicle tiers (bronze / silver / gold) and weapon classes
    (melee / pistol / smg / rifles). Live lists come from Shop.
]]

Tiers = Tiers or {}

function TiersRefresh()
    Tiers.ids = (Shop and Shop.TierIds and Shop.TierIds('vehicle')) or { 'bronze', 'silver', 'gold' }
    Tiers.weaponIds = (Shop and Shop.TierIds and Shop.TierIds('weapon')) or { 'melee', 'pistol', 'smg', 'rifles' }
    Tiers.labels = {}
    Tiers.aliases = (Shop and Shop.TIER_ALIASES) or {
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
        },
    }
    local function addLabels(list)
        for i = 1, #(list or {}) do
            local row = list[i]
            Tiers.labels[row.id] = row.label
        end
    end
    if Shop then
        addLabels(Shop.tiers)
        addLabels(Shop.weaponTiers)
    else
        Tiers.labels = {
            bronze = 'Bronze',
            silver = 'Silver',
            gold = 'Gold',
            melee = 'Melee',
            pistol = 'Pistol',
            smg = 'SMG',
            rifles = 'Rifles',
        }
    end
end

function NormalizeTier(tier, group)
    group = Shop and Shop.NormalizeGroup and Shop.NormalizeGroup(group) or (group == 'weapon' and 'weapon' or 'vehicle')
    local fallback = Shop and Shop.DefaultTier and Shop.DefaultTier(group) or (group == 'weapon' and 'pistol' or 'bronze')
    if type(tier) ~= 'string' or tier == '' then
        return fallback
    end
    local lower = tier:lower()
    local compact = lower:gsub('[%s_%-]+', '')
    local aliases = (Tiers.aliases and Tiers.aliases[group]) or {}
    local mapped = aliases[lower] or aliases[compact]
    if mapped and Shop and Shop.IsTier and Shop.IsTier(mapped, group) then
        return mapped
    end
    if Shop and Shop.IsTier then
        if Shop.IsTier(lower, group) then
            return lower
        end
        if Shop.IsTier(compact, group) then
            return compact
        end
    end
    if mapped then
        return mapped
    end
    return fallback
end

function TierLabel(tier, group)
    local id = NormalizeTier(tier, group)
    local row = Shop and Shop.GetTier and Shop.GetTier(id, group)
    if row and row.label and row.label ~= '' then
        return row.label
    end
    if Tiers.labels and Tiers.labels[id] then
        return Tiers.labels[id]
    end
    return id
end

function EmptyTierBuckets(group)
    local out = {}
    local tiers = Shop and Shop.EnabledTiers and Shop.EnabledTiers(group) or (
        group == 'weapon'
            and { { id = 'melee' }, { id = 'pistol' }, { id = 'smg' }, { id = 'rifles' } }
            or { { id = 'bronze' }, { id = 'silver' }, { id = 'gold' } }
    )
    for i = 1, #tiers do
        out[tiers[i].id] = {}
    end
    return out
end

TiersRefresh()
