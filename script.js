import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, query, collection, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAhNw4ItEmcUWnvd5U9neCPCzmP86qxZpI",
    authDomain: "studio-6734762811-c1c00.firebaseapp.com",
    projectId: "studio-6734762811-c1c00",
    storageBucket: "studio-6734762811-c1c00.firebasestorage.app",
    messagingSenderId: "267087308367",
    appId: "1:267087308367:web:8cd696bb71e45595292c3a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// State
let currentBoxId = null;
let currentUserId = 'Tayler';
let boxTier = 'bronze';
let masterState = null;
let lootConfig = null;

// DOM refs
const $ = id => document.getElementById(id);

// Tier color schemes
const TIERS = {
    bronze: { color: '#cd7f32', glow: 'rgba(205,127,50,0.3)', name: 'BRONZE', emoji: '🥉' },
    silver: { color: '#c0c0c0', glow: 'rgba(192,192,192,0.3)', name: 'SILVER', emoji: '🥈' },
    gold:   { color: '#ffd700', glow: 'rgba(255,215,0,0.35)',  name: 'GOLD',   emoji: '🥇' }
};

async function init() {
    console.log("Lade Lootbox-Daten...");

    const params = new URLSearchParams(window.location.search);
    currentBoxId = params.get('boxId');
    currentUserId = params.get('userId') || 'Tayler';

    try {
        await fetchMasterState();
        await fetchLootConfig();

        if (!masterState) throw new Error("Kein Benutzer-Status gefunden.");

        // MASTER-LINK LOGIK: Index-freie Abfrage (Filter & Sort im JS)
        if (!currentBoxId) {
            const q = query(
                collection(db, 'pending_lootboxes'),
                where('userId', '==', currentUserId)
            );
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
                // Filtere nur 'pending' und sortiere nach Zeitstempel absteigend
                const pendingBoxes = querySnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(box => box.status === 'pending')
                    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

                if (pendingBoxes.length > 0) {
                    currentBoxId = pendingBoxes[0].id;
                }
            }
        }

        if (currentBoxId) {
            await fetchBoxDetails();
        } else {
            showNoBoxScreen();
        }

        updateUserHUD();
        const overlay = $('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    } catch (error) {
        console.error("Init failed:", error);
        const overlay = $('loading-overlay');
        if (overlay) overlay.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <p style="color:#ff6e84;font-weight:bold;">FEHLER BEIM LADEN</p>
                <p style="color:#aaaab7;font-size:12px;margin-top:8px;">${error.message}</p>
            </div>`;
    }
}

async function fetchMasterState() {
    const snap = await getDoc(doc(db, 'states', 'master'));
    if (snap.exists()) masterState = snap.data().state;
}

async function fetchLootConfig() {
    const snap = await getDoc(doc(db, 'lootbox_config', 'settings'));
    if (snap.exists()) lootConfig = snap.data();
}

async function fetchBoxDetails() {
    if (currentBoxId === 'test-box') return;
    const snap = await getDoc(doc(db, 'pending_lootboxes', currentBoxId));
    if (snap.exists() && snap.data().status === 'opened') {
        showNoBoxScreen("Diese Box wurde bereits geöffnet! Warte auf die nächste Belohnung.");
    }
}

function showNoBoxScreen(customMsg) {
    const boxScreen = $('box-screen');
    const noBoxScreen = $('no-box-screen');
    if (boxScreen) boxScreen.classList.add('hidden');
    if (noBoxScreen) {
        noBoxScreen.classList.remove('hidden');
        noBoxScreen.classList.add('flex');
        if (customMsg) {
            const p = noBoxScreen.querySelector('p');
            if (p) p.innerText = customMsg;
        }
    }
}

function updateBoxUI(tier) {
    boxTier = tier;
    const t = TIERS[tier] || TIERS.bronze;

    // Title accent
    const accent = $('tier-title-accent');
    if (accent) accent.style.color = t.color;

    // Tier label
    const label = $('box-tier-label');
    if (label) { label.innerText = `${t.emoji} Tier: ${t.name}`; label.style.color = t.color; }

    // Box glow
    const glow = $('box-glow');
    if (glow) glow.style.background = `radial-gradient(circle, ${t.glow}, transparent)`;

    // Box border & shadow
    const box = $('box-case');
    if (box) { box.style.borderColor = t.color + '40'; box.style.boxShadow = `0 0 50px -10px ${t.glow}`; }

    // Icon color
    const icon = $('box-icon');
    if (icon) { icon.style.color = t.color; icon.style.filter = `drop-shadow(0 0 25px ${t.color})`; }

    // Badge
    const badge = $('box-tier-badge');
    if (badge) {
        badge.innerText = `${t.name} CASE`;
        badge.style.color = t.color;
        badge.style.background = t.color + '20';
        badge.style.borderColor = t.color + '50';
    }

    // Opening screen elements
    ['burst-ring-1','burst-ring-2'].forEach(id => { const e = $(id); if(e) e.style.borderColor = t.color; });
    const core = $('burst-core'); if(core) core.style.background = t.color;
    const bIcon = $('burst-icon'); if(bIcon) bIcon.style.color = t.color;
    const bName = $('burst-tier-name'); if(bName) { bName.innerText = t.name; bName.style.color = t.color; }
}

function updateUserHUD() {
    if (!masterState?.users) return;
    const user = masterState.users[currentUserId];
    if (!user) return;
    const nameEl = $('user-name');
    const xpEl = $('user-xp-label');
    const avatarEl = $('user-avatar');
    if (nameEl) nameEl.innerText = user.name;
    if (xpEl) xpEl.innerText = `LVL ${Math.min(100, Math.floor(Math.sqrt((user.xp||0) / 50)) + 1)} // ${user.xp||0} XP`;
    if (avatarEl) avatarEl.src = user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`;
}

// ---- BURST ANIMATION ----

function runBurstAnimation() {
    return new Promise(resolve => {
        const ring1 = $('burst-ring-1');
        const ring2 = $('burst-ring-2');
        const core = $('burst-core');
        const icon = $('burst-icon');
        const title = $('burst-title');

        // Reset
        [ring1, ring2].forEach(r => { if(r) { r.style.transition = 'none'; r.style.transform = 'scale(0)'; r.style.opacity = '0'; }});
        if(core) { core.style.transition = 'none'; core.style.transform = 'scale(0.5)'; core.style.opacity = '0'; }
        if(icon) { icon.style.transition = 'none'; icon.style.transform = 'scale(0.3)'; icon.style.opacity = '0'; }
        if(title) { title.style.transition = 'none'; title.style.transform = 'translateY(30px)'; title.style.opacity = '0'; }

        // Force reflow
        void document.body.offsetHeight;

        // Phase 1: Core appears (0ms)
        setTimeout(() => {
            if(core) { core.style.transition = 'all 0.6s ease-out'; core.style.transform = 'scale(1)'; core.style.opacity = '0.8'; }
        }, 100);

        // Phase 2: Ring 1 expands (400ms)
        setTimeout(() => {
            if(ring1) { ring1.style.transition = 'all 1s ease-out'; ring1.style.transform = 'scale(6)'; ring1.style.opacity = '0.6'; }
        }, 400);

        // Phase 3: Ring 2 expands (600ms)
        setTimeout(() => {
            if(ring2) { ring2.style.transition = 'all 1.2s ease-out'; ring2.style.transform = 'scale(8)'; ring2.style.opacity = '0'; }
        }, 600);

        // Phase 4: Icon pops in (800ms)
        setTimeout(() => {
            if(icon) { icon.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'; icon.style.transform = 'scale(1)'; icon.style.opacity = '1'; }
        }, 800);

        // Phase 5: Title slides up (1200ms)
        setTimeout(() => {
            if(title) { title.style.transition = 'all 0.6s ease-out'; title.style.transform = 'translateY(0)'; title.style.opacity = '1'; }
        }, 1200);

        // Phase 6: Rings fade out, resolve (2500ms)
        setTimeout(() => {
            if(ring1) { ring1.style.transition = 'opacity 0.5s'; ring1.style.opacity = '0'; }
            resolve();
        }, 2500);
    });
}

// ---- LOOTBOX OPENING ----

function rollRandomTier() {
    const roll = Math.random() * 100;
    const settings = lootConfig?.tierSettings || { bronze: 60, silver: 30, gold: 10 };
    
    // Wir prüfen von Gold nach Bronze
    if (roll < settings.gold) return 'gold';
    if (roll < (settings.gold + settings.silver)) return 'silver';
    return 'bronze';
}

async function openLootbox() {
    if (!masterState) return;
    const ready = $('screen-ready');
    const opening = $('screen-opening');
    const revealed = $('screen-revealed');

    // SURPRISE: Roll the tier NOW
    boxTier = rollRandomTier();
    updateBoxUI(boxTier); // Colors the burst animation elements

    if (ready) ready.classList.add('hidden');
    if (opening) opening.classList.remove('hidden');

    // Run burst animation (now in the correct tier color)
    await runBurstAnimation();

    try {
        const results = generateResults();
        displayRewards(results);
        if (opening) opening.classList.add('hidden');
        if (revealed) revealed.classList.remove('hidden');
        await syncResultsWithApp(results);
    } catch (err) {
        console.error("Opening failed:", err);
        if (ready) ready.classList.remove('hidden');
        if (opening) opening.classList.add('hidden');
    }

}

function generateResults() {
    const tasks = [];
    const templates = masterState.taskTemplates || [];
    const previousTasks = masterState.tasks || [];

    const allowedIds = (lootConfig?.tasks?.[currentUserId])
        ? lootConfig.tasks[currentUserId]
        : templates.map(t => t.id);

    const pool = templates.filter(t => allowedIds.includes(t.id));
    const effectivePool = pool.length > 0 ? pool : templates;

    // Skipped task from yesterday
    const skipped = previousTasks.find(t =>
        t.zugewiesenerNutzer === currentUserId && t.status === 'skipped'
    );
    if (skipped) {
        tasks.push({ ...skipped, id: 'r-' + Date.now(), status: 'offen', isResumed: true });
    }

    // Fill up to 3
    let safety = 0;
    while (tasks.length < 3 && safety < 50) {
        safety++;
        const rand = effectivePool[Math.floor(Math.random() * effectivePool.length)];
        if (!tasks.find(t => t.titel === rand.titel)) {
            tasks.push({
                ...rand,
                id: 'n-' + Date.now() + '-' + safety,
                zugewiesenerNutzer: currentUserId,
                wochentag: "Heute",
                status: 'offen',
                erstelltAm: Date.now(),
                kommentare: []
            });
        }
        if (tasks.length >= effectivePool.length) break;
    }

    // Power-up
    const puPool = lootConfig?.powerups?.length > 0 ? lootConfig.powerups : [
        { id: 'skip', name: 'Task Skip', desc: 'Aufgabe überspringen', icon: '⚡', probs: { bronze: 10, silver: 30, gold: 60 } }
    ];
    const powerUp = selectWeightedPowerUp(puPool, boxTier);
    return { tasks, powerUp };
}

function selectWeightedPowerUp(pool, tier) {
    const total = pool.reduce((s, p) => s + (p.probs?.[tier] || 1), 0);
    let r = Math.random() * total;
    for (const pu of pool) {
        if (r < (pu.probs?.[tier] || 1)) return pu;
        r -= (pu.probs?.[tier] || 1);
    }
    return pool[0];
}

// ---- DISPLAY REWARDS ----

function displayRewards(results) {
    const list = $('reward-list');
    if (!list) return;
    list.innerHTML = '';

    results.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = "holographic-card rounded-xl p-6 flex flex-col neon-glow-primary";
        card.innerHTML = `
            <div class="mb-6 flex justify-between items-start">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(151,169,255,0.15)">
                    <span class="material-symbols-outlined" style="color:#97a9ff;font-size:24px">${getTaskIcon(task.raum)}</span>
                </div>
                <span style="font-family:'Space Grotesk';font-weight:700;color:#97a9ff;font-size:10px;letter-spacing:0.1em">+${task.xpBelohnung} XP</span>
            </div>
            <h3 style="font-family:'Space Grotesk';font-weight:700;font-size:1.1rem;color:#f0f0fd;text-transform:uppercase;margin-bottom:8px">${task.titel}</h3>
            <p style="color:#aaaab7;font-size:12px;flex:1">${task.raum}</p>
            ${task.isResumed ? '<span style="color:#ffe792;font-size:9px;font-weight:900">⚡ STREAK MISSION</span>' : ''}
        `;
        list.appendChild(card);
    });

    const pu = results.powerUp;
    const puCard = document.createElement('div');
    puCard.style.cssText = "border:2px solid #ffe792;border-radius:12px;overflow:hidden";
    puCard.className = "neon-glow-gold";
    puCard.innerHTML = `
        <div style="background:#171924;padding:24px;display:flex;flex-direction:column;align-items:center;text-align:center;height:100%;justify-content:center">
            <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,231,146,0.15);border:1px solid rgba(255,231,146,0.4);display:flex;align-items:center;justify-content:center;margin-bottom:16px">
                <span class="material-symbols-outlined" style="color:#ffe792;font-size:32px;font-variation-settings:'FILL' 1">${pu.id === 'skip' ? 'bolt' : (pu.id === 'xpboost' ? 'rocket_launch' : 'security')}</span>
            </div>
            <h3 style="font-family:'Space Grotesk';font-weight:900;font-size:1.2rem;color:#f0f0fd;text-transform:uppercase;margin-bottom:8px">${pu.name}</h3>
            <div style="background:#ffe792;color:#1e1b4b;padding:4px 12px;border-radius:4px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em">POWER-UP</div>
        </div>
    `;
    list.appendChild(puCard);
}

function getTaskIcon(raum) {
    const map = { 'Kinderzimmer': 'child_care', 'Küche': 'restaurant', 'Wohnzimmer': 'weekend', 'Bad': 'bathtub', 'Flur': 'stairs', 'Terrasse': 'deck' };
    return map[raum] || 'assignment';
}

// ---- SYNC WITH HAUSHALTS BUDDY ----

async function syncResultsWithApp(results) {
    try {
        // Add tasks
        for (const t of results.tasks) {
            await updateDoc(doc(db, 'states', 'master'), {
                'state.tasks': arrayUnion(t)
            });
        }

        // Add power-up to user inventory
        const userPowerups = masterState.users[currentUserId]?.powerups || [];
        userPowerups.push({
            ...results.powerUp,
            status: 'available',
            earnedAt: Date.now()
        });
        await updateDoc(doc(db, 'states', 'master'), {
            [`state.users.${currentUserId}.powerups`]: userPowerups
        });

        // Mark box as opened
        if (currentBoxId !== 'test-box') {
            await updateDoc(doc(db, 'pending_lootboxes', currentBoxId), { status: 'opened' });
        }
    } catch (err) {
        console.error("Sync failed:", err);
    }
}

// ---- BOOT ----

// Module scripts are deferred, DOM is already parsed
const openBtn = $('open-button');
const claimBtn = $('claim-button');

if (openBtn) openBtn.addEventListener('click', openLootbox);
if (claimBtn) claimBtn.addEventListener('click', () => {
    claimBtn.innerText = "ANGENOMMEN ✅";
    claimBtn.disabled = true;
});

init();
