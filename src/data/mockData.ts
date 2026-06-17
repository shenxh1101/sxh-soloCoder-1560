import type { Project, Stage, Material, Worker, StageName } from '../types';
import { generateId } from '../utils/id';

const STAGE_NAMES: StageName[] = ['水电', '泥瓦', '木工', '油漆', '安装'];

export const createDefaultStages = (projectId: string): Stage[] => {
  return STAGE_NAMES.map((name, index) => ({
    id: generateId(),
    projectId,
    name,
    order: index + 1,
    status: 'pending' as const,
  }));
};

const project1Id = generateId();
const project2Id = generateId();
const project3Id = generateId();

export const mockWorkers: Worker[] = [
  { id: generateId(), name: '张师傅', phone: '13800138001', specialty: '水电工' },
  { id: generateId(), name: '李师傅', phone: '13800138002', specialty: '泥瓦工' },
  { id: generateId(), name: '王师傅', phone: '13800138003', specialty: '木工' },
  { id: generateId(), name: '赵师傅', phone: '13800138004', specialty: '油漆工' },
  { id: generateId(), name: '刘师傅', phone: '13800138005', specialty: '安装工' },
  { id: generateId(), name: '陈师傅', phone: '13800138006', specialty: '水电工' },
  { id: generateId(), name: '孙师傅', phone: '13800138007', specialty: '木工' },
];

export const mockProjects: Project[] = [
  {
    id: project1Id,
    customerName: '王先生',
    phone: '13900139001',
    address: '阳光花园小区3栋2单元1502',
    startDate: '2026-05-15',
    expectedEndDate: '2026-08-15',
    budget: 150000,
    status: 'ongoing',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: project2Id,
    customerName: '李女士',
    phone: '13900139002',
    address: '绿城御园5栋1单元801',
    startDate: '2026-06-01',
    expectedEndDate: '2026-09-01',
    budget: 200000,
    status: 'ongoing',
    createdAt: '2026-05-25T14:30:00Z',
  },
  {
    id: project3Id,
    customerName: '张总',
    phone: '13900139003',
    address: '滨江一号别墅A8栋',
    startDate: '2026-04-01',
    expectedEndDate: '2026-07-15',
    actualEndDate: '2026-06-10',
    budget: 500000,
    status: 'completed',
    createdAt: '2026-03-20T09:00:00Z',
  },
];

export const mockStages: Stage[] = [
  {
    id: generateId(),
    projectId: project1Id,
    name: '水电',
    order: 1,
    status: 'completed',
    startTime: '2026-05-16T08:00:00Z',
    endTime: '2026-05-28T18:00:00Z',
    workerId: mockWorkers[0].id,
    workerName: mockWorkers[0].name,
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '泥瓦',
    order: 2,
    status: 'completed',
    startTime: '2026-05-30T08:00:00Z',
    endTime: '2026-06-12T18:00:00Z',
    workerId: mockWorkers[1].id,
    workerName: mockWorkers[1].name,
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '木工',
    order: 3,
    status: 'ongoing',
    startTime: '2026-06-14T08:00:00Z',
    workerId: mockWorkers[2].id,
    workerName: mockWorkers[2].name,
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '油漆',
    order: 4,
    status: 'pending',
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '安装',
    order: 5,
    status: 'pending',
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '水电',
    order: 1,
    status: 'completed',
    startTime: '2026-06-02T08:00:00Z',
    endTime: '2026-06-10T18:00:00Z',
    workerId: mockWorkers[5].id,
    workerName: mockWorkers[5].name,
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '泥瓦',
    order: 2,
    status: 'ongoing',
    startTime: '2026-06-12T08:00:00Z',
    workerId: mockWorkers[1].id,
    workerName: mockWorkers[1].name,
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '木工',
    order: 3,
    status: 'pending',
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '油漆',
    order: 4,
    status: 'pending',
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '安装',
    order: 5,
    status: 'pending',
  },
  ...(() => {
    const stages: Stage[] = [];
    STAGE_NAMES.forEach((name, idx) => {
      const worker = mockWorkers[idx % mockWorkers.length];
      stages.push({
        id: generateId(),
        projectId: project3Id,
        name,
        order: idx + 1,
        status: 'completed',
        startTime: `2026-04-${(idx * 10 + 1).toString().padStart(2, '0')}T08:00:00Z`,
        endTime: `2026-04-${(idx * 10 + 8).toString().padStart(2, '0')}T18:00:00Z`,
        workerId: worker.id,
        workerName: worker.name,
      });
    });
    return stages;
  })(),
];

export const mockMaterials: Material[] = [
  {
    id: generateId(),
    projectId: project1Id,
    name: 'PPR水管',
    spec: '25mm',
    quantity: 50,
    unit: '米',
    unitPrice: 12,
    totalPrice: 600,
    purchaseDate: '2026-05-16',
    remark: '国标热水管',
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '电线',
    spec: '2.5平方',
    quantity: 3,
    unit: '卷',
    unitPrice: 280,
    totalPrice: 840,
    purchaseDate: '2026-05-17',
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '水泥',
    spec: '海螺P.O42.5',
    quantity: 60,
    unit: '袋',
    unitPrice: 32,
    totalPrice: 1920,
    purchaseDate: '2026-05-30',
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '黄沙',
    spec: '中砂',
    quantity: 8,
    unit: '方',
    unitPrice: 180,
    totalPrice: 1440,
    purchaseDate: '2026-05-30',
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '瓷砖',
    spec: '800x800',
    quantity: 120,
    unit: '片',
    unitPrice: 85,
    totalPrice: 10200,
    purchaseDate: '2026-06-02',
    remark: '客厅地砖',
  },
  {
    id: generateId(),
    projectId: project1Id,
    name: '大芯板',
    spec: '18mm E0级',
    quantity: 30,
    unit: '张',
    unitPrice: 165,
    totalPrice: 4950,
    purchaseDate: '2026-06-14',
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '电线',
    spec: '4平方',
    quantity: 2,
    unit: '卷',
    unitPrice: 450,
    totalPrice: 900,
    purchaseDate: '2026-06-02',
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '开关插座',
    spec: '西门子远景系列',
    quantity: 45,
    unit: '个',
    unitPrice: 28,
    totalPrice: 1260,
    purchaseDate: '2026-06-08',
  },
  {
    id: generateId(),
    projectId: project2Id,
    name: '水泥',
    spec: '海螺P.O42.5',
    quantity: 80,
    unit: '袋',
    unitPrice: 32,
    totalPrice: 2560,
    purchaseDate: '2026-06-12',
  },
  ...(() => {
    const materials: { name: string; spec: string; qty: number; unit: string; price: number; date: string }[] = [
      { name: 'PPR水管', spec: '25mm', qty: 80, unit: '米', price: 12, date: '2026-04-02' },
      { name: '电线', spec: '2.5平方', qty: 5, unit: '卷', price: 280, date: '2026-04-03' },
      { name: '电线', spec: '4平方', qty: 3, unit: '卷', price: 450, date: '2026-04-03' },
      { name: '水泥', spec: '海螺P.O42.5', qty: 120, unit: '袋', price: 32, date: '2026-04-12' },
      { name: '黄沙', spec: '中砂', qty: 15, unit: '方', price: 180, date: '2026-04-12' },
      { name: '瓷砖', spec: '800x800', qty: 200, unit: '片', price: 120, date: '2026-04-15' },
      { name: '大芯板', spec: '18mm E0级', qty: 60, unit: '张', price: 180, date: '2026-04-22' },
      { name: '乳胶漆', spec: '多乐士五合一', qty: 15, unit: '桶', price: 680, date: '2026-05-05' },
      { name: '实木地板', spec: '橡木910x125', qty: 180, unit: '平方', price: 380, date: '2026-05-12' },
      { name: '橱柜', spec: '定制整体橱柜', qty: 1, unit: '套', price: 28000, date: '2026-05-20' },
    ];
    return materials.map((m) => ({
      id: generateId(),
      projectId: project3Id,
      name: m.name,
      spec: m.spec,
      quantity: m.qty,
      unit: m.unit,
      unitPrice: m.price,
      totalPrice: m.qty * m.price,
      purchaseDate: m.date,
    }));
  })(),
];
