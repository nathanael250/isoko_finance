import React, { useState } from 'react';
import {
    User,
    Mail,
    Building,
    Upload,
    Lock,
    ChevronRight,
    AlertCircle,
    Check
} from 'lucide-react';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        county: '',
        firstName: '',
        middleLastName: '',
        uniqueNumber: '',
        gender: '',
        title: '',
        dateOfBirth: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        provinceState: '',
        zipcode: '',
        businessName: '',
        workingStatus: '',
        description: '',
        loanOfficerAccess: false
    });

    const [errors, setErrors] = useState({});
    const [files, setFiles] = useState({
        borrowerPhoto: null,
        borrowerFiles: []
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e, fileType) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => ({
            ...prev,
            [fileType]: fileType === 'borrowerPhoto' ? selectedFiles[0] : selectedFiles
        }));
    };

    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/\D/g, '');
        if (phoneNumber.length >= 6) {
            return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (phoneNumber.length >= 3) {
            return phoneNumber.replace(/(\d{3})(\d{1,3})/, '($1) $2');
        }
        return phoneNumber;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData(prev => ({ ...prev, mobile: formatted }));
    };

    const validate = () => {
        const newErrors = {};
        const requiredFields = [
            'county', 'firstName', 'middleLastName', 'uniqueNumber', 'gender',
            'dateOfBirth', 'mobile', 'email', 'address', 'city', 'provinceState',
            'zipcode', 'workingStatus'
        ];

        requiredFields.forEach(field => {
            if (!formData[field]?.trim()) {
                newErrors[field] = 'This field is required';
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Form Data:', formData);
            console.log('Files:', files);
            alert('Application submitted successfully!');
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const handleSaveDraft = () => {
        console.log('Saving draft:', formData, files);
        alert('Draft saved successfully!');
    };

    const InputField = ({ label, name, type = 'text', required = false, options = null, placeholder = '', className = '' }) => (
        <div className={`space-y-1 ${className}`}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors[name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                >
                    <option value="">Select {label}</option>
                    {options?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-vertical ${errors[name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={name === 'mobile' ? handlePhoneChange : handleInputChange}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors[name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
            )}
            {errors[name] && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors[name]}</span>
                </div>
            )}
        </div>
    );

    const FileUpload = ({ label, name, accept, multiple = false }) => {
        const fileCount = multiple ? files[name]?.length || 0 : files[name] ? 1 : 0;
        const hasFiles = fileCount > 0;

        return (
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${hasFiles ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                        }`}
                    onClick={() => document.getElementById(name).click()}
                >
                    <input
                        type="file"
                        id={name}
                        accept={accept}
                        multiple={multiple}
                        onChange={(e) => handleFileChange(e, name)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                        {hasFiles ? (
                            <Check className="mx-auto h-6 w-6 text-green-600" />
                        ) : (
                            <Upload className="mx-auto h-6 w-6 text-gray-400" />
                        )}
                        <div className="text-sm">
                            {hasFiles ? (
                                <span className="text-green-600 font-medium">
                                    {multiple ? `${fileCount} files selected` : files[name]?.name}
                                </span>
                            ) : (
                                <>
                                    <span className="text-gray-600">Click to upload {label.toLowerCase()}</span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {accept.includes('image') ? 'PNG, JPG up to 5MB' : 'PDF, DOC, images up to 10MB each'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const Section = ({ icon: Icon, title, children }) => (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Icon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <span>Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Applications</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900">New Application</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">New Loan Application</h1>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Borrower Information</h2>
                    <p className="text-sm text-gray-600 mt-1">Complete all required fields to process the loan application</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Personal Information */}
                    <Section icon={User} title="Personal Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField
                                label="County"
                                name="county"
                                required
                            />
                            <InputField
                                label="First Name"
                                name="firstName"
                                required
                            />
                            <InputField
                                label="Middle/Last Name"
                                name="middleLastName"
                                required
                            />
                            <InputField
                                label="Unique Number"
                                name="uniqueNumber"
                                required
                            />
                            <InputField
                                label="Gender"
                                name="gender"
                                type="select"
                                required
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                                ]}
                            />
                            <InputField
                                label="Title"
                                name="title"
                                type="select"
                                options={[
                                    { value: 'mr', label: 'Mr.' },
                                    { value: 'mrs', label: 'Mrs.' },
                                    { value: 'ms', label: 'Ms.' },
                                    { value: 'dr', label: 'Dr.' },
                                    { value: 'prof', label: 'Prof.' }
                                ]}
                            />
                            <InputField
                                label="Date of Birth"
                                name="dateOfBirth"
                                type="date"
                                required
                            />
                        </div>
                    </Section>

                    {/* Contact Information */}
                    <Section icon={Mail} title="Contact Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField
                                label="Mobile"
                                name="mobile"
                                type="tel"
                                required
                            />
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                required
                            />
                            <InputField
                                label="Address"
                                name="address"
                                required
                                className="md:col-span-2 lg:col-span-3"
                            />
                            <InputField
                                label="City"
                                name="city"
                                required
                            />
                            <InputField
                                label="Province/State"
                                name="provinceState"
                                required
                            />
                            <InputField
                                label="Zipcode"
                                name="zipcode"
                                required
                            />
                        </div>
                    </Section>

                    {/* Business Information */}
                    <Section icon={Building} title="Business & Employment">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Business Name"
                                name="businessName"
                            />
                            <InputField
                                label="Working Status"
                                name="workingStatus"
                                type="select"
                                required
                                options={[
                                    { value: 'employed', label: 'Employed' },
                                    { value: 'self-employed', label: 'Self-Employed' },
                                    { value: 'unemployed', label: 'Unemployed' },
                                    { value: 'retired', label: 'Retired' },
                                    { value: 'student', label: 'Student' },
                                    { value: 'other', label: 'Other' }
                                ]}
                            />
                            <InputField
                                label="Description"
                                name="description"
                                type="textarea"
                                placeholder="Additional information about employment or application..."
                                className="md:col-span-2"
                            />
                        </div>
                    </Section>

                    {/* Document Upload */}
                    <Section icon={Upload} title="Document Upload">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUpload
                                label="Borrower Photo"
                                name="borrowerPhoto"
                                accept="image/*"
                            />
                            <FileUpload
                                label="Supporting Documents"
                                name="borrowerFiles"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                multiple
                            />
                        </div>
                    </Section>

                    {/* Access Control */}
                    <Section icon={Lock} title="Access Permissions">
                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="loanOfficerAccess"
                                name="loanOfficerAccess"
                                checked={formData.loanOfficerAccess}
                                onChange={handleInputChange}
                                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                                <label htmlFor="loanOfficerAccess" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Grant Loan Officer Access
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Allow assigned loan officers to access and review this application
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Submit Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;