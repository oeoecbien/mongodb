// ============================================================
// TP MongoDB Time Series - Requêtes d'agrégation
// CETINKAYA & FADHLOUNE
// ============================================================

// ============================================================
// PARTIE 1 : LES 15 REQUÊTES D'AGRÉGATION
// ============================================================

// ----------------------------------------------------------
// REQUÊTE 1 : Moyenne globale du CPU par serveur
// ----------------------------------------------------------
// Objectif : Calculer l'utilisation moyenne du CPU pour chaque 
// serveur afin d'identifier les machines les plus sollicitées.

db.monitoring.aggregate([
    {
        $group: {
            _id: "$metadata.sensor_id",
            avg_cpu: { $avg: "$cpu_usage_percent" },
            min_cpu: { $min: "$cpu_usage_percent" },
            max_cpu: { $max: "$cpu_usage_percent" }
        }
    },
    { $sort: { avg_cpu: -1 } }
])

// ----------------------------------------------------------
// REQUÊTE 2 : Moyenne du CPU par région
// ----------------------------------------------------------
// Objectif : Comparer l'utilisation CPU entre les différentes 
// régions géographiques (eu-west-1, us-east-1, ap-south-1).

db.monitoring.aggregate([
    {
        $group: {
            _id: "$metadata.region",
            avg_cpu: { $avg: "$cpu_usage_percent" },
            count: { $sum: 1 }
        }
    },
    { $sort: { avg_cpu: -1 } }
])

// ----------------------------------------------------------
// REQUÊTE 3 : Agrégation par bucket temporel (par heure)
// ----------------------------------------------------------
// Objectif : Regrouper les mesures par tranches horaires pour 
// analyser l'évolution des métriques dans le temps.

db.monitoring.aggregate([
    {
        $group: {
            _id: {
                $dateTrunc: {
                    date: "$timestamp",
                    unit: "hour"
                }
            },
            avg_cpu: { $avg: "$cpu_usage_percent" },
            avg_temp: { $avg: "$temperature_celsius" },
            total_network: { $sum: "$network_in_bytes" }
        }
    },
    { $sort: { "_id": 1 } },
    { $limit: 24 }
])

// ----------------------------------------------------------
// REQUÊTE 4 : Bucket par jour avec statistiques complètes
// ----------------------------------------------------------
// Objectif : Obtenir un résumé quotidien de toutes les métriques
// pour avoir une vue d'ensemble de l'activité journalière.

db.monitoring.aggregate([
    {
        $group: {
            _id: {
                $dateTrunc: {
                    date: "$timestamp",
                    unit: "day"
                }
            },
            avg_cpu: { $avg: "$cpu_usage_percent" },
            avg_ram: { $avg: "$ram_usage_gb" },
            avg_temp: { $avg: "$temperature_celsius" },
            max_temp: { $max: "$temperature_celsius" },
            total_disk_write: { $sum: "$disk_write_mbps" },
            nb_mesures: { $sum: 1 }
        }
    },
    { $sort: { "_id": 1 } }
])

// ----------------------------------------------------------
// REQUÊTE 5 : Utilisation de $bucket pour tranches de CPU
// ----------------------------------------------------------
// Objectif : Classifier les mesures par niveau d'utilisation CPU
// (faible 0-30%, moyen 30-60%, élevé 60-90%, critique 90-100%).

db.monitoring.aggregate([
    {
        $bucket: {
            groupBy: "$cpu_usage_percent",
            boundaries: [0, 30, 60, 90, 100],
            default: "Autres",
            output: {
                count: { $sum: 1 },
                avg_temp: { $avg: "$temperature_celsius" }
            }
        }
    }
])

// ----------------------------------------------------------
// REQUÊTE 6 : $bucketAuto pour distribution automatique
// ----------------------------------------------------------
// Objectif : Laisser MongoDB créer automatiquement 5 groupes 
// équilibrés basés sur la température.

db.monitoring.aggregate([
    {
        $bucketAuto: {
            groupBy: "$temperature_celsius",
            buckets: 5,
            output: {
                count: { $sum: 1 },
                avg_cpu: { $avg: "$cpu_usage_percent" }
            }
        }
    }
])

// ----------------------------------------------------------
// REQUÊTE 7 : Moyenne mobile (window function)
// ----------------------------------------------------------
// Objectif : Calculer une moyenne mobile sur les 5 dernières 
// mesures pour lisser les variations et détecter les tendances.

db.monitoring.aggregate([
    { $match: { "metadata.sensor_id": "host_001" } },
    { $sort: { timestamp: 1 } },
    {
        $setWindowFields: {
            partitionBy: "$metadata.sensor_id",
            sortBy: { timestamp: 1 },
            output: {
                moving_avg_cpu: {
                    $avg: "$cpu_usage_percent",
                    window: { documents: [-4, 0] }
                }
            }
        }
    },
    { $limit: 50 }
])

// ----------------------------------------------------------
// REQUÊTE 8 : Détection des pics de température
// ----------------------------------------------------------
// Objectif : Identifier les moments où la température dépasse 
// un seuil critique (> 75°C) pour alerter sur la surchauffe.

db.monitoring.aggregate([
    { $match: { temperature_celsius: { $gt: 75 } } },
    {
        $group: {
            _id: "$metadata.sensor_id",
            nb_alertes: { $sum: 1 },
            max_temp: { $max: "$temperature_celsius" },
            dates_alertes: { $push: "$timestamp" }
        }
    },
    { $sort: { nb_alertes: -1 } }
])

// ----------------------------------------------------------
// REQUÊTE 9 : Pourcentage de serveurs actifs par heure
// ----------------------------------------------------------
// Objectif : Analyser la disponibilité des serveurs dans le temps
// pour mesurer le taux de disponibilité du système.

db.monitoring.aggregate([
    {
        $group: {
            _id: {
                $dateTrunc: { date: "$timestamp", unit: "hour" }
            },
            total: { $sum: 1 },
            actifs: { $sum: { $cond: ["$is_active", 1, 0] } }
        }
    },
    {
        $project: {
            _id: 1,
            pourcentage_actif: {
                $multiply: [{ $divide: ["$actifs", "$total"] }, 100]
            }
        }
    },
    { $sort: { "_id": 1 } },
    { $limit: 24 }
])

// ----------------------------------------------------------
// REQUÊTE 10 : Top 3 des serveurs les plus sollicités
// ----------------------------------------------------------
// Objectif : Identifier les 3 serveurs avec la charge CPU et RAM 
// la plus élevée pour équilibrer la charge.

db.monitoring.aggregate([
    {
        $group: {
            _id: "$metadata.sensor_id",
            avg_cpu: { $avg: "$cpu_usage_percent" },
            avg_ram: { $avg: "$ram_usage_gb" }
        }
    },
    { $sort: { avg_cpu: -1 } },
    { $limit: 3 }
])

// ----------------------------------------------------------
// REQUÊTE 11 : Corrélation CPU/Température par serveur
// ----------------------------------------------------------
// Objectif : Analyser si une utilisation CPU élevée corrèle 
// avec une température élevée (calcul moyenne + écart-type).

db.monitoring.aggregate([
    {
        $group: {
            _id: "$metadata.sensor_id",
            avg_cpu: { $avg: "$cpu_usage_percent" },
            avg_temp: { $avg: "$temperature_celsius" },
            stddev_cpu: { $stdDevPop: "$cpu_usage_percent" },
            stddev_temp: { $stdDevPop: "$temperature_celsius" }
        }
    }
])

// ----------------------------------------------------------
// REQUÊTE 12 : Trafic réseau total par région et par jour
// ----------------------------------------------------------
// Objectif : Analyser la distribution du trafic réseau par région
// pour identifier les zones à fort trafic.

db.monitoring.aggregate([
    {
        $group: {
            _id: {
                region: "$metadata.region",
                jour: { $dateTrunc: { date: "$timestamp", unit: "day" } }
            },
            total_network_bytes: { $sum: "$network_in_bytes" },
            avg_network: { $avg: "$network_in_bytes" }
        }
    },
    { $sort: { "_id.jour": 1, total_network_bytes: -1 } }
])

// ----------------------------------------------------------
// REQUÊTE 13 : Distribution des écritures disque par heure
// ----------------------------------------------------------
// Objectif : Identifier les heures de pointe pour les écritures 
// disque afin de planifier les maintenances.

db.monitoring.aggregate([
    {
        $group: {
            _id: { $hour: "$timestamp" },
            avg_disk_write: { $avg: "$disk_write_mbps" },
            max_disk_write: { $max: "$disk_write_mbps" }
        }
    },
    { $sort: { "_id": 1 } }
])

// ----------------------------------------------------------
// REQUÊTE 14 : Statistiques avec $facet (multi-résultats)
// ----------------------------------------------------------
// Objectif : Obtenir plusieurs statistiques en une seule requête
// (par région, par serveur, et globales).

db.monitoring.aggregate([
    {
        $facet: {
            "par_region": [
                { $group: { _id: "$metadata.region", count: { $sum: 1 } } }
            ],
            "par_serveur": [
                { $group: { _id: "$metadata.sensor_id", avg_cpu: { $avg: "$cpu_usage_percent" } } }
            ],
            "stats_globales": [
                {
                    $group: {
                        _id: null,
                        total_docs: { $sum: 1 },
                        avg_cpu_global: { $avg: "$cpu_usage_percent" },
                        avg_temp_global: { $avg: "$temperature_celsius" }
                    }
                }
            ]
        }
    }
])

// ----------------------------------------------------------
// REQUÊTE 15 : Rang des serveurs par utilisation RAM
// ----------------------------------------------------------
// Objectif : Classer les serveurs selon leur utilisation mémoire 
// moyenne avec la fonction de fenêtrage $rank.

db.monitoring.aggregate([
    {
        $group: {
            _id: "$metadata.sensor_id",
            avg_ram: { $avg: "$ram_usage_gb" }
        }
    },
    {
        $setWindowFields: {
            sortBy: { avg_ram: -1 },
            output: {
                rang: { $rank: {} }
            }
        }
    }
])


// ============================================================
// PARTIE 2 : VISUALISATION DU PLAN D'EXÉCUTION
// ============================================================
// Pour visualiser le plan d'exécution, ajoutez .explain() à la fin
// Exemple :

db.monitoring.aggregate([
    {
        $group: {
            _id: "$metadata.sensor_id",
            avg_cpu: { $avg: "$cpu_usage_percent" }
        }
    }
]).explain("executionStats")


// ============================================================
// PARTIE 3 : $DENSIFY - Combler les trous temporels
// ============================================================
// Objectif : Après suppression aléatoire de données, utiliser 
// $densify pour créer des documents aux timestamps manquants.

db.monitoring.aggregate([
    { $match: { "metadata.sensor_id": "host_001" } },
    {
        $densify: {
            field: "timestamp",
            partitionByFields: ["metadata.sensor_id"],
            range: {
                step: 5,
                unit: "minute",
                bounds: "full"
            }
        }
    },
    { $limit: 100 }
])


// ============================================================
// PARTIE 4 : $FILL - Remplir les valeurs manquantes
// ============================================================
// Objectif : Utiliser $fill pour interpoler les valeurs manquantes
// après l'utilisation de $densify.

// Méthode "linear" : interpolation linéaire entre les valeurs
// Méthode "locf" : Last Observation Carried Forward (dernière valeur connue)

db.monitoring.aggregate([
    { $match: { "metadata.sensor_id": "host_001" } },
    {
        $densify: {
            field: "timestamp",
            partitionByFields: ["metadata.sensor_id"],
            range: { step: 5, unit: "minute", bounds: "full" }
        }
    },
    {
        $fill: {
            sortBy: { timestamp: 1 },
            partitionByFields: ["metadata.sensor_id"],
            output: {
                cpu_usage_percent: { method: "linear" },
                temperature_celsius: { method: "locf" },
                ram_usage_gb: { method: "locf" }
            }
        }
    },
    { $limit: 100 }
])

// Variante avec valeur par défaut
db.monitoring.aggregate([
    { $match: { "metadata.sensor_id": "host_001" } },
    {
        $densify: {
            field: "timestamp",
            partitionByFields: ["metadata.sensor_id"],
            range: { step: 5, unit: "minute", bounds: "full" }
        }
    },
    {
        $fill: {
            sortBy: { timestamp: 1 },
            output: {
                cpu_usage_percent: { value: 0 },
                is_active: { value: false }
            }
        }
    },
    { $limit: 100 }
])

