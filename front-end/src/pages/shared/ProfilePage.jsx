import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-bold text-[#00509E] mb-6">Profile</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <p className="text-gray-900">{user?.first_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <p className="text-gray-900">{user?.last_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <p className="text-gray-900 capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
