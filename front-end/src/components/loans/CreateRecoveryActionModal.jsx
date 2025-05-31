import React, { useState } from 'react';
import { X, Save, Calendar, Phone, Mail, MapPin, FileText, AlertCircle } from 'lucide-react';

const CreateRecoveryActionModal = ({ loanId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        action_type: 'phone_call',
        priority: 'medium',
        scheduled_date: '',
        notes: '',
        expected_outcome: '',
        assigned_to: '',
        contact_method: '',
        follow_up_required: false
    });

    const actionTypes = [
        { value: 'phone_call', label: 'Phone Call', icon: Phone },
        { value: 'sms', label: 'SMS', icon: Phone },
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'visit', label: 'Site Visit', icon: MapPin },
        { value: 'letter', label: 'Written Letter', icon: FileText },
        { value: 'legal_notice', label: 'Legal Notice', icon: AlertCircle },
        { value: 'other', label: 'Other', icon: FileText }
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'text-green-600' },
        { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
        { value: 'high', label: 'High', color: 'text-orange-600' },
        { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/loans-in-arrears/${loanId}/recovery-action`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create recovery action');
            }

            const data = await response.json();

            if (data.success) {
                onSuccess();
            } else {
                throw new Error(data.message || 'Failed to create recovery action');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error creating recovery action:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Create Recovery Action</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Action Type *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {actionTypes.map((type) => {
                                const IconComponent = type.icon;
                                return (
                                    <label
                                        key={type.value}
                                        className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${formData.action_type === type.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="action_type"
                                            value={type.value}
                                            checked={formData.action_type === type.value}
                                            onChange={(e) => handleInputChange('action_type', e.target.value)}
                                            className="sr-only"
                                        />
                                        <IconComponent className="w-5 h-5 text-gray-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">{type.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority *
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {priorities.map((priority) => (
                                <option key={priority.value} value={priority.value}>
                                    {priority.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Scheduled Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Scheduled Date
                        </label>
                        <input
                            type="date"
                            value={formData.scheduled_date}
                            onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                            min={getMinDate()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes/Description *
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={4}
                            placeholder="Describe the recovery action plan, client situation, or any relevant details..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Expected Outcome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Outcome
                        </label>
                        <textarea
                            value={formData.expected_outcome}
                            onChange={(e) => handleInputChange('expected_outcome', e.target.value)}
                            rows={2}
                            placeholder="What do you expect to achieve with this action?"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Contact Method (for specific action types) */}
                    {['phone_call', 'sms', 'email'].includes(formData.action_type) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Method/Details
                            </label>
                            <input
                                type="text"
                                value={formData.contact_method}
                                onChange={(e) => handleInputChange('contact_method', e.target.value)}
                                placeholder={
                                    formData.action_type === 'phone_call' ? 'Phone number to call' :
                                        formData.action_type === 'sms' ? 'SMS number' :
                                            'Email address'
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Follow-up Required */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="follow_up_required"
                            checked={formData.follow_up_required}
                            onChange={(e) => handleInputChange('follow_up_required', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="follow_up_required" className="ml-2 block text-sm text-gray-900">
                            Follow-up action required
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Creating...' : 'Create Action'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRecoveryActionModal;
