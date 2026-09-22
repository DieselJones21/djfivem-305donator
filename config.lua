Config = {}

-- Menu
Config.Command = 'donator'
Config.Keybind = 'F11'
Config.KeybindDescription = 'Open Rebel Roleplay Donator Store'
Config.CloseKey = 'Escape'

-- Currency
Config.CurrencyName = 'Rebel Coins'
Config.CurrencyShort = 'RC'

-- Permissions (ACE + framework groups)
Config.AdminAce = 'donator.admin'
Config.AdminGroups = {
    esx = { 'admin', 'superadmin' },
    qb = { 'god', 'admin' },
}

-- Framework: 'auto' | 'esx' | 'qb' | 'qbx' | 'standalone'
Config.Framework = 'auto'

-- Inventory: 'ox' | 'auto' | 'qb' | 'esx' | 'standalone'
-- This store is built around ox_inventory images, weight, and AddItem/RemoveItem.
Config.Inventory = 'ox'

Config.OxInventory = {
    resource = 'ox_inventory',
    -- Weapon cards always use this folder. Other listings fall back here if Fivemanage is empty.
    imagePath = 'nui://ox_inventory/web/images',
    requireCanCarry = true,
    refundIfAddFails = true,
}

--[[
    Images

    Weapons: always ox_inventory/web/images (weapon_pistol.png).
    Everything else: Fivemanage first, then ox_inventory/web/images.

    1. Upload vehicle / extra / bundle images in Fivemanage.
    2. Paste the folder URL below (everything before the filename).
    3. Name files after the spawn / item key: sultan.webp, armour.webp
    4. ox_inventory already allows r2.fivemanage.com and i.fmfile.com in inventory:validhosts.

    You can also paste a full URL on any listing as the image link.
]]
Config.Images = {
    provider = 'fivemanage',
    baseUrl = '', -- e.g. https://r2.fivemanage.com/YOUR_TEAM_ID
    extension = 'webp',
    urls = {
        -- sultan = 'https://r2.fivemanage.com/YOUR_TEAM_ID/sultan.webp',
        -- armour = 'https://r2.fivemanage.com/YOUR_TEAM_ID/armour.webp',
    },
}

-- JG Advanced Garages: purchased vehicles are stored in this garage (in_garage = 1)
Config.JGGarages = {
    resource = 'jg-advancedgarages',
    -- Must match a garage `name` from jg-advancedgarages (getAllGarages). Example: legion
    defaultGarage = 'legion',
    -- Leave air/sea blank to auto-pick the first public garage of that type.
    defaultGarages = {
        car = 'legion',
        air = '',
        sea = '',
    },
    types = {
        car = 'car',
        heli = 'air',
        boat = 'sea',
        sea = 'sea',
        air = 'air',
    },
    fuel = 100,
    engine = 1000,
    body = 1000,
}

-- Fallback garage insert when jg-advancedgarages is not started
Config.Garage = {
    esx = {
        table = 'owned_vehicles',
        stored = 1,
        type = 'car',
    },
    qb = {
        table = 'player_vehicles',
        garage = 'pillboxgarage',
        state = 1,
    },
}

-- Default spawn used for standalone vehicle grants
Config.StandaloneVehicleSpawn = vector4(-44.18, -1097.73, 26.42, 70.0)

-- Pets (tab is hidden; leftover owned pets still work)
Config.Pet = {
    followDistance = 2.4,
    warpDistance = 40.0,
    speed = 8.0,
}

-- Shop rules
Config.PurchaseCooldownMs = 1200
Config.MaxGiftDistance = 12.0
Config.AllowOfflineGifts = true
-- Menu gifts to anyone on the server. Set false to require Config.MaxGiftDistance.
Config.AllowRemoteGifts = true
Config.AllowSelfGift = false
Config.UniqueItemsOnce = true

--[[
    Tebex — paste these into the package "Game Server Commands" box.

    Players buy Rebel Coins, then redeem the Payment ID in F11 → Redeem (or /redeem):
        tbxgems {transaction} 500

    Instant grant when the Tebex FiveM plugin has the player linked ({id} = server id):
        givegems {id} 500
        givepackage {id} veh_sultan

    Package that the player redeems later (no Rebel Coins, just the listing):
        tbxpackage {transaction} veh_sultan

    gemgrant / gempackage still work as aliases.
]]
Config.Tebex = {
    MaxGrant = 250000,
    GrantCommand = 'gemgrant',
    PackageCommand = 'gempackage',
    RedeemCommand = 'tbxgems',
    GiveGemsCommand = 'givegems',
    GivePackageCommand = 'givepackage',
    PackageRedeemCommand = 'tbxpackage',
    PlayerRedeemCommand = 'redeem',
    StoreUrl = '', -- e.g. https://yourstore.tebex.io
}

--[[
    Discord gang tab

    1. Discord Developer Portal → New Application → Bot.
    2. Enable SERVER MEMBERS INTENT on the Bot page.
    3. Reset / copy the bot token into botToken below.
    4. Invite the bot to your Discord with the `bot` scope and
       "View Server Members" / "Read Messages" permissions.
       Invite URL example:
       https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&scope=bot&permissions=2048
    5. Right-click your Discord server → Copy Server ID (guildId).
    6. Right-click the gang role → Copy Role ID, paste into roleIds.
    7. Players must have Discord linked in FiveM (they do if they join with Discord).

    The Gang tab only appears for members who have one of those roles (admins always see it).
]]
Config.Discord = {
    enabled = false,
    botToken = '', -- Bot token from the Discord developer portal. Never share this.
    guildId = '', -- Discord server / guild snowflake
    cacheSeconds = 180,
}

Config.Gang = {
    tabLabel = 'Gang Store',
    roleIds = {
        -- '123456789012345678',
    },
}

-- Discord logging (paste webhook URLs — leave blank to disable that channel)
Config.Webhooks = {
    purchases = '',
    coins = '',
    admin = '',
    errors = '',
}

Config.WebhookColor = {
    purchase = 13111342, -- crimson #C8102E
    coins = 15263989,    -- chrome #E8EEF5
    admin = 15680580,    -- red #EF2444
    error = 0,           -- black
}

Config.ServerName = 'Rebel Roleplay'

-- Shop color theme (config only — no in-UI picker): miami | envy | rebel | crimson | ocean | gold | emerald | violet
Config.Theme = 'rebel'

-- Notifications: 'auto' | 'ox' | 'esx' | 'qb' | 'native'
Config.Notify = 'auto'

-- Last-resort vehicle image when Fivemanage and ox_inventory both miss
Config.VehicleImage = function(model)
    return ('https://docs.fivem.net/vehicles/%s.webp'):format(model)
end
