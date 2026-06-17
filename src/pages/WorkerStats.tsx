import { useMemo } from 'react';
import { Trophy, Medal, Award, User, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { StageName, StageStatus } from '../types';

const stageColors: Record<StageName, string> = {
  '水电': 'from-blue-400 to-blue-600',
  '泥瓦': 'from-amber-400 to-amber-600',
  '木工': 'from-orange-400 to-orange-600',
  '油漆': 'from-purple-400 to-purple-600',
  '安装': 'from-emerald-400 to-emerald-600',
};

const rankStyles = [
  {
    badge: 'bg-gradient-to-br from-amber-400 to-amber-500 text-white',
    ring: 'ring-amber-200',
    icon: Trophy,
    iconColor: 'text-amber-600',
    bg: 'from-amber-50 via-white to-amber-50/30',
    border: 'border-amber-200',
  },
  {
    badge: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white',
    ring: 'ring-slate-200',
    icon: Medal,
    iconColor: 'text-slate-500',
    bg: 'from-slate-50 via-white to-slate-50/30',
    border: 'border-slate-200',
  },
  {
    badge: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
    ring: 'ring-orange-200',
    icon: Award,
    iconColor: 'text-orange-600',
    bg: 'from-orange-50 via-white to-orange-50/30',
    border: 'border-orange-200',
  },
];

const WorkerStats = () => {
  const { projects, getWorkerStats } = useStore();
  const workerStats = useMemo(() => getWorkerStats(), [getWorkerStats]);

  const stageDistribution = useMemo(() => {
    const map = new Map<StageName, { worker: string; count: number }[]>();
    const stages: StageName[] = ['水电', '泥瓦', '木工', '油漆', '安装'];

    workerStats.forEach((ws) => {
      const stageMap = new Map<StageName, number>();
      ws.stages.forEach((s) => {
        stageMap.set(s.stageName, (stageMap.get(s.stageName) || 0) + 1);
      });
      stageMap.forEach((count, stageName) => {
        if (!map.has(stageName)) map.set(stageName, []);
        map.get(stageName)!.push({ worker: ws.workerName, count });
      });
    });

    return stages.map((s) => ({
      stage: s,
      data: (map.get(s) || []).sort((a, b) => b.count - a.count).slice(0, 5),
    }));
  }, [workerStats]);

  const totalStages = workerStats.reduce((sum, w) => sum + w.stageCount, 0);
  const totalCompleted = workerStats.reduce((sum, w) => sum + w.completedCount, 0);
  const totalOngoing = totalStages - totalCompleted;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">工人统计</h1>
          <p className="text-slate-500">统计各工人参与施工阶段的工作量排名</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">参与工人总数</p>
              <p className="text-3xl font-bold text-slate-800 tabular-nums">{workerStats.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">已完成阶段数</p>
              <p className="text-3xl font-bold text-emerald-700 tabular-nums">{totalCompleted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">进行中阶段数</p>
              <p className="text-3xl font-bold text-amber-700 tabular-nums">{totalOngoing}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">工作量排行榜</h2>
            <p className="text-sm text-slate-500">按参与阶段数量排序</p>
          </div>
        </div>

        {workerStats.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无工人记录</h3>
            <p className="text-slate-500">在工地的施工阶段中分配工人后，这里会显示工人统计</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workerStats.map((ws, index) => {
              const style = index < 3 ? rankStyles[index] : null;
              const Icon = style?.icon || TrendingUp;
              const projectList = projects.filter((p) =>
                ws.stages.some((s) => s.projectId === p.id)
              );

              return (
                <div
                  key={ws.workerId}
                  className={`relative p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                    style
                      ? `bg-gradient-to-r ${style.bg} ${style.border}`
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-5 lg:w-72 flex-shrink-0">
                      <div className="relative">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center ring-4 ${
                            style
                              ? `bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] ${style.ring}`
                              : 'bg-slate-100 ring-slate-100'
                          }`}
                        >
                          <span className="text-2xl font-bold text-white">
                            {ws.workerName.charAt(0)}
                          </span>
                        </div>
                        {style && (
                          <div
                            className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl ${style.badge} flex items-center justify-center shadow-lg`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        {!style && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shadow">
                            #{index + 1}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{ws.workerName}</h3>
                        <p className="text-sm text-slate-500">
                          参与 <span className="font-semibold text-slate-700">{projectList.length}</span> 个工地
                        </p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-white border border-slate-100 text-center">
                          <p className="text-xs text-slate-500 mb-1">总阶段数</p>
                          <p className="text-2xl font-bold text-slate-800 tabular-nums">{ws.stageCount}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                          <p className="text-xs text-emerald-600 mb-1">已完成</p>
                          <p className="text-2xl font-bold text-emerald-700 tabular-nums">{ws.completedCount}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                          <p className="text-xs text-amber-600 mb-1">进行中</p>
                          <p className="text-2xl font-bold text-amber-700 tabular-nums">
                            {ws.stageCount - ws.completedCount}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          参与阶段详情
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ws.stages.slice(0, 8).map((s, i) => (
                            <div
                              key={i}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r ${stageColors[s.stageName]} text-white shadow-sm`}
                              title={s.projectName}
                            >
                              {s.stageName}
                              <span className="ml-1.5 opacity-80">
                                {s.status === 'completed' ? '✓' : '→'}
                              </span>
                            </div>
                          ))}
                          {ws.stages.length > 8 && (
                            <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                              +{ws.stages.length - 8} 更多
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:w-48 h-24 rounded-2xl bg-gradient-to-br from-[#1e3a5f]/5 to-amber-50 border border-[#1e3a5f]/10">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">完成率</p>
                        <p className="text-3xl font-bold text-[#1e3a5f] tabular-nums">
                          {ws.stageCount > 0 ? Math.round((ws.completedCount / ws.stageCount) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">各工种工人分布</h2>
            <p className="text-sm text-slate-500">按施工阶段统计工人参与情况</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {stageDistribution.map((item) => (
            <div
              key={item.stage}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stageColors[item.stage]} flex items-center justify-center shadow-md`}
                >
                  <span className="text-white font-bold text-sm">{item.stage.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{item.stage}工程</h3>
              </div>

              {item.data.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">暂无数据</p>
              ) : (
                <div className="space-y-3">
                  {item.data.map((d, i) => {
                    const max = item.data[0].count;
                    const width = max > 0 ? (d.count / max) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium text-slate-700">{d.worker}</span>
                          <span className="font-bold text-slate-800 tabular-nums">{d.count} 次</span>
                        </div>
                        <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${stageColors[item.stage]} rounded-full transition-all duration-700`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerStats;
