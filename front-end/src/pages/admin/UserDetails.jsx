import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Building,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Activity,
    Badge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UserDetails = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const userId = params.id;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [loanStats, setLoanStats] = useState(null);
    const [recentLoans, setRecentLoans] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);

const fetchLoanOfficerData = async () => {
    if (user?.role !== 'loan-officer') return;
    
    try {
        setLoadingStats(true);
        
        // Fetch loan statistics
        try {
            const statsResponse = await api.get(`/loan-officer/stats/${userId}`);
            console.log('Stats response:', statsResponse.data);
            if (statsResponse.data.success) {
                setLoanStats(statsResponse.data.data);
            }
        } catch (statsError) {
            console.error('Error fetching stats:', statsError);
            setLoanStats({
                total_loans: 0,
                active_loans: 0,
                total_amount: 0,
                collections_total: 0
            });
        }
        
        // Fetch recent loans - handle single object or array
        try {
            const loansResponse = await api.get(`/loan-officer/loans/${userId}`, {
                params: { limit: 5, sort: 'created_at', order: 'desc' }
            });
            console.log('Loans response:', loansResponse.data);
            
            if (loansResponse.data.success && loansResponse.data.data) {
                const loansData = loansResponse.data.data.loans;
                
                if (loansData) {
                    // If it's a single object, convert to array
                    if (typeof loansData === 'object' && !Array.isArray(loansData)) {
                        console.log('Converting single loan object to array:', loansData);
                        setRecentLoans([loansData]);
                    } 
                    // If it's already an array
                    else if (Array.isArray(loansData)) {
                        console.log('Using loans array:', loansData);
                        setRecentLoans(loansData);
                    } 
                    else {
                        console.log('No loans data found');
                        setRecentLoans([]);
                    }
                } else {
                    setRecentLoans([]);
                }
            } else {
                setRecentLoans([]);
            }
        } catch (loansError) {
            console.error('Error fetching loans:', loansError);
            setRecentLoans([]);
        }
        
        // Fetch recent borrowers - handle single object or array
        try {
            const borrowersResponse = await api.get(`/loan-officer/borrowers/${userId}`, {
                params: { limit: 5 }
            });
            console.log('Borrowers response:', borrowersResponse.data);
            
            if (borrowersResponse.data.success && borrowersResponse.data.data) {
                const borrowersData = borrowersResponse.data.data.borrowers;
                
                if (borrowersData) {
                    // If it's a single object, convert to array
                    if (typeof borrowersData === 'object' && !Array.isArray(borrowersData)) {
                        console.log('Converting single borrower object to array:', borrowersData);
                        setCollections([borrowersData]);
                    } 
                    // If it's already an array
                    else if (Array.isArray(borrowersData)) {
                        console.log('Using borrowers array:', borrowersData);
                        setCollections(borrowersData);
                    } 
                    else {
                        console.log('No borrowers data found');
                        setCollections([]);
                    }
                } else {
                    setCollections([]);
                }
            } else {
                setCollections([]);
            }
        } catch (borrowersError) {
            console.error('Error fetching borrowers:', borrowersError);
            setCollections([]);
        }
        
    } catch (error) {
        console.error('Error fetching loan officer data:', error);
        setLoanStats({
            total_loans: 0,
            active_loans: 0,
            total_amount: 0,
            collections_total: 0
        });
        setRecentLoans([]);
        setCollections([]);
    } finally {
        setLoadingStats(false);
    }
};





    // Add this useEffect to fetch loan officer data when user data is loaded
    useEffect(() => {
        if (user && user.role === 'loan-officer') {
            fetchLoanOfficerData();
        }
    }, [user]);

    // Map user data to component format
    const mapUserData = (userData) => {
        return {
            ...userData,
            phone: userData.mobile,
            is_active: userData.status === 'active',
            branch: userData.branch || 'Main Branch'
        };
    };

    // Fetch user details
    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            setError('');

            if (!userId) {
                setError('No user ID provided in URL');
                setLoading(false);
                return;
            }

            const response = await api.get(`/users/${userId}`);

            if (response.data.success) {
                setUser(mapUserData(response.data.data.user));
            } else {
                setError('User not found');
            }
        } catch (error) {
            try {
                const response = await api.get('/users');

                if (response.data.success && response.data.data && response.data.data.users) {
                    const foundUser = response.data.data.users.find(u =>
                        u.id.toString() === userId.toString() ||
                        u.employee_id === userId
                    );

                    if (foundUser) {
                        setUser(mapUserData(foundUser));
                    } else {
                        setError('User not found in users list');
                    }
                } else {
                    setError('Failed to fetch users list');
                }
            } catch (fallbackError) {
                setError(`Failed to fetch user details: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        } else {
            setError('No user ID provided in URL parameters');
            setLoading(false);
        }
    }, [userId]);

    // Handle delete user
    const handleDeleteUser = async () => {
        try {
            const response = await api.delete(`/users/${userId}`);

            if (response.data.success) {
                setShowDeleteModal(false);
                navigate('/admin/users');
            }
        } catch (error) {
            setError('Failed to delete user');
        }
    };

    // Role badge component
    const RoleBadge = ({ role }) => {
        const roleConfig = {
            admin: {
                bg: 'bg-gradient-to-r from-red-500 to-red-600',
                text: 'text-white',
                icon: '👑',
                shadow: 'shadow-lg shadow-red-500/25'
            },
            supervisor: {
                bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
                text: 'text-white',
                icon: '👨‍💼',
                shadow: 'shadow-lg shadow-blue-500/25'
            },
            'loan-officer': {
                bg: 'bg-gradient-to-r from-green-500 to-green-600',
                text: 'text-white',
                icon: '💼',
                shadow: 'shadow-lg shadow-green-500/25'
            },
            cashier: {
                bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
                text: 'text-white',
                icon: '💰',
                shadow: 'shadow-lg shadow-yellow-500/25'
            }
        };

        const config = roleConfig[role] || {
            bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
            text: 'text-white',
            icon: '👤',
            shadow: 'shadow-lg shadow-gray-500/25'
        };

        return (
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${config.bg} ${config.text} ${config.shadow}`}>
                <span className="mr-2">{config.icon}</span>
                <span className="font-semibold text-sm">
                    {role?.replace('-', ' ').toUpperCase()}
                </span>
            </div>
        );
    };

    // Status badge component
    const StatusBadge = ({ isActive }) => {
        return (
            <div className={`inline-flex items-center px-4 py-2 rounded-full shadow-lg ${isActive
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
                }`}>
                {isActive ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                )}
                <span className="font-semibold text-sm">
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="p-3 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200 mr-4 bg-white border border-gray-300"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Loading User Details...</h1>
                    </div>
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <span className="text-gray-700 font-medium">Loading user details...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="p-3 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200 mr-4 bg-white border border-gray-300"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                    </div>
                    <div className="text-center py-20">
                        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading User</h3>
                            <p className="text-gray-600 mb-6">{error || 'User not found'}</p>
                            <div className="space-x-3">
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                                >
                                    Back to Users
                                </button>
                                <button
                                    onClick={() => {
                                        setError('');
                                        fetchUserDetails();
                                    }}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/25"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="p-3 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200 bg-white border border-gray-300"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                                <p className="text-gray-600 mt-1">Complete information about {user.first_name} {user.last_name}</p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate(`/admin/users/${userId}/edit`)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-green-500/25 font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Edit User
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-red-500/25 font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
                            {/* Profile Header with Light Theme */}
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-8 text-center relative border-b border-gray-300">
                                <div className="relative">
                                    {/* Avatar */}
                                    <div className="mx-auto h-24 w-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg border-4 border-gray-300">
                                        <span className="text-gray-700 font-bold text-2xl">
                                            {user.first_name?.charAt(0) || 'U'}{user.last_name?.charAt(0) || 'U'}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        {user.first_name} {user.last_name}
                                    </h2>

                                    {/* Role Badge */}
                                    <div className="mb-4">
                                        <RoleBadge role={user.role} />
                                    </div>

                                    {/* Status */}
                                    <StatusBadge isActive={user.is_active} />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                                    <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</p>
                                        <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                                    </div>
                                </div>

                                {user.phone && (
                                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                                            <Phone className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</p>
                                            <p className="text-sm text-gray-900 font-medium">{user.phone}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                                    <div className="p-2 bg-purple-100 rounded-lg border border-purple-200">
                                        <Building className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Branch</p>
                                        <p className="text-sm text-gray-900 font-medium">{user.branch || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                                    <div className="p-2 bg-orange-100 rounded-lg border border-orange-200">
                                        <User className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Employee ID</p>
                                        <p className="text-sm text-gray-900 font-medium">{user.employee_id || user.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                                    <div className="p-2 bg-indigo-100 rounded-lg border border-indigo-200">
                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Joined</p>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Detailed Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <User className="w-5 h-5 mr-3 text-blue-600" />
                                    Personal Information
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-gray-900 font-medium">{user.first_name || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-gray-900 font-medium">{user.last_name || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-gray-900 font-medium">{user.email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Employee ID</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-gray-900 font-medium">{user.employee_id || user.id || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-gray-900 font-medium">
                                                {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Work Information */}
                        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Shield className="w-5 h-5 mr-3 text-green-600" />
                                    Work Information
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                                        <div className="p-3 bg-gray-50 rounded-xl flex items-center space-x-3 border border-gray-200">
                                            <Shield className="w-5 h-5 text-gray-600" />
                                            <p className="text-gray-900 font-medium">{user.role?.replace('-', ' ').toUpperCase() || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Branch</label>
                                        <div className="p-3 bg-gray-50 rounded-xl flex items-center space-x-3 border border-gray-200">
                                            <Building className="w-5 h-5 text-gray-600" />
                                            <p className="text-gray-900 font-medium">{user.branch || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Join Date</label>
                                        <div className="p-3 bg-gray-50 rounded-xl flex items-center space-x-3 border border-gray-200">
                                            <Calendar className="w-5 h-5 text-gray-600" />
                                            <p className="text-gray-900 font-medium">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last Login</label>
                                        <div className="p-3 bg-gray-50 rounded-xl flex items-center space-x-3 border border-gray-200">
                                            <Clock className="w-5 h-5 text-gray-600" />
                                            <p className="text-gray-900 font-medium">
                                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Activity className="w-5 h-5 mr-3 text-purple-600" />
                                    Account Summary
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {user.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">Days Active</p>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/25">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">Status</p>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/25">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {user.last_login ? 'Recent' : 'Never'}
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">Last Login</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



    <>
        {/* Loan Officer Statistics */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-3 text-indigo-600" />
                    Loan Officer Performance
                </h3>
            </div>
            <div className="p-6">
                {loadingStats ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {loanStats?.total_loans || 0}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">Total Loans</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {loanStats?.active_loans || 0}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">Active Loans</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">
                                ${loanStats?.total_amount ? Number(loanStats.total_amount).toLocaleString() : '0'}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                                ${loanStats?.collections_total ? Number(loanStats.collections_total).toLocaleString() : '0'}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">Collections</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Recent Loans Assigned */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-3 text-blue-600" />
                    Recent Loans Assigned
                </h3>
            </div>
            <div className="p-6">
                {Array.isArray(recentLoans) && recentLoans.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No loans assigned yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Array.isArray(recentLoans) && recentLoans.map((loan) => (
                            <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {loan.client_name || `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || 'Unknown Client'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Loan: {loan.loan_number || loan.loan_account || loan.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">
                                        ${Number(loan.amount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {loan.application_date ? new Date(loan.application_date).toLocaleDateString() : 
                                         loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                        loan.status === 'disbursed' || loan.status === 'active' ? 'bg-green-100 text-green-800' :
                                        loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                        loan.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {loan.status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Recent Collections - Updated to show borrowers */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-3 text-green-600" />
                    Assigned Borrowers
                </h3>
            </div>
            <div className="p-6">
                {Array.isArray(collections) && collections.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No borrowers assigned yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Array.isArray(collections) && collections.map((borrower) => (
                            <div key={borrower.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <User className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {`${borrower.first_name || ''} ${borrower.last_name || ''}`.trim() || 'Unknown Borrower'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Client: {borrower.client_number || borrower.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">
                                        ${Number(borrower.total_borrowed || 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {borrower.loan_count || 0} loan{(borrower.loan_count || 0) !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        ACTIVE
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </>




                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 border border-red-200 mb-4">
                                    <Trash2 className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex space-x-3 justify-center">
                                    <button
                                        onClick={handleDeleteUser}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                                    >
                                        Delete User
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-gray-500/25"
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

export default UserDetails;
