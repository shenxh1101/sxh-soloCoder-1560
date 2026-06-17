import {
  History,
  Play,
  CheckCircle2,
  User,
  Package,
  Pencil,
  Trash2,
  FileText,
  Settings,
} from 'lucide-react';
import type { ActivityLog } from '../types';
import { useStore } from '../store/useStore';
import { formatDateTime } from '../utils/format';

interface ActivityLogListProps {
  projectId: string;
}

const iconMap = {
  stage_start: Play,
  stage_complete: CheckCircle2,
  worker_change: User,
  material_add: Package,
  material_update: Pencil,
  material_delete: Trash2,
  project_create: FileText,
  project_update: Settings,
};

const colorMap: Record<string, string> = {
  stage_start: 'bg-amber-100 text-amber-600',
  stage_complete: 'bg-emerald-100 text-emerald-600',
  worker_change: 'bg-purple-100 text-purple-600',
  material_add: 'bg-blue-100 text-blue-600',
  material_update: 'bg-sky-100 text-sky-600',
  material_delete: 'bg-red-100 text-red-600',
  project_create: 'bg-slate-100 text-slate-600',
  project_update: 'bg-indigo-100 text-indigo-600',
};

const ActivityLogList = ({ projectId }: ActivityLogListProps) => {
  const getProjectLogs = useStore((s) => s.getProjectLogs);
  const logs = getProjectLogs(projectId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">进度日志</h3>
          <p className="text-xs text-slate-500">
            该工地的全部操作记录（{logs.length}条）
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center">
          <History className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">暂无操作记录</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
          <ul className="space-y-4">
            {logs.slice(0, 30).map((log: ActivityLog) => {
              const Icon = iconMap[log.type] || FileText;
              const color = colorMap[log.type] || 'bg-slate-100 text-slate-600';
              return (
                <li key={log.id} className="relative pl-12">
                  <div
                    className={`absolute left-0 top-0.5 w-10 h-10 rounded-full flex items-center justify-center ${color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-start justify-between gap-3 py-1">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {log.content}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {logs.length > 30 && (
            <p className="pt-3 text-center text-xs text-slate-400">
              仅显示最近 30 条记录
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogList;
