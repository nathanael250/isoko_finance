import React, { useState } from 'react';
import { X, AlertTriangle, Flag, Shield, Eye } from 'lucide-react';
import { noRepaymentAPI } from '../../services/api';

const FraudFlagModal = ({ loanId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        fraud_indicators: [],
        description: '',
        evidence_description: '',
        severity: 'medium',
        recommended_action: 'investigate_further',
        notify_authorities: false,
        internal_notes: ''
    });

    // Fraud indicator options
    const fraudIndicators = [
        { value: 'no_contact_response', label: 'No Contact Response' },
        { value: 'false_information', label: 'False Information Provided' },
        { value: 'suspicious_documents', label: 'Suspicious Documents' },
        { value: 'immediate_default', label: 'Immediate Default After Disbursement' },
        { value: 'multiple_applications', label: 'Multiple Applications' },
        { value: 'identity_theft_suspected', label: 'Identity Theft Suspected' },
        { value: 'collateral_missing', label: 'Collateral Missing/Invalid' },
        { value: 'guarantor_unavailable', label: 'Guarantor Unavailable' },
        { value: 'address_invalid', label: 'Invalid Address' },
        { value: 'employment_false', label: 'False Employment Information' },
        { value: 'income_misrepresented', label: 'Income Misrepresented' },
        { value: 'other', label: 'Other' }
    ];

    // Severity options
    const severityOptions = [
        { value: 'low', label: 'Low', color: 'text-green-600', bg: 'bg-green-50' },
        { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { value: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' },
        { value: 'critical', label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' }
    ];

    // Recommended action options
    const recommendedActions = [
        { value: 'investigate_further', label: 'Investigate Further', icon: Eye },
        { value: 'contact_authorities', label: 'Contact Authorities', icon: Shield },
        { value: 'freeze_account', label: 'Freeze Account', icon: AlertTriangle },
        { value: 'legal_action', label: 'Legal Action', icon: Flag },
        { value: 'write_off', label: 'Write Off', icon: X },
        { value: 'refer_to_fraud_team', label: 'Refer to Fraud Team', icon: Flag }
    ];

    // Handle checkbox changes for fraud indicators
    const handleIndicatorChange = (indicator, checked) => {
        setFormData(prev => ({
            ...prev,
            fraud_indicators: checked
                ? [...prev.fraud_indicators, indicator]
                : prev.fraud_indicators.filter(item => item !== indicator)
        }));
    };

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
            if (formData.fraud_indicators.length === 0) {
                throw new Error('Please select at least one fraud indicator');
            }

            if (!formData.description.trim()) {
                throw new Error('Description is required');
            }

            if (formData.description.trim().length < 20) {
                throw new Error('Description must be at least 20 characters');
            }

            // Prepare data for API
            const fraudData = {
                fraud_indicators: formData.fraud_indicators,
                description: formData.description.trim(),
                evidence_description: formData.evidence_description.trim() || null,
                severity: formData.severity,
                recommended_action: formData.recommended_action,
                notify_authorities: formData.notify_authorities,
                internal_notes: formData.internal_notes.trim() || null
            };

            console.log('🔄 Flagging loan as potential fraud:', fraudData);

            const response = await noRepaymentAPI.flagAsFraud(loanId, fraudData);

            if (response.data.success) {
                console.log('✅ Loan flagged as potential fraud successfully');
                onSuccess();
            }
        } catch (error) {
            console.error('❌ Error flagging loan as fraud:', error);
            setError(error.response?.data?.message || error.message || 'Failed to flag loan as fraud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-0 border w-full max-w-3xl shadow-lg rounded-lg bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
                    <div className="flex items-center gap-3">
                        <Flag className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-900">
                            Flag as Potential Fraud
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Warning Notice */}
                <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                Important Notice
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Flagging a loan as potential fraud is a serious action. Please ensure you have sufficient evidence and follow your organization's fraud reporting procedures.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span className="text-red-800 text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Fraud Indicators */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Fraud Indicators * (Select all that apply)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fraudIndicators.map((indicator) => (
                                <label
                                    key={indicator.value}
                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.fraud_indicators.includes(indicator.value)}
                                        onChange={(e) => handleIndicatorChange(indicator.value, e.target.checked)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-700">{indicator.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Severity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Severity Level *
                            </label>
                            <div className="space-y-2">
                                {severityOptions.map((severity) => (
                                    <label
                                        key={severity.value}
                                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                            formData.severity === severity.value
                                                ? `border-red-300 ${severity.bg}`
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="severity"
                                            value={severity.value}
                                            checked={formData.severity === severity.value}
                                            onChange={(e) => handleInputChange('severity', e.target.value)}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className={`text-sm font-medium ${severity.color}`}>
                                            {severity.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Action */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recommended Action
                            </label>
                            <select
                                value={formData.recommended_action}
                                onChange={(e) => handleInputChange('recommended_action', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                {recommendedActions.map((action) => (
                                    <option key={action.value} value={action.value}>
                                        {action.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detailed Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Provide a detailed description of the suspected fraud, including timeline, evidence, and any relevant circumstances..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum 20 characters, maximum 2000 characters
                        </p>
                    </div>

                    {/* Evidence Description */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Evidence Description (Optional)
                        </label>
                        <textarea
                            value={formData.evidence_description}
                            onChange={(e) => handleInputChange('evidence_description', e.target.value)}
                            placeholder="Describe any evidence you have collected (documents, communications, witness statements, etc.)"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {/* Internal Notes */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Internal Notes (Optional)
                        </label>
                        <textarea
                            value={formData.internal_notes}
                            onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                            placeholder="Internal notes for investigation team (not visible to client)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>

                    {/* Notify Authorities */}
                    <div className="mt-6">
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <input
                                type="checkbox"
                                checked={formData.notify_authorities}
                                onChange={(e) => handleInputChange('notify_authorities', e.target.checked)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Notify Authorities
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    Check this box if you believe this case should be reported to law enforcement or regulatory authorities
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Flagging...
                                </div>
                            ) : (
                                'Flag as Fraud'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FraudFlagModal;
