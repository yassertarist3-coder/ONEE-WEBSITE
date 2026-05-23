import { Droplet, ShieldCheck, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './RoleSelectionPage.css';

export default function RoleSelectionPage() {
    return (
        <div className="role-selection-root">
            <div className="role-bg-orb role-orb-1" aria-hidden="true" />
            <div className="role-bg-orb role-orb-2" aria-hidden="true" />

            <div className="role-selection-container">
                <div className="role-brand-header">
                    <Droplet size={48} strokeWidth={2} className="role-logo-icon" />
                    <h1 className="role-title">Bienvenue sur ONEE</h1>
                    <p className="role-subtitle">Veuillez sélectionner votre type d'accès pour continuer</p>
                </div>

                <div className="role-cards-wrapper">
                    {/* User Card */}
                    <Link to="/user/login" className="role-card">
                        <div className="role-card-icon-wrapper">
                            <UserCircle size={40} strokeWidth={1.5} />
                        </div>
                        <h2 className="role-card-title">Espace Agent</h2>
                        <p className="role-card-description">
                            Accédez au catalogue des consommables, effectuez vos demandes de fournitures et suivez l'état de vos tickets.
                        </p>
                    </Link>

                    {/* Admin Card */}
                    <Link to="/login" className="role-card">
                        <div className="role-card-icon-wrapper">
                            <ShieldCheck size={40} strokeWidth={1.5} />
                        </div>
                        <h2 className="role-card-title">Espace Administrateur</h2>
                        <p className="role-card-description">
                            Gérez les stocks, traitez les demandes des agents, et administrez les utilisateurs et le catalogue.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
