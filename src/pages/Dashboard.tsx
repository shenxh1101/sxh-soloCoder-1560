import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Construction, Hammer, CheckCircle2, Wallet, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, getTodayStr } from '../utils/format';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import type { ProjectStatus, CategoryBudget, MaterialCategory } from '../types';
import { MATERIAL_CATEGORIES } from '../types';

const filterOptions: { value: 'all' | ProjectStatus; label: string }[] = [
  { value: 'all', label: '全部工地' },
  { value: 'pending', label: '待开工' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已完工' },
];

const Dashboard = () => {
  const { projects, materials, addProject } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryBudgets, setShowCategoryBudgets] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    startDate: getTodayStr(),
    expectedEndDate: '',
    budget: '',
  });
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const pending = projects.filter((p) => p.status === 'pending').length;
    const ongoing = projects.filter((p) => p.status === 'ongoing').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyCost = materials
      .filter((m) => m.purchaseDate.startsWith(thisMonth))
      .reduce((sum, m) => sum + m.totalPrice, 0);
    return { pending, ongoing, completed, monthlyCost };
  }, [projects, materials]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.customerName.toLowerCase().includes(term) ||
          p.address.toLowerCase().includes(term)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects, statusFilter, searchTerm]);

  const resetForm = () => {
    setForm({
      customerName: '',
      phone: '',
      address: '',
      startDate: getTodayStr(),
      expectedEndDate: '',
      budget: '',
    });
    setCategoryBudgets({});
    setShowCategoryBudgets(false);
  };

  const handleSubmit = () => {
    if (!form.customerName.trim() || !form.address.trim() || !form.startDate || !form.expectedEndDate || !form.budget) return;

    const budgets: CategoryBudget[] = [];
    Object.entries(categoryBudgets).forEach(([cat, val]) => {
      const v = parseFloat(val);
      if (!isNaN(v) && v > 0) {
        budgets.push({ category: cat as MaterialCategory, budget: v });
      }
    });

    addProject({
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      startDate: form.startDate,
      expectedEndDate: form.expectedEndDate,
      budget: parseFloat(form.budget),
      categoryBudgets: budgets.length > 0 ? budgets : undefined,
    });

    setShowAddModal(false);
    resetForm();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">工地看板</h1>
          <p className="text-slate-500">管理所有装修工地的进度和采购情况</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-lg shadow-[#1e3a5f]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          新增工地
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="进行中工地"
          value={stats.ongoing}
          icon={Hammer}
          color="amber"
        />
        <StatCard
          title="待开工工地"
          value={stats.pending}
          icon={Construction}
          color="blue"
        />
        <StatCard
          title="已完工工地"
          value={stats.completed}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="本月材料支出"
          value={formatCurrency(stats.monthlyCost)}
          icon={Wallet}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === opt.value ? 'bg-white/20' : 'bg-white text-slate-500'
                }`}>
                  {opt.value === 'all'
                    ? projects.length
                    : projects.filter((p) => p.status === opt.value).length}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索客户姓名、工地地址..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Construction className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无工地</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || statusFilter !== 'all' ? '没有符合条件的工地' : '开始添加第一个装修工地吧'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            新增工地
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-[fadeInUp_0.5s_ease-out_both]"
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增装修工地"
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                客户姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="请输入客户姓名"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">联系电话</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="请输入联系电话"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              工地地址 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="详细地址，如：阳光花园3栋2单元1502"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                开工日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                预计完工日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.expectedEndDate}
                onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              预算金额（元） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="请输入预算金额，如：150000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
            />
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowCategoryBudgets(!showCategoryBudgets)}
              className="flex items-center gap-2 text-sm font-medium text-[#1e3a5f] hover:underline"
            >
              {showCategoryBudgets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              设置分类预算（可选）
            </button>
            {showCategoryBudgets && (
              <div className="mt-3 grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                {MATERIAL_CATEGORIES.map((cat) => (
                  <div key={cat}>
                    <label className="block text-xs text-slate-600 mb-1">{cat}</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={categoryBudgets[cat] || ''}
                      onChange={(e) =>
                        setCategoryBudgets({ ...categoryBudgets, [cat]: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !form.customerName.trim() ||
                !form.address.trim() ||
                !form.startDate ||
                !form.expectedEndDate ||
                !form.budget
              }
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              创建工地
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
