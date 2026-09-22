--[[
    Vehicle shop tiers. Live list comes from Shop (admins can add/remove in-game).
    Old bronze / silver / gold rows are remapped on load.
]]

Tiers = Tiers or {}

function TiersRefresh()
    Tiers.ids = (Shop and Shop.TierIds and Shop.TierIds()) or { 'emerald', 'sapphire', 'blackdiamond' }
    Tiers.labels = {}
    Tiers.aliases = (Shop and Shop.TIER_ALIASES) or {
        bronze = 'emerald',
        silver = 'sapphire',
        gold = 'blackdiamond',
        black_diamond = 'blackdiamond',
        ['black diamond'] = 'blackdiamond',
        diamond = 'blackdiamond',
    }
    if Shop and Shop.tiers then
        for i = 1, #Shop.tiers do
            local row = Shop.tiers[i]
            Tiers.labels[row.id] = row.label
        end
    else
        Tiers.labels = {
            emerald = 'Emerald',
            sapphire = 'Sapphire',
            blackdiamond = 'Black Diamond',
        }
    end
end

function NormalizeTier(tier)
    local fallback = Shop and Shop.DefaultTier and Shop.DefaultTier() or 'emerald'
    if type(tier) ~= 'string' or tier == '' then
        return fallback
    end
    local lower = tier:lower()
    local compact = lower:gsub('[%s_%-]+', '')
    local aliases = Tiers.aliases or {}
    local mapped = aliases[lower] or aliases[compact]
    if mapped and Shop and Shop.IsTier and Shop.IsTier(mapped) then
        return mapped
    end
    if Shop and Shop.IsTier then
        if Shop.IsTier(lower) then
            return lower
        end
        if Shop.IsTier(compact) then
            return compact
        end
    end
    if mapped then
        return mapped
    end
    return fallback
end

function TierLabel(tier)
    local id = NormalizeTier(tier)
    local row = Shop and Shop.GetTier and Shop.GetTier(id)
    if row and row.label and row.label ~= '' then
        return row.label
    end
    if Tiers.labels and Tiers.labels[id] then
        return Tiers.labels[id]
    end
    return id
end

function EmptyTierBuckets()
    local out = {}
    local tiers = Shop and Shop.EnabledTiers and Shop.EnabledTiers() or {
        { id = 'emerald' },
        { id = 'sapphire' },
        { id = 'blackdiamond' },
    }
    for i = 1, #tiers do
        out[tiers[i].id] = {}
    end
    return out
end

TiersRefresh()
