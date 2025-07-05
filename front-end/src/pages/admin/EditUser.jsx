import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Phone, Calendar, Building, Shield } from 'lucide-react';
import api from '../../services/api';

const EditUser = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        branch: '',
        role: '',
        gender: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState(null);

    // Map user data to component format
    const mapUserData = (userData) => {
        return {
            ...userData,
            phone_number: userData.mobile || userData.phone_number,
            is_active: userData.status === 'active' || userData.is_active,
            branch: userData.branch || 'Main Branch'
        };
    };

    // Fetch user details
    const fetchUserDetails = async () => {
        try {
            setFetchLoading(true);
            const response = await api.get(`/users/${userId}`);

            if (response.data.success) {
                const userData = mapUserData(response.data.data.user);
                setUser(userData);
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone_number: userData.phone_number || '',
                    date_of_birth: userData.date_of_birth ? userData.date_of_birth.split('T')[0] : '',
                    branch: userData.branch || '',
                    role: userData.role || '',
                    gender: userData.gender || '',
                    is_active: userData.is_active !== undefined ? userData.is_active : true
                });
            }
        } catch (error) {
            console.error('Fetch user details error:', error);
            // Fallback method
            try {
                const response = await api.get('/users');
                if (response.data.success && response.data.data && response.data.data.users) {
                    const foundUser = response.data.data.users.find(u =>
                        u.id.toString() === userId.toString() ||
                        u.employee_id === userId
                    );

                    if (foundUser) {
                        const userData = mapUserData(foundUser);
                        setUser(userData);
                        setFormData({
                            first_name: userData.first_name || '',
                            last_name: userData.last_name || '',
                            email: userData.email || '',
                            phone_number: userData.phone_number || '',
                            date_of_birth: userData.date_of_birth ? userData.date_of_birth.split('T')[0] : '',
                            branch: userData.branch || '',
                            role: userData.role || '',
                            gender: userData.gender || '',
                            is_active: userData.is_active !== undefined ? userData.is_active : true
                        });
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
            }
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.branch) newErrors.branch = 'Branch is required';
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
            newErrors.phone_number = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await api.put(`/users/${userId}`, formData);

            if (response.data.success) {
                navigate(`/admin/users/${userId}`);
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                const serverErrors = {};
                error.response.data.errors.forEach(err => {
                    serverErrors[err.field || err.param] = err.message || err.msg;
                });
                setErrors(serverErrors);
            } else {
                setErrors({ general: error.response?.data?.message || 'Failed to update user' });
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-200">
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate(`/admin/users/${userId}`)}
                            className="p-3 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200 mr-4 bg-white border border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
                    </div>
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
       <div className="min-h-screen bg-gray-200">
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(`/admin/users/${userId}`)}
                                className="p-3 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200 bg-white border border-gray-200"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                                <p className="text-gray-600 mt-1">
                                    Update information for {user?.first_name} {user?.last_name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                    {errors.general && (
                        <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm font-medium">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Personal Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                            }`}
                                        placeholder="Enter first name"
                                    />
                                    {errors.first_name && (
                                        <p className="text-red-500 text-sm font-medium">{errors.first_name}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                            }`}
                                        placeholder="Enter last name"
                                    />
                                    {errors.last_name && (
                                        <p className="text-red-500 text-sm font-medium">{errors.last_name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                                }`}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-sm font-medium">{errors.email}</p>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                                }`}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    {errors.phone_number && (
                                        <p className="text-red-500 text-sm font-medium">{errors.phone_number}</p>
                                    )}
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Date of Birth *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.date_of_birth ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                                }`}
                                        />
                                    </div>
                                    {errors.date_of_birth && (
                                        <p className="text-red-500 text-sm font-medium">{errors.date_of_birth}</p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                            }`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="text-red-500 text-sm font-medium">{errors.gender}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Work Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Building className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Work Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Branch */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Branch *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="branch"
                                            value={formData.branch}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.branch ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                                }`}
                                        >
                                            <option value="">Select Branch</option>
                                            <option value="main">Main Branch</option>
                                            <option value="downtown">Downtown Branch</option>
                                            <option value="uptown">Uptown Branch</option>
                                            <option value="eastside">Eastside Branch</option>
                                            <option value="westside">Westside Branch</option>
                                        </select>
                                    </div>
                                    {errors.branch && (
                                        <p className="text-red-500 text-sm font-medium">{errors.branch}</p>
                                    )}
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Role *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Shield className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                                                }`}
                                        >
                                            <option value="">Select Role</option>
                                            <option value="admin">Administrator</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="loan-officer">Loan Officer</option>
                                            <option value="cashier">Cashier</option>
                                        </select>
                                    </div>
                                    {errors.role && (
                                        <p className="text-red-500 text-sm font-medium">{errors.role}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Account Status</h2>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                                    User is active and can access the system
                                </label>
                            </div>
                        </div>

                        {/* Employee ID Display */}
                        {user && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <User className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <label className="block text-sm font-semibold text-blue-900">
                                                Employee ID
                                            </label>
                                            <p className="text-blue-800 font-medium">{user.employee_id || user.id}</p>
                                            <p className="text-xs text-blue-600 mt-1">Employee ID cannot be changed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/users/${userId}`)}
                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Update User
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUser;
