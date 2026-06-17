import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, CheckCircle2, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, formatDateTime, getDaysDiff } from '../utils/format';
import ProgressBar from '../components/ProgressBar';

const Settlement = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, getProjectStages, getProjectMaterials, getProjectTotalCost, getProjectCategoryCosts, getStageProgress } = useStore();

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-700 mb-6">工地不存在</h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工地看板
        </Link>
      </div>
    );
  }

  const stages = getProjectStages(project.id);
  const materials = getProjectMaterials(project.id);
  const totalCost = getProjectTotalCost(project.id);
  const categoryCosts = getProjectCategoryCosts(project.id);
  const progress = getStageProgress(project.id);
  const isOverBudget = totalCost > project.budget;
  const budgetDiff = Math.abs(totalCost - project.budget);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex items-center justify-between print:hidden">
        <Link
          to={`/project/${project.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工地详情
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            打印结算单
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-0">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-8 text-white print:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200/80 text-sm mb-1">装修工程结算单</p>
              <h1 className="text-3xl font-bold mb-2">Renovation Settlement</h1>
              <div className="flex items-center gap-2 text-blue-100/80 text-sm">
                <span>结算单号：RM-{project.id.slice(-8).toUpperCase()}</span>
                <span>·</span>
                <span>生成日期：{formatDate(new Date().toISOString())}</span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                  project.status === 'completed' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                }`}
              >
                {project.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                )}
                <span className="font-medium">
                  {project.status === 'completed' ? '工程已完工' : '工程进行中'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 print:p-6 print:space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">客户信息</p>
                <p className="font-bold text-slate-800 text-lg">{project.customerName}</p>
                {project.phone && <p className="text-sm text-slate-600 mt-0.5">{project.phone}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">施工地址</p>
                <p className="font-semibold text-slate-800">{project.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">工期信息</p>
                <p className="font-semibold text-slate-800">
                  {formatDate(project.startDate)} ~ {formatDate(project.expectedEndDate)}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  计划工期 {getDaysDiff(project.startDate, project.expectedEndDate)} 天
                  {project.actualEndDate && (
                    <> · 实际完工 {formatDate(project.actualEndDate)}</>
                  )}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">一、施工进度明细</h2>
              <span className="text-sm text-slate-500">
                整体完成度：<span className="font-bold text-[#1e3a5f]">{progress.toFixed(0)}%</span>
              </span>
            </div>
            <ProgressBar value={progress} color="blue" size="lg" />
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">序号</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">施工阶段</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">负责工人</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">开始时间</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">完成时间</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">用时</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stages.map((stage, idx) => (
                    <tr key={stage.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 text-sm font-medium text-slate-500 tabular-nums">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">{stage.name}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{stage.workerName || '-'}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(stage.startTime)}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(stage.endTime)}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 tabular-nums">
                        {stage.startTime && stage.endTime
                          ? `${getDaysDiff(stage.startTime, stage.endTime)} 天`
                          : stage.status === 'ongoing'
                          ? '进行中'
                          : '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            stage.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : stage.status === 'ongoing'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {stage.status === 'completed' ? '已完成' : stage.status === 'ongoing' ? '进行中' : '未开始'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">二、材料采购明细</h2>
              <span className="text-sm text-slate-500">
                共 <span className="font-bold text-slate-800">{materials.length}</span> 笔采购
              </span>
            </div>
            {materials.length === 0 ? (
              <div className="p-12 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-slate-500">暂无材料采购记录</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">序号</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">采购日期</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">材料名称</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">规格</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">数量</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">单价</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">金额</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materials.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-500 tabular-nums">{idx + 1}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{formatDate(m.purchaseDate)}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{m.name}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{m.spec || '-'}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-700 text-right tabular-nums whitespace-nowrap">
                          {m.quantity} <span className="text-slate-400">{m.unit}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 text-right tabular-nums">{formatCurrency(m.unitPrice)}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 text-right tabular-nums">{formatCurrency(m.totalPrice)}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 max-w-[180px] truncate">{m.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-amber-50/50">
                      <td colSpan={6} className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
                        材料采购合计：
                      </td>
                      <td className="px-5 py-4 text-xl font-bold text-amber-700 text-right tabular-nums">
                        {formatCurrency(totalCost)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          {categoryCosts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">二点五、各类材料花费汇总</h2>
                <span className="text-sm text-slate-500">
                  按类别统计采购支出
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">序号</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">材料类别</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">预算</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">实际花费</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">差额</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categoryCosts.map((c, idx) => {
                      const diff = c.budget ? c.total - c.budget : 0;
                      const over = c.budget && c.total > c.budget;
                      return (
                        <tr key={c.category} className={over ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}>
                          <td className="px-5 py-3.5 text-sm font-medium text-slate-500 tabular-nums">{idx + 1}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{c.category}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 text-right tabular-nums">
                            {c.budget ? formatCurrency(c.budget) : '-'}
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 text-right tabular-nums">{formatCurrency(c.total)}</td>
                          <td className={`px-5 py-3.5 text-sm font-semibold text-right tabular-nums ${over ? 'text-red-600' : c.budget ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {c.budget
                              ? `${over ? '-' : '+'}${formatCurrency(Math.abs(diff))}`
                              : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="p-8 rounded-2xl bg-gradient-to-br from-[#1e3a5f]/5 via-white to-amber-50/30 border-2 border-[#1e3a5f]/10">
            <h2 className="text-xl font-bold text-slate-800 mb-6">三、费用总结</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">工程预算</span>
                  <span className="text-lg font-semibold text-slate-800 tabular-nums">
                    {formatCurrency(project.budget)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">材料实际支出</span>
                  <span className="text-lg font-semibold text-slate-800 tabular-nums">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">预算使用比例</span>
                  <span className={`text-lg font-bold tabular-nums ${isOverBudget ? 'text-red-600' : 'text-[#1e3a5f]'}`}>
                    {((totalCost / project.budget) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-slate-700">
                    {isOverBudget ? '超支金额' : '剩余预算'}
                  </span>
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      isOverBudget ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {isOverBudget ? '-' : '+'}
                    {formatCurrency(budgetDiff)}
                  </span>
                </div>
              </div>

              <div className={`p-6 rounded-xl border-2 flex flex-col justify-center ${
                isOverBudget
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200'
              }`}>
                {isOverBudget ? (
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600 font-medium mb-1">预算超支预警</p>
                      <p className="text-xs text-red-700/70 mb-3">该项目实际支出已超过预算</p>
                      <p className="text-3xl font-bold text-red-700 tabular-nums">
                        -{formatCurrency(budgetDiff)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-700 font-medium mb-1">预算执行良好</p>
                      <p className="text-xs text-emerald-700/70 mb-3">仍有结余可用</p>
                      <p className="text-3xl font-bold text-emerald-700 tabular-nums">
                        +{formatCurrency(budgetDiff)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t-2 border-dashed border-slate-200 print:pt-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-500">客户确认签字：</p>
              <div className="h-20 border-b-2 border-slate-300" />
              <p className="text-sm text-slate-400">日期：________________</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">施工方签字盖章：</p>
              <div className="h-20 border-b-2 border-slate-300" />
              <p className="text-sm text-slate-400">日期：________________</p>
            </div>
          </section>
        </div>

        <div className="bg-slate-50 p-6 text-center print:bg-white print:p-4">
          <p className="text-xs text-slate-400">
            本结算单由装修管家系统自动生成 · 如有疑问请联系施工方
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settlement;
