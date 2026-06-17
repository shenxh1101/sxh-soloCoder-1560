export type ProjectStatus = 'pending' | 'ongoing' | 'completed';
export type StageStatus = 'pending' | 'ongoing' | 'completed';
export type StageName = '水电' | '泥瓦' | '木工' | '油漆' | '安装';

export interface Project {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  budget: number;
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
  specialty?: string;
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
