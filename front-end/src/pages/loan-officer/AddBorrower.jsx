import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AlertCircle, ArrowLeft, User, Building, Hash, Mail, Phone, MapPin, Calendar, Upload } from 'lucide-react';

const AddBorrower = () => {
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    unique_number: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    province_state: '',
    country: 'Rwanda',
    zipcode: '',
    business_name: '',
    working_status: '',
    occupation: '',
    monthly_income: '',
    employer_name: '',
    employer_address: '',
    description: '',
    borrower_photo: null,
    client_files: null
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files.length > 1 ? files : files[0] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validation: at least first_name or business_name
    if (!formData.first_name && !formData.business_name) {
      setError('Please provide either First Name or Business Name');
      setLoading(false);
      return;
    }
    if (!formData.country) {
      setError('Country is required');
      setLoading(false);
      return;
    }
    // Additional validation for backend-required fields
    if (!formData.last_name) {
      setError('Last Name is required');
      setLoading(false);
      return;
    }
    if (!formData.gender) {
      setError('Gender is required');
      setLoading(false);
      return;
    }
    if (!formData.mobile) {
      setError('Mobile is required');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      // Only append borrower_photo if it's a File
      if (formData.borrower_photo instanceof File) {
        data.append('borrower_photo', formData.borrower_photo);
      }
      // Only append client_files if it's an array or FileList
      if (formData.client_files) {
        if (formData.client_files instanceof FileList || Array.isArray(formData.client_files)) {
          Array.from(formData.client_files).forEach(file => data.append('client_files', file));
        } else if (formData.client_files instanceof File) {
          data.append('client_files', formData.client_files);
        }
      }
      // Append other fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'borrower_photo' && key !== 'client_files' && value) {
          data.append(key, value);
        }
      });
      // If user is loan officer, set assigned_officer
      if (user && user.role === 'loan-officer' && user.id) {
        data.append('assigned_officer', user.id);
      }
      // Debug: log form data keys and values
      for (let pair of data.entries()) {
        console.log(pair[0]+ ':', pair[1]);
      }

      const response = await api.post('/clients', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess('Borrower created successfully!');
        setTimeout(() => navigate('/dashboard/loan-officer/borrowers'), 1200);
      } else {
        setError(response.data.message || 'Failed to add borrower.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add borrower.');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className='min-h-screen bg-gray-200'>
      <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2 py-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Missed Repayments</h1>
          <p className="text-gray-600 text-sm">
            Loans that are overdue and have not received any payment for the last collection date. If you enter a part-payment for the last collection date for a loan, it will be marked as <strong>Arrears</strong> status instead.
          </p>
        </div>
        <div className="bg-white px-2 py-4 border-t-2 border-green-500">

          <div className="bg-gray-200 px-4 py-2 mb-6">
          <h3 className="font-medium text-gray-700">Required Fields:</h3>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <label className="w-32 text-right pr-4 font-medium text-gray-700">
              Country
            </label>
            <select 
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Rwanda">Rwanda</option>
              <option value="Uganda">Uganda</option>
              <option value="Kenya">Kenya</option>
              <option value="Tanzania">Tanzania</option>
            </select>
          </div>
        </div>

        {/* Optional Fields Section */}
        <div className="bg-gray-200 px-4 py-2 mb-4">
          <h3 className="font-medium text-gray-700">Optional Fields:</h3>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-6">
            <span className="text-blue-600 underline">All fields are optional</span> but you must type at least <strong>First Name</strong> or <strong>Business Name</strong>.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter First Name Only"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Last Name"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                placeholder="Middle Name"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-center text-gray-500 text-sm font-medium">
              AND/OR
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                placeholder="Business Name"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-blue-600 mb-4">All of the below fields are optional:</p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Unique Number
              </label>
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  name="unique_number"
                  value={formData.unique_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    You can enter unique number to identify the borrower such as Social Security Number, License #, Registration Id,...
                  </p>
                  <button className="text-blue-600 text-sm hover:underline">
                    Set Custom Unique Number
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Gender
              </label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Title
              </label>
              <select 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Title</option>
                <option value="mr">Mr.</option>
                <option value="mrs">Mrs.</option>
                <option value="ms">Ms.</option>
                <option value="dr">Dr.</option>
                <option value="prof">Prof.</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                placeholder="dd/mm/yyyy"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Province / State
              </label>
              <input
                type="text"
                name="province_state"
                value={formData.province_state}
                onChange={handleInputChange}
                placeholder="Province or State"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Zipcode
              </label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleInputChange}
                placeholder="Zipcode"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Landline Phone
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Landline Phone"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Working Status
              </label>
              <select 
                name="working_status"
                value={formData.working_status}
                onChange={handleInputChange}
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Working Status</option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder="Occupation"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Monthly Income
              </label>
              <input
                type="number"
                name="monthly_income"
                value={formData.monthly_income}
                onChange={handleInputChange}
                placeholder="Monthly Income"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Employer Name
              </label>
              <input
                type="text"
                name="employer_name"
                value={formData.employer_name}
                onChange={handleInputChange}
                placeholder="Employer Name"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="w-32 text-right pr-4 font-medium text-gray-700">
                Employer Address
              </label>
              <input
                type="text"
                name="employer_address"
                value={formData.employer_address}
                onChange={handleInputChange}
                placeholder="Employer Address"
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-start">
              <label className="w-32 text-right pr-4 font-medium text-gray-700 mt-2">
                Borrower Photo
              </label>
              <div className="flex-1 max-w-md">
                <input
                  type="file"
                  name="borrower_photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="borrowerPhoto"
                />
                <label
                  htmlFor="borrowerPhoto"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                >
                  Select image to upload
                </label>
                {formData.borrower_photo && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formData.borrower_photo.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <label className="w-32 text-right pr-4 font-medium text-gray-700 mt-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-start">
              <label className="w-32 text-right pr-4 font-medium text-gray-700 mt-2">
                Borrower Files
              </label>
              <div className="flex-1 max-w-md">
                <input
                  type="file"
                  name="client_files"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  id="borrowerFiles"
                />
                <label
                  htmlFor="borrowerFiles"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mb-4"
                >
                  Select files to upload
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <p className="text-gray-400">Drop files here</p>
                </div>
                {formData.client_files && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formData.client_files.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mt-8">
          <button type="button" onClick={() => navigate('/borrowers')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            Back
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        {success && <div className="mt-4 text-green-600 text-sm">{success}</div>}
        </form>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-red-600">Do not</span> put country code, spaces, or characters in the below mobile otherwise you won't be able to send SMS to the mobile.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AddBorrower;

