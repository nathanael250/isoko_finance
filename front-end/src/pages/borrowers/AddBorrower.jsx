import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AlertCircle, ArrowLeft, User, Building, Hash, Mail, Phone, MapPin, Calendar, Upload } from 'lucide-react';

const AddBorrower = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    assigned_officer: user?.id
  });

  const [borrowerPhoto, setBorrowerPhoto] = useState(null);
  const [borrowerFiles, setBorrowerFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBorrowerPhoto(e.target.files[0]);
    }
  };

  const handleFilesChange = (e) => {
    if (e.target.files) {
      setBorrowerFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Log the form data for debugging
      console.log('Form data before submission:', formData);
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files if they exist
      if (borrowerPhoto) {
        formDataToSend.append('photo', borrowerPhoto);
      }
      
      if (borrowerFiles.length > 0) {
        borrowerFiles.forEach(file => {
          formDataToSend.append('documents', file);
        });
      }

      // Log the FormData contents for debugging
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.post('/clients', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        navigate('/borrowers');
      } else {
        setError(response.data.message || 'Failed to add borrower. Please try again.');
      }
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Failed to add borrower. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Check if at least one of first_name or business_name is provided
    if (!formData.first_name && !formData.business_name) {
      setError('Please provide either First Name or Business Name');
      return false;
    }

    // Check if mobile is provided
    if (!formData.mobile) {
      setError('Mobile number is required');
      return false;
    }

    // Check if country is provided
    if (!formData.country) {
      setError('Country is required');
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Advanced Header */}
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-8 border border-gray-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/borrowers')}
                className="p-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl shadow-lg hover:shadow-gray-500/25 transition-all duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/25">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Add New Borrower</h1>
                  <p className="text-gray-600 mt-2 text-lg">Create a comprehensive borrower profile with all necessary information</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">Validation Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-10">
            {/* Required Fields Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Required Information</h2>
                  <p className="text-gray-600">Essential details for borrower identification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter First Name Only"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Mobile (Numbers Only) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Do not include country code or spaces"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Business Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="Business Name"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                  <Hash className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                  <p className="text-gray-600">Optional details to complete the borrower profile</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Unique Number
                  </label>
                  <input
                    type="text"
                    name="unique_number"
                    value={formData.unique_number}
                    onChange={handleChange}
                    placeholder="e.g., Social Security Number, License #"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Title
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  >
                    <option value="">Select Title</option>
                    <option value="mr">Mr.</option>
                    <option value="mrs">Mrs.</option>
                    <option value="ms">Ms.</option>
                    <option value="dr">Dr.</option>
                    <option value="prof">Prof.</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Working Status
                  </label>
                  <select
                    name="working_status"
                    value={formData.working_status}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  >
                    <option value="">Select Working Status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Job Title or Profession"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    name="monthly_income"
                    value={formData.monthly_income}
                    onChange={handleChange}
                    placeholder="Monthly Income Amount"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Employer Name
                  </label>
                  <input
                    type="text"
                    name="employer_name"
                    value={formData.employer_name}
                    onChange={handleChange}
                    placeholder="Company or Organization Name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Employer Address
                </label>
                <textarea
                  name="employer_address"
                  value={formData.employer_address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Complete employer address"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
                  <p className="text-gray-600">Location and contact details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Complete address including street, district, etc."
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Province/State
                  </label>
                  <input
                    type="text"
                    name="province_state"
                    value={formData.province_state}
                    onChange={handleChange}
                    placeholder="Province or State"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    placeholder="Postal/Zip Code"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Files and Documents Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Documents & Files</h2>
                  <p className="text-gray-600">Upload borrower photo and supporting documents</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Borrower Photo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  {borrowerPhoto && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium">Selected: {borrowerPhoto.name}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Supporting Documents
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFilesChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  {borrowerFiles.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium">
                        {borrowerFiles.length} file(s) selected
                      </p>
                      <ul className="mt-2 space-y-1">
                        {borrowerFiles.map((file, index) => (
                          <li key={index} className="text-xs text-purple-600">
                            • {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Additional Notes</h2>
                  <p className="text-gray-600">Any additional information about the borrower</p>
                </div>
              </div>

                            <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Additional notes, special circumstances, or important information about the borrower..."
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/borrowers')}
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-gray-500/25 flex items-center justify-center gap-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 disabled:shadow-none flex items-center justify-center gap-3 min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Creating Borrower...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      Create Borrower
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-3">Important Information</h3>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Required Fields:</strong> Either First Name or Business Name must be provided, along with Mobile number and Country.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Mobile Number:</strong> Enter numbers only without country code or spaces (e.g., 0781234567).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>File Uploads:</strong> You can upload a borrower photo and multiple supporting documents.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Data Security:</strong> All information is encrypted and stored securely in compliance with privacy regulations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-8 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-green-100/30 to-emerald-100/30 rounded-full translate-y-14 -translate-x-14"></div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-3">Quick Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                  <div className="space-y-2">
                    <h4 className="font-bold text-green-900">For Individual Borrowers:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Fill in First Name and Last Name
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Add personal identification details
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Include employment information
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-green-900">For Business Borrowers:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Focus on Business Name field
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Add business registration details
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Include business address information
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBorrower;

