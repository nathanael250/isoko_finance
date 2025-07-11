import { React, useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, ArrowDownWideNarrow, Eye, Pencil, X, Link2 } from 'lucide-react';
import { clientsAPI } from '../../services/api';
import { api } from '../../services/api';


const AllBorrowers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanOfficers, setLoanOfficers] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalBorrower, setModalBorrower] = useState(null);

  useEffect(() => {
    fetchBorrowers();
    fetchLoanOfficers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientsAPI.getClients();
      let borrowersData = [];
      if (response.data) {
        if (response.data.success && response.data.data) {
          if (response.data.data.clients && Array.isArray(response.data.data.clients)) {
            borrowersData = response.data.data.clients;
          } else if (Array.isArray(response.data.data)) {
            borrowersData = response.data.data;
          }
        } else if (Array.isArray(response.data)) {
          borrowersData = response.data;
        }
      }
      setBorrowers(Array.isArray(borrowersData) ? borrowersData : []);
    } catch (err) {
      setError(`Failed to fetch borrowers: ${err.response?.data?.message || err.message}`);
      setBorrowers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanOfficers = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'loan-officer', limit: 100 } });
      if (response.data.success && response.data.data && Array.isArray(response.data.data.users)) {
        setLoanOfficers(response.data.data.users);
      } else {
        setLoanOfficers([]);
      }
    } catch (err) {
      setLoanOfficers([]);
    }
  };

  const openAssignModal = (borrower) => {
    setModalBorrower(borrower);
    setSelectedOfficer('');
    setAssignError(null);
    setShowAssignModal(true);
  };
  const closeAssignModal = () => {
    setShowAssignModal(false);
    setModalBorrower(null);
    setSelectedOfficer('');
    setAssignError(null);
  };

  const handleAssignOfficer = async () => {
    if (!modalBorrower) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      await clientsAPI.assignOfficer(modalBorrower.id, selectedOfficer);
      closeAssignModal();
      fetchBorrowers();
    } catch (err) {
      setAssignError('Failed to assign loan officer');
    } finally {
      setAssignLoading(false);
    }
  };

  const days = Array.from({ length: 365 }, (_, i) => i + 1);
  const columns = [
    { key: 'view', label: 'View', sortable: false, width: 'w-12' },
    { key: 'FullName', label: 'FullName', sortable: true, width: 'w-24' },
    { key: 'Business', label: 'Business', sortable: true, width: 'w-24' },
    { key: 'Unique', label: 'Unique#', sortable: true, width: 'w-24' },
    { key: 'Mobile', label: 'Mobile', sortable: true, width: 'w-24' },
    { key: 'Email', label: 'Email', sortable: true, width: 'w-24' },
    { key: 'TotalPaid', label: 'Total Paid', sortable: false, width: 'w-24' },
    { key: 'OpenLoansBalance', label: 'Open Loans Balance', sortable: false, width: 'w-28' },
    { key: 'Status', label: 'Status', sortable: false, width: 'w-28' },
    { key: 'Action', label: 'Action', sortable: false, width: 'w-24' }
  ]

  const SortableHeader = ({ column, children }) => (
    <th className={`px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-blue-50 border-b border-gray-200 ${column.width}`}>
      <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900">
        <span>{children}</span>
        {column.sortable && (
          <div className="flex flex-col">
            <ArrowDownWideNarrow className="w-3 h-3 text-gray-400" />
          </div>
        )}
      </div>
    </th>
  );
  return (
    <div className='min-h-screen bg-gray-200'>
      <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2 py-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">View Borrowers</h1>
        </div>

        <div className='flex justify-between items-center'>
          <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer">Export Data</button>
          <button className="text-xs px-2 py-1 border border-slate-300 bg-gray-100 text-gray-700 cursor-pointer">Show/Hide Columns</button>
        </div>
        <div className='bg-gray-50 border-t-2 border-green-500'>
          <div className="flex justify-between items-center p-4 ">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search loans"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-48"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700">Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label className="text-sm text-gray-700">entries</label>
            </div>
          </div>



          {/* Data Table */}
          <div className="overflow-x-auto px-4 py-2">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  {columns.map((column) => (
                    <SortableHeader key={column.key} column={column}>
                      {column.label}
                    </SortableHeader>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr><td colSpan={columns.length} className="text-center py-4 text-gray-500">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={columns.length} className="text-center py-4 text-red-500">{error}</td></tr>
                ) : borrowers.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-4 text-gray-500">No borrowers found.</td></tr>
                ) : (
                  borrowers
                    .filter(b => {
                      const name = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
                      const business = (b.business_name || '').toLowerCase();
                      const unique = (b.unique_number || '').toLowerCase();
                      const mobile = (b.mobile || '').toLowerCase();
                      const email = (b.email || '').toLowerCase();
                      return (
                        name.includes(searchTerm.toLowerCase()) ||
                        business.includes(searchTerm.toLowerCase()) ||
                        unique.includes(searchTerm.toLowerCase()) ||
                        mobile.includes(searchTerm.toLowerCase()) ||
                        email.includes(searchTerm.toLowerCase())
                      );
                    })
                    .slice(0, entriesPerPage)
                    .map((b, idx) => (
                      <tr key={b.id || idx}>
                        <td className='flex gap-1 py-1 px-0.5'>
                          <Link to={`/dashboard/admin/loans?client_id=${b.id || b.client_number}`} className='bg-green-700 text-white text-xs px-2 py-0.5 rounded-md cursor-pointer'>Loans</Link>
                          <button className='bg-blue-500 text-white text-xs px-2 py-0.5 rounded-md cursor-pointer'>Saving</button>
                        </td>
                        <td className='py-1 px-0.5 text-xs'>
                          <span className='font-semibold text-xs'>{`${b.title ? b.title + '. ' : ''}${b.first_name || ''} ${b.last_name || ''}`.trim()}</span>
                        </td>
                        <td className='py-1 px-0.5 text-xs'>{b.business_name || ''}</td>
                        <td className='py-1 px-0.5 text-xs'>{b.unique_number || ''}</td>
                        <td className='py-1 px-0.5 text-xs'>{b.mobile || ''}</td>
                        <td className='py-1 px-0.5 text-xs'>{b.email || ''}</td>
                        <td className='py-1 px-0.5 text-xs'>0,00</td>
                        <td className='py-1 px-0.5 text-xs'>0,00</td>
                        <td className='py-1 px-0.5 text-xs'>{b.status || 'Current'}</td>
                        <td className="px-2 py-1">
                          <div className="flex items-center">
                            <Link to={`/dashboard/admin/borrowers/${b.id || b.client_number}/add`}>
                              <Pencil className="w-5 h-5 border border-slate-400 bg-gray-200 p-1 cursor-pointer hover:bg-gray-300 rounded-sm" />
                            </Link>
                            <Link2 onClick={() => openAssignModal(b)} className="w-5 h-5 border border-slate-400 bg-gray-200 cursor-pointer hover:bg-gray-300 p-1 rounded-sm ml-1" />
                            <X className="w-5 h-5 border border-slate-400 bg-gray-200 cursor-pointer hover:bg-gray-300 p-1 rounded-sm ml-1" />

                            

                          </div>
                        </td>
                      </tr>
                    ))
                )}
                {/* Summary Row */}
                <tr className="text-sm font-medium text-gray-900 bg-gray-300">
                  <td className="px-3 py-1 w-12"></td>
                  <td className="px-3 py-1 w-32"></td>
                  <td className="px-3 py-1 w-24"></td>
                  <td className="px-3 py-1 w-24"></td>
                  <td className="px-3 py-1 w-24"></td>
                  <td className="px-3 py-1 w-24"></td>
                  <td className="px-3 py-1 text-center w-28">0,00</td>
                  <td className="px-3 py-1 text-center w-28">0,00</td>
                  <td className="px-3 py-1 w-24"></td>
                  <td className="px-3 py-1 w-32"></td>
                </tr>
              </tbody>
            </table>
          </div>


          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-1 bg-white pb-2">
            <div className="text-xs text-gray-700">
              Showing 0 to 0 of 0 entries
            </div>
            <div className="flex space-x-2">
              <button className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 cursor-not-allowed">
                Previous
              </button>
              <button className="px-2 py-1 border border-gray-300 text-xs text-gray-500 bg-gray-50 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>

        {showAssignModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
              <h3 className="text-lg font-semibold mb-4">Assign Loan Officer</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Loan Officer</label>
                <select
                  value={selectedOfficer}
                  onChange={e => setSelectedOfficer(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Select Officer</option>
                  {loanOfficers.map(officer => (
                    <option key={officer.id} value={officer.id}>
                      {officer.first_name} {officer.last_name}
                    </option>
                  ))}
                </select>
              </div>
              {assignError && <div className="text-xs text-red-500 mb-2">{assignError}</div>}
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={closeAssignModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  disabled={assignLoading || !selectedOfficer}
                  onClick={handleAssignOfficer}
                >
                  {assignLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >

  )
}

export default AllBorrowers
