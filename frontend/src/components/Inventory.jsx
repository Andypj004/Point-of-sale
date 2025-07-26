import React, { useState } from 'react';
import { Search, AlertTriangle, Package, Plus, Truck } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import apiService from '../services/api';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  const { data: lowStockItems, loading: stockLoading, refetch: refetchStock } = useApi('/inventory/low-stock');
  const { data: suppliers, loading: suppliersLoading, refetch: refetchSuppliers } = useApi('/suppliers');
  const { data: purchaseOrders, loading: ordersLoading, refetch: refetchOrders } = useApi('/purchase-orders');
  const { mutate: createSupplier, loading: creatingSupplier } = useApiMutation();
  const { mutate: createRestock, loading: restocking } = useApiMutation();

  const filteredLowStock = lowStockItems?.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddSupplier = async () => {
    if (newSupplier.name && newSupplier.contact_person && newSupplier.phone) {
      try {
        await createSupplier(() => apiService.createSupplier(newSupplier));
        setNewSupplier({ name: '', contact_person: '', phone: '', email: '', address: '' });
        refetchSuppliers();
      } catch (error) {
        console.error('Error creating supplier:', error);
        alert('Error al crear proveedor: ' + error.message);
      }
    }
  };

  const handleRestock = async (productId) => {
    const quantity = prompt('¿Cuántas unidades desea reabastecer?');
    if (quantity && parseInt(quantity) > 0) {
      try {
        await createRestock(() => apiService.createRestockOrder(productId, parseInt(quantity)));
        alert('Orden de reabastecimiento creada exitosamente');
        refetchOrders();
        refetchStock();
      } catch (error) {
        console.error('Error creating restock order:', error);
        alert('Error al crear orden de reabastecimiento: ' + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'pending':
        return 'Pendiente';
      case 'in_transit':
        return 'En tránsito';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (stockLoading || suppliersLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Inventory Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="space-y-6 h-full flex flex-col">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="text-orange-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Stock Bajo</h2>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                  {filteredLowStock.length} productos
                </span>
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
            <div className="flex-1 overflow-auto">
              <div className="overflow-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
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
                        <td className="px-6 py-4 text-sm text-gray-900">{item.product_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.product_name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-red-600 font-medium">{item.current_stock}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.min_stock}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.supplier_name || 'Sin proveedor'}</td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => handleRestock(item.product_id)}
                            disabled={restocking}
                            className="bg-slate-700 text-white px-3 py-1 rounded text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center space-x-1"
                          >
                            <Truck size={12} />
                            <span>{restocking ? 'Procesando...' : 'Reabastecer'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredLowStock.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? 'No se encontraron productos' : 'No hay productos con stock bajo'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Órdenes de Compra Recientes</h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {purchaseOrders?.length || 0} órdenes
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="overflow-auto h-full">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Número</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Proveedor</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Fecha</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Estado</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchaseOrders?.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{order.order_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.supplier?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(order.order_date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">${order.total_amount.toFixed(2)}</td>
                      </tr>
                    )) || []}
                    {(!purchaseOrders || purchaseOrders.length === 0) && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No hay órdenes de compra registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 h-full flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Proveedores</h3>
          
          {/* Suppliers List */}
          <div className="flex-1 overflow-y-auto mb-6">
            <div className="space-y-4">
              {suppliers?.map((supplier) => (
                <div key={supplier.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900">{supplier.name}</div>
                  <div className="text-sm text-gray-600">{supplier.contact_person}</div>
                  <div className="text-sm text-gray-600">{supplier.phone}</div>
                  {supplier.email && (
                    <div className="text-sm text-gray-600">{supplier.email}</div>
                  )}
                </div>
              )) || []}
              {(!suppliers || suppliers.length === 0) && (
                <div className="text-center text-gray-500 py-4">
                  No hay proveedores registrados
                </div>
              )}
            </div>
          </div>

          {/* Add New Supplier */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Nuevo Proveedor</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre empresa"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Persona de contacto"
                value={newSupplier.contact_person}
                onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <input
                type="tel"
                placeholder="Teléfono"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <input
                type="email"
                placeholder="Email (opcional)"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Dirección (opcional)"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              
              <button
                onClick={handleAddSupplier}
                disabled={creatingSupplier || !newSupplier.name || !newSupplier.contact_person || !newSupplier.phone}
                className="w-full bg-slate-700 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                <span>{creatingSupplier ? 'Agregando...' : 'Agregar Proveedor'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;