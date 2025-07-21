import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Products from './components/Products';
import Reports from './components/Reports';
import Inventory from './components/Inventory';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'ventas':
        return <Sales />;
      case 'productos':
        return <Products />;
      case 'reportes':
        return <Reports />;
      case 'reabastecimiento':
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;