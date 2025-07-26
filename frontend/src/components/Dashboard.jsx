import React from 'react';
import { FileText, DollarSign, Package, AlertTriangle } from 'lucide-react';
import MetricCard from './MetricCard';
import { useApi } from '../hooks/useApi';

const Dashboard = () => {
  const { data: metrics, loading: metricsLoading } = useApi('/dashboard/metrics');
  const { data: bestSelling, loading: bestSellingLoading } = useApi('/dashboard/best-selling');
  const { data: products, loading: stockLoading } = useApi('/products');

  if (metricsLoading || bestSellingLoading || stockLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Dashboard Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            icon={FileText}
            value={metrics?.daily_sales?.toString() || "0"}
            label="Ventas del día"
          />
          <MetricCard
            icon={DollarSign}
            value={`$${metrics?.daily_revenue?.toFixed(2) || "0.00"}`}
            label="Total Recaudado"
          />
          <MetricCard
            icon={Package}
            value={metrics?.total_products?.toString() || "0"}
            label="Total Productos"
          />
          <MetricCard
            icon={AlertTriangle}
            value={metrics?.low_stock_count?.toString() || "0"}
            label="Stock Bajo"
            className="bg-orange-600"
          />
        </div>

        {/* Best Selling Products */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Productos más vendidos</h2>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Vendidos</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bestSelling?.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{product.product_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.product_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.total_sold}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${product.total_revenue.toFixed(2)}</td>
                  </tr>
                )) || []}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 h-full flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Stock</h3>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
              <div>Nombre</div>
              <div>Cantidad</div>
            </div>
            {products?.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100">
                <div className="text-sm text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-900">{item.stock}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;