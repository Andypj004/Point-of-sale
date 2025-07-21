import React, { useState } from 'react';
import { Search, Minus, Plus } from 'lucide-react';

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([
    { id: '1', nombre: 'Libra de arroz', precio: 0.50, cantidad: 1 }
  ]);

  const products = [
    { codigo: 'ARR001', nombre: 'Libra de arroz', precio: 0.50 },
    { codigo: 'FRJ002', nombre: 'Frijoles negros', precio: 0.75 },
    { codigo: 'AZU003', nombre: 'Azúcar blanca', precio: 0.60 },
    { codigo: 'ACE004', nombre: 'Aceite vegetal', precio: 1.25 },
  ];

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
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
    const existingItem = orderItems.find(item => item.nombre === product.nombre);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.cantidad + 1);
    } else {
      const newItem = {
        id: Date.now().toString(),
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const totalAmount = orderItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  return (
    <div className="flex h-full">
      {/* Products List */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar"
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
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => addToOrder(product)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{product.codigo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${product.precio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Orden</h3>
          <div className="space-y-4 mb-6">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.nombre}</div>
                  <div className="text-sm text-gray-600">${item.precio.toFixed(2)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.cantidad}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-gray-900">
                $ {totalAmount.toFixed(2)}
              </span>
              <button className="bg-slate-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;