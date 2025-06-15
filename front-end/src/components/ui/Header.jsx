import React, { useState, useRef, useEffect } from 'react';
import { AlignJustify, CircleUserRound, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuToggle }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            setIsDropdownOpen(false);
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Force navigation even if logout fails
            navigate('login');
        }
    };

    const getUserDisplayName = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
        return 'User';
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            'admin': 'Administrator',
            'supervisor': 'Supervisor',
            'loan-officer': 'Loan Officer',
            'cashier': 'Cashier'
        };
        return roleNames[role] || role;
    };

    const handleProfileView = () => {
        setIsDropdownOpen(false);
        navigate('/shared/profile');
    };

    return (
        <header className="sticky top-0 z-999 flex w-full bg-[#00509E] drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
            <div className="flex flex-grow items-center justify-between py-2 px-4 shadow-2 md:px-6 2xl:px-11">
                <AlignJustify
                    className='text-white w-8 h-8 cursor-pointer hover:text-blue-200 transition-colors lg:hidden'
                    onClick={onMenuToggle}
                />

                {/* Empty div for spacing on desktop */}
                <div className="hidden lg:block"></div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        className='flex items-center gap-2 cursor-pointer hover:bg-blue-600 rounded-lg px-3 py-2 transition-colors duration-200'
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className='flex flex-col items-end'>
                            <span className='text-white font-medium text-sm'>
                                {getUserDisplayName()}
                            </span>
                            {user?.role && (
                                <span className='text-blue-200 text-xs'>
                                    {getRoleDisplayName(user.role)}
                                </span>
                            )}
                        </div>
                        <CircleUserRound className='w-8 h-8 text-white' />
                        <ChevronDown
                            className={`w-4 h-4 text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            {/* User Info Section */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <CircleUserRound className='w-8 h-8 text-blue-600' />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">
                                            {getUserDisplayName()}
                                        </p>
                                        {user?.email && (
                                            <p className="text-sm text-gray-500 truncate">
                                                {user.email}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-1">
                                            {user?.role && (
                                                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                                    {getRoleDisplayName(user.role)}
                                                </span>
                                            )}
                                            {user?.employee_id && (
                                                <span className="text-xs text-gray-400">
                                                    ID: {user.employee_id}
                                                </span>
                                            )}
                                        </div>
                                        {user?.branch && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Branch: {user.branch}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <button
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                    onClick={handleProfileView}
                                >
                                    <User className="w-4 h-4" />
                                    View Profile
                                </button>

                                <button
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        // Add settings navigation if needed
                                    }}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                            </div>

                            {/* Logout Section */}
                            <div className="border-t border-gray-100 py-1">
                                <button
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
