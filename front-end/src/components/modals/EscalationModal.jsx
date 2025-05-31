import React, { useState } from 'react';
import { X, AlertTriangle, User, Calendar, FileText } from 'lucide-react';

const EscalationModal = ({ loan, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [escalationType, setEscalationType] = useState('supervisor');
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState('high');
    const [assignedTo, setAssignedTo] = useState('');
    const [notes, setNotes] = useState('');

    const escalationTypes = [
        { value: 'supervisor', label: 'Supervisor Review' },
        { value: 'legal', label: 'Legal Department' },
        { value: 'recovery', label: 'Recovery Team' },
        { value: 'management', label: 'Senior Management' }
    ];

    const urgencyLevels = [
        { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
        { value: 'high', label: 'High', color: 'text-orange-600' },
        { value: 'critical', label: 'Critical', color: 'text-red-600' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Here you would call your API to create escalation
            console.log('Escalation:', {
                loanId: loan.id,
                type: escalationType,
                reason,
                urgency,
                assignedTo,
                notes
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onSuccess();
        } catch (error) {
            console.error('Error creating escalation:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-0 border w-full max-w-lg shadow-lg rounded-lg bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-900">
                            Escalate Loan
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Loan Info */}
                <div className="p-6 bg-gray-50 border-b">
                    <div>
                        <h4 className="font-medium text-gray-900">{loan.loan_number}</h4>
                        <p className="text-sm text-gray-600">Client: {loan.client_name}</p>
                        <p className="text-sm text-red-600">
                            {loan.days_past_maturity} days past maturity
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Escalation Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Escalation Type
                        </label>
                        <select
                            value={escalationType}
                            onChange={(e) => setEscalationType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        >
                            {escalationTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Urgency */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency Level
                        </label>
                        <div className="space-y-2">
                            {urgencyLevels.map((level) => (
                                <label
                                    key={level.value}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${urgency === level.value
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="urgency"
                                        value={level.value}
                                        checked={urgency === level.value}
                                        onChange={(e) => setUrgency(e.target.value)}
                                        className="text-red-600 focus:ring-red-500"
                                    />
                                    <span className={`text-sm font-medium ${level.color}`}>
                                        {level.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Escalation
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this loan needs to be escalated..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    {/* Assigned To */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign To (Optional)
                        </label>
                        <input
                            type="text"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            placeholder="Enter name or ID of person to assign to"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Additional Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional information or context..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Escalating...' : 'Escalate Loan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EscalationModal;
