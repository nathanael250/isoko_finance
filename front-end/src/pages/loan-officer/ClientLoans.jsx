import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loansAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorBoundary';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye } from 'lucide-react';

const ClientLoans = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clientName, setClientName] = useState(''); // To display the client's name

    useEffect(() => {
        if (clientId) {
            fetchClientLoans();
        }
    }, [clientId]);

    const fetchClientLoans = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await loansAPI.getLoansByClient(clientId);
            if (response.data.success) {
                setLoans(response.data.data.loans);
                // Assuming client name might be in the first loan object or a separate endpoint
                if (response.data.data.loans.length > 0) {
                    setClientName(`${response.data.data.loans[0].client_first_name} ${response.data.data.loans[0].client_last_name}`);
                } else {
                    // If no loans, try to fetch client details directly
                    try {
                        const clientResponse = await clientsAPI.getClient(clientId);
                        if(clientResponse.data.success) {
                            setClientName(`${clientResponse.data.data.first_name} ${clientResponse.data.data.last_name}`);
                        }
                    } catch (clientErr) {
                        console.error("Could not fetch client details for empty loans: ", clientErr);
                        setClientName('Unknown Client');
                    }
                }

            } else {
                setError(response.data.message || 'Failed to fetch client loans.');
            }
        } catch (err) {
            console.error('Error fetching client loans:', err);
            setError(err.response?.data?.message || 'Failed to load client loans. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchClientLoans} />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans for {clientName || 'Client'}</h1>
                <button
                    onClick={() => navigate(-1)} // Go back to previous page (Client Management)
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    Back to Clients
                </button>
            </div>

            {/* Loans Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loan ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Maturity Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        No loans found for this client.
                                    </td>
                                </tr>
                            ) : (
                                loans.map(loan => (
                                    <tr key={loan.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{loan.loan_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{loan.loan_type_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(loan.approved_amount || loan.applied_amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                loan.status === 'active' ? 'bg-green-100 text-green-800' :
                                                loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                loan.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {loan.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{loan.maturity_date ? formatDate(loan.maturity_date) : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/dashboard/loans/${loan.id}`} className="text-primary hover:text-primary-dark mr-3">
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientLoans; 