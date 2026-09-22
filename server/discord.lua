-- Discord guild role lookup for the Gang store tab.

Discord = {
    cache = {},
}

local function configured()
    local cfg = Config.Discord or {}
    return cfg.enabled == true
        and type(cfg.botToken) == 'string' and cfg.botToken ~= ''
        and type(cfg.guildId) == 'string' and cfg.guildId ~= ''
end

function Discord.Configured()
    return configured()
end

function Discord.GetDiscordId(source)
    if not source or source == 0 then
        return nil
    end
    local count = GetNumPlayerIdentifiers(source)
    for i = 0, count - 1 do
        local id = GetPlayerIdentifier(source, i)
        if type(id) == 'string' and id:sub(1, 8) == 'discord:' then
            return id:sub(9)
        end
    end
end

local function roleList()
    local ids = (Config.Gang and Config.Gang.roleIds) or {}
    local map = {}
    for i = 1, #ids do
        local id = tostring(ids[i] or '')
        if id ~= '' then
            map[id] = true
        end
    end
    return map
end

local function fetchMember(discordId)
    local now = GetGameTimer()
    local ttl = ((Config.Discord and tonumber(Config.Discord.cacheSeconds)) or 180) * 1000
    local cached = Discord.cache[discordId]
    if cached and (now - cached.at) < ttl then
        return cached.roles, cached.ok
    end

    local p = promise.new()
    local settled = false
    local function finish(roles, ok)
        if settled then
            return
        end
        settled = true
        p:resolve({ roles or {}, ok and true or false })
    end
    SetTimeout(2500, function()
        finish({}, false)
    end)
    local url = ('https://discord.com/api/v10/guilds/%s/members/%s'):format(Config.Discord.guildId, discordId)
    PerformHttpRequest(url, function(status, body)
        if status == 200 and type(body) == 'string' and body ~= '' then
            local ok, decoded = pcall(json.decode, body)
            local roles = {}
            if ok and type(decoded) == 'table' and type(decoded.roles) == 'table' then
                roles = decoded.roles
            end
            Discord.cache[discordId] = { at = GetGameTimer(), roles = roles, ok = true }
            finish(roles, true)
            return
        end
        if status == 404 then
            Discord.cache[discordId] = { at = GetGameTimer(), roles = {}, ok = true }
            finish({}, true)
            return
        end
        if status == 401 or status == 403 then
            print('[djfivem-305donator] Discord bot token was rejected. Check Config.Discord.botToken and the SERVER MEMBERS INTENT.')
        elseif status ~= 0 then
            print(('[djfivem-305donator] Discord member lookup failed (%s) for %s'):format(tostring(status), discordId))
        end
        Discord.cache[discordId] = { at = GetGameTimer(), roles = {}, ok = false }
        finish({}, false)
    end, 'GET', '', {
        ['Authorization'] = 'Bot ' .. Config.Discord.botToken,
        ['Content-Type'] = 'application/json',
    })
    local result = Citizen.Await(p)
    return result[1], result[2]
end

function Discord.HasGangRole(source)
    if not configured() then
        return false
    end
    local wanted = roleList()
    if next(wanted) == nil then
        return false
    end
    local discordId = Discord.GetDiscordId(source)
    if not discordId then
        return false
    end
    local roles = fetchMember(discordId)
    for i = 1, #(roles or {}) do
        if wanted[tostring(roles[i])] then
            return true
        end
    end
    return false
end

function Discord.HasGangAccess(source)
    if not source or source == 0 then
        return false
    end
    if Framework and Framework.IsAdmin and Framework.IsAdmin(source) then
        return true
    end
    return Discord.HasGangRole(source)
end

function Discord.TabLabel()
    return (Config.Gang and Config.Gang.tabLabel) or 'Gang Store'
end
