<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Consumable;
use App\Models\StockMovement;
use App\Models\Alert;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function getOverview()
    {
        $totalStockValue = DB::table('consumables')
            ->where('is_active', true)
            ->sum('stock_quantity'); // Assuming unit_price doesn't exist, using qty as placeholder for value
            
        $totalProducts = Consumable::where('is_active', true)->where('stock_quantity', '>', 0)->count();
        
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        $movementsToday = StockMovement::where('created_at', '>=', $today)->count();
        $movementsThisWeek = StockMovement::where('created_at', '>=', $thisWeek)->count();
        $movementsThisMonth = StockMovement::where('created_at', '>=', $thisMonth)->count();

        $lowStockCount = Consumable::whereColumn('stock_quantity', '<=', 'threshold')->count();
        
        $totalActive = Consumable::where('is_active', true)->count();
        $healthScore = $totalActive > 0 ? max(0, 100 - (($lowStockCount / $totalActive) * 100)) : 100;

        return response()->json([
            'totalValue' => $totalStockValue,
            'totalProducts' => $totalProducts,
            'movementsToday' => $movementsToday,
            'movementsThisWeek' => $movementsThisWeek,
            'movementsThisMonth' => $movementsThisMonth,
            'lowStockCount' => $lowStockCount,
            'healthScore' => round($healthScore)
        ]);
    }

    public function getTopConsumers()
    {
        $topConsumers = DB::table('stock_movements')
            ->where('type', 'out')
            ->select(
                'recipient as name',
                'entity',
                'ville',
                DB::raw('SUM(ABS(quantity)) as total_consumed_items'),
                DB::raw('COUNT(id) as total_requests')
            )
            ->whereNotNull('recipient')
            ->groupBy('recipient', 'entity', 'ville')
            ->orderByDesc('total_consumed_items')
            ->take(5)
            ->get();

        return response()->json($topConsumers);
    }

    public function getTopProducts()
    {
        $topProducts = DB::table('stock_movements')
            ->join('consumables', 'stock_movements.consumable_id', '=', 'consumables.id')
            ->select(
                'consumables.name',
                DB::raw('SUM(ABS(stock_movements.quantity)) as total_quantity')
            )
            ->groupBy('consumables.id', 'consumables.name')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get();

        return response()->json($topProducts);
    }

    public function getMovementTrends()
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $trends = DB::table('stock_movements')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as total_in'),
                DB::raw('SUM(CASE WHEN type = "out" THEN ABS(quantity) ELSE 0 END) as total_out')
            )
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($trends);
    }

    public function getLiveMonitoring()
    {
        $recentMovements = StockMovement::with('consumable')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'type' => $m->type,
                    'quantity' => abs($m->quantity),
                    'product_name' => $m->consumable ? $m->consumable->name : 'Inconnu',
                    'recipient' => $m->recipient,
                    'reason' => $m->reason,
                    'date' => $m->created_at->diffForHumans(),
                    'timestamp' => $m->created_at
                ];
            });

        $lowStockItems = Consumable::whereColumn('stock_quantity', '<=', 'threshold')
            ->select('id', 'name', 'stock_quantity', 'threshold')
            ->get();

        // Count red/orange alerts
        $alertsCount = Alert::where('is_read', false)->count();
        $movementsToday = StockMovement::where('created_at', '>=', Carbon::today())->count();

        return response()->json([
            'recentMovements' => $recentMovements,
            'lowStockAlerts' => $lowStockItems,
            'stats' => [
                'alertsCount' => $alertsCount,
                'movementsToday' => $movementsToday,
                'atRiskProducts' => count($lowStockItems),
                'supplierDelays' => 0 // Mocked
            ]
        ]);
    }

    public function getAlerts()
    {
        // 1. LOW STOCK ALERTS
        $lowStocks = Consumable::whereColumn('stock_quantity', '<=', 'threshold')->get();
        foreach($lowStocks as $item) {
            $exists = Alert::where('consumable_id', $item->id)->where('type', 'LOW_STOCK')->where('is_read', false)->exists();
            if (!$exists) {
                Alert::create([
                    'type' => 'LOW_STOCK',
                    'consumable_id' => $item->id,
                    'message' => "⚠️ {$item->name} - Seulement {$item->stock_quantity} unités restantes. (Seuil: {$item->threshold})"
                ]);
            }
        }

        // 2. UNUSUAL QUANTITY ALERTS (Mocking by checking if any recent movement > 50)
        $unusualMovements = StockMovement::where('created_at', '>=', Carbon::now()->subHour())
                                        ->where('quantity', '>', 50)
                                        ->get();
        foreach($unusualMovements as $mvt) {
            $exists = Alert::where('consumable_id', $mvt->consumable_id)->where('type', 'UNUSUAL_QUANTITY')->where('is_read', false)->exists();
            if (!$exists && $mvt->consumable) {
                Alert::create([
                    'type' => 'UNUSUAL_QUANTITY',
                    'consumable_id' => $mvt->consumable_id,
                    'message' => "⚠️ Quantité inhabituelle: {$mvt->quantity} unités de {$mvt->consumable->name} déplacées."
                ]);
            }
        }

        $alerts = Alert::with('consumable')->orderBy('created_at', 'desc')->take(50)->get();
        return response()->json($alerts);
    }

    public function markAlertAsRead($id)
    {
        $alert = Alert::findOrFail($id);
        $alert->update([
            'is_read' => true,
            'read_at' => Carbon::now()
        ]);

        return response()->json(['message' => 'Alerte marquée comme lue']);
    }

    public function getInsights()
    {
        // Mocked AI Insights
        return response()->json([
            [
                'type' => 'reorder',
                'title' => 'Recommandation de Réapprovisionnement',
                'message' => 'Commandez 200 unités de "Papier A4" (Délai fournisseur: 5 jours).'
            ],
            [
                'type' => 'trend',
                'title' => 'Analyse des Tendances',
                'message' => 'La demande pour "Cartouche Encre" a augmenté de 40% ce mois-ci.'
            ],
            [
                'type' => 'cost',
                'title' => 'Optimisation des Coûts',
                'message' => 'Le produit "Stylo Bleu" a 45 jours de stock. Réduisez les commandes de 30%.'
            ],
            [
                'type' => 'risk',
                'title' => 'Alerte de Risque',
                'message' => '3 articles sont actuellement à un niveau critique simultanément.'
            ]
        ]);
    }

    public function exportDailySummary()
    {
        $today = Carbon::today();
        $movements = StockMovement::with('consumable')->where('created_at', '>=', $today)->get();
        $filename = 'resume_quotidien_' . date('Y-m-d') . '.csv';
        return $this->streamCsv($filename, ['ID', 'Type', 'Article', 'Quantite', 'Raison', 'Destinataire', 'Date'], $movements->map(function($m) {
            return [
                $m->id, 
                $m->type == 'in' ? 'Entree' : 'Sortie', 
                $m->consumable ? $m->consumable->name : 'N/A', 
                $m->quantity, 
                $m->reason, 
                $m->recipient, 
                $m->created_at
            ];
        }));
    }

    public function exportInventory()
    {
        $consumables = Consumable::orderBy('name')->get();
        $filename = 'valorisation_inventaire_' . date('Y-m-d') . '.csv';
        return $this->streamCsv($filename, ['Reference', 'Article', 'Stock Actuel', 'Seuil Alerte', 'Unite'], $consumables->map(function($c) {
            return [
                $c->reference, 
                $c->name, 
                $c->stock_quantity, 
                $c->threshold, 
                $c->unit
            ];
        }));
    }

    public function exportMovements()
    {
        $movements = StockMovement::with('consumable')->orderBy('created_at', 'desc')->get();
        $filename = 'historique_global_' . date('Y-m-d') . '.csv';
        return $this->streamCsv($filename, ['ID', 'Type', 'Article', 'Quantite', 'Raison', 'Destinataire', 'Ville', 'Entite', 'Date'], $movements->map(function($m) {
            return [
                $m->id, 
                $m->type == 'in' ? 'Entree' : 'Sortie', 
                $m->consumable ? $m->consumable->name : 'N/A', 
                abs($m->quantity), 
                $m->reason, 
                $m->recipient, 
                $m->ville, 
                $m->entity, 
                $m->created_at
            ];
        }));
    }

    private function streamCsv($filename, $headers, $data)
    {
        $httpHeaders = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        $callback = function() use ($headers, $data) {
            $file = fopen('php://output', 'w');
            fprintf($file, "\xEF\xBB\xBF"); // BOM for UTF-8 Excel compatibility
            fputcsv($file, $headers, ';');
            
            if (count($data) === 0) {
                $emptyRow = array_fill(0, count($headers), '');
                $emptyRow[0] = 'Aucune donnee enregistree pour cette periode';
                fputcsv($file, $emptyRow, ';');
            } else {
                foreach ($data as $row) {
                    fputcsv($file, is_array($row) ? $row : $row->toArray(), ';');
                }
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $httpHeaders);
    }
}
