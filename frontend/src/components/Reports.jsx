import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import apiService from '../services/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: categories } = useApi('/categories');
  const { data: salesReport, loading: salesLoading, refetch: refetchSales } = useApi(
    `/reports/sales?start_date=${startDate}&end_date=${endDate}`,
    [startDate, endDate]
  );
  const { data: productsReport, loading: productsLoading, refetch: refetchProducts } = useApi(
    `/reports/products?start_date=${startDate}&end_date=${endDate}${categoryFilter ? `&category_id=${categoryFilter}` : ''}`,
    [startDate, endDate, categoryFilter]
  );

  const periods = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const reportTypes = [
    { value: 'sales', label: 'Ventas' },
    { value: 'products', label: 'Productos' },
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const today = new Date();
    
    switch (period) {
      case 'today':
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        setStartDate(weekAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        setStartDate(monthAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
    }
  };

  const exportToExcel = () => {
    const data = selectedReport === 'sales' ? salesReport : productsReport;
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    const sheetName = selectedReport === 'sales' ? 'Reporte de Ventas' : 'Reporte de Productos';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const fileName = `${sheetName}_${startDate}_${endDate}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, fileName);
  };

  const currentData = selectedReport === 'sales' ? salesReport : productsReport;
  const isLoading = selectedReport === 'sales' ? salesLoading : productsLoading;

  // Calculate summary metrics
  const totalSales = salesReport?.reduce((sum, day) => sum + day.total_sales, 0) || 0;
  const totalRevenue = salesReport?.reduce((sum, day) => sum + day.total_revenue, 0) || 0;
  const avgDailySales = salesReport?.length > 0 ? totalSales / salesReport.length : 0;

  const applyFilters = () => {
    if (selectedReport === 'sales') {
      refetchSales();
    } else {
      refetchProducts();
    }
  };

  const clearFilters = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    setStartDate(weekAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setCategoryFilter('');
    setSelectedPeriod('week');
  };

  return (
    <div className="flex h-full">
      {/* Main Reports Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Reportes</h2>
              <button 
                onClick={exportToExcel}
                disabled={!currentData || currentData.length === 0}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={16} />
                <span>Exportar Excel</span>
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
                onChange={(e) => handlePeriodChange(e.target.value)}
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

          {/* Summary Cards - Only for sales reports */}
          {selectedReport === 'sales' && (
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
          )}

          {/* Reports Table */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Cargando reporte...</div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {selectedReport === 'sales' ? (
                      <>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Fecha</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Ventas</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Ingresos</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Productos Vendidos</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Código</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Producto</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Vendidos</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Ingresos</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Stock Actual</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentData?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {selectedReport === 'sales' ? (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.total_sales}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">${item.total_revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.total_products_sold}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.product_code}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.product_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.total_sold}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">${item.total_revenue.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.current_stock}</td>
                        </>
                      )}
                    </tr>
                  )) || []}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Filters Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 h-full overflow-y-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Filtros</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            
            {selectedReport === 'products' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button 
              onClick={applyFilters}
              className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Aplicar Filtros
            </button>
            
            <button 
              onClick={clearFilters}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;