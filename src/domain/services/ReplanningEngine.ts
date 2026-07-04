import { PageMastery, PageStatus } from '../entities/PageMastery';
import { HifdhConfigInput } from './DailyPlanGenerator';

export type ReplanTrigger =
  | 'STUDENT_ABSENT'
  | 'STUDENT_SICK'
  | 'PAGES_FORGOTTEN'
  | 'PACE_INCREASED'
  | 'PACE_DECREASED'
  | 'TEACHER_FAILED_REVIEW'
  | 'TEACHER_CHANGED_PACE'
  | 'WEEKLY_REVIEW_WEAK'
  | 'GOAL_DATE_APPROACHING';

export interface ReplanResult {
  updatedConfig: HifdhConfigInput;
  explanation: string;
  impact: {
    projectedDaysShift: number; // dias a mais (+) ou a menos (-) na data de conclusão
    pagesRedistributed: number;
  };
}

export interface ReplanContext {
  config: HifdhConfigInput;
  allPages: PageMastery[];
  goalPageEnd: number;
  targetEndDate: Date;
  today: Date;
  daysAbsent?: number;
  newPagesPerDayRequested?: number;
}

/**
 * ReplanningEngine — Reage a eventos pedagógicos reorganizando o plano,
 * em vez de simplesmente empurrá-lo para frente.
 *
 * Implementa diretamente a exigência da arquitetura: "O algoritmo nunca
 * deverá simplesmente empurrar o cronograma para frente."
 */
export class ReplanningEngine {
  static handle(trigger: ReplanTrigger, ctx: ReplanContext): ReplanResult {
    switch (trigger) {
      case 'STUDENT_ABSENT':
        return ReplanningEngine.handleAbsence(ctx);
      case 'STUDENT_SICK':
        return ReplanningEngine.handleSickness(ctx);
      case 'PAGES_FORGOTTEN':
        return ReplanningEngine.handleForgottenPages(ctx);
      case 'PACE_DECREASED':
        return ReplanningEngine.handlePaceChange(ctx, 'decrease');
      case 'PACE_INCREASED':
        return ReplanningEngine.handlePaceChange(ctx, 'increase');
      case 'TEACHER_FAILED_REVIEW':
        return ReplanningEngine.handleTeacherFailure(ctx);
      case 'TEACHER_CHANGED_PACE':
        return ReplanningEngine.handleTeacherChangedPace(ctx);
      case 'WEEKLY_REVIEW_WEAK':
        return ReplanningEngine.handleWeakWeeklyReview(ctx);
      case 'GOAL_DATE_APPROACHING':
        return ReplanningEngine.handleGoalApproaching(ctx);
    }
  }

  private static handleAbsence(ctx: ReplanContext): ReplanResult {
    const daysAbsent = ctx.daysAbsent ?? 1;
    // Redistribui o conteúdo perdido ao longo de 3-5 dias úteis,
    // reduzindo temporariamente o Sabaq para priorizar recuperação do Sabqi.
    const recoveryDays = Math.min(5, Math.max(3, daysAbsent * 2));
    const reducedPace = Math.max(0.5, ctx.config.newPagesPerDay * 0.6);

    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: reducedPace },
      explanation: `Você ficou ausente por ${daysAbsent} dia(s). Em vez de simplesmente avançar o cronograma, reduzimos temporariamente o ritmo de novas páginas pelos próximos ${recoveryDays} dias para que o Sabqi seja recuperado com segurança antes de prosseguir.`,
      impact: {
        projectedDaysShift: daysAbsent * 2,
        pagesRedistributed: daysAbsent,
      },
    };
  }

  private static handleSickness(ctx: ReplanContext): ReplanResult {
    // Janela de recuperação maior que ausência comum; pausa total do Sabaq.
    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: 0 },
      explanation: `Esperamos que sua saúde melhore em breve. A nova memorização foi pausada e será retomada gradualmente quando você confirmar que está pronto, com uma semana de readaptação suave.`,
      impact: { projectedDaysShift: 7, pagesRedistributed: 0 },
    };
  }

  private static handleForgottenPages(ctx: ReplanContext): ReplanResult {
    const forgottenCount = ctx.allPages.filter(
      (p) => p.status === PageStatus.FORGOTTEN
    ).length;

    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: 0, maxManzilPages: ctx.config.maxManzilPages + forgottenCount },
      explanation: `Detectamos ${forgottenCount} página(s) esquecida(s). A nova memorização foi pausada e o limite diário de revisão (Manzil) foi temporariamente aumentado para acelerar a recuperação dessas páginas.`,
      impact: { projectedDaysShift: forgottenCount, pagesRedistributed: forgottenCount },
    };
  }

  private static handlePaceChange(
    ctx: ReplanContext,
    direction: 'increase' | 'decrease'
  ): ReplanResult {
    const requested = ctx.newPagesPerDayRequested ?? ctx.config.newPagesPerDay;
    const memorized = ctx.allPages.filter((p) => p.status !== PageStatus.NOT_STARTED).length;
    const remaining = ctx.goalPageEnd - memorized;
    const daysRemaining = Math.max(
      1,
      Math.ceil((ctx.targetEndDate.getTime() - ctx.today.getTime()) / (1000 * 60 * 60 * 24))
    );
    const requiredPace = remaining / daysRemaining;

    const explanation =
      direction === 'decrease'
        ? `Seu ritmo foi ajustado para ${requested} página(s)/dia. Mantendo este ritmo, a data de conclusão será recalculada automaticamente — o sistema prioriza a qualidade da memorização sobre cumprir uma data rígida.`
        : `Seu ritmo foi aumentado para ${requested} página(s)/dia. O sistema continuará monitorando a saúde do seu Sabqi e Manzil para garantir que o ritmo mais acelerado não comprometa a retenção.`;

    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: requested },
      explanation,
      impact: {
        projectedDaysShift: Math.round((requiredPace - requested) * daysRemaining),
        pagesRedistributed: 0,
      },
    };
  }

  private static handleTeacherFailure(ctx: ReplanContext): ReplanResult {
    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: Math.max(0.5, ctx.config.newPagesPerDay * 0.7) },
      explanation: `Seu professor reprovou a revisão recente. O ritmo de novas páginas foi reduzido temporariamente para consolidar o que já foi visto antes de avançar.`,
      impact: { projectedDaysShift: 3, pagesRedistributed: 1 },
    };
  }

  private static handleTeacherChangedPace(ctx: ReplanContext): ReplanResult {
    const requested = ctx.newPagesPerDayRequested ?? ctx.config.newPagesPerDay;
    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: requested },
      explanation: `Seu professor ajustou seu ritmo diário para ${requested} página(s)/dia. O cronograma foi recalculado de acordo.`,
      impact: { projectedDaysShift: 0, pagesRedistributed: 0 },
    };
  }

  private static handleWeakWeeklyReview(ctx: ReplanContext): ReplanResult {
    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: Math.max(0.5, ctx.config.newPagesPerDay * 0.8), maxSabqiPages: ctx.config.maxSabqiPages + 3 },
      explanation: `A revisão semanal revelou pontos fracos. O ritmo de novas páginas foi levemente reduzido e o limite de revisão recente (Sabqi) foi ampliado para fortalecer a base.`,
      impact: { projectedDaysShift: 2, pagesRedistributed: 0 },
    };
  }

  private static handleGoalApproaching(ctx: ReplanContext): ReplanResult {
    const memorized = ctx.allPages.filter((p) => p.status !== PageStatus.NOT_STARTED).length;
    const remaining = ctx.goalPageEnd - memorized;
    const daysRemaining = Math.max(
      1,
      Math.ceil((ctx.targetEndDate.getTime() - ctx.today.getTime()) / (1000 * 60 * 60 * 24))
    );
    const requiredPace = remaining / daysRemaining;

    return {
      updatedConfig: { ...ctx.config, newPagesPerDay: Math.max(ctx.config.newPagesPerDay, requiredPace) },
      explanation: `Sua data-alvo está se aproximando. Restam ${remaining} páginas em ${daysRemaining} dias — isso exigiria aproximadamente ${requiredPace.toFixed(
        1
      )} página(s)/dia. Considere conversar com seu professor sobre ajustar a data-alvo se este ritmo não for sustentável com qualidade.`,
      impact: { projectedDaysShift: 0, pagesRedistributed: 0 },
    };
  }
}
