export type ProjectStatus = 'pending' | 'ongoing' | 'completed';
export type StageStatus = 'pending' | 'ongoing' | 'completed';
export type StageName = '水电' | '泥瓦' | '木工' | '油漆' | '安装';

export type MaterialCategory = '水泥' | '瓷砖' | '油漆' | '五金' | '板材' | '水电材料' | '门窗' | '洁具' | '灯具' | '其他';

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  '水泥', '瓷砖', '油漆', '五金', '板材', '水电材料', '门窗', '洁具', '灯具', '其他'
];

export type ActivityType =
  | 'stage_start'
  | 'stage_complete'
  | 'worker_change'
  | 'material_add'
  | 'material_update'
  | 'material_delete'
  | 'project_create'
  | 'project_update';

export interface ActivityLog {
  id: string;
  projectId: string;
  type: ActivityType;
  content: string;
  createdAt: string;
}

export interface CategoryBudget {
  category: MaterialCategory;
  budget: number;
}

export interface Project {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  budget: number;
  categoryBudgets?: CategoryBudget[];
  status: ProjectStatus;
  createdAt: string;
}

export interface Stage {
  id: string;
  projectId: string;
  name: StageName;
  order: number;
  status: StageStatus;
  startTime?: string;
  endTime?: string;
  workerId?: string;
  workerName?: string;
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  category: MaterialCategory;
  spec?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  remark?: string;
}

export interface Worker {
  id: string;
  name: string;
  phone?: string;
  specialty?: StageName | string;
  createdAt?: string;
}

export interface WorkerStats {
  workerId: string;
  workerName: string;
  stageCount: number;
  completedCount: number;
  stages: {
    projectId: string;
    projectName: string;
    stageName: StageName;
    status: StageStatus;
  }[];
}

export interface CategoryCost {
  category: MaterialCategory;
  total: number;
  budget?: number;
}
