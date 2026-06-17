import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project,
  Stage,
  Material,
  Worker,
  WorkerStats,
  ProjectStatus,
  StageName,
  ActivityLog,
  ActivityType,
  MaterialCategory,
  CategoryCost,
} from '../types';
import { MATERIAL_CATEGORIES } from '../types';
import { generateId } from '../utils/id';
import { getNowStr } from '../utils/format';
import {
  mockProjects,
  mockStages,
  mockMaterials,
  mockWorkers,
  mockActivityLogs,
  createDefaultStages,
  getCategory,
} from '../data/mockData';

interface AppStore {
  projects: Project[];
  stages: Stage[];
  materials: Material[];
  workers: Worker[];
  activityLogs: ActivityLog[];

  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'status'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  completeProject: (id: string) => void;

  startStage: (stageId: string, workerId?: string, workerName?: string) => void;
  completeStage: (stageId: string) => void;
  assignWorkerToStage: (stageId: string, workerId: string, workerName: string) => void;

  addMaterial: (data: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, data: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  addWorker: (data: Omit<Worker, 'id' | 'createdAt'>) => Worker;
  updateWorker: (id: string, data: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  getOrCreateWorkerByName: (name: string, specialty?: string) => Worker;

  addLog: (projectId: string, type: ActivityType, content: string) => void;
  getProjectLogs: (projectId: string) => ActivityLog[];

  getProjectTotalCost: (projectId: string) => number;
  getProjectCategoryCosts: (projectId: string) => CategoryCost[];
  getProjectStages: (projectId: string) => Stage[];
  getProjectMaterials: (projectId: string) => Material[];
  getWorkerStats: () => WorkerStats[];
  getCurrentStage: (projectId: string) => Stage | undefined;
  getStageProgress: (projectId: string) => number;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      projects: mockProjects,
      stages: mockStages,
      materials: mockMaterials,
      workers: mockWorkers,
      activityLogs: mockActivityLogs,

      addLog: (projectId, type, content) => {
        const log: ActivityLog = {
          id: generateId(),
          projectId,
          type,
          content,
          createdAt: getNowStr(),
        };
        set((state) => ({
          activityLogs: [...state.activityLogs, log],
        }));
      },

      getProjectLogs: (projectId) => {
        return get()
          .activityLogs.filter((l) => l.projectId === projectId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      addProject: (data) => {
        const projectId = generateId();
        const newProject: Project = {
          ...data,
          id: projectId,
          status: 'pending',
          createdAt: getNowStr(),
        };
        const newStages = createDefaultStages(projectId);
        set((state) => ({
          projects: [...state.projects, newProject],
          stages: [...state.stages, ...newStages],
        }));
        get().addLog(projectId, 'project_create', '创建了新工地');
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          stages: state.stages.filter((s) => s.projectId !== id),
          materials: state.materials.filter((m) => m.projectId !== id),
          activityLogs: state.activityLogs.filter((l) => l.projectId !== id),
        }));
      },

      completeProject: (id) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'completed' as ProjectStatus,
                  actualEndDate: getNowStr(),
                }
              : p
          ),
        }));
      },

      startStage: (stageId, workerId, workerName) => {
        const state = get();
        const stage = state.stages.find((s) => s.id === stageId);
        if (!stage) return;

        const projectId = stage.projectId;
        const finalWorkerName = workerName || stage.workerName;
        const finalWorkerId = workerId || stage.workerId;

        set({
          projects: state.projects.map((p) =>
            p.id === projectId && p.status === 'pending'
              ? { ...p, status: 'ongoing' as ProjectStatus }
              : p
          ),
          stages: state.stages.map((s) =>
            s.id === stageId
              ? {
                  ...s,
                  status: 'ongoing',
                  startTime: getNowStr(),
                  workerId: finalWorkerId,
                  workerName: finalWorkerName,
                }
              : s
          ),
        });
        if (finalWorkerName) {
          get().addLog(
            projectId,
            'stage_start',
            `【${stage.name}】阶段开始，负责人：${finalWorkerName}`
          );
        } else {
          get().addLog(projectId, 'stage_start', `【${stage.name}】阶段开始`);
        }
      },

      completeStage: (stageId) => {
        const state = get();
        const stage = state.stages.find((s) => s.id === stageId);
        if (!stage) return;

        const projectId = stage.projectId;
        const projectStages = state.stages.filter(
          (s) => s.projectId === projectId
        );
        const allCompleted = projectStages.every(
          (s) => s.id === stageId || s.status === 'completed'
        );

        set({
          stages: state.stages.map((s) =>
            s.id === stageId
              ? { ...s, status: 'completed', endTime: getNowStr() }
              : s
          ),
          projects: allCompleted
            ? state.projects.map((p) =>
                p.id === projectId
                  ? {
                      ...p,
                      status: 'completed' as ProjectStatus,
                      actualEndDate: getNowStr(),
                    }
                  : p
              )
            : state.projects,
        });
        get().addLog(projectId, 'stage_complete', `【${stage.name}】阶段完成`);
      },

      assignWorkerToStage: (stageId, workerId, workerName) => {
        const state = get();
        const stage = state.stages.find((s) => s.id === stageId);
        if (!stage) return;
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId ? { ...s, workerId, workerName } : s
          ),
        }));
        get().addLog(
          stage.projectId,
          'worker_change',
          `【${stage.name}】更换工人为：${workerName}`
        );
      },

      addMaterial: (data) => {
        const newMaterial: Material = {
          ...data,
          id: generateId(),
        };
        set((state) => ({
          materials: [...state.materials, newMaterial],
        }));
        get().addLog(
          newMaterial.projectId,
          'material_add',
          `添加材料：${newMaterial.name} × ${newMaterial.quantity}${newMaterial.unit}，金额 ¥${newMaterial.totalPrice}`
        );
      },

      updateMaterial: (id, data) => {
        const state = get();
        const old = state.materials.find((m) => m.id === id);
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        }));
        if (old) {
          get().addLog(old.projectId, 'material_update', `更新材料：${old.name}`);
        }
      },

      deleteMaterial: (id) => {
        const state = get();
        const old = state.materials.find((m) => m.id === id);
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        }));
        if (old) {
          get().addLog(
            old.projectId,
            'material_delete',
            `删除材料：${old.name}`
          );
        }
      },

      addWorker: (data) => {
        const newWorker: Worker = {
          ...data,
          id: generateId(),
          createdAt: getNowStr(),
        };
        set((state) => ({
          workers: [...state.workers, newWorker],
        }));
        return newWorker;
      },

      updateWorker: (id, data) => {
        set((state) => ({
          workers: state.workers.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
        }));
      },

      deleteWorker: (id) => {
        set((state) => ({
          workers: state.workers.filter((w) => w.id !== id),
        }));
      },

      getOrCreateWorkerByName: (name, specialty) => {
        const state = get();
        const existing = state.workers.find(
          (w) => w.name.trim() === name.trim()
        );
        if (existing) return existing;
        return get().addWorker({ name, specialty });
      },

      getProjectTotalCost: (projectId) => {
        const state = get();
        return state.materials
          .filter((m) => m.projectId === projectId)
          .reduce((sum, m) => sum + m.totalPrice, 0);
      },

      getProjectCategoryCosts: (projectId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        const materials = state.materials.filter(
          (m) => m.projectId === projectId
        );
        const map = new Map<MaterialCategory, number>();
        materials.forEach((m) => {
          const cur = map.get(m.category) || 0;
          map.set(m.category, cur + m.totalPrice);
        });
        const result: CategoryCost[] = [];
        map.forEach((total, category) => {
          const budget = project?.categoryBudgets?.find(
            (b) => b.category === category
          );
          result.push({
            category,
            total,
            budget: budget?.budget,
          });
        });
        return result.sort((a, b) => b.total - a.total);
      },

      getProjectStages: (projectId) => {
        const state = get();
        return state.stages
          .filter((s) => s.projectId === projectId)
          .sort((a, b) => a.order - b.order);
      },

      getProjectMaterials: (projectId) => {
        const state = get();
        return state.materials
          .filter((m) => m.projectId === projectId)
          .sort(
            (a, b) =>
              new Date(b.purchaseDate).getTime() -
              new Date(a.purchaseDate).getTime()
          );
      },

      getWorkerStats: () => {
        const state = get();
        const workerMap = new Map<string, WorkerStats>();

        const addStage = (
          workerKey: string,
          workerName: string,
          stage: Stage
        ) => {
          const project = state.projects.find(
            (p) => p.id === stage.projectId
          );
          const existing = workerMap.get(workerKey);
          const stageInfo = {
            projectId: stage.projectId,
            projectName: project
              ? `${project.customerName} - ${project.address}`
              : stage.projectId,
            stageName: stage.name as StageName,
            status: stage.status,
          };
          if (existing) {
            existing.stageCount++;
            if (stage.status === 'completed') existing.completedCount++;
            existing.stages.push(stageInfo);
          } else {
            workerMap.set(workerKey, {
              workerId: workerKey,
              workerName,
              stageCount: 1,
              completedCount: stage.status === 'completed' ? 1 : 0,
              stages: [stageInfo],
            });
          }
        };

        state.stages.forEach((stage) => {
          if (!stage.workerName) return;
          if (stage.workerId) {
            addStage(stage.workerId, stage.workerName, stage);
            return;
          }
          const matched = state.workers.find(
            (w) => w.name === stage!.workerName
          );
          if (matched) {
            addStage(matched.id, stage.workerName, stage);
          } else {
            addStage(`name:${stage.workerName}`, stage.workerName, stage);
          }
        });

        return Array.from(workerMap.values()).sort(
          (a, b) => b.stageCount - a.stageCount
        );
      },

      getCurrentStage: (projectId) => {
        const stages = get().getProjectStages(projectId);
        const ongoing = stages.find((s) => s.status === 'ongoing');
        if (ongoing) return ongoing;
        const pending = stages.find((s) => s.status === 'pending');
        if (pending) return pending;
        return stages[stages.length - 1];
      },

      getStageProgress: (projectId) => {
        const stages = get().getProjectStages(projectId);
        if (stages.length === 0) return 0;
        const completed = stages.filter(
          (s) => s.status === 'completed'
        ).length;
        const ongoing = stages.filter(
          (s) => s.status === 'ongoing'
        ).length;
        return ((completed + ongoing * 0.5) / stages.length) * 100;
      },
    }),
    {
      name: 'renovation-management-store',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          let dirty = false;
          state.materials = state.materials.map((m) => {
            if (!m.category) {
              dirty = true;
              return { ...m, category: getCategory(m.name) };
            }
            return m;
          });
          state.workers = state.workers.map((w) => {
            if (!w.createdAt) {
              dirty = true;
              return { ...w, createdAt: new Date().toISOString() };
            }
            return w;
          });
          if (!state.activityLogs) {
            state.activityLogs = [];
            dirty = true;
          }
          if (dirty) {
            try {
              // 触发一次持久化保存迁移后的数据
              localStorage.setItem(
                'renovation-management-store',
                JSON.stringify({
                  state: {
                    projects: state.projects,
                    stages: state.stages,
                    materials: state.materials,
                    workers: state.workers,
                    activityLogs: state.activityLogs,
                  },
                  version: 0,
                })
              );
            } catch {}
          }
        } catch {}
      },
    }
  )
);
