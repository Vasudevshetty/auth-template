import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getCurrentUser } from '../features/auth/authSlice';
import Spinner from './common/Spinner';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch current user data if needed
    if (!user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Welcome!</h2>
          <p className="text-blue-700">
            You've successfully authenticated with our secure authentication system.
          </p>
        </div>
        
        {user && (
          <div className="bg-white border rounded-md p-4">
            <h3 className="font-medium text-lg text-gray-900 mb-2">User Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1">{user.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="mt-1 text-sm">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 border-t pt-6">
          <h3 className="font-medium text-lg text-gray-900 mb-2">What's next?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Explore the API documentation</li>
            <li>Customize this dashboard to suit your needs</li>
            <li>Configure additional authentication options</li>
            <li>Set up user management features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;