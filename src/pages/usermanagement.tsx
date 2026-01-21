import { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, MoreVertical, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/usermanagement.css';
import { useUsersStore } from '../store/users';
import type { User } from '../store/users';

const ITEMS_PER_PAGE = 10;

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('All Users');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { users, isFetching, error, fetchUsers } = useUsersStore();

  useEffect(() => {
    fetchUsers().catch((err) => {
      console.error('Error fetching users:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, userFilter, statusFilter]);

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateString;
    }
  };

  // Helper function to get user type (default to Client if not provided)
  const getUserType = (user: User): 'Client' | 'Provider' => {
    return user.type || 'Client';
  };

  // Helper function to get user status (default to Active if not provided)
  const getUserStatus = (user: User): 'Active' | 'Suspended' | 'Inactive' => {
    return user.status || 'Active';
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesUserType =
        userFilter === 'All Users' || getUserType(user) === userFilter;
      const matchesStatus =
        statusFilter === 'All Status' || getUserStatus(user) === statusFilter;
      return matchesSearch && matchesUserType && matchesStatus;
    });
  }, [users, searchQuery, userFilter, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

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

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ padding: '1rem', color: 'red', backgroundColor: '#fee', borderRadius: '4px', margin: '1rem 0' }}>
            Error: {error}
          </div>
        )}

        {/* Loading State */}
        {isFetching && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <Loader2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: '0.5rem' }}>Loading users...</span>
          </div>
        )}

        {/* User Table */}
        {!isFetching && (
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
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      {users.length === 0 ? 'No users found' : 'No users match your filters'}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const userType = getUserType(user);
                    const userStatus = getUserStatus(user);
                    const joinedDate = formatDate(user.joined || user.createdAt);
                    
                    return (
                      <tr key={user.id}>
                        <td className="name-cell">{user.name || 'N/A'}</td>
                        <td className="email-cell">{user.email || 'N/A'}</td>
                        <td>
                          <span
                            className={`type-badge ${
                              userType === 'Provider' ? 'type-provider' : 'type-client'
                            }`}
                          >
                            {userType}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              userStatus === 'Active'
                                ? 'status-active'
                                : userStatus === 'Suspended'
                                ? 'status-suspended'
                                : 'status-inactive'
                            }`}
                          >
                            {userStatus}
                          </span>
                        </td>
                        <td className="joined-cell">{joinedDate}</td>
                        <td className="actions-cell">
                          <button className="actions-button">
                            <MoreVertical className="actions-icon" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isFetching && filteredUsers.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="pagination-icon" />
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`pagination-page-button ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageClick(page)}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="pagination-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="pagination-icon" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
