# Rebel Roleplay Donator (`djfivem-305donator`)

FiveM donator store for **Rebel Roleplay**, with a chrome / crimson shop UI, **Rebel Coins**, Tebex game commands, custom shop tabs, custom vehicle tiers, oxmysql persistence, and an optional Discord gang tab.

Open with **F11** or `/donator`.

This is the latest donator feature set (custom tabs, Tebex Payment IDs, gang store, in-game editor) rethemed for Rebel Roleplay. Drop a new logo over `html/images/rebel-logo.jpg` if you send a replacement.

## Features

- **Quick shop editor** — pick a tab, type the spawn or ox name and a Rebel Coin price, then Save. Display name fills in for you.
- **Custom shop tabs** — add, hide, reorder, or remove categories in-game from Admin → Shop tabs
- **Custom vehicle tiers** — add or remove tiers (Ruby, Staff, etc.) in-game. Vehicle tabs show those pills
- **Empty catalog by default** — no built-in items; you add your own
- **Vehicles** — stored in **JG Advanced Garages** after purchase
- **Weapons** — one flat list (no weapon tiers). Images always come from `ox_inventory/web/images`
- **Items & bundles** — granted through **ox_inventory**. Images use **Fivemanage**, then fall back to ox_inventory
- **Confirmed delivery** — weapons and items go into inventory immediately; vehicles go into the garage. Pending grants flush on next join
- **Rebel Coins** — Tebex Payment IDs (`tbx-xxxxxxxx`) redeem in the shop or with `/redeem`. Staff can still grant coins from Admin
- **Gang Store tab** — only players with a configured Discord role can see it (admins always can)
- **City exclusives & limited time** — unique and timed listings
- **Gifting, refunds, inventory, Discord webhooks**

## Install

1. Put the folder in `resources` as **`djfivem-305donator`** (the folder name must match — ox_inventory exports and `nui://` image paths use it).
2. Import [`sql/install.sql`](sql/install.sql) into the same database oxmysql uses. This script uses `dj_305donator_*` tables (it does not share the old `dj-donator` or `dj_envydonator_*` tables). The resource also creates the listings table on start.
3. Add to `server.cfg`:

```cfg
ensure oxmysql
ensure ox_inventory
ensure jg-advancedgarages
ensure djfivem-305donator

add_ace group.admin donator.admin allow
```

`jg-advancedgarages` is optional. If it is not started, vehicles still insert into ESX `owned_vehicles` or QB `player_vehicles`.

4. Open [`config.lua`](config.lua) and set:
   - `Config.Images.baseUrl` to your Fivemanage folder URL (vehicles / extras)
   - `Config.JGGarages.defaultGarage` to a JG garage **name** (example: `legion`)
   - `Config.Discord` if you want the Gang tab
   - `Config.Webhooks` Discord URLs
5. Restart the server.

## Logo

The shop uses `html/images/rebel-logo.jpg`. Replace that file with your new artwork (keep the same filename) and restart the resource. No other edits are required.

## Fivemanage images

Every catalog card and every ox_inventory grant can use a Fivemanage URL.

1. Upload images in the Fivemanage dashboard (vehicles, weapons, extras, bundles, pets).
2. Set the folder URL in `config.lua`:

```lua
Config.Images = {
    provider = 'fivemanage',
    baseUrl = 'https://r2.fivemanage.com/YOUR_TEAM_ID', -- no trailing slash
    extension = 'webp', -- or png
    urls = {
        -- optional per-key overrides
        -- sultan = 'https://r2.fivemanage.com/YOUR_TEAM_ID/sultan.webp',
    },
}
```

3. Name files after the spawn / ox item key:

| Kind | Example file |
|---|---|
| Vehicle | `sultan.webp` |
| Extra | `armour.webp`, `bandage.webp` |
| Custom | `donator_plate.webp`, `penthouse_card.webp` |

Weapons do **not** use Fivemanage. Put `weapon_pistol.png` in `ox_inventory/web/images`.

You can also paste a full URL on any catalog row (`image = 'https://r2.fivemanage.com/...'`) or set `imageKey = 'armour'` when the listing id does not match the filename.

ox_inventory already allows `r2.fivemanage.com` and `i.fmfile.com` in `inventory:validhosts`. Grants set `metadata.imageurl` to the Fivemanage link so the item shows in inventory.

If `baseUrl` is empty, vehicles fall back to `docs.fivem.net` and items fall back to `nui://ox_inventory/web/images`.

## ox_inventory

This resource is linked to ox_inventory for **weight/slot checks**, **AddItem / RemoveItem**, and delivery. Weapon images always come from ox_inventory. Other images use Fivemanage first, then ox_inventory.

Put this above the donator resource:

```cfg
ensure oxmysql
ensure ox_inventory
ensure djfivem-305donator
```

### Inventory actions

- Purchases call `CanCarryItem` before coins are taken
- Grants use `AddItem` (weapons include ammo metadata and `imageurl`)
- If AddItem fails, coins are refunded and any partial items are removed
- Admin refunds call `RemoveItem` for the same grants
- Pets are ox_inventory items (`pet_husky`, etc.). Using the item in inventory spawns or dismisses the pet

### Custom items

Merge [`install/ox_inventory_items.lua`](install/ox_inventory_items.lua) into `ox_inventory/data/items.lua`, then restart ox_inventory. That file registers:

- `donator_plate`, `penthouse_card`, `repairkit`
- Pet items with `client.export = 'djfivem-305donator.usePet'`

Players open the store with **F11** or `/donator`. `/coins` prints the current Rebel Coin balance.

## JG Advanced Garages

When `jg-advancedgarages` is started, a purchased vehicle is **stored** (not spawned):

- QB / Qbox: `player_vehicles` with `in_garage = 1`, `garage_id` / `garage` = configured garage, `state = 1`
- ESX: `owned_vehicles` with `in_garage = 1`, `garage_id` = configured garage, `stored = 1`

The player takes it out from that JG garage. Helicopters (`garageType = 'heli'`, e.g. Buzzard) map to JG `air` and auto-select a public air garage unless you set `Config.JGGarages.defaultGarages.air`.

`Config.JGGarages.defaultGarage` must match a garage **name** from JG (`exports['jg-advancedgarages']:getAllGarages()`), not the map label. Default example is `legion`.

Leave `jg-advancedgarages` as a soft dependency. Do not rename that resource.

## Admin

Admins are anyone with ACE `donator.admin`, ESX groups `admin` / `superadmin`, or QB / Qbox `god` / `admin`.

| Command | What it does |
|---|---|
| `/givecoins [id] [amount] [reason]` | Add Rebel Coins |
| `/removecoins [id] [amount] [reason]` | Remove Rebel Coins |
| `/setcoins [id] [amount]` | Set an exact balance |
| `/checkcoins [id]` | Inspect a player (or yourself) |
| `/givecoinsid [identifier] [amount] [reason]` | Grant Rebel Coins to an offline identifier |
| `/givegems [id or identifier] [amount]` | Console / Tebex instant Rebel Coin grant |
| `/givepackage [id or identifier] [itemId]` | Console / Tebex catalog grant (no coin charge) |
| `/tbxgems [tbx-id] [gems] [itemId]` | Register a Tebex Payment ID for in-shop redeem |
| `/tbxpackage [tbx-id] [itemId]` | Register a Tebex Payment ID that grants a listing |
| `/redeem [tbx-id]` | Player command to redeem a Payment ID |
| `/tebexcmds` | Print the Tebex command list to the server console |
| `/gemgrant` / `/gempackage` | Aliases of givegems / givepackage |
| `/coins` | Show your own Rebel Coins |

The **Admin** tab is where you add shop tabs, vehicle tiers, listings, grant Rebel Coins, create codes, inspect history, and refund purchases.

### Shop tabs and vehicle tiers

1. Open **F11** as an admin → **Admin**.
2. **Shop tabs** — type a name (Imports), pick what it sells (Vehicles / Weapons / Items / Bundles / mixed), optionally tick **Use vehicle tiers** or **Gang role only**, then **Add tab**.
3. Hide a built-in tab with **Hide**. Remove a custom tab with **Remove** (listings in that tab must be deleted or moved first).
4. **Vehicle tiers** — type a name (Ruby) and **Add tier**. Those pills show on every tab that uses vehicle tiers. Removing a tier moves its vehicles to another tier.

### Add a listing (quick)

1. Open the store with **F11** as an admin → **Admin**.
2. Pick the type:
   - **Vehicle** — spawn name `sultan` + Rebel Coin price. Optional vehicle tier.
   - **Weapon** — ox name `WEAPON_PISTOL` + Rebel Coin price. Image comes from `ox_inventory/web/images/weapon_pistol.png`.
   - **Item** — ox name `armour` + count + Rebel Coin price.
   - **Bundle** — two or more ox names.
   - **Gang store** — same as a weapon/item/vehicle, but only Discord gang roles see that tab.
3. Display name is optional. Leave it blank and the script uses the ox label or a cleaned spawn name.
4. Click **Save listing**. Use **More options** only if you need stock, unique, garage, or a custom image URL.
5. Edit / Delete rows in the listings table anytime.

Weapons and extras grant the ox_inventory item immediately. Vehicles go into JG Advanced Garages. If the player is offline, the grant is marked pending and delivered when they next join.

Tabs: Dashboard → your shop tabs (Vehicles, Weapons, Extra Items, Bundles, Gang Store, City Exclusives, Limited Time, plus any you add) → Inventory → Admin.

The default shop is empty on purpose so you only sell what you add.

## Catalog

Listings live in the database, not in Lua. [`shared/catalog.lua`](shared/catalog.lua) starts empty and is filled from `dj_305donator_listings` when the resource starts.

## Discord webhooks

Set any of these in `config.lua`. Leave a field blank to skip that channel.

- `purchases` — buys and gifts
- `coins` — give / remove / set
- `admin` — codes, refunds, redeems
- `errors` — SQL / callback failures

## Exports

```lua
exports['djfivem-305donator']:GetCoins(source)
exports['djfivem-305donator']:AddCoins(source, amount, 'Tebex VIP')
exports['djfivem-305donator']:AddCoinsIdentifier('license:abc123', 500, 'Tebex VIP')
exports['djfivem-305donator']:GrantItemIdentifier('license:abc123', 'veh_sultan')
```

Amounts are server-validated (positive integers, capped by `Config.Tebex.MaxGrant`).

## Tebex — link the shop to your store

Put **Game Server Commands** on each Tebex package. The Admin tab also lists these with a Copy button. Console command `/tebexcmds` prints the same list.

Set `Config.Tebex.StoreUrl` if you want the store URL shown in Admin.

### Commands to paste in Tebex

| What the package should do | Game Server Command |
|---|---|
| 500 Rebel Coins, player redeems the Payment ID in-game | `tbxgems {transaction} 500` |
| 2500 Rebel Coins, same redeem flow | `tbxgems {transaction} 2500` |
| Rebel Coins + a listing they redeem later | `tbxgems {transaction} 500 veh_sultan` |
| Only a listing they redeem later | `tbxpackage {transaction} veh_sultan` |
| Instant Rebel Coins if the Tebex FiveM plugin has them linked | `givegems {id} 500` |
| Instant listing if linked | `givepackage {id} veh_sultan` |

`{transaction}` is the Tebex Payment ID (`tbx-xxxxxxxx`). `{id}` is the player’s FiveM server ID when they are linked through the official Tebex plugin.

`tbxgems` / `tbxpackage` store a one-time code. If Tebex retries the command, a duplicate ID is ignored. Click **Tebex** on a listing row in Admin to copy `givepackage {id} <that listing>`.

### Player flow (Payment ID)

1. Player checks out on your Tebex store.
2. Tebex emails / shows Payment ID `tbx-xxxxxxxx`.
3. In-game they press **F11** → **REDEEM**, or type `/redeem tbx-xxxxxxxx`.
4. Rebel Coins (and any attached listing) are added. The same ID cannot be used twice.

### Instant grant (Tebex FiveM plugin linked)

If the player is linked and online, skip redeem:

```
givegems {id} 2500
givepackage {id} veh_sultan
```

`gemgrant` and `gempackage` still work as aliases. Offline coin grants still apply to the identifier. Offline inventory items wait until they next join.

## Discord gang tab

The **Gang Store** tab is hidden unless the player has one of the Discord role IDs in `Config.Gang.roleIds`. Admins always see it so they can add listings.

1. [Discord Developer Portal](https://discord.com/developers/applications) → New Application → **Bot**.
2. Enable **SERVER MEMBERS INTENT** on the Bot page (Privileged Gateway Intents).
3. Reset / copy the bot token into `Config.Discord.botToken`.
4. Invite the bot to your Discord. Example URL (replace the client id):

```
https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&scope=bot&permissions=2048
```

5. Enable Developer Mode in Discord (User Settings → Advanced).
6. Right-click the server → **Copy Server ID** → `Config.Discord.guildId`.
7. Right-click the gang role → **Copy Role ID** → paste into `Config.Gang.roleIds`.
8. Set `Config.Discord.enabled = true` and restart the resource.

Players must have Discord linked in FiveM (they do if they join through Discord). If the tab does not appear:

- Confirm the bot is in the server and the intent is on
- Confirm the player has the role
- Confirm `discord:` shows in their identifiers (`txAdmin` player view)
- Admins can still open the tab to add Gang listings

## Images

| Listing | Image source |
|---|---|
| Weapons | `nui://ox_inventory/web/images/{weapon}.png` (then `.webp` if the png is missing) |
| Vehicles, extras, bundles, gang, exclusives | Fivemanage `baseUrl` / pasted URL, then ox_inventory images |
| Vehicles with no Fivemanage file | `docs.fivem.net/vehicles/{model}.webp` as last resort |

## Color themes

Set the default look in `config.lua`:

```lua
Config.Theme = 'rebel' -- rebel | miami | envy | crimson | ocean | gold | emerald | violet
```

| Theme | Accent |
|---|---|
| `rebel` | Rebel Roleplay — chrome / crimson / black (default) |
| `miami` | Hot pink / cyan / palms |
| `envy` | Neon cyan / chrome / black |
| `crimson` | Racing red |
| `ocean` | Cyan / blue |
| `gold` | Gold / black |
| `emerald` | Green |
| `violet` | Pink / purple |

Players cannot change this in the shop. Restart the resource after editing `Config.Theme`.

## UI preview

The NUI also runs in a browser for theme checks. From `html/`:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`. Preview mode uses sample data and does not talk to FiveM. Set `FM_BASE` in `html/app.js` `mockCatalog()` if you want the preview to load your Fivemanage folder.

## Notes

- Unique city exclusives and pets are one per character.
- Limited listings vanish when the timestamp passes, even if they are still in the Lua file.
- Pending inventory grants (offline gifts) are applied the next time that player loads.
- Offline vehicle gifts still insert into JG / framework garages.
- If JG is not running and your garage columns differ from default ESX `owned_vehicles` or QB `player_vehicles`, adjust `Framework.GiveVehicle` in [`server/framework.lua`](server/framework.lua).
