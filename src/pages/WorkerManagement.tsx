import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, User, Search, Phone, Briefcase, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import type { Worker, StageName } from '../types';

const STAGE_OPTIONS: (StageName | string)[] = ['水电', '泥瓦', '木工', '油漆', '安装', '综合'];

const WorkerManagement = () => {
  const { workers, stages, addWorker, updateWorker, deleteWorker } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialty: '',
  });

  const workerStageCount = useMemo(() => {
    const map = new Map<string, number>();
    workers.forEach((w) => map.set(w.id, 0));
    stages.forEach((s) => {
      if (s.workerId && map.has(s.workerId)) {
        map.set(s.workerId, (map.get(s.workerId) || 0) + 1);
      }
    });
    return map;
  }, [workers, stages]);

  const filteredWorkers = useMemo(() => {
    if (!searchTerm.trim()) return workers;
    const term = searchTerm.toLowerCase();
    return workers.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        (w.phone && w.phone.includes(term)) ||
        (w.specialty && w.specialty.toLowerCase().includes(term))
    );
  }, [workers, searchTerm]);

  const openAddModal = () => {
    setEditingWorker(null);
    setForm({ name: '', phone: '', specialty: '' });
    setShowModal(true);
  };

  const openEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setForm({
      name: worker.name,
      phone: worker.phone || '',
      specialty: worker.specialty || '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      specialty: form.specialty.trim() || undefined,
    };
    if (editingWorker) {
      updateWorker(editingWorker.id, data);
    } else {
      addWorker(data);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">工人档案管理</h1>
          <p className="text-slate-500">管理装修团队的工人档案，支持新增、编辑、删除</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-lg shadow-[#1e3a5f]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          新增工人
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">工人总数</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{workers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">覆盖工种</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">
                {new Set(workers.map((w) => w.specialty).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">总参与阶段</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">
                {Array.from(workerStageCount.values()).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索姓名、电话、工种..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full pl-12 pr-4 rounded-2xl border border-slate-200 bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
          />
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无工人档案</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm ? '没有符合条件的工人' : '点击右上角按钮添加第一个工人'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{worker.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{worker.name}</h3>
                    {worker.specialty && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 mt-1">
                        {worker.specialty}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(worker)}
                    className="p-2 rounded-lg text-slate-400 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors"
                    title="编辑"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`确定删除工人「${worker.name}」？`)) {
                        deleteWorker(worker.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                {worker.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{worker.phone}</span>
                  </div>
                )}
                {worker.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>入职时间：{formatDate(worker.createdAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-slate-500">参与阶段数</span>
                  <span className="text-lg font-bold text-[#1e3a5f] tabular-nums">
                    {workerStageCount.get(worker.id) || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingWorker ? '编辑工人档案' : '新增工人档案'}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              工人姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入工人姓名"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="请输入联系电话（选填）"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">擅长工种</label>
            <select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
            >
              <option value="">-- 请选择工种（选填）--</option>
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {editingWorker ? '保存修改' : '确认添加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkerManagement;
