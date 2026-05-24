import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const PAGE_TITLES = {
    '/dashboard': 'Tableau de Bord',
    '/catalog': 'Catalogue des Consommables',
    '/stock-entry': 'Entrée de Stock',
    '/stock-exit': 'Sortie de Stock',
    '/low-stock': 'Alertes Stock',
    '/discharges': 'Décharges',
    '/movements': 'Historique des Mouvements',
};

export default function Layout({ children }) {
    const { admin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const pageTitle = PAGE_TITLES[location.pathname] || 'Gestion des Consommables';

    const handleNavbarLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="layout">
            <Sidebar />
            
            <div className="main-content">
                <header className="navbar">
                    <div className="navbar-content">
                        <h1 className="navbar-title">{pageTitle}</h1>
                        
                        <div className="navbar-user">
                            <span className="user-name">{admin?.name}</span>
                            <button onClick={handleNavbarLogout} className="logout-btn-navbar">
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </header>
                
                <main className="content page-enter">
                    {children}
                </main>
            </div>
        </div>
    );
}
