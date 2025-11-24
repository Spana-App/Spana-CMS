import { useState } from 'react';
import { Search, UserPlus, MoreVertical } from 'lucide-react';
import '../Styles/usermanagement.css';

interface User {
  id: number;
  name: string;
  email: string;
  type: 'Client' | 'Provider';
  status: 'Active' | 'Suspended' | 'Inactive';
  joined: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    type: 'Client',
    status: 'Active',
    joined: '2024-01-15',
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    type: 'Provider',
    status: 'Active',
    joined: '2024-02-20',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    type: 'Client',
    status: 'Suspended',
    joined: '2024-03-10',
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma.d@example.com',
    type: 'Provider',
    status: 'Active',
    joined: '2024-03-25',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.b@example.com',
    type: 'Client',
    status: 'Inactive',
    joined: '2024-04-05',
  },
];

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('All Users');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUserType =
      userFilter === 'All Users' || user.type === userFilter;
    const matchesStatus =
      statusFilter === 'All Status' || user.status === statusFilter;
    return matchesSearch && matchesUserType && matchesStatus;
  });

  return (
    <div className="user-management-container">
      {/* Header Section */}
      <div className="user-management-header">
        <div className="header-content">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage clients and service providers.</p>
        </div>
        <button className="add-user-button">
          <UserPlus className="button-icon" />
          Add User
        </button>
      </div>

      {/* Main Content Panel */}
      <div className="user-management-panel">
        <div className="panel-header">
          <div className="panel-title-section">
            <h2 className="panel-title">All Users</h2>
            <p className="panel-subtitle">View and manage all user accounts.</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-container">
            <select
              className="filter-dropdown"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="All Users">All Users</option>
              <option value="Client">Client</option>
              <option value="Provider">Provider</option>
            </select>
            <select
              className="filter-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="name-cell">{user.name}</td>
                  <td className="email-cell">{user.email}</td>
                  <td>
                    <span
                      className={`type-badge ${
                        user.type === 'Provider' ? 'type-provider' : 'type-client'
                      }`}
                    >
                      {user.type}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.status === 'Active'
                          ? 'status-active'
                          : user.status === 'Suspended'
                          ? 'status-suspended'
                          : 'status-inactive'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="joined-cell">{user.joined}</td>
                  <td className="actions-cell">
                    <button className="actions-button">
                      <MoreVertical className="actions-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
