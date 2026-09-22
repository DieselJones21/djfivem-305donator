const IS_NUI = typeof GetParentResourceName === 'function';
const RESOURCE = IS_NUI ? GetParentResourceName() : 'djfivem-305donator';

const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 13h6V4H4v9zm10 7h6V4h-6v16zM4 20h6v-5H4v5z"/></svg>',
    vehicles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13l2-5h14l2 5M5 16h14M7 16v3M17 16v3M4 13h16"/></svg>',
    weapons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h10l8-3M7 12v6M11 12v4"/></svg>',
    extras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12h8M12 8v8"/></svg>',
    bundles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>',
    pets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="8" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="8" r="2"/><path d="M6 14c1.5-2 10.5-2 12 0M8 18c2 2 6 2 8 0"/></svg>',
    gangs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7l7-4z"/><path d="M9 12h6"/></svg>',
    exclusives: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z"/></svg>',
    limited: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>',
    inventory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16v12H4zM8 7V5h8v2"/></svg>',
    admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7l7-4z"/></svg>',
};

const GEM = '<svg class="gem" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 7-8 13L4 9l8-7zm0 3.2L7.2 9h9.6L12 5.2z"/></svg>';

const THEMES = ['miami', 'envy', 'rebel', 'crimson', 'ocean', 'gold', 'emerald', 'violet'];
const DEFAULT_CATEGORIES = [
    { id: 'vehicles', label: 'Vehicles', grantType: 'vehicle', usesTiers: true, tierGroup: 'vehicle', gated: 'none', timed: false, builtin: true, enabled: true, sort: 10 },
    { id: 'weapons', label: 'Weapons', grantType: 'weapon', usesTiers: true, tierGroup: 'weapon', gated: 'none', timed: false, builtin: true, enabled: true, sort: 20 },
    { id: 'extras', label: 'Extra Items', grantType: 'item', usesTiers: false, gated: 'none', timed: false, builtin: true, enabled: true, sort: 30 },
    { id: 'bundles', label: 'Bundles', grantType: 'bundle', usesTiers: false, gated: 'none', timed: false, builtin: true, enabled: true, sort: 40 },
    { id: 'gangs', label: 'Gang Store', grantType: 'mixed', usesTiers: false, gated: 'gang', timed: false, builtin: true, enabled: true, sort: 50 },
    { id: 'exclusives', label: 'City Exclusives', grantType: 'mixed', usesTiers: false, gated: 'none', timed: false, builtin: true, enabled: true, sort: 60 },
    { id: 'limited', label: 'Limited Time', grantType: 'mixed', usesTiers: false, gated: 'none', timed: true, builtin: true, enabled: true, sort: 70 },
];
const DEFAULT_TIERS = [
    { id: 'bronze', label: 'Bronze', builtin: true, enabled: true, sort: 10 },
    { id: 'silver', label: 'Silver', builtin: true, enabled: true, sort: 20 },
    { id: 'gold', label: 'Gold', builtin: true, enabled: true, sort: 30 },
];
const DEFAULT_WEAPON_TIERS = [
    { id: 'melee', label: 'Melee', builtin: true, enabled: true, sort: 10 },
    { id: 'pistol', label: 'Pistol', builtin: true, enabled: true, sort: 20 },
    { id: 'smg', label: 'SMG', builtin: true, enabled: true, sort: 30 },
    { id: 'rifles', label: 'Rifles', builtin: true, enabled: true, sort: 40 },
];
const TIER_ALIASES = {
    vehicle: { emerald: 'bronze', sapphire: 'silver', blackdiamond: 'gold', black_diamond: 'gold', diamond: 'gold' },
    weapon: { pistols: 'pistol', smgs: 'smg', rifle: 'rifles', melee_weapons: 'melee' },
};

function liveCategories() {
    const src = (state.categories && state.categories.length) ? state.categories : DEFAULT_CATEGORIES;
    return src.filter((c) => c.id !== 'pets' && c.enabled !== false);
}

function adminCategories() {
    const src = (state.admin && state.admin.categories && state.admin.categories.length)
        ? state.admin.categories
        : DEFAULT_CATEGORIES;
    return src.filter((c) => c.id !== 'pets');
}

function liveTiers(group) {
    const kind = group === 'weapon' ? 'weapon' : 'vehicle';
    const fallback = kind === 'weapon' ? DEFAULT_WEAPON_TIERS : DEFAULT_TIERS;
    const src = kind === 'weapon'
        ? ((state.weaponTiers && state.weaponTiers.length) ? state.weaponTiers : fallback)
        : ((state.tiers && state.tiers.length) ? state.tiers : fallback);
    const enabled = src.filter((t) => t.enabled !== false);
    return enabled.length ? enabled : fallback;
}

function adminTiers(group) {
    const kind = group === 'weapon' ? 'weapon' : 'vehicle';
    if (kind === 'weapon') {
        return (state.admin && state.admin.weaponTiers && state.admin.weaponTiers.length)
            ? state.admin.weaponTiers
            : liveTiers('weapon');
    }
    return (state.admin && state.admin.tiers && state.admin.tiers.length) ? state.admin.tiers : liveTiers('vehicle');
}

function shopCategory(id) {
    return adminCategories().find((c) => c.id === id)
        || liveCategories().find((c) => c.id === id)
        || { id, label: id, grantType: 'item', usesTiers: false };
}

function categoryTierGroup(cat) {
    const row = typeof cat === 'string' ? shopCategory(cat) : (cat || {});
    if (row.tierGroup === 'weapon' || row.tierGroup === 'vehicle') return row.tierGroup;
    if (row.grantType === 'weapon') return 'weapon';
    return 'vehicle';
}

function shopTabs() {
    const tabs = [{ id: 'dashboard', label: 'Main Page' }];
    liveCategories().forEach((cat) => {
        tabs.push({
            id: cat.id,
            label: cat.label,
            gang: cat.gated === 'gang',
            usesTiers: Boolean(cat.usesTiers),
            grantType: cat.grantType,
        });
    });
    tabs.push({ id: 'inventory', label: 'Inventory' });
    tabs.push({ id: 'admin', label: 'Admin', admin: true });
    return tabs;
}

function normalizeTier(tier, group) {
    const kind = group === 'weapon' ? 'weapon' : 'vehicle';
    const ids = liveTiers(kind).map((row) => row.id);
    const fallback = ids[0] || (kind === 'weapon' ? 'pistol' : 'bronze');
    if (!tier) return fallback;
    const raw = String(tier).toLowerCase();
    const compact = raw.replace(/[\s_-]+/g, '');
    const aliases = TIER_ALIASES[kind] || {};
    const mapped = aliases[raw] || aliases[compact];
    if (mapped && ids.includes(mapped)) return mapped;
    if (ids.includes(raw)) return raw;
    if (ids.includes(compact)) return compact;
    return fallback;
}

function tierLabel(tier, group) {
    const kind = group === 'weapon' ? 'weapon' : categoryTierGroup({ tierGroup: group });
    const id = normalizeTier(tier, kind);
    const row = liveTiers(kind).find((t) => t.id === id) || adminTiers(kind).find((t) => t.id === id);
    return row?.label || id;
}

function normalizeTheme(name) {
    return THEMES.includes(name) ? name : 'rebel';
}

const state = {
    tab: 'dashboard',
    vehicleTier: 'all',
    weaponTier: 'all',
    chartMode: 'spend',
    search: '',
    player: null,
    catalog: null,
    admin: { players: [], logs: [], codes: [], listings: [] },
    lookup: null,
    players: [],
    currency: { name: 'Rebel Coins', short: 'RC' },
    serverName: 'Rebel Roleplay',
    keybind: 'F11',
    locale: {},
    theme: 'rebel',
    isGangMember: false,
    gangTabLabel: 'Gang Store',
    categories: DEFAULT_CATEGORIES,
    tiers: DEFAULT_TIERS,
    weaponTiers: DEFAULT_WEAPON_TIERS,
    tebex: null,
    shopTier: 'all',
};

function emptyCatalog() {
    const catalog = { pets: [] };
    (state.categories || DEFAULT_CATEGORIES).concat(adminCategories()).forEach((cat) => {
        if (!cat?.id || catalog[cat.id]) return;
        catalog[cat.id] = cat.usesTiers
            ? Object.fromEntries(liveTiers(categoryTierGroup(cat)).map((tier) => [tier.id, []]))
            : [];
    });
    DEFAULT_CATEGORIES.forEach((cat) => {
        if (!catalog[cat.id]) {
            catalog[cat.id] = cat.usesTiers
                ? Object.fromEntries(liveTiers(categoryTierGroup(cat)).map((tier) => [tier.id, []]))
                : [];
        }
    });
    return catalog;
}

function putListing(catalog, item) {
    const copy = { ...item };
    const cat = shopCategory(item.category);
    if (cat.usesTiers) {
        const tier = normalizeTier(item.tier, categoryTierGroup(cat));
        catalog[cat.id] = catalog[cat.id] || {};
        catalog[cat.id][tier] = catalog[cat.id][tier] || [];
        catalog[cat.id][tier].push({ ...copy, tier });
        return;
    }
    if (!Array.isArray(catalog[item.category])) catalog[item.category] = [];
    catalog[item.category].push(copy);
}

function catalogFromListings(listings) {
    const catalog = emptyCatalog();
    (listings || []).forEach((item) => putListing(catalog, item));
    return catalog;
}

function decoratePreviewItem(item) {
    const copy = { ...item };
    if (copy.extras) {
        copy.ox = {
            registered: true,
            grants: copy.extras.map((g) => ({ name: g.item, label: g.item, count: g.count, registered: true })),
        };
    }
    return copy;
}

function previewCatalog() {
    const catalog = emptyCatalog();
    [
        decoratePreviewItem({
            id: 'veh_sultan', category: 'vehicles', tier: 'gold', label: 'Karin Sultan',
            description: 'Gold donor car delivered to your garage.', price: 8750, remaining: 8,
        }),
        decoratePreviewItem({
            id: 'wep_pistol', category: 'weapons', tier: 'pistol', label: 'Combat Pistol',
            description: 'Sidearm grant with ammo.', price: 2450, remaining: 18, item: 'WEAPON_PISTOL', weapon: 'WEAPON_PISTOL',
            image: 'nui://ox_inventory/web/images/weapon_pistol.png',
        }),
        decoratePreviewItem({
            id: 'wep_knife', category: 'weapons', tier: 'melee', label: 'Knife',
            description: 'Melee grant.', price: 650, remaining: 12, item: 'WEAPON_KNIFE', weapon: 'WEAPON_KNIFE',
        }),
        decoratePreviewItem({
            id: 'wep_smg', category: 'weapons', tier: 'smg', label: 'Micro SMG',
            description: 'SMG grant with ammo.', price: 3200, remaining: 9, item: 'WEAPON_MICROSMG', weapon: 'WEAPON_MICROSMG',
        }),
        decoratePreviewItem({
            id: 'wep_rifle', category: 'weapons', tier: 'rifles', label: 'Carbine Rifle',
            description: 'Rifle grant with ammo.', price: 5400, remaining: 6, item: 'WEAPON_CARBINERIFLE', weapon: 'WEAPON_CARBINERIFLE',
        }),
        decoratePreviewItem({
            id: 'ext_armour', category: 'extras', label: 'Armour Pack',
            description: 'Five armour plates for the next fight.', price: 400, extras: [{ item: 'armour', count: 5 }],
        }),
        decoratePreviewItem({
            id: 'bdl_starter', category: 'bundles', label: 'Starter Kit',
            description: 'Armour, bandages, and lockpicks in one package.', price: 250, remaining: 6,
            extras: [{ item: 'armour', count: 5 }, { item: 'bandage', count: 10 }, { item: 'lockpick', count: 2 }],
        }),
        decoratePreviewItem({
            id: 'gang_switch', category: 'gangs', label: 'Gang Switchblade',
            description: 'Gang-only sidearm. Visible only to Discord gang roles.', price: 1200, item: 'WEAPON_SWITCHBLADE', weapon: 'WEAPON_SWITCHBLADE',
        }),
        decoratePreviewItem({
            id: 'imp_rebla', category: 'imports', tier: 'ruby', label: 'Ubermacht Rebla',
            description: 'Import-only donor car in the Ruby vehicle tier.', price: 6200, remaining: 4, model: 'rebla',
        }),
    ].forEach((item) => putListing(catalog, item));
    return catalog;
}

function mockNormalizeListing(data) {
    const category = data.category || 'extras';
    const itemName = String(data.itemName || data.item || '').trim();
    const model = String(data.model || '').trim();
    const pretty = (value) => String(value || '').replace(/^WEAPON_/i, '').replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).trim();
    const label = String(data.label || '').trim() || pretty(model || itemName);
    const price = Number(data.price);
    if (!label) return { ok: false, message: 'Enter a display name, spawn name, or ox item name.' };
    if (!Number.isFinite(price) || price < 0) return { ok: false, message: 'Enter a valid price.' };
    const petModel = String(data.petModel || '').trim();
    const bundleItems = (Array.isArray(data.bundleItems) ? data.bundleItems : [])
        .map((row) => ({ item: String(row.item || '').trim(), count: Math.max(1, Number(row.count) || 1) }))
        .filter((row) => row.item);
    if (category === 'bundles' && bundleItems.length < 2) return { ok: false, message: 'Add at least two ox_inventory items to the bundle.' };
    const cat = shopCategory(category);
    if (cat.grantType === 'vehicle' && !model) return { ok: false, message: 'Vehicle listings need a spawn name.' };
    if ((cat.grantType === 'weapon' || cat.grantType === 'item') && !itemName && !model) return { ok: false, message: 'Enter the ox_inventory item name.' };
    const id = data.editingId || data.id || `${category.slice(0, 3)}_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    const extras = category === 'bundles'
        ? bundleItems
        : (itemName && category !== 'weapons' && category !== 'pets' && !model ? [{ item: itemName, count: Number(data.count || 1) }] : undefined);
    const item = {
        id,
        category,
        tier: shopCategory(category).usesTiers ? normalizeTier(data.tier, categoryTierGroup(shopCategory(category))) : undefined,
        label,
        description: data.description || '',
        price,
        image: data.image || '',
        imageKey: data.imageKey || (category === 'bundles' ? (bundleItems[0]?.item || id) : (itemName || model || id)),
        item: category === 'bundles' ? undefined : (itemName || undefined),
        weapon: category === 'weapons' ? itemName : undefined,
        model: model || undefined,
        petModel: petModel || undefined,
        ammo: data.ammo ? Number(data.ammo) : undefined,
        unique: Boolean(data.unique),
        stock: data.stock === '' || data.stock == null ? undefined : Number(data.stock),
        limitedFrom: data.limitedFrom || undefined,
        limitedUntil: data.limitedUntil || undefined,
        garageId: data.garageId || undefined,
        garageType: data.garageType || undefined,
        count: Number(data.count || 1),
        extras,
    };
    if (item.extras) {
        item.ox = { registered: true, grants: item.extras.map((g) => ({ name: g.item, label: g.item, count: g.count, image: item.image, registered: true })) };
    } else if (item.item) {
        item.ox = { registered: true, grants: [{ name: item.item, label: item.label, count: 1, image: item.image, registered: true }] };
    }
    return { ok: true, item };
}

function mockShopLayout() {
    return {
        categories: [
            ...DEFAULT_CATEGORIES,
            { id: 'imports', label: 'Imports', grantType: 'vehicle', usesTiers: true, tierGroup: 'vehicle', gated: 'none', timed: false, builtin: false, enabled: true, sort: 25 },
        ],
        tiers: [
            ...DEFAULT_TIERS,
            { id: 'ruby', label: 'Ruby', builtin: false, enabled: true, sort: 40 },
        ],
        weaponTiers: DEFAULT_WEAPON_TIERS,
        tebex: {
            storeUrl: 'https://store.rebelroleplay.com',
            playerRedeem: 'redeem',
            commands: [
                { id: 'gems_redeem', title: 'Rebel Coins pack (player pastes tbx- ID)', command: 'tbxgems {transaction} 500' },
                { id: 'gems_instant', title: 'Instant Rebel Coins (Tebex plugin linked)', command: 'givegems {id} 500' },
                { id: 'package_instant', title: 'Instant listing (Tebex plugin linked)', command: 'givepackage {id} LISTING_ID' },
                { id: 'package_redeem', title: 'Listing the player redeems later', command: 'tbxpackage {transaction} LISTING_ID' },
            ],
        },
    };
}

function mockOpen() {
    const layout = mockShopLayout();
    state.categories = layout.categories;
    state.tiers = layout.tiers;
    state.weaponTiers = layout.weaponTiers;
    state.tebex = layout.tebex;
    state.admin = { ...(state.admin || {}), categories: layout.categories, tiers: layout.tiers, weaponTiers: layout.weaponTiers, tebex: layout.tebex };
    return {
        ok: true,
        serverName: 'Rebel Roleplay',
        keybind: 'F11',
        currency: { name: 'Rebel Coins', short: 'RC' },
        isGangMember: true,
        gangTabLabel: 'Gang Store',
        locale: {},
        categories: layout.categories,
        tiers: layout.tiers,
        weaponTiers: layout.weaponTiers,
        tebex: layout.tebex,
        player: {
            name: 'MoodyNewt8638',
            serverId: 1,
            identifier: 'license:preview',
            coins: 3510,
            lifetimeSpent: 0,
            lifetimeGranted: 5000,
            isAdmin: true,
            ox: { weight: 0, maxWeight: 70000, slots: 50 },
            owned: [],
            history: [],
            series: [
                { day: '2026-08-18', total: 0 },
                { day: '2026-08-19', total: 0 },
                { day: '2026-08-20', total: 400 },
                { day: '2026-08-21', total: 250 },
                { day: '2026-08-22', total: 0 },
                { day: '2026-08-23', total: 0 },
                { day: '2026-08-24', total: 2860 },
            ],
        },
        catalog: previewCatalog(),
        theme: 'rebel',
        players: [
            { id: 1, name: 'MoodyNewt8638' },
            { id: 12, name: 'NightGuest' },
        ],
        admin: {
            players: [
                { id: 1, name: 'MoodyNewt8638', identifier: 'license:preview', coins: 3510 },
                { id: 12, name: 'NightGuest', identifier: 'license:guest', coins: 80 },
            ],
            logs: [],
            codes: [],
            categories: layout.categories,
            tiers: layout.tiers,
            weaponTiers: layout.weaponTiers,
            tebex: layout.tebex,
            listings: [
                { id: 'veh_sultan', category: 'vehicles', tier: 'gold', label: 'Karin Sultan', price: 8750, model: 'sultan' },
                { id: 'wep_pistol', category: 'weapons', tier: 'pistol', label: 'Combat Pistol', price: 2450, item: 'WEAPON_PISTOL', weapon: 'WEAPON_PISTOL' },
                { id: 'wep_knife', category: 'weapons', tier: 'melee', label: 'Knife', price: 650, item: 'WEAPON_KNIFE', weapon: 'WEAPON_KNIFE' },
                { id: 'wep_smg', category: 'weapons', tier: 'smg', label: 'Micro SMG', price: 3200, item: 'WEAPON_MICROSMG', weapon: 'WEAPON_MICROSMG' },
                { id: 'wep_rifle', category: 'weapons', tier: 'rifles', label: 'Carbine Rifle', price: 5400, item: 'WEAPON_CARBINERIFLE', weapon: 'WEAPON_CARBINERIFLE' },
                { id: 'gang_switch', category: 'gangs', label: 'Gang Switchblade', price: 1200, item: 'WEAPON_SWITCHBLADE', weapon: 'WEAPON_SWITCHBLADE' },
                { id: 'ext_armour', category: 'extras', label: 'Armour Pack', price: 400, item: 'armour', extras: [{ item: 'armour', count: 5 }] },
                { id: 'bdl_starter', category: 'bundles', label: 'Starter Kit', price: 250, extras: [{ item: 'armour', count: 5 }, { item: 'bandage', count: 10 }, { item: 'lockpick', count: 2 }] },
                { id: 'imp_rebla', category: 'imports', tier: 'ruby', label: 'Ubermacht Rebla', price: 6200, model: 'rebla' },
            ],
        },
    };
}

async function post(name, data = {}) {
    if (!IS_NUI) {
        if (name === 'close') return { ok: true };
        if (name === 'purchase') {
            const item = findItem(data.itemId);
            if (!item) return { ok: false, message: 'Invalid item.' };
            if (state.player.coins < item.price) return { ok: false, message: `You do not have enough ${state.currency.name}.` };
            state.player.coins -= item.price;
            state.player.lifetimeSpent = (state.player.lifetimeSpent || 0) + item.price;
            state.player.owned.unshift({ id: Date.now(), item_id: item.id, category: item.category || state.tab, label: item.label, active: 1, created_at: new Date().toISOString() });
            state.player.history.unshift({ id: Date.now(), label: item.label, category: item.category || state.tab, price: item.price, created_at: new Date().toISOString() });
            const self = (state.admin.players || []).find((p) => p.id === state.player.serverId);
            if (self) self.coins = state.player.coins;
            return { ok: true, player: state.player, admin: state.admin, message: `${item.label} added. Check your inventory or garage.` };
        }
        if (name === 'lookupOx') {
            const raw = String(data.name || data.model || '').trim();
            if (!raw) return { ok: false };
            const pretty = raw.replace(/^WEAPON_/i, '').replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
            return { ok: true, name: raw, label: pretty, registered: true, image: '' };
        }
        if (name === 'redeem') {
            const code = String(data.code || '').replace(/\s+/g, '').toUpperCase();
            if (!code || code.length > 64 || !code.startsWith('TBX-')) {
                return { ok: false, message: 'That Tebex / redeem code is invalid, used up, or expired.' };
            }
            const amount = 500;
            state.player.coins += amount;
            const self = (state.admin.players || []).find((p) => p.id === state.player.serverId);
            if (self) self.coins = state.player.coins;
            (state.admin.codes || (state.admin.codes = [])).unshift({
                id: Date.now(),
                code,
                coins: amount,
                uses: 1,
                max_uses: 1,
                created_at: new Date().toISOString(),
            });
            return { ok: true, player: state.player, admin: state.admin, message: `Code redeemed. Rebel Coins have been added. (+${amount} RC)` };
        }
        if (name === 'gift') {
            return { ok: true, player: state.player, admin: state.admin };
        }
        if (['adminGive', 'adminRemove', 'adminSet'].includes(name)) {
            const amount = Number(data.amount || 0);
            const targetId = Number(data.targetId);
            const target = (state.admin.players || []).find((p) => p.id === targetId);
            if (!target || !Number.isFinite(amount) || amount < 0) {
                return { ok: false, message: 'Enter a valid player and amount.' };
            }
            if (name === 'adminGive') target.coins += amount;
            else if (name === 'adminRemove') target.coins = Math.max(0, target.coins - amount);
            else target.coins = amount;
            if (targetId === state.player.serverId) state.player.coins = target.coins;
            state.admin.logs.unshift({
                id: Date.now(),
                actor_name: state.player.name,
                target_name: target.name,
                action: name.replace('admin', 'coins_').toLowerCase(),
                created_at: new Date().toISOString(),
            });
            return { ok: true, player: state.player, admin: state.admin };
        }
        if (name === 'adminSaveListing') {
            const parsed = mockNormalizeListing(data);
            if (!parsed.ok) return parsed;
            const listings = (state.admin.listings || []).filter((row) => row.id !== parsed.item.id);
            listings.unshift(parsed.item);
            state.admin.listings = listings;
            state.catalog = catalogFromListings(listings);
            return { ok: true, catalog: state.catalog, admin: state.admin, player: state.player };
        }
        if (name === 'adminDeleteListing') {
            state.admin.listings = (state.admin.listings || []).filter((row) => row.id !== data.itemId);
            state.catalog = catalogFromListings(state.admin.listings);
            return { ok: true, catalog: state.catalog, admin: state.admin, player: state.player };
        }
        if (name === 'adminSaveCategory') {
            const label = String(data.label || '').trim();
            if (!label) return { ok: false, message: 'Enter a tab name.' };
            const id = String(data.id || label.toLowerCase().replace(/[^a-z0-9]+/g, '_')).replace(/^_|_$/g, '');
            const existing = (state.admin.categories || []).find((row) => row.id === id);
            const row = {
                id,
                label,
                grantType: existing?.builtin ? existing.grantType : (data.grantType || 'item'),
                usesTiers: existing?.builtin ? existing.usesTiers : Boolean(data.usesTiers) || data.grantType === 'vehicle' || data.grantType === 'weapon',
                tierGroup: existing?.builtin ? existing.tierGroup : (data.grantType === 'weapon' ? 'weapon' : ((Boolean(data.usesTiers) || data.grantType === 'vehicle') ? 'vehicle' : undefined)),
                gated: data.gated === 'gang' ? 'gang' : 'none',
                timed: existing?.timed || false,
                builtin: Boolean(existing?.builtin),
                enabled: data.enabled !== false,
                sort: existing?.sort || ((state.admin.categories || []).length + 1) * 10,
            };
            state.admin.categories = (state.admin.categories || []).filter((c) => c.id !== id);
            state.admin.categories.push(row);
            state.admin.categories.sort((a, b) => a.sort - b.sort);
            state.categories = state.admin.categories.filter((c) => c.enabled !== false);
            state.catalog = catalogFromListings(state.admin.listings);
            return { ok: true, message: 'Shop tab saved.', catalog: state.catalog, admin: state.admin, player: state.player, categories: state.categories, tiers: state.tiers };
        }
        if (name === 'adminDeleteCategory') {
            const cat = (state.admin.categories || []).find((row) => row.id === data.id);
            if (!cat) return { ok: false, message: 'Pick a shop category.' };
            if (cat.builtin) {
                cat.enabled = false;
            } else {
                if ((state.admin.listings || []).some((row) => row.category === cat.id)) {
                    return { ok: false, message: 'Move or delete the listings in that tab first.' };
                }
                state.admin.categories = state.admin.categories.filter((row) => row.id !== cat.id);
            }
            state.categories = (state.admin.categories || []).filter((c) => c.enabled !== false);
            if (state.tab === data.id) state.tab = 'dashboard';
            return { ok: true, message: cat.builtin ? 'Built-in tab hidden. Add it back from Admin if you want it again.' : 'Shop tab removed.', catalog: state.catalog, admin: state.admin, player: state.player, categories: state.categories, tiers: state.tiers };
        }
        if (name === 'adminMoveCategory') {
            const list = state.admin.categories || [];
            const index = list.findIndex((row) => row.id === data.id);
            const swap = index + Number(data.direction || 0);
            if (index < 0 || swap < 0 || swap >= list.length) return { ok: true, admin: state.admin, categories: state.categories };
            const aSort = list[index].sort;
            list[index].sort = list[swap].sort;
            list[swap].sort = aSort;
            list.sort((a, b) => a.sort - b.sort);
            state.categories = list.filter((c) => c.enabled !== false);
            return { ok: true, admin: state.admin, categories: state.categories, tiers: state.tiers };
        }
        if (name === 'adminSaveTier') {
            const group = data.group === 'weapon' ? 'weapon' : 'vehicle';
            const key = group === 'weapon' ? 'weaponTiers' : 'tiers';
            const label = String(data.label || '').trim();
            if (!label) return { ok: false, message: 'Enter a tier name.' };
            const id = String(data.id || label.toLowerCase().replace(/[^a-z0-9]+/g, '_')).replace(/^_|_$/g, '');
            const existing = (state.admin[key] || []).find((row) => row.id === id);
            const row = {
                id,
                label,
                builtin: Boolean(existing?.builtin),
                enabled: true,
                sort: existing?.sort || ((state.admin[key] || []).length + 1) * 10,
            };
            state.admin[key] = (state.admin[key] || []).filter((t) => t.id !== id);
            state.admin[key].push(row);
            state.admin[key].sort((a, b) => a.sort - b.sort);
            if (group === 'weapon') state.weaponTiers = state.admin.weaponTiers.filter((t) => t.enabled !== false);
            else state.tiers = state.admin.tiers.filter((t) => t.enabled !== false);
            return { ok: true, message: group === 'weapon' ? 'Weapon class saved.' : 'Vehicle tier saved.', admin: state.admin, catalog: state.catalog, player: state.player, categories: state.categories, tiers: state.tiers, weaponTiers: state.weaponTiers };
        }
        if (name === 'adminDeleteTier') {
            const group = data.group === 'weapon' ? 'weapon' : 'vehicle';
            const key = group === 'weapon' ? 'weaponTiers' : 'tiers';
            const list = state.admin[key] || [];
            if (list.filter((t) => t.enabled !== false).length <= 1) return { ok: false, message: group === 'weapon' ? 'Keep at least one weapon class.' : 'Keep at least one vehicle tier.' };
            const fallback = list.find((t) => t.id !== data.id)?.id;
            (state.admin.listings || []).forEach((row) => {
                if (row.tier === data.id && categoryTierGroup(shopCategory(row.category)) === group) row.tier = fallback;
            });
            state.admin[key] = list.filter((t) => t.id !== data.id);
            if (group === 'weapon') state.weaponTiers = state.admin.weaponTiers;
            else state.tiers = state.admin.tiers;
            state.catalog = catalogFromListings(state.admin.listings);
            return { ok: true, message: group === 'weapon' ? 'Weapon class removed. Listings were moved to another class.' : 'Vehicle tier removed. Listings were moved to another tier.', admin: state.admin, catalog: state.catalog, player: state.player, categories: state.categories, tiers: state.tiers, weaponTiers: state.weaponTiers };
        }
        if (name === 'adminMoveTier') {
            const group = data.group === 'weapon' ? 'weapon' : 'vehicle';
            const key = group === 'weapon' ? 'weaponTiers' : 'tiers';
            const list = state.admin[key] || [];
            const index = list.findIndex((row) => row.id === data.id);
            const swap = index + Number(data.direction || 0);
            if (index < 0 || swap < 0 || swap >= list.length) return { ok: true, admin: state.admin, tiers: state.tiers, weaponTiers: state.weaponTiers };
            const aSort = list[index].sort;
            list[index].sort = list[swap].sort;
            list[swap].sort = aSort;
            list.sort((a, b) => a.sort - b.sort);
            if (group === 'weapon') state.weaponTiers = list.filter((t) => t.enabled !== false);
            else state.tiers = list.filter((t) => t.enabled !== false);
            return { ok: true, admin: state.admin, categories: state.categories, tiers: state.tiers, weaponTiers: state.weaponTiers };
        }
        return { ok: true, player: state.player, admin: state.admin, lookup: state.lookup };
    }
    const res = await fetch(`https://${RESOURCE}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data),
    });
    try {
        return await res.json();
    } catch (err) {
        return { ok: false, error: 'bad_response' };
    }
}

function toast(message) {
    const root = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

function applyPayload(payload) {
    if (!payload) return;
    if (payload.player) state.player = payload.player;
    if (payload.catalog) state.catalog = payload.catalog;
    if (payload.admin) state.admin = payload.admin;
    if (payload.currency) state.currency = payload.currency;
    if (payload.serverName) state.serverName = payload.serverName;
    if (payload.keybind) state.keybind = payload.keybind;
    if (payload.locale) state.locale = payload.locale;
    if (payload.lookup) state.lookup = payload.lookup;
    if (payload.players) state.players = payload.players;
    if (payload.theme) state.theme = normalizeTheme(payload.theme);
    if (payload.isGangMember !== undefined) state.isGangMember = Boolean(payload.isGangMember);
    if (payload.gangTabLabel) state.gangTabLabel = payload.gangTabLabel;
    if (payload.categories) state.categories = payload.categories;
    if (payload.tiers) state.tiers = payload.tiers;
    if (payload.weaponTiers) state.weaponTiers = payload.weaponTiers;
    if (payload.tebex) state.tebex = payload.tebex;
    if (payload.admin?.categories) state.categories = payload.categories || state.categories;
    if (payload.admin?.tiers) state.tiers = payload.admin.tiers;
    if (payload.admin?.weaponTiers) state.weaponTiers = payload.admin.weaponTiers;
    if (payload.admin?.tebex) state.tebex = payload.admin.tebex;
}

function applyTheme(name) {
    const theme = normalizeTheme(name);
    state.theme = theme;
    document.getElementById('app').dataset.theme = theme;
}

function openUI(payload) {
    applyPayload(payload);
    document.getElementById('app').classList.remove('hidden');
    if (!IS_NUI) document.getElementById('app').classList.add('preview');
    document.getElementById('closeHint').textContent = state.keybind;
    applyTheme(payload?.theme || state.theme);
    render();
}

function closeUI() {
    document.getElementById('app').classList.add('hidden');
    hideModal();
    post('close');
}

function weaponList(cat) {
    const w = cat?.weapons;
    if (Array.isArray(w)) return w.map((i) => ({ ...i, category: 'weapons' }));
    return liveTiers('weapon').flatMap((tier) => (w?.[tier.id] || []).map((i) => ({ ...i, category: 'weapons', tier: tier.id })));
}

function findItem(itemId) {
    return allCatalogItems().find((i) => i.id === itemId);
}

function owns(itemId) {
    return (state.player?.owned || []).some((row) => row.item_id === itemId && Number(row.active) === 1);
}

function formatCoins(n) {
    return Number(n || 0).toLocaleString();
}

function formatDate(value) {
    if (!value) return '';
    const d = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function remainingLabel(item) {
    if (!item.limitedUntil) return '';
    const end = new Date(item.limitedUntil);
    const ms = end.getTime() - Date.now();
    if (ms <= 0) return 'Ended';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
}

function allCatalogItems() {
    const cat = state.catalog || emptyCatalog();
    const out = [];
    const seen = new Set();
    liveCategories().forEach((row) => {
        if (row.usesTiers) {
            const groups = cat[row.id] || {};
            if (Array.isArray(groups)) {
                groups.forEach((item) => out.push({ ...item, category: row.id }));
            } else {
                liveTiers(categoryTierGroup(row)).forEach((tier) => {
                    (groups[tier.id] || []).forEach((item) => out.push({ ...item, category: row.id, tier: tier.id }));
                });
                Object.keys(groups).forEach((tier) => {
                    if (liveTiers(categoryTierGroup(row)).some((t) => t.id === tier)) return;
                    (groups[tier] || []).forEach((item) => out.push({ ...item, category: row.id, tier }));
                });
            }
        } else {
            (Array.isArray(cat[row.id]) ? cat[row.id] : []).forEach((item) => out.push({ ...item, category: row.id }));
        }
        seen.add(row.id);
    });
    Object.keys(cat).forEach((key) => {
        if (seen.has(key) || key === 'pets') return;
        const bucket = cat[key];
        if (Array.isArray(bucket)) bucket.forEach((item) => out.push({ ...item, category: key }));
    });
    return out;
}

function categoryLabel(item) {
    const cat = shopCategory(item.category);
    if (cat?.label) return cat.label.toUpperCase();
    return ({
        vehicles: 'VEHICLE',
        weapons: 'WEAPON',
        extras: 'ITEM',
        bundles: 'BUNDLE',
        pets: 'PET',
        exclusives: 'EXCLUSIVE',
        limited: 'LIMITED',
        gangs: 'GANG',
    })[item.category] || 'ITEM';
}

function renderTabs() {
    const nav = document.getElementById('tabs');
    nav.innerHTML = shopTabs().filter((tab) => {
        if (tab.admin) return Boolean(state.player?.isAdmin);
        if (tab.gang) return Boolean(state.isGangMember || state.player?.isAdmin);
        return true;
    }).map((tab) => `
        <button class="tab ${state.tab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
            ${ICONS[tab.id] || ICONS.extras} ${escapeHtml(tab.label)}
        </button>
    `).join('');
    nav.querySelectorAll('.tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.tab = btn.dataset.tab;
            state.search = '';
            state.shopTier = 'all';
            render();
        });
    });
}

function renderHeader() {
    const p = state.player || { name: 'Unknown', isAdmin: false, coins: 0 };
    const coinChip = document.getElementById('coinChip');
    if (coinChip) coinChip.innerHTML = `${GEM}<span>${formatCoins(p.coins)}</span>`;
    const profile = document.getElementById('profile');
    if (profile) {
        profile.innerHTML = `
            <div class="meta">
                <div class="name">${escapeHtml(p.name || 'Unknown')}</div>
                <div class="role">${p.isAdmin ? 'Admin' : 'Member'}</div>
            </div>
            <div class="avatar">RBL</div>
        `;
    }
    const shop = document.getElementById('modeShop');
    const stash = document.getElementById('modeInventory');
    if (shop) shop.classList.toggle('active', state.tab !== 'inventory');
    if (stash) stash.classList.toggle('active', state.tab === 'inventory');
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function oxImage(src, alt) {
    if (!src) return '';
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" onerror="window.djOxImgError && window.djOxImgError(this)" />`;
}

window.djOxImgError = function (img) {
    const tries = Number(img.dataset.try || 0) + 1;
    img.dataset.try = String(tries);
    const src = img.getAttribute('src') || '';
    if (tries === 1 && src.endsWith('.png')) {
        img.src = src.replace(/\.png$/, '.webp');
        return;
    }
    if (tries === 1 && src.endsWith('.webp')) {
        img.src = src.replace(/\.webp$/, '.png');
        return;
    }
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.textContent = (img.alt || '?').slice(0, 1);
    img.replaceWith(ph);
};

function itemCard(item, extra = {}) {
    const owned = owns(item.id);
    const disabled = extra.disabled || (item.unique && owned) || item.limitedActive === false || (item.remaining !== undefined && item.remaining !== null && item.remaining <= 0);
    const tier = extra.tier || item.tier;
    const imgSrc = item.image || item.ox?.grants?.[0]?.image;
    const img = imgSrc
        ? oxImage(imgSrc, item.label)
        : `<div class="ph">${item.petModel ? '🐾' : (item.weapon ? '✦' : escapeHtml((item.label || '?')[0]))}</div>`;
    const grants = item.ox?.grants || [];
    const grantRow = grants.length
        ? `<div class="ox-row">${grants.map((g) => `<span class="ox-chip">${oxImage(g.image, g.label)} x${g.count} ${escapeHtml(g.label || g.name)}</span>`).join('')}</div>`
        : '';
    let badge = '';
    if (extra.featured || item.category === 'bundles') badge = '<div class="tierchip popular">POPULAR</div>';
    if (tier && shopCategory(item.category).usesTiers) {
        const group = categoryTierGroup(item.category);
        badge = `<div class="tierchip ${normalizeTier(tier, group)}">${escapeHtml(tierLabel(tier, group))}</div>`;
    }
    else if (item.limitedUntil) badge = '<div class="tierchip limited">LIMITED</div>';
    const remaining = item.remaining;
    const stock = remaining != null
        ? `<div class="stock-pill ${remaining <= 8 ? 'low' : 'ok'}">ONLY ${remaining} LEFT</div>`
        : '';
    return `
        <article class="card">
            <div class="media">
                ${badge}
                ${img}
                ${stock}
            </div>
            <div class="body">
                <div class="cat-label">${categoryLabel(item)}</div>
                <div class="title-row">
                    <h3>${escapeHtml(item.label)}</h3>
                    <div class="price">${GEM}${formatCoins(item.price)}</div>
                </div>
                ${grantRow}
                ${item.limitedUntil ? `<div class="countdown">${remainingLabel(item)}${item.remaining != null ? ` • ${item.remaining} left` : ''}</div>` : ''}
                <div class="card-actions">
                    <button class="btn info" data-info="${item.id}">Info</button>
                    <button class="btn add" ${disabled ? 'disabled' : ''} data-buy="${item.id}">${owned && item.unique ? 'Owned' : 'Add'}</button>
                </div>
            </div>
        </article>
    `;
}

function bindShopButtons(root) {
    root.querySelectorAll('[data-buy]').forEach((btn) => btn.addEventListener('click', () => confirmBuy(btn.dataset.buy, false)));
    root.querySelectorAll('[data-gift]').forEach((btn) => btn.addEventListener('click', () => confirmBuy(btn.dataset.gift, true)));
    root.querySelectorAll('[data-info]').forEach((btn) => btn.addEventListener('click', () => showInfo(btn.dataset.info)));
    root.querySelectorAll('[data-goto]').forEach((btn) => btn.addEventListener('click', () => {
        state.tab = btn.dataset.goto;
        state.search = '';
        render();
    }));
}

function shopToolbar(title, sub, extraHtml = '') {
    return `
        <div class="panel-head">
            <div>
                <h2>${title}</h2>
                <div class="sub">${sub}</div>
            </div>
            <div class="tools">
                ${extraHtml}
                <input class="search" id="search" placeholder="Search catalog" value="${escapeHtml(state.search)}" />
            </div>
        </div>
    `;
}

function shopListFor(kind, tier) {
    const groups = state.catalog?.[kind] || {};
    const group = categoryTierGroup(kind);
    if (Array.isArray(groups)) {
        return groups.map((item) => ({ ...item, category: kind }));
    }
    const ids = liveTiers(group).map((row) => row.id);
    if (tier === 'all') {
        return ids.flatMap((name) =>
            (groups[name] || []).map((item) => ({ ...item, category: kind, tier: normalizeTier(item.tier || name, group) }))
        );
    }
    return (groups[tier] || []).map((item) => ({ ...item, category: kind, tier: item.tier || tier }));
}

function activeShopTier(kind) {
    const group = categoryTierGroup(kind);
    const ids = liveTiers(group).map((row) => row.id);
    if (state.shopTier && state.shopTier !== 'all' && !ids.includes(state.shopTier)) return 'all';
    return state.shopTier || 'all';
}

function tierPills(kind) {
    const group = categoryTierGroup(kind);
    const current = activeShopTier(kind);
    return `
        <div class="pills" id="tierPills">
            ${['all', ...liveTiers(group).map((row) => row.id)].map((tier) => `<button class="pill ${tier} ${current === tier ? 'active' : ''}" data-tier="${tier}">${tier === 'all' ? 'All' : tierLabel(tier, group)}</button>`).join('')}
        </div>
    `;
}

function filterList(list) {
    const q = state.search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => {
        const extras = (item.extras || []).map((row) => `${row.item || ''} ${row.name || ''}`).join(' ');
        const grants = (item.ox?.grants || []).map((row) => `${row.label || ''} ${row.name || ''}`).join(' ');
        return `${item.label} ${item.description || ''} ${extras} ${grants}`.toLowerCase().includes(q);
    });
}

function renderTierShop(key, title, sub) {
    const list = filterList(shopListFor(key, activeShopTier(key)));
    return `
        <section class="panel">
            ${shopToolbar(title, sub, tierPills(key))}
            <div class="grid">${list.map((item) => itemCard(item, { tier: item.tier })).join('') || '<div class="empty">No listings in this tier yet. Admins add them from the Admin tab.</div>'}</div>
        </section>
    `;
}

function renderVehicles() {
    return renderTierShop('vehicles', shopCategory('vehicles').label || 'Vehicles', 'Pick a spawn name in Admin — the car is stored in JG garages after purchase.');
}

function renderWeapons() {
    return renderTierShop('weapons', 'Weapons', 'Filter by Melee, Pistol, SMG, or Rifles. Every weapon is granted through ox_inventory.');
}

function renderSimpleShop(key, title, sub) {
    const raw = state.catalog?.[key];
    const list = filterList(Array.isArray(raw) ? raw.map((item) => ({ ...item, category: key })) : shopListFor(key, 'all'));
    return `
        <section class="panel">
            ${shopToolbar(title, sub)}
            <div class="grid">${list.map((item) => itemCard(item)).join('') || '<div class="empty">Nothing listed yet. Admins add items from the Admin tab.</div>'}</div>
        </section>
    `;
}

function polyline(series, mode) {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const row = (series || []).find((s) => String(s.day).slice(0, 10) === key);
        days.push({
            label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value: mode === 'coins' ? (state.player?.coins || 0) : Number(row?.total || 0),
        });
    }
    if (mode === 'coins') {
        days.forEach((day, idx) => {
            day.value = Math.max(0, (state.player?.coins || 0) - (6 - idx) * 80);
        });
    }
    const max = Math.max(1, ...days.map((d) => d.value));
    const w = 1000;
    const h = 260;
    const pts = days.map((day, i) => {
        const x = 50 + (i * (w - 80)) / 6;
        const y = 30 + (1 - day.value / max) * 180;
        return `${x},${y}`;
    }).join(' ');
    const labels = days.map((day, i) => {
        const x = 50 + (i * (w - 80)) / 6;
        return `<text class="axis" x="${x}" y="230" text-anchor="middle">${day.label}</text>`;
    }).join('');
    return `
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--accent-2)" />
                    <stop offset="55%" stop-color="#ffffff" />
                    <stop offset="100%" stop-color="var(--secondary)" />
                </linearGradient>
            </defs>
            <polyline fill="none" stroke="url(#chartStroke)" stroke-width="4" points="${pts}" />
            ${pts.split(' ').map((p) => {
                const [x, y] = p.split(',');
                return `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="var(--accent)" stroke-width="2" />`;
            }).join('')}
            ${labels}
            <text class="axis" x="16" y="40">${max} ${state.currency.short}</text>
            <text class="axis" x="16" y="210">0</text>
        </svg>
    `;
}

function renderDashboard() {
    const p = state.player || {};
    const owned = (p.owned || []).filter((row) => Number(row.active) === 1).length;
    const featured = filterList(allCatalogItems()).slice(0, 4);
    const placeholders = Math.max(0, 4 - featured.length);
    const target = Math.max(1, p.lifetimeGranted || 5000);
    const progress = Math.min(100, Math.round(((p.lifetimeSpent || 0) / target) * 100));
    return `
        <section class="panel">
            <div class="hero">
                <div class="hero-banner">
                    <img src="images/rebel-logo.jpg" alt="Rebel Roleplay" />
                    <div class="veil"></div>
                    <div class="hero-copy">
                        <h2>Rebel Store</h2>
                        <p>Spend Rebel Coins on rides, weapons, and packs. Buy Rebel Coins on Tebex, then redeem your Payment ID (tbx-xxxxxxxx) here.</p>
                        <button class="btn add" data-goto="${liveCategories().find((c) => c.grantType === 'vehicle')?.id || liveCategories()[0]?.id || 'dashboard'}">Shop now →</button>
                    </div>
                </div>
                <div class="member-card">
                    <div class="kicker">REBEL STATUS</div>
                    <h3>${escapeHtml(p.name || 'Rebel')}</h3>
                    <div class="sub">${p.isAdmin ? 'Admin' : 'Member'} • ${formatCoins(p.coins)} ${state.currency.short}</div>
                    <div class="progress"><span style="width:${progress}%"></span></div>
                    <div class="stat-mini"><span>Owned ${owned}</span><span>Spent ${formatCoins(p.lifetimeSpent || 0)} ${state.currency.short}</span></div>
                    <div class="chart-wrap" style="height:110px">${polyline(p.series, state.chartMode)}</div>
                </div>
            </div>
            <div class="panel-head">
                <div>
                    <div class="section-tabs">
                        <span class="section-tab active">Featured</span>
                    </div>
                    <div class="sub">Featured Rebel Coin listings. Admins add more from the Admin tab in a few fields.</div>
                </div>
                <input class="search" id="search" placeholder="Search..." value="${escapeHtml(state.search)}" />
            </div>
            <div class="grid">
                ${featured.map((item) => itemCard(item, { featured: true })).join('')}
                ${Array.from({ length: placeholders }).map(() => '<div class="empty-card">No package added.</div>').join('')}
            </div>
        </section>
    `;
}

function renderInventory() {
    const owned = (state.player?.owned || []).filter((row) => Number(row.active) === 1);
    return `
        <section class="panel">
            ${shopToolbar('Inventory', 'ox_inventory items land in your bag. Vehicles stay in your garage.')}
            ${owned.map((row) => {
                const isPet = row.category === 'pets' || Boolean((findItem(row.item_id) || {}).petModel);
                return `
                <div class="owned-row">
                    <div>
                        <strong>${escapeHtml(row.label)}</strong>
                        <div class="sub">${escapeHtml(row.category)}${row.tier ? ` • ${escapeHtml(tierLabel(row.tier, categoryTierGroup(row.category)))}` : ''} • ${formatDate(row.created_at)}</div>
                    </div>
                    <div class="actions">
                        ${isPet ? `<button class="btn primary" data-spawn="${row.item_id}">Spawn pet</button><button class="btn ghost" id="despawnPet">Send pet away</button>` : ''}
                    </div>
                </div>`;
            }).join('') || '<div class="empty">You do not own any donator items yet.</div>'}
        </section>
    `;
}

function listingVal(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    return el.value;
}

function bundleRowHtml(row = {}) {
    return `
        <div class="bundle-row">
            <input class="bundle-item" name="bundleItem" placeholder="ox item name" value="${escapeHtml(row.item || '')}" />
            <input class="bundle-count" name="bundleCount" type="number" min="1" value="${escapeHtml(row.count || 1)}" />
            <button type="button" class="btn ghost bundle-remove">Remove</button>
        </div>
    `;
}

function collectBundleItems() {
    const wrap = document.getElementById('bundleRows');
    if (!wrap) return [];
    return Array.from(wrap.querySelectorAll('.bundle-row')).map((row) => ({
        item: String(row.querySelector('.bundle-item')?.value || '').trim(),
        count: Math.max(1, Number(row.querySelector('.bundle-count')?.value) || 1),
    })).filter((row) => row.item);
}

function fillBundleRows(extras) {
    const wrap = document.getElementById('bundleRows');
    if (!wrap) return;
    const rows = extras && extras.length ? extras : [{ item: '', count: 1 }, { item: '', count: 1 }];
    wrap.innerHTML = rows.map((row) => bundleRowHtml(row)).join('');
}

function listingContents(row) {
    if (row.category === 'bundles' && row.extras?.length) {
        return row.extras.map((item) => `${item.item} x${item.count || 1}`).join(', ');
    }
    return row.item || row.weapon || row.model || row.petModel || '—';
}

function readListingForm() {
    const category = listingVal('listCategory') || 'extras';
    const bundleItems = category === 'bundles' ? collectBundleItems() : undefined;
    return {
        editingId: listingVal('listEditingId'),
        id: listingVal('listId'),
        category,
        tier: listingVal('listTier'),
        label: listingVal('listLabel'),
        description: listingVal('listDescription'),
        price: listingVal('listPrice'),
        image: listingVal('listImage'),
        itemName: listingVal('listItemName'),
        count: listingVal('listCount'),
        bundleItems,
        extras: bundleItems,
        model: listingVal('listModel'),
        garageId: listingVal('listGarageId'),
        garageType: listingVal('listGarageType'),
        ammo: listingVal('listAmmo'),
        petModel: listingVal('listPetModel'),
        unique: listingVal('listUnique'),
        stock: listingVal('listStock'),
        limitedFrom: listingVal('listLimitedFrom'),
        limitedUntil: listingVal('listLimitedUntil'),
    };
}

function updateListingHint() {
    const hint = document.getElementById('listHint');
    if (!hint) return;
    const cat = shopCategory(listingVal('listCategory') || 'extras');
    const copy = {
        vehicle: 'Type the spawn name (sultan). Display name fills in automatically. Vehicle goes to JG garages on buy.',
        weapon: 'Type the ox_inventory weapon (WEAPON_PISTOL). The image comes from ox_inventory/web/images.',
        item: 'Type the ox_inventory item (armour). Image uses Fivemanage, then ox_inventory if that file is missing.',
        bundle: 'Add two or more ox items. Players get the whole package in one purchase.',
        mixed: 'Set a spawn name or ox item, then Save. Use More options for garage, ammo, or timed windows.',
    };
    if (cat.gated === 'gang') {
        hint.textContent = 'Same as a normal listing, but only Discord gang-role players see this tab.';
        return;
    }
    hint.textContent = copy[cat.grantType] || copy.item;
}

function refreshListingTierSelect(cat) {
    const select = document.getElementById('listTier');
    if (!select) return;
    const group = categoryTierGroup(cat);
    const current = select.value;
    const options = liveTiers(group);
    select.innerHTML = options.map((tier) => `<option value="${escapeHtml(tier.id)}">${escapeHtml(tier.label)}</option>`).join('');
    const label = document.querySelector('[data-need="tier"] label');
    if (label) label.textContent = group === 'weapon' ? 'Weapon class' : 'Vehicle tier';
    if (options.some((tier) => tier.id === current)) select.value = current;
    else if (options[0]) select.value = options[0].id;
}

function toggleListingFields() {
    const cat = shopCategory(listingVal('listCategory') || 'extras');
    const grant = cat.grantType || 'item';
    refreshListingTierSelect(cat);
    const show = {
        all: true,
        tier: Boolean(cat.usesTiers),
        model: grant === 'vehicle' || grant === 'mixed',
        item: grant === 'weapon' || grant === 'item' || grant === 'mixed',
        count: grant === 'item' || grant === 'mixed',
        bundle: grant === 'bundle',
        garage: grant === 'vehicle' || grant === 'mixed',
        ammo: grant === 'weapon' || grant === 'mixed',
        timed: Boolean(cat.timed) || cat.id === 'limited',
    };
    document.querySelectorAll('[data-need]').forEach((el) => {
        const need = el.dataset.need;
        el.classList.toggle('hidden-field', !show[need]);
    });
    document.querySelectorAll('[data-for]').forEach((el) => {
        if (el.dataset.need) return;
        const allow = (el.dataset.for || '').split(/\s+/).filter(Boolean);
        const showFor = allow.includes('all') || allow.includes(cat.id) || allow.includes(grant);
        el.classList.toggle('hidden-field', !showFor);
    });
    const preview = document.getElementById('listImagePreview');
    const url = listingVal('listImage');
    if (preview) {
        if (url) {
            preview.src = url;
            preview.classList.remove('hidden-field');
        } else {
            preview.removeAttribute('src');
            preview.classList.add('hidden-field');
        }
    }
    updateListingHint();
}

async function lookupListingItem() {
    const name = listingVal('listItemName') || listingVal('listModel');
    if (!name) return;
    const result = await post('lookupOx', {
        name,
        category: listingVal('listCategory'),
        model: listingVal('listModel'),
    });
    const box = document.getElementById('oxPreview');
    if (!box) return;
    if (!result || (!result.registered && !result.image && !result.label)) {
        box.classList.add('hidden-field');
        box.innerHTML = '';
        return;
    }
    box.classList.remove('hidden-field');
    const label = result.label || result.name || name;
    const img = result.image ? oxImage(result.image, label) : '';
    box.innerHTML = `${img}<span>${escapeHtml(label)}${result.registered ? '' : ' (not in ox_inventory)'}</span>`;
    const labelInput = document.getElementById('listLabel');
    if (labelInput && !labelInput.value && result.label) {
        labelInput.value = result.label;
    }
}

function fillListingForm(item) {
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = Boolean(value);
        else el.value = value == null ? '' : value;
    };
    set('listEditingId', item?.id || '');
    set('listId', item?.id || '');
    set('listCategory', item?.category || 'extras');
    set('listTier', item?.tier ? normalizeTier(item.tier, categoryTierGroup(item?.category)) : (liveTiers(categoryTierGroup(item?.category))[0]?.id || ''));
    set('listLabel', item?.label || '');
    set('listDescription', item?.description || '');
    set('listPrice', item?.price ?? '');
    set('listImage', item?.image || '');
    set('listItemName', item?.item || item?.weapon || '');
    set('listCount', item?.count || item?.extras?.[0]?.count || 1);
    set('listModel', item?.model || '');
    set('listGarageId', item?.garageId || '');
    set('listGarageType', item?.garageType || 'car');
    set('listAmmo', item?.ammo ?? '');
    set('listPetModel', item?.petModel || '');
    set('listUnique', item?.unique);
    set('listStock', item?.stock ?? '');
    set('listLimitedFrom', item?.limitedFrom || '');
    set('listLimitedUntil', item?.limitedUntil || '');
    const idInput = document.getElementById('listId');
    if (idInput) idInput.disabled = Boolean(item?.id);
    const heading = document.getElementById('listingFormTitle');
    if (heading) heading.textContent = item?.id ? `Edit ${item.label}` : 'Add shop listing';
    fillBundleRows(item?.extras);
    toggleListingFields();
}

function shopSubtitle(cat) {
    if (cat.gated === 'gang') return 'Only players with the configured Discord gang role can see this tab.';
    if (cat.timed) return 'Timed stock. When the window closes, the listing disappears.';
    if (cat.grantType === 'vehicle') return 'Spawn name in Admin. Stored in JG garages after purchase.';
    if (cat.grantType === 'weapon') return 'Filter by Melee, Pistol, SMG, or Rifles. Every weapon is granted through ox_inventory.';
    if (cat.grantType === 'bundle') return 'One purchase grants every ox_inventory item in the package.';
    if (cat.grantType === 'item') return 'Type the ox_inventory item name in Admin. Images use Fivemanage, then ox_inventory.';
    return 'Admins add listings from the Admin tab.';
}

function copyText(value) {
    const text = String(value || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard.')).catch(() => fallbackCopy(text));
        return;
    }
    fallbackCopy(text);
}

function fallbackCopy(text) {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try { document.execCommand('copy'); toast('Copied to clipboard.'); } catch (err) { toast(text); }
    input.remove();
}

function listingTebexCommand(itemId) {
    const cmd = (state.tebex?.commands || []).find((row) => row.id === 'package_instant')?.command || 'givepackage {id} LISTING_ID';
    return cmd.replace('LISTING_ID', itemId);
}

function renderTebexHelp() {
    const tebex = state.tebex || state.admin?.tebex || {};
    const commands = tebex.commands || [];
    return `
        <h3 style="margin:18px 0 8px">Tebex game commands</h3>
        <p class="quick-hint">Paste these into the Tebex package <strong>Game Server Commands</strong> box. {transaction} is the Payment ID. {id} is the player’s server ID when the Tebex FiveM plugin has them linked. Players can also /${escapeHtml(tebex.playerRedeem || 'redeem')} tbx-xxxxxxxx in-game.</p>
        ${tebex.storeUrl ? `<p class="sub">Store: ${escapeHtml(tebex.storeUrl)}</p>` : ''}
        <div class="tebex-list">
            ${commands.map((row) => `
                <div class="tebex-row">
                    <div>
                        <div class="sub">${escapeHtml(row.title)}</div>
                        <code>${escapeHtml(row.command)}</code>
                    </div>
                    <button class="btn ghost" data-copy="${escapeHtml(row.command)}">Copy</button>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTierManager(title, hint, group, placeholder) {
    const tiers = adminTiers(group);
    return `
        <h3 style="margin:18px 0 8px">${title}</h3>
        <p class="quick-hint">${hint}</p>
        <div class="form-grid listing-grid">
            <div class="field"><label>Name</label><input id="tierLabel-${group}" placeholder="${placeholder}" /></div>
        </div>
        <div class="actions" style="margin:10px 0 12px"><button class="btn primary" data-save-tier="${group}">Add</button></div>
        <table class="table">
            <thead><tr><th>${group === 'weapon' ? 'Class' : 'Tier'}</th><th></th></tr></thead>
            <tbody>
                ${tiers.map((tier) => `
                    <tr>
                        <td>${escapeHtml(tier.label)}<div class="sub">${escapeHtml(tier.id)}</div></td>
                        <td class="actions">
                            <button class="btn ghost" data-move-tier="${escapeHtml(tier.id)}" data-tier-group="${group}" data-dir="-1">Up</button>
                            <button class="btn ghost" data-move-tier="${escapeHtml(tier.id)}" data-tier-group="${group}" data-dir="1">Down</button>
                            <button class="btn ghost" data-delete-tier="${escapeHtml(tier.id)}" data-tier-group="${group}">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderShopManager() {
    const cats = adminCategories();
    return `
        <h3 style="margin:0 0 8px">Shop tabs</h3>
        <p class="quick-hint">Add or hide shop categories here. Custom tabs can be deleted if they have no listings. Built-in tabs are hidden instead of deleted.</p>
        <div class="form-grid listing-grid">
            <div class="field"><label>Tab name</label><input id="tabLabel" placeholder="Imports" /></div>
            <div class="field">
                <label>Sells</label>
                <select id="tabGrant">
                    <option value="vehicle">Vehicles</option>
                    <option value="weapon">Weapons</option>
                    <option value="item" selected>Items</option>
                    <option value="bundle">Bundles</option>
                    <option value="mixed">Vehicles or items</option>
                </select>
            </div>
            <div class="field"><label class="check-label"><input id="tabTiers" type="checkbox" /> Use class / tier pills</label></div>
            <div class="field"><label class="check-label"><input id="tabGang" type="checkbox" /> Gang role only</label></div>
        </div>
        <div class="actions" style="margin:10px 0 12px"><button class="btn primary" id="saveTab">Add tab</button></div>
        <table class="table">
            <thead><tr><th>Tab</th><th>Sells</th><th>Visible</th><th></th></tr></thead>
            <tbody>
                ${cats.map((cat) => `
                    <tr>
                        <td>${escapeHtml(cat.label)}<div class="sub">${escapeHtml(cat.id)}${cat.builtin ? ' • built-in' : ''}${cat.gated === 'gang' ? ' • gang' : ''}${cat.usesTiers ? ' • tiers' : ''}</div></td>
                        <td>${escapeHtml(cat.grantType)}</td>
                        <td>${cat.enabled === false ? 'Hidden' : 'Yes'}</td>
                        <td class="actions">
                            <button class="btn ghost" data-move-tab="${escapeHtml(cat.id)}" data-dir="-1">Up</button>
                            <button class="btn ghost" data-move-tab="${escapeHtml(cat.id)}" data-dir="1">Down</button>
                            ${cat.enabled === false
                                ? `<button class="btn ghost" data-show-tab="${escapeHtml(cat.id)}">Show</button>`
                                : `<button class="btn ghost" data-hide-tab="${escapeHtml(cat.id)}">${cat.builtin ? 'Hide' : 'Remove'}</button>`}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${renderTierManager('Vehicle tiers', 'These pills show on Vehicles and any tab that uses vehicle tiers. Removing a tier moves its cars to another tier.', 'vehicle', 'Ruby')}
        ${renderTierManager('Weapon classes', 'These pills show on Weapons. Use Melee, Pistol, SMG, and Rifles. Removing a class moves those weapons to another class.', 'weapon', 'Shotguns')}
        ${renderTebexHelp()}
    `;
}

function renderAdmin() {
    const players = state.admin?.players || [];
    const logs = state.admin?.logs || [];
    const codes = state.admin?.codes || [];
    const listings = state.admin?.listings || [];
    const lookup = state.lookup;
    return `
        <section class="panel">
            <div class="panel-head">
                <div>
                    <h2>Admin panel</h2>
                    <div class="sub">Quick add: pick a type, enter the spawn / ox name and a Rebel Coin price, then Save.</div>
                </div>
                <button class="btn ghost" id="adminRefresh">Refresh</button>
            </div>
            ${renderShopManager()}
            <h3 id="listingFormTitle">Add shop listing</h3>
            <p class="quick-hint" id="listHint">Vehicles need a spawn name (sultan). Weapons and items need the ox_inventory name. Display name is filled in for you if you leave it blank.</p>
            <input type="hidden" id="listEditingId" />
            <div class="form-grid listing-grid">
                <div class="field" data-need="all">
                    <label>Type</label>
                    <select id="listCategory">
                        ${adminCategories().map((cat) => `<option value="${escapeHtml(cat.id)}" ${cat.id === 'extras' ? 'selected' : ''}>${escapeHtml(cat.label)}</option>`).join('')}
                    </select>
                </div>
                <div class="field" data-need="tier">
                    <label>Vehicle tier</label>
                    <select id="listTier">
                        ${liveTiers('vehicle').map((tier) => `<option value="${escapeHtml(tier.id)}">${escapeHtml(tier.label)}</option>`).join('')}
                    </select>
                </div>
                <div class="field" data-need="model">
                    <label>Vehicle spawn name</label>
                    <input id="listModel" placeholder="sultan" />
                </div>
                <div class="field" data-need="item">
                    <label>ox_inventory item</label>
                    <input id="listItemName" placeholder="WEAPON_PISTOL or armour" />
                    <div class="ox-preview hidden-field" id="oxPreview"></div>
                </div>
                <div class="field" data-need="all">
                    <label>Price (${state.currency.short || 'RC'})</label>
                    <input id="listPrice" type="number" min="0" placeholder="250" />
                </div>
                <div class="field" data-need="all">
                    <label>Display name <span class="muted-inline">(optional)</span></label>
                    <input id="listLabel" placeholder="Auto from spawn / ox item" />
                </div>
                <div class="field" data-need="count">
                    <label>Item count</label>
                    <input id="listCount" type="number" min="1" value="1" />
                </div>
                <div class="field full" data-need="bundle">
                    <label>Bundle items (ox_inventory name + count)</label>
                    <div class="bundle-head"><span>Item name</span><span>Qty</span><span></span></div>
                    <div id="bundleRows" class="bundle-rows">
                        ${bundleRowHtml({ item: '', count: 1 })}
                        ${bundleRowHtml({ item: '', count: 1 })}
                    </div>
                    <button type="button" class="btn ghost" id="addBundleItem">Add item</button>
                    <div class="sub">A bundle needs at least two items. Purchase grants every row in one package.</div>
                </div>
            </div>
            <details class="advanced-box">
                <summary>More options</summary>
                <div class="form-grid listing-grid" style="margin-top:10px">
                    <div class="field full" data-for="all">
                        <label>Image link override</label>
                        <div class="image-row">
                            <input id="listImage" placeholder="Leave blank — weapons use ox, everything else uses Fivemanage then ox" />
                            <img id="listImagePreview" class="listing-preview hidden-field" alt="" />
                        </div>
                    </div>
                    <div class="field" data-need="garage">
                        <label>JG garage name</label>
                        <input id="listGarageId" placeholder="legion" />
                    </div>
                    <div class="field" data-need="garage">
                        <label>Garage type</label>
                        <select id="listGarageType">
                            <option value="car">Car</option>
                            <option value="heli">Air / heli</option>
                            <option value="boat">Boat</option>
                        </select>
                    </div>
                    <div class="field" data-need="ammo">
                        <label>Ammo</label>
                        <input id="listAmmo" type="number" min="0" placeholder="60" />
                    </div>
                    <div class="field hidden-field" data-need="timed">
                        <label>Pet ped model</label>
                        <input id="listPetModel" placeholder="a_c_husky" />
                    </div>
                    <div class="field" data-for="all">
                        <label>Custom id (optional)</label>
                        <input id="listId" placeholder="auto from name" />
                    </div>
                    <div class="field" data-for="all">
                        <label>Stock (blank = unlimited)</label>
                        <input id="listStock" type="number" min="0" placeholder="" />
                    </div>
                    <div class="field" data-need="timed">
                        <label>Limited from (UTC)</label>
                        <input id="listLimitedFrom" placeholder="2026-08-01T00:00:00Z" />
                    </div>
                    <div class="field" data-need="timed">
                        <label>Limited until (UTC)</label>
                        <input id="listLimitedUntil" placeholder="2026-09-15T23:59:59Z" />
                    </div>
                    <div class="field full" data-for="all">
                        <label>Description</label>
                        <textarea id="listDescription" rows="2" placeholder="Shown on the shop card."></textarea>
                    </div>
                    <div class="field" data-for="all">
                        <label class="check-label"><input id="listUnique" type="checkbox" /> Unique (one per character)</label>
                    </div>
                </div>
            </details>
            <div class="actions" style="margin-top:10px">
                <button class="btn primary" id="saveListing">Save listing</button>
                <button class="btn ghost" id="clearListing">Clear form</button>
            </div>
            <h3 style="margin:18px 0 8px">Shop listings</h3>
            <table class="table">
                <thead><tr><th></th><th>Name</th><th>Category</th><th>Item</th><th>RC</th><th></th></tr></thead>
                <tbody>
                    ${listings.map((row) => `
                        <tr>
                            <td>${row.image ? `<img class="listing-thumb" src="${escapeHtml(row.image)}" alt="" />` : ''}</td>
                            <td>${escapeHtml(row.label)}<div class="sub">${escapeHtml(row.id)}</div></td>
                            <td>${escapeHtml(row.category)}${row.tier ? ` / ${escapeHtml(tierLabel(row.tier, categoryTierGroup(row.category)))}` : ''}</td>
                            <td>${escapeHtml(listingContents(row))}</td>
                            <td>${formatCoins(row.price)}</td>
                            <td class="actions">
                                <button class="btn ghost" data-copy="${escapeHtml(listingTebexCommand(row.id))}">Tebex</button>
                                <button class="btn ghost" data-edit-listing="${escapeHtml(row.id)}">Edit</button>
                                <button class="btn ghost" data-delete-listing="${escapeHtml(row.id)}">Delete</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="6">No listings yet. Fill the form above to add your first item.</td></tr>'}
                </tbody>
            </table>
            <div class="admin-layout" style="margin-top:18px">
                <div>
                    <div class="form-grid">
                        <div class="field">
                            <label>Player ID</label>
                            <input id="adminTargetId" placeholder="12" />
                        </div>
                        <div class="field">
                            <label>Amount</label>
                            <input id="adminAmount" type="number" min="1" placeholder="100" />
                        </div>
                        <div class="field full">
                            <label>Reason</label>
                            <input id="adminReason" placeholder="Tebex package / compensation" />
                        </div>
                    </div>
                    <div class="actions" style="margin-top:10px">
                        <button class="btn primary" data-admin="give">Give Coins</button>
                        <button class="btn ghost" data-admin="remove">Remove</button>
                        <button class="btn ghost" data-admin="set">Set</button>
                        <button class="btn ghost" id="adminLookup">Lookup</button>
                    </div>
                    <h3 style="margin:18px 0 8px">Online players</h3>
                    <table class="table">
                        <thead><tr><th>ID</th><th>Name</th><th>RC</th></tr></thead>
                        <tbody>
                            ${players.map((p) => `<tr data-fill-id="${p.id}" style="cursor:pointer"><td>${p.id}</td><td>${escapeHtml(p.name)}</td><td>${formatCoins(p.coins)}</td></tr>`).join('') || '<tr><td colspan="3">No players.</td></tr>'}
                        </tbody>
                    </table>
                    <h3 style="margin:18px 0 8px">Create redeem code</h3>
                    <div class="form-grid">
                        <div class="field"><label>Code</label><input id="codeName" placeholder="tbx-xxxxxxxx" /></div>
                        <div class="field"><label>Rebel Coins</label><input id="codeCoins" type="number" value="100" /></div>
                        <div class="field"><label>Max uses</label><input id="codeUses" type="number" value="10" /></div>
                        <div class="field"><label>Item id (optional)</label><input id="codeItem" placeholder="veh_sultan" /></div>
                    </div>
                    <div class="actions" style="margin-top:10px"><button class="btn primary" id="createCode">Create code</button></div>
                </div>
                <div>
                    <h3 style="margin-bottom:8px">Logs</h3>
                    <table class="table">
                        <thead><tr><th>Action</th><th>Actor</th><th>When</th></tr></thead>
                        <tbody>
                            ${logs.map((row) => `<tr><td>${escapeHtml(row.action)}</td><td>${escapeHtml(row.actor_name || '')}</td><td>${formatDate(row.created_at)}</td></tr>`).join('') || '<tr><td colspan="3">No logs.</td></tr>'}
                        </tbody>
                    </table>
                    <h3 style="margin:18px 0 8px">Codes</h3>
                    <table class="table">
                        <thead><tr><th>Code</th><th>RC</th><th>Uses</th></tr></thead>
                        <tbody>
                            ${codes.map((row) => `<tr><td>${escapeHtml(row.code)}</td><td>${formatCoins(row.coins)}</td><td>${row.uses}/${row.max_uses}</td></tr>`).join('') || '<tr><td colspan="3">None</td></tr>'}
                        </tbody>
                    </table>
                    ${lookup ? `
                        <h3 style="margin:18px 0 8px">Lookup ${escapeHtml(lookup.identifier)}</h3>
                        <div class="sub">Balance ${formatCoins(lookup.coins?.coins)} ${state.currency.short}</div>
                        <table class="table">
                            ${(lookup.history || []).slice(0, 8).map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${formatCoins(row.price)}</td><td><button class="btn ghost" data-refund="${row.id}">Refund</button></td></tr>`).join('') || '<tr><td>No purchases</td></tr>'}
                        </table>
                    ` : ''}
                </div>
            </div>
        </section>
    `;
}

function renderContent() {
    const root = document.getElementById('content');
    if (state.tab === 'dashboard') root.innerHTML = renderDashboard();
    else if (state.tab === 'inventory') root.innerHTML = renderInventory();
    else if (state.tab === 'admin') root.innerHTML = renderAdmin();
    else {
        const cat = shopCategory(state.tab);
        if (!cat?.id || !liveCategories().some((row) => row.id === state.tab)) {
            state.tab = 'dashboard';
            root.innerHTML = renderDashboard();
        } else if (cat.usesTiers) {
            root.innerHTML = renderTierShop(cat.id, cat.label, shopSubtitle(cat));
        } else {
            root.innerHTML = renderSimpleShop(cat.id, cat.label, shopSubtitle(cat));
        }
    }

    const search = root.querySelector('#search');
    if (search) {
        search.addEventListener('input', (e) => {
            state.search = e.target.value;
            const caret = search.selectionStart;
            renderContent();
            const next = document.getElementById('search');
            if (next) {
                next.focus();
                next.setSelectionRange(caret, caret);
            }
        });
    }

    root.querySelectorAll('#tierPills .pill').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.shopTier = btn.dataset.tier;
            render();
        });
    });
    root.querySelectorAll('[data-chart]').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.chartMode = btn.dataset.chart;
            render();
        });
    });
    bindShopButtons(root);

    const redeemBtn = root.querySelector('#redeemBtn');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', async () => {
            const code = document.getElementById('redeemCode').value;
            const result = await post('redeem', { code });
            handleResult(result, 'Code redeemed.');
        });
    }

    root.querySelectorAll('[data-spawn]').forEach((btn) => {
        btn.addEventListener('click', async () => handleResult(await post('spawnPet', { itemId: btn.dataset.spawn }), 'Pet spawned.'));
    });
    const despawn = root.querySelector('#despawnPet');
    if (despawn) despawn.addEventListener('click', async () => handleResult(await post('despawnPet'), 'Pet sent away.'));

    root.querySelectorAll('[data-admin]').forEach((btn) => {
        btn.addEventListener('click', () => runAdmin(btn.dataset.admin));
    });
    const refresh = root.querySelector('#adminRefresh');
    if (refresh) refresh.addEventListener('click', async () => handleResult(await post('adminRefresh')));
    const lookupBtn = root.querySelector('#adminLookup');
    if (lookupBtn) lookupBtn.addEventListener('click', async () => {
        const result = await post('adminLookup', { targetId: Number(document.getElementById('adminTargetId').value) });
        handleResult(result);
    });
    root.querySelectorAll('[data-fill-id]').forEach((row) => {
        row.addEventListener('click', () => {
            const input = document.getElementById('adminTargetId');
            if (input) input.value = row.dataset.fillId;
        });
    });
    const createCode = root.querySelector('#createCode');
    if (createCode) {
        createCode.addEventListener('click', async () => {
            const result = await post('adminCreateCode', {
                code: document.getElementById('codeName').value,
                coins: Number(document.getElementById('codeCoins').value),
                maxUses: Number(document.getElementById('codeUses').value),
                itemId: document.getElementById('codeItem').value,
            });
            handleResult(result, 'Code created.');
        });
    }
    root.querySelectorAll('[data-refund]').forEach((btn) => {
        btn.addEventListener('click', async () => handleResult(await post('adminRefund', { purchaseId: Number(btn.dataset.refund) }), 'Refunded.'));
    });

    if (root.querySelector('#listCategory')) {
        toggleListingFields();
        root.querySelector('#listCategory').addEventListener('change', toggleListingFields);
        ['listItemName', 'listModel'].forEach((id) => {
            const el = root.querySelector(`#${id}`);
            if (el) el.addEventListener('blur', lookupListingItem);
        });
        const image = root.querySelector('#listImage');
        if (image) image.addEventListener('input', toggleListingFields);
        const addBundle = root.querySelector('#addBundleItem');
        if (addBundle) {
            addBundle.addEventListener('click', () => {
                const wrap = document.getElementById('bundleRows');
                if (wrap) wrap.insertAdjacentHTML('beforeend', bundleRowHtml({ item: '', count: 1 }));
            });
        }
        const bundleRows = root.querySelector('#bundleRows');
        if (bundleRows) {
            bundleRows.addEventListener('click', (e) => {
                const btn = e.target.closest('.bundle-remove');
                if (!btn) return;
                const rows = bundleRows.querySelectorAll('.bundle-row');
                if (rows.length <= 1) return;
                btn.closest('.bundle-row')?.remove();
            });
        }
        const saveListing = root.querySelector('#saveListing');
        if (saveListing) {
            saveListing.addEventListener('click', async () => {
                handleResult(await post('adminSaveListing', readListingForm()), 'Shop listing saved.');
            });
        }
        const clearListing = root.querySelector('#clearListing');
        if (clearListing) {
            clearListing.addEventListener('click', () => fillListingForm(null));
        }
        root.querySelectorAll('[data-edit-listing]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const item = (state.admin.listings || []).find((row) => row.id === btn.dataset.editListing);
                if (item) fillListingForm(item);
            });
        });
        root.querySelectorAll('[data-delete-listing]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                handleResult(await post('adminDeleteListing', { itemId: btn.dataset.deleteListing }), 'Shop listing removed.');
            });
        });
        const saveTab = root.querySelector('#saveTab');
        if (saveTab) {
            const tabGrant = root.querySelector('#tabGrant');
            const tabTiers = root.querySelector('#tabTiers');
            if (tabGrant && tabTiers) {
                tabGrant.addEventListener('change', () => {
                    if (tabGrant.value === 'vehicle' || tabGrant.value === 'weapon') tabTiers.checked = true;
                });
            }
            saveTab.addEventListener('click', async () => {
                const grantType = document.getElementById('tabGrant')?.value;
                handleResult(await post('adminSaveCategory', {
                    label: document.getElementById('tabLabel')?.value,
                    grantType,
                    usesTiers: Boolean(document.getElementById('tabTiers')?.checked) || grantType === 'vehicle' || grantType === 'weapon',
                    tierGroup: grantType === 'weapon' ? 'weapon' : 'vehicle',
                    gated: document.getElementById('tabGang')?.checked ? 'gang' : 'none',
                }), 'Shop tab saved.');
            });
        }
        root.querySelectorAll('[data-save-tier]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const group = btn.dataset.saveTier;
                handleResult(await post('adminSaveTier', { label: document.getElementById(`tierLabel-${group}`)?.value, group }), group === 'weapon' ? 'Weapon class saved.' : 'Vehicle tier saved.');
            });
        });
        root.querySelectorAll('[data-hide-tab]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                handleResult(await post('adminDeleteCategory', { id: btn.dataset.hideTab }));
            });
        });
        root.querySelectorAll('[data-show-tab]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const cat = adminCategories().find((row) => row.id === btn.dataset.showTab);
                handleResult(await post('adminSaveCategory', { ...cat, id: cat?.id, label: cat?.label, enabled: true }), 'Shop tab saved.');
            });
        });
        root.querySelectorAll('[data-move-tab]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                handleResult(await post('adminMoveCategory', { id: btn.dataset.moveTab, direction: Number(btn.dataset.dir) }));
            });
        });
        root.querySelectorAll('[data-delete-tier]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                handleResult(await post('adminDeleteTier', { id: btn.dataset.deleteTier, group: btn.dataset.tierGroup }));
            });
        });
        root.querySelectorAll('[data-move-tier]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                handleResult(await post('adminMoveTier', { id: btn.dataset.moveTier, direction: Number(btn.dataset.dir), group: btn.dataset.tierGroup }));
            });
        });
        root.querySelectorAll('[data-copy]').forEach((btn) => {
            btn.addEventListener('click', () => copyText(btn.dataset.copy));
        });
    }
}

function handleResult(result, successMessage) {
    if (!result || !result.ok) {
        toast(result?.message || 'That action failed.');
        return;
    }
    applyPayload(result);
    toast(result.message || successMessage || 'Done.');
    render();
}

async function runAdmin(mode) {
    const payload = {
        targetId: Number(document.getElementById('adminTargetId').value),
        amount: Number(document.getElementById('adminAmount').value),
        reason: document.getElementById('adminReason').value,
    };
    const map = { give: 'adminGive', remove: 'adminRemove', set: 'adminSet' };
    handleResult(await post(map[mode], payload), `${state.currency.name} updated.`);
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    modal.innerHTML = '';
}

function confirmBuy(itemId, asGift) {
    const item = findItem(itemId);
    if (!item) return;
    const players = state.players || [];
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-card">
            <h3>${asGift ? 'Gift' : 'Buy'} ${escapeHtml(item.label)}</h3>
            <p>${escapeHtml(item.description || '')}<br />Cost: <strong>${formatCoins(item.price)} ${state.currency.short}</strong></p>
            ${item.category === 'bundles' && (item.ox?.grants || item.extras || []).length ? `<p class="sub">Includes: ${(item.ox?.grants || item.extras).map((g) => `${g.count || 1}× ${escapeHtml(g.label || g.item || g.name)}`).join(', ')}</p>` : ''}
            ${asGift ? `
                <div class="field">
                    <label>Player ID</label>
                    <input id="giftTarget" placeholder="12" />
                </div>
                ${players.length ? `<div class="sub" style="margin-top:8px">Online: ${players.map((p) => `${p.id} ${p.name}`).join(', ')}</div>` : ''}
            ` : ''}
            <div class="modal-actions">
                <button class="btn ghost" id="modalCancel">Cancel</button>
                <button class="btn primary" id="modalOk">${asGift ? 'Send gift' : 'Confirm purchase'}</button>
            </div>
        </div>
    `;
    modal.querySelector('#modalCancel').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    modal.querySelector('#modalOk').addEventListener('click', async () => {
        const payload = { itemId };
        if (asGift) payload.targetId = Number(document.getElementById('giftTarget').value);
        const result = await post(asGift ? 'gift' : 'purchase', payload);
        hideModal();
        handleResult(result, asGift ? 'Gift sent.' : 'Purchase complete.');
    });
}

function showInfo(itemId) {
    const item = findItem(itemId);
    if (!item) return;
    const grants = item.ox?.grants || item.extras || [];
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-card">
            <div class="cat-label">${categoryLabel(item)}</div>
            <h3>${escapeHtml(item.label)}</h3>
            <p>${escapeHtml(item.description || 'No extra details.')}</p>
            ${grants.length ? `<p class="sub">Includes: ${grants.map((g) => `${g.count || 1}× ${escapeHtml(g.label || g.item || g.name)}`).join(', ')}</p>` : ''}
            <div class="price" style="margin-bottom:12px">${GEM}${formatCoins(item.price)} ${state.currency.short}</div>
            <div class="modal-actions">
                <button class="btn ghost" id="modalCancel">Close</button>
                <button class="btn ghost" data-gift-now="${item.id}">Gift</button>
                <button class="btn add" data-buy-now="${item.id}">Add</button>
            </div>
        </div>
    `;
    modal.querySelector('#modalCancel').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    modal.querySelector('[data-gift-now]').addEventListener('click', () => {
        hideModal();
        confirmBuy(item.id, true);
    });
    modal.querySelector('[data-buy-now]').addEventListener('click', () => {
        hideModal();
        confirmBuy(item.id, false);
    });
}

function showRedeemModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-card">
            <h3>Redeem Coins</h3>
            <p>Paste your Tebex Payment ID (tbx-xxxxxxxx) from the receipt after buying Rebel Coins, or a staff code.</p>
            <div class="field">
                <label>Tebex / redeem code</label>
                <input id="redeemCode" placeholder="tbx-xxxxxxxx" />
            </div>
            <div class="modal-actions">
                <button class="btn ghost" id="modalCancel">Cancel</button>
                <button class="btn add" id="redeemBtn">Redeem</button>
            </div>
        </div>
    `;
    modal.querySelector('#modalCancel').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    modal.querySelector('#redeemBtn').addEventListener('click', async () => {
        const code = document.getElementById('redeemCode').value;
        hideModal();
        handleResult(await post('redeem', { code }), 'Code redeemed.');
    });
}

function render() {
    renderTabs();
    renderHeader();
    renderContent();
}

window.addEventListener('message', (event) => {
    const { action, data } = event.data || {};
    if (action === 'open' || action === 'sync') openUI(data);
    if (action === 'close') {
        document.getElementById('app').classList.add('hidden');
        hideModal();
    }
    if (action === 'coins' && state.player) {
        state.player.coins = data.coins;
        render();
    }
    if (action === 'toast') toast(data.message);
});

document.getElementById('closeHint').addEventListener('click', closeUI);
document.getElementById('stashBtn').addEventListener('click', () => {
    state.tab = 'inventory';
    state.search = '';
    render();
});
document.getElementById('modeShop').addEventListener('click', () => {
    if (state.tab === 'inventory') state.tab = 'dashboard';
    render();
});
document.getElementById('modeInventory').addEventListener('click', () => {
    state.tab = 'inventory';
    state.search = '';
    render();
});
document.getElementById('headerRedeem').addEventListener('click', showRedeemModal);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeUI();
});

if (!IS_NUI) {
    openUI(mockOpen());
}
