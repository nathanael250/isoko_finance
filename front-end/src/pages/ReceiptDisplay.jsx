import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, X, Download } from 'lucide-react';
import api from '../services/api';
import { useReactToPrint } from 'react-to-print';

const ReceiptDisplay = () => {
    const { repaymentId } = useParams();
    const [repayment, setRepayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    useEffect(() => {
        const fetchRepaymentDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/repayments/${repaymentId}`);
                if (response.data.success) {
                    setRepayment(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch repayment details');
                }
            } catch (err) {
                console.error('Error fetching repayment details:', err);
                setError('Error fetching repayment details.');
            } finally {
                setLoading(false);
            }
        };

        if (repaymentId) {
            fetchRepaymentDetails();
        }
    }, [repaymentId]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Receipt-${repayment?.receipt_number || repaymentId}`,
    });

    const formatCurrency = (amount) => {
        if (isNaN(amount) || amount === null) return 'RWF 0.00';
        return `RWF ${parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    if (loading) {
        return <div className="text-center p-6">Loading receipt...</div>;
    }

    if (error) {
        return <div className="text-center p-6 text-red-600">Error: {error}</div>;
    }

    if (!repayment) {
        return <div className="text-center p-6">No repayment details found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6 print:hidden">
                        <h1 className="text-2xl font-bold text-gray-800">Payment Receipt</h1>
                        <div className="flex space-x-3">
                            <button 
                                onClick={handlePrint} 
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Printer className="w-5 h-5 mr-2" /> Print
                            </button>
                            {/* Add download functionality later if needed */}
                            {/* <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                <Download className="w-5 h-5 mr-2" /> Download PDF
                            </button> */}
                            <button 
                                onClick={() => window.history.back()} 
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                <X className="w-5 h-5 mr-2" /> Close
                            </button>
                        </div>
                    </div>

                    <div ref={componentRef} className="p-6 sm:p-8 bg-white print:p-0 print:shadow-none">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-blue-700 mb-2">Isoko Finance</h2>
                            <p className="text-gray-600">Payment Receipt</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8 border-b pb-6 border-gray-200">
                            <div>
                                <p className="text-sm text-gray-500">Receipt Number:</p>
                                <p className="text-lg font-semibold text-gray-900">{repayment.receipt_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date & Time:</p>
                                <p className="text-lg font-semibold text-gray-900">{formatDate(repayment.payment_date)} at {formatTime(repayment.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Client Name:</p>
                                <p className="text-lg font-semibold text-gray-900">{repayment.client_first_name} {repayment.client_last_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Loan Number:</p>
                                <p className="text-lg font-semibold text-gray-900">{repayment.loan_number}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-700">Amount Paid:</p>
                                    <p className="font-bold text-green-700 text-xl">{formatCurrency(repayment.amount_paid)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-700">Payment Method:</p>
                                    <p className="font-medium text-gray-900">{repayment.payment_method?.replace('_', ' ').toUpperCase()}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-700">Principal Paid:</p>
                                    <p className="font-medium text-gray-900">{formatCurrency(repayment.principal_paid)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-700">Interest Paid:</p>
                                    <p className="font-medium text-gray-900">{formatCurrency(repayment.interest_paid)}</p>
                                </div>
                                {repayment.penalty_paid > 0 && (
                                    <div className="flex justify-between items-center">
                                        <p className="text-gray-700">Penalty Paid:</p>
                                        <p className="font-medium text-gray-900">{formatCurrency(repayment.penalty_paid)}</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-700">Status:</p>
                                    <p className="font-medium text-gray-900 capitalize">{repayment.status}</p>
                                </div>
                                {repayment.notes && (
                                    <div className="border-t pt-3 mt-3">
                                        <p className="text-sm text-gray-500">Notes:</p>
                                        <p className="text-gray-700 text-sm italic">{repayment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            <p>Thank you for your payment!</p>
                            <p>Isoko Finance</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDisplay; 