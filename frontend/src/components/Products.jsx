import React, { useState } from 'react';
import { Search } from 'lucide-react';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    precio: '',
    cantidad: ''
  });
  const [products, setProducts] = useState([
    { id: '1', codigo: 'ARR001', nombre: 'Libra de arroz', precio: 0.50, cantidad: 150 },
    { id: '2', codigo: 'FRJ002', nombre: 'Frijoles negros', precio: 0.75, cantidad: 89 },
    { id: '3', codigo: 'AZU003', nombre: 'Azúcar blanca', precio: 0.60, cantidad: 45 },
    { id: '4', codigo: 'ACE004', nombre: 'Aceite vegetal', precio: 1.25, cantidad: 23 },
  ]);

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (newProduct.nombre && newProduct.precio && newProduct.cantidad) {
      const product = {
        id: Date.now().toString(),
        codigo: `PRD${Date.now().toString().slice(-3)}`,
        nombre: newProduct.nombre,
        precio: parseFloat(newProduct.precio),
        cantidad: parseInt(newProduct.cantidad)
      };
      setProducts([...products, product]);
      setNewProduct({ nombre: '', precio: '', cantidad: '' });
    }
  };

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
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{product.codigo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${product.precio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Sidebar */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Nuevo producto</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Libra de arroz"
                value={newProduct.nombre}
                onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio $
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.50"
                value={newProduct.precio}
                onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                placeholder="100"
                value={newProduct.cantidad}
                onChange={(e) => setNewProduct({ ...newProduct, cantidad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleAddProduct}
              className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;