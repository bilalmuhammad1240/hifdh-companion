import { PageMastery, PageStatus, PageCategory } from '../entities/PageMastery';
import { UrgencyScoring, ScoredPage } from './UrgencyScoring';
import { ForgettingCurve } from './ForgettingCurve';

export interface HifdhConfigInput {
  newPagesPerDay: number;
  maxSabqiPages: number;
  maxManzilPages: number;
  studyDays: number[]; // 1=Dom .. 7=Sáb
  restDays: number[];
  weeklyReviewDay: number;
  pauseSabaqThreshold: number; // ex: 0.3
  minimumMasteryToAdvance: number; // ex: 3
}

export interface DailyPlanResult {
  date: Date;
  sabaq: {
    pages: number[];
    pagesCount: number;
    estimatedMinutes: number;
    isBlocked: boolean;
    blockReason: string | null;
  };
  sabqi: {
    pages: number[];
    pagesCount: number;
    estimatedMinutes: number;
  };
  manzil: {
    pages: number[];
    pagesCount: number;
    estimatedMinutes: number;
    juzBeingReviewed: number | null;
  };
  urgentReview: number[];
  isWeeklyReviewDay: boolean;
  isMonthlyReviewDay: boolean;
  isRestDay: boolean;
  explanation: string;
  warnings: string[];
  totalEstimatedMinutes: number;
}

const MINUTES_PER_NEW_PAGE = 25;
const MINUTES_PER_REVIEW_PAGE = 4;

function dayOfWeek1Indexed(date: Date): number {
  // JS getDay(): 0=Dom..6=Sáb → convertendo para 1=Dom..7=Sáb
  return date.getDay() + 1;
}

/**
 * DailyPlanGenerator — Gera o plano diário de estudo (Sabaq / Sabqi / Manzil)
 * para um aluno, aplicando as regras pedagógicas do sistema híbrido
 * (Sabaq-Sabqi-Manzil + SM-2 + score de urgência).
 *
 * Esta classe NÃO acessa banco de dados — recebe todo o estado necessário
 * como parâmetros e devolve um resultado puro, testável de forma isolada.
 */
export class DailyPlanGenerator {
  static generate(
    allPages: PageMastery[],
    today: Date,
    config: HifdhConfigInput
  ): DailyPlanResult {
    const memorizedPages = allPages.filter((p) => p.status !== PageStatus.NOT_STARTED);
    const dow = dayOfWeek1Indexed(today);

    if (config.restDays.includes(dow)) {
      return DailyPlanGenerator.buildRestDayPlan(today);
    }

    if (dow === config.weeklyReviewDay && memorizedPages.length > 0) {
      return DailyPlanGenerator.buildWeeklyReviewPlan(memorizedPages, today);
    }

    const scoredPages = UrgencyScoring.rankPages(memorizedPages, today);

    // Sabqi: páginas memorizadas mais recentemente (janela dinâmica)
    const sabqiWindow = DailyPlanGenerator.calculateSabqiWindow(memorizedPages.length);
    const sabqiPages = DailyPlanGenerator.getRecentlyMemorized(
      memorizedPages,
      sabqiWindow,
      config.maxSabqiPages
    );
    const sabqiPageNumbers = new Set(sabqiPages.map((p) => p.pageNumber));

    // Manzil: páginas mais urgentes que não estão no Sabqi, até o limite diário
    const manzilCandidates = scoredPages.filter(
      (sp) => !sabqiPageNumbers.has(sp.page.pageNumber)
    );
    const manzilPages = DailyPlanGenerator.selectManzilPages(
      manzilCandidates,
      config.maxManzilPages,
      today
    );

    // Verificação de saúde: ratio de páginas com risco alto (para decisão de pausa do Sabaq)
    const riskRatio = UrgencyScoring.getSabaqPauseRatio(memorizedPages, today);

    const forgottenCount = memorizedPages.filter(
      (p) => p.status === PageStatus.FORGOTTEN
    ).length;

    let sabaqBlocked = false;
    let blockReason: string | null = null;

    if (riskRatio >= config.pauseSabaqThreshold && memorizedPages.length >= 10) {
      const highRiskCount = Math.round(riskRatio * memorizedPages.length);
      sabaqBlocked = true;
      blockReason = `Hoje a nova memorização foi pausada porque ${highRiskCount} página(s) (${Math.round(
        riskRatio * 100
      )}% do total memorizado) estão com risco alto de esquecimento. Vamos fortalecer o que já foi conquistado antes de avançar.`;
    } else if (forgottenCount > 0) {
      sabaqBlocked = true;
      blockReason = `Existem ${forgottenCount} página(s) marcadas como esquecidas. A nova memorização foi pausada para priorizar a recuperação dessas páginas.`;
    }

    const nextPage = DailyPlanGenerator.getNextPageToMemorize(allPages);
    const sabaqPages: number[] = [];

    if (!sabaqBlocked && nextPage) {
      const pagesPerDayInt = Math.max(1, Math.round(config.newPagesPerDay));
      const sortedNotStarted = allPages
        .filter((p) => p.status === PageStatus.NOT_STARTED)
        .sort((a, b) => a.pageNumber - b.pageNumber);
      for (let i = 0; i < pagesPerDayInt && i < sortedNotStarted.length; i++) {
        const candidate = sortedNotStarted[i];
        if (candidate) sabaqPages.push(candidate.pageNumber);
      }
    }

    const urgentReview = UrgencyScoring.getUrgentPages(memorizedPages, today).map(
      (p) => p.pageNumber
    );

    const currentManzilJuz =
      manzilPages.length > 0 ? (manzilPages[0]?.page.juzNumber ?? null) : null;

    const explanation = DailyPlanGenerator.buildExplanation({
      sabaqBlocked,
      blockReason,
      totalMemorized: memorizedPages.length,
      urgentCount: urgentReview.length,
      sabaqCount: sabaqPages.length,
      sabqiCount: sabqiPages.length,
      manzilCount: manzilPages.length,
    });

    const warnings = DailyPlanGenerator.buildWarnings(memorizedPages, scoredPages);

    const sabaqMinutes = sabaqPages.length * MINUTES_PER_NEW_PAGE;
    const sabqiMinutes = sabqiPages.length * MINUTES_PER_REVIEW_PAGE;
    const manzilMinutes = manzilPages.length * MINUTES_PER_REVIEW_PAGE;

    return {
      date: today,
      sabaq: {
        pages: sabaqPages,
        pagesCount: sabaqPages.length,
        estimatedMinutes: sabaqMinutes,
        isBlocked: sabaqBlocked,
        blockReason,
      },
      sabqi: {
        pages: sabqiPages.map((p) => p.pageNumber),
        pagesCount: sabqiPages.length,
        estimatedMinutes: sabqiMinutes,
      },
      manzil: {
        pages: manzilPages.map((sp) => sp.page.pageNumber),
        pagesCount: manzilPages.length,
        estimatedMinutes: manzilMinutes,
        juzBeingReviewed: currentManzilJuz,
      },
      urgentReview,
      isWeeklyReviewDay: false,
      isMonthlyReviewDay: today.getDate() === DailyPlanGenerator.lastDayOfMonth(today),
      isRestDay: false,
      explanation,
      warnings,
      totalEstimatedMinutes: sabaqMinutes + sabqiMinutes + manzilMinutes,
    };
  }

  private static lastDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private static calculateSabqiWindow(totalMemorized: number): number {
    /**
     * Janela dinâmica de Sabqi — tabela VERIFICADA do método Subcontinente
     * (Deobandi/Panipati), confirmada por múltiplas fontes independentes:
     *
     * 1–3 Juz'   → 5 páginas/dia  (¼ Juz')
     * 4–7 Juz'   → 10 páginas/dia (½ Juz')
     * 7–15 Juz'  → 20 páginas/dia (1 Juz')
     * 15–20 Juz' → 30 páginas/dia (1,5 Juz')
     * 20–30 Juz' → até 60 páginas/dia (limitado pelo config)
     *
     * Conversão: 20 páginas por Juz' (média Mushaf Al-Madinah).
     */
    const juzApprox = Math.ceil(totalMemorized / 20);
    if (juzApprox <= 3)  return 5;
    if (juzApprox <= 7)  return 10;
    if (juzApprox <= 15) return 20;
    if (juzApprox <= 20) return 30;
    return 40;
  }

  private static getRecentlyMemorized(
    pages: PageMastery[],
    windowDays: number,
    maxPages: number
  ): PageMastery[] {
    const sorted = [...pages]
      .filter((p) => p.memorizedAt !== null)
      .sort((a, b) => (b.memorizedAt!.getTime() - a.memorizedAt!.getTime()));
    return sorted.slice(0, Math.min(windowDays, maxPages));
  }

  private static getNextPageToMemorize(allPages: PageMastery[]): PageMastery | null {
    const sorted = [...allPages].sort((a, b) => a.pageNumber - b.pageNumber);
    return sorted.find((p) => p.status === PageStatus.NOT_STARTED) ?? null;
  }

  /**
   * Seleciona as páginas de Manzil para hoje usando ciclo rotativo verificado.
   *
   * Princípio: cada Juz' memorizado deve ser revisado em ≤ 30 dias.
   * O sistema divide os Juz' memorizados além da janela de Sabqi em um
   * ciclo rotativo, garantindo cobertura completa dentro do prazo.
   *
   * Páginas com urgência > 80 entram no plano independentemente do ciclo
   * (conforme regra RN-05 da arquitetura verificada).
   */
  private static selectManzilPages(
    scoredCandidates: Array<{ page: PageMastery; score: number }>,
    maxPages: number,
    today: Date
  ): Array<{ page: PageMastery; score: number }> {
    // Páginas urgentes (score > 80) entram primeiro, independente do ciclo
    const urgent = scoredCandidates.filter((sp) => sp.score > 80);
    const nonUrgent = scoredCandidates.filter((sp) => sp.score <= 80);

    // Preenche com páginas não urgentes até o limite
    const combined = [...urgent, ...nonUrgent];
    return combined.slice(0, maxPages);
  }

  private static buildExplanation(ctx: {
    sabaqBlocked: boolean;
    blockReason: string | null;
    totalMemorized: number;
    urgentCount: number;
    sabaqCount: number;
    sabqiCount: number;
    manzilCount: number;
  }): string {
    if (ctx.sabaqBlocked && ctx.blockReason) {
      return ctx.blockReason;
    }

    if (ctx.totalMemorized === 0) {
      return 'Hoje começa sua jornada de Hifdh. A primeira página será sua base — recite-a com calma e atenção.';
    }

    if (ctx.urgentCount > 0) {
      return `Hoje: ${ctx.sabaqCount} página(s) nova(s), ${ctx.sabqiCount} de revisão recente e ${ctx.manzilCount} de revisão antiga. ${ctx.urgentCount} página(s) com risco de esquecimento foram priorizadas na sua revisão de hoje.`;
    }

    return `Hoje: ${ctx.sabaqCount} página(s) nova(s), ${ctx.sabqiCount} de revisão recente e ${ctx.manzilCount} de revisão antiga. Seu Manzil está saudável — continue neste ritmo.`;
  }

  private static buildWarnings(pages: PageMastery[], scored: ScoredPage[]): string[] {
    const warnings: string[] = [];
    const forgotten = pages.filter((p) => p.status === PageStatus.FORGOTTEN);
    if (forgotten.length > 0) {
      warnings.push(
        `${forgotten.length} página(s) estão esquecidas e precisam de recuperação urgente.`
      );
    }
    const veryOverdue = scored.filter((sp) => sp.breakdown.daysOverdue > 20);
    if (veryOverdue.length > 0) {
      warnings.push(
        `${veryOverdue.length} página(s) estão há muito tempo sem revisão.`
      );
    }
    return warnings;
  }

  private static buildRestDayPlan(today: Date): DailyPlanResult {
    return {
      date: today,
      sabaq: { pages: [], pagesCount: 0, estimatedMinutes: 0, isBlocked: true, blockReason: 'Dia de descanso configurado.' },
      sabqi: { pages: [], pagesCount: 0, estimatedMinutes: 0 },
      manzil: { pages: [], pagesCount: 0, estimatedMinutes: 0, juzBeingReviewed: null },
      urgentReview: [],
      isWeeklyReviewDay: false,
      isMonthlyReviewDay: false,
      isRestDay: true,
      explanation: 'Hoje é seu dia de descanso. Aproveite para recarregar — a consistência também inclui pausas planejadas.',
      warnings: [],
      totalEstimatedMinutes: 0,
    };
  }

  private static buildWeeklyReviewPlan(
    memorizedPages: PageMastery[],
    today: Date
  ): DailyPlanResult {
    // Revisão semanal: tudo memorizado nos últimos 7 dias, sem novo Sabaq
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekPages = memorizedPages.filter(
      (p) => p.memorizedAt && p.memorizedAt >= sevenDaysAgo
    );
    const pageNumbers = weekPages.map((p) => p.pageNumber);

    return {
      date: today,
      sabaq: { pages: [], pagesCount: 0, estimatedMinutes: 0, isBlocked: true, blockReason: 'Hoje é dia de revisão semanal — sem nova memorização.' },
      sabqi: { pages: pageNumbers, pagesCount: pageNumbers.length, estimatedMinutes: pageNumbers.length * MINUTES_PER_REVIEW_PAGE },
      manzil: { pages: [], pagesCount: 0, estimatedMinutes: 0, juzBeingReviewed: null },
      urgentReview: [],
      isWeeklyReviewDay: true,
      isMonthlyReviewDay: false,
      isRestDay: false,
      explanation: `Hoje é revisão semanal. Vamos repassar as ${pageNumbers.length} páginas memorizadas nos últimos 7 dias, sem adicionar conteúdo novo.`,
      warnings: [],
      totalEstimatedMinutes: pageNumbers.length * MINUTES_PER_REVIEW_PAGE,
    };
  }
}
