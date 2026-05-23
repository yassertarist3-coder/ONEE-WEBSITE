import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, AlertTriangle, Package, TrendingUp, Clock, FileSpreadsheet, ShieldAlert, Download, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import apiClient from '../../api/axios';
import './AnalyticsDashboardPage.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboardPage() {
    const [loading, setLoading] = useState(true);
    
    const [stats, setStats] = useState({
        totalValue: 0, totalProducts: 0, movementsThisMonth: 0, lowStockCount: 0, healthScore: 100
    });
    const [trends, setTrends] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topConsumers, setTopConsumers] = useState([]);
    const [movements, setMovements] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchLiveUpdates();
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overviewRes, trendsRes, productsRes, liveRes, alertsRes, consumersRes] = await Promise.all([
                apiClient.get('/decisionnel/overview'),
                apiClient.get('/decisionnel/trends'),
                apiClient.get('/decisionnel/top-products'),
                apiClient.get('/decisionnel/live-monitoring'),
                apiClient.get('/decisionnel/alerts'),
                apiClient.get('/decisionnel/top-consumers')
            ]);
            setStats(overviewRes.data);
            setTrends(trendsRes.data);
            setTopProducts(productsRes.data);
            setMovements(liveRes.data.recentMovements);
            setAlerts(alertsRes.data.filter(a => !a.is_read).slice(0, 5));
            setTopConsumers(consumersRes.data);
        } catch (error) {
            console.error("Erreur de chargement", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveUpdates = async () => {
        try {
            const [liveRes, alertsRes] = await Promise.all([
                apiClient.get('/decisionnel/live-monitoring'),
                apiClient.get('/decisionnel/alerts')
            ]);
            setMovements(liveRes.data.recentMovements);
            setAlerts(alertsRes.data.filter(a => !a.is_read).slice(0, 5));
        } catch (error) {}
    };

    const handleDownloadReport = async (type) => {
        try {
            let endpoint = '';
            if (type === 'Quotidien') endpoint = '/decisionnel/export/daily-summary';
            if (type === 'Inventaire') endpoint = '/decisionnel/export/inventory';
            if (type === 'Mouvements') endpoint = '/decisionnel/export/movements';

            const response = await apiClient.get(endpoint, { responseType: 'blob' });
            
            let filename = `rapport_${type}.csv`;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Erreur lors du téléchargement", error);
            alert("Erreur lors de l'exportation du rapport.");
        }
    };

    const getHealthStatus = () => {
        if (stats.healthScore >= 80) return 'green';
        if (stats.healthScore >= 50) return 'orange';
        return 'red';
    };

    if (loading) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    Chargement du tableau de bord...
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="analytics-root">
                
                {/* En-tête */}
                <div className="analytics-header">
                    <div className="analytics-title-group">
                        <h1><Activity size={28} color="#2563eb" /> Tableau Décisionnel Unifié</h1>
                        <p>Supervision globale, alertes et rapports en temps réel.</p>
                    </div>

                    <div className={`health-score-badge ${getHealthStatus()}`}>
                        <div className="icon"><Activity size={24} /></div>
                        <div className="health-score-info">
                            <p className="label">Santé du Stock</p>
                            <p className={`score ${getHealthStatus()}`}>{stats.healthScore} / 100</p>
                        </div>
                    </div>
                </div>

                {/* ROW 1: Statistiques Rapides */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue"><Package size={24} /></div>
                        <div className="stat-info">
                            <p className="label">Articles Actifs</p>
                            <h3>{stats.totalProducts}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon indigo"><TrendingUp size={24} /></div>
                        <div className="stat-info">
                            <p className="label">Mouvements (Mois)</p>
                            <h3>{stats.movementsThisMonth}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><AlertTriangle size={24} /></div>
                        <div className="stat-info">
                            <p className="label">Produits en Alerte</p>
                            <h3>{stats.lowStockCount}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon red"><ShieldAlert size={24} /></div>
                        <div className="stat-info">
                            <p className="label">Alertes Critiques</p>
                            <h3>{alerts.length} non lues</h3>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Graphiques */}
                <div className="charts-grid">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <h3 className="panel-title">Tendance des Mouvements (30 Jours)</h3>
                        </div>
                        <div className="panel-content" style={{ height: '350px', width: '100%', padding: '20px' }}>
                            <ResponsiveContainer width="99%" height={300}>
                                <LineChart data={trends.map(t => ({...t, total_in: Number(t.total_in), total_out: Number(t.total_out)}))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total_in" name="Entrées" stroke="#10b981" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="total_out" name="Sorties" stroke="#f97316" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <h3 className="panel-title">Articles les Plus Demandés</h3>
                        </div>
                        <div className="panel-content" style={{ height: '350px', width: '100%', padding: '20px' }}>
                            <ResponsiveContainer width="99%" height={300}>
                                <PieChart>
                                    <Pie data={topProducts.map(p => ({...p, total_quantity: Number(p.total_quantity)}))} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="total_quantity" nameKey="name">
                                        {topProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ROW 3: Top Consommateurs */}
                <div className="dashboard-panel" style={{ marginBottom: '24px' }}>
                    <div className="panel-header">
                        <h3 className="panel-title">
                            <Users size={18} color="#6366f1" /> Classement des Consommateurs (Entités & Villes)
                        </h3>
                    </div>
                    <div className="panel-content no-pad scrollable-list" style={{ maxHeight: '280px' }}>
                        {topConsumers.length === 0 ? (
                            <div className="empty-state">Aucun consommateur enregistré.</div>
                        ) : topConsumers.map((c, idx) => (
                            <div key={idx} className="list-item">
                                <div className="feed-left">
                                    <div className="feed-indicator" style={{ backgroundColor: '#6366f1' }}></div>
                                    <div className="feed-details">
                                        <p className="name">{c.name}</p>
                                        <p className="meta">{c.entity || 'Entité non spécifiée'} • {c.ville || 'Ville non spécifiée'}</p>
                                    </div>
                                </div>
                                <div className="feed-qty" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                                    {c.total_consumed_items} articles ({c.total_requests} requêtes)
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ROW 4: Flux et Alertes */}
                <div className="feed-grid">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <h3 className="panel-title">
                                <Clock size={18} color="#3b82f6" /> Flux Temps Réel
                            </h3>
                            <div className="live-dot">
                                <div className="live-dot-ping"></div>
                                <div className="live-dot-core"></div>
                            </div>
                        </div>
                        <div className="panel-content no-pad scrollable-list">
                            {movements.length === 0 ? (
                                <div className="empty-state">Aucun mouvement récent.</div>
                            ) : movements.map(m => (
                                <div key={m.id} className="list-item">
                                    <div className="feed-left">
                                        <div className={`feed-indicator ${m.type === 'in' ? 'in' : 'out'}`}></div>
                                        <div className="feed-details">
                                            <p className="name">{m.product_name}</p>
                                            <p className="meta">{m.recipient || 'Mouvement système'} • {m.date}</p>
                                        </div>
                                    </div>
                                    <div className={`feed-qty ${m.type === 'in' ? 'in' : 'out'}`}>
                                        {m.type === 'in' ? '+' : '-'}{m.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header red-bg">
                            <h3 className="panel-title red">
                                <ShieldAlert size={18} color="#ef4444" /> Alertes Critiques
                            </h3>
                        </div>
                        <div className="panel-content no-pad scrollable-list">
                            {alerts.length === 0 ? (
                                <div className="empty-state">Aucune alerte en cours. Parfait !</div>
                            ) : alerts.map(a => (
                                <div key={a.id} className="list-item alert-item">
                                    <AlertTriangle color="#ef4444" size={20} />
                                    <div className="alert-details">
                                        <p className="msg">{a.message}</p>
                                        <p className="date">{new Date(a.created_at).toLocaleString('fr-FR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ROW 4: Rapports */}
                <div className="dashboard-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">
                            <FileSpreadsheet size={18} color="#10b981" /> Génération de Rapports
                        </h3>
                    </div>
                    <div className="panel-content reports-grid">
                        <button className="report-btn" onClick={() => handleDownloadReport('Quotidien')}>
                            <Download size={16} /> Résumé Quotidien
                        </button>
                        <button className="report-btn" onClick={() => handleDownloadReport('Inventaire')}>
                            <Download size={16} /> Valorisation Inventaire
                        </button>
                        <button className="report-btn" onClick={() => handleDownloadReport('Mouvements')}>
                            <Download size={16} /> Historique Global
                        </button>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
