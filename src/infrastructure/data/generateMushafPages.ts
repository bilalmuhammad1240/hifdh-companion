import {
  JUZ_START_PAGES,
  TOTAL_PAGES,
  TOTAL_JUZ,
  SURAHS,
  getJuzForPage,
  getJuzPageRange,
  type SurahMeta,
} from './mushafConstants';

export interface MushafahPageData {
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number; // 1-60 (2 por Juz')
  rubNumber: number; // 1-240 (4 por Hizb)
  surahStart: number;
  surahStartName: string;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;
  isMutashabih: boolean;
}

/**
 * Páginas conhecidas por terem trechos Mutashabihat (versículos com forte
 * similaridade textual em outras partes do Quran), que exigem atenção
 * redobrada do Muhaffidh. Lista não exaustiva — cobre os casos clássicos
 * mais citados na literatura de Hifdh (ex: histórias repetidas dos profetas,
 * versículos quase-idênticos entre Surahs).
 */
const KNOWN_MUTASHABIH_PAGES = new Set<number>([
  // Trechos com histórias proféticas repetidas (Ash-Shuara, As-Saffat, etc.)
  368, 369, 370, 371, 372, 373, 374, 375,
  // Versos quase-idênticos em Al-Baqarah / Aali-Imran
  40, 41, 49, 50,
  // Ar-Rahman (repetição estrutural intensa)
  531, 532,
  // Al-Mursalat (refrão repetido)
  580,
]);

/**
 * Gera os metadados completos das 604 páginas do Mushaf Al-Madinah.
 *
 * NOTA IMPORTANTE: o mapeamento exato Surah/Ayah por página varia
 * ligeiramente entre diferentes impressões do Mushaf Al-Madinah. Esta
 * função fornece uma distribuição proporcional consistente e estável,
 * adequada para fins de planejamento e rastreamento de Hifdh. Madrassahs
 * que necessitem de precisão absoluta linha-a-linha podem substituir este
 * dataset por uma tabela oficial digitalizada (ex: via API do Mushaf da
 * King Fahd Complex), mantendo a mesma interface MushafahPageData.
 */
export function generateMushafPages(): MushafahPageData[] {
  const pages: MushafahPageData[] = [];

  // Distribui surahs ao longo das 604 páginas proporcionalmente ao número de ayahs,
  // respeitando que cada Surah começa em alguma página específica.
  const totalAyahs = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);

  // Posição acumulada de ayah "global" por página, usada para localizar
  // qual Surah/Ayah está ativa em cada página.
  let globalAyahCursor = 0;
  let surahIndex = 0;
  let ayahWithinSurah = 1;

  const ayahsPerPageBase = totalAyahs / TOTAL_PAGES;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const juzNumber = getJuzForPage(page);
    const { start: juzStart, end: juzEnd } = getJuzPageRange(juzNumber);
    const juzPageCount = juzEnd - juzStart + 1;
    const positionInJuz = page - juzStart; // 0-indexed

    // Hizb: 2 por Juz'. Rub': 4 por Hizb (8 por Juz').
    const halfJuz = juzPageCount / 2;
    const hizbOffsetInJuz = positionInJuz < halfJuz ? 0 : 1;
    const hizbNumber = (juzNumber - 1) * 2 + hizbOffsetInJuz + 1;

    const quarterJuz = juzPageCount / 4;
    const rubOffsetInJuz = Math.min(3, Math.floor(positionInJuz / quarterJuz));
    const rubNumber = (juzNumber - 1) * 8 + rubOffsetInJuz + 1;

    const surahStartForPage = SURAHS[surahIndex] as SurahMeta;
    const ayahStart = ayahWithinSurah;

    // Avança o cursor de ayahs proporcionalmente para esta página
    const ayahsThisPage = Math.max(1, Math.round(ayahsPerPageBase));
    let remaining = ayahsThisPage;

    while (remaining > 0 && surahIndex < SURAHS.length) {
      const currentSurah = SURAHS[surahIndex] as SurahMeta;
      const ayahsLeftInSurah = currentSurah.ayahCount - ayahWithinSurah + 1;

      if (remaining < ayahsLeftInSurah) {
        ayahWithinSurah += remaining;
        remaining = 0;
      } else {
        remaining -= ayahsLeftInSurah;
        globalAyahCursor += ayahsLeftInSurah;
        surahIndex = Math.min(surahIndex + 1, SURAHS.length - 1);
        ayahWithinSurah = 1;
        if (remaining === 0 && surahIndex >= SURAHS.length - 1) break;
      }
    }

    const surahEndForPage = SURAHS[surahIndex] as SurahMeta;
    const ayahEnd = Math.max(ayahStart, ayahWithinSurah - 1 >= 1 ? ayahWithinSurah - 1 : ayahStart);

    pages.push({
      pageNumber: page,
      juzNumber,
      hizbNumber,
      rubNumber,
      surahStart: surahStartForPage.number,
      surahStartName: surahStartForPage.nameTransliterated,
      ayahStart,
      surahEnd: surahEndForPage.number,
      ayahEnd,
      isMutashabih: KNOWN_MUTASHABIH_PAGES.has(page),
    });
  }

  return pages;
}

export const MUSHAF_PAGES: MushafahPageData[] = generateMushafPages();

export function getMushafPage(pageNumber: number): MushafahPageData {
  const page = MUSHAF_PAGES[pageNumber - 1];
  if (!page) throw new Error(`Página não encontrada: ${pageNumber}`);
  return page;
}

export function getPagesForJuz(juz: number): MushafahPageData[] {
  const { start, end } = getJuzPageRange(juz);
  return MUSHAF_PAGES.filter((p) => p.pageNumber >= start && p.pageNumber <= end);
}
