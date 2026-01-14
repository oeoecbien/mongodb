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


//1. La requête est extrêmement performante.Temps d'exécution : 10 ms (executionTimeMillis). 
// Documents lus : 2 142 (totalDocsExamined).
// Résultats renvoyés : 5 (nReturned).
// Index utilisé : Aucun (totalKeysExamined: 0), c'est un Scan de Collection (COLLSCAN), mais optimisé.



db.monitoring.aggregate([
    {
        $group: {
            _id: "$metadata.region",
            avg_cpu: { $avg: "$cpu_usage_percent" },
            count: { $sum: 1 }
        }
    },
    { $sort: { avg_cpu: -1 } }
]).explain("executionStats")


//Temps total : 8 ms (Encore plus rapide que la précédente, 
// probablement grâce au cache système ou à moins de groupes en sortie).
// Documents lus : 2 142 (Il lit toujours tous les buckets de la collection).
// Résultats finaux : 3 (Il y a donc 3 régions distinctes dans vos données).
// Tri : Effectué en mémoire vive (RAM), sans aucun problème.



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
]).explain("executionStats")


//Temps total : 28 ms (vs 8-10 ms précédemment).
// Pourquoi cette hausse ? Vous manipulez plus de données. Vous lisez 3 métriques (cpu, temp, network) + le timestamp, au lieu d'une seule métrique auparavant.
// Documents lus : 2 142 (Toujours la totalité de la collection).
// Documents générés : 168 groupes (heures), réduits à 24 par la limite.




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
]).explain("executionStats")



//Temps d'exécution : 33 ms (légère augmentation par rapport aux 28 ms précédents).
// Documents lus : 2 142 buckets (Toujours 100% de la base).
// Documents renvoyés : 8 (Vos données s'étalent donc sur 8 jours).
// Complexité : Plus élevée, car vous demandez de lire 5 colonnes différentes au lieu de 2.







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
]).explain("executionStats")


//En passant de $bucketAuto à $bucket (manuel), vous avez réactivé le puissant moteur SBE (Slot-Based Execution), visible par le retour à explainVersion: '2'.
// Cette méthode traite les règles (vos tranches de 30, 60, 90) directement sur les blocs de données compressés, sans avoir besoin de décompresser chaque mesure en mémoire.
// Le léger ralentissement (30ms vs 18ms) est juste un coût de démarrage du moteur, négligeable face au gain de stabilité sur de gros volumes.
// C'est l'approche recommandée pour la production, car elle ne fera pas exploser la RAM même avec des millions de données historiques.



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
]).explain("executionStats")

//Temps total : 18 ms.
// Buckets lus : 2 142.
// Documents traités : 8 064 (C'est le point clé !).
// Résultats : 5 (Vos 5 tranches de températures).




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
]).explain("executionStats")



//calculez une moyenne mobile sur 5 points pour "lisser" la courbe CPU et effacer les pics isolés (le bruit).
//La requête est très rapide (6 ms) grâce au "Bucket Pruning" : 
// MongoDB écarte physiquement tous les blocs de données qui ne concernent pas host_001 
// avant même de les décompresser.
//Contrairement aux agrégations globales, ici MongoDB décompresse les données sélectionnées pour les 
// trier précisément et calculer la fenêtre glissante ligne par ligne.





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
]).explain("executionStats")



//C'est une requête d'alerte classique ("Où la température a-t-elle dépassé 75°C ?") et 
// le résultat est fascinant.
// Il y a une optimisation majeure ici qui est spécifique aux Time Series : 
// le Control-Based Pruning (Élagage basé sur les statistiques).




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
]).explain("executionStats")


//C'est une requête analytique très fréquente : le calcul de KPIs (Indicateurs Clés de Performance).
// On ne cherchez pas juste des valeurs brutes, mais un ratio (Pourcentage de temps actif par heure). 
// La performance est excellente (8 ms).



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
]).explain("executionStats")


//C'est un classique des tableaux de bord de monitoring : Le "Top N" 
// (ici, le Top 3 des serveurs les plus chargés).
// L'exécution est impeccable (10 ms) et illustre parfaitement la stratégie de "Réduction Drastique".








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
]).explain("executionStats")

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
]).explain("executionStats")

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
]).explain("executionStats")

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
]).explain("executionStats")

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

