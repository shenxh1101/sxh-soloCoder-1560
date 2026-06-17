import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Stage, Material, Worker, WorkerStats, ProjectStatus, StageName } from '../types';
import { generateId } from '../utils/id';
import { getNowStr } from '../utils/format';
import { mockProjects, mockStages, mockMaterials, mockWorkers, createDefaultStages } from '../data/mockData';

interface AppStore {
  projects: Project[];
  stages: Stage[];
  materials: Material[];
  workers: Worker[];

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

  addWorker: (data: Omit<Worker, 'id'>) => void;
  updateWorker: (id: string, data: Partial<Worker>) => void;

  getProjectTotalCost: (projectId: string) => number;
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
        }));
      },

      completeProject: (id) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, status: 'completed' as ProjectStatus, actualEndDate: getNowStr() }
              : p
          ),
        }));
      },

      startStage: (stageId, workerId, workerName) => {
        const state = get();
        const stage = state.stages.find((s) => s.id === stageId);
        if (!stage) return;

        const projectId = stage.projectId;
        const project = state.projects.find((p) => p.id === projectId);

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
                  workerId: workerId || s.workerId,
                  workerName: workerName || s.workerName,
                }
              : s
          ),
        });
      },

      completeStage: (stageId) => {
        const state = get();
        const stage = state.stages.find((s) => s.id === stageId);
        if (!stage) return;

        const projectId = stage.projectId;
        const projectStages = state.stages.filter((s) => s.projectId === projectId);
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
                  ? { ...p, status: 'completed' as ProjectStatus, actualEndDate: getNowStr() }
                  : p
              )
            : state.projects,
        });
      },

      assignWorkerToStage: (stageId, workerId, workerName) => {
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId ? { ...s, workerId, workerName } : s
          ),
        }));
      },

      addMaterial: (data) => {
        const newMaterial: Material = {
          ...data,
          id: generateId(),
        };
        set((state) => ({
          materials: [...state.materials, newMaterial],
        }));
      },

      updateMaterial: (id, data) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        }));
      },

      deleteMaterial: (id) => {
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        }));
      },

      addWorker: (data) => {
        const newWorker: Worker = {
          ...data,
          id: generateId(),
        };
        set((state) => ({
          workers: [...state.workers, newWorker],
        }));
      },

      updateWorker: (id, data) => {
        set((state) => ({
          workers: state.workers.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
        }));
      },

      getProjectTotalCost: (projectId) => {
        const state = get();
        return state.materials
          .filter((m) => m.projectId === projectId)
          .reduce((sum, m) => sum + m.totalPrice, 0);
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
          .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      },

      getWorkerStats: () => {
        const state = get();
        const workerMap = new Map<string, WorkerStats>();

        state.stages.forEach((stage) => {
          if (!stage.workerId || !stage.workerName) return;
          const project = state.projects.find((p) => p.id === stage.projectId);
          const existing = workerMap.get(stage.workerId);

          const stageInfo = {
            projectId: stage.projectId,
            projectName: project ? `${project.customerName} - ${project.address}` : stage.projectId,
            stageName: stage.name as StageName,
            status: stage.status,
          };

          if (existing) {
            existing.stageCount++;
            if (stage.status === 'completed') existing.completedCount++;
            existing.stages.push(stageInfo);
          } else {
            workerMap.set(stage.workerId, {
              workerId: stage.workerId,
              workerName: stage.workerName,
              stageCount: 1,
              completedCount: stage.status === 'completed' ? 1 : 0,
              stages: [stageInfo],
            });
          }
        });

        return Array.from(workerMap.values()).sort((a, b) => b.stageCount - a.stageCount);
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
        const completed = stages.filter((s) => s.status === 'completed').length;
        const ongoing = stages.filter((s) => s.status === 'ongoing').length;
        return ((completed + ongoing * 0.5) / stages.length) * 100;
      },
    }),
    {
      name: 'renovation-management-store',
    }
  )
);
