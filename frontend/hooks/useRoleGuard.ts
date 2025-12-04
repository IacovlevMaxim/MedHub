import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUserRoles, selectIsAuthenticated } from '@/features/auth/authSlice';

export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();
  const userRoles = useAppSelector(selectUserRoles);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // If user doesn't have any of the allowed roles, redirect to home
    const hasRequiredRole = allowedRoles.some(role => 
      userRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())
    );
    
    if (!hasRequiredRole && userRoles.length > 0) {
      router.replace('/(tabs)');
    }
  }, [userRoles, isAuthenticated, allowedRoles, router]);

  return {
    hasAccess: allowedRoles.some(role => 
      userRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())
    ),
    isLoading: isAuthenticated && userRoles.length === 0,
  };
}
