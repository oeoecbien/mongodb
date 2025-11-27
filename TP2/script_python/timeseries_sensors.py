import pymongo
import random
import time
from datetime import datetime, timedelta
import sys

# Importation de la configuration
try:
    import conf.timeseries_sensors_conf as conf
except ImportError:
    print("Erreur : 'timeseries_sensors_conf.py' introuvable.")
    sys.exit(1)

# --- CONSTANTES ---
HOSTS = [f"host_{i:03d}" for i in range(1, 6)]  # 5 Serveurs
REGIONS = ["eu-west-1", "us-east-1", "ap-south-1"]

def get_db_connection():
    """Connexion à la BD."""
    if conf.username and conf.password:
        uri = f"mongodb+srv://{conf.username}:{conf.password}@{conf.server}/{conf.db}"
    else:
        uri = f"mongodb://{conf.server}:{conf.port}/{conf.db}"
    return pymongo.MongoClient(uri)[conf.db]

def init_timeseries_collection(db):
    """Crée la collection Time Series si nécessaire."""
    if conf.collection not in db.list_collection_names():
        print(f"Création de la collection TS '{conf.collection}'...")
        db.create_collection(
            conf.collection,
            timeseries={
                "timeField": "timestamp",
                "metaField": "metadata",
                "granularity": "seconds"
            }
        )

def generate_metric(host_id, timestamp=None):
    """
    Génère un document de métrique unique.
    Si timestamp est None, utilise l'heure actuelle UTC.
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
        
    return {
        "metadata": {
            "sensor_id": host_id,
            "region": random.choice(REGIONS), # Note: En prod, un host ne change pas de région, mais ici c'est pour l'exemple
            "type": "server_node"
        },
        "timestamp": timestamp,
        "cpu_usage_percent": round(random.uniform(10, 90), 2),
        "ram_usage_gb": round(random.uniform(1, 16), 2),
        "temperature_celsius": round(random.gauss(60, 10), 1),
        "disk_write_mbps": round(random.expovariate(0.2), 2),
        "network_in_bytes": random.randint(1000, 500000),
        "is_active": random.random() > 0.01
    }

def run_realtime_mode(collection):
    """Mode infini : génère des données en temps réel."""
    print(f"\n--- Mode TEMPS RÉEL démarré pour {len(HOSTS)} hosts ---")
    print("CTRL+C pour arrêter.")
    try:
        while True:
            batch = [generate_metric(h) for h in HOSTS]
            collection.insert_many(batch)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Données insérées.")
            time.sleep(1) # Pause de 1 seconde
    except KeyboardInterrupt:
        print("\nArrêt du mode temps réel.")

def run_backfill_mode(collection, days=1, step_seconds=60):
    """
    Mode historique : génère des données pour les X derniers jours.
    step_seconds : intervalle entre chaque point (ex: 60s = 1 point par minute)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    current_date = start_date
    batch_buffer = []
    total_inserted = 0
    BATCH_SIZE = 5000 # On insère par paquets de 5000 pour la performance
    
    print(f"\n--- Mode BACKFILL démarré ---")
    print(f"Génération de données du {start_date} au {end_date}")
    print(f"Intervalle: {step_seconds}s | Hosts: {len(HOSTS)}")
    
    try:
        while current_date < end_date:
            # Créer un point pour chaque host à cet instant T
            for host in HOSTS:
                metric = generate_metric(host, timestamp=current_date)
                batch_buffer.append(metric)
            
            # Gestion du buffer d'insertion
            if len(batch_buffer) >= BATCH_SIZE:
                collection.insert_many(batch_buffer)
                total_inserted += len(batch_buffer)
                sys.stdout.write(f"\rDocuments insérés : {total_inserted}...")
                sys.stdout.flush()
                batch_buffer = [] # Reset buffer
            
            # Avancer dans le temps
            current_date += timedelta(seconds=step_seconds)
            
        # Insérer le reste du buffer s'il en reste
        if batch_buffer:
            collection.insert_many(batch_buffer)
            total_inserted += len(batch_buffer)
            
        print(f"\n\nTerminé ! Total documents générés : {total_inserted}")
        
    except KeyboardInterrupt:
        print("\nBackfill interrompu par l'utilisateur.")

if __name__ == "__main__":
    db = get_db_connection()
    init_timeseries_collection(db)
    coll = db[conf.collection]
    
    print("Choisissez le mode de génération :")
    print("1. Temps Réel (boucle infinie, 1 point/sec)")
    print("2. Backfill (Historique passé)")
    
    choix = input("Votre choix (1 ou 2) : ")
    
    if choix == "1":
        run_realtime_mode(coll)
    elif choix == "2":
        try:
            nb_jours = float(input("Combien de jours d'historique ? (ex: 7) : "))
            intervalle = int(input("Intervalle entre les mesures en secondes ? (ex: 60) : "))
            run_backfill_mode(coll, days=nb_jours, step_seconds=intervalle)
        except ValueError:
            print("Erreur : veuillez entrer des nombres valides.")
    else:
        print("Choix invalide.")
