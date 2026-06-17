import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, Search, X } from 'lucide-react';
import type { Material } from '../types';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getTodayStr } from '../utils/format';
import Modal from './Modal';

interface MaterialTableProps {
  projectId: string;
}

const commonUnits = ['袋', '卷', '米', '平方', '个', '张', '方', '桶', '套', '件'];

const MaterialTable = ({ projectId }: MaterialTableProps) => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, getProjectMaterials, getProjectTotalCost } = useStore();
  const projectMaterials = getProjectMaterials(projectId);
  const totalCost = getProjectTotalCost(projectId);

  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    spec: '',
    quantity: '',
    unit: '袋',
    unitPrice: '',
    purchaseDate: getTodayStr(),
    remark: '',
  });

  const filteredMaterials = projectMaterials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.spec && m.spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingMaterial(null);
    setForm({
      name: '',
      spec: '',
      quantity: '',
      unit: '袋',
      unitPrice: '',
      purchaseDate: getTodayStr(),
      remark: '',
    });
    setShowModal(true);
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setForm({
      name: material.name,
      spec: material.spec || '',
      quantity: material.quantity.toString(),
      unit: material.unit,
      unitPrice: material.unitPrice.toString(),
      purchaseDate: material.purchaseDate,
      remark: material.remark || '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.quantity || !form.unitPrice) return;

    const quantity = parseFloat(form.quantity);
    const unitPrice = parseFloat(form.unitPrice);
    const totalPrice = +(quantity * unitPrice).toFixed(2);

    const data = {
      name: form.name.trim(),
      spec: form.spec.trim() || undefined,
      quantity,
      unit: form.unit,
      unitPrice,
      totalPrice,
      purchaseDate: form.purchaseDate,
      remark: form.remark.trim() || undefined,
    };

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, data);
    } else {
      addMaterial({ ...data, projectId });
    }

    setShowModal(false);
  };

  const subtotal = parseFloat(form.quantity) * parseFloat(form.unitPrice);
  const isValidSubtotal = !isNaN(subtotal) && subtotal > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">材料采购</h3>
              <p className="text-xs text-slate-500">
                共 {projectMaterials.length} 笔采购，累计{' '}
                <span className="font-bold text-amber-600">{formatCurrency(totalCost)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索材料..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-48 rounded-xl border border-slate-200 text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              新增采购
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">采购日期</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">材料名称</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">规格</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">数量</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">单价</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">总价</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">备注</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">暂无采购记录</p>
                      <button
                        onClick={openAddModal}
                        className="mt-2 text-sm text-[#1e3a5f] hover:underline font-medium"
                      >
                        + 添加第一笔采购
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(material.purchaseDate)}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">{material.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{material.spec || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-right tabular-nums whitespace-nowrap">
                    {material.quantity} <span className="text-slate-400">{material.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right tabular-nums">{formatCurrency(material.unitPrice)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right tabular-nums">{formatCurrency(material.totalPrice)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{material.remark || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(material)}
                        className="p-2 rounded-lg text-slate-400 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定删除这条采购记录？')) {
                            deleteMaterial(material.id);
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {projectMaterials.length > 0 && (
            <tfoot>
              <tr className="bg-gradient-to-r from-amber-50 to-amber-50/50">
                <td colSpan={5} className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                  采购总计：
                </td>
                <td className="px-6 py-4 text-lg font-bold text-amber-700 text-right tabular-nums">
                  {formatCurrency(totalCost)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMaterial ? '编辑采购记录' : '新增材料采购'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                材料名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如：水泥、瓷砖、电线等"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">规格型号</label>
              <input
                type="text"
                value={form.spec}
                onChange={(e) => setForm({ ...form, spec: e.target.value })}
                placeholder="如：海螺P.O42.5、800x800等"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">单位</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              >
                {commonUnits.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                单价（元） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">自动计算总价：</span>
              <span className={`text-2xl font-bold tabular-nums ${isValidSubtotal ? 'text-amber-700' : 'text-slate-300'}`}>
                {isValidSubtotal ? formatCurrency(subtotal) : '¥0.00'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">采购日期</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">备注</label>
              <input
                type="text"
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                placeholder="选填"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/10 outline-none transition-all"
              />
            </div>
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
              disabled={!form.name.trim() || !form.quantity || !form.unitPrice}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {editingMaterial ? '保存修改' : '确认添加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MaterialTable;
