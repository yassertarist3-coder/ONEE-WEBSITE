import { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar, FileSpreadsheet } from 'lucide-react';
import Layout from '../../components/Layout';
import apiClient from '../../api/axios';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);

    const handleDownload = (type) => {
        // Mock download functionality since we don't have Laravel Excel/PDF installed yet
        alert(`Le téléchargement du rapport "${type}" va commencer. (Fonctionnalité en cours d'intégration côté serveur)`);
    };

    const reports = [
        {
            id: 'daily_summary',
            title: 'Résumé Quotidien des Stocks',
            description: 'Valeur du stock d\'ouverture et de fermeture, total des entrées et sorties, changements nets.',
            icon: <Calendar className="text-blue-500" size={24} />,
            color: 'bg-blue-50 border-blue-100'
        },
        {
            id: 'movement_history',
            title: 'Historique Détaillé des Mouvements',
            description: 'Rapport complet filtrable par date, produit, type de mouvement et utilisateur.',
            icon: <FileText className="text-indigo-500" size={24} />,
            color: 'bg-indigo-50 border-indigo-100'
        },
        {
            id: 'inventory_valuation',
            title: 'Valorisation de l\'Inventaire',
            description: 'Valeur actuelle par produit, totaux par catégorie et tendances historiques.',
            icon: <FileSpreadsheet className="text-green-500" size={24} />,
            color: 'bg-green-50 border-green-100'
        },
        {
            id: 'supplier_performance',
            title: 'Performance des Fournisseurs',
            description: 'Analyse des commandes, délais de livraison moyens et dépenses par fournisseur.',
            icon: <Filter className="text-orange-500" size={24} />,
            color: 'bg-orange-50 border-orange-100'
        }
    ];

    return (
        <Layout>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Rapports & Exports (Aide à la Décision)</h1>
                        <p className="text-gray-500 mt-1">Générez des rapports détaillés pour analyser la performance de votre stock.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between ${report.color} bg-opacity-50`}>
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        {report.icon}
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">{report.title}</h2>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">{report.description}</p>
                            </div>
                            
                            <div className="flex gap-3 mt-4">
                                <button 
                                    onClick={() => handleDownload(`${report.id}_pdf`)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
                                >
                                    <Download size={16} /> PDF
                                </button>
                                <button 
                                    onClick={() => handleDownload(`${report.id}_excel`)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 border border-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
                                >
                                    <FileSpreadsheet size={16} /> Excel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
