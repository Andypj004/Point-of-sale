import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedReport, setSelectedReport] = useState('sales');

  const salesData = [
    { fecha: '20/08/2021', ventas: 23, total: 50.60, productos: 45 },
    { fecha: '19/08/2021', ventas: 18, total: 42.30, productos: 38 },
    { fecha: '18/08/2021', ventas: 31, total: 67.80, productos: 52 },
    { fecha: '17/08/2021', ventas: 25, total: 55.20, productos: 41 },
    { fecha: '16/08/2021', ventas: 29, total: 63.40, productos: 48 },
  ];

  const productReports = [
    { producto: 'Libra de arroz', vendidos: 45, ingresos: 22.50, stock: 150 },
    { producto: 'Frijoles negros', vendidos: 32, ingresos: 24.00, stock: 89 },
    { producto: 'Azúcar blanca', vendidos: 28, ingresos: 16.80, stock: 45 },
    { producto: 'Aceite vegetal', vendidos: 15, ingresos: 18.75, stock: 23 },
  ];

  const periods = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const reportTypes = [
    { value: 'sales', label: 'Ventas' },
    { value: 'products', label: 'Productos' },
    { value: 'inventory', label: 'Inventario' },
  ];

  const totalSales = salesData.reduce((sum, day) => sum + day.ventas, 0);
  const totalRevenue = salesData.reduce((sum, day) => sum + day.total, 0);
  const avgDailySales = totalSales / salesData.length;

  return (
    <div className="flex h-full">
      {/* Main Reports Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Reportes</h2>
              <button className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Download size={16} />
                <span>Exportar</span>
              </button>
            </div>
            
            <div className="flex space-x-4">
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={20} />
                </div>
                <div className="text-2xl font-bold">{totalSales}</div>
                <div className="text-slate-200 text-sm">Total Ventas</div>
              </div>
              
              <div className="bg-slate-700 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Calendar size={20} />
                </div>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <div className="text-slate-200 text-sm">Ingresos Totales</div>
              </div>
              
              <div className="bg-slate-700 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown size={20} />
                </div>
                <div className="text-2xl font-bold">{avgDailySales.toFixed(1)}</div>
                <div className="text-slate-200 text-sm">Promedio Diario</div>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            {selectedReport === 'sales' ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Fecha</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Ventas</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Productos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesData.map((day, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{day.fecha}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{day.ventas}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${day.total}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{day.productos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Producto</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Vendidos</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Ingresos</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productReports.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.producto}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.vendidos}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${product.ingresos}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Filters Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Filtros</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                <option value="">Todas las categorías</option>
                <option value="granos">Granos</option>
                <option value="aceites">Aceites</option>
                <option value="azucares">Azúcares</option>
              </select>
            </div>
            
            <button className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">
              Aplicar Filtros
            </button>
            
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;