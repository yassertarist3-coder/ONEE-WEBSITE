import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, BellRing, TrendingUp, AlertTriangle, Truck } from 'lucide-react';
import Layout from '../../components/Layout';
import apiClient from '../../api/axios';

export default function RealTimeMonitoringPage() {
    const [movements, setMovements] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({
        alertsCount: 0,
        movementsToday: 0,
        atRiskProducts: 0,
        supplierDelays: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLiveMonitoring();

        const interval = setInterval(() => {
            fetchLiveMonitoring(false);
        }, 10000); // 10 seconds refresh for real-time feel

        return () => clearInterval(interval);
    }, []);

    const fetchLiveMonitoring = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const { data } = await apiClient.get('/decisionnel/live-monitoring');
            setMovements(data.recentMovements);
            setAlerts(data.lowStockAlerts);
            if (data.stats) setStats(data.stats);
        } catch (error) {
            console.error("Erreur Live Monitoring", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="text-blue-600" /> 
                        Monitoring Temps Réel
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        En direct
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg text-red-600"><BellRing size={20} /></div>
                        <div>
                            <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Alertes Stock</p>
                            <h3 className="text-xl font-bold text-red-800">{stats.alertsCount} critiques</h3>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
                        <div>
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Mouvements Jours</p>
                            <h3 className="text-xl font-bold text-blue-800">{stats.movementsToday} totaux</h3>
                        </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg text-orange-600"><AlertTriangle size={20} /></div>
                        <div>
                            <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Produits à Risque</p>
                            <h3 className="text-xl font-bold text-orange-800">{stats.atRiskProducts} bas stock</h3>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                        <div className="p-3 bg-gray-200 rounded-lg text-gray-600"><Truck size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">Retards Fournisseurs</p>
                            <h3 className="text-xl font-bold text-gray-800">{stats.supplierDelays} signalés</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne des Mouvements */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Clock size={18} className="text-gray-500" />
                                    Derniers Mouvements (Live)
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {movements.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">Aucun mouvement récent</div>
                                ) : movements.map((mvt) => (
                                    <div key={mvt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${mvt.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {mvt.type === 'in' ? <CheckCircle2 size={20} /> : <Activity size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{mvt.product_name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {mvt.type === 'in' ? 'Entrée de stock' : `Sortie par: ${mvt.recipient || 'Inconnu'}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${mvt.type === 'in' ? 'text-green-600' : 'text-orange-600'}`}>
                                                {mvt.type === 'in' ? '+' : '-'}{mvt.quantity}
                                            </p>
                                            <p className="text-xs text-gray-400">{mvt.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Colonne des Alertes */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                            <div className="p-4 border-b border-red-100 bg-red-50">
                                <h3 className="font-bold text-red-800 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-red-600" />
                                    Alertes Critiques
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {alerts.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">Aucune alerte pour le moment</div>
                                ) : alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 bg-red-50/30">
                                        <p className="font-medium text-gray-800 mb-1">{alert.name}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-red-600 font-bold">Stock: {alert.stock_quantity}</span>
                                            <span className="text-gray-500">Seuil: {alert.threshold}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
