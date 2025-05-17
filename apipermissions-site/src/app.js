// API Permissions App

// URLs for Microsoft Graph API permissions data
const PERMISSIONS_URLS = {
    descriptions: './data/permissions-descriptions.json',
    provisioning: './data/provisioning-info.json',
    permissions: './data/permissions.json'
};

// Base URL for canonical links
const BASE_URL = 'https://apipermissions.cengizyilmaz.net';

// Main app object
const app = {
    data: {
        descriptions: null,
        provisioning: null,
        permissions: null,
        filteredPermissions: null,
        currentPermission: null
    },
    
    // Initialize the application
    init: async function() {
        console.log('Initializing API Permissions app...');
        
        try {
            // Show loading state
            this.toggleLoading(true);
            
            // Fetch all data in parallel
            await this.fetchAllData();
            
            // Process and merge data
            this.processData();
            
            // Check for permission in URL
            this.handleUrlParameters();
            
            // Render the UI
            this.renderPermissions();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Hide loading state
            this.toggleLoading(false);
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load permissions data. Please try again later.');
            this.toggleLoading(false);
        }
    },
    
    // Toggle loading state
    toggleLoading: function(isLoading) {
        // Implementation will depend on UI requirements
        console.log(isLoading ? 'Loading...' : 'Loading complete');
        
        // Show/hide loading indicators
        const loadingPlaceholders = document.querySelectorAll('.animate-pulse');
        loadingPlaceholders.forEach(placeholder => {
            placeholder.parentElement.style.display = isLoading ? 'block' : 'none';
        });
    },
    
    // Fetch all data from sources
    fetchAllData: async function() {
        const promises = [
            fetch(PERMISSIONS_URLS.descriptions).then(response => response.json()),
            fetch(PERMISSIONS_URLS.provisioning).then(response => response.json()),
            fetch(PERMISSIONS_URLS.permissions).then(response => response.json())
        ];
        
        try {
            const [descriptions, provisioning, permissions] = await Promise.all(promises);
            
            this.data.descriptions = descriptions;
            this.data.provisioning = provisioning;
            this.data.permissions = permissions;
            
            console.log('All data fetched successfully');
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Failed to fetch permission data');
        }
    },
    
    // Process and merge the data
    processData: function() {
        if (!this.data.descriptions || !this.data.descriptions.delegatedScopesList) {
            throw new Error('Invalid permissions data');
        }
        
        // Convert delegatedScopesList to a more usable format
        const processedPermissions = this.data.descriptions.delegatedScopesList.map(permission => {
            // Find additional information from other sources if available
            const provisioningInfo = this.data.provisioning ? 
                this.data.provisioning.find(p => p.value === permission.value) : null;
                
            return {
                ...permission,
                provisioningInfo,
                type: this.getPermissionType(permission),
                badge: this.getPermissionBadge(permission)
            };
        });
        
        this.data.processedPermissions = processedPermissions;
        this.data.filteredPermissions = processedPermissions;
        
        console.log(`Processed ${processedPermissions.length} permissions`);
    },
    
    // Determine permission type
    getPermissionType: function(permission) {
        if (permission.allowedMemberTypes && permission.allowedMemberTypes.includes('Application')) {
            return 'Application';
        } else if (permission.isAdmin) {
            return 'Admin';
        } else {
            return 'Delegated';
        }
    },
    
    // Get appropriate badge class
    getPermissionBadge: function(permission) {
        if (permission.allowedMemberTypes && permission.allowedMemberTypes.includes('Application')) {
            return 'badge-application';
        } else if (permission.isAdmin) {
            return 'badge-admin';
        } else {
            return 'badge-delegated';
        }
    },
    
    // Render permissions to UI
    renderPermissions: function() {
        const container = document.getElementById('permissions-container');
        
        // Clear existing content
        container.innerHTML = '';
        
        // Check if we have permissions to display
        if (!this.data.filteredPermissions || this.data.filteredPermissions.length === 0) {
            container.innerHTML = '<div class="col-span-3 text-center p-8">No permissions found matching your criteria.</div>';
            return;
        }
        
        // Create and append permission cards
        this.data.filteredPermissions.forEach(permission => {
            const card = this.createPermissionCard(permission);
            container.appendChild(card);
        });
        
        console.log(`Rendered ${this.data.filteredPermissions.length} permissions`);
    },
    
    // Generate canonical URL for a permission
    getCanonicalUrl: function(permission) {
        if (!permission || !permission.value) return BASE_URL;
        const apiName = permission.value.split('.')[0];
        const permissionSlug = permission.value.toLowerCase().replace(/\./g, '-');
        return `${BASE_URL}/api/${apiName}/permission/${permissionSlug}`;
    },
    
    // Update canonical link
    updateCanonicalLink: function(permission) {
        const canonicalLink = document.getElementById('canonical-link');
        if (canonicalLink) {
            canonicalLink.href = this.getCanonicalUrl(permission);
        }
    },
    
    // Create a card element for a permission
    createPermissionCard: function(permission) {
        const card = document.createElement('div');
        card.className = 'permission-card p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all';
        
        // Create badge for permission type
        const badgeType = permission.type || 'Unknown';
        const badgeClass = permission.badge || 'badge-delegated';
        const canonicalUrl = this.getCanonicalUrl(permission);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold text-blue-700">
                    <a href="${canonicalUrl}" class="hover:underline">${permission.value || 'Unnamed Permission'}</a>
                </h3>
                <span class="badge ${badgeClass}">${badgeType}</span>
            </div>
            <p class="text-sm mb-3">${permission.adminConsentDisplayName || permission.consentDisplayName || 'No display name available'}</p>
            <p class="text-xs text-gray-600">${permission.adminConsentDescription || permission.consentDescription || 'No description available'}</p>
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                <span class="text-xs text-gray-500">ID: ${permission.id || 'Unknown'}</span>
                <button class="text-blue-600 text-sm hover:text-blue-800" 
                    data-permission-id="${permission.id || ''}"
                    onclick="app.showPermissionDetails('${permission.id || ''}')">Details</button>
            </div>
        `;
        
        return card;
    },
    
    // Set up event listeners
    setupEventListeners: function() {
        // Search input
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        searchButton.addEventListener('click', () => {
            this.handleSearch();
        });
        
        console.log('Event listeners set up');
    },
    
    // Handle search functionality
    handleSearch: function() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            // If search is empty, show all permissions
            this.data.filteredPermissions = this.data.processedPermissions;
        } else {
            // Filter permissions based on search query
            this.data.filteredPermissions = this.data.processedPermissions.filter(permission => {
                return (
                    (permission.value && permission.value.toLowerCase().includes(query)) ||
                    (permission.adminConsentDisplayName && permission.adminConsentDisplayName.toLowerCase().includes(query)) ||
                    (permission.consentDisplayName && permission.consentDisplayName.toLowerCase().includes(query)) ||
                    (permission.adminConsentDescription && permission.adminConsentDescription.toLowerCase().includes(query)) ||
                    (permission.consentDescription && permission.consentDescription.toLowerCase().includes(query))
                );
            });
        }
        
        // Re-render with filtered results
        this.renderPermissions();
        
        console.log(`Search for "${query}" returned ${this.data.filteredPermissions.length} results`);
    },
    
    // Show detailed view of a permission
    showPermissionDetails: function(permissionId) {
        if (!permissionId) return;
        
        // Find the permission
        const permission = this.data.processedPermissions.find(p => p.id === permissionId);
        
        if (!permission) {
            console.error('Permission not found:', permissionId);
            return;
        }
        
        // Update canonical link for the permission
        this.updateCanonicalLink(permission);
        this.data.currentPermission = permission;
        
        // Create modal content
        const modalHtml = `
            <div class="modal-backdrop" id="permission-modal">
                <div class="modal-content p-6 w-full max-w-2xl">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-xl font-bold">
                            <a href="${this.getCanonicalUrl(permission)}" class="hover:underline">${permission.value || 'Permission Details'}</a>
                        </h2>
                        <button class="text-gray-500 hover:text-gray-800" onclick="app.closeModal()">&times;</button>
                    </div>
                    
                    <div class="mb-4">
                        <span class="badge ${permission.badge}">${permission.type || 'Unknown'}</span>
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold text-gray-600">ID</h3>
                        <p class="text-sm">${permission.id || 'Unknown'}</p>
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold text-gray-600">Display Name</h3>
                        <p class="text-sm">${permission.adminConsentDisplayName || permission.consentDisplayName || 'N/A'}</p>
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-sm font-semibold text-gray-600">Description</h3>
                        <p class="text-sm">${permission.adminConsentDescription || permission.consentDescription || 'N/A'}</p>
                    </div>
                    
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="app.closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstChild);
        
        console.log('Showing details for permission:', permissionId);
    },
    
    // Close the modal
    closeModal: function() {
        const modal = document.getElementById('permission-modal');
        if (modal) {
            modal.parentNode.removeChild(modal);
        }
    },
    
    // Show error message
    showError: function(message) {
        const container = document.getElementById('permissions-container');
        container.innerHTML = `
            <div class="col-span-3 text-center p-8 text-red-600">
                <p class="mb-4">${message}</p>
                <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="app.init()">Retry</button>
            </div>
        `;
    },
    
    // Handle URL parameters
    handleUrlParameters: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const permissionParam = urlParams.get('permission');
        
        if (permissionParam) {
            // Find the permission in our data
            const permission = this.data.processedPermissions.find(p => 
                p.value && p.value.toLowerCase() === permissionParam.toLowerCase()
            );
            
            if (permission) {
                // Update canonical link
                this.updateCanonicalLink(permission);
                
                // Show permission details
                setTimeout(() => {
                    this.showPermissionDetails(permission.id);
                }, 100);
                
                // Update search input
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = permission.value;
                    this.handleSearch();
                }
            }
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
}); 