# Travaux Pratiques MongoDB - Base de données E-commerce

## Objectifs pédagogiques

À l'issue de ce TP, vous serez capable de :
- Effectuer des requêtes complexes avec `find()` et des opérateurs de comparaison
- Utiliser l'Aggregation Framework pour des analyses de données
- Modifier et supprimer des documents
- Modéliser des relations entre collections
- Gérer des transactions multi-collections
- Valider des données avec JSON Schema
- Créer et optimiser des index
- Réaliser des analyses statistiques avancées

**Durée estimée** : 3-4 heures

---

## Partie 1 : Préparation de l'environnement

### 1.1 Création de la base de données

```javascript
// Se connecter à MongoDB
// Dans le shell MongoDB ou MongoDB Compass

// Créer et utiliser la base de données
use bdecommerce
```

### 1.2 Insertion des données initiales

#### Collection `produits`

```javascript
db.produits.insertMany([
  {
    _id: 1,
    nom: "Laptop Gaming Pro",
    categorie: "Informatique",
    prix: 1299.99,
    stock: 15,
    fabricant: "TechCorp",
    specifications: {
      processeur: "Intel i7",
      ram: "16GB",
      stockage: "512GB SSD"
    },
    tags: ["gaming", "performance", "portable"],
    note_moyenne: 4.5,
    notes_clients: [5, 4, 5, 4, 5, 4, 5],
    date_ajout: ISODate("2024-01-15"),
    disponible: true
  },
  {
    _id: 2,
    nom: "Smartphone Ultra",
    categorie: "Téléphonie",
    prix: 899.99,
    stock: 30,
    fabricant: "MobileTech",
    specifications: {
      ecran: "6.5 pouces",
      batterie: "5000mAh",
      stockage: "256GB"
    },
    tags: ["smartphone", "premium", "photo"],
    note_moyenne: 4.2,
    notes_clients: [4, 4, 5, 4, 4, 5],
    date_ajout: ISODate("2024-02-10"),
    disponible: true
  },
  {
    _id: 3,
    nom: "Écran 4K 27 pouces",
    categorie: "Informatique",
    prix: 449.99,
    stock: 8,
    fabricant: "DisplayPro",
    specifications: {
      resolution: "3840x2160",
      frequence: "144Hz",
      type: "IPS"
    },
    tags: ["écran", "4K", "gaming"],
    note_moyenne: 4.7,
    notes_clients: [5, 5, 4, 5, 5],
    date_ajout: ISODate("2024-01-20"),
    disponible: true
  },
  {
    _id: 4,
    nom: "Casque Audio Sans Fil",
    categorie: "Audio",
    prix: 199.99,
    stock: 25,
    fabricant: "SoundMax",
    specifications: {
      autonomie: "30h",
      reduction_bruit: true,
      bluetooth: "5.0"
    },
    tags: ["casque", "sans-fil", "audio"],
    note_moyenne: 4.3,
    notes_clients: [4, 5, 4, 4, 5],
    date_ajout: ISODate("2024-03-05"),
    disponible: true
  },
  {
    _id: 5,
    nom: "Tablette Pro 12",
    categorie: "Informatique",
    prix: 799.99,
    stock: 12,
    fabricant: "TechCorp",
    specifications: {
      ecran: "12.9 pouces",
      processeur: "M2",
      stockage: "256GB"
    },
    tags: ["tablette", "pro", "création"],
    note_moyenne: 4.6,
    notes_clients: [5, 5, 4, 5, 4, 5],
    date_ajout: ISODate("2024-02-28"),
    disponible: true
  },
  {
    _id: 6,
    nom: "Clavier Mécanique RGB",
    categorie: "Informatique",
    prix: 149.99,
    stock: 0,
    fabricant: "KeyMaster",
    specifications: {
      switches: "Cherry MX",
      layout: "AZERTY",
      rgb: true
    },
    tags: ["clavier", "mécanique", "gaming"],
    note_moyenne: 4.4,
    notes_clients: [4, 5, 4, 5, 4],
    date_ajout: ISODate("2024-01-10"),
    disponible: false
  },
  {
    _id: 7,
    nom: "Souris Gaming",
    categorie: "Informatique",
    prix: 79.99,
    stock: 50,
    fabricant: "KeyMaster",
    specifications: {
      dpi: "16000",
      boutons: 8,
      sans_fil: false
    },
    tags: ["souris", "gaming", "précision"],
    note_moyenne: 4.1,
    notes_clients: [4, 4, 4, 5, 4],
    date_ajout: ISODate("2024-03-15"),
    disponible: true
  },
  {
    _id: 8,
    nom: "Enceinte Bluetooth",
    categorie: "Audio",
    prix: 129.99,
    stock: 20,
    fabricant: "SoundMax",
    specifications: {
      puissance: "40W",
      autonomie: "20h",
      resistance_eau: "IPX7"
    },
    tags: ["enceinte", "bluetooth", "portable"],
    note_moyenne: 4.0,
    notes_clients: [4, 4, 4, 4],
    date_ajout: ISODate("2024-02-20"),
    disponible: true
  }
])
```

#### Collection `clients`

```javascript
db.clients.insertMany([
  {
    _id: 1,
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@email.com",
    telephone: "0612345678",
    adresse: {
      rue: "123 Rue de la République",
      code_postal: "75001",
      ville: "Paris",
      pays: "France"
    },
    date_inscription: ISODate("2023-06-15"),
    statut: "actif"
  },
  {
    _id: 2,
    nom: "Martin",
    prenom: "Marie",
    email: "marie.martin@email.com",
    telephone: "0698765432",
    adresse: {
      rue: "45 Avenue des Champs",
      code_postal: "69001",
      ville: "Lyon",
      pays: "France"
    },
    date_inscription: ISODate("2023-08-20"),
    statut: "actif"
  },
  {
    _id: 3,
    nom: "Bernard",
    prenom: "Pierre",
    email: "pierre.bernard@email.com",
    telephone: "0654321098",
    adresse: {
      rue: "78 Boulevard Voltaire",
      code_postal: "13001",
      ville: "Marseille",
      pays: "France"
    },
    date_inscription: ISODate("2024-01-10"),
    statut: "actif"
  },
  {
    _id: 4,
    nom: "Dubois",
    prenom: "Sophie",
    email: "sophie.dubois@email.com",
    telephone: "0678901234",
    adresse: {
      rue: "12 Rue de la Paix",
      code_postal: "33000",
      ville: "Bordeaux",
      pays: "France"
    },
    date_inscription: ISODate("2023-11-05"),
    statut: "inactif"
  },
  {
    _id: 5,
    nom: "Moreau",
    prenom: "Luc",
    email: "luc.moreau@email.com",
    telephone: "0611121314",
    adresse: {
      rue: "56 Place Bellecour",
      code_postal: "69002",
      ville: "Lyon",
      pays: "France"
    },
    date_inscription: ISODate("2024-02-14"),
    statut: "actif"
  }
])
```

#### Collection `commandes`

```javascript
db.commandes.insertMany([
  {
    _id: 1,
    client_id: 1,
    date_commande: ISODate("2024-03-01"),
    produits: [
      { produit_id: 1, quantite: 1, prix_unitaire: 1299.99 },
      { produit_id: 3, quantite: 1, prix_unitaire: 449.99 }
    ],
    total_ht: 1749.98,
    tva: 349.996,
    total_ttc: 2099.976,
    statut: "livrée",
    mode_livraison: "express"
  },
  {
    _id: 2,
    client_id: 2,
    date_commande: ISODate("2024-03-05"),
    produits: [
      { produit_id: 2, quantite: 1, prix_unitaire: 899.99 },
      { produit_id: 4, quantite: 2, prix_unitaire: 199.99 }
    ],
    total_ht: 1299.97,
    tva: 259.994,
    total_ttc: 1559.964,
    statut: "en_cours",
    mode_livraison: "standard"
  },
  {
    _id: 3,
    client_id: 1,
    date_commande: ISODate("2024-03-10"),
    produits: [
      { produit_id: 5, quantite: 1, prix_unitaire: 799.99 },
      { produit_id: 7, quantite: 1, prix_unitaire: 79.99 }
    ],
    total_ht: 879.98,
    tva: 175.996,
    total_ttc: 1055.976,
    statut: "livrée",
    mode_livraison: "standard"
  },
  {
    _id: 4,
    client_id: 3,
    date_commande: ISODate("2024-03-12"),
    produits: [
      { produit_id: 4, quantite: 1, prix_unitaire: 199.99 },
      { produit_id: 8, quantite: 1, prix_unitaire: 129.99 }
    ],
    total_ht: 329.98,
    tva: 65.996,
    total_ttc: 395.976,
    statut: "en_cours",
    mode_livraison: "express"
  },
  {
    _id: 5,
    client_id: 5,
    date_commande: ISODate("2024-03-15"),
    produits: [
      { produit_id: 1, quantite: 1, prix_unitaire: 1299.99 },
      { produit_id: 3, quantite: 2, prix_unitaire: 449.99 },
      { produit_id: 7, quantite: 1, prix_unitaire: 79.99 }
    ],
    total_ht: 2279.96,
    tva: 455.992,
    total_ttc: 2735.952,
    statut: "en_attente",
    mode_livraison: "express"
  },
  {
    _id: 6,
    client_id: 2,
    date_commande: ISODate("2024-03-18"),
    produits: [
      { produit_id: 2, quantite: 1, prix_unitaire: 899.99 }
    ],
    total_ht: 899.99,
    tva: 179.998,
    total_ttc: 1079.988,
    statut: "livrée",
    mode_livraison: "standard"
  }
])
```

---

## Partie 2 : Requêtes simples avec find()

### Exercice 2.1 : Comparateurs de base

**Objectif** : Maîtriser les opérateurs de comparaison

#### Questions

1. Afficher tous les produits dont le prix est supérieur à 500 € (sans l'ID)
2. Afficher les produits dont le prix est compris entre 100 € et 300 €
3. Afficher les produits dont le stock est inférieur ou égal à 15
4. Afficher les produits qui ne sont pas disponibles
5. Afficher les produits de la catégorie "Informatique" ou "Audio"

#### Solutions

**1. Produits avec prix > 500 €**

```javascript
db.produits.find({prix: {$gt: 500}}, {_id: 0})
```

**2. Produits avec prix entre 100 € et 300 €**

```javascript
db.produits.find({prix: {$gte: 100, $lte: 300}})
```

**3. Produits avec stock ≤ 15**

```javascript
db.produits.find({stock: {$lte: 15}})
```

**4. Produits non disponibles**

```javascript
db.produits.find({disponible: false})
```

**5. Produits de catégorie "Informatique" ou "Audio"**

```javascript
db.produits.find({categorie: {$in: ["Informatique", "Audio"]}})
```

### Exercice 2.2 : Opérateurs avancés

**Objectif** : Utiliser les opérateurs `$in`, `$nin`, `$ne`

#### Questions

1. Afficher les produits fabriqués par "TechCorp" ou "SoundMax"
2. Afficher les produits qui ne sont pas fabriqués par "KeyMaster"
3. Afficher les produits dont le stock n'est pas égal à 0

#### Solutions

**1. Produits de "TechCorp" ou "SoundMax"**

```javascript
db.produits.find({fabricant: {$in: ["TechCorp", "SoundMax"]}})
```

**2. Produits non fabriqués par "KeyMaster"**

```javascript
db.produits.find({fabricant: {$nin: ["KeyMaster"]}})
```

**3. Produits avec stock ≠ 0**

```javascript
db.produits.find({stock: {$ne: 0}})
```

### Exercice 2.3 : Tests d'existence et regex

**Objectif** : Filtrer selon la présence de champs et utiliser les expressions régulières

#### Questions

1. Afficher les produits qui ont un champ `note_moyenne`
2. Afficher les produits dont le nom contient "Gaming" (insensible à la casse)
3. Afficher les produits dont le nom commence par "S" ou "É"

#### Solutions

**1. Produits avec champ `note_moyenne`**

```javascript
db.produits.find({'note_moyenne': {$exists: true}})
```

**2. Produits avec "Gaming" dans le nom (insensible à la casse)**

```javascript
db.produits.find({nom: /Gaming/i})
```

**3. Produits dont le nom commence par "S" ou "É"**

```javascript
db.produits.find({$or: [{nom: /^S/}, {nom: /^É/}]})
```

### Exercice 2.4 : Projection et tri

**Objectif** : Sélectionner des champs et trier les résultats

#### Questions

1. Afficher uniquement le nom et le prix des produits, triés par prix décroissant
2. Afficher le nom, la catégorie et le fabricant des produits disponibles, triés par nom
3. Afficher les 3 produits les plus chers (nom et prix uniquement)

#### Solutions

**1. Nom et prix, triés par prix décroissant**

```javascript
db.produits.find({}, {nom: 1, prix: 1, _id: 0}).sort({prix: -1})
```

**2. Produits disponibles : nom, catégorie, fabricant, triés par nom**

```javascript
db.produits.find(
  {disponible: true}, 
  {nom: 1, categorie: 1, fabricant: 1, _id: 0}
).sort({nom: 1})
```

**3. Top 3 des produits les plus chers**

```javascript
db.produits.find({}, {nom: 1, prix: 1, _id: 0})
  .sort({prix: -1})
  .limit(3)
```

### Exercice 2.5 : Pagination

**Objectif** : Implémenter la pagination

#### Question

1. Afficher les produits de la page 2 (5 produits par page), triés par date d'ajout décroissante

#### Solution

```javascript
db.produits.find({})
  .sort({date_ajout: -1})
  .skip(5)
  .limit(5)
```

---

## Partie 3 : Aggregation Framework

### Exercice 3.1 : Opérations de base avec `$group`

**Objectif** : Comprendre les groupements simples

#### Questions

1. Calculer le nombre de produits par catégorie
2. Calculer le prix moyen par fabricant
3. Calculer le stock total par catégorie
4. Afficher le produit le plus cher de chaque catégorie

#### Solutions

**1. Nombre de produits par catégorie**

```javascript
db.produits.aggregate([
  {
    $group: {
      _id: "$categorie",
      nombreProduits: { $sum: 1 }
    }
  }
])
```

**2. Prix moyen par fabricant**

```javascript
db.produits.aggregate([
  {
    $group: {
      _id: "$fabricant",
      prixMoyen: { $avg: "$prix" }
    }
  }
])
```

**3. Stock total par catégorie**

```javascript
db.produits.aggregate([
  {
    $group: {
      _id: "$categorie",
      stockTotal: { $sum: "$stock" }
    }
  }
])
```

**4. Produit le plus cher de chaque catégorie**

*Option 1 : Document complet*

```javascript
db.produits.aggregate([
  { $sort: { prix: -1 } },
  {
    $group: {
      _id: "$categorie",
      produitLePlusCher: { $first: "$$ROOT" }
    }
  }
])
```

*Option 2 : Champs sélectionnés*

```javascript
db.produits.aggregate([
  { $sort: { prix: -1 } },
  {
    $group: {
      _id: "$categorie",
      nom: { $first: "$nom" },
      prix: { $first: "$prix" },
      fabricant: { $first: "$fabricant" },
      stock: { $first: "$stock" }
    }
  }
])
```

### Exercice 3.2 : Utilisation de `$unwind`

**Objectif** : Déplier les tableaux pour les analyser

1. Calculer la note moyenne réelle à partir du tableau `notes_clients` (tous produits confondus)

```javascript
db.produits.aggregate([
  { $unwind: "$notes_clients" },
  { $group: { _id: null, noteMoyenneGlobale: { $avg: "$notes_clients" } } }
])
```

2. Calculer la note moyenne par produit à partir du tableau `notes_clients`

```javascript
db.produits.aggregate([
  { $unwind: "$notes_clients" },
  { 
    $group: {
      _id: "$_id",
      nom: { $first: "$nom" },
      noteMoyenne: { $avg: "$notes_clients" }
    }
  }
])
```

3. Afficher tous les tags distincts utilisés dans les produits

```javascript
db.produits.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags" } }
])
```

ou triés : 

```javascript
db.produits.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags" } },
  { $sort: { _id: 1 } }
])
```

4. Compter le nombre de produits par tag

```javascript
db.produits.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags", nombreProduits: { $sum: 1 } } },
  { $sort: { nombreProduits: -1 } }
])
```

### Exercice 3.3 : Transformation avec `$project`

**Objectif** : Créer et transformer des champs

1. Créer une vue avec : nom, catégorie, prix TTC (prix * 1.20), et stock

```javascript
db.produits.aggregate([
  { 
    $project: {
      _id: 0,
      nom: 1,
      categorie: 1,
      prixTTC: { $multiply: ["$prix", 1.20] },
      stock: 1
    }
  }
])
```

2. Calculer le nombre de jours depuis l'ajout du produit (utiliser `$subtract` avec la date actuelle)

```javascript
db.produits.aggregate([
  {
    $project: {
      nom: 1,
      date_ajout: 1,
      joursDepuisAjout: {
        $divide: [
          { $subtract: [ new Date(), "$date_ajout" ] },
          1000 * 60 * 60 * 24  // conversion ms → jours
        ]
      }
    }
  }
])
```

3. Créer un champ `prix_categorie` qui combine le prix et la catégorie (ex: "1299.99 - Informatique")

```javascript
db.produits.aggregate([
  {
    $project: {
      nom: 1,
      prix: 1,
      categorie: 1,
      prix_categorie: {
        $concat: [
          { $toString: "$prix" },
          " - ",
          "$categorie"
        ]
      }
    }
  }
])
```

### Exercice 3.4 : Groupements composés

**Objectif** : Grouper par plusieurs critères

1. Calculer le prix moyen par catégorie et par fabricant

```javascript
db.produits.aggregate([
  { 
    $group: {
      _id: { categorie: "$categorie", fabricant: "$fabricant" },
      prixMoyen: { $avg: "$prix" }
    }
  }
])
```

2. Compter le nombre de produits par catégorie et par statut de disponibilité

```javascript
db.produits.aggregate([
  {
    $group: {
      _id: { categorie: "$categorie", disponible: "$disponible" },
      nombreProduits: { $sum: 1 }
    }
  }
])
```

### Exercice 3.5 : Expressions conditionnelles

**Objectif** : Utiliser `$cond` pour des calculs conditionnels

1. Créer un champ `stock_status` :
   - "Rupture" si stock = 0
   - "Faible" si stock < 10
   - "Normal" sinon

```javascript
db.produits.aggregate([
  {
    $project: {
      nom: 1,
      stock: 1,
      stock_status: {
        $cond: [
          { $eq: ["$stock", 0] },        // si stock = 0
          "Rupture",
          {
            $cond: [
              { $lt: ["$stock", 10] },   // sinon si stock < 10
              "Faible",
              "Normal"                   // sinon
            ]
          }
        ]
      }
    }
  }
])
```

2. Calculer un champ `prix_categorie` :
   - "Premium" si prix >= 1000
   - "Moyen" si prix >= 500
   - "Économique" sinon

```javascript
db.produits.aggregate([
  {
    $project: {
      nom: 1,
      prix: 1,
      prix_categorie: {
        $cond: [
          { $gte: ["$prix", 1000] },     // prix >= 1000
          "Premium",
          {
            $cond: [
              { $gte: ["$prix", 500] },  // prix >= 500
              "Moyen",
              "Économique"               // sinon
            ]
          }
        ]
      }
    }
  }
])
```

---

## Partie 4 : Analyses de commandes

### Exercice 4.1 : Analyses de base

**Objectif** : Analyser les données de commandes

#### Questions

1. Calculer le chiffre d'affaires total (TTC) de toutes les commandes
2. Calculer le chiffre d'affaires par statut de commande
3. Calculer le nombre de commandes par client
4. Calculer le panier moyen (montant moyen par commande)

#### Solutions

**1. CA total (TTC)**

```javascript
db.commandes.aggregate([
  {
    $group: {
      _id: null,
      ca_total: { $sum: "$total_ttc" }
    }
  }
])
```

**2. CA par statut de commande**

```javascript
db.commandes.aggregate([
  {
    $group: {
      _id: "$statut",
      ca_total: { $sum: "$total_ttc" }
    }
  },
  {
    $sort: { ca_total: -1 }
  }
])
```

**3. Nombre de commandes par client**

```javascript
db.commandes.aggregate([
  {
    $group: {
      _id: "$client_id",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  }
])
```

**4. Panier moyen**

```javascript
db.commandes.aggregate([
  {
    $group: {
      _id: null,
      panier_moyen: { $avg: "$total_ttc" }
    }
  }
])
```

### Exercice 4.2 : Analyses avec `$unwind`

**Objectif** : Analyser les produits dans les commandes

#### Questions

1. Calculer le chiffre d'affaires par produit (en utilisant `$unwind` sur le tableau `produits`)
2. Calculer la quantité totale vendue par produit
3. Trouver le produit le plus vendu (en quantité)
4. Calculer le revenu moyen par produit

#### Solutions

**1. CA par produit**

```javascript
db.commandes.aggregate([
  {
    $unwind: "$produits"
  },
  {
    $group: {
      _id: "$produits.produit_id",
      ca_total: {
        $sum: {
          $multiply: ["$produits.quantite", "$produits.prix_unitaire"]
        }
      }
    }
  },
  {
    $sort: { ca_total: -1 }
  }
])
```

**2. Quantité totale vendue par produit**

```javascript
db.commandes.aggregate([
  {
    $unwind: "$produits"
  },
  {
    $group: {
      _id: "$produits.produit_id",
      quantite_totale: { $sum: "$produits.quantite" }
    }
  },
  {
    $sort: { quantite_totale: -1 }
  }
])
```

**3. Produit le plus vendu (quantité)**

```javascript
db.commandes.aggregate([
  {
    $unwind: "$produits"
  },
  {
    $group: {
      _id: "$produits.produit_id",
      quantite_totale: { $sum: "$produits.quantite" }
    }
  },
  {
    $sort: { quantite_totale: -1 }
  },
  {
    $limit: 1
  }
])
```

**4. Revenu moyen par produit**

```javascript
db.commandes.aggregate([
  {
    $unwind: "$produits"
  },
  {
    $group: {
      _id: "$produits.produit_id",
      revenu_moyen: {
        $avg: {
          $multiply: ["$produits.quantite", "$produits.prix_unitaire"]
        }
      }
    }
  }
])
```

### Exercice 4.3 : Analyses temporelles

**Objectif** : Analyser les données par période

#### Questions

1. Calculer le chiffre d'affaires par mois (utiliser `$year` et `$month`)
2. Calculer le nombre de commandes par jour de la semaine
3. Trouver le mois avec le plus de commandes

#### Solutions

**1. CA par mois**

```javascript
db.commandes.aggregate([
  {
    $project: {
      annee: { $year: "$date_commande" },
      mois: { $month: "$date_commande" },
      total_ttc: 1
    }
  },
  {
    $group: {
      _id: { annee: "$annee", mois: "$mois" },
      ca_total: { $sum: "$total_ttc" }
    }
  },
  {
    $sort: { "_id.annee": 1, "_id.mois": 1 }
  }
])
```

**2. Nombre de commandes par jour de la semaine**

```javascript
db.commandes.aggregate([
  {
    $project: {
      jour_semaine: { $dayOfWeek: "$date_commande" }
    }
  },
  {
    $group: {
      _id: "$jour_semaine",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
])
```

**3. Mois avec le plus de commandes**

```javascript
db.commandes.aggregate([
  {
    $project: {
      annee: { $year: "$date_commande" },
      mois: { $month: "$date_commande" }
    }
  },
  {
    $group: {
      _id: { annee: "$annee", mois: "$mois" },
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  },
  {
    $limit: 1
  }
])
```

### Exercice 4.4 : Analyses géographiques

**Objectif** : Analyser les données par localisation (avec jointure)

#### Questions

1. Calculer le chiffre d'affaires par ville (nécessite une jointure avec `clients`)
2. Calculer le nombre de commandes par code postal
3. Trouver la ville avec le plus de commandes

#### Solutions

**1. CA par ville**

```javascript
db.commandes.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "client_id",
      foreignField: "_id",
      as: "client_info"
    }
  },
  {
    $unwind: "$client_info"
  },
  {
    $group: {
      _id: "$client_info.adresse.ville",
      ca_total: { $sum: "$total_ttc" }
    }
  },
  {
    $sort: { ca_total: -1 }
  }
])
```

**2. Nombre de commandes par code postal**

```javascript
db.commandes.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "client_id",
      foreignField: "_id",
      as: "client_info"
    }
  },
  {
    $unwind: "$client_info"
  },
  {
    $group: {
      _id: "$client_info.adresse.code_postal",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  }
])
```

**3. Ville avec le plus de commandes**

```javascript
db.commandes.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "client_id",
      foreignField: "_id",
      as: "client_info"
    }
  },
  {
    $unwind: "$client_info"
  },
  {
    $group: {
      _id: "$client_info.adresse.ville",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  },
  {
    $limit: 1
  }
])
```

---

## Partie 5 : Jointures avec `$lookup`

### Exercice 5.1 : Jointure simple

**Objectif** : Joindre deux collections

#### Questions

1. Afficher les commandes avec les informations du client (nom, prénom, ville)
2. Afficher les produits avec le nombre de fois qu'ils ont été commandés

#### Solutions

**1. Commandes avec informations client**

```javascript
db.commandes.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "client_id",
      foreignField: "_id",
      as: "client_info"
    }
  },
  {
    $unwind: "$client_info"
  },
  {
    $project: {
      _id: 1,
      date_commande: 1,
      total_ttc: 1,
      statut: 1,
      "client_nom": "$client_info.nom",
      "client_prenom": "$client_info.prenom",
      "client_ville": "$client_info.adresse.ville"
    }
  }
])
```

**2. Produits avec nombre de commandes**

```javascript
db.commandes.aggregate([
  {
    $unwind: "$produits"
  },
  {
    $group: {
      _id: "$produits.produit_id",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  }
])
```

### Exercice 5.2 : Jointure bidirectionnelle

**Objectif** : Créer des jointures dans les deux sens

#### Questions

1. À partir de la collection `clients`, afficher chaque client avec ses commandes
2. À partir de la collection `produits`, afficher chaque produit avec les commandes qui le contiennent

#### Solutions

**1. Clients avec leurs commandes**

```javascript
db.clients.aggregate([
  {
    $lookup: {
      from: "commandes",
      localField: "_id",
      foreignField: "client_id",
      as: "commandes"
    }
  },
  {
    $project: {
      nom: 1,
      prenom: 1,
      email: 1,
      "nb_commandes": { $size: "$commandes" },
      commandes: 1
    }
  }
])
```

**2. Produits avec leurs commandes**

```javascript
db.produits.aggregate([
  {
    $lookup: {
      from: "commandes",
      let: { produit_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$$produit_id", "$produits.produit_id"]
            }
          }
        }
      ],
      as: "commandes"
    }
  },
  {
    $project: {
      nom: 1,
      prix: 1,
      categorie: 1,
      "nb_commandes": { $size: "$commandes" },
      commandes: 1
    }
  }
])
```

### Exercice 5.3 : Jointure avec agrégation

**Objectif** : Combiner jointure et calculs

#### Questions

1. Calculer le chiffre d'affaires par client (avec nom et prénom)
2. Afficher pour chaque client : nom, ville, nombre de commandes, CA total

#### Solutions

**1. CA par client**

```javascript
db.commandes.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "client_id",
      foreignField: "_id",
      as: "client_info"
    }
  },
  {
    $unwind: "$client_info"
  },
  {
    $group: {
      _id: "$client_id",
      nom: { $first: "$client_info.nom" },
      prenom: { $first: "$client_info.prenom" },
      ca_total: { $sum: "$total_ttc" }
    }
  },
  {
    $sort: { ca_total: -1 }
  }
])
```

**2. Statistiques complètes par client**

```javascript
db.commandes.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "client_id",
      foreignField: "_id",
      as: "client_info"
    }
  },
  {
    $unwind: "$client_info"
  },
  {
    $group: {
      _id: "$client_id",
      nom: { $first: "$client_info.nom" },
      ville: { $first: "$client_info.adresse.ville" },
      nb_commandes: { $sum: 1 },
      ca_total: { $sum: "$total_ttc" }
    }
  },
  {
    $sort: { ca_total: -1 }
  }
])
```

---

## Partie 6 : Mises à jour et suppressions

### Exercice 6.1 : Mises à jour simples

**Objectif** : Modifier des documents

#### Questions

1. Augmenter le prix de tous les produits de la catégorie "Informatique" de 5%
2. Mettre à jour le stock du produit avec `_id: 6` à 10 unités
3. Ajouter un champ `promotion: true` à tous les produits dont le prix est inférieur à 200 €

#### Solutions

**1. Augmenter les prix de 5% pour la catégorie "Informatique"**

```javascript
db.produits.updateMany(
  { categorie: "Informatique" },
  {
    $mul: { prix: 1.05 }
  }
)
```

**2. Mettre à jour le stock du produit _id: 6**

```javascript
db.produits.updateOne(
  { _id: 6 },
  {
    $set: { stock: 10 }
  }
)
```

**3. Ajouter le champ promotion aux produits < 200 €**

```javascript
db.produits.updateMany(
  { prix: { $lt: 200 } },
  {
    $set: { promotion: true }
  }
)
```

### Exercice 6.2 : Mises à jour conditionnelles

**Objectif** : Mettre à jour selon des conditions

#### Questions

1. Mettre le statut `disponible` à `false` pour tous les produits en rupture de stock
2. Ajouter un tag "promo" aux produits dont le prix est inférieur à 300 € (utiliser `$addToSet`)
3. Supprimer le champ `promotion` des produits qui l'ont

#### Solutions

**1. Désactiver les produits en rupture de stock**

```javascript
db.produits.updateMany(
  { stock: 0 },
  {
    $set: { disponible: false }
  }
)
```

**2. Ajouter le tag "promo"**

```javascript
db.produits.updateMany(
  { prix: { $lt: 300 } },
  {
    $addToSet: { tags: "promo" }
  }
)
```

**3. Supprimer le champ promotion**

```javascript
db.produits.updateMany(
  { promotion: { $exists: true } },
  {
    $unset: { promotion: "" }
  }
)
```

### Exercice 6.3 : Suppressions

**Objectif** : Supprimer des documents

#### Questions

1. Supprimer tous les clients inactifs
2. Supprimer les commandes avec le statut "en_attente" de plus de 30 jours

#### Solutions

**1. Supprimer les clients inactifs**

```javascript
db.clients.deleteMany({ statut: "inactif" })
```

**2. Supprimer les commandes en attente de plus de 30 jours**

```javascript
var dateLimite = new Date()
dateLimite.setDate(dateLimite.getDate() - 30)

db.commandes.deleteMany({
  statut: "en_attente",
  date_commande: { $lt: dateLimite }
})
```

---

## Partie 7 : Modélisation

### Exercice 7.1 : Duplication de collection

**Objectif** : Créer une copie de collection

#### Question

1. Dupliquer la collection `produits` en `produits_archive`

#### Solution

```javascript
db.produits.aggregate([{ $out: "produits_archive" }])
```

### Exercice 7.2 : Références enrichies

**Objectif** : Implémenter des références enrichies

#### Questions

1. Créer une collection `fabricants` avec les informations suivantes :
   - TechCorp : { _id: 1, nom: "TechCorp", pays: "USA", annee_creation: 2010 }
   - MobileTech : { _id: 2, nom: "MobileTech", pays: "Chine", annee_creation: 2015 }
   - DisplayPro : { _id: 3, nom: "DisplayPro", pays: "Corée", annee_creation: 2008 }
   - SoundMax : { _id: 4, nom: "SoundMax", pays: "Allemagne", annee_creation: 2012 }
   - KeyMaster : { _id: 5, nom: "KeyMaster", pays: "France", annee_creation: 2018 }

2. Ajouter un champ `fabricant_info` dans `produits` contenant l'objet complet du fabricant (référence enrichie)

#### Solutions

**1. Création de la collection fabricants**

```javascript
db.fabricants.insertMany([
  { _id: 1, nom: "TechCorp", pays: "USA", annee_creation: 2010 },
  { _id: 2, nom: "MobileTech", pays: "Chine", annee_creation: 2015 },
  { _id: 3, nom: "DisplayPro", pays: "Corée", annee_creation: 2008 },
  { _id: 4, nom: "SoundMax", pays: "Allemagne", annee_creation: 2012 },
  { _id: 5, nom: "KeyMaster", pays: "France", annee_creation: 2018 }
])
```

**2. Ajout de la référence enrichie dans produits**

```javascript
var fabricants = db.fabricants.find().toArray()
var produits = db.produits.find().toArray()

for (var i = 0; i < produits.length; i++) {
  var fabricant = fabricants.find(f => f.nom === produits[i].fabricant)
  if (fabricant) {
    db.produits.updateOne(
      { _id: produits[i]._id },
      {
        $set: {
          fabricant_info: {
            _id: fabricant._id,
            nom: fabricant.nom,
            pays: fabricant.pays,
            annee_creation: fabricant.annee_creation
          }
        }
      }
    )
  }
}
```

### Exercice 7.3 : Références simples et jointures

**Objectif** : Utiliser des références simples avec jointures

#### Questions

1. Créer une collection `produits_v2` en dupliquant `produits`
2. Remplacer le champ `fabricant` par `fabricant_id` (référence simple vers `fabricants`)
3. Effectuer une jointure entre `produits_v2` et `fabricants` pour afficher les produits avec les informations du fabricant

#### Solutions

**1. Duplication de la collection**

```javascript
db.produits.aggregate([{ $out: "produits_v2" }])
```

**2. Remplacement par référence simple**

```javascript
var fabricants = db.fabricants.find().toArray()
var produits = db.produits_v2.find().toArray()

for (var i = 0; i < produits.length; i++) {
  var fabricant = fabricants.find(f => f.nom === produits[i].fabricant)
  if (fabricant) {
    db.produits_v2.updateOne(
      { _id: produits[i]._id },
      {
        $set: { fabricant_id: fabricant._id },
        $unset: { fabricant: "" }
      }
    )
  }
}
```

**3. Jointure avec fabricants**

```javascript
db.produits_v2.aggregate([
  {
    $lookup: {
      from: "fabricants",
      localField: "fabricant_id",
      foreignField: "_id",
      as: "fabricant_info"
    }
  },
  {
    $unwind: "$fabricant_info"
  },
  {
    $project: {
      nom: 1,
      prix: 1,
      categorie: 1,
      "fabricant_nom": "$fabricant_info.nom",
      "fabricant_pays": "$fabricant_info.pays"
    }
  }
])
```

---

## Partie 8 : Transactions

### Exercice 8.1 : Transaction d'insertion

**Objectif** : Créer une transaction atomique

#### Question

1. Créer une transaction qui :
   - Ajoute un nouveau fabricant
   - Ajoute un nouveau produit de ce fabricant
   - Crée une commande pour ce produit
   - S'assure que tout est validé ensemble ou rien n'est validé

#### Solution

```javascript
var session = db.getMongo().startSession()
session.startTransaction()

try {
  var dbSession = session.getDatabase("bdecommerce")
  var fabricantsColl = dbSession.fabricants
  var produitsColl = dbSession.produits
  var commandesColl = dbSession.commandes

  // 1. Ajouter un nouveau fabricant
  var nouveauFabricant = {
    _id: 6,
    nom: "GameTech",
    pays: "Japon",
    annee_creation: 2020
  }
  fabricantsColl.insertOne(nouveauFabricant)

  // 2. Ajouter un nouveau produit
  var nouveauProduit = {
    _id: 9,
    nom: "Console NextGen",
    categorie: "Informatique",
    prix: 599.99,
    stock: 20,
    fabricant: "GameTech",
    disponible: true
  }
  produitsColl.insertOne(nouveauProduit)

  // 3. Créer une commande
  var nouvelleCommande = {
    _id: 7,
    client_id: 1,
    date_commande: new Date(),
    produits: [
      { produit_id: 9, quantite: 1, prix_unitaire: 599.99 }
    ],
    total_ht: 599.99,
    tva: 119.998,
    total_ttc: 719.988,
    statut: "en_attente",
    mode_livraison: "express"
  }
  commandesColl.insertOne(nouvelleCommande)

  // Validation
  session.commitTransaction()
  print("Transaction réussie !")
} catch (e) {
  print("Erreur : " + e)
  session.abortTransaction()
} finally {
  session.endSession()
}
```

### Exercice 8.2 : Transaction de mise à jour synchronisée

**Objectif** : Synchroniser des mises à jour

#### Question

1. Créer une transaction qui :
   - Met à jour le nom d'un fabricant dans la collection `fabricants`
   - Met à jour le champ `fabricant` correspondant dans tous les produits
   - Utilise un try/catch pour gérer les erreurs

#### Solution

```javascript
var session = db.getMongo().startSession()
session.startTransaction()

try {
  var dbSession = session.getDatabase("bdecommerce")
  var fabricantsColl = dbSession.fabricants
  var produitsColl = dbSession.produits

  var ancienNom = "TechCorp"
  var nouveauNom = "TechCorp International"

  // 1. Mettre à jour le fabricant
  fabricantsColl.updateOne(
    { nom: ancienNom },
    { $set: { nom: nouveauNom } }
  )

  // 2. Mettre à jour tous les produits
  produitsColl.updateMany(
    { fabricant: ancienNom },
    { $set: { fabricant: nouveauNom } }
  )

  // Validation
  session.commitTransaction()
  print("Transaction réussie : fabricant et produits mis à jour.")
} catch (e) {
  print("Erreur détectée : " + e)
  session.abortTransaction()
} finally {
  session.endSession()
}
```

---

## Partie 9 : Validation JSON Schema

### Exercice 9.1 : Création d'un schéma

**Objectif** : Valider les données avec JSON Schema

#### Questions

1. Créer un schéma de validation pour la collection `produits` avec les contraintes suivantes :
   - `nom` : obligatoire, chaîne de caractères
   - `prix` : obligatoire, nombre positif
   - `stock` : entier positif ou nul
   - `categorie` : enum ["Informatique", "Téléphonie", "Audio"]
   - `note_moyenne` : nombre entre 0 et 5
   - `tags` : tableau de chaînes, maximum 10 éléments

2. Tester le schéma en essayant d'insérer un document invalide

#### Solutions

**1. Création du schéma de validation**

```javascript
db.runCommand({
  collMod: "produits",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "prix"],
      properties: {
        nom: {
          bsonType: "string",
          description: "nom doit être une chaîne de caractères et est obligatoire"
        },
        prix: {
          bsonType: "double",
          minimum: 0,
          description: "prix doit être un nombre positif et est obligatoire"
        },
        stock: {
          bsonType: "int",
          minimum: 0,
          description: "stock doit être un entier positif ou nul"
        },
        categorie: {
          enum: ["Informatique", "Téléphonie", "Audio"],
          description: "categorie doit être parmi Informatique, Téléphonie, Audio"
        },
        note_moyenne: {
          bsonType: "double",
          minimum: 0,
          maximum: 5,
          description: "note_moyenne doit être entre 0 et 5"
        },
        tags: {
          bsonType: "array",
          maxItems: 10,
          items: {
            bsonType: "string"
          },
          description: "tags doit être un tableau de chaînes avec maximum 10 éléments"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
})
```

**2. Test avec un document invalide**

```javascript
// Ceci devrait échouer (note_moyenne > 5)
db.produits.insertOne({
  nom: "Test Produit",
  prix: 100,
  stock: 10,
  categorie: "Informatique",
  note_moyenne: 6,  // Invalide : > 5
  tags: ["test"]
})
```

### Exercice 9.2 : Correction des données

**Objectif** : Corriger les documents non conformes

#### Questions

1. Identifier les produits qui ne respectent pas le schéma
2. Corriger les documents non conformes :
   - Les notes > 5 doivent être mises à 5
   - Les catégories invalides doivent être mises à "Autre"
   - Les tableaux `tags` avec plus de 10 éléments doivent être tronqués à 10

#### Solutions

**1. Identifier les documents non conformes**

```javascript
// Notes > 5
db.produits.find({ note_moyenne: { $gt: 5 } })

// Catégories invalides
db.produits.find({
  categorie: { $nin: ["Informatique", "Téléphonie", "Audio"] }
})

// Tags avec plus de 10 éléments
db.produits.find({
  $expr: { $gt: [{ $size: { $ifNull: ["$tags", []] } }, 10] }
})
```

**2. Correction des documents**

```javascript
// Corriger les notes > 5
db.produits.updateMany(
  { note_moyenne: { $gt: 5 } },
  { $set: { note_moyenne: 5 } }
)

// Corriger les catégories invalides
db.produits.updateMany(
  { categorie: { $nin: ["Informatique", "Téléphonie", "Audio"] } },
  { $set: { categorie: "Autre" } }
)

// Tronquer les tags à 10 éléments
db.produits.updateMany(
  { $expr: { $gt: [{ $size: { $ifNull: ["$tags", []] } }, 10] } },
  [
    {
      $set: {
        tags: { $slice: ["$tags", 10] }
      }
    }
  ]
)
```

---

## Partie 10 : Indexation

### Exercice 10.1 : Index simples

**Objectif** : Créer des index de base

#### Questions

1. Créer un index sur le champ `nom` de la collection `produits`
2. Créer un index sur le champ `email` de la collection `clients` (unique)
3. Créer un index sur `date_commande` de la collection `commandes`

#### Solutions

**1. Index sur nom (produits)**

```javascript
db.produits.createIndex({ nom: 1 })
```

**2. Index unique sur email (clients)**

```javascript
db.clients.createIndex({ email: 1 }, { unique: true })
```

**3. Index sur date_commande (commandes)**

```javascript
db.commandes.createIndex({ date_commande: 1 })
```

### Exercice 10.2 : Index composés

**Objectif** : Optimiser les requêtes multi-critères

#### Questions

1. Créer un index composé sur `categorie` et `prix` dans `produits`
2. Créer un index composé sur `client_id` et `date_commande` dans `commandes`
3. Tester l'utilisation de ces index avec `.explain("executionStats")`

#### Solutions

**1. Index composé categorie + prix**

```javascript
db.produits.createIndex({ categorie: 1, prix: 1 })
```

**2. Index composé client_id + date_commande**

```javascript
db.commandes.createIndex({ client_id: 1, date_commande: -1 })
```

**3. Test avec explain**

```javascript
// Test de l'index composé
db.produits.find({ categorie: "Informatique", prix: { $gt: 500 } })
  .explain("executionStats")

// Vérifier que IXSCAN est utilisé (et non COLLSCAN)
```

### Exercice 10.3 : Index spécialisés

**Objectif** : Utiliser des index avancés

#### Questions

1. Créer un index texte sur le champ `nom` de `produits`
2. Créer un index TTL sur `date_commande` dans `commandes` (expire après 1 an)
3. Créer un index partiel sur `prix` dans `produits` (uniquement pour prix > 1000)

#### Solutions

**1. Index texte**

```javascript
db.produits.createIndex({ nom: "text" })
```

**2. Index TTL (1 an = 31536000 secondes)**

```javascript
db.commandes.createIndex(
  { date_commande: 1 },
  { expireAfterSeconds: 31536000 }
)
```

**3. Index partiel**

```javascript
db.produits.createIndex(
  { prix: 1 },
  { partialFilterExpression: { prix: { $gt: 1000 } } }
)
```

### Exercice 10.4 : Analyse des performances

**Objectif** : Analyser l'utilisation des index

#### Questions

1. Vérifier tous les index créés avec `getIndexes()`
2. Analyser une requête avec `.explain("executionStats")` et identifier :
   - Le type de scan utilisé (IXSCAN ou COLLSCAN)
   - Le nombre de documents examinés
   - Le temps d'exécution
3. Comparer les performances avec et sans index

#### Solutions

**1. Lister tous les index**

```javascript
db.produits.getIndexes()
db.clients.getIndexes()
db.commandes.getIndexes()
```

**2. Analyse d'exécution**

```javascript
var result = db.produits.find({ nom: "Laptop Gaming Pro" })
  .explain("executionStats")

// Vérifier :
// - executionStats.executionStages.stage (doit être "IXSCAN")
// - executionStats.executionStages.totalDocsExamined
// - executionStats.executionTimeMillis
```

**3. Comparaison de performances**

```javascript
// Sans index (supprimer temporairement l'index)
db.produits.dropIndex({ nom: 1 })
var start = new Date()
db.produits.find({ nom: "Laptop Gaming Pro" }).toArray()
var tempsSansIndex = new Date() - start

// Avec index (recréer l'index)
db.produits.createIndex({ nom: 1 })
var start = new Date()
db.produits.find({ nom: "Laptop Gaming Pro" }).toArray()
var tempsAvecIndex = new Date() - start

print("Temps sans index: " + tempsSansIndex + "ms")
print("Temps avec index: " + tempsAvecIndex + "ms")
```

---

## Partie 11 : Analyses avancées (MapReduce via aggregate)

### Exercice 11.1 : Analyses par attributs complexes

**Objectif** : Grouper par critères complexes

1. Calculer le chiffre d'affaires par ville (en extrayant la ville depuis les clients)

2. Calculer le nombre de commandes par tranche de prix :
   - "Moins de 500€"
   - "500-1000€"
   - "Plus de 1000€"

### Exercice 11.2 : Manipulation de dates

**Objectif** : Analyser les données temporelles

1. Calculer le chiffre d'affaires par trimestre

2. Calculer le nombre de commandes par jour de la semaine

3. Trouver le jour de la semaine le plus rentable

### Exercice 11.3 : Découpage de champs

**Objectif** : Extraire des informations depuis des champs complexes

1. Calculer le nombre de commandes par initiale du nom de client (première lettre du nom)

2. Grouper les produits par première lettre du nom

### Exercice 11.4 : Analyses multi-dimensionnelles

**Objectif** : Combiner plusieurs dimensions

1. Calculer le chiffre d'affaires par :
   - Catégorie de produit
   - Ville du client
   - Mois

2. Calculer le panier moyen par :
   - Statut de commande
   - Mode de livraison

---

## Partie 12 : Projet final - Dashboard analytique

### Objectif global

Créer un ensemble de requêtes d'agrégation qui simulent un dashboard analytique pour l'e-commerce.

### Exercices à réaliser

1. **Vue d'ensemble des ventes**
   - CA total (HT et TTC)
   - Nombre total de commandes
   - Panier moyen
   - Nombre de clients actifs

2. **Top produits**
   - Les 5 produits les plus vendus (quantité)
   - Les 5 produits avec le plus de CA
   - Les produits les mieux notés (note moyenne >= 4.5)

3. **Analyse géographique**
   - CA par ville
   - Nombre de clients par ville
   - Top 3 des villes les plus rentables

4. **Analyse temporelle**
   - CA par mois
   - Évolution du nombre de commandes par mois
   - Mois le plus rentable

5. **Analyse clients**
   - Top 5 des clients par CA
   - Clients avec le plus de commandes
   - Ville avec le plus de clients

6. **Analyse produits**
   - Produits en rupture de stock
   - Produits par catégorie avec stock moyen
   - Fabricants les plus représentés

7. **Indicateurs de performance**
   - Taux de conversion (commandes / clients)
   - Valeur moyenne par produit vendu
   - Répartition des commandes par statut

### Livrables attendus

Pour chaque analyse, fournir :
- La requête MongoDB complète
- Un commentaire expliquant ce que fait la requête
- Les résultats obtenus (ou un exemple de résultats)

---

## Annexes

### A. Commandes utiles

```javascript
// Voir toutes les collections
show collections

// Compter les documents
db.produits.countDocuments()

// Vider une collection (attention !)
db.produits.deleteMany({})

// Voir la structure d'un document
db.produits.findOne()

// Statistiques d'une collection
db.produits.stats()

// Vérifier les index
db.produits.getIndexes()
```

### B. Opérateurs de comparaison récapitulatifs

| Opérateur | Signification | Exemple |
|-----------|--------------|---------|
| `$gt` | Supérieur à | `{prix: {$gt: 100}}` |
| `$lt` | Inférieur à | `{prix: {$lt: 500}}` |
| `$gte` | Supérieur ou égal | `{stock: {$gte: 10}}` |
| `$lte` | Inférieur ou égal | `{prix: {$lte: 1000}}` |
| `$ne` | Différent de | `{statut: {$ne: "inactif"}}` |
| `$in` | Dans une liste | `{categorie: {$in: ["A", "B"]}}` |
| `$nin` | Pas dans une liste | `{fabricant: {$nin: ["X", "Y"]}}` |
| `$exists` | Champ existe | `{note: {$exists: true}}` |

### C. Opérateurs d'agrégation récapitulatifs

| Opérateur | Signification | Exemple |
|-----------|--------------|---------|
| `$sum` | Somme | `{$sum: "$prix"}` |
| `$avg` | Moyenne | `{$avg: "$prix"}` |
| `$max` | Maximum | `{$max: "$prix"}` |
| `$min` | Minimum | `{$min: "$prix"}` |
| `$count` | Comptage | `{$count: {}}` |
| `$size` | Taille tableau | `{$size: "$tags"}` |
| `$add` | Addition | `{$add: ["$a", "$b"]}` |
| `$cond` | Condition | `{$cond: {if: ..., then: ..., else: ...}}` |

---

## Conseils pour réussir le TP

1. **Testez chaque requête** avant de passer à la suivante
2. **Utilisez `.pretty()`** pour une meilleure lisibilité des résultats
3. **Sauvegardez vos requêtes** dans un fichier pour référence
4. **Lisez les messages d'erreur** attentivement
5. **Utilisez `.explain()`** pour comprendre l'exécution des requêtes
6. **Documentez vos requêtes** avec des commentaires

---
