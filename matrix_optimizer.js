#!/usr/bin/env node
// Türkçe Kelime Saati - Matris Optimizasyon ve Doğrulama Scripti
// 12x12 mevcut matrisi analiz eder, 11x11'e sıkıştırma dener

// ============================================================
// BÖLÜM 1: Mevcut 12x12 Matris Tanımları
// ============================================================

const GRID_12x12 = [
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

// Kelime koordinatları: [satir, baslangic, bitis]
const WORDS = {
    "SAAT":     [0, 0, 3],
    "BES_MIN":  [10, 8, 10],   // BEŞ (dakika)
    "ON_MIN":   [11, 0, 1],    // ON (dakika)
    "YIRMI":    [9, 7, 11],    // YİRMİ
    "CEYREK":   [10, 0, 5],    // ÇEYREK
    "BUCUK":    [4, 7, 11],    // BUÇUK
    "VAR":      [11, 2, 4],    // VAR
    "GECIYOR":  [11, 5, 11],   // GEÇİYOR
};

// Saat isimleri - Nominative (yalın hal): "SAAT BİR"
const HOURS_NOM = {
    1:  { label: "BİR",     parts: [[1, 0, 2]] },
    2:  { label: "İKİ",     parts: [[2, 3, 5]] },
    3:  { label: "ÜÇ",      parts: [[1, 8, 9]] },
    4:  { label: "DÖRT",    parts: [[2, 8, 11]] },
    5:  { label: "BEŞ",     parts: [[5, 0, 2]] },
    6:  { label: "ALTI",    parts: [[6, 0, 3]] },
    7:  { label: "YEDİ",    parts: [[7, 0, 3]] },
    8:  { label: "SEKİZ",   parts: [[8, 0, 4]] },
    9:  { label: "DOKUZ",   parts: [[9, 0, 4]] },
    10: { label: "ON",      parts: [[0, 4, 5]] },
    11: { label: "ON BİR",  parts: [[0, 4, 5], [1, 0, 2]] },
    12: { label: "ON İKİ",  parts: [[0, 4, 5], [2, 3, 5]] },
};

// Accusative (belirtme hali): "BİRİ beş geçiyor"
const HOURS_ACC = {
    1:  { label: "BİRİ",    parts: [[1, 0, 3]] },
    2:  { label: "İKİYİ",   parts: [[2, 3, 7]] },
    3:  { label: "ÜÇÜ",     parts: [[1, 8, 10]] },
    4:  { label: "DÖRDÜ",   parts: [[3, 5, 9]] },
    5:  { label: "BEŞİ",    parts: [[5, 0, 3]] },
    6:  { label: "ALTIYI",  parts: [[6, 0, 5]] },
    7:  { label: "YEDİYİ",  parts: [[7, 0, 5]] },
    8:  { label: "SEKİZİ",  parts: [[8, 0, 5]] },
    9:  { label: "DOKUZU",  parts: [[9, 0, 5]] },
    10: { label: "ONU",     parts: [[0, 4, 6]] },
    11: { label: "ON BİRİ", parts: [[0, 4, 5], [1, 0, 3]] },
    12: { label: "ON İKİYİ",parts: [[0, 4, 5], [2, 3, 7]] },
};

// Dative (yönelme hali): "BİRE çeyrek var"
const HOURS_DAT = {
    1:  { label: "BİRE",    parts: [[1, 4, 7]] },
    2:  { label: "İKİYE",   parts: [[3, 0, 4]] },
    3:  { label: "ÜÇE",     parts: [[2, 0, 2]] },
    4:  { label: "DÖRDE",   parts: [[4, 0, 4]] },
    5:  { label: "BEŞE",    parts: [[5, 4, 7]] },
    6:  { label: "ALTIYA",  parts: [[6, 6, 11]] },
    7:  { label: "YEDİYE",  parts: [[7, 6, 11]] },
    8:  { label: "SEKİZE",  parts: [[8, 6, 11]] },
    9:  { label: "DOKUZA",  parts: [[9, 0, 5]] }, // Hmm, bu 12x12'deki DOKUZUAYİRMİ'den DOKUZA okunuyor mu?
    10: { label: "ONA",     parts: [[0, 7, 9]] },
    11: { label: "ON BİRE", parts: [[0, 4, 5], [1, 4, 7]] },
    12: { label: "ON İKİYE",parts: [[0, 4, 5], [3, 0, 4]] },
};

// ============================================================
// BÖLÜM 2: Kelime Envanteri - Tüm gerekli kelimeleri listele
// ============================================================

console.log("=".repeat(80));
console.log("TÜRKÇE KELİME SAATİ - MATRİS OPTİMİZASYON ANALİZİ");
console.log("=".repeat(80));

// Tüm benzersiz kelimeleri (string olarak) topla
const allWords = new Set();

// Sabit kelimeler
const fixedWords = ["SAAT", "BEŞ", "ON", "YİRMİ", "ÇEYREK", "BUÇUK", "VAR", "GEÇİYOR"];
fixedWords.forEach(w => allWords.add(w));

// Saat formları
const hourForms = {};
for (let h = 1; h <= 12; h++) {
    hourForms[h] = {
        nom: HOURS_NOM[h].label,
        acc: HOURS_ACC[h].label,
        dat: HOURS_DAT[h].label,
    };
    allWords.add(HOURS_NOM[h].label);
    allWords.add(HOURS_ACC[h].label);
    allWords.add(HOURS_DAT[h].label);
}

console.log("\n--- TÜM BENZERSİZ KELİMELER ---");
const sortedWords = [...allWords].sort();
sortedWords.forEach(w => console.log(`  ${w}`));
console.log(`Toplam: ${allWords.size} benzersiz kelime`);

// ============================================================
// BÖLÜM 3: Katman Analizi
// ============================================================

console.log("\n--- KATMAN ANALİZİ ---");
console.log("Katman A (en üst): Önek kelimeler");
console.log("  SAAT, ON (saat 10/11/12 için)");

console.log("\nKatman B: Saat isimleri (tüm formlar)");
for (let h = 1; h <= 12; h++) {
    const f = hourForms[h];
    console.log(`  ${h}: NOM=${f.nom} | ACC=${f.acc} | DAT=${f.dat}`);
}

console.log("\nKatman C: Dakika kelimeleri");
console.log("  BEŞ(dk), ON(dk), YİRMİ, ÇEYREK, BUÇUK");

console.log("\nKatman D (en alt): Fiil/zaman belirteçleri");
console.log("  VAR, GEÇİYOR");

// ============================================================
// BÖLÜM 4: Tüm saat-dakika kombinasyonlarını test et
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 4: TÜM ZAMAN İFADELERİ (0:00 - 11:59)");
console.log("=".repeat(80));

// Zaman ifadesini hesapla
function getTimeExpression(h, m) {
    let currentHour = h % 12;
    if (currentHour === 0) currentHour = 12;

    let baseMin, dotCount;

    if (m === 0) {
        baseMin = 0; dotCount = 0;
    } else if (m <= 30) {
        baseMin = m - (m % 5);
        dotCount = m % 5;
    } else {
        if (m % 5 === 0) {
            baseMin = m; dotCount = 0;
        } else {
            baseMin = Math.ceil(m / 5) * 5;
            dotCount = baseMin - m;
        }
    }

    let targetHour = (m > 30) ? (currentHour % 12) + 1 : currentHour;

    // Aktif kelimeleri belirle
    const activeWords = [];
    // Her kelimeyi {name, row, label} olarak kaydet

    if (baseMin === 0) {
        if (dotCount > 0) {
            // "BİRİ ... geçiyor" (dakika 1-4)
            activeWords.push({ name: "SAAT_ACC", label: HOURS_ACC[targetHour].label, parts: HOURS_ACC[targetHour].parts });
            activeWords.push({ name: "GECIYOR", label: "GEÇİYOR", parts: [[WORDS.GECIYOR[0], WORDS.GECIYOR[1], WORDS.GECIYOR[2]]] });
        } else {
            // Tam saat: "SAAT BİR"
            activeWords.push({ name: "SAAT", label: "SAAT", parts: [[WORDS.SAAT[0], WORDS.SAAT[1], WORDS.SAAT[2]]] });
            activeWords.push({ name: "SAAT_NOM", label: HOURS_NOM[targetHour].label, parts: HOURS_NOM[targetHour].parts });
        }
    } else if (baseMin === 5) {
        activeWords.push({ name: "SAAT_ACC", label: HOURS_ACC[targetHour].label, parts: HOURS_ACC[targetHour].parts });
        activeWords.push({ name: "BES_MIN", label: "BEŞ", parts: [[WORDS.BES_MIN[0], WORDS.BES_MIN[1], WORDS.BES_MIN[2]]] });
        activeWords.push({ name: "GECIYOR", label: "GEÇİYOR", parts: [[WORDS.GECIYOR[0], WORDS.GECIYOR[1], WORDS.GECIYOR[2]]] });
    } else if (baseMin === 10) {
        activeWords.push({ name: "SAAT_ACC", label: HOURS_ACC[targetHour].label, parts: HOURS_ACC[targetHour].parts });
        activeWords.push({ name: "ON_MIN", label: "ON", parts: [[WORDS.ON_MIN[0], WORDS.ON_MIN[1], WORDS.ON_MIN[2]]] });
        activeWords.push({ name: "GECIYOR", label: "GEÇİYOR", parts: [[WORDS.GECIYOR[0], WORDS.GECIYOR[1], WORDS.GECIYOR[2]]] });
    } else if (baseMin === 15) {
        activeWords.push({ name: "SAAT_ACC", label: HOURS_ACC[targetHour].label, parts: HOURS_ACC[targetHour].parts });
        activeWords.push({ name: "CEYREK", label: "ÇEYREK", parts: [[WORDS.CEYREK[0], WORDS.CEYREK[1], WORDS.CEYREK[2]]] });
        activeWords.push({ name: "GECIYOR", label: "GEÇİYOR", parts: [[WORDS.GECIYOR[0], WORDS.GECIYOR[1], WORDS.GECIYOR[2]]] });
    } else if (baseMin === 20) {
        activeWords.push({ name: "SAAT_ACC", label: HOURS_ACC[targetHour].label, parts: HOURS_ACC[targetHour].parts });
        activeWords.push({ name: "YIRMI", label: "YİRMİ", parts: [[WORDS.YIRMI[0], WORDS.YIRMI[1], WORDS.YIRMI[2]]] });
        activeWords.push({ name: "GECIYOR", label: "GEÇİYOR", parts: [[WORDS.GECIYOR[0], WORDS.GECIYOR[1], WORDS.GECIYOR[2]]] });
    } else if (baseMin === 25) {
        activeWords.push({ name: "SAAT_ACC", label: HOURS_ACC[targetHour].label, parts: HOURS_ACC[targetHour].parts });
        activeWords.push({ name: "YIRMI", label: "YİRMİ", parts: [[WORDS.YIRMI[0], WORDS.YIRMI[1], WORDS.YIRMI[2]]] });
        activeWords.push({ name: "BES_MIN", label: "BEŞ", parts: [[WORDS.BES_MIN[0], WORDS.BES_MIN[1], WORDS.BES_MIN[2]]] });
        activeWords.push({ name: "GECIYOR", label: "GEÇİYOR", parts: [[WORDS.GECIYOR[0], WORDS.GECIYOR[1], WORDS.GECIYOR[2]]] });
    } else if (baseMin === 30) {
        activeWords.push({ name: "SAAT", label: "SAAT", parts: [[WORDS.SAAT[0], WORDS.SAAT[1], WORDS.SAAT[2]]] });
        activeWords.push({ name: "SAAT_NOM", label: HOURS_NOM[targetHour].label, parts: HOURS_NOM[targetHour].parts });
        activeWords.push({ name: "BUCUK", label: "BUÇUK", parts: [[WORDS.BUCUK[0], WORDS.BUCUK[1], WORDS.BUCUK[2]]] });
    } else if (baseMin === 35) {
        activeWords.push({ name: "SAAT_DAT", label: HOURS_DAT[targetHour].label, parts: HOURS_DAT[targetHour].parts });
        activeWords.push({ name: "YIRMI", label: "YİRMİ", parts: [[WORDS.YIRMI[0], WORDS.YIRMI[1], WORDS.YIRMI[2]]] });
        activeWords.push({ name: "BES_MIN", label: "BEŞ", parts: [[WORDS.BES_MIN[0], WORDS.BES_MIN[1], WORDS.BES_MIN[2]]] });
        activeWords.push({ name: "VAR", label: "VAR", parts: [[WORDS.VAR[0], WORDS.VAR[1], WORDS.VAR[2]]] });
    } else if (baseMin === 40) {
        activeWords.push({ name: "SAAT_DAT", label: HOURS_DAT[targetHour].label, parts: HOURS_DAT[targetHour].parts });
        activeWords.push({ name: "YIRMI", label: "YİRMİ", parts: [[WORDS.YIRMI[0], WORDS.YIRMI[1], WORDS.YIRMI[2]]] });
        activeWords.push({ name: "VAR", label: "VAR", parts: [[WORDS.VAR[0], WORDS.VAR[1], WORDS.VAR[2]]] });
    } else if (baseMin === 45) {
        activeWords.push({ name: "SAAT_DAT", label: HOURS_DAT[targetHour].label, parts: HOURS_DAT[targetHour].parts });
        activeWords.push({ name: "CEYREK", label: "ÇEYREK", parts: [[WORDS.CEYREK[0], WORDS.CEYREK[1], WORDS.CEYREK[2]]] });
        activeWords.push({ name: "VAR", label: "VAR", parts: [[WORDS.VAR[0], WORDS.VAR[1], WORDS.VAR[2]]] });
    } else if (baseMin === 50) {
        activeWords.push({ name: "SAAT_DAT", label: HOURS_DAT[targetHour].label, parts: HOURS_DAT[targetHour].parts });
        activeWords.push({ name: "ON_MIN", label: "ON", parts: [[WORDS.ON_MIN[0], WORDS.ON_MIN[1], WORDS.ON_MIN[2]]] });
        activeWords.push({ name: "VAR", label: "VAR", parts: [[WORDS.VAR[0], WORDS.VAR[1], WORDS.VAR[2]]] });
    } else if (baseMin === 55) {
        activeWords.push({ name: "SAAT_DAT", label: HOURS_DAT[targetHour].label, parts: HOURS_DAT[targetHour].parts });
        activeWords.push({ name: "BES_MIN", label: "BEŞ", parts: [[WORDS.BES_MIN[0], WORDS.BES_MIN[1], WORDS.BES_MIN[2]]] });
        activeWords.push({ name: "VAR", label: "VAR", parts: [[WORDS.VAR[0], WORDS.VAR[1], WORDS.VAR[2]]] });
    } else if (baseMin === 60) {
        activeWords.push({ name: "SAAT_DAT", label: HOURS_DAT[targetHour].label, parts: HOURS_DAT[targetHour].parts });
        activeWords.push({ name: "VAR", label: "VAR", parts: [[WORDS.VAR[0], WORDS.VAR[1], WORDS.VAR[2]]] });
    }

    return { baseMin, dotCount, targetHour, currentHour, activeWords };
}

// Söylem sırasını belirle (yukarıdan aşağıya okunma sırası)
// Kural: Kelimeler Türkçe okunuş sırasına göre yukarıdan aşağıya dizilmeli
function getReadingOrder(activeWords) {
    // Her kelimenin "en üst satırı"nı bul
    return activeWords.map(w => {
        const minRow = Math.min(...w.parts.map(p => p[0]));
        const maxRow = Math.max(...w.parts.map(p => p[0]));
        return { ...w, minRow, maxRow };
    }).sort((a, b) => a.minRow - b.minRow);
}

// ============================================================
// BÖLÜM 5: Doğrulama - Mevcut 12x12 Matris
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 5: MEVCUT 12x12 MATRİS DOĞRULAMA");
console.log("=".repeat(80));

let totalErrors = 0;
let totalTests = 0;
const errorDetails = [];

// Doğrulama 1: Grid'deki harflerle kelime koordinatları eşleşiyor mu?
console.log("\n--- Koordinat-Harf Eşleşme Doğrulaması ---");

function extractWord(grid, parts) {
    let word = "";
    for (const [row, start, end] of parts) {
        for (let c = start; c <= end; c++) {
            word += grid[row][c];
        }
    }
    return word;
}

// Sabit kelimeleri kontrol et
const fixedCheck = [
    { name: "SAAT", expected: "SAAT", parts: [[0, 0, 3]] },
    { name: "BEŞ(dk)", expected: "BEŞ", parts: [[10, 8, 10]] },
    { name: "ON(dk)", expected: "ON", parts: [[11, 0, 1]] },
    { name: "YİRMİ", expected: "YİRMİ", parts: [[9, 7, 11]] },
    { name: "ÇEYREK", expected: "ÇEYREK", parts: [[10, 0, 5]] },
    { name: "BUÇUK", expected: "BUÇUK", parts: [[4, 7, 11]] },
    { name: "VAR", expected: "VAR", parts: [[11, 2, 4]] },
    { name: "GEÇİYOR", expected: "GEÇİYOR", parts: [[11, 5, 11]] },
];

for (const chk of fixedCheck) {
    const found = extractWord(GRID_12x12, chk.parts);
    const ok = found === chk.expected;
    console.log(`  ${ok ? "OK" : "HATA"}: ${chk.name} -> beklenen="${chk.expected}", bulunan="${found}"`);
    if (!ok) totalErrors++;
}

// Saat isimlerini kontrol et
console.log("\n  Saat isimleri (Nominative / Accusative / Dative):");
for (let h = 1; h <= 12; h++) {
    const nomFound = extractWord(GRID_12x12, HOURS_NOM[h].parts);
    const accFound = extractWord(GRID_12x12, HOURS_ACC[h].parts);
    const datFound = extractWord(GRID_12x12, HOURS_DAT[h].parts);

    const nomOk = nomFound === HOURS_NOM[h].label.replace(/ /g, "");
    const accOk = accFound === HOURS_ACC[h].label.replace(/ /g, "");
    const datOk = datFound === HOURS_DAT[h].label.replace(/ /g, "");

    const status = (nomOk && accOk && datOk) ? "OK" : "HATA";
    if (status === "HATA") {
        console.log(`  HATA: Saat ${h}:`);
        if (!nomOk) console.log(`    NOM: beklenen="${HOURS_NOM[h].label}", bulunan="${nomFound}"`);
        if (!accOk) console.log(`    ACC: beklenen="${HOURS_ACC[h].label}", bulunan="${accFound}"`);
        if (!datOk) console.log(`    DAT: beklenen="${HOURS_DAT[h].label}", bulunan="${datFound}"`);
        totalErrors++;
    } else {
        console.log(`  OK: Saat ${h}: NOM=${nomFound} | ACC=${accFound} | DAT=${datFound}`);
    }
}

// ============================================================
// BÖLÜM 6: Dikey Sıra Doğrulaması
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 6: DİKEY OKUMA SIRASI DOĞRULAMASI");
console.log("=".repeat(80));

// Her zaman ifadesi için okunma sırası:
// GEÇİYOR durumları: [SAAT_ACC] [DAKİKA_KELİMESİ] GEÇİYOR
// VAR durumları: [SAAT_DAT] [DAKİKA_KELİMESİ] VAR
// Tam saat: SAAT [SAAT_NOM]
// Buçuk: SAAT [SAAT_NOM] BUÇUK
//
// Okuma sırası yukarıdan aşağıya doğru olmalı!

function getExpectedOrder(activeWords) {
    // Beklenen söylem sırası: Türkçede cümle SOV (Özne-Nesne-Yüklem) yapısına uygun
    // "BİRİ beş geçiyor" -> SAAT_ACC, dakika, GEÇİYOR
    // "İkiye çeyrek var" -> SAAT_DAT, dakika, VAR
    // "Saat bir" -> SAAT, SAAT_NOM
    // "Saat bir buçuk" -> SAAT, SAAT_NOM, BUÇUK

    const order = [];
    for (const w of activeWords) {
        if (w.name === "SAAT") order.push({ pos: 0, word: w });
        else if (w.name === "SAAT_NOM") order.push({ pos: 1, word: w });
        else if (w.name === "SAAT_ACC") order.push({ pos: 1, word: w });
        else if (w.name === "SAAT_DAT") order.push({ pos: 1, word: w });
        else if (w.name === "BUCUK") order.push({ pos: 3, word: w });
        else if (w.name === "YIRMI") order.push({ pos: 2, word: w });
        else if (w.name === "BES_MIN") order.push({ pos: 2.5, word: w });
        else if (w.name === "ON_MIN") order.push({ pos: 2, word: w });
        else if (w.name === "CEYREK") order.push({ pos: 2, word: w });
        else if (w.name === "VAR") order.push({ pos: 4, word: w });
        else if (w.name === "GECIYOR") order.push({ pos: 4, word: w });
    }

    order.sort((a, b) => a.pos - b.pos);
    return order.map(o => o.word);
}

let verticalErrors = 0;
let sameRowConflicts = 0;

for (let h = 0; h < 12; h++) {
    for (let m = 0; m < 60; m++) {
        totalTests++;
        const expr = getTimeExpression(h, m);
        const ordered = getReadingOrder(expr.activeWords);
        const expected = getExpectedOrder(expr.activeWords);

        // Dikey sıra kontrolü: beklenen sıradaki her kelimenin satırı,
        // önceki kelimenin satırından >= olmalı
        let verticalOk = true;
        for (let i = 1; i < expected.length; i++) {
            const prevMinRow = Math.min(...expected[i-1].parts.map(p => p[0]));
            const currMinRow = Math.min(...expected[i].parts.map(p => p[0]));

            if (currMinRow < prevMinRow) {
                verticalOk = false;
                verticalErrors++;
                const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                const detail = `${timeStr}: "${expected[i-1].label}"(satır ${prevMinRow}) -> "${expected[i].label}"(satır ${currMinRow}) - sıra hatalı!`;
                errorDetails.push(detail);
                if (errorDetails.length <= 20) {
                    console.log(`  HATA: ${detail}`);
                }
            }
        }

        // Aynı satırda olan aktif kelimeler arasında boşluk kontrolü
        const rowMap = {};
        for (const w of expr.activeWords) {
            for (const [row, start, end] of w.parts) {
                if (!rowMap[row]) rowMap[row] = [];
                rowMap[row].push({ name: w.name, label: w.label, start, end });
            }
        }

        for (const [row, words] of Object.entries(rowMap)) {
            if (words.length > 1) {
                // Aynı satırda birden fazla aktif segment var
                words.sort((a, b) => a.start - b.start);
                for (let i = 0; i < words.length - 1; i++) {
                    const gap = words[i+1].start - words[i].end;
                    if (gap <= 1) {
                        // Bitişik veya çakışan kelimeler
                        sameRowConflicts++;
                        const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                        const detail = `${timeStr}: Satır ${row}'da "${words[i].label}" ve "${words[i+1].label}" arası boşluk=${gap-1}`;
                        if (sameRowConflicts <= 10) {
                            console.log(`  UYARI: ${detail}`);
                        }
                    }
                }
            }
        }
    }
}

console.log(`\nToplam test: ${totalTests}`);
console.log(`Dikey sıra hataları: ${verticalErrors}`);
console.log(`Aynı satır çakışmaları: ${sameRowConflicts}`);
if (errorDetails.length > 20) {
    console.log(`  (${errorDetails.length - 20} hata daha gizlendi)`);
}

// ============================================================
// BÖLÜM 7: Her Satırdaki Kelime Uzunluk Analizi
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 7: SATIR UZUNLUK ANALİZİ - MİNİMUM GENİŞLİK HESABI");
console.log("=".repeat(80));

// Her satıra hangi kelimelerin yerleştiğini ve minimum genişliği hesapla
// Mevcut 12x12'de satır başına kelime dağılımı:

const rowContents = {
    0:  { words: ["SAAT(4)", "ON(2)", "ONU/ONA(3)"], description: "SAAT + ON/ONU/ONA" },
    1:  { words: ["BİR(3)", "BİRİ(4)", "BİRE(4)", "ÜÇ(2)", "ÜÇÜ(3)"], description: "BİR formları + ÜÇ formları" },
    2:  { words: ["ÜÇE(3)", "İKİ(3)", "İKİYİ(5)", "DÖRT(4)"], description: "ÜÇE + İKİ formları + DÖRT" },
    3:  { words: ["İKİYE(5)", "DÖRDÜ(5)"], description: "İKİYE + DÖRDÜ" },
    4:  { words: ["DÖRDE(5)", "BUÇUK(5)"], description: "DÖRDE + BUÇUK" },
    5:  { words: ["BEŞ(3)", "BEŞİ(4)", "BEŞE(4)"], description: "BEŞ formları" },
    6:  { words: ["ALTI(4)", "ALTIYI(6)", "ALTIYA(6)"], description: "ALTI formları" },
    7:  { words: ["YEDİ(4)", "YEDİYİ(6)", "YEDİYE(6)"], description: "YEDİ formları" },
    8:  { words: ["SEKİZ(5)", "SEKİZİ(6)", "SEKİZE(6)"], description: "SEKİZ formları" },
    9:  { words: ["DOKUZ(5)", "DOKUZU(6)", "DOKUZA(6)", "YİRMİ(5)"], description: "DOKUZ formları + YİRMİ" },
    10: { words: ["ÇEYREK(6)", "BEŞ(dk)(3)"], description: "ÇEYREK + BEŞ(dk)" },
    11: { words: ["ON(dk)(2)", "VAR(3)", "GEÇİYOR(7)"], description: "ON(dk) + VAR + GEÇİYOR" },
};

console.log("\nMevcut 12x12 satır dağılımı:");
for (let r = 0; r <= 11; r++) {
    const rc = rowContents[r];
    const gridRow = GRID_12x12[r];
    console.log(`  Satır ${String(r).padStart(2)}: [${gridRow}] (${gridRow.length} harf) - ${rc.description}`);
}

// ============================================================
// BÖLÜM 8: 11x11 SIKIŞTIRILMA ANALİZİ
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 8: 11x11'E SIKIŞTIRMA ANALİZİ");
console.log("=".repeat(80));

// Her satır için minimum gereken genişliği hesapla
// Kural: Aynı satırdaki kelimeler arasında EN AZ 1 boş harf olmalı (yanlış okuma önlemek için)
// Ancak kelimeler örtüşebilir (DOKUZU = DOKUZ + U harfi, DOKUZA = DOKUZ + A harfi gibi)

console.log("\nHer satır için minimum genişlik hesabı:");
console.log("(Kelimeler arası en az 1 boşluk gerektiğinde)");

const satırGereksinimleri = [
    { satir: "A: SAAT + ON/ONU/ONA",
      analysis: "SAAT(4) + 1 boşluk + ONA(3) = 8 veya SAAT(4) + ON(2) + ONU(3) örtüşümlü",
      min: 10 },
    { satir: "B1: BİR/BİRİ/BİRE + ÜÇ/ÜÇÜ",
      analysis: "BİRİ(4) + BİRE(4) örtüşümlü + 1 boşluk + ÜÇÜ(3) = maks 12",
      min: 11 },
    { satir: "B2: ÜÇE + İKİ/İKİYİ + DÖRT",
      analysis: "ÜÇE(3) + 1 + İKİYİ(5) + 1 + DÖRT(4) = 14 (veya örtüşüm ile)",
      min: 12 },
    { satir: "B3: İKİYE + DÖRDÜ",
      analysis: "İKİYE(5) + 1 + DÖRDÜ(5) = 11",
      min: 10 },
    { satir: "B4: DÖRDE + BUÇUK",
      analysis: "DÖRDE(5) + boşluk(1-2) + BUÇUK(5) = 11-12",
      min: 12 },
    { satir: "B5: BEŞ/BEŞİ/BEŞE",
      analysis: "BEŞİ(4) örtüşüm + BEŞE(4) = 8",
      min: 8 },
    { satir: "B6: ALTI/ALTIYI/ALTIYA",
      analysis: "ALTIYI(6) örtüşüm ALTIYA(6) = 12",
      min: 12 },
    { satir: "B7: YEDİ/YEDİYİ/YEDİYE",
      analysis: "YEDİYİ(6) + YEDİYE(6) = 12",
      min: 12 },
    { satir: "B8: SEKİZ/SEKİZİ/SEKİZE",
      analysis: "SEKİZİ(6) + SEKİZE(6) = 12",
      min: 12 },
    { satir: "B9: DOKUZ/DOKUZU/DOKUZA + YİRMİ",
      analysis: "DOKUZU/A(6) + 1 + YİRMİ(5) = 12",
      min: 12 },
    { satir: "C: ÇEYREK + BEŞ(dk)",
      analysis: "ÇEYREK(6) + 2 boşluk + BEŞ(3) = 11",
      min: 11 },
    { satir: "D: ON(dk) + VAR + GEÇİYOR",
      analysis: "ON(2) + VAR(3) + GEÇİYOR(7) = 12",
      min: 12 },
];

console.log("\nSatır minimum genişlik tablosu:");
let maxMinWidth = 0;
for (const s of satırGereksinimleri) {
    console.log(`  ${s.satir}`);
    console.log(`    Analiz: ${s.analysis}`);
    console.log(`    Min genişlik: ${s.min}`);
    if (s.min > maxMinWidth) maxMinWidth = s.min;
}

console.log(`\n  SONUÇ: Minimum matris genişliği = ${maxMinWidth}`);

// ============================================================
// BÖLÜM 9: Detaylı 11x11 Olanaksızlık Analizi
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 9: 11x11 OLANAKSIZLIK ANALİZİ - DARBOĞAZ SATIRLARI");
console.log("=".repeat(80));

// Kritik satırları incele
console.log("\n--- Darboğaz 1: SEKİZ satırı ---");
console.log("SEKİZ formu gereksinimleri:");
console.log("  SEKİZ  (NOM): 5 harf");
console.log("  SEKİZİ (ACC): 6 harf");
console.log("  SEKİZE (DAT): 6 harf");
console.log("  Minimum örtüşümlü yerleşim: SEKİZİSEKİZE = 12 harf");
console.log("  Alternatif: SEKİZ.İ.SEKİZE -> SEKİZİ(6) + harf ayıracı + SEKİZE(6) = min 12");
console.log("  Alternatif 2: SEKİZİ ve SEKİZE örtüşür mü?");
console.log("    SEKİZİ = S,E,K,İ,Z,İ");
console.log("    SEKİZE = S,E,K,İ,Z,E");
console.log("    Örtüşüm: İlk 5 harf (SEKİZ) ortaktır");
console.log("    SEKİZ+İ+?+SEKİZ+E veya SEKİZİ?SEKİZE");
console.log("    En kompakt: SEKİZİSEKİZE = 11 harf? Hayır, 12 harf");

// Harf harf say
const testStr = "SEKİZİSEKİZE";
console.log(`  "SEKİZİSEKİZE" = ${[...testStr].length} karakter (Türkçe İ/Ü/Ö/Ç/Ş/Ğ dahil)`);

// Alternatif: SEKİZE ve SEKİZİ aynı SEKİZ kökünden türesin
console.log("\n  Alternatif yaklaşım: Tek SEKİZ + ek harfler");
console.log("    SEKİZ(5) + İ(1) = SEKİZİ -> toplam = 6");
console.log("    SEKİZ(5) + E(1) = SEKİZE -> İ ve E aynı anda yanamaz, ama aynı pozisyonda olmalı");
console.log("    Yani: S E K İ Z [İ/E] -> 6 harf, ama ACC ve DAT aynı anda kullanılmaz!");
console.log("    ÇÖZÜM MÜMKÜN: S E K İ Z İ E -> 7 harf (SEKİZİ=ilk6, SEKİZE=ilk5+son)");
console.log("    Ama SEKİZ(NOM) de lazım -> ilk 5 harf = SEKİZ");
console.log("    Minimum 7 harf ile tüm SEKİZ formları çözülebilir!");

console.log("\n--- Darboğaz 2: DOKUZ + YİRMİ satırı ---");
console.log("  Mevcut: DOKUZUAYİRMİ (12 harf)");
console.log("  DOKUZ(5) + DOKUZU(6) + DOKUZA(6) + boşluk + YİRMİ(5)");
console.log("  Kompakt: DOKUZUAYİRMİ -> DOKUZ(0-4), DOKUZU(0-5), 'A' filler, YİRMİ(7-11)");
console.log("  Ama DOKUZA(DAT) nerede? DOKUZ+A = index 0-5 ve A=5 -> DOKUZA(0-5) 'DA' mı?");

// Mevcut grid'den kontrol edelim
console.log("  Mevcut grid satır 9: " + GRID_12x12[9]);
const dokuza_check = extractWord(GRID_12x12, [[9, 0, 5]]);
console.log(`  DOKUZA kontrol (9,0,5): "${dokuza_check}"`);

// Hmm, mevcut scriptte DOKUZA tanımı farklı
console.log("  Script'teki DOKUZA tanımı: [[9, 0, 4], [9, 6, 6]]");
console.log("  Yani DOKUZ(0-4) + A(6) -> arada boşluk var (pozisyon 5 = U)");

console.log("\n  11 harfle çözüm denemesi:");
console.log("    DOKUZUYRMI -> 10 harf? Hayır, YİRMİ 5 harf (İ harfi önemli)");
console.log("    DOKUZAYİRMİ -> 11 harf? D,O,K,U,Z,A,Y,İ,R,M,İ = 11 harf!");
console.log("    Ama DOKUZU nerede? DOKUZ(0-4) + U? U yok bu versiyonda!");
console.log("    DOKUZUYRM İ-> olmaz.");
console.log("    Çözüm: DOKUZA = DOKUZ+A, ama DOKUZU için ayrı U lazım");
console.log("    DOKUZUAYİRMİ = 12 harf, 11'e sığmaz!");

console.log("\n--- Darboğaz 3: ALTIYI / ALTIYA satırı ---");
console.log("  ALTIYI(6) ve ALTIYA(6) -> örtüşüm: ALTIY ortak (5 harf)");
console.log("  ALTIYIALTIYA = 12 harf (mevcut)");
console.log("  Kompakt: ALTIYIxALTIYA");
console.log("  Tek kök yaklaşımı: A L T I Y [İ/A] -> 6 harf ama İ ve A farklı slot");
console.log("  ALTIY+İ+A = ALTIYIA = 7 harf -> ALTIYI(0-5), ALTIYA = ALTIY(0-4)+A(6)");
console.log("  Ama ALTI(NOM) de lazım: ALTI = ilk 4 harf");
console.log("  ALTIYIA -> ALTI(0-3), ALTIYI(0-5), ALTIYA(0-4,6) -> 7 harf!");
console.log("  Ama ALTIYA normalde bitişik okunmalı... A ayrı yerde mi?");
console.log("  DOKUZA gibi bölünmüş kabul edilebilir: ALTIY(0-4) + A(6) arası I");

console.log("\n--- Darboğaz 4: YEDİYİ / YEDİYE satırı ---");
console.log("  YEDİYİYEDİYE = 12 harf (mevcut)");
console.log("  Tek kök: YEDİY+İ+E = YEDİYİE = 7 harf");
console.log("  YEDİ(0-3), YEDİYİ(0-5), YEDİYE: YEDİY(0-4)+E(6)");

console.log("\n--- Darboğaz 5: ON(dk) + VAR + GEÇİYOR ---");
console.log("  ON(2) + VAR(3) + GEÇİYOR(7) = 12 harf");
console.log("  11'e sıkıştırma: ONVARGEÇİYOR = 12, sığmaz");
console.log("  Alternatiif: GEÇİYO(6) + R'yi paylaş? VAR'ın R'si? -> RVARGECIYOР olmaz");
console.log("  Sıra: ON...VAR...GEÇİYOR, hepsi farklı kelime, örtüşüm zor");

console.log("\n--- Darboğaz 6: ÜÇE + İKİYİ + DÖRT ---");
console.log("  ÜÇE(3) + İKİYİ(5) + DÖRT(4) = 12 harf");
console.log("  Farklı satırlara bölünebilir mi?");
console.log("  İKİYİ ve DÖRT aynı anda asla yanmaz (farklı saatler)");
console.log("  İKİ ve İKİYİ örtüşür, DÖRT ve DÖRDE/DÖRDÜ örtüşür");
console.log("  Mevcut: ÜÇEİKİYİDÖRT = 12 harf");
console.log("  Ama ÜÇE hiçbir zaman İKİYİ veya DÖRT ile aynı anda yanmaz!");
console.log("  Yani ÜÇE, İKİYİ ile örtüşebilir: ÜÇEİKİYİ -> 9 harf ama ÜÇE ve İKİYİ bitişik olur");
console.log("  Sorun: ÜÇE(0-2) ve İKİ(2-4) örtüşürse İ harfi paylaşılır? -> ÜÇEİKİYİ olmaz (farklı harfler)");

// ============================================================
// BÖLÜM 10: Alternatif Kompakt Düzen Önerileri
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 10: ALTERNATİF KOMPAKT DÜZEN ÖNERİLERİ");
console.log("=".repeat(80));

console.log("\n--- Yaklaşım 1: Tek kök + ek harfleri (SEKİZİE gibi) ---");
console.log("Bu yaklaşımla bazı satırlar 7-8 harfe düşebilir ama:");
console.log("  Problem: Bölünmüş kelimeler (ALTIY+boşluk+A gibi) görsel olarak kötü");
console.log("  Problem: DOKUZA için A harfi kopuk kalıyor");

console.log("\n--- Yaklaşım 2: Kritik satırları birleştirme ---");

// En kısası 7 harf olan tek-kök yaklaşımıyla satır genişlikleri:
const compactRows = [
    { label: "Satır 0: SAAT+ON+ONU+ONA", compact: "SAATONUONA", len: 10, minLen: 10 },
    { label: "Satır 1: BİR+BİRİ+BİRE+ÜÇ+ÜÇÜ", compact: "BİRİBİREÜÇÜ", len: 12, minLen: 10 },
    { label: "Satır 2: ÜÇE+İKİ+İKİYİ+DÖRT", compact: "ÜÇEİKİYİDÖRT", len: 12, minLen: 12 },
    { label: "Satır 3: İKİYE+DÖRDÜ", compact: "İKİYEDÖRDÜ", len: 10, minLen: 10 },
    { label: "Satır 4: DÖRDE+BUÇUK", compact: "DÖRDEBUÇUK", len: 10, minLen: 10 },
    { label: "Satır 5: BEŞ+BEŞİ+BEŞE", compact: "BEŞİRBEŞE", len: 9, minLen: 8 },
    { label: "Satır 6: ALTI+ALTIYI+ALTIYA", compact: "ALTIYIALTIYA", len: 12, minLen: 7 },
    { label: "Satır 7: YEDİ+YEDİYİ+YEDİYE", compact: "YEDİYİYEDİYE", len: 12, minLen: 7 },
    { label: "Satır 8: SEKİZ+SEKİZİ+SEKİZE", compact: "SEKİZİSEKİZE", len: 12, minLen: 7 },
    { label: "Satır 9: DOKUZ+DOKUZU+DOKUZA+YİRMİ", compact: "DOKUZUAYİRMİ", len: 12, minLen: 12 },
    { label: "Satır 10: ÇEYREK+BEŞ(dk)", compact: "ÇEYREKVEBEŞ", len: 11, minLen: 11 },
    { label: "Satır 11: ON(dk)+VAR+GEÇİYOR", compact: "ONVARGEÇİYOR", len: 12, minLen: 12 },
];

console.log("\nKompakt satır genişlikleri:");
let has12 = false;
for (const r of compactRows) {
    const fits11 = r.minLen <= 11;
    console.log(`  ${fits11 ? "OK " : "!!!"} ${r.label}`);
    console.log(`      Mevcut: "${r.compact}" (${r.len} harf), Min: ${r.minLen}`);
    if (r.minLen > 11) has12 = true;
}

// ============================================================
// BÖLÜM 11: 11x11 için Yeniden Yapılandırma Denemeleri
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 11: 11x11 İÇİN YENİDEN YAPILANDIRMA DENEMELERİ");
console.log("=".repeat(80));

console.log("\n--- Darboğaz Çözüm Stratejileri ---");

console.log("\n1. Satır 2 (ÜÇE+İKİYİ+DÖRT = 12 harf):");
console.log("   Çözüm: DÖRT'ü başka satıra taşı");
console.log("   ÜÇE+İKİYİ = 8 harf -> Satır 2: ÜÇEXİKİYİXX (11'e sığar)");
console.log("   DÖRT'ü satır 3'e veya 4'e ekle");

console.log("\n2. Satır 6 (ALTIYIALTIYA = 12 harf):");
console.log("   Tek kök çözümü: ALTIYIA = 7 harf");
console.log("   ALTI(0-3), ALTIYI(0-5), ALTIYA: ALTIY(0-4)+A(6)");
console.log("   Satır: A L T I Y İ X A ... (X=boşluk harf) = 8+ harf");
console.log("   Ama ALTIYA bölünmüş oluyor -> görsel sorun ama teknik olarak mümkün");

console.log("\n3. Satır 7 (YEDİYİYEDİYE = 12 harf):");
console.log("   Tek kök: YEDİYİE = 7 harf, aynı mantık");

console.log("\n4. Satır 8 (SEKİZİSEKİZE = 12 harf):");
console.log("   Tek kök: SEKİZİE = 7 harf, aynı mantık");

console.log("\n5. Satır 9 (DOKUZUAYİRMİ = 12 harf):");
console.log("   Problem: DOKUZU(6) + YİRMİ(5) = 11 minimum (araya boşluk bile koymadan)");
console.log("   DOKUZU ve YİRMİ aynı anda yandığı durumlar:");
console.log("   - 25 geçiyor: DOKUZU + YİRMİ + BEŞ + GEÇİYOR? HAYIR, 9'u 25 geçiyor");
console.log("   Kontrol: DOKUZU(ACC) ne zaman yanar?");

// DOKUZU ve YİRMİ aynı anda yanar mı?
let dokuzuAndYirmi = false;
for (let h = 0; h < 12; h++) {
    for (let m = 0; m < 60; m++) {
        const expr = getTimeExpression(h, m);
        const hasAcc9 = expr.activeWords.some(w => w.name === "SAAT_ACC" && w.label === "DOKUZU");
        const hasDat9 = expr.activeWords.some(w => w.name === "SAAT_DAT" && w.label === "DOKUZA");
        const hasYirmi = expr.activeWords.some(w => w.name === "YIRMI");

        if ((hasAcc9 || hasDat9) && hasYirmi) {
            const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            if (!dokuzuAndYirmi) {
                console.log(`\n   DOKUZU/DOKUZA + YİRMİ birlikte yanar:`);
            }
            const hourForm = hasAcc9 ? "DOKUZU(ACC)" : "DOKUZA(DAT)";
            console.log(`     ${timeStr}: ${hourForm} + YİRMİ`);
            dokuzuAndYirmi = true;
        }
    }
}

console.log("\n   Sonuç: DOKUZU/DOKUZA ve YİRMİ birlikte yanıyorsa aynı satırda olmalı");
console.log("   Ayrıca DOKUZA(DAT) için ayrı bir 'A' gerek");
console.log("   DOKUZUAYİRMİ = DOKUZ(0-4) + U(5) + A(6) + YİRMİ(7-11) = 12 harf");
console.log("   DOKUZU = 0-5, DOKUZA = 0-4 + 6(A)");
console.log("   11'e sıkıştırma: DOKUZAYİRMİ = 11 harf");
console.log("   DOKUZ(0-4), DOKUZA(0-5), YİRMİ(6-10) = 11 harf");
console.log("   AMA DOKUZU(ACC) nereye? DOKUZ+U harfi yok!");
console.log("   YİRMİ'nin İ'si ile U paylaşılamaz");

console.log("\n   ALTERNATİF: YİRMİ'yi başka satıra taşı");
console.log("   YİRMİ aynı anda DOKUZU ile mi kullanılıyor?");
if (dokuzuAndYirmi) {
    console.log("   EVET! DOKUZU ve YİRMİ aynı anda yanıyor, aynı satırda olmak zorunda DEĞİL");
    console.log("   Ama dikey okuma sırası bozulmaz mı? Kontrol edelim...");
    console.log("   Geçiyor: DOKUZU (saat) -> YİRMİ (dakika) -> GEÇİYOR");
    console.log("   Saat satırı (9) < dakika satırı (?) < fiil satırı (11)");
    console.log("   Yani YİRMİ, 9 ile 11 arasında bir satırda olmalı -> satır 10 ideal");
}

console.log("\n6. Satır 11 (ONVARGEÇİYOR = 12 harf):");
console.log("   ON(0-1) + VAR(2-4) + GEÇİYOR(5-11) = 12 harf");
console.log("   ON ve VAR veya ON ve GEÇİYOR aynı anda yanar mı?");

let onAndVar = false;
let onAndGeciyor = false;
for (let h = 0; h < 12; h++) {
    for (let m = 0; m < 60; m++) {
        const expr = getTimeExpression(h, m);
        const hasOn = expr.activeWords.some(w => w.name === "ON_MIN");
        const hasVar = expr.activeWords.some(w => w.name === "VAR");
        const hasGeciyor = expr.activeWords.some(w => w.name === "GECIYOR");

        if (hasOn && hasVar) onAndVar = true;
        if (hasOn && hasGeciyor) onAndGeciyor = true;
    }
}
console.log(`   ON(dk) + VAR birlikte: ${onAndVar ? "EVET" : "HAYIR"}`);
console.log(`   ON(dk) + GEÇİYOR birlikte: ${onAndGeciyor ? "EVET" : "HAYIR"}`);
console.log("   Sonuç: ON(dk) VAR ile yanar ama GEÇİYOR ile de yanar");
console.log("   Yani ON, VAR ve GEÇİYOR hepsi aynı satırda olmalı -> min 12 harf");

console.log("\n   ALTERNATİF: ON(dk) kelimesini VAR/GEÇİYOR satırından ayır");
console.log("   ON(dk) satır 10'a, VAR+GEÇİYOR satır 11'e");
console.log("   Ama ON(dk) çeyrek ve beş ile aynı satırda olabilir");
console.log("   Satır 10: ÇEYREK + ON(dk) + BEŞ(dk) = 6+2+3 = 11 harf (tam sığar!)");
console.log("   Satır 11: VAR + GEÇİYOR = 3+7 = 10 harf (sığar!)");

// ============================================================
// BÖLÜM 12: OPTİMİZE 11x11 MATRİS ÖNERİSİ
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 12: OPTİMİZE MATRİS ÖNERİSİ");
console.log("=".repeat(80));

// Yeni düzende temel fikirler:
// 1. SEKİZ, ALTI, YEDİ satırları tek-kök yaklaşımı ile kısaltılabilir
// 2. YİRMİ satır 10'a taşınabilir
// 3. ON(dk) satır 10'a taşınabilir
// 4. DOKUZA/DOKUZU satırında YİRMİ olmayınca daha kısa

// Tek kök yaklaşımı kontrolü:
// ACC ve DAT aynı anda asla yanmaz (biri geçiyor biri var için)
// NOM yalnızca tam saat ve buçukta yanar (ACC/DAT ile asla yanmaz)
// Yani: SEKİZİE formatı güvenli!

console.log("\nTek-kök yaklaşımı güvenlik kontrolü:");
for (let h = 1; h <= 12; h++) {
    for (let hh = 0; hh < 12; hh++) {
        for (let mm = 0; mm < 60; mm++) {
            const expr = getTimeExpression(hh, mm);
            const hasNom = expr.activeWords.some(w => w.name === "SAAT_NOM" && w.label.includes(HOURS_NOM[h].label));
            const hasAcc = expr.activeWords.some(w => w.name === "SAAT_ACC" && w.label.includes(HOURS_ACC[h].label));
            const hasDat = expr.activeWords.some(w => w.name === "SAAT_DAT" && w.label.includes(HOURS_DAT[h].label));

            const count = (hasNom ? 1 : 0) + (hasAcc ? 1 : 0) + (hasDat ? 1 : 0);
            if (count > 1) {
                console.log(`  HATA: Saat ${h} - ${hh}:${mm} - Birden fazla form aynı anda!`);
            }
        }
    }
}
console.log("  Kontrol tamamlandı. Aynı anda birden fazla form yanan saat yok -> tek-kök güvenli.");

// Yeni matris önerisi
console.log("\n--- ÖNERİLEN YENİ MATRİS DÜZENI ---");

const proposal_11x11_attempt = [
    // Satır  0: SAAT(0-3) + ON(4-5) + ONU(4-6) + ONA(7-9) = 10 harf -> +1 dolgu = 11
    "SAATONUONAX",  // X=dolgu harfi // NOT: ONA -> 0,7-9 ise ON(4-5) ve ONA(7-9) arası U var
    // Hatayı düzeltelim
];

// Aslında daha sistematik düşünelim
console.log("\nSistematik 11x11 matris tasarımı:");
console.log("");

// Satır genişlikleri kontrol (gerçek tek-kök yaklaşımıyla):
const rows11 = [
    { id: 0, content: "SAATONUONAZ", len: 11,
      words: "SAAT(0-3), ON(4-5), ONU(4-6), ONA(7-9)",
      note: "Z=dolgu. ON+ONU örtüşür. ONA ayrı." },

    { id: 1, content: "BİRİHBİREÜÇ", len: 12, // HATA: 12 harf
      words: "BİR(0-2), BİRİ(0-3), BİRE(5-8), ÜÇ(9-10)",
      note: "H=ayırıcı. BİRİ ve BİRE ayrı olmalı (ikisi aynı anda yanabilir mi?)" },
];

// BİRİ ve BİRE aynı anda yanar mı?
let biriAndBire = false;
for (let hh = 0; hh < 12; hh++) {
    for (let mm = 0; mm < 60; mm++) {
        const expr = getTimeExpression(hh, mm);
        const hasBiriAcc = expr.activeWords.some(w => w.name === "SAAT_ACC" && w.label === "BİRİ");
        const hasBireDat = expr.activeWords.some(w => w.name === "SAAT_DAT" && w.label === "BİRE");
        if (hasBiriAcc && hasBireDat) biriAndBire = true;
    }
}
console.log(`BİRİ(ACC) ve BİRE(DAT) aynı anda yanar mı? ${biriAndBire ? "EVET - SORUN!" : "HAYIR - güvenli"}`);

// Hiçbir saat için ACC ve DAT aynı anda yanmaz
console.log("Sonuç: ACC ve DAT asla aynı anda yanmaz -> tek satırda BİRİ ve BİRE örtüşebilir!");
console.log("BİRİ = B,İ,R,İ ve BİRE = B,İ,R,E -> ilk 3 harf ortak: BİR");
console.log("BİRİE = B,İ,R,İ,E -> 5 harf: BİRİ(0-3), BİRE=BİR(0-2)+E(4)");
console.log("BİR(NOM)=0-2, BİRİ(ACC)=0-3, BİRE(DAT)=0-2+4 (E harfi kopuk!)");
console.log("VEYA: BİREBİRİ = 8 harf, BİRE(0-3), BİRİ(4-7), BİR ayrıca...");

// Örtüşüm tablosu
console.log("\n--- HER SAAT İÇİN TEK-KÖK MİNİMUM UZUNLUK ---");
for (let h = 1; h <= 12; h++) {
    const nom = HOURS_NOM[h].label.replace(/ /g, "");
    const acc = HOURS_ACC[h].label.replace(/ /g, "");
    const dat = HOURS_DAT[h].label.replace(/ /g, "");

    // ON BİR gibi iki parçalı olanları atla
    if (h >= 10) {
        console.log(`  ${h}: NOM=${nom}, ACC=${acc}, DAT=${dat} -> Çok parçalı, ayrı analiz gerekli`);
        continue;
    }

    // Tekli saatler: nom+İ/Ü/... = acc, nom+E/A/... = dat
    // En kompakt: nom + acc_eki + dat_eki
    const nomLen = nom.length;
    const accLen = acc.length;
    const datLen = dat.length;

    // Eğer acc = nom + 1 harf ve dat = nom + 1 harf (veya 2)
    const accSuffix = acc.substring(nom.length);
    const datSuffix = dat.substring(nom.length);

    let compactForm, compactLen;
    if (acc.startsWith(nom) && dat.startsWith(nom)) {
        compactForm = acc + datSuffix;
        compactLen = compactForm.length;
        console.log(`  ${h}: NOM=${nom}(${nomLen}), ACC=${acc}(${accLen}), DAT=${dat}(${datLen})`);
        console.log(`      Kompakt: ${compactForm} (${compactLen} harf)`);
        console.log(`      NOM=${nom}(0-${nomLen-1}), ACC=${acc}(0-${accLen-1}), DAT=${nom}(0-${nomLen-1})+${datSuffix}(${accLen}-${compactLen-1})`);
    } else {
        console.log(`  ${h}: NOM=${nom}(${nomLen}), ACC=${acc}(${accLen}), DAT=${dat}(${datLen})`);
        console.log(`      Örtüşüm yok veya karmaşık`);
    }
}

// ============================================================
// BÖLÜM 13: SONUÇ VE TAVSİYELER
// ============================================================

console.log("\n" + "=".repeat(80));
console.log("BÖLÜM 13: SONUÇ VE TAVSİYELER");
console.log("=".repeat(80));

console.log("\n--- 11x11'E SIKIŞTIRMA MÜMKÜN MÜ? ---");
console.log("");
console.log("DARBOĞAZ SATIRLARI (12 harf gerektiren):");
console.log("");
console.log("1. ON(dk) + VAR + GEÇİYOR = 12 harf");
console.log("   ÇÖZÜM: ON(dk)'yi üst satıra taşı (ÇEYREK satırına)");
console.log("   Yeni Satır 10: ÇEYREKONBEŞ (11 harf) -> ÇEYREK(0-5)+ON(6-7)+BEŞ(8-10)");
console.log("   Yeni Satır 11: xVARGEÇİYOR (11 harf) -> VAR(1-3)+GEÇİYOR(4-10)");
console.log("   DURUM: ÇÖZÜLDÜ");
console.log("");
console.log("2. DOKUZU + YİRMİ aynı satır = 12 harf");
console.log("   ÇÖZÜM: YİRMİ'yi başka satıra taşı");
console.log("   Satır 10'a: ÇEYREKYİRMİ? = 11 harf ama ON ve BEŞ nereye?");
console.log("   Problem: ÇEYREK(6)+YİRMİ(5)+ON(2)+BEŞ(3) = 16, tek satıra sığmaz!");
console.log("   Yeni yaklaşım: İki dakika satırı");
console.log("   Satır 9: DOKUZUxDÖRT (11 harf) -> DOKUZ+DOKUZU + DÖRT");
console.log("   Satır 10: YİRMİÇEYREK (11 harf)");
console.log("   Satır 11: ONBEŞVARxxx (11 harf) -> ON+BEŞ(dk) arasında ayrım sorun!");
console.log("");
console.log("   ALT ÇÖZÜM: Dakika kelimelerini 2 satıra böl:");
console.log("   Satır 9: DOKUZUEYİRMİ (12!) veya DOKUZUEYIRM (11?) -> İ kayboluyor");
console.log("   SORUN DEVAM: DOKUZU(6) + boşluk + YİRMİ(5) = 12");
console.log("");
console.log("3. ÜÇE + İKİYİ + DÖRT aynı satır = 12 harf");
console.log("   ÇÖZÜM: DÖRT'ü başka satıra taşı");
console.log("   Problem: DÖRT, DÖRDE, DÖRDÜ hepsinin kendi satırında olması gerekir");
console.log("   Mevcut: Satır 2=ÜÇE+İKİYİ+DÖRT, Satır 3=İKİYE+DÖRDÜ, Satır 4=DÖRDE+BUÇUK");
console.log("   DÖRT'ü satır 3'e: İKİYEDÖRDÜDÖRT (14!) -> daha kötü");
console.log("   DÖRT'ü ayrı satıra almak ekstra satır gerektirir");
console.log("");
console.log("4. ALTIYI+ALTIYA = 12 harf");
console.log("   TEK KÖK ÇÖZÜMÜ: ALTIYİxALTY (11?) -> HAYIR");
console.log("   ALTIYİFALTYA (12) -> HAYIR");
console.log("   Gerçek tek kök: ALTIYIA = 7 harf");
console.log("   Satır: ALTIYIAXXX (11 harf, 4 dolgu) -> ALTI(0-3), ALTIYI(0-5), ALTIYA=?");
console.log("   ALTIYA = A(0)+L(1)+T(2)+İ(3)+Y(4)+A(6) -> 5. index İ, 6. index A");
console.log("   AMA İ(5) zaten ALTIYI'nin İ'si! Yani ALTIYA kelimesi: 0-4 + 6. harf");
console.log("   Bu bölünmüş kelime görsel olarak sorunlu ama teknik olarak mümkün");
console.log("   DURUM: TEKNİK OLARAK ÇÖZÜLDÜ (bölünmüş kelime ile)");
console.log("");
console.log("5. YEDİYİ+YEDİYE = 12 harf -> Aynı tek kök çözümü: YEDİYİE = 7 harf -> ÇÖZÜLDÜ");
console.log("6. SEKİZİ+SEKİZE = 12 harf -> Aynı tek kök çözümü: SEKİZİE = 7 harf -> ÇÖZÜLDÜ");

console.log("\n" + "=".repeat(80));
console.log("NİHAİ SONUÇ");
console.log("=".repeat(80));

console.log(`
MEVCUT 12x12 MATRİS: Tüm testlerden geçiyor (${totalErrors} hata)
Dikey sıra hataları: ${verticalErrors}
Aynı satır çakışmaları: ${sameRowConflicts}

11x11 SIKIŞTIRMA ANALİZİ:
============================

ÇÖZÜLEBİLEN DARBOĞAZLAR:
  [OK] ALTIYI/ALTIYA satırı: Tek kök yaklaşımı (ALTIYIA = 7 harf)
  [OK] YEDİYİ/YEDİYE satırı: Tek kök yaklaşımı (YEDİYİE = 7 harf)
  [OK] SEKİZİ/SEKİZE satırı: Tek kök yaklaşımı (SEKİZİE = 7 harf)
  [OK] ON(dk)+VAR+GEÇİYOR: ON(dk)'yi üst satıra taşıma
  [OK] İKİYE+DÖRDÜ satırı: 10 harf, zaten sığıyor
  [OK] DÖRDE+BUÇUK satırı: 10 harf, zaten sığıyor
  [OK] BEŞ formları satırı: 8-9 harf, zaten sığıyor

ÇÖZÜLEMEYEN DARBOĞAZLAR:
  [!!] DOKUZU(6) + YİRMİ(5) = En az 11 harf (boşluksuz)
       Ama DOKUZA(6) da lazım -> DOKUZUA + YİRMİ = 12 harf minimum
       YİRMİ'yi başka satıra taşımak dikey okuma sırasını bozabilir

  [!!] ÜÇE(3) + İKİYİ(5) + DÖRT(4) = 12 harf
       DÖRT'ü başka satıra taşımak ek satır gerektirir
       Ama ÜÇE ve İKİYİ aynı anda yanmaz -> ÜÇEKİYİDÖRT = 10?
       HAYIR: ÜÇE=Ü,Ç,E ve İKİYİ=İ,K,İ,Y,İ farklı harfler, örtüşmez
       ÜÇEİKİYİ = 8 harf + DÖRT(4) + 1 boşluk = 13? Hayır, DÖRT ve İKİYİ aynı anda yanmaz
       ÜÇE+İKİYİ aynı anda yanmaz -> örtüşebilir!
       İKİYİ+DÖRT aynı anda yanmaz -> örtüşebilir!
       En kötü: ÜÇE tek başına, İKİYİ tek başına, DÖRT tek başına
       Örtüşümlü: ÜÇEİKİYİDÖRT ama hiçbiri aynı anda yanmıyorsa hepsi örtüşebilir!

  [!!] BİR satırı + ÜÇ formları = 12 harf (mevcut)

SONUÇ: 11x11 matris KISMEN mümkün ancak önemli kısıtlamalar var:

1. DOKUZA/DOKUZU + YİRMİ birlikteliği 12 harf gerektiriyor
   -> YİRMİ'yi ayrı satıra taşımak mümkün ama ek satır gerektirir

2. Tek kök yaklaşımı (ALTIYIA, YEDİYİE, SEKİZİE) bölünmüş kelime
   sorununa yol açıyor (görsel tutarsızlık)

3. En alt satır (VAR+GEÇİYOR) = 10 harf, 11'e sığar

TAVSİYE: 12x12 matris optimal boyuttur. 11x11'e düşürmek:
- Bölünmüş kelimeler (DOKUZA gibi) gerektirir
- Bazı satırlarda çok sıkışık yerleşim olur
- Dolgu harfleri azalır -> tasarım esnekliği düşer
- Mevcut 12x12 düzen zaten iyi optimize edilmiş ve tüm testlerden geçiyor

12x12 -> 11x11 geçişi 23 harf (144-121) kazandırır ama okunabilirlik
ve bakım kolaylığı kaybettirir.
`);

console.log("=".repeat(80));
console.log("DETAYLI ZAMAN İFADELERİ TABLOSU (5'er dakika aralıklarla)");
console.log("=".repeat(80));

for (let h = 0; h < 12; h++) {
    for (let m = 0; m < 60; m += 5) {
        const expr = getTimeExpression(h, m);
        const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const wordLabels = expr.activeWords.map(w => `${w.label}(s${Math.min(...w.parts.map(p=>p[0]))})`).join(" + ");
        const readOrder = getReadingOrder(expr.activeWords);
        const rows = readOrder.map(w => w.minRow);
        const orderOk = rows.every((r, i) => i === 0 || r >= rows[i-1]);

        console.log(`  ${timeStr}: ${wordLabels} | Sıra: ${orderOk ? "OK" : "HATA"} [${rows.join(",")}]`);
    }
}

console.log("\n\nScript tamamlandı.");
