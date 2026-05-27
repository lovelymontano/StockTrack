import { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { getUserRole } from '../services/authService';

/**
 * Custom hook that checks the current user's role from Firestore.
 * Returns 'staff' if authenticated and registered, 'guest' otherwise.
 *
 * Usage:
 *   const { userRole, roleLoading } = useUserRole();
 *
 * Re-runs automatically every time the screen comes into focus
 * or the auth state changes.
 */
export default function useUserRole() {
    const isFocused = useIsFocused();
    const [userRole, setUserRole] = useState('guest');
    const [roleLoading, setRoleLoading] = useState(true);

    useEffect(() => {
        if (!isFocused) return;

        const checkRole = async () => {
            setRoleLoading(true);
            if (auth.currentUser) {
                try {
                    const role = await getUserRole(auth.currentUser.uid);
                    setUserRole(role);
                } catch (e) {
                    setUserRole('guest');
                }
            } else {
                setUserRole('guest');
            }
            setRoleLoading(false);
        };

        checkRole();
    }, [isFocused, auth.currentUser]);

    return { userRole, roleLoading };
}