import React, { useState } from 'react';
import { Search, Minus, Plus, DollarSign, Calculator } from 'lucide-react';
import { useApi, useApiMutation } from '../hooks/useApi';
import apiService from '../services/api';

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  
  const { data: products, loading, refetch: refetchProducts } = useApi('/products');
  const { mutate, loading: processing } = useApiMutation();

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === id ? { ...item, cantidad: newQuantity } : item
      ));
    }
  };

  const addToOrder = (product) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }

    const existingItem = orderItems.find(item => item.product_id === product.id);
    if (existingItem) {
      if (existingItem.cantidad >= product.stock) {
        alert('No hay suficiente stock disponible');
        return;
      }
      updateQuantity(existingItem.id, existingItem.cantidad + 1);
    } else {
      const newItem = {
        id: Date.now().toString(),
        product_id: product.id,
        nombre: product.name,
        precio: product.price,
        cantidad: 1,
        stock_disponible: product.stock
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const totalAmount = orderItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const paymentAmountNum = parseFloat(paymentAmount) || 0;
  const changeAmount = paymentAmountNum - totalAmount;

  const handleShowPayment = () => {
    if (orderItems.length === 0) {
      alert('Agregue productos a la venta');
      return;
    }
    setShowPayment(true);
    setPaymentAmount(totalAmount.toFixed(2));
  };

  const handleConfirmSale = async () => {
    if (orderItems.length === 0) return;
    
    if (paymentAmountNum < totalAmount) {
      alert('El monto pagado es insuficiente');
      return;
    }
    
    try {
      const saleData = {
        payment_method: 'efectivo',
        customer_name: null,
        notes: changeAmount > 0 ? `Cambio: $${changeAmount.toFixed(2)}` : null,
        tax_amount: 0,
        discount_amount: 0,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.cantidad,
          unit_price: item.precio
        }))
      };
      
      console.log('Sending sale data:', saleData); // Debug log
      
      await mutate(() => apiService.createSale(saleData));
      
      // Reset form
      setOrderItems([]);
      setPaymentAmount('');
      setShowPayment(false);
      
      // Refresh products to show updated stock
      refetchProducts();
      
      // Show success message with change
      if (changeAmount > 0) {
        alert(`Venta registrada exitosamente\nCambio: $${changeAmount.toFixed(2)}`);
      } else {
        alert('Venta registrada exitosamente');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      alert(`Error al registrar la venta: ${error.message || 'Error desconocido'}`);
    }
  };

  const cancelPayment = () => {
    setShowPayment(false);
    setPaymentAmount('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Products List */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Precio</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts?.map((product, index) => (
                  <tr 
                    key={index} 
                    className={`cursor-pointer transition-colors ${
                      product.stock <= 0 
                        ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                        : product.stock <= product.min_stock 
                          ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800'
                          : 'hover:bg-gray-50'
                    }`}
                    onClick={() => addToOrder(product)}
                  >
                    <td className="px-6 py-4 text-sm font-medium">{product.code}</td>
                    <td className="px-6 py-4 text-sm">{product.name}</td>
                    <td className="px-6 py-4 text-sm font-medium">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${
                        product.stock <= 0 ? 'text-red-600' : 
                        product.stock <= product.min_stock ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                )) || []}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cash Register Sidebar */}
      <div className="w-96 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-6">
            <Calculator className="text-slate-700" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Caja Registradora</h3>
          </div>
          
          {/* Order Items */}
          <div className="flex-1 overflow-y-auto mb-6">
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{item.nombre}</div>
                    <div className="text-sm text-gray-600">${item.precio.toFixed(2)} c/u</div>
                    <div className="text-xs text-gray-500">Stock: {item.stock_disponible}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => {
                        if (item.cantidad >= item.stock_disponible) {
                          alert('No hay suficiente stock');
                          return;
                        }
                        updateQuantity(item.id, item.cantidad + 1);
                      }}
                      className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {orderItems.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Seleccione productos para agregar a la venta
                </div>
              )}
            </div>
          </div>
          
          {/* Payment Section */}
          <div className="border-t border-gray-200 pt-4 flex-shrink-0">
            <div className="space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-slate-700">${totalAmount.toFixed(2)}</span>
              </div>
              
              {showPayment && (
                <>
                  {/* Payment Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Recibido
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-lg font-medium"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  {/* Change */}
                  {paymentAmountNum > 0 && (
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium">Cambio:</span>
                      <span className={`font-bold ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${changeAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Payment Buttons */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={cancelPayment}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleConfirmSale}
                      disabled={processing || paymentAmountNum < totalAmount}
                      className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Procesando...' : 'Confirmar Venta'}
                    </button>
                  </div>
                </>
              )}
              
              {!showPayment && (
                <button 
                  onClick={handleShowPayment}
                  disabled={orderItems.length === 0}
                  className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <DollarSign size={20} />
                  <span>Procesar Pago</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;