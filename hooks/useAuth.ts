import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, setError, setLoading, logout } from '../store/authSlice';
import { RootState } from '../store/store';
import { isAuthenticated, getAuthToken, fetchAuthenticatedUser, logout as apiLogout } from '../lib/api';

export default function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // Check auth status and fetch user data on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isAuthenticated()) {
        dispatch(setLoading(true));
        try {
          const userData = await fetchAuthenticatedUser();
          
          // Store the user data in Redux
          dispatch(
            setAuth({
              user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                avatar: userData.avatar,
                created_at: userData.created_at,
                updated_at: userData.updated_at,
                address: userData.address,
              },
              pharmacy: userData.pharmacy,
              token: getAuthToken() || '',
            })
          );
        } catch (error) {
          console.error('Auth check error:', error);
          dispatch(setError('Failed to authenticate user'));
          // If there was an error fetching user data, log the user out
          apiLogout();
          dispatch(logout());
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  // Handle user logout
  const handleLogout = async () => {
    dispatch(setLoading(true));
    try {
      await apiLogout();
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    ...auth,
    logout: handleLogout,
  };
} 