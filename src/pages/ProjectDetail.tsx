import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  User,
  Wallet,
  FileText,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  BarChart3,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getDaysDiff } from '../utils/format';
import ProgressBar from '../components/ProgressBar';
import StageTimeline from '../components/StageTimeline';
import MaterialTable from '../components/MaterialTable';
import ActivityLogList from '../components/ActivityLogList';
import Modal from '../components/Modal';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    getProjectStages,
    getProjectTotalCost,
    getProjectCategoryCosts,
    getStageProgress,
    deleteProject,
    completeProject,
  } = useStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">工地不存在</h2>
        <p className="text-slate-500 mb-6">该工地可能已被删除</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工地看板
        </Link>
      </div>
    );
  }

  const stages = getProjectStages(project.id);
  const totalCost = getProjectTotalCost(project.id);
  const categoryCosts = getProjectCategoryCosts(project.id);
  const progress = getStageProgress(project.id);
  const isOverBudget = totalCost > project.budget;
  const budgetDiff = totalCost - project.budget;
  const budgetUsage = Math.min((totalCost / project.budget) * 100, 100);
  const overBudgetCategories = categoryCosts.filter((c) => c.budget && c.total > c.budget);
  const allStagesCompleted = stages.every((s) => s.status === 'completed');
  const hasAnyStageStarted = stages.some((s) => s.status !== 'pending');

  const workerRecords = stages
    .filter((s) => s.workerName)
    .map((s) => ({
      stage: s.name,
      worker: s.workerName!,
      status: s.status,
      days: s.startTime && s.endTime ? getDaysDiff(s.startTime, s.endTime) : 0,
    }));

  const statusConfig = {
    pending: { label: '待开工', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
    ongoing: { label: '进行中', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500 animate-pulse' },
    completed: { label: '已完工', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  };
  const status = statusConfig[project.status];

  const handleDelete = () => {
    deleteProject(project.id);
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="flex items-center gap-3">
          {project.status !== 'completed' && (
            <>
              {allStagesCompleted && (
                <button
                  onClick={() => setShowCompleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-md shadow-emerald-500/30 hover:shadow-lg transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  标记完工
                </button>
              )}
              <Link
                to={`/project/${project.id}/settlement`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                生成结算单
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </>
          )}
          {project.status === 'completed' && (
            <Link
              to={`/project/${project.id}/settlement`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              查看结算单
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#1e3a5f] via-[#2d4a6f] to-[#f59e0b]" />
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${status.dot}`} />
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
                {hasAnyStageStarted && !allStagesCompleted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                    <Clock className="w-3.5 h-3.5" />
                    当前阶段：
                    <span className="font-semibold">
                      {stages.find((s) => s.status === 'ongoing')?.name ||
                        stages.find((s) => s.status === 'pending')?.name}
                    </span>
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">{project.customerName} 的装修工地</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">工地地址</p>
                    <p className="font-medium text-slate-800">{project.address}</p>
                  </div>
                </div>
                {project.phone && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">联系电话</p>
                      <p className="font-medium text-slate-800">{project.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">工期</p>
                    <p className="font-medium text-slate-800">
                      {formatDate(project.startDate)} ~ {formatDate(project.expectedEndDate)}
                      <span className="ml-2 text-sm text-slate-500">
                        (共 {getDaysDiff(project.startDate, project.expectedEndDate)} 天)
                      </span>
                    </p>
                    {project.actualEndDate && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        实际完工：{formatDate(project.actualEndDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-96 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">预算执行情况</p>
                  <p className="font-semibold text-slate-800">Budget vs Actual</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">预算金额</span>
                  <span className="text-lg font-bold text-slate-800 tabular-nums">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">已支出</span>
                  <span className={`text-lg font-bold tabular-nums ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <div className="h-px bg-slate-200/70" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">剩余预算</span>
                  <span
                    className={`text-xl font-bold tabular-nums ${
                      isOverBudget ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {isOverBudget ? '-' : ''}
                    {formatCurrency(Math.abs(project.budget - totalCost))}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <ProgressBar value={budgetUsage} label="预算使用" showValue color="green" />
                {isOverBudget && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <span className="font-semibold">已超支 {formatCurrency(budgetDiff)}</span>
                      <span className="text-red-600/80">，请注意控制后续采购支出</span>
                    </div>
                  </div>
                )}
              </div>

              {categoryCosts.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-200/70">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-600">分类预算执行</span>
                  </div>
                  <div className="space-y-2.5">
                    {categoryCosts.slice(0, 6).map((c) => {
                      const over = c.budget && c.total > c.budget;
                      const percent = c.budget ? Math.min((c.total / c.budget) * 100, 100) : 0;
                      return (
                        <div key={c.category}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-slate-600">{c.category}</span>
                            <span className={`tabular-nums ${over ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                              {formatCurrency(c.total)}
                              {c.budget && ` / ${formatCurrency(c.budget)}`}
                              {over && ' ⚠'}
                            </span>
                          </div>
                          {c.budget && (
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  over ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {overBudgetCategories.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-orange-700">
                      <span className="font-semibold">
                        {overBudgetCategories.map((c) => c.category).join('、')}
                      </span>{' '}
                      已超出分类预算
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1e3a5f]/5 to-[#f59e0b]/5 border border-[#1e3a5f]/10 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">整体施工进度</span>
              <span className="text-2xl font-bold text-[#1e3a5f] tabular-nums">
                {progress.toFixed(0)}%
              </span>
            </div>
            <ProgressBar value={progress} color="blue" size="lg" />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                已完成 {stages.filter((s) => s.status === 'completed').length} 个阶段
              </span>
              <span>
                共 {stages.length} 个阶段
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <StageTimeline projectId={project.id} />
          <ActivityLogList projectId={project.id} />
        </div>
        <div className="xl:col-span-3 space-y-6">
          {workerRecords.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">工人分配记录</h3>
                  <p className="text-xs text-slate-500">各阶段负责工人汇总</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workerRecords.map((record, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">{record.stage}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : record.status === 'ongoing'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {record.status === 'completed' ? '已完成' : record.status === 'ongoing' ? '进行中' : '未开始'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{record.worker}</span>
                      {record.days > 0 && (
                        <span className="ml-auto text-xs text-slate-500">用时 {record.days} 天</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <MaterialTable projectId={project.id} />
        </div>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除工地"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">此操作不可撤销</p>
              <p className="text-sm text-red-700/80 mt-1">
                删除后，该工地的所有阶段记录和材料采购数据将一并被清除。
              </p>
            </div>
          </div>
          <p className="text-slate-600">
            确定要删除 <span className="font-semibold text-slate-800">{project.customerName}</span> 的工地吗？
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        title="标记工地完工"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">所有施工阶段已完成</p>
              <p className="text-sm text-emerald-700/80 mt-1">
                标记完工后，可生成完整的结算单。
              </p>
            </div>
          </div>
          <p className="text-slate-600">
            确定要将 <span className="font-semibold text-slate-800">{project.customerName}</span> 的工地标记为已完工吗？
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCompleteConfirm(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                completeProject(project.id);
                setShowCompleteConfirm(false);
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              确认完工
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
