/**
 * ProductHub - Client Application
 * Handles UI state, REST API communication, live previews, and DOM rendering
 */

// Helper to resolve the backend API endpoint using CONFIG.API_BASE_URL
function getApiUrl(endpoint) {
  const base = (typeof CONFIG !== 'undefined' && CONFIG && typeof CONFIG.API_BASE_URL === 'string')
    ? CONFIG.API_BASE_URL.trim()
    : '';

  if (!base) {
    return endpoint;
  }

  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanPath}`;
}

// Application State
const state = {
  currentSection: 'dashboard',
  currentPage: 1,
  limit: 12,
  totalPages: 1,
  filters: {
    search: '',
    category: 'All',
    brand: 'All',
    sort: 'newest'
  },
  pendingDeleteId: null,
  pendingDeleteName: ''
};

// Bootstrap Modals
let productDetailsModal;
let editProductModal;
let deleteConfirmModal;
let healthModal;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap Modals
  productDetailsModal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
  editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
  deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  healthModal = new bootstrap.Modal(document.getElementById('healthModal'));

  // Handle URL hash routing
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  navigateTo(initialHash, false);

  // Check initial backend & MongoDB Atlas connectivity
  checkSystemHealth();

  // Load Dashboard data initially
  fetchDashboardStats();
});

// ==========================================
// NAVIGATION & ROUTING
// ==========================================
function navigateTo(section, updateHistory = true) {
  const validSections = ['dashboard', 'catalogue', 'add-product'];
  if (!validSections.includes(section)) {
    section = 'dashboard';
  }

  state.currentSection = section;

  // Update Section Visibility
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });
  const targetSection = document.getElementById(`section-${section}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update Nav Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById(`nav-${section}`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  if (updateHistory) {
    window.location.hash = section;
  }

  // Load section-specific data
  if (section === 'dashboard') {
    fetchDashboardStats();
  } else if (section === 'catalogue') {
    fetchCatalogue();
  } else if (section === 'add-product') {
    updateLivePreview();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// SYSTEM HEALTH & DATABASE CONNECTION STATUS
// ==========================================
async function checkSystemHealth(isUserTriggered = false) {
  const navPulse = document.getElementById('nav-pulse-dot');
  const navDbLabel = document.getElementById('nav-db-label');
  const bannerPulse = document.getElementById('banner-pulse-dot');
  const bannerStatus = document.getElementById('banner-db-status');
  const bannerDetails = document.getElementById('banner-db-details');
  const healthDbStatus = document.getElementById('health-db-status');

  try {
    const res = await fetch(getApiUrl('/api/health'));
    const data = await res.json();

    const dbStatus = data.database?.status || (res.ok ? 'Connected' : 'Disconnected');

    if (dbStatus === 'Connected') {
      if (navPulse) navPulse.className = 'pulse-dot connected';
      if (navDbLabel) navDbLabel.innerText = 'Connected';
      if (bannerPulse) bannerPulse.className = 'pulse-dot connected';
      if (bannerStatus) {
        bannerStatus.className = 'text-success fw-bold';
        bannerStatus.innerText = 'Connected';
      }
      if (bannerDetails) {
        bannerDetails.innerHTML = 'Database: <strong class="text-dark font-monospace">product_catalogue</strong> | Document Collection: <strong class="text-dark">products</strong>';
      }
      if (healthDbStatus) {
        healthDbStatus.innerHTML = '<span class="badge bg-success">Connected</span>';
      }
    } else if (dbStatus === 'Connecting') {
      if (navPulse) navPulse.className = 'pulse-dot connecting';
      if (navDbLabel) navDbLabel.innerText = 'Connecting';
      if (bannerPulse) bannerPulse.className = 'pulse-dot connecting';
      if (bannerStatus) {
        bannerStatus.className = 'text-warning fw-bold';
        bannerStatus.innerText = 'Connecting';
      }
      if (bannerDetails) {
        bannerDetails.innerHTML = 'Connecting to MongoDB Atlas cluster...';
      }
      if (healthDbStatus) {
        healthDbStatus.innerHTML = '<span class="badge bg-warning text-dark">Connecting</span>';
      }
    } else {
      if (navPulse) navPulse.className = 'pulse-dot disconnected';
      if (navDbLabel) navDbLabel.innerText = 'Disconnected';
      if (bannerPulse) bannerPulse.className = 'pulse-dot disconnected';
      if (bannerStatus) {
        bannerStatus.className = 'text-danger fw-bold';
        bannerStatus.innerText = 'Disconnected';
      }
      if (bannerDetails) {
        bannerDetails.innerHTML = '<span class="text-danger">Database connection unavailable. Please verify MongoDB Atlas network access and cluster status.</span>';
      }
      if (healthDbStatus) {
        healthDbStatus.innerHTML = '<span class="badge bg-danger">Disconnected</span>';
      }
    }

    // Modal details
    const healthAppName = document.getElementById('health-app-name');
    if (healthAppName) healthAppName.innerText = data.application || 'ProductHub Application';
    const healthStatus = document.getElementById('health-status');
    if (healthStatus) {
      healthStatus.className = dbStatus === 'Connected' ? 'badge bg-success' : 'badge bg-danger';
      healthStatus.innerText = dbStatus === 'Connected' ? 'Healthy' : 'Database Unavailable';
    }
    const healthDbName = document.getElementById('health-db-name');
    if (healthDbName) healthDbName.innerText = data.database?.name || 'product_catalogue';
    const healthNode = document.getElementById('health-node-version');
    if (healthNode) healthNode.innerText = data.system?.nodeVersion || 'N/A';
    const healthPlatform = document.getElementById('health-platform');
    if (healthPlatform) healthPlatform.innerText = data.system?.platform || 'N/A';
    const healthUptime = document.getElementById('health-uptime');
    if (healthUptime) healthUptime.innerText = data.uptime || 'N/A';
    const healthMemory = document.getElementById('health-memory');
    if (healthMemory) healthMemory.innerText = `${data.system?.memoryUsageMB || 0} MB`;

    if (isUserTriggered) {
      showToast(`Database Connection: ${dbStatus}`, dbStatus === 'Connected' ? 'success' : 'warning');
    }
  } catch (err) {
    if (navPulse) navPulse.className = 'pulse-dot disconnected';
    if (navDbLabel) navDbLabel.innerText = 'Disconnected';
    if (bannerPulse) bannerPulse.className = 'pulse-dot disconnected';
    if (bannerStatus) {
      bannerStatus.className = 'text-danger fw-bold';
      bannerStatus.innerText = 'Disconnected';
    }
    if (bannerDetails) {
      bannerDetails.innerHTML = '<span class="text-danger">Unable to reach the backend API server. Ensure the Express backend is running and reachable.</span>';
    }
    if (healthDbStatus) {
      healthDbStatus.innerHTML = '<span class="badge bg-danger">Disconnected</span>';
    }
    if (isUserTriggered) {
      showToast('Unable to reach backend API server.', 'danger');
    }
  }
}

function checkHealthModal() {
  checkSystemHealth();
  healthModal.show();
}

// ==========================================
// DASHBOARD LOGIC
// ==========================================
async function fetchDashboardStats() {
  try {
    const res = await fetch(getApiUrl('/api/dashboard/stats'));
    const result = await res.json();

    if (!result.success) {
      document.getElementById('stat-total-products').innerText = '0';
      document.getElementById('stat-total-brands').innerText = '0';
      document.getElementById('stat-total-categories').innerText = '0';
      document.getElementById('stat-avg-price').innerText = '₹0';
      const catContainer = document.getElementById('category-distribution-container');
      if (catContainer) {
        catContainer.innerHTML = '<span class="text-muted small">Database unavailable</span>';
      }
      const tbody = document.getElementById('recent-products-tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-muted">
              <i class="bi bi-exclamation-circle me-1"></i> ${escapeHtml(result.message || 'Database connection unavailable.')}
            </td>
          </tr>
        `;
      }
      return;
    }

    const { totalProducts, totalBrands, totalCategories, avgPrice, categoryStats, recentProducts } = result.data;

    // Render Metrics
    document.getElementById('stat-total-products').innerText = totalProducts.toLocaleString();
    document.getElementById('stat-total-brands').innerText = totalBrands.toLocaleString();
    document.getElementById('stat-total-categories').innerText = totalCategories.toLocaleString();
    document.getElementById('stat-avg-price').innerText = `₹${avgPrice.toLocaleString('en-IN')}`;

    // Render Category Distribution Pills
    const catContainer = document.getElementById('category-distribution-container');
    catContainer.innerHTML = '';

    if (!categoryStats || categoryStats.length === 0) {
      catContainer.innerHTML = '<span class="text-muted small">No product categories found.</span>';
    } else {
      categoryStats.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-2';
        btn.innerHTML = `
          <span>${escapeHtml(item._id || 'Uncategorized')}</span>
          <span class="badge bg-primary text-white rounded-pill">${item.count}</span>
        `;
        btn.onclick = () => {
          state.filters.category = item._id;
          navigateTo('catalogue');
        };
        catContainer.appendChild(btn);
      });
    }

    // Render Recent Products Table
    const tbody = document.getElementById('recent-products-tbody');
    tbody.innerHTML = '';

    if (!recentProducts || recentProducts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            No products found in MongoDB. Click "Add New Product" to insert your first record!
          </td>
        </tr>
      `;
      return;
    }

    recentProducts.forEach(prod => {
      const tr = document.createElement('tr');
      const stockBadge = prod.stock > 5 
        ? `<span class="badge bg-success-subtle text-success">${prod.stock} in stock</span>`
        : prod.stock > 0 
          ? `<span class="badge bg-warning-subtle text-warning">${prod.stock} low stock</span>`
          : `<span class="badge bg-danger-subtle text-danger">Out of stock</span>`;

      tr.innerHTML = `
        <td class="font-monospace fw-semibold text-primary">${escapeHtml(prod.productId)}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100')}" 
                 alt="${escapeHtml(prod.name)}" class="rounded" style="width: 36px; height: 36px; object-fit: cover;">
            <span class="fw-semibold text-dark">${escapeHtml(prod.name)}</span>
          </div>
        </td>
        <td>${escapeHtml(prod.brand)}</td>
        <td><span class="badge bg-light text-secondary border">${escapeHtml(prod.category)}</span></td>
        <td class="fw-bold">₹${Number(prod.price).toLocaleString('en-IN')}</td>
        <td>${stockBadge}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" title="View Details" onclick="viewProductDetails('${prod.productId}')">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-primary" title="Edit" onclick="openEditModal('${prod.productId}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" title="Delete" onclick="promptDelete('${prod.productId}', '${escapeHtml(prod.name)}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    const catContainer = document.getElementById('category-distribution-container');
    if (catContainer) {
      catContainer.innerHTML = '<span class="text-danger small">Unable to load categories (backend unreachable)</span>';
    }
    const tbody = document.getElementById('recent-products-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-danger">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> Unable to connect to backend API server. Please ensure the backend is running.
          </td>
        </tr>
      `;
    }
  }
}

// ==========================================
// PRODUCT CATALOGUE LOGIC
// ==========================================
async function fetchCatalogue() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <div class="mt-2 text-muted">Retrieving products from MongoDB Atlas...</div>
    </div>
  `;

  // Read controls
  const limitSelect = document.getElementById('catalogue-limit');
  if (limitSelect) state.limit = parseInt(limitSelect.value, 10);

  // Construct query string
  const params = new URLSearchParams({
    page: state.currentPage,
    limit: state.limit
  });

  if (state.filters.search) params.append('search', state.filters.search);
  if (state.filters.category && state.filters.category !== 'All') params.append('category', state.filters.category);
  if (state.filters.brand && state.filters.brand !== 'All') params.append('brand', state.filters.brand);
  if (state.filters.sort) params.append('sort', state.filters.sort);

  try {
    const res = await fetch(getApiUrl(`/api/products?${params.toString()}`));
    const result = await res.json();

    if (!result.success) {
      grid.innerHTML = `<div class="col-12 alert alert-danger">${result.message || 'Error loading catalogue'}</div>`;
      return;
    }

    state.totalPages = result.totalPages;
    state.currentPage = result.currentPage;

    // Update Category & Brand Filter Options
    populateFilterDropdowns(result.categories, result.brands);

    // Update Result Count text
    document.getElementById('catalogue-results-count').innerText = 
      `Showing ${result.count} of ${result.total} products in catalogue`;

    // Render Product Cards
    renderProductCards(result.data);

    // Render Pagination Controls
    renderPagination(result.currentPage, result.totalPages);
  } catch (error) {
    console.error('Error fetching catalogue:', error);
    grid.innerHTML = `<div class="col-12 alert alert-danger">Failed to connect to backend server.</div>`;
  }
}

function populateFilterDropdowns(categories = [], brands = []) {
  const catSelect = document.getElementById('catalogue-filter-category');
  const brandSelect = document.getElementById('catalogue-filter-brand');

  const currentCat = state.filters.category;
  const currentBrand = state.filters.brand;

  // Repopulate Categories
  catSelect.innerHTML = '<option value="All">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.innerText = cat;
    if (cat === currentCat) opt.selected = true;
    catSelect.appendChild(opt);
  });

  // Repopulate Brands
  brandSelect.innerHTML = '<option value="All">All Brands</option>';
  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.innerText = b;
    if (b === currentBrand) opt.selected = true;
    brandSelect.appendChild(opt);
  });
}

function renderProductCards(products = []) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="fs-1 text-muted"><i class="bi bi-inbox"></i></div>
        <h5 class="mt-2 text-dark">No products found</h5>
        <p class="text-muted small">No products match your search or filter criteria in MongoDB.</p>
        <button class="btn btn-outline-primary btn-sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  products.forEach(prod => {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4 col-xl-3';

    const stockBadge = prod.stock > 5 
      ? `<span class="badge bg-success-subtle text-success">${prod.stock} in stock</span>`
      : prod.stock > 0 
        ? `<span class="badge bg-warning-subtle text-warning">${prod.stock} left</span>`
        : `<span class="badge bg-danger-subtle text-danger">Out of stock</span>`;

    const ramText = prod.specifications?.ram && prod.specifications.ram !== 'N/A' ? prod.specifications.ram : null;
    const storageText = prod.specifications?.storage && prod.specifications.storage !== 'N/A' ? prod.specifications.storage : null;
    const procText = prod.specifications?.processor && prod.specifications.processor !== 'N/A' ? prod.specifications.processor : null;

    let specsHtml = '';
    if (ramText) specsHtml += `<span class="spec-pill"><i class="bi bi-memory"></i> ${escapeHtml(ramText)}</span>`;
    if (storageText) specsHtml += `<span class="spec-pill"><i class="bi bi-hdd"></i> ${escapeHtml(storageText)}</span>`;
    if (procText) specsHtml += `<span class="spec-pill"><i class="bi bi-cpu"></i> ${escapeHtml(procText)}</span>`;

    col.innerHTML = `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${escapeHtml(prod.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600')}" 
               alt="${escapeHtml(prod.name)}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'">
          <span class="product-badge-id">${escapeHtml(prod.productId)}</span>
          <span class="product-category-badge">${escapeHtml(prod.category)}</span>
        </div>
        <div class="product-body">
          <div class="product-brand">${escapeHtml(prod.brand)}</div>
          <div class="product-title" title="${escapeHtml(prod.name)}">${escapeHtml(prod.name)}</div>
          <div class="product-desc">${escapeHtml(prod.description || 'No description provided.')}</div>
          
          <div class="spec-pills">
            ${specsHtml || '<span class="text-muted small">Standard specifications</span>'}
          </div>

          <div class="product-footer">
            <div>
              <div class="product-price">₹${Number(prod.price).toLocaleString('en-IN')}</div>
              <div class="mt-1">${stockBadge}</div>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" title="View Details" onclick="viewProductDetails('${prod.productId}')">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-primary" title="Edit" onclick="openEditModal('${prod.productId}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger" title="Delete" onclick="promptDelete('${prod.productId}', '${escapeHtml(prod.name)}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function renderPagination(current, total) {
  const ul = document.getElementById('catalogue-pagination');
  ul.innerHTML = '';

  if (total <= 1) return;

  // Previous
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${current === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `<button class="page-link" onclick="goToPage(${current - 1})">&laquo; Prev</button>`;
  ul.appendChild(prevLi);

  // Page Numbers
  for (let i = 1; i <= total; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === current ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link" onclick="goToPage(${i})">${i}</button>`;
    ul.appendChild(li);
  }

  // Next
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${current === total ? 'disabled' : ''}`;
  nextLi.innerHTML = `<button class="page-link" onclick="goToPage(${current + 1})">Next &raquo;</button>`;
  ul.appendChild(nextLi);
}

function goToPage(page) {
  if (page < 1 || page > state.totalPages) return;
  state.currentPage = page;
  fetchCatalogue();
}

function handleSearchKey(e) {
  if (e.key === 'Enter') {
    triggerSearch();
  }
}

function triggerSearch() {
  const input = document.getElementById('catalogue-search-input');
  state.filters.search = input.value.trim();
  state.currentPage = 1;
  fetchCatalogue();
}

function triggerFilter() {
  state.filters.category = document.getElementById('catalogue-filter-category').value;
  state.filters.brand = document.getElementById('catalogue-filter-brand').value;
  state.filters.sort = document.getElementById('catalogue-sort').value;
  state.currentPage = 1;
  fetchCatalogue();
}

function resetFilters() {
  state.filters = {
    search: '',
    category: 'All',
    brand: 'All',
    sort: 'newest'
  };
  document.getElementById('catalogue-search-input').value = '';
  document.getElementById('catalogue-filter-category').value = 'All';
  document.getElementById('catalogue-filter-brand').value = 'All';
  document.getElementById('catalogue-sort').value = 'newest';
  state.currentPage = 1;
  fetchCatalogue();
}

// ==========================================
// ADD PRODUCT & LIVE PREVIEW
// ==========================================
function updateLivePreview() {
  const pid = document.getElementById('add-productId').value || 'PID';
  const name = document.getElementById('add-name').value || 'Product Name Here';
  const brand = document.getElementById('add-brand').value || 'BRAND';
  const category = document.getElementById('add-category').value || 'Category';
  const price = document.getElementById('add-price').value || '0';
  const stock = document.getElementById('add-stock').value || '0';
  const desc = document.getElementById('add-description').value || 'Product description will appear here as you type into the form...';
  const image = document.getElementById('add-image').value || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
  const ram = document.getElementById('add-spec-ram').value || 'N/A';
  const storage = document.getElementById('add-spec-storage').value || 'N/A';
  const proc = document.getElementById('add-spec-processor').value || 'N/A';

  document.getElementById('preview-id').innerText = pid.toUpperCase();
  document.getElementById('preview-name').innerText = name;
  document.getElementById('preview-brand').innerText = brand.toUpperCase();
  document.getElementById('preview-category').innerText = category;
  document.getElementById('preview-price').innerText = `₹${Number(price).toLocaleString('en-IN')}`;
  document.getElementById('preview-stock').innerText = `${stock} In Stock`;
  document.getElementById('preview-desc').innerText = desc;
  document.getElementById('preview-img').src = image;

  document.getElementById('preview-spec-ram').querySelector('span').innerText = ram;
  document.getElementById('preview-spec-storage').querySelector('span').innerText = storage;
  document.getElementById('preview-spec-proc').querySelector('span').innerText = proc;
}

function resetLivePreview() {
  setTimeout(() => {
    updateLivePreview();
  }, 50);
}

async function handleCreateProduct(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-submit-add');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Inserting Document...`;

  const newProduct = {
    productId: document.getElementById('add-productId').value.trim(),
    name: document.getElementById('add-name').value.trim(),
    brand: document.getElementById('add-brand').value.trim(),
    category: document.getElementById('add-category').value.trim(),
    price: Number(document.getElementById('add-price').value),
    stock: Number(document.getElementById('add-stock').value),
    description: document.getElementById('add-description').value.trim(),
    image: document.getElementById('add-image').value.trim() || undefined,
    specifications: {
      ram: document.getElementById('add-spec-ram').value.trim() || 'N/A',
      storage: document.getElementById('add-spec-storage').value.trim() || 'N/A',
      processor: document.getElementById('add-spec-processor').value.trim() || 'N/A'
    }
  };

  try {
    const res = await fetch(getApiUrl('/api/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || 'Failed to create product in MongoDB', 'danger');
      return;
    }

    showToast(`Product "${result.data.name}" added successfully!`, 'success');
    document.getElementById('add-product-form').reset();
    resetLivePreview();

    // Navigate to catalogue to view newly inserted document
    navigateTo('catalogue');
  } catch (error) {
    console.error('Error creating product:', error);
    showToast('Network error while connecting to MongoDB server.', 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-cloud-arrow-up me-1"></i> Save to MongoDB Atlas`;
  }
}

// ==========================================
// VIEW PRODUCT DETAILS (MODAL)
// ==========================================
async function viewProductDetails(id) {
  try {
    const res = await fetch(getApiUrl(`/api/products/${id}`));
    const result = await res.json();

    if (!result.success) {
      showToast(result.message || 'Product not found', 'danger');
      return;
    }

    const p = result.data;
    document.getElementById('detail-modal-title').innerText = `${p.name} (${p.productId})`;
    document.getElementById('detail-pid').innerText = p.productId;
    document.getElementById('detail-mongoid').innerText = p._id;
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-brand').innerText = p.brand;
    document.getElementById('detail-category').innerText = p.category;
    document.getElementById('detail-price').innerText = `₹${Number(p.price).toLocaleString('en-IN')}`;
    document.getElementById('detail-stock').innerText = `${p.stock} units in stock`;
    document.getElementById('detail-created').innerText = new Date(p.createdAt).toLocaleDateString();
    document.getElementById('detail-description').innerText = p.description || 'No description provided.';
    document.getElementById('detail-img').src = p.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600';

    // Specs
    document.getElementById('detail-spec-ram').innerText = p.specifications?.ram || 'N/A';
    document.getElementById('detail-spec-storage').innerText = p.specifications?.storage || 'N/A';
    document.getElementById('detail-spec-processor').innerText = p.specifications?.processor || 'N/A';

    // Raw JSON representation
    document.getElementById('detail-raw-json').innerText = JSON.stringify(p, null, 2);

    // Modal action buttons
    document.getElementById('detail-btn-edit').onclick = () => {
      productDetailsModal.hide();
      openEditModal(p.productId);
    };
    document.getElementById('detail-btn-delete').onclick = () => {
      productDetailsModal.hide();
      promptDelete(p.productId, p.name);
    };

    productDetailsModal.show();
  } catch (error) {
    console.error('Error viewing product:', error);
    showToast('Failed to retrieve product details.', 'danger');
  }
}

// ==========================================
// EDIT PRODUCT (MODAL)
// ==========================================
async function openEditModal(id) {
  try {
    const res = await fetch(getApiUrl(`/api/products/${id}`));
    const result = await res.json();

    if (!result.success) {
      showToast(result.message || 'Product not found', 'danger');
      return;
    }

    const p = result.data;
    document.getElementById('edit-target-id').value = p.productId;
    document.getElementById('edit-productId').value = p.productId;
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-brand').value = p.brand;
    document.getElementById('edit-category').value = p.category;
    document.getElementById('edit-price').value = p.price;
    document.getElementById('edit-stock').value = p.stock;
    document.getElementById('edit-image').value = p.image || '';
    document.getElementById('edit-description').value = p.description || '';

    document.getElementById('edit-spec-ram').value = p.specifications?.ram || '';
    document.getElementById('edit-spec-storage').value = p.specifications?.storage || '';
    document.getElementById('edit-spec-processor').value = p.specifications?.processor || '';

    editProductModal.show();
  } catch (error) {
    console.error('Error opening edit modal:', error);
    showToast('Failed to load product for editing.', 'danger');
  }
}

async function handleUpdateProduct(event) {
  event.preventDefault();
  const targetId = document.getElementById('edit-target-id').value;
  const btn = document.getElementById('btn-submit-edit');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Updating...`;

  const updatedData = {
    productId: document.getElementById('edit-productId').value.trim(),
    name: document.getElementById('edit-name').value.trim(),
    brand: document.getElementById('edit-brand').value.trim(),
    category: document.getElementById('edit-category').value.trim(),
    price: Number(document.getElementById('edit-price').value),
    stock: Number(document.getElementById('edit-stock').value),
    image: document.getElementById('edit-image').value.trim(),
    description: document.getElementById('edit-description').value.trim(),
    specifications: {
      ram: document.getElementById('edit-spec-ram').value.trim() || 'N/A',
      storage: document.getElementById('edit-spec-storage').value.trim() || 'N/A',
      processor: document.getElementById('edit-spec-processor').value.trim() || 'N/A'
    }
  };

  try {
    const res = await fetch(getApiUrl(`/api/products/${targetId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || 'Error updating product document', 'danger');
      return;
    }

    showToast(`Product "${result.data.name}" updated successfully!`, 'success');
    editProductModal.hide();

    // Refresh current view
    if (state.currentSection === 'catalogue') {
      fetchCatalogue();
    } else {
      fetchDashboardStats();
    }
  } catch (error) {
    console.error('Error updating product:', error);
    showToast('Failed to update product document.', 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-check-lg me-1"></i> Update in MongoDB`;
  }
}

// ==========================================
// DELETE PRODUCT (MODAL CONFIRMATION)
// ==========================================
function promptDelete(id, name) {
  state.pendingDeleteId = id;
  state.pendingDeleteName = name;
  document.getElementById('delete-modal-product-id').innerText = id;
  document.getElementById('delete-modal-product-name').innerText = name;
  deleteConfirmModal.show();
}

async function executeDelete() {
  if (!state.pendingDeleteId) return;

  const btn = document.getElementById('confirm-delete-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Deleting...`;

  try {
    const res = await fetch(getApiUrl(`/api/products/${state.pendingDeleteId}`), {
      method: 'DELETE'
    });

    const result = await res.json();

    if (!res.ok) {
      showToast(result.message || 'Failed to delete product', 'danger');
      return;
    }

    showToast(`Product "${state.pendingDeleteName}" deleted from MongoDB!`, 'success');
    deleteConfirmModal.hide();

    // Refresh views
    if (state.currentSection === 'catalogue') {
      fetchCatalogue();
    } else {
      fetchDashboardStats();
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Failed to delete document from database.', 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-trash3 me-1"></i> Yes, Delete Document`;
    state.pendingDeleteId = null;
    state.pendingDeleteName = '';
  }
}

// ==========================================
// TOAST NOTIFICATIONS & UTILITIES
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toastId = `toast-${Date.now()}`;
  const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
  const bgClass = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-primary';

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white ${bgClass} border-0 shadow-lg`;
  toastEl.id = toastId;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${icon} fs-5"></i>
        <div>${escapeHtml(message)}</div>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

