// Tamamen Türkçe Word Clock (Kelime Saat) Mantığı

// ============================================
// TEMA SİSTEMİ - Taş Dokuları
// ============================================

const THEMES = [
    { id: 'stone-bg',       src: 'images/stone-bg.png',       name: 'Yeşil Mermer' },
    { id: 'siyah-mermer',   src: 'images/siyah-mermer.png',   name: 'Siyah Mermer' },
    { id: 'kirmizi-jasper', src: 'images/kirmizi-jasper.png', name: 'Kırmızı Jasper' }
];

let currentTheme = 'siyah-mermer';

function applyTheme(themeId) {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;
    currentTheme = themeId;

    document.querySelector('.stone-surface').style.backgroundImage = `url('${theme.src}')`;

    document.querySelectorAll('.theme-thumb').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === themeId);
    });
}

function initThemeStrip() {
    const strip = document.getElementById('themeStrip');
    THEMES.forEach(theme => {
        const thumb = document.createElement('div');
        thumb.className = 'theme-thumb';
        thumb.dataset.theme = theme.id;
        thumb.title = theme.name;
        thumb.innerHTML = `<img src="${theme.src}" alt="${theme.name}">`;
        thumb.addEventListener('click', () => {
            applyTheme(theme.id);
            openLightbox(theme.src, theme.name);
        });
        strip.appendChild(thumb);
    });
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxLabel = document.getElementById('lightboxLabel');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, name) {
    lightboxImg.src = src;
    lightboxLabel.textContent = name || '';
    lightbox.classList.add('open');
}

lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    lightbox.classList.remove('open');
});

lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
lightboxImg.addEventListener('click', (e) => e.stopPropagation());

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
});

// ============================================
// SAAT MANTIGI
// ============================================

const gridRows = [
    "SAATONUONAVE",
    "BİRİBİREÜÇÜM",
    "ÜÇEİKİYİDÖRT",
    "İKİYEDÖRDÜSE",
    "DÖRDEVEBUÇUK",
    "BEŞİBEŞEVAKT",
    "ALTIYIALTIYA",
    "YEDİYİYEDİYE",
    "SEKİZİSEKİZE",
    "DOKUZUAYİRMİ",
    "ÇEYREKVEBEŞT",
    "ONVARGEÇİYOR",
];

const WORDS = {
    "SAAT": [0, 0, 3],
    "BES_MIN": [10, 8, 10],
    "ON_MIN": [11, 0, 1],
    "YIRMI": [9, 7, 11],
    "CEYREK": [10, 0, 5],
    "BUCUK": [4, 7, 11],
    "VAR": [11, 2, 4],
    "GECIYOR": [11, 5, 11]
};

const HOURS_NOMINATIVE = {
    1: [[1, 0, 2]], 2: [[2, 3, 5]], 3: [[1, 8, 9]], 4: [[2, 8, 11]],
    5: [[5, 0, 2]], 6: [[6, 0, 3]], 7: [[7, 0, 3]], 8: [[8, 0, 4]],
    9: [[9, 0, 4]], 10: [[0, 4, 5]], 11: [[0, 4, 5], [1, 0, 2]], 12: [[0, 4, 5], [2, 3, 5]]
};

const HOURS_ACCUSATIVE = {
    1: [[1, 0, 3]], 2: [[2, 3, 7]], 3: [[1, 8, 10]], 4: [[3, 5, 9]],
    5: [[5, 0, 3]], 6: [[6, 0, 5]], 7: [[7, 0, 5]], 8: [[8, 0, 5]],
    9: [[9, 0, 5]], 10: [[0, 4, 6]], 11: [[0, 4, 5], [1, 0, 3]], 12: [[0, 4, 5], [2, 3, 7]]
};

const HOURS_DATIVE = {
    1: [[1, 4, 7]], 2: [[3, 0, 4]], 3: [[2, 0, 2]], 4: [[4, 0, 4]],
    5: [[5, 4, 7]], 6: [[6, 6, 11]], 7: [[7, 6, 11]], 8: [[8, 6, 11]],
    9: [[9, 0, 4], [9, 6, 6]], 10: [[0, 7, 9]], 11: [[0, 4, 5], [1, 4, 7]], 12: [[0, 4, 5], [3, 0, 4]]
};

const gridElement = document.getElementById("grid");

function initializeGrid() {
    gridElement.innerHTML = '';
    for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
            const span = document.createElement("span");
            span.className = "letter";
            span.id = `l_${r}_${c}`;
            span.textContent = gridRows[r][c];
            gridElement.appendChild(span);
        }
    }
}

function clearBoard() {
    document.querySelectorAll(".letter.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".dot.active").forEach(el => el.classList.remove("active"));
}

function lightUp(coords) {
    if (!coords || coords.length !== 3) return;
    const [r, start, end] = coords;
    for (let c = start; c <= end; c++) {
        const el = document.getElementById(`l_${r}_${c}`);
        if (el) el.classList.add("active");
    }
}

function lightUpList(list) {
    if (!list) return;
    list.forEach(item => lightUp(item));
}

function displayTime(h, m) {
    clearBoard();

    let baseMin;
    let dotCount = 0;

    if (m === 0) {
        baseMin = 0;
        dotCount = 0;
    } else if (m <= 30) {
        baseMin = m - (m % 5);
        dotCount = m % 5;
    } else {
        if (m % 5 === 0) {
            baseMin = m;
            dotCount = 0;
        } else {
            baseMin = Math.ceil(m / 5) * 5;
            dotCount = baseMin - m;
        }
    }

    for (let i = 1; i <= dotCount; i++) {
        document.getElementById(`dot-${i}`).classList.add("active");
    }

    let currentHour = h % 12;
    if (currentHour === 0) currentHour = 12;
    let targetHour = (m > 30) ? (currentHour % 12) + 1 : currentHour;

    if (baseMin === 0) {
        if (dotCount > 0) {
            lightUpList(HOURS_ACCUSATIVE[targetHour]);
            lightUp(WORDS.GECIYOR);
        } else {
            lightUp(WORDS.SAAT);
            lightUpList(HOURS_NOMINATIVE[targetHour]);
        }
    }
    else if (baseMin === 5) { lightUpList(HOURS_ACCUSATIVE[targetHour]); lightUp(WORDS.BES_MIN); lightUp(WORDS.GECIYOR); }
    else if (baseMin === 10) { lightUpList(HOURS_ACCUSATIVE[targetHour]); lightUp(WORDS.ON_MIN); lightUp(WORDS.GECIYOR); }
    else if (baseMin === 15) { lightUpList(HOURS_ACCUSATIVE[targetHour]); lightUp(WORDS.CEYREK); lightUp(WORDS.GECIYOR); }
    else if (baseMin === 20) { lightUpList(HOURS_ACCUSATIVE[targetHour]); lightUp(WORDS.YIRMI); lightUp(WORDS.GECIYOR); }
    else if (baseMin === 25) { lightUpList(HOURS_ACCUSATIVE[targetHour]); lightUp(WORDS.YIRMI); lightUp(WORDS.BES_MIN); lightUp(WORDS.GECIYOR); }
    else if (baseMin === 30) { lightUp(WORDS.SAAT); lightUpList(HOURS_NOMINATIVE[targetHour]); lightUp(WORDS.BUCUK); }
    else if (baseMin === 35) { lightUpList(HOURS_DATIVE[targetHour]); lightUp(WORDS.YIRMI); lightUp(WORDS.BES_MIN); lightUp(WORDS.VAR); }
    else if (baseMin === 40) { lightUpList(HOURS_DATIVE[targetHour]); lightUp(WORDS.YIRMI); lightUp(WORDS.VAR); }
    else if (baseMin === 45) { lightUpList(HOURS_DATIVE[targetHour]); lightUp(WORDS.CEYREK); lightUp(WORDS.VAR); }
    else if (baseMin === 50) { lightUpList(HOURS_DATIVE[targetHour]); lightUp(WORDS.ON_MIN); lightUp(WORDS.VAR); }
    else if (baseMin === 55) { lightUpList(HOURS_DATIVE[targetHour]); lightUp(WORDS.BES_MIN); lightUp(WORDS.VAR); }
    else if (baseMin === 60) { lightUpList(HOURS_DATIVE[targetHour]); lightUp(WORDS.VAR); }
}

// ============================================
// SAAT BOYUTLANDIRMA
// ============================================

function resizeClock() {
    const strip = document.querySelector('.theme-strip');
    const bottomBar = document.querySelector('.bottom-bar');
    const stripH = strip.offsetHeight;
    const barH = bottomBar.offsetHeight;
    const gaps = 12 * 2;
    const pad = 32;
    const availableH = window.innerHeight - stripH - barH - gaps - pad;
    const availableW = window.innerWidth - 40;

    const size = Math.min(availableH, availableW, 580);
    const surface = document.querySelector('.stone-surface');
    surface.style.width = size + 'px';

    const fontSize = size * 0.032;
    document.querySelectorAll('.letter').forEach(el => {
        el.style.fontSize = fontSize + 'px';
    });
}

// ============================================
// BAŞLATMA
// ============================================

initializeGrid();
initThemeStrip();
applyTheme(currentTheme);
resizeClock();
window.addEventListener('resize', resizeClock);

const inputElement = document.getElementById("timeInput");

// Drum picker state (erken tanımla - updateClock tarafından da kullanılır)
const DRUM_ITEM_H = 36;
let drumH = 0;
let drumM = 0;

function updateClock() {
    const n = new Date();
    const h = n.getHours();
    const m = n.getMinutes();
    inputElement.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    displayTime(h, m);
    drumH = h;
    drumM = m;
    drumSetSelection(document.getElementById('drumHrScroller'), h);
    drumSetSelection(document.getElementById('drumMinScroller'), m);
}

let userOverride = false;
updateClock();

setInterval(() => {
    if (!userOverride) updateClock();
}, 15000);

inputElement.addEventListener("input", (e) => {
    const timeVal = e.target.value;
    if (timeVal) {
        userOverride = true;
        const [hStr, mStr] = timeVal.split(":");
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        displayTime(h, m);
        drumSetSelection(document.getElementById('drumHrScroller'), h);
        drumSetSelection(document.getElementById('drumMinScroller'), m);
        setTimeout(() => { userOverride = false; }, 60000);
    }
});

// ============================================
// DRUM PICKER (Mobil)
// ============================================

function drumBuild(scroller, count, pad) {
    scroller.innerHTML = '';
    // Üst boşluk (1 item yüksekliğinde)
    const top = document.createElement('div');
    top.className = 'drum-item';
    scroller.appendChild(top);

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'drum-item';
        div.textContent = pad ? String(i).padStart(2, '0') : i;
        div.dataset.val = i;
        scroller.appendChild(div);
    }

    // Alt boşluk
    const bot = document.createElement('div');
    bot.className = 'drum-item';
    scroller.appendChild(bot);
}

function drumSetSelection(scroller, val) {
    scroller.style.transform = `translateY(${-(val * DRUM_ITEM_H)}px)`;
    scroller.querySelectorAll('.drum-item').forEach((el, i) => {
        el.classList.remove('selected', 'near');
        const realI = i - 1;
        if (realI === val) el.classList.add('selected');
        else if (Math.abs(realI - val) === 1) el.classList.add('near');
    });
}

function drumInitInteraction(col, scroller, maxVal, onChange) {
    let startY = 0, startTranslate = 0, isDragging = false;

    function getTranslateY() {
        const t = scroller.style.transform;
        if (!t) return 0;
        const m = t.match(/translateY\((-?[\d.]+)px\)/);
        return m ? parseFloat(m[1]) : 0;
    }

    function snapToNearest(currentY) {
        const clamped = Math.min(0, Math.max(-((maxVal - 1) * DRUM_ITEM_H), currentY));
        const idx = Math.round(-clamped / DRUM_ITEM_H);
        scroller.style.transition = 'transform 0.2s ease';
        drumSetSelection(scroller, idx);
        onChange(idx);
        setTimeout(() => { scroller.style.transition = ''; }, 250);
    }

    col.addEventListener('touchstart', (e) => {
        isDragging = true;
        startY = e.touches[0].clientY;
        startTranslate = getTranslateY();
        scroller.style.transition = 'none';
    }, { passive: true });

    col.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dy = e.touches[0].clientY - startY;
        const newY = startTranslate + dy;
        scroller.style.transform = `translateY(${newY}px)`;
        const currentVal = Math.round(-newY / DRUM_ITEM_H);
        scroller.querySelectorAll('.drum-item').forEach((el, i) => {
            el.classList.remove('selected', 'near');
            const realI = i - 1;
            if (realI === currentVal) el.classList.add('selected');
            else if (Math.abs(realI - currentVal) === 1) el.classList.add('near');
        });
    }, { passive: true });

    col.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const dy = e.changedTouches[0].clientY - startY;
        snapToNearest(startTranslate + dy);
    }, { passive: true });
}

// Drum başlatma

drumBuild(document.getElementById('drumHrScroller'), 24, false);
drumBuild(document.getElementById('drumMinScroller'), 60, true);
drumSetSelection(document.getElementById('drumHrScroller'), drumH);
drumSetSelection(document.getElementById('drumMinScroller'), drumM);

drumInitInteraction(
    document.getElementById('drumHrCol'),
    document.getElementById('drumHrScroller'),
    24,
    (val) => {
        drumH = val;
        userOverride = true;
        inputElement.value = `${String(drumH).padStart(2, '0')}:${String(drumM).padStart(2, '0')}`;
        displayTime(drumH, drumM);
        setTimeout(() => { userOverride = false; }, 60000);
    }
);

drumInitInteraction(
    document.getElementById('drumMinCol'),
    document.getElementById('drumMinScroller'),
    60,
    (val) => {
        drumM = val;
        userOverride = true;
        inputElement.value = `${String(drumH).padStart(2, '0')}:${String(drumM).padStart(2, '0')}`;
        displayTime(drumH, drumM);
        setTimeout(() => { userOverride = false; }, 60000);
    }
);
