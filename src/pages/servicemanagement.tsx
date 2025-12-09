import { useState, useEffect } from 'react';
import {
  Search,
  // FolderPlus,
  Plus,
  Home,
  TreePine,
  Briefcase,
  Wrench,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import '../Styles/servicemanagement.css';
import { AddServiceModal } from '../Modals/servicemodal';
import { useServiceModalStore, useViewServiceModalStore, type ServiceFormData, type Service } from '../store/createservice';
import ViewServiceModal from '../Modals/viewservicemodal';
interface ServiceCategory {
  id: number;
  name: string;
  serviceCount: number;
  icon: typeof Home;
}

interface DisplayService {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  providers: number;
  status: 'Active' | 'Inactive';
  description?: string;
  mediaUrl?: string;
}

const categories: ServiceCategory[] = [
  { id: 1, name: 'Indoor Services', serviceCount: 12, icon: Home },
  { id: 2, name: 'Outdoor Services', serviceCount: 8, icon: TreePine },
  { id: 3, name: 'Professional Services', serviceCount: 15, icon: Briefcase },
  { id: 4, name: 'Technical Services', serviceCount: 10, icon: Wrench },
];


export default function ServiceManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const { openModal, createService, fetchServices, services, isFetching, error } = useServiceModalStore();

  // Fetch services on component mount
  useEffect(() => {
    fetchServices().catch(console.error);
  }, []);

  // Transform API services to match table format
  const transformedServices: DisplayService[] = services.map((service: Service) => ({
    id: service.id,
    name: service.title,
    category: 'General', // You might want to add category to the Service interface
    priceRange: `R${service.price}`,
    providers: 0, // You might want to add this to the Service interface
    status: (service.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
    description: service.description,
    mediaUrl: service.mediaUrl,
  }));

  // Filter services based on search query
  const filteredServices = transformedServices.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { openViewServiceModal } = useViewServiceModalStore();

  const handleViewService = (serviceId: string) => {
    const service = services.find((s: Service) => s.id === serviceId);
    if (service) {
      openViewServiceModal(service);
    } else {
      console.error('Service not found with ID:', serviceId);
    }
  };


  const handleAddService = async (serviceData: ServiceFormData) => {
    try {
      const response = await createService(serviceData);
      console.log('Service created successfully:', response);
      toast.success('Service created successfully!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
      });
      // Refresh services list after creating a new one
      await fetchServices();
    } catch (error) {
      console.error('Failed to create service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="service-management-container">
      {/* Header Section */}
      <div className="service-management-header">
        <div className="header-content">
          <h1 className="page-title">Service Management</h1>
          <p className="page-subtitle">
            Manage service categories and offerings.
          </p>
        </div>
        <div className="header-buttons">
          {/* <button className="add-category-button">
            <FolderPlus className="button-icon" />
            Add Category
          </button> */}
          <button
            className="add-service-button"
            onClick={openModal}
          >
            <Plus className="button-icon" />
            Add Service
          </button>
        </div>
      </div>

      {/* Service Categories Section */}
      <div className="categories-section">
        <div className="categories-grid">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="category-card">
                <button className="category-edit-button">
                  <Pencil className="category-edit-icon" />
                </button>
                <div className="category-icon-wrapper">
                  <IconComponent className="category-icon" />
                </div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">
                  {category.serviceCount} services
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Services Section */}
      <div className="services-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">All Services</h2>
            <p className="panel-subtitle">View and manage service listings.</p>
          </div>
        </div>

        {/* Search and Bulk Update Bar */}
        <div className="search-bulk-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search services..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bulk-update-button">Bulk Update</button>
        </div>

        {/* Services Table */}
        <div className="table-container">
          {isFetching ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading services...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
              Error: {error}
            </div>
          ) : filteredServices.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {searchQuery ? 'No services found matching your search.' : 'No services available.'}
            </div>
          ) : (
            <table className="services-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Providers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} onClick={()=>handleViewService(service.id)}>
                    <td className="service-name-cell">{service.name}</td>
                    <td className="category-cell">{service.category}</td>
                    <td className="price-cell">{service.priceRange}</td>
                    <td className="providers-cell">{service.providers}</td>
                    <td>
                      <span className={`status-badge ${service.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-group">
                        <button className="action-button edit-button">
                          <Pencil className="action-icon" />
                        </button>
                        <button className="action-button delete-button">
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal onSubmit={handleAddService} />
      <ViewServiceModal />
    </div>
  );
}

