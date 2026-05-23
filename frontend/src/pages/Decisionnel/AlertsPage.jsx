import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import Layout from '../../components/Layout';
import apiClient from '../../api/axios';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/decisionnel/alerts');
            setAlerts(data);
        } catch (error) {
            console.error("Erreur Alerts", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiClient.patch(`/decisionnel/alerts/${id}/read`);
            setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: 1 } : a));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Bell size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Centre d'Alertes Intelligentes</h1>
                        <p className="text-gray-500">Gérez et résolvez les anomalies détectées par le système.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {alerts.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">Aucune alerte trouvée. Tout est normal !</div>
                        ) : alerts.map((alert) => (
                            <div key={alert.id} className={`p-5 flex gap-4 transition-colors ${alert.is_read ? 'bg-gray-50 opacity-70' : 'bg-red-50/20 hover:bg-red-50/40'}`}>
                                <div className="mt-1">
                                    {alert.type === 'LOW_STOCK' ? (
                                        <ShieldAlert className="text-red-500" size={24} />
                                    ) : (
                                        <AlertTriangle className="text-orange-500" size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold ${alert.type === 'LOW_STOCK' ? 'text-red-800' : 'text-orange-800'}`}>
                                            {alert.type === 'LOW_STOCK' ? 'Alerte Rupture Critique' : 'Mouvement Inhabituel'}
                                        </h3>
                                        <span className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString('fr-FR')}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                                    
                                    {!alert.is_read && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => markAsRead(alert.id)}
                                                className="flex items-center gap-1 text-xs font-medium bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 shadow-sm"
                                            >
                                                <CheckCircle size={14} /> Marquer comme résolu
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
