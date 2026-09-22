Images = {}

local function trimSlash(url)
    return (url or ''):gsub('/$', '')
end

local function isAutoFallback(url)
    if type(url) ~= 'string' then
        return false
    end
    return url:find('docs.fivem.net', 1, true) ~= nil
        or url:find('nui://ox_inventory/', 1, true) ~= nil
        or url:find('raw.githubusercontent.com/overextended/ox_inventory', 1, true) ~= nil
end

function Images.IsUrl(value)
    return type(value) == 'string' and value:find('^https?://') ~= nil
end

function Images.IsConfigured()
    local cfg = Config.Images or {}
    local base = cfg.baseUrl or ''
    return base ~= '' and not base:find('YOUR_TEAM', 1, true) and not base:find('PASTE_', 1, true)
end

function Images.OxBase()
    local path = (Config.OxInventory and Config.OxInventory.imagePath) or 'nui://ox_inventory/web/images'
    return trimSlash(path)
end

function Images.OxPath(key)
    if not key then
        return nil
    end
    return ('%s/%s.png'):format(Images.OxBase(), Images.FileName(key))
end

function Images.IsWeapon(itemOrKey)
    if type(itemOrKey) ~= 'table' then
        local name = tostring(itemOrKey or '')
        return name:upper():find('^WEAPON_') ~= nil
    end
    if itemOrKey.category == 'weapons' or itemOrKey.weapon then
        return true
    end
    if itemOrKey.category and Shop and Shop.GrantType and Shop.GrantType(itemOrKey.category) == 'weapon' then
        return true
    end
    local name = itemOrKey.item or itemOrKey.imageKey or ''
    return type(name) == 'string' and name:upper():find('^WEAPON_') ~= nil
end

-- Filename key on Fivemanage: sultan.webp, armour.webp
function Images.Key(itemOrKey)
    if type(itemOrKey) == 'table' then
        if itemOrKey.imageKey and itemOrKey.imageKey ~= '' then
            return itemOrKey.imageKey
        end
        if itemOrKey.model then
            return itemOrKey.model
        end
        if itemOrKey.item then
            return itemOrKey.item
        end
        if itemOrKey.weapon then
            return itemOrKey.weapon
        end
        if itemOrKey.extras and itemOrKey.extras[1] and itemOrKey.extras[1].item then
            return itemOrKey.extras[1].item
        end
        return itemOrKey.id
    end
    return itemOrKey
end

function Images.FileName(key)
    if not key then
        return nil
    end
    return tostring(key):lower()
end

function Images.FromMap(key)
    local urls = Config.Images and Config.Images.urls or {}
    if not key then
        return nil
    end
    local file = Images.FileName(key)
    return urls[key] or urls[tostring(key):lower()] or urls[tostring(key):upper()] or (file and urls[file])
end

function Images.Build(key)
    if not key or not Images.IsConfigured() then
        return nil
    end
    local ext = Config.Images.extension or 'webp'
    return ('%s/%s.%s'):format(trimSlash(Config.Images.baseUrl), Images.FileName(key), ext)
end

local function explicitUrl(item, itemOrKey)
    local explicit = item and item.image
    if Images.IsUrl(explicit) and not isAutoFallback(explicit) then
        return explicit
    end
    if Images.IsUrl(itemOrKey) and not isAutoFallback(itemOrKey) then
        return itemOrKey
    end
end

-- Weapons: ox_inventory/web/images.
-- Everything else: Fivemanage first, then ox_inventory, then vehicle docs.fivem.net.
function Images.Resolve(itemOrKey, fallback)
    local item = type(itemOrKey) == 'table' and itemOrKey or nil
    local key = Images.Key(itemOrKey)
    local custom = explicitUrl(item, itemOrKey)

    if Images.IsWeapon(itemOrKey) then
        if custom then
            return custom
        end
        return Images.OxPath(item and (item.weapon or item.item or key) or key) or fallback
    end

    local mapped = Images.FromMap(key)
    if mapped then
        return mapped
    end
    if item then
        mapped = Images.FromMap(item.id) or Images.FromMap(item.model) or Images.FromMap(item.item) or Images.FromMap(item.weapon)
        if mapped then
            return mapped
        end
    end

    if custom then
        return custom
    end

    local built = Images.Build(key)
    if built then
        return built
    end

    local ox = Images.OxPath(key)
    if ox then
        return ox
    end

    if item and item.model and type(Config.VehicleImage) == 'function' then
        return Config.VehicleImage(item.model)
    end

    if Images.IsUrl(item and item.image) then
        return item.image
    end
    if Images.IsUrl(itemOrKey) then
        return itemOrKey
    end
    return fallback
end

function Images.ForGrant(itemName, catalogItem)
    if catalogItem and Images.IsWeapon(catalogItem) then
        return Images.OxPath(itemName or catalogItem.weapon or catalogItem.item)
    end
    return Images.Resolve(itemName) or (catalogItem and Images.Resolve(catalogItem)) or Images.OxPath(itemName)
end
