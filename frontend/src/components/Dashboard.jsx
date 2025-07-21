import React from 'react';
import { FileText, DollarSign } from 'lucide-react';
import MetricCard from './MetricCard';

const Dashboard = () => {
  const bestSellingProducts = [
    { codigo: 'ARR001', nombre: 'Libra de arroz', precio: '0.50' },
    { codigo: 'FRJ002', nombre: 'Frijoles negros', precio: '0.75' },
    { codigo: 'AZU003', nombre: 'Azúcar blanca', precio: '0.60' },
  ];

  const stockItems = [
    { nombre: 'Libra de arroz', cantidad: 150 },
    { nombre: 'Frijoles negros', cantidad: 89 },
    { nombre: 'Azúcar blanca', cantidad: 45 },
    { nombre: 'Aceite vegetal', cantidad: 23 },
  ];

  return (
    <div className="flex h-full">
      {/* Main Dashboard Content */}
      <div className="flex-1 p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            icon={FileText}
            value="23"
            label="Ventas del día"
          />
          <MetricCard
            icon={DollarSign}
            value="50.60"
            label="Total Recaudado"
          />
        </div>

        {/* Best Selling Products */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Productos más vendidos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bestSellingProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{product.codigo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${product.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Stock</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
              <div>Nombre</div>
              <div>Cantidad</div>
            </div>
            {stockItems.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100">
                <div className="text-sm text-gray-900">{item.nombre}</div>
                <div className="text-sm text-gray-900">{item.cantidad}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;