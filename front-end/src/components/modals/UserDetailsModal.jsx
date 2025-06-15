import React from 'react';
import { X, Mail, Phone, Calendar, MapPin, User, Shield, Clock } from 'lucide-react';

const UserDetailsModal = ({ isOpen, user, onClose }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      supervisor: 'bg-blue-100 text-blue-800',
      'loan-officer': 'bg-green-100 text-green-800',
      cashier: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4 pb-4 border-b">
            <div className="flex-shrink-0 h-16 w-16">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-xl">
                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h4>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role?.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h5 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee ID</p>
                  <p className="text-sm text-gray-900">{user.employee_id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-sm text-gray-900">{user.phone_number}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">
                    {user.date_of_birth ? formatDate(user.date_of_birth) : 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-sm text-gray-900 capitalize">{user.gender || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Branch</p>
                  <p className="text-sm text-gray-900 capitalize">{user.branch}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h5 className="text-lg font-medium text-gray-900 mb-3">Work Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {user.role?.replace('-', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Joined</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <p className={`text-sm font-medium ${
                    user.is_active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div>
            <h5 className="text-lg font-medium text-gray-900 mb-3">Role Permissions</h5>
            <div className="bg-gray-50 p-4 rounded-lg">
              {user.role === 'admin' && (
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full system access</li>
                  <li>• User management</li>
                  <li>• All loan operations</li>
                  <li>• System configuration</li>
                  <li>• Reports and analytics</li>
                </ul>
              )}
              {user.role === 'supervisor' && (
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Loan approval and management</li>
                  <li>• Team oversight</li>
                  <li>• Branch operations</li>
                  <li>• Reports access</li>
                </ul>
              )}
              {user.role === 'loan-officer' && (
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Loan application processing</li>
                  <li>• Borrower management</li>
                  <li>• Loan documentation</li>
                  <li>• Customer service</li>
                </ul>
              )}
              {user.role === 'cashier' && (
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Payment processing</li>
                  <li>• Transaction recording</li>
                  <li>• Cash management</li>
                  <li>• Customer transactions</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-6 border-t">
          <button             onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

