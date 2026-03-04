// Tamamen Türkçe Word Clock (Kelime Saat) Mantığı

// ============================================
// TEMA GALERİSİ
// ============================================

const GALLERY_ITEMS = [
    { src: 'images/ornek1.jpg', name: 'Yeşil Mermer' },
    { src: 'images/ornek2.jpg', name: 'Bakır Mermer' },
    { src: 'images/ornek3.jpg', name: 'Altın Mermer' },
    { src: 'images/ornek5.jpg', name: 'Ebru Sanatı' },
    { src: 'images/ornek6.jpg', name: 'Antik Parşömen' }
];

function initGallery() {
    const gallery = document.getElementById('gallery');
    GALLERY_ITEMS.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `
            <img src="${item.src}" alt="${item.name}" loading="lazy">
            <div class="gallery-card-label">${item.name}</div>
        `;
        card.addEventListener('click', () => openLightbox(item.src));
        gallery.appendChild(card);
    });
}

// Modal aç/kapa
const modalOverlay = document.getElementById('modalOverlay');
const themesBtn = document.getElementById('themesBtn');
const modalClose = document.getElementById('modalClose');

themesBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
modalClose.addEventListener('click', () => modalOverlay.classList.remove('open'));
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('open');
});

// Lightbox aç/kapa
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
    modalOverlay.classList.remove('open');
}

lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    lightbox.classList.remove('open');
});

lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
lightboxImg.addEventListener('click', (e) => e.stopPropagation());

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        lightbox.classList.remove('open');
        modalOverlay.classList.remove('open');
    }
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
    document.querySelectorAll(".corner-dot.active").forEach(el => el.classList.remove("active"));
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
// SAAT BOYUTLANDIRMA - Her cihazda aynı görünüm
// ============================================

function resizeClock() {
    const app = document.querySelector('.app');
    const frame = document.querySelector('.clock-frame');
    const bottomBar = document.querySelector('.bottom-bar');

    // Kullanılabilir yükseklik: viewport - alt bar - boşluklar
    const barHeight = bottomBar.offsetHeight;
    const gap = 16;
    const padding = 40; // app padding üst + alt
    const availableH = window.innerHeight - barHeight - gap - padding;
    const availableW = window.innerWidth - 40; // app padding sol + sağ

    // Kare saat: en küçük boyutu al
    const size = Math.min(availableH, availableW, 600);
    frame.style.width = size + 'px';
    frame.style.height = size + 'px';

    // Font boyutunu saat boyutuna göre oranla
    const gridEl = document.querySelector('.grid');
    if (gridEl) {
        const fontSize = size * 0.032;
        gridEl.style.fontSize = fontSize + 'px';
        document.querySelectorAll('.letter').forEach(el => {
            el.style.fontSize = fontSize + 'px';
        });
    }
}

// ============================================
// BAŞLATMA
// ============================================

initializeGrid();
initGallery();
resizeClock();
window.addEventListener('resize', resizeClock);

const inputElement = document.getElementById("timeInput");

function updateClock() {
    const n = new Date();
    const h = n.getHours();
    const m = n.getMinutes();
    inputElement.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    displayTime(h, m);
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
        displayTime(parseInt(hStr, 10), parseInt(mStr, 10));
        setTimeout(() => { userOverride = false; }, 60000);
    }
});
