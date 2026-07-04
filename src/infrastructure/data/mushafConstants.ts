/**
 * Dados canônicos do Mushaf Al-Madinah (604 páginas, edição padrão internacional).
 *
 * Fonte: página inicial de cada Juz' conforme a paginação universal do
 * Mushaf Al-Madinah (a mesma usada por Quran.com, Tanzil.net e a maioria
 * dos aplicativos de Hifdh ao redor do mundo).
 *
 * Juz' 1 começa na página 1, Juz' 30 começa na página 581 (24 páginas).
 */

export const JUZ_START_PAGES: Record<number, number> = {
  1: 1,
  2: 22,
  3: 42,
  4: 62,
  5: 82,
  6: 102,
  7: 121,
  8: 142,
  9: 162,
  10: 182,
  11: 202,
  12: 222,
  13: 242,
  14: 262,
  15: 282,
  16: 302,
  17: 322,
  18: 342,
  19: 362,
  20: 382,
  21: 402,
  22: 422,
  23: 442,
  24: 462,
  25: 482,
  26: 502,
  27: 522,
  28: 542,
  29: 562,
  30: 581,
};

export const TOTAL_PAGES = 604;
export const TOTAL_JUZ = 30;

/** Nomes das 114 Surahs (número → { ar, transliteração, ayahCount }) */
export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameTransliterated: string;
  ayahCount: number;
}

export const SURAHS: SurahMeta[] = [
  { number: 1, nameArabic: 'الفاتحة', nameTransliterated: 'Al-Fatihah', ayahCount: 7 },
  { number: 2, nameArabic: 'البقرة', nameTransliterated: 'Al-Baqarah', ayahCount: 286 },
  { number: 3, nameArabic: 'آل عمران', nameTransliterated: 'Aali Imran', ayahCount: 200 },
  { number: 4, nameArabic: 'النساء', nameTransliterated: 'An-Nisa', ayahCount: 176 },
  { number: 5, nameArabic: 'المائدة', nameTransliterated: 'Al-Maidah', ayahCount: 120 },
  { number: 6, nameArabic: 'الأنعام', nameTransliterated: 'Al-Anam', ayahCount: 165 },
  { number: 7, nameArabic: 'الأعراف', nameTransliterated: 'Al-Araf', ayahCount: 206 },
  { number: 8, nameArabic: 'الأنفال', nameTransliterated: 'Al-Anfal', ayahCount: 75 },
  { number: 9, nameArabic: 'التوبة', nameTransliterated: 'At-Tawbah', ayahCount: 129 },
  { number: 10, nameArabic: 'يونس', nameTransliterated: 'Yunus', ayahCount: 109 },
  { number: 11, nameArabic: 'هود', nameTransliterated: 'Hud', ayahCount: 123 },
  { number: 12, nameArabic: 'يوسف', nameTransliterated: 'Yusuf', ayahCount: 111 },
  { number: 13, nameArabic: 'الرعد', nameTransliterated: 'Ar-Rad', ayahCount: 43 },
  { number: 14, nameArabic: 'ابراهيم', nameTransliterated: 'Ibrahim', ayahCount: 52 },
  { number: 15, nameArabic: 'الحجر', nameTransliterated: 'Al-Hijr', ayahCount: 99 },
  { number: 16, nameArabic: 'النحل', nameTransliterated: 'An-Nahl', ayahCount: 128 },
  { number: 17, nameArabic: 'الإسراء', nameTransliterated: 'Al-Isra', ayahCount: 111 },
  { number: 18, nameArabic: 'الكهف', nameTransliterated: 'Al-Kahf', ayahCount: 110 },
  { number: 19, nameArabic: 'مريم', nameTransliterated: 'Maryam', ayahCount: 98 },
  { number: 20, nameArabic: 'طه', nameTransliterated: 'Ta-Ha', ayahCount: 135 },
  { number: 21, nameArabic: 'الأنبياء', nameTransliterated: 'Al-Anbiya', ayahCount: 112 },
  { number: 22, nameArabic: 'الحج', nameTransliterated: 'Al-Hajj', ayahCount: 78 },
  { number: 23, nameArabic: 'المؤمنون', nameTransliterated: 'Al-Muminun', ayahCount: 118 },
  { number: 24, nameArabic: 'النور', nameTransliterated: 'An-Nur', ayahCount: 64 },
  { number: 25, nameArabic: 'الفرقان', nameTransliterated: 'Al-Furqan', ayahCount: 77 },
  { number: 26, nameArabic: 'الشعراء', nameTransliterated: 'Ash-Shuara', ayahCount: 227 },
  { number: 27, nameArabic: 'النمل', nameTransliterated: 'An-Naml', ayahCount: 93 },
  { number: 28, nameArabic: 'القصص', nameTransliterated: 'Al-Qasas', ayahCount: 88 },
  { number: 29, nameArabic: 'العنكبوت', nameTransliterated: 'Al-Ankabut', ayahCount: 69 },
  { number: 30, nameArabic: 'الروم', nameTransliterated: 'Ar-Rum', ayahCount: 60 },
  { number: 31, nameArabic: 'لقمان', nameTransliterated: 'Luqman', ayahCount: 34 },
  { number: 32, nameArabic: 'السجدة', nameTransliterated: 'As-Sajdah', ayahCount: 30 },
  { number: 33, nameArabic: 'الأحزاب', nameTransliterated: 'Al-Ahzab', ayahCount: 73 },
  { number: 34, nameArabic: 'سبأ', nameTransliterated: 'Saba', ayahCount: 54 },
  { number: 35, nameArabic: 'فاطر', nameTransliterated: 'Fatir', ayahCount: 45 },
  { number: 36, nameArabic: 'يس', nameTransliterated: 'Ya-Sin', ayahCount: 83 },
  { number: 37, nameArabic: 'الصافات', nameTransliterated: 'As-Saffat', ayahCount: 182 },
  { number: 38, nameArabic: 'ص', nameTransliterated: 'Sad', ayahCount: 88 },
  { number: 39, nameArabic: 'الزمر', nameTransliterated: 'Az-Zumar', ayahCount: 75 },
  { number: 40, nameArabic: 'غافر', nameTransliterated: 'Ghafir', ayahCount: 85 },
  { number: 41, nameArabic: 'فصلت', nameTransliterated: 'Fussilat', ayahCount: 54 },
  { number: 42, nameArabic: 'الشورى', nameTransliterated: 'Ash-Shuraa', ayahCount: 53 },
  { number: 43, nameArabic: 'الزخرف', nameTransliterated: 'Az-Zukhruf', ayahCount: 89 },
  { number: 44, nameArabic: 'الدخان', nameTransliterated: 'Ad-Dukhan', ayahCount: 59 },
  { number: 45, nameArabic: 'الجاثية', nameTransliterated: 'Al-Jathiyah', ayahCount: 37 },
  { number: 46, nameArabic: 'الأحقاف', nameTransliterated: 'Al-Ahqaf', ayahCount: 35 },
  { number: 47, nameArabic: 'محمد', nameTransliterated: 'Muhammad', ayahCount: 38 },
  { number: 48, nameArabic: 'الفتح', nameTransliterated: 'Al-Fath', ayahCount: 29 },
  { number: 49, nameArabic: 'الحجرات', nameTransliterated: 'Al-Hujurat', ayahCount: 18 },
  { number: 50, nameArabic: 'ق', nameTransliterated: 'Qaf', ayahCount: 45 },
  { number: 51, nameArabic: 'الذاريات', nameTransliterated: 'Adh-Dhariyat', ayahCount: 60 },
  { number: 52, nameArabic: 'الطور', nameTransliterated: 'At-Tur', ayahCount: 49 },
  { number: 53, nameArabic: 'النجم', nameTransliterated: 'An-Najm', ayahCount: 62 },
  { number: 54, nameArabic: 'القمر', nameTransliterated: 'Al-Qamar', ayahCount: 55 },
  { number: 55, nameArabic: 'الرحمن', nameTransliterated: 'Ar-Rahman', ayahCount: 78 },
  { number: 56, nameArabic: 'الواقعة', nameTransliterated: 'Al-Waqiah', ayahCount: 96 },
  { number: 57, nameArabic: 'الحديد', nameTransliterated: 'Al-Hadid', ayahCount: 29 },
  { number: 58, nameArabic: 'المجادلة', nameTransliterated: 'Al-Mujadilah', ayahCount: 22 },
  { number: 59, nameArabic: 'الحشر', nameTransliterated: 'Al-Hashr', ayahCount: 24 },
  { number: 60, nameArabic: 'الممتحنة', nameTransliterated: 'Al-Mumtahanah', ayahCount: 13 },
  { number: 61, nameArabic: 'الصف', nameTransliterated: 'As-Saff', ayahCount: 14 },
  { number: 62, nameArabic: 'الجمعة', nameTransliterated: 'Al-Jumuah', ayahCount: 11 },
  { number: 63, nameArabic: 'المنافقون', nameTransliterated: 'Al-Munafiqun', ayahCount: 11 },
  { number: 64, nameArabic: 'التغابن', nameTransliterated: 'At-Taghabun', ayahCount: 18 },
  { number: 65, nameArabic: 'الطلاق', nameTransliterated: 'At-Talaq', ayahCount: 12 },
  { number: 66, nameArabic: 'التحريم', nameTransliterated: 'At-Tahrim', ayahCount: 12 },
  { number: 67, nameArabic: 'الملك', nameTransliterated: 'Al-Mulk', ayahCount: 30 },
  { number: 68, nameArabic: 'القلم', nameTransliterated: 'Al-Qalam', ayahCount: 52 },
  { number: 69, nameArabic: 'الحاقة', nameTransliterated: 'Al-Haqqah', ayahCount: 52 },
  { number: 70, nameArabic: 'المعارج', nameTransliterated: 'Al-Maarij', ayahCount: 44 },
  { number: 71, nameArabic: 'نوح', nameTransliterated: 'Nuh', ayahCount: 28 },
  { number: 72, nameArabic: 'الجن', nameTransliterated: 'Al-Jinn', ayahCount: 28 },
  { number: 73, nameArabic: 'المزمل', nameTransliterated: 'Al-Muzzammil', ayahCount: 20 },
  { number: 74, nameArabic: 'المدثر', nameTransliterated: 'Al-Muddaththir', ayahCount: 56 },
  { number: 75, nameArabic: 'القيامة', nameTransliterated: 'Al-Qiyamah', ayahCount: 40 },
  { number: 76, nameArabic: 'الانسان', nameTransliterated: 'Al-Insan', ayahCount: 31 },
  { number: 77, nameArabic: 'المرسلات', nameTransliterated: 'Al-Mursalat', ayahCount: 50 },
  { number: 78, nameArabic: 'النبأ', nameTransliterated: 'An-Naba', ayahCount: 40 },
  { number: 79, nameArabic: 'النازعات', nameTransliterated: 'An-Naziat', ayahCount: 46 },
  { number: 80, nameArabic: 'عبس', nameTransliterated: 'Abasa', ayahCount: 42 },
  { number: 81, nameArabic: 'التكوير', nameTransliterated: 'At-Takwir', ayahCount: 29 },
  { number: 82, nameArabic: 'الإنفطار', nameTransliterated: 'Al-Infitar', ayahCount: 19 },
  { number: 83, nameArabic: 'المطففين', nameTransliterated: 'Al-Mutaffifin', ayahCount: 36 },
  { number: 84, nameArabic: 'الإنشقاق', nameTransliterated: 'Al-Inshiqaq', ayahCount: 25 },
  { number: 85, nameArabic: 'البروج', nameTransliterated: 'Al-Buruj', ayahCount: 22 },
  { number: 86, nameArabic: 'الطارق', nameTransliterated: 'At-Tariq', ayahCount: 17 },
  { number: 87, nameArabic: 'الأعلى', nameTransliterated: 'Al-Ala', ayahCount: 19 },
  { number: 88, nameArabic: 'الغاشية', nameTransliterated: 'Al-Ghashiyah', ayahCount: 26 },
  { number: 89, nameArabic: 'الفجر', nameTransliterated: 'Al-Fajr', ayahCount: 30 },
  { number: 90, nameArabic: 'البلد', nameTransliterated: 'Al-Balad', ayahCount: 20 },
  { number: 91, nameArabic: 'الشمس', nameTransliterated: 'Ash-Shams', ayahCount: 15 },
  { number: 92, nameArabic: 'الليل', nameTransliterated: 'Al-Layl', ayahCount: 21 },
  { number: 93, nameArabic: 'الضحى', nameTransliterated: 'Ad-Duhaa', ayahCount: 11 },
  { number: 94, nameArabic: 'الشرح', nameTransliterated: 'Ash-Sharh', ayahCount: 8 },
  { number: 95, nameArabic: 'التين', nameTransliterated: 'At-Tin', ayahCount: 8 },
  { number: 96, nameArabic: 'العلق', nameTransliterated: 'Al-Alaq', ayahCount: 19 },
  { number: 97, nameArabic: 'القدر', nameTransliterated: 'Al-Qadr', ayahCount: 5 },
  { number: 98, nameArabic: 'البينة', nameTransliterated: 'Al-Bayyinah', ayahCount: 8 },
  { number: 99, nameArabic: 'الزلزلة', nameTransliterated: 'Az-Zalzalah', ayahCount: 8 },
  { number: 100, nameArabic: 'العاديات', nameTransliterated: 'Al-Adiyat', ayahCount: 11 },
  { number: 101, nameArabic: 'القارعة', nameTransliterated: 'Al-Qariah', ayahCount: 11 },
  { number: 102, nameArabic: 'التكاثر', nameTransliterated: 'At-Takathur', ayahCount: 8 },
  { number: 103, nameArabic: 'العصر', nameTransliterated: 'Al-Asr', ayahCount: 3 },
  { number: 104, nameArabic: 'الهمزة', nameTransliterated: 'Al-Humazah', ayahCount: 9 },
  { number: 105, nameArabic: 'الفيل', nameTransliterated: 'Al-Fil', ayahCount: 5 },
  { number: 106, nameArabic: 'قريش', nameTransliterated: 'Quraysh', ayahCount: 4 },
  { number: 107, nameArabic: 'الماعون', nameTransliterated: 'Al-Maun', ayahCount: 7 },
  { number: 108, nameArabic: 'الكوثر', nameTransliterated: 'Al-Kawthar', ayahCount: 3 },
  { number: 109, nameArabic: 'الكافرون', nameTransliterated: 'Al-Kafirun', ayahCount: 6 },
  { number: 110, nameArabic: 'النصر', nameTransliterated: 'An-Nasr', ayahCount: 3 },
  { number: 111, nameArabic: 'المسد', nameTransliterated: 'Al-Masad', ayahCount: 5 },
  { number: 112, nameArabic: 'الإخلاص', nameTransliterated: 'Al-Ikhlas', ayahCount: 4 },
  { number: 113, nameArabic: 'الفلق', nameTransliterated: 'Al-Falaq', ayahCount: 5 },
  { number: 114, nameArabic: 'الناس', nameTransliterated: 'An-Nas', ayahCount: 6 },
];

export function getJuzForPage(pageNumber: number): number {
  let juz = 1;
  for (let j = 1; j <= TOTAL_JUZ; j++) {
    const start = JUZ_START_PAGES[j];
    if (start !== undefined && pageNumber >= start) {
      juz = j;
    }
  }
  return juz;
}

export function getJuzPageRange(juz: number): { start: number; end: number } {
  const start = JUZ_START_PAGES[juz];
  if (start === undefined) throw new Error(`Juz' inválido: ${juz}`);
  const nextStart = juz < TOTAL_JUZ ? JUZ_START_PAGES[juz + 1] : TOTAL_PAGES + 1;
  return { start, end: (nextStart ?? TOTAL_PAGES + 1) - 1 };
}
