import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical, Users, UserCheck, Briefcase, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import EditUserModal from '../../components/modals/EditUserModal';

const UserManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [activeTab, setActiveTab] = useState('supervisor');
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_users: 0,
        per_page: 12
    });

    // Tab configuration
    const tabs = [
        {
            id: 'supervisor',
            name: 'Supervisors',
            icon: UserCheck,
            role: 'supervisor',
            color: 'blue'
        },
        {
            id: 'loan-officer',
            name: 'Loan Officers',
            icon: Briefcase,
            role: 'loan-officer',
            color: 'green'
        },
        {
            id: 'cashier',
            name: 'Cashiers',
            icon: Calculator,
            role: 'cashier',
            color: 'yellow'
        }
    ];

    // Navigate to user details page
    const handleViewUser = (user) => {
        navigate(`/dashboard/admin/users/${user.id}`);
    };

    // Fetch users based on active tab
    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pagination.per_page,
                role: activeTab,
                ...(searchTerm && { search: searchTerm }),
                ...(filterBranch && { branch: filterBranch })
            };

            const response = await api.get('/users', { params });

            if (response.data.success) {
                setUsers(response.data.data.users);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [activeTab, searchTerm, filterBranch]);

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle pagination
    const handlePageChange = (page) => {
        fetchUsers(page);
    };

    // Handle delete user
    const handleDeleteUser = async () => {
        try {
            const response = await api.delete(`/users/${selectedUser.id}`);

            if (response.data.success) {
                setUsers(users.filter(u => u.id !== selectedUser.id));
                setShowDeleteModal(false);
                setSelectedUser(null);
            }
        } catch (error) {
            setError('Failed to delete user');
            console.error('Delete user error:', error);
        }
    };

    // Role badge component
    const RoleBadge = ({ role }) => {
        const roleColors = {
            supervisor: 'bg-blue-100 text-blue-800',
            'loan-officer': 'bg-green-100 text-green-800',
            cashier: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
                {role?.replace('-', ' ').toUpperCase()}
            </span>
        );
    };

    // Status badge component
    const StatusBadge = ({ isActive }) => {
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    // User Card Component
    const UserCard = ({ user }) => {
        return (
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                    {/* User Avatar and Basic Info */}
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            <div className="mt-1">
                                <RoleBadge role={user.role} />
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Employee ID:</span>
                            <span className="text-sm font-medium text-gray-900">{user.employee_id}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Branch:</span>
                            <span className="text-sm font-medium text-gray-900">{user.branch}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Status:</span>
                            <StatusBadge isActive={user.is_active} />
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Joined:</span>
                            <span className="text-sm font-medium text-gray-900">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                        <button
                            onClick={() => handleViewUser(user)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                        </button>
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    setSelectedUser(user);
                                    setShowEditModal(true);
                                }}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                                title="Edit User"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteModal(true);
                                }}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete User"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add New User
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                        <nav className="flex">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 font-medium text-sm transition-all duration-200 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-b-2 border-blue-500'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                        <span className={`ml-2 py-1 px-3 rounded-full text-xs font-semibold ${
                                            isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {users.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${tabs.find(t => t.id === activeTab)?.name.toLowerCase()}...`}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                                />
                            </div>

                            {/* Branch Filter */}
                            <select
                                value={filterBranch}
                                onChange={(e) => setFilterBranch(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                            >
                                <option value="">All Branches</option>
                                <option value="main">Main Branch</option>
                                <option value="downtown">Downtown</option>
                                <option value="uptown">Uptown</option>
                            </select>

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterBranch('');
                                }}
                                className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Users Grid */}
                <div className="mb-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                                <span className="text-gray-600 font-medium">Loading users...</span>
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                                <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                                                                <p className="text-gray-600 mb-6">
                                    No {tabs.find(t => t.id === activeTab)?.name.toLowerCase()} found matching your criteria.
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                                >
                                    Add First User
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {users.map((user) => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="bg-white rounded-xl shadow-sm px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.total_pages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {((pagination.current_page - 1) * pagination.per_page) + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.current_page * pagination.per_page, pagination.total_users)}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium">{pagination.total_users}</span>{' '}
                                        results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Previous
                                        </button>

                                        {/* Page numbers */}
                                        {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
                                            let page;
                                            if (pagination.total_pages <= 5) {
                                                page = i + 1;
                                            } else if (pagination.current_page <= 3) {
                                                page = i + 1;
                                            } else if (pagination.current_page >= pagination.total_pages - 2) {
                                                page = pagination.total_pages - 4 + i;
                                            } else {
                                                page = pagination.current_page - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${
                                                        page === pagination.current_page
                                                            ? 'z-10 bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.total_pages}
                                            className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {showEditModal && selectedUser && (
                    <EditUserModal
                        isOpen={showEditModal}
                        user={selectedUser}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedUser(null);
                        }}
                        onUserUpdated={() => {
                            fetchUsers();
                            setShowEditModal(false);
                            setSelectedUser(null);
                        }}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 border border-red-200 mb-4">
                                    <Trash2 className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-gray-900">
                                        {selectedUser.first_name} {selectedUser.last_name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex space-x-3 justify-center">
                                    <button
                                        onClick={handleDeleteUser}
                                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                                    >
                                        Delete User
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setSelectedUser(null);
                                        }}
                                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/25"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
