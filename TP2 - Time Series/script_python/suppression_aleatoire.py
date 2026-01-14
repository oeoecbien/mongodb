# ============================================================
# Script de suppression aléatoire de données
# TP MongoDB Time Series - CETINKAYA & FADHLOUNE
# ============================================================

import pymongo
import random
import sys

# Importation de la configuration
try:
    import conf.timeseries_sensors_conf as conf
except ImportError:
    print("Erreur : 'timeseries_sensors_conf.py' introuvable.")
    sys.exit(1)

def get_db_connection():
    """Connexion à la BD."""
    if conf.username and conf.password:
        uri = f"mongodb+srv://{conf.username}:{conf.password}@{conf.server}/{conf.db}"
    else:
        uri = f"mongodb://{conf.server}:{conf.port}/{conf.db}"
    return pymongo.MongoClient(uri)[conf.db]

def supprimer_donnees_aleatoires(collection, pourcentage=20):
    """
    Supprime un pourcentage des données de façon aléatoire.
    
    Args:
        collection: Collection MongoDB
        pourcentage: Pourcentage de données à supprimer (défaut: 20%)
    """
    print(f"\n=== Suppression aléatoire de {pourcentage}% des données ===\n")
    
    # Compter le nombre total de documents
    total_docs = collection.count_documents({})
    print(f"Nombre total de documents avant suppression : {total_docs}")
    
    # Calculer le nombre de documents à supprimer
    nb_to_delete = int(total_docs * pourcentage / 100)
    print(f"Nombre de documents à supprimer : {nb_to_delete}")
    
    # Récupérer tous les _id
    print("Récupération des identifiants...")
    all_ids = list(collection.find({}, {"_id": 1}))
    
    # Sélectionner aléatoirement les documents à supprimer
    ids_to_delete = random.sample(all_ids, nb_to_delete)
    
    # Supprimer les documents sélectionnés
    print("Suppression en cours...")
    result = collection.delete_many({
        "_id": {"$in": [doc["_id"] for doc in ids_to_delete]}
    })
    
    print(f"\n✓ Documents supprimés : {result.deleted_count}")
    
    # Vérifier le nombre restant
    remaining = collection.count_documents({})
    print(f"✓ Documents restants : {remaining}")
    
    return result.deleted_count

def supprimer_par_plage_horaire(collection, heures_a_supprimer=[2, 3, 4, 14, 15]):
    """
    Supprime les données pour certaines heures spécifiques.
    Cela crée des "trous" visibles dans les graphiques.
    
    Args:
        collection: Collection MongoDB
        heures_a_supprimer: Liste des heures à supprimer (0-23)
    """
    print(f"\n=== Suppression des données pour les heures : {heures_a_supprimer} ===\n")
    
    # Compter avant
    total_before = collection.count_documents({})
    print(f"Nombre total de documents avant : {total_before}")
    
    # Pipeline pour identifier les documents à supprimer
    # On supprime les documents dont l'heure du timestamp est dans la liste
    result = collection.delete_many({
        "$expr": {
            "$in": [{"$hour": "$timestamp"}, heures_a_supprimer]
        }
    })
    
    print(f"\n✓ Documents supprimés : {result.deleted_count}")
    
    # Vérifier le nombre restant
    remaining = collection.count_documents({})
    print(f"✓ Documents restants : {remaining}")
    
    return result.deleted_count

if __name__ == "__main__":
    # Connexion à la base de données
    db = get_db_connection()
    collection = db[conf.collection]
    
    print("=" * 60)
    print("Script de suppression aléatoire de données")
    print("=" * 60)
    
    print("\nChoisissez le mode de suppression :")
    print("1. Suppression aléatoire (pourcentage)")
    print("2. Suppression par plage horaire (crée des trous visibles)")
    
    choix = input("\nVotre choix (1 ou 2) : ")
    
    if choix == "1":
        try:
            pct = float(input("Pourcentage à supprimer (ex: 20) : "))
            if 0 < pct < 100:
                confirm = input(f"\nConfirmez la suppression de {pct}% des données ? (oui/non) : ")
                if confirm.lower() == "oui":
                    supprimer_donnees_aleatoires(collection, pct)
                else:
                    print("Opération annulée.")
            else:
                print("Erreur : le pourcentage doit être entre 0 et 100.")
        except ValueError:
            print("Erreur : veuillez entrer un nombre valide.")
            
    elif choix == "2":
        print("\nHeures par défaut à supprimer : 2h, 3h, 4h, 14h, 15h")
        custom = input("Voulez-vous personnaliser ? (oui/non) : ")
        
        if custom.lower() == "oui":
            heures_str = input("Entrez les heures séparées par des virgules (ex: 2,3,4,14,15) : ")
            try:
                heures = [int(h.strip()) for h in heures_str.split(",")]
                heures = [h for h in heures if 0 <= h <= 23]
            except ValueError:
                print("Erreur : format invalide. Utilisation des heures par défaut.")
                heures = [2, 3, 4, 14, 15]
        else:
            heures = [2, 3, 4, 14, 15]
        
        confirm = input(f"\nConfirmez la suppression des données pour les heures {heures} ? (oui/non) : ")
        if confirm.lower() == "oui":
            supprimer_par_plage_horaire(collection, heures)
        else:
            print("Opération annulée.")
    else:
        print("Choix invalide.")
    
    print("\n" + "=" * 60)
    print("Terminé !")
    print("=" * 60)

