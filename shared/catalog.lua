--[[
    Live shop catalog. Built-in listings are empty on purpose — admins add
    vehicles, weapons, extras, bundles, gangs, exclusives, limited drops, and
    custom tabs in-game from the Admin tab (stored in dj_305donator_listings).
]]

function CatalogReset()
    Catalog = {
        pets = {},
    }
    local categories = Shop and Shop.AllCategories and Shop.AllCategories() or {}
    if #categories == 0 then
        Catalog.vehicles = EmptyTierBuckets()
        Catalog.weapons = {}
        Catalog.extras = {}
        Catalog.bundles = {}
        Catalog.exclusives = {}
        Catalog.limited = {}
        Catalog.gangs = {}
        return
    end
    for i = 1, #categories do
        local cat = categories[i]
        if cat.usesTiers then
            Catalog[cat.id] = EmptyTierBuckets()
        else
            Catalog[cat.id] = {}
        end
    end
end

CatalogReset()

function CatalogPut(item)
    if not item or not item.id then
        return
    end
    local category = item.category or 'extras'
    if category == 'pets' then
        Catalog.pets = Catalog.pets or {}
        Catalog.pets[#Catalog.pets + 1] = item
        return
    end
    if Shop and Shop.UsesTiers and Shop.UsesTiers(category) then
        local tier = NormalizeTier(item.tier)
        item.tier = tier
        Catalog[category] = Catalog[category] or EmptyTierBuckets()
        if not Catalog[category][tier] then
            Catalog[category][tier] = {}
        end
        Catalog[category][tier][#Catalog[category][tier] + 1] = item
        return
    end
    if category == 'weapons' then
        item.tier = nil
    end
    Catalog[category] = Catalog[category] or {}
    if type(Catalog[category]) == 'table' and Catalog[category][1] == nil and next(Catalog[category]) then
        -- leftover bucket table; treat as list
        Catalog[category] = {}
    end
    Catalog[category][#Catalog[category] + 1] = item
end

function CatalogAll()
    local out = {}
    local function takeList(list, category, tier)
        if not list then
            return
        end
        for i = 1, #list do
            local copy = {}
            for k, v in pairs(list[i]) do
                copy[k] = v
            end
            copy.category = copy.category or category
            copy.tier = copy.tier or tier
            out[#out + 1] = copy
        end
    end
    local function takeCategory(category)
        local bucket = Catalog[category]
        if not bucket then
            return
        end
        if Shop and Shop.UsesTiers and Shop.UsesTiers(category) then
            local tiers = Shop.EnabledTiers and Shop.EnabledTiers() or {}
            local seen = {}
            for i = 1, #tiers do
                local id = tiers[i].id
                seen[id] = true
                takeList(bucket[id], category, id)
            end
            for tier, list in pairs(bucket) do
                if type(list) == 'table' and not seen[tier] then
                    takeList(list, category, tier)
                end
            end
            return
        end
        takeList(bucket, category)
    end
    local categories = Shop and Shop.AllCategories and Shop.AllCategories() or {}
    if #categories == 0 then
        takeCategory('vehicles')
        takeCategory('weapons')
        takeCategory('extras')
        takeCategory('bundles')
        takeCategory('exclusives')
        takeCategory('limited')
        takeCategory('gangs')
    else
        for i = 1, #categories do
            takeCategory(categories[i].id)
        end
    end
    takeList(Catalog.pets, 'pets')
    return out
end

function GetCatalogItem(itemId)
    if not itemId then
        return nil
    end
    local all = CatalogAll()
    for i = 1, #all do
        if all[i].id == itemId then
            return all[i]
        end
    end
end
