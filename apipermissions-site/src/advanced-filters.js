// Advanced Filters for API Permissions

// Advanced filters functionality
const advancedFilters = {
    // Configuration
    config: {
        itemsPerPage: 12,
        currentPage: 1
    },
    
    // References to DOM elements
    elements: {
        searchInput: null,
        searchButton: null,
        permissionsContainer: null,
        filterAdmin: null,
        filterDelegated: null,
        filterApplication: null,
        filterService: null,
        filterAccess: null,
        sortOrder: null,
        activeFilters: null,
        pagination: null,
        visibleCount: null,
        totalCount: null
    },
    
    // Data state
    data: {
        allPermissions: [],
        filteredPermissions: [],
        displayedPermissions: [],
        activeFilters: {
            search: '',
            types: ['Admin', 'Delegated', 'Application'],
            service: '',
            access: ''
        }
    },
    
    // Initialize the advanced filters
    init: function() {
        console.log('Initializing advanced filters...');
        
        // Get references to DOM elements
        this.cacheElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Wait for app to load permission data
        this.waitForAppData();
    },
    
    // Cache DOM element references
    cacheElements: function() {
        this.elements.searchInput = document.getElementById('advanced-search-input');
        this.elements.searchButton = document.getElementById('advanced-search-button');
        this.elements.permissionsContainer = document.getElementById('advanced-permissions-container');
        this.elements.filterAdmin = document.getElementById('filter-admin');
        this.elements.filterDelegated = document.getElementById('filter-delegated');
        this.elements.filterApplication = document.getElementById('filter-application');
        this.elements.filterService = document.getElementById('filter-service');
        this.elements.filterAccess = document.getElementById('filter-access');
        this.elements.sortOrder = document.getElementById('sort-order');
        this.elements.activeFilters = document.getElementById('active-filters');
        this.elements.pagination = document.getElementById('pagination');
        this.elements.visibleCount = document.getElementById('visible-count');
        this.elements.totalCount = document.getElementById('total-count');
    },
    
    // Set up event listeners
    setupEventListeners: function() {
        // Search
        this.elements.searchButton.addEventListener('click', () => {
            this.handleSearch();
        });
        
        this.elements.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        // Permission type filters
        this.elements.filterAdmin.addEventListener('change', () => {
            this.updateTypeFilters();
        });
        
        this.elements.filterDelegated.addEventListener('change', () => {
            this.updateTypeFilters();
        });
        
        this.elements.filterApplication.addEventListener('change', () => {
            this.updateTypeFilters();
        });
        
        // Service filter
        this.elements.filterService.addEventListener('change', () => {
            this.data.activeFilters.service = this.elements.filterService.value;
            this.applyFilters();
        });
        
        // Access level filter
        this.elements.filterAccess.addEventListener('change', () => {
            this.data.activeFilters.access = this.elements.filterAccess.value;
            this.applyFilters();
        });
        
        // Sort order
        this.elements.sortOrder.addEventListener('change', () => {
            this.sortPermissions();
            this.updateDisplay();
        });
    },
    
    // Wait for app data to be available
    waitForAppData: function() {
        // Check if app data is available
        if (window.app && window.app.data && window.app.data.processedPermissions) {
            this.data.allPermissions = window.app.data.processedPermissions;
            this.initializeFilters();
        } else {
            // Wait and try again
            setTimeout(() => {
                this.waitForAppData();
            }, 500);
        }
    },
    
    // Initialize filters with data
    initializeFilters: function() {
        this.data.filteredPermissions = [...this.data.allPermissions];
        this.data.displayedPermissions = [...this.data.filteredPermissions];
        
        this.updateCounters();
        this.sortPermissions();
        this.updateDisplay();
        this.updatePagination();
        
        console.log('Advanced filters initialized with', this.data.allPermissions.length, 'permissions');
    },
    
    // Handle search input
    handleSearch: function() {
        const query = this.elements.searchInput.value.trim();
        this.data.activeFilters.search = query;
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    },
    
    // Update permission type filters
    updateTypeFilters: function() {
        const types = [];
        
        if (this.elements.filterAdmin.checked) {
            types.push('Admin');
        }
        
        if (this.elements.filterDelegated.checked) {
            types.push('Delegated');
        }
        
        if (this.elements.filterApplication.checked) {
            types.push('Application');
        }
        
        this.data.activeFilters.types = types;
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    },
    
    // Apply all active filters
    applyFilters: function() {
        // Start with all permissions
        let filtered = [...this.data.allPermissions];
        
        // Apply search filter
        if (this.data.activeFilters.search) {
            const query = this.data.activeFilters.search.toLowerCase();
            filtered = filtered.filter(permission => {
                return (
                    (permission.value && permission.value.toLowerCase().includes(query)) ||
                    (permission.adminConsentDisplayName && permission.adminConsentDisplayName.toLowerCase().includes(query)) ||
                    (permission.consentDisplayName && permission.consentDisplayName.toLowerCase().includes(query)) ||
                    (permission.adminConsentDescription && permission.adminConsentDescription.toLowerCase().includes(query)) ||
                    (permission.consentDescription && permission.consentDescription.toLowerCase().includes(query))
                );
            });
        }
        
        // Apply type filters
        if (this.data.activeFilters.types.length > 0) {
            filtered = filtered.filter(permission => {
                return this.data.activeFilters.types.includes(permission.type);
            });
        }
        
        // Apply service filter
        if (this.data.activeFilters.service) {
            const service = this.data.activeFilters.service.toLowerCase();
            filtered = filtered.filter(permission => {
                return permission.value && permission.value.toLowerCase().includes(service);
            });
        }
        
        // Apply access filter
        if (this.data.activeFilters.access) {
            const access = this.data.activeFilters.access.toLowerCase();
            filtered = filtered.filter(permission => {
                return permission.value && permission.value.toLowerCase().includes(access);
            });
        }
        
        // Update filtered list
        this.data.filteredPermissions = filtered;
        
        // Reset to first page
        this.config.currentPage = 1;
        
        // Update counters
        this.updateCounters();
        
        // Sort and update display
        this.sortPermissions();
        this.updateDisplay();
        this.updatePagination();
    },
    
    // Sort permissions based on selected sort order
    sortPermissions: function() {
        const sortValue = this.elements.sortOrder.value;
        
        switch (sortValue) {
            case 'name-asc':
                this.data.filteredPermissions.sort((a, b) => {
                    return (a.value || '').localeCompare(b.value || '');
                });
                break;
                
            case 'name-desc':
                this.data.filteredPermissions.sort((a, b) => {
                    return (b.value || '').localeCompare(a.value || '');
                });
                break;
                
            case 'type':
                this.data.filteredPermissions.sort((a, b) => {
                    return (a.type || '').localeCompare(b.type || '');
                });
                break;
        }
    },
    
    // Update the permission cards displayed
    updateDisplay: function() {
        // Calculate pagination
        const startIndex = (this.config.currentPage - 1) * this.config.itemsPerPage;
        const endIndex = startIndex + this.config.itemsPerPage;
        
        // Get permissions for current page
        this.data.displayedPermissions = this.data.filteredPermissions.slice(startIndex, endIndex);
        
        // Clear container
        this.elements.permissionsContainer.innerHTML = '';
        
        // Check if we have permissions to display
        if (this.data.displayedPermissions.length === 0) {
            this.elements.permissionsContainer.innerHTML = '<div class="col-span-3 text-center p-8">No permissions found matching your criteria.</div>';
            return;
        }
        
        // Create and append permission cards
        this.data.displayedPermissions.forEach(permission => {
            const card = this.createPermissionCard(permission);
            this.elements.permissionsContainer.appendChild(card);
        });
    },
    
    // Create a permission card
    createPermissionCard: function(permission) {
        return window.app.createPermissionCard(permission);
    },
    
    // Update the active filters display
    updateActiveFiltersDisplay: function() {
        let hasActiveFilters = false;
        let filtersHtml = '';
        
        // Search filter
        if (this.data.activeFilters.search) {
            hasActiveFilters = true;
            filtersHtml += `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Search: ${this.data.activeFilters.search}
                <button class="ml-2 text-blue-500 hover:text-blue-700" onclick="advancedFilters.clearSearchFilter()">×</button>
            </span>`;
        }
        
        // Type filters
        if (this.data.activeFilters.types.length < 3 && this.data.activeFilters.types.length > 0) {
            hasActiveFilters = true;
            filtersHtml += `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Types: ${this.data.activeFilters.types.join(', ')}
                <button class="ml-2 text-blue-500 hover:text-blue-700" onclick="advancedFilters.resetTypeFilters()">×</button>
            </span>`;
        }
        
        // Service filter
        if (this.data.activeFilters.service) {
            hasActiveFilters = true;
            filtersHtml += `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Service: ${this.data.activeFilters.service}
                <button class="ml-2 text-blue-500 hover:text-blue-700" onclick="advancedFilters.clearServiceFilter()">×</button>
            </span>`;
        }
        
        // Access filter
        if (this.data.activeFilters.access) {
            hasActiveFilters = true;
            filtersHtml += `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                Access: ${this.data.activeFilters.access}
                <button class="ml-2 text-blue-500 hover:text-blue-700" onclick="advancedFilters.clearAccessFilter()">×</button>
            </span>`;
        }
        
        // Add "Clear All" button if there are active filters
        if (hasActiveFilters) {
            filtersHtml += `<span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center cursor-pointer"
                onclick="advancedFilters.clearAllFilters()">
                Clear All Filters
            </span>`;
        }
        
        // Update the display
        this.elements.activeFilters.innerHTML = filtersHtml;
        this.elements.activeFilters.style.display = hasActiveFilters ? 'flex' : 'none';
    },
    
    // Update pagination controls
    updatePagination: function() {
        const totalPages = Math.ceil(this.data.filteredPermissions.length / this.config.itemsPerPage);
        
        if (totalPages <= 1) {
            this.elements.pagination.style.display = 'none';
            return;
        }
        
        this.elements.pagination.style.display = 'flex';
        
        let paginationHtml = `<div class="flex space-x-2">
            <button class="px-4 py-2 border rounded ${this.config.currentPage === 1 ? 'bg-gray-200 text-gray-600' : 'bg-white text-blue-600'}"
                ${this.config.currentPage === 1 ? 'disabled' : 'onclick="advancedFilters.goToPage(' + (this.config.currentPage - 1) + ')"'}>
                Previous
            </button>`;
        
        // Determine which page buttons to show
        let startPage = Math.max(1, this.config.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4 && startPage > 1) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // First page if not in range
        if (startPage > 1) {
            paginationHtml += `<button class="px-4 py-2 border rounded bg-white text-blue-600" onclick="advancedFilters.goToPage(1)">1</button>`;
            
            if (startPage > 2) {
                paginationHtml += `<span class="px-4 py-2">...</span>`;
            }
        }
        
        // Page buttons
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `<button class="px-4 py-2 border rounded ${i === this.config.currentPage ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}"
                onclick="advancedFilters.goToPage(${i})">
                ${i}
            </button>`;
        }
        
        // Last page if not in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span class="px-4 py-2">...</span>`;
            }
            
            paginationHtml += `<button class="px-4 py-2 border rounded bg-white text-blue-600" onclick="advancedFilters.goToPage(${totalPages})">
                ${totalPages}
            </button>`;
        }
        
        paginationHtml += `<button class="px-4 py-2 border rounded ${this.config.currentPage === totalPages ? 'bg-gray-200 text-gray-600' : 'bg-white text-blue-600'}"
            ${this.config.currentPage === totalPages ? 'disabled' : 'onclick="advancedFilters.goToPage(' + (this.config.currentPage + 1) + ')"'}>
            Next
        </button></div>`;
        
        this.elements.pagination.innerHTML = paginationHtml;
    },
    
    // Go to a specific page
    goToPage: function(page) {
        this.config.currentPage = page;
        this.updateDisplay();
        this.updatePagination();
        
        // Scroll to top of permissions container
        this.elements.permissionsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    
    // Update counters
    updateCounters: function() {
        this.elements.visibleCount.textContent = this.data.filteredPermissions.length;
        this.elements.totalCount.textContent = this.data.allPermissions.length;
    },
    
    // Clear search filter
    clearSearchFilter: function() {
        this.elements.searchInput.value = '';
        this.data.activeFilters.search = '';
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    },
    
    // Reset type filters
    resetTypeFilters: function() {
        this.elements.filterAdmin.checked = true;
        this.elements.filterDelegated.checked = true;
        this.elements.filterApplication.checked = true;
        this.data.activeFilters.types = ['Admin', 'Delegated', 'Application'];
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    },
    
    // Clear service filter
    clearServiceFilter: function() {
        this.elements.filterService.value = '';
        this.data.activeFilters.service = '';
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    },
    
    // Clear access filter
    clearAccessFilter: function() {
        this.elements.filterAccess.value = '';
        this.data.activeFilters.access = '';
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    },
    
    // Clear all filters
    clearAllFilters: function() {
        this.elements.searchInput.value = '';
        this.data.activeFilters.search = '';
        
        this.elements.filterAdmin.checked = true;
        this.elements.filterDelegated.checked = true;
        this.elements.filterApplication.checked = true;
        this.data.activeFilters.types = ['Admin', 'Delegated', 'Application'];
        
        this.elements.filterService.value = '';
        this.data.activeFilters.service = '';
        
        this.elements.filterAccess.value = '';
        this.data.activeFilters.access = '';
        
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    advancedFilters.init();
}); 