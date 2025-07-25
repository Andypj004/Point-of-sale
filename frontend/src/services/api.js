const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request('/dashboard/metrics');
  }

  async getBestSellingProducts() {
    return this.request('/dashboard/best-selling');
  }

  // Products endpoints
  async getProducts() {
    return this.request('/products');
  }

  async getCategories() {
    return this.request('/categories');
  }
  async createProduct(product) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id, product) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales endpoints
  async createSale(sale) {
    console.log('API: Creating sale with data:', sale); // Debug log
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async getSales(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sales?${queryString}`);
  }

  // Reports endpoints
  async getSalesReport(startDate, endDate, type = 'sales') {
    return this.request(`/reports/${type}?start_date=${startDate}&end_date=${endDate}`);
  }

  async getProductsReport(startDate, endDate, categoryId = null) {
    let url = `/reports/products?start_date=${startDate}&end_date=${endDate}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }
    return this.request(url);
  }
  // Inventory endpoints
  async getLowStockItems() {
    return this.request('/inventory/low-stock');
  }

  async createRestockOrder(productId, quantity) {
    return this.request(`/inventory/restock/${productId}?quantity=${quantity}`, {
      method: 'POST',
    });
  }
  async getSuppliers() {
    return this.request('/suppliers');
  }

  async createSupplier(supplier) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  }

  async createPurchaseOrder(order) {
    return this.request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getPurchaseOrders() {
    return this.request('/purchase-orders');
  }
}

export default new ApiService();