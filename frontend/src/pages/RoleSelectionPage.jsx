import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleSelectionPage() {
    const navigate = useNavigate();
    const { setRole } = useAuth();

    const handleRoleSelect = (role) => {
        setRole(role);
        navigate('/dashboard');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="onee-logo">
                        <div className="logo-icon">💧</div>
                        <div className="logo-text">
                            <h1>ONEE</h1>
                            <p>Branche Eau</p>
                        </div>
                    </div>
                    <h2>Gestion des Consommables</h2>
                    <p className="login-subtitle">Direction Régionale Béni Mellal Khénifra - Khouribga</p>
                </div>
                
                <div className="login-form">
                    <h3 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937' }}>
                        Sélectionnez votre type d'accès
                    </h3>
                    
                    <button 
                        onClick={() => handleRoleSelect('admin')}
                        className="login-button"
                        style={{ marginBottom: '16px' }}
                    >
                        🛡️ Administrateur
                    </button>
                    
                    <button 
                        onClick={() => handleRoleSelect('employee')}
                        className="login-button"
                        style={{ backgroundColor: '#059669' }}
                    >
                        👤 Employé
                    </button>
                </div>
                
                <div className="login-footer">
                    <p>© 2026 ONEE - Direction Régionale Béni Mellal Khénifra - Khouribga</p>
                </div>
            </div>
        </div>
    );
}
