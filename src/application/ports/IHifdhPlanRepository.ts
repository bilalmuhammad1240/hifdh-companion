import { HifdhConfigInput } from '@/domain/services/DailyPlanGenerator';

export interface HifdhPlanRecord {
  id: string;
  studentId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  goalJuzStart: number;
  goalJuzEnd: number;
  goalPageStart: number;
  goalPageEnd: number;
  startDate: Date;
  targetEndDate: Date;
  actualEndDate: Date | null;
  config: HifdhConfigInput;
}

export interface IHifdhPlanRepository {
  findById(id: string): Promise<HifdhPlanRecord | null>;
  findActiveByStudentId(studentId: string): Promise<HifdhPlanRecord | null>;
  create(plan: Omit<HifdhPlanRecord, 'id'>): Promise<HifdhPlanRecord>;
  updateConfig(planId: string, config: HifdhConfigInput): Promise<void>;
}
