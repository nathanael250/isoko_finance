import React, { useState } from 'react';
import { X, Phone, Mail, MessageSquare, Calendar, User } from 'lucide-react';

const ContactClientModal = ({ loan, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [contactMethod, setContactMethod] = useState('phone');
    const [message, setMessage] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [notes, setNotes] = useState('');

    const contactMethods = [
        { value: 'phone', label: 'Phone Call', icon: Phone },
        { value: 'sms', label: 'SMS', icon: MessageSquare },
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'visit', label: 'Field Visit', icon: User }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Here you would call your API to log the contact attempt
            console.log('Contact attempt:', {
                loanId: loan.id,
                method: contactMethod,
                message,
                scheduledDate,
                notes
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            onSuccess();
        } catch (error) {
            console.error('Error logging contact:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-0 border w-full max-w-lg shadow-lg rounded-lg bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Contact Client
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Client Info */}
                <div className="p-6 bg-gray-50 border-b">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">{loan.client_name}</h4>
                            <p className="text-sm text-gray-600">Loan: {loan.loan_number}</p>
                            <p className="text-sm text-gray-600">📞 {loan.client_mobile}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Contact Method */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {contactMethods.map((method) => {
                                const IconComponent = method.icon;
                                return (
                                    <button
                                        key={method.value}
                                        type="button"
                                        onClick={() => setContactMethod(method.value)}
                                        className={`p-3 border rounded-lg text-center transition-colors ${
                                            contactMethod === method.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <IconComponent className="w-5 h-5 mx-auto mb-1" />
                                        <div className="text-xs font-medium">{method.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message/Purpose
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter the message or purpose of contact..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Scheduled Date (for visits) */}
                    {contactMethod === 'visit' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Scheduled Date
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes or observations..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Logging...' : 'Log Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactClientModal;
