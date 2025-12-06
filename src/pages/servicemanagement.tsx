import { useState } from 'react';
import {
  Search,
  FolderPlus,
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
import { useServiceModalStore, type ServiceFormData } from '../store/createservice';

interface ServiceCategory {
  id: number;
  name: string;
  serviceCount: number;
  icon: typeof Home;
}

interface Service {
  id: number;
  name: string;
  category: string;
  priceRange: string;
  providers: number;
  status: 'Active' | 'Inactive';
}

const categories: ServiceCategory[] = [
  { id: 1, name: 'Indoor Services', serviceCount: 12, icon: Home },
  { id: 2, name: 'Outdoor Services', serviceCount: 8, icon: TreePine },
  { id: 3, name: 'Professional Services', serviceCount: 15, icon: Briefcase },
  { id: 4, name: 'Technical Services', serviceCount: 10, icon: Wrench },
];

const mockServices: Service[] = [
  {
    id: 1,
    name: 'House Cleaning',
    category: 'Indoor Services',
    priceRange: 'R50-150',
    providers: 45,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Plumbing',
    category: 'Indoor Services',
    priceRange: 'R80-200',
    providers: 32,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Gardening',
    category: 'Outdoor Services',
    priceRange: 'R60-180',
    providers: 28,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Electrical Work',
    category: 'Technical Services',
    priceRange: 'R100-300',
    providers: 21,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Lawn Mowing',
    category: 'Outdoor Services',
    priceRange: 'R40-120',
    providers: 38,
    status: 'Active',
  },
  {
    id: 6,
    name: 'Legal Consultation',
    category: 'Professional Services',
    priceRange: 'R150-400',
    providers: 15,
    status: 'Active',
  },
  {
    id: 7,
    name: 'Accounting Services',
    category: 'Professional Services',
    priceRange: 'R100-250',
    providers: 22,
    status: 'Active',
  },
  {
    id: 8,
    name: 'HVAC Repair',
    category: 'Technical Services',
    priceRange: 'R120-350',
    providers: 18,
    status: 'Active',
  },
];

export default function ServiceManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const { openModal, createService } = useServiceModalStore();

  const filteredServices = mockServices.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button className="add-category-button">
            <FolderPlus className="button-icon" />
            Add Category
          </button>
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
          <table className="services-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Price Range</th>
                <th>Providers</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td className="service-name-cell">{service.name}</td>
                  <td className="category-cell">{service.category}</td>
                  <td className="price-cell">{service.priceRange}</td>
                  <td className="providers-cell">{service.providers}</td>
                  <td>
                    <span className="status-badge status-active">
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
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal onSubmit={handleAddService} />
    </div>
  );
}

