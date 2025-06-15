import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { navigationConfig } from '../../components/config/navigationConfig';
import Header from '../ui/Header';

const DashboardLayout = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState({});

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleDropdown = (key) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Filter navigation based on user role with specific business logic
    const getFilteredNavigation = () => {
        if (!user?.role) return [];
        
        return navigationConfig.filter(item => {
            // Check if user role is allowed for this navigation item
            const hasAccess = item.roles.includes(user.role);
            
            if (hasAccess && item.children) {
                // Filter children based on user role
                item.filteredChildren = item.children.filter(child => 
                    child.roles.includes(user.role)
                );
                // Only show parent if it has accessible children
                return item.filteredChildren.length > 0;
            }
            
            return hasAccess;
        });
    };

    const filteredNavigation = getFilteredNavigation();

    // Get role-specific welcome message
    const getRoleWelcomeMessage = () => {
        switch(user?.role) {
            case 'admin':
                return 'Administrator Dashboard';
            case 'supervisor':
                return 'Supervisor Dashboard';
            case 'loan-officer':
                return 'Loan Officer Dashboard - Your Assigned Portfolio';
            case 'cashier':
                return 'Cashier Dashboard - Loan Requests';
            default:
                return 'Dashboard';
        }
    };

    // Render navigation item
    const renderNavigationItem = (item) => {
        const IconComponent = item.icon;
        const isDropdownOpen = openDropdowns[item.id];

        if (item.hasDropdown) {
            return (
                <li key={item.id}>
                    <div>
                        <button
                            onClick={() => toggleDropdown(item.id)}
                            className="group text-white relative flex items-center justify-between w-full gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
                        >
                            <div className="flex items-center gap-2.5">
                                <IconComponent className='w-5 h-5 text-white' />
                                {item.title}
                                {/* Add role-specific indicators */}
                                {user?.role === 'loan-officer' && item.id === 'loans' && (
                                    <span className="text-xs bg-blue-500 px-1 rounded">My Portfolio</span>
                                )}
                                {user?.role === 'cashier' && item.id === 'loans' && (
                                    <span className="text-xs bg-green-500 px-1 rounded">Requests</span>
                                )}
                            </div>
                            {isDropdownOpen ? (
                                <ChevronDown className='w-4 h-4 text-white' />
                            ) : (
                                <ChevronRight className='w-4 h-4 text-white' />
                            )}
                        </button>
                        
                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <ul className="mt-2 ml-4 space-y-1">
                                {(item.filteredChildren || item.children)?.map((child, index) => (
                                    <li key={index}>
                                        <Link
                                            to={child.path}
                                            className="group text-gray-300 relative flex items-center gap-2.5 rounded-sm py-1.5 px-3 text-xs font-medium duration-300 ease-in-out hover:bg-graydark hover:text-white dark:hover:bg-meta-4"
                                        >
                                            {child.title}
                                            {/* Add role-specific badges */}
                                            {user?.role === 'loan-officer' && child.title.includes('My') && (
                                                <span className="text-xs bg-blue-400 px-1 rounded ml-auto">Assigned</span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </li>
            );
        }

        // Regular navigation item without dropdown
        return (
            <li key={item.id}>
                <Link
                    to={typeof item.path === 'function' ? item.path(user?.role) : item.path}
                    className="group text-white relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
                >
                    <IconComponent className='w-5 h-5 text-white' />
                    {item.title}
                    {/* Add role-specific indicators */}
                    {user?.role === 'loan-officer' && item.id === 'borrowers' && (
                        <span className="text-xs bg-blue-500 px-1 rounded ml-auto">Assigned</span>
                    )}
                </Link>
            </li>
        );
    };

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className={`absolute left-0 top-0 z-9999 flex h-screen w-50 flex-col overflow-y-hidden bg-[#222D32] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
                        <h1 className='text-white font-semibold text-2xl'>ISOKO INV.</h1>
                        <button 
                            className="block lg:hidden"
                            onClick={toggleSidebar}
                        >
                            <svg
                                className="fill-current"
                                width="20"
                                height="18"
                                viewBox="0 0 20 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                                    fill=""
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Role indicator */}
                    <div className="px-6 pb-4">
                        <div className="text-xs text-gray-400 uppercase tracking-wider">
                            {user?.role?.replace('-', ' ')} Portal
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                            {user?.first_name} {user?.last_name}
                        </div>
                    </div>
                    
                    <div className="no-scrollbar flex flex-col overflow-y-auto text-sm duration-300 ease-linear">
                        <nav className="mt-5 py-4 px-2 lg:mt-9 lg:px-4">
                            <div>
                                <ul className="space-y-1">
                                    {filteredNavigation.map(item => renderNavigationItem(item))}
                                </ul>

                                {/* Role-specific help text */}
                                <div className="mt-8 px-2">
                                    <div className="text-xs text-gray-400 border-t border-gray-600 pt-4">
                                        {user?.role === 'loan-officer' && (
                                            <p>You can only view borrowers and loans assigned to you.</p>
                                        )}
                                        {user?.role === 'cashier' && (
                                            <p>You can view and process loan requests.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={toggleSidebar}
                    />
                )}

                {/* Main Content Area */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header onMenuToggle={toggleSidebar} />
                    <main>
                        <div className="mx-auto max-w-screen-2xl p-2 md:p-6 2xl:p-2">
                            {/* Role-specific welcome message */}
                            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 dark:bg-gray-800 dark:border-blue-500">
                                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                                    {getRoleWelcomeMessage()}
                                </h2>
                                {user?.role === 'loan-officer' && (
                                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                        Access is limited to your assigned borrowers and loans only.
                                    </p>
                                )}
                                {user?.role === 'cashier' && (
                                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                                        You can view and process loan requests.
                                    </p>
                                )}
                            </div>
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
