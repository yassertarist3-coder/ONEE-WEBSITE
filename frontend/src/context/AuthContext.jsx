import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(false);

    const setRoleAndName = (selectedRole) => {
        setRole(selectedRole);
        const name = selectedRole === 'admin' ? 'Administrateur' : 'Employé';
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('userName', name);
    };

    const logout = () => {
        setRole(null);
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
    };

    const admin = {
        name: role === 'admin' ? 'Administrateur' : role === 'employee' ? 'Employé' : '',
        role: role
    };

    return (
        <AuthContext.Provider value={{ admin, setRole: setRoleAndName, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
