import React, { useState } from 'react';
import { Search, AlertTriangle, Package, Plus, Truck, CheckCircle, Edit3, ChevronDown, ChevronRight, Eye, ShoppingCart, X } from 'lucide-react';
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
  const [stockUpdates, setStockUpdates] = useState({});
  const [showStockUpdate, setShowStockUpdate] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedOrderDetails, setSelectedOrderDetails] = useState({});
  const [receivingQuantities, setReceivingQuantities] = useState({});
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    supplier_id: '',
    products: []
  });

  const { data: lowStockItems, loading: stockLoading, refetch: refetchStock } = useApi('/inventory/low-stock');
  const { data: suppliers, loading: suppliersLoading, refetch: refetchSuppliers } = useApi('/suppliers');
  const { data: purchaseOrders, loading: ordersLoading, refetch: refetchOrders } = useApi('/purchase-orders');
  const { data: allProducts, loading: productsLoading } = useApi('/products');
  const { mutate: createSupplier, loading: creatingSupplier } = useApiMutation();
  const { mutate: createRestock, loading: restocking } = useApiMutation();
  const { mutate: updateStock, loading: updatingStock } = useApiMutation();
  const { mutate: receiveOrderItems, loading: receivingOrder } = useApiMutation();
  const { mutate: createPurchaseOrder, loading: creatingOrder } = useApiMutation();

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
        alert('Proveedor creado exitosamente');
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

  const handleStockUpdate = async (productId) => {
    const newStock = stockUpdates[productId];
    if (newStock === undefined || newStock === '') {
      alert('Por favor ingrese una cantidad válida');
      return;
    }

    try {
      await updateStock(() => apiService.updateProductStock(productId, parseInt(newStock)));
      alert('Stock actualizado exitosamente');
      setStockUpdates({ ...stockUpdates, [productId]: '' });
      setShowStockUpdate({ ...showStockUpdate, [productId]: false });
      refetchStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error al actualizar stock: ' + error.message);
    }
  };

  const toggleStockUpdate = (productId, currentStock) => {
    setShowStockUpdate({ ...showStockUpdate, [productId]: !showStockUpdate[productId] });
    if (!showStockUpdate[productId]) {
      setStockUpdates({ ...stockUpdates, [productId]: currentStock });
    }
  };

  const toggleOrderExpansion = async (orderId) => {
    const isExpanded = expandedOrders[orderId];
    setExpandedOrders({ ...expandedOrders, [orderId]: !isExpanded });
    
    if (!isExpanded && !selectedOrderDetails[orderId]) {
      try {
        const orderDetails = await apiService.getPurchaseOrderDetails(orderId);
        setSelectedOrderDetails({ ...selectedOrderDetails, [orderId]: orderDetails });
        
        const quantities = {};
        orderDetails.forEach(detail => {
          quantities[detail.id] = detail.quantity_ordered - detail.quantity_received;
        });
        setReceivingQuantities({ ...receivingQuantities, ...quantities });
      } catch (error) {
        console.error('Error fetching order details:', error);
        alert('Error al cargar detalles de la orden');
      }
    }
  };

  const updateReceivingQuantity = (detailId, quantity) => {
    setReceivingQuantities({
      ...receivingQuantities,
      [detailId]: Math.max(0, parseInt(quantity) || 0)
    });
  };

  const handleReceiveSelectedItems = async (orderId) => {
    const orderDetails = selectedOrderDetails[orderId];
    if (!orderDetails) return;

    const itemsToReceive = orderDetails
      .filter(detail => receivingQuantities[detail.id] > 0)
      .map(detail => ({
        detail_id: detail.id,
        quantity_received: receivingQuantities[detail.id]
      }));

    if (itemsToReceive.length === 0) {
      alert('Seleccione al menos un producto para recibir');
      return;
    }

    const confirmMessage = `¿Confirmar recepción de ${itemsToReceive.length} productos?`;
    if (window.confirm(confirmMessage)) {
      try {
        await receiveOrderItems(() => apiService.receiveOrderItems(orderId, itemsToReceive));
        alert('Productos recibidos y stock actualizado exitosamente');
        
        setExpandedOrders({ ...expandedOrders, [orderId]: false });
        setSelectedOrderDetails({ ...selectedOrderDetails, [orderId]: null });
        
        refetchOrders();
        refetchStock();
      } catch (error) {
        console.error('Error receiving items:', error);
        alert('Error al recibir productos: ' + error.message);
      }
    }
  };

  // Nueva función para agregar producto a la orden
  const addProductToOrder = () => {
    setNewOrder({
      ...newOrder,
      products: [
        ...newOrder.products,
        { product_id: '', quantity: 1, unit_cost: 0 }
      ]
    });
  };

  // Función para actualizar producto en la orden
  const updateOrderProduct = (index, field, value) => {
    const updatedProducts = [...newOrder.products];
    updatedProducts[index][field] = value;
    
    // Si se selecciona un producto, obtener su precio sugerido
    if (field === 'product_id' && value && allProducts) {
      const product = allProducts.find(p => p.id === parseInt(value));
      if (product) {
        updatedProducts[index].unit_cost = product.price * 0.8; // Precio sugerido 20% menos
      }
    }
    
    setNewOrder({ ...newOrder, products: updatedProducts });
  };

  // Función para remover producto de la orden
  const removeProductFromOrder = (index) => {
    const updatedProducts = newOrder.products.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, products: updatedProducts });
  };

  // Función para crear nueva orden de compra
  const handleCreateOrder = async () => {
    if (!newOrder.supplier_id || newOrder.products.length === 0) {
      alert('Seleccione un proveedor y agregue al menos un producto');
      return;
    }

    const validProducts = newOrder.products.filter(p => p.product_id && p.quantity > 0 && p.unit_cost > 0);
    if (validProducts.length === 0) {
      alert('Agregue productos válidos con cantidad y precio');
      return;
    }

    try {
      const orderData = {
        supplier_id: parseInt(newOrder.supplier_id),
        items: validProducts.map(p => ({
          product_id: parseInt(p.product_id),
          quantity_ordered: parseInt(p.quantity), // Cambio: quantity -> quantity_ordered
          unit_cost: parseFloat(p.unit_cost)
        })),
        expected_delivery: null,
        notes: null
      };

      await createPurchaseOrder(() => apiService.createPurchaseOrder(orderData));
      alert('Orden de compra creada exitosamente');
      
      // Reset form
      setNewOrder({ supplier_id: '', products: [] });
      setShowCreateOrder(false);
      refetchOrders();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Error al crear orden de compra: ' + error.message);
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

  // Función para obtener el proveedor correcto de un producto
  const getProductSupplier = (productId) => {
    if (!allProducts || !suppliers) return null;
    const product = allProducts.find(p => p.id === productId);
    if (!product || !product.supplier_id) return null;
    return suppliers.find(s => s.id === product.supplier_id);
  };

  if (stockLoading || suppliersLoading || ordersLoading || productsLoading) {
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
          <div className="bg-white rounded-lg shadow-sm flex-1 min-h-0 flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
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
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Código</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Producto</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Mínimo</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Proveedor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLowStock.map((item, index) => {
                    const correctSupplier = getProductSupplier(item.product_id);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.product_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.product_name}</td>
                        <td className="px-6 py-4 text-sm">
                          {showStockUpdate[item.product_id] ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={stockUpdates[item.product_id] || ''}
                                onChange={(e) => setStockUpdates({ 
                                  ...stockUpdates, 
                                  [item.product_id]: e.target.value 
                                })}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                min="0"
                              />
                              <button
                                onClick={() => handleStockUpdate(item.product_id)}
                                disabled={updatingStock}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle size={12} />
                              </button>
                              <button
                                onClick={() => toggleStockUpdate(item.product_id)}
                                className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-red-600 font-medium">{item.current_stock}</span>
                              <button
                                onClick={() => toggleStockUpdate(item.product_id, item.current_stock)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.min_stock}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {correctSupplier ? correctSupplier.name : 'Sin proveedor'}
                        </td>
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
                    );
                  })}
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

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm flex-1 min-h-0 flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">Órdenes de Compra</h2>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {purchaseOrders?.length || 0} órdenes
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateOrder(true)}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
                >
                  <ShoppingCart size={16} />
                  <span>Nueva Orden</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto min-h-0">
              <div className="divide-y divide-gray-200">
                {purchaseOrders?.map((order, index) => (
                  <div key={index} className="hover:bg-gray-50">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedOrders[order.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <div className="grid grid-cols-5 gap-4 flex-1 text-sm">
                          <div className="font-medium text-gray-900">{order.order_number}</div>
                          <div className="text-gray-900">{order.supplier?.name}</div>
                          <div className="text-gray-900">
                            {new Date(order.order_date).toLocaleDateString('es-ES')}
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="text-gray-900">${order.total_amount.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <Eye size={14} />
                          <span className="text-xs">Ver Detalles</span>
                        </button>
                      </div>
                    </div>

                    {expandedOrders[order.id] && selectedOrderDetails[order.id] && (
                      <div className="px-6 pb-4 bg-gray-50">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <h4 className="font-medium text-gray-900">Productos en esta orden</h4>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium text-gray-900">Producto</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-900">Ordenado</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-900">Recibido</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-900">Pendiente</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-900">Recibir Ahora</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {selectedOrderDetails[order.id].map((detail, detailIndex) => {
                                  const pending = detail.quantity_ordered - detail.quantity_received;
                                  return (
                                    <tr key={detailIndex} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-gray-900">
                                        <div>
                                          <div className="font-medium">{detail.product?.name}</div>
                                          <div className="text-xs text-gray-500">{detail.product?.code}</div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-gray-900">{detail.quantity_ordered}</td>
                                      <td className="px-4 py-2 text-gray-900">{detail.quantity_received}</td>
                                      <td className="px-4 py-2">
                                        <span className={`font-medium ${pending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                          {pending}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        {pending > 0 && (
                                          <input
                                            type="number"
                                            min="0"
                                            max={pending}
                                            value={receivingQuantities[detail.id] || 0}
                                            onChange={(e) => updateReceivingQuantity(detail.id, e.target.value)}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {order.status === 'pending' && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                              <button
                                onClick={() => handleReceiveSelectedItems(order.id)}
                                disabled={receivingOrder}
                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                              >
                                <CheckCircle size={14} />
                                <span>{receivingOrder ? 'Procesando...' : 'Recibir Productos Seleccionados'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )) || []}
                {(!purchaseOrders || purchaseOrders.length === 0) && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No hay órdenes de compra registradas
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 h-full flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Proveedores</h3>
          
          <div className="flex-1 overflow-y-auto mb-6 min-h-0">
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

          <div className="border-t border-gray-200 pt-6 flex-shrink-0">
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

      {/* Create Purchase Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Nueva Orden de Compra</h3>
              <button
                onClick={() => setShowCreateOrder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Supplier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor *
                  </label>
                  <select
                    value={newOrder.supplier_id}
                    onChange={(e) => setNewOrder({ ...newOrder, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers?.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Products Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Productos *
                    </label>
                    <button
                      onClick={addProductToOrder}
                      className="bg-slate-700 text-white px-3 py-1 rounded text-sm hover:bg-slate-800 transition-colors flex items-center space-x-1"
                    >
                      <Plus size={14} />
                      <span>Agregar Producto</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {newOrder.products.map((product, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Producto {index + 1}</h4>
                          <button
                            onClick={() => removeProductFromOrder(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Producto
                            </label>
                            <select
                              value={product.product_id}
                              onChange={(e) => updateOrderProduct(index, 'product_id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            >
                              <option value="">Seleccionar producto</option>
                              {allProducts?.map((prod) => (
                                <option key={prod.id} value={prod.id}>
                                  {prod.name} ({prod.code})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateOrderProduct(index, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Precio Unitario ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.unit_cost}
                              onChange={(e) => updateOrderProduct(index, 'unit_cost', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        {product.product_id && product.quantity && product.unit_cost && (
                          <div className="mt-3 text-sm text-gray-600">
                            Subtotal: ${(product.quantity * product.unit_cost).toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}

                    {newOrder.products.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Total */}
                {newOrder.products.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-end">
                      <div className="text-lg font-medium text-gray-900">
                        Total: ${newOrder.products.reduce((total, product) => {
                          return total + (parseFloat(product.quantity || 0) * parseFloat(product.unit_cost || 0));
                        }, 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowCreateOrder(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={creatingOrder || !newOrder.supplier_id || newOrder.products.length === 0}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <ShoppingCart size={16} />
                <span>{creatingOrder ? 'Creando...' : 'Crear Orden'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Inventory;