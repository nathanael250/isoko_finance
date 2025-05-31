import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, FileText, AlertTriangle, Calendar, User } from 'lucide-react';
import { noRepaymentAPI } from '../../services/api';

const RecoveryActionModal = ({ loanId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        action_type: 'phone_call',
        description: '',
        assigned_to: '',
        priority: 'medium',
        target_amount: '',
        target_date: '',
        notes: ''
    });

    // Action type options
    const actionTypes = [
        { value: 'phone_call', label: 'Phone Call', icon: Phone },
        { value: 'sms', label: 'SMS Reminder', icon: Mail },
        { value: 'email', label: 'Email Notice', icon: Mail },
        { value: 'field_visit', label: 'Field Visit', icon: MapPin },
        { value: 'demand_letter', label: 'Demand Letter', icon: FileText },
        { value: 'legal_notice', label: 'Legal Notice', icon: AlertTriangle },
        { value: 'investigation', label: 'Investigation', icon: User },
        { value: 'restructure', label: 'Loan Restructure', icon: FileText }
    ];

    // Priority options
    const priorityOptions = [
        { value: 'low', label: 'Low', color: 'text-green-600' },
        { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
        { value: 'high', label: 'High', color: 'text-orange-600' },
        { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
    ];

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.description.trim()) {
                throw new Error('Description is required');
            }

            if (!formData.assigned_to) {
                throw new Error('Please assign this action to a user');
            }

            // Prepare data for API
            const actionData = {
                action_type: formData.action_type,
                description: formData.description.trim(),
                assigned_to: parseInt(formData.assigned_to),
                priority: formData.priority,
                target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
                target_date: formData.target_date || null,
                notes: formData.notes.trim() || null
            };

            console.log('🔄 Creating recovery action:', actionData);

            const response = await noRepaymentAPI.createRecoveryAction(loanId, actionData);

            if (response.data.success) {
                console.log('✅ Recovery action created successfully');
                onSuccess();
            }
        } catch (error) {
            console.error('❌ Error creating recovery action:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create recovery action');
        } finally {
            setLoading(false);
        }
    };

    // Get minimum date (today)
    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Create Recovery Action
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span className="text-red-800 text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Action Type */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Action Type *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {actionTypes.map((type) => {
                                    const IconComponent = type.icon;
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => handleInputChange('action_type', type.value)}
                                            className={`p-3 border rounded-lg text-center transition-colors ${
                                                formData.action_type === type.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <IconComponent className="w-5 h-5 mx-auto mb-1" />
                                            <div className="text-xs font-medium">{type.label}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the recovery action to be taken..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum 10 characters, maximum 1000 characters
                            </p>
                        </div>

                        {/* Assigned To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign To *
                            </label>
                            <select
                                value={formData.assigned_to}
                                onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select user...</option>
                                {/* You'll need to fetch users from your API */}
                                <option value="1">John Doe (Loan Officer)</option>
                                <option value="2">Jane Smith (Recovery Officer)</option>
                                <option value="3">Mike Johnson (Supervisor)</option>
                                {/* Add more users dynamically */}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleInputChange('priority', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {priorityOptions.map((priority) => (
                                    <option key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Target Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Amount (Optional)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">RWF</span>
                                <input
                                    type="number"
                                    value={formData.target_amount}
                                    onChange={(e) => handleInputChange('target_amount', e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="1000"
                                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Target Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={formData.target_date}
                                onChange={(e) => handleInputChange('target_date', e.target.value)}
                                min={getMinDate()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Any additional information or special instructions..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </div>
                            ) : (
                                'Create Recovery Action'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecoveryActionModal;
