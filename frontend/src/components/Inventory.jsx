import React, { useState } from 'react';
import { Search, AlertTriangle, Package, Plus } from 'lucide-react';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [newSupplier, setNewSupplier] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: ''
  });

  const [suppliers, setSuppliers] = useState([
    { id: '1', nombre: 'Distribuidora Central', contacto: 'Juan Pérez', telefono: '555-0123', email: 'juan@central.com' },
    { id: '2', nombre: 'Granos del Valle', contacto: 'María García', telefono: '555-0456', email: 'maria@granos.com' },
    { id: '3', nombre: 'Aceites Premium', contacto: 'Carlos López', telefono: '555-0789', email: 'carlos@aceites.com' },
  ]);

  const lowStockItems = [
    { codigo: 'AZU003', nombre: 'Azúcar blanca', stock: 45, minimo: 50, proveedor: 'Distribuidora Central' },
    { codigo: 'ACE004', nombre: 'Aceite vegetal', stock: 23, minimo: 30, proveedor: 'Aceites Premium' },
    { codigo: 'SAL005', nombre: 'Sal refinada', stock: 12, minimo: 25, proveedor: 'Distribuidora Central' },
    { codigo: 'HAR006', nombre: 'Harina de trigo', stock: 8, minimo: 20, proveedor: 'Granos del Valle' },
  ];

  const recentOrders = [
    { id: 'ORD001', proveedor: 'Distribuidora Central', fecha: '18/08/2021', estado: 'Pendiente', total: 245.50 },
    { id: 'ORD002', proveedor: 'Granos del Valle', fecha: '17/08/2021', estado: 'Entregado', total: 180.30 },
    { id: 'ORD003', proveedor: 'Aceites Premium', fecha: '16/08/2021', estado: 'En tránsito', total: 320.75 },
  ];

  const filteredLowStock = lowStockItems.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSupplier = () => {
    if (newSupplier.nombre && newSupplier.contacto) {
      const supplier = {
        id: Date.now().toString(),
        ...newSupplier
      };
      setSuppliers([...suppliers, supplier]);
      setNewSupplier({ nombre: '', contacto: '', telefono: '', email: '' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En tránsito':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Inventory Content */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="text-orange-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Stock Bajo</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar productos con stock bajo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Código</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Producto</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Mínimo</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Proveedor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLowStock.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.codigo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.nombre}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-red-600 font-medium">{item.stock}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.minimo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.proveedor}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="bg-slate-700 text-white px-3 py-1 rounded text-xs hover:bg-slate-800 transition-colors">
                          Reabastecer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Órdenes Recientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID Orden</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Proveedor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Fecha</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Estado</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.proveedor}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.fecha}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}>
                          {order.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">${order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Proveedores</h3>
          
          {/* Suppliers List */}
          <div className="space-y-4 mb-6">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-900">{supplier.nombre}</div>
                <div className="text-sm text-gray-600">{supplier.contacto}</div>
                <div className="text-sm text-gray-600">{supplier.telefono}</div>
                <div className="text-sm text-gray-600">{supplier.email}</div>
              </div>
            ))}
          </div>

          {/* Add New Supplier */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Nuevo Proveedor</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre empresa"
                value={newSupplier.nombre}
                onChange={(e) => setNewSupplier({ ...newSupplier, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Contacto"
                value={newSupplier.contacto}
                onChange={(e) => setNewSupplier({ ...newSupplier, contacto: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <input
                type="tel"
                placeholder="Teléfono"
                value={newSupplier.telefono}
                onChange={(e) => setNewSupplier({ ...newSupplier, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <input
                type="email"
                placeholder="Email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <button
                onClick={handleAddSupplier}
                className="w-full bg-slate-700 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;