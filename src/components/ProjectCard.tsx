import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, AlertTriangle, ChevronRight } from 'lucide-react';
import type { Project } from '../types';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
import ProgressBar from './ProgressBar';

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  pending: { label: '待开工', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  ongoing: { label: '进行中', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500 animate-pulse' },
  completed: { label: '已完工', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { getProjectTotalCost, getStageProgress, getCurrentStage, getProjectCategoryCosts } = useStore();

  const totalCost = getProjectTotalCost(project.id);
  const progress = getStageProgress(project.id);
  const currentStage = getCurrentStage(project.id);
  const isOverBudget = totalCost > project.budget;
  const budgetUsage = (totalCost / project.budget) * 100;
  const categoryCosts = getProjectCategoryCosts(project.id);
  const overCategories = categoryCosts.filter((c) => c.budget && c.total > c.budget);
  const status = statusConfig[project.status];

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="h-2 bg-gradient-to-r from-[#1e3a5f] via-[#2d4a6f] to-[#f59e0b]" />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#1e3a5f] transition-colors">
              {project.customerName}
            </h3>
          </div>
          {isOverBudget && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-semibold">超支</span>
            </div>
          )}
          {!isOverBudget && overCategories.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600" title={overCategories.map((c) => c.category).join('、')}>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-semibold">{overCategories.length}类超支</span>
            </div>
          )}
        </div>

        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{project.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{formatDate(project.startDate)} ~ {formatDate(project.expectedEndDate)}</span>
          </div>
          {currentStage && project.status === 'ongoing' && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600">当前阶段：</span>
              <span className="font-semibold text-amber-600">{currentStage.name}</span>
              {currentStage.workerName && (
                <span className="text-slate-500">· {currentStage.workerName}</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ProgressBar value={progress} label="施工进度" showValue />

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">预算使用</span>
              <span className={`text-sm font-semibold tabular-nums ${isOverBudget ? 'text-red-600' : 'text-slate-700'}`}>
                {formatCurrency(totalCost)} / {formatCurrency(project.budget)}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudget
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : budgetUsage >= 80
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}
                style={{ width: `${Math.min(budgetUsage, 100)}%` }}
              />
            </div>
            {isOverBudget && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">
                超出预算 {formatCurrency(totalCost - project.budget)} ({((budgetUsage - 100)).toFixed(1)}%)
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">查看详情</span>
          <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/5 group-hover:bg-[#1e3a5f] flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-[#1e3a5f] group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
