// Test import to verify auth-context module
import { AuthProvider, useAuth } from '@/lib/auth-context';

console.log('AuthProvider:', AuthProvider);
console.log('useAuth:', useAuth);

export { AuthProvider, useAuth };