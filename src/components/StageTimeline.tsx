import { useState } from 'react';
import { CheckCircle2, Clock, Circle, Play, Square, UserPlus, User, Zap } from 'lucide-react';
import type { Stage, Worker } from '../types';
import { useStore } from '../store/useStore';
import { formatDateTime } from '../utils/format';
import Modal from './Modal';

interface StageTimelineProps {
  projectId: string;
}

const statusIcon = {
  pending: Circle,
  ongoing: Clock,
  completed: CheckCircle2,
};

const statusStyles = {
  pending: {
    dot: 'bg-slate-200 text-slate-400 border-slate-200',
    line: 'bg-slate-200',
    text: 'text-slate-500',
    bg: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-600',
  },
  ongoing: {
    dot: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/40',
    line: 'bg-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50/50',
    badge: 'bg-amber-100 text-amber-700',
  },
  completed: {
    dot: 'bg-emerald-500 text-white border-emerald-500',
    line: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50/30',
    badge: 'bg-emerald-100 text-emerald-700',
  },
};

const StageTimeline = ({ projectId }: StageTimelineProps) => {
  const { stages, workers, getProjectStages, startStage, completeStage, assignWorkerToStage, getOrCreateWorkerByName } = useStore();
  const projectStages = getProjectStages(projectId);

  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerSpecialty, setNewWorkerSpecialty] = useState('');
  const [addWorkerMode, setAddWorkerMode] = useState(false);

  const handleStartStage = (stage: Stage) => {
    if (!stage.workerName) {
      setSelectedStage(stage);
      setShowWorkerModal(true);
      return;
    }
    startStage(stage.id, stage.workerId, stage.workerName);
  };

  const handleConfirmStart = () => {
    if (!selectedStage) return;
    if (addWorkerMode && newWorkerName.trim()) {
      const savedWorker = getOrCreateWorkerByName(newWorkerName.trim(), newWorkerSpecialty.trim() || selectedStage.name);
      assignWorkerToStage(selectedStage.id, savedWorker.id, savedWorker.name);
      startStage(selectedStage.id, savedWorker.id, savedWorker.name);
    } else if (selectedWorker) {
      const worker = workers.find((w) => w.id === selectedWorker);
      if (worker) {
        assignWorkerToStage(selectedStage.id, worker.id, worker.name);
        startStage(selectedStage.id, worker.id, worker.name);
      }
    } else {
      startStage(selectedStage.id);
    }
    setShowWorkerModal(false);
    setSelectedStage(null);
    setSelectedWorker('');
    setNewWorkerName('');
    setNewWorkerSpecialty('');
    setAddWorkerMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">施工阶段</h3>
            <p className="text-xs text-slate-500">点击开始和完成按钮记录时间</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-slate-200" />

        <div className="space-y-4">
          {projectStages.map((stage, index) => {
            const styles = statusStyles[stage.status];
            const Icon = statusIcon[stage.status];
            const isLast = index === projectStages.length - 1;

            return (
              <div key={stage.id} className="relative pl-14">
                <div
                  className={`absolute left-0 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${styles.dot} ${
                    stage.status === 'ongoing' ? 'animate-pulse' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={stage.status === 'completed' ? 3 : 2} />
                </div>

                <div
                  className={`rounded-xl border border-slate-100 p-5 transition-all duration-300 hover:shadow-md ${styles.bg}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-lg font-bold ${styles.text}`}>{stage.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                          {stage.status === 'pending' && '未开始'}
                          {stage.status === 'ongoing' && '进行中'}
                          {stage.status === 'completed' && '已完成'}
                        </span>
                      </div>
                      {stage.workerName && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <User className="w-3.5 h-3.5" />
                          <span>负责工人：<span className="font-medium">{stage.workerName}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {stage.status === 'pending' && (
                        <button
                          onClick={() => handleStartStage(stage)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
                        >
                          <Play className="w-4 h-4" fill="currentColor" />
                          开始
                        </button>
                      )}
                      {stage.status === 'ongoing' && (
                        <>
                          {!stage.workerName && (
                            <button
                              onClick={() => {
                                setSelectedStage(stage);
                                setShowWorkerModal(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              分配工人
                            </button>
                          )}
                          <button
                            onClick={() => completeStage(stage.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
                          >
                            <Square className="w-4 h-4" fill="currentColor" />
                            完成
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {(stage.startTime || stage.endTime) && (
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100/70">
                      {stage.startTime && (
                        <span>
                          开始时间：<span className="font-medium text-slate-700">{formatDateTime(stage.startTime)}</span>
                        </span>
                      )}
                      {stage.endTime && (
                        <span>
                          完成时间：<span className="font-medium text-emerald-700">{formatDateTime(stage.endTime)}</span>
                        </span>
                      )}
                      {stage.startTime && stage.endTime && (
                        <span className="text-blue-600 font-medium">
                          用时 {Math.ceil((new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()) / (1000 * 60 * 60 * 24))} 天
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={showWorkerModal}
        onClose={() => {
          setShowWorkerModal(false);
          setSelectedStage(null);
          setSelectedWorker('');
          setNewWorkerName('');
          setNewWorkerSpecialty('');
          setAddWorkerMode(false);
        }}
        title={`分配工人 - ${selectedStage?.name}阶段`}
        size="sm"
      >
        <div className="space-y-4">
          {!addWorkerMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择已有工人</label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
                >
                  <option value="">-- 选择工人（可选）--</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                      {worker.specialty ? `（${worker.specialty}）` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setAddWorkerMode(true)}
                  className="text-sm text-[#1e3a5f] hover:underline font-medium"
                >
                  + 添加新工人
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  工人姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="请输入工人姓名"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">擅长工种</label>
                <input
                  type="text"
                  value={newWorkerSpecialty}
                  onChange={(e) => setNewWorkerSpecialty(e.target.value)}
                  placeholder={`默认：${selectedStage?.name || ''}`}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">工人将保存到档案，后续可直接选择</p>
              </div>
              <button
                onClick={() => {
                  setAddWorkerMode(false);
                  setNewWorkerName('');
                  setNewWorkerSpecialty('');
                }}
                className="text-sm text-slate-500 hover:underline"
              >
                返回选择已有工人
              </button>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowWorkerModal(false);
                setSelectedStage(null);
                setSelectedWorker('');
                setNewWorkerName('');
                setNewWorkerSpecialty('');
                setAddWorkerMode(false);
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmStart}
              disabled={addWorkerMode ? !newWorkerName.trim() : false}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              确认并开始
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StageTimeline;
