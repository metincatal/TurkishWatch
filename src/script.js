// Tamamen Türkçe Word Clock (Kelime Saat) Mantığı

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
    "BES_MIN": [10, 8, 10],   // Satır 10: BEŞ (dakika)
    "ON_MIN": [11, 0, 1],    // Satır 11: ON (dakika)
    "YIRMI": [9, 7, 11],     // Satır 9: YİRMİ
    "CEYREK": [10, 0, 5],    // Satır 10: ÇEYREK
    "BUCUK": [4, 7, 11],     // Satır 4: BUÇUK
    "VAR": [11, 2, 4],       // Satır 11: VAR
    "GECIYOR": [11, 5, 11]   // Satır 11: GEÇİYOR
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
    10: [[0, 4, 5]], // Satır 0: ON, üst sırada kafa karışıklığını önler.
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
    9: [[9, 0, 4], [9, 6, 6]], // DOKUZ.A şeklinde yanar (matrisi hizalamak için)
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

// Birden fazla bölümden oluşan koordinat listesini yak (Örn: ON BİR, DOKUZA)
function lightUpList(list) {
    if (!list) return;
    list.forEach(item => lightUp(item));
}

// Zaman hesaplama kural motoru
function displayTime(h, m) {
    clearBoard();

    // Artık dakikalar 4 noktada gösterilecek
    const exactExtraMin = m % 5;
    const roundedMin = m - exactExtraMin; // 5'in katı olan ana blok

    // Noktaları yak
    for (let i = 1; i <= exactExtraMin; i++) {
        document.getElementById(`dot-${i}`).classList.add("active");
    }

    // 12 formatına çek
    let currentHour = h % 12;
    if (currentHour === 0) currentHour = 12;

    // Saat söylem mantığında; eğer dakika 30'u geçiyorsa hedef saat bir sonraki saattir. ("bire yirmi var")
    let targetHour = (roundedMin > 30) ? (currentHour % 12) + 1 : currentHour;

    if (roundedMin === 0) {
        // Tam saat -> SAAT [SAAT_NOM]
        lightUp(WORDS.SAAT);
        lightUpList(HOURS_NOMINATIVE[targetHour]);
    }
    else if (roundedMin === 5) {
        // 5 geçiyor -> [SAAT_ACC] BEŞ GEÇİYOR
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.GECIYOR);
    }
    else if (roundedMin === 10) {
        // 10 geçiyor -> [SAAT_ACC] ON GEÇİYOR
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.ON_MIN);
        lightUp(WORDS.GECIYOR);
    }
    else if (roundedMin === 15) {
        // Çeyrek geçiyor -> [SAAT_ACC] ÇEYREK GEÇİYOR
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.CEYREK);
        lightUp(WORDS.GECIYOR);
    }
    else if (roundedMin === 20) {
        // 20 geçiyor -> [SAAT_ACC] YİRMİ GEÇİYOR
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.GECIYOR);
    }
    else if (roundedMin === 25) {
        // 25 geçiyor -> [SAAT_ACC] YİRMİ BEŞ GEÇİYOR
        lightUpList(HOURS_ACCUSATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.GECIYOR);
    }
    else if (roundedMin === 30) {
        // Buçuk -> SAAT [SAAT_NOM] BUÇUK
        lightUp(WORDS.SAAT);
        lightUpList(HOURS_NOMINATIVE[targetHour]);
        lightUp(WORDS.BUCUK);
    }
    else if (roundedMin === 35) {
        // 25 var -> [SAAT_DAT] YİRMİ BEŞ VAR
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.VAR);
    }
    else if (roundedMin === 40) {
        // 20 var -> [SAAT_DAT] YİRMİ VAR
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.YIRMI);
        lightUp(WORDS.VAR);
    }
    else if (roundedMin === 45) {
        // Çeyrek var -> [SAAT_DAT] ÇEYREK VAR
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.CEYREK);
        lightUp(WORDS.VAR);
    }
    else if (roundedMin === 50) {
        // 10 var -> [SAAT_DAT] ON VAR
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.ON_MIN);
        lightUp(WORDS.VAR);
    }
    else if (roundedMin === 55) {
        // 5 var -> [SAAT_DAT] BEŞ VAR
        lightUpList(HOURS_DATIVE[targetHour]);
        lightUp(WORDS.BES_MIN);
        lightUp(WORDS.VAR);
    }
}

// Initial setup
initializeGrid();

const inputElement = document.getElementById("timeInput");

// O anki saati al ve input'a yaz, grid'i güncelle
const now = new Date();
const currentHStr = String(now.getHours()).padStart(2, '0');
const currentMStr = String(now.getMinutes()).padStart(2, '0');
inputElement.value = `${currentHStr}:${currentMStr}`;
displayTime(now.getHours(), now.getMinutes());

// Input değiştiğinde grid'i güncelle
inputElement.addEventListener("input", (e) => {
    const timeVal = e.target.value;
    if (timeVal) {
        const [hStr, mStr] = timeVal.split(":");
        displayTime(parseInt(hStr, 10), parseInt(mStr, 10));
    }
});
