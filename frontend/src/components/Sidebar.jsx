import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Tableau de Bord' },
    { path: '/catalog', icon: '📦', label: 'Catalogue' },
    { path: '/stock-entry', icon: '📥', label: 'Entrée de Stock' },
    { path: '/stock-exit', icon: '📤', label: 'Sortie de Stock' },
    { path: '/admin/tickets', icon: '🎫', label: 'Demandes' },
    { path: '/discharges', icon: '📄', label: 'Décharges' },
    { path: '/admin/users', icon: '👥', label: 'Utilisateurs' },
    { path: '/low-stock', icon: '⚠️', label: 'Alertes Stock' },
    { path: '/movements', icon: '📋', label: 'Historique' },
    { path: '/admin/analytics', icon: '📈', label: 'Décisionnel' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">💧</div>
                    <div className="logo-text">
                        <span>ONEE</span>
                    </div>
                </div>
            </div>
            
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <a
                        key={item.path}
                        href={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                        }}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </a>
                ))}
            </nav>
            
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Déconnexion</span>
                </button>
            </div>
        </div>
    );
}
