// Tamamen Türkçe Word Clock (Kelime Saat) Mantığı

// ============================================
// TEMA SİSTEMİ
// ============================================

const THEMES = [
    {
        id: 'yesil-mermer',
        name: 'Yeşil Mermer',
        surface: 'surface-yesil-mermer',
        themeClass: '',  // varsayılan tema, özel class gerekmez
        veinAngle: '135deg'
    },
    {
        id: 'siyah-mermer',
        name: 'Siyah Granit',
        surface: 'surface-siyah-mermer',
        themeClass: 'theme-siyah-mermer',
        veinAngle: '150deg'
    },
    {
        id: 'beyaz-mermer',
        name: 'Beyaz Mermer',
        surface: 'surface-beyaz-mermer',
        themeClass: 'theme-beyaz-mermer',
        veinAngle: '120deg'
    },
    {
        id: 'labradorit',
        name: 'Labradorit',
        surface: 'surface-labradorit',
        themeClass: 'theme-labradorit',
        veinAngle: '140deg'
    },
    {
        id: 'ebru-turkuaz',
        name: 'Ebru Turkuaz',
        surface: 'surface-ebru-turkuaz',
        themeClass: 'theme-ebru-turkuaz',
        veinAngle: '160deg'
    },
    {
        id: 'ebru-bordo',
        name: 'Ebru Bordo',
        surface: 'surface-ebru-bordo',
        themeClass: 'theme-ebru-bordo',
        veinAngle: '130deg'
    },
    {
        id: 'okyanus-jaspis',
        name: 'Okyanus Jaspis',
        surface: 'surface-okyanus-jaspis',
        themeClass: 'theme-okyanus-jaspis',
        veinAngle: '145deg'
    },
    {
        id: 'ametist',
        name: 'Ametist',
        surface: 'surface-ametist',
        themeClass: 'theme-ametist',
        veinAngle: '155deg'
    },
    {
        id: 'kaplan-gozu',
        name: 'Kaplan Gözü',
        surface: 'surface-kaplan-gozu',
        themeClass: 'theme-kaplan-gozu',
        veinAngle: '125deg'
    },
    {
        id: 'ebru-cokrenkli',
        name: 'Ebru Sanatı',
        surface: 'surface-ebru-cokrenkli',
        themeClass: 'theme-ebru-cokrenkli',
        veinAngle: '170deg'
    },
    {
        id: 'gul-kuvarsi',
        name: 'Gül Kuvarsı',
        surface: 'surface-gul-kuvarsi',
        themeClass: 'theme-gul-kuvarsi',
        veinAngle: '135deg'
    },
    {
        id: 'lapis-lazuli',
        name: 'Lapis Lazuli',
        surface: 'surface-lapis-lazuli',
        themeClass: 'theme-lapis-lazuli',
        veinAngle: '140deg'
    }
];

let currentThemeId = localStorage.getItem('turkishwatch-theme') || 'yesil-mermer';

function applyTheme(themeId) {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;

    currentThemeId = themeId;
    localStorage.setItem('turkishwatch-theme', themeId);

    const surface = document.getElementById('clockSurface');
    const body = document.body;

    // Önceki tema class'larını temizle
    THEMES.forEach(t => {
        if (t.surface) surface.classList.remove(t.surface);
        if (t.themeClass) body.classList.remove(t.themeClass);
    });

    // Yeni tema uygula
    surface.classList.add(theme.surface);
    if (theme.themeClass) body.classList.add(theme.themeClass);

    // Damar açısını ayarla
    surface.style.setProperty('--vein-angle', theme.veinAngle);

    // Tema kartlarının aktif durumunu güncelle
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === themeId);
    });
}

function initThemeSelector() {
    const grid = document.getElementById('themeGrid');
    grid.innerHTML = '';

    THEMES.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.dataset.theme = theme.id;

        card.innerHTML = `
            <div class="theme-card-preview preview-${theme.id}"></div>
            <div class="theme-card-label">${theme.name}</div>
        `;

        card.addEventListener('click', () => applyTheme(theme.id));
        grid.appendChild(card);
    });
}

// ============================================
// SAAT MANTIGI
// ============================================

// 12x12 Grid Harfleri (144 karakter)
const gridRows = [
    "SAATONUONAVE", // Satır 0
    "BİRİBİREÜÇÜM", // Satır 1
    "ÜÇEİKİYİDÖRT", // Satır 2
    "İKİYEDÖRDÜSE", // Satır 3
    "DÖRDEVEBUÇUK", // Satır 4
    "BEŞİBEŞEVAKT", // Satır 5
    "ALTIYIALTIYA", // Satır 6
    "YEDİYİYEDİYE", // Satır 7
    "SEKİZİSEKİZE", // Satır 8
    "DOKUZUAYİRMİ", // Satır 9
    "ÇEYREKVEBEŞT", // Satır 10
    "ONVARGEÇİYOR", // Satır 11
];

// Sabit kelimelerin [satır, başlangıç, bitiş] koordinatları
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

// Saatler için [satır, başlangıç, bitiş] listesi
const HOURS_NOMINATIVE = {
    1: [[1, 0, 2]],
    2: [[2, 3, 5]],
    3: [[1, 8, 9]],
    4: [[2, 8, 11]],
    5: [[5, 0, 2]],
    6: [[6, 0, 3]],
    7: [[7, 0, 3]],
    8: [[8, 0, 4]],
    9: [[9, 0, 4]],
    10: [[0, 4, 5]],
    11: [[0, 4, 5], [1, 0, 2]],
    12: [[0, 4, 5], [2, 3, 5]]
};

const HOURS_ACCUSATIVE = {
    1: [[1, 0, 3]],
    2: [[2, 3, 7]],
    3: [[1, 8, 10]],
    4: [[3, 5, 9]],
    5: [[5, 0, 3]],
    6: [[6, 0, 5]],
    7: [[7, 0, 5]],
    8: [[8, 0, 5]],
    9: [[9, 0, 5]],
    10: [[0, 4, 6]],
    11: [[0, 4, 5], [1, 0, 3]],
    12: [[0, 4, 5], [2, 3, 7]]
};

const HOURS_DATIVE = {
    1: [[1, 4, 7]],
    2: [[3, 0, 4]],
    3: [[2, 0, 2]],
    4: [[4, 0, 4]],
    5: [[5, 4, 7]],
    6: [[6, 6, 11]],
    7: [[7, 6, 11]],
    8: [[8, 6, 11]],
    9: [[9, 0, 4], [9, 6, 6]],
    10: [[0, 7, 9]],
    11: [[0, 4, 5], [1, 4, 7]],
    12: [[0, 4, 5], [3, 0, 4]]
};

// Grid'i HTML'e basma
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

// Tüm ışıkları söndür
function clearBoard() {
    document.querySelectorAll(".letter.active").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".dot.active").forEach(el => el.classList.remove("active"));
}

// Belirli bir koordinatı yak
function lightUp(coords) {
    if (!coords || coords.length !== 3) return;
    const [r, start, end] = coords;
    for (let c = start; c <= end; c++) {
        const el = document.getElementById(`l_${r}_${c}`);
        if (el) el.classList.add("active");
    }
}

// Birden fazla bölümden oluşan koordinat listesini yak
function lightUpList(list) {
    if (!list) return;
    list.forEach(item => lightUp(item));
}

// Zaman hesaplama kural motoru
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

    // Noktaları yak
    for (let i = 1; i <= dotCount; i++) {
        document.getElementById(`dot-${i}`).classList.add("active");
    }

    // 12 formatına çek
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
    else if (baseMin === 5) {
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.GECIYOR);
    }
    else if (baseMin === 10) {
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.ON_MIN);
        lightUp(WORDS.GECIYOR);
    }
    else if (baseMin === 15) {
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.CEYREK);
        lightUp(WORDS.GECIYOR);
    }
    else if (baseMin === 20) {
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.GECIYOR);
    }
    else if (baseMin === 25) {
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.GECIYOR);
    }
    else if (baseMin === 30) {
        lightUp(WORDS.SAAT);
        lightUpList(HOURS_NOMINATIVE[targetHour]);
        lightUp(WORDS.BUCUK);
    }
    else if (baseMin === 35) {
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.VAR);
    }
    else if (baseMin === 40) {
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.VAR);
    }
    else if (baseMin === 45) {
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.CEYREK);
        lightUp(WORDS.VAR);
    }
    else if (baseMin === 50) {
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.ON_MIN);
        lightUp(WORDS.VAR);
    }
    else if (baseMin === 55) {
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.VAR);
    }
    else if (baseMin === 60) {
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.VAR);
    }
}

// ============================================
// BAŞLATMA
// ============================================

initializeGrid();
initThemeSelector();
applyTheme(currentThemeId);

const inputElement = document.getElementById("timeInput");

// O anki saati al ve input'a yaz, grid'i güncelle
const now = new Date();
const currentHStr = String(now.getHours()).padStart(2, '0');
const currentMStr = String(now.getMinutes()).padStart(2, '0');
inputElement.value = `${currentHStr}:${currentMStr}`;
displayTime(now.getHours(), now.getMinutes());

// Her dakika otomatik güncelleme
setInterval(() => {
    const n = new Date();
    const h = n.getHours();
    const m = n.getMinutes();
    // Sadece input değiştirilmediyse otomatik güncelle
    if (inputElement.value === `${currentHStr}:${currentMStr}` ||
        inputElement.value === `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`) {
        inputElement.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        displayTime(h, m);
    }
}, 30000);

// Input değiştiğinde grid'i güncelle
inputElement.addEventListener("input", (e) => {
    const timeVal = e.target.value;
    if (timeVal) {
        const [hStr, mStr] = timeVal.split(":");
        displayTime(parseInt(hStr, 10), parseInt(mStr, 10));
    }
});
