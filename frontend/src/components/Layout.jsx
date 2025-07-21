import React from 'react';
import { Clock, DollarSign, Package, FileText, Users } from 'lucide-react';

const Layout = ({ children, currentPage, onPageChange }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Clock },
    { id: 'ventas', label: 'Ventas', icon: DollarSign },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'reabastecimiento', label: 'Reabastecimiento', icon: Users },
  ];

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });
  const timeString = currentDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-48 bg-white shadow-lg">
        <div className="p-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex flex-col items-center p-4 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-slate-700 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={24} className="mb-2" />
                  <span className="text-sm font-medium text-center">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <h1 className="text-gray-600 font-medium">
            {dateString.charAt(0).toUpperCase() + dateString.slice(1)} | {timeString}
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;