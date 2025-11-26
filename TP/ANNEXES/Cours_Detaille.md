# Cours MongoDB - Requêtes et Agrégations Avancées

## Table des matières

1. [Requêtes simples (find)](#1-requêtes-simples-find)
2. [Aggregation Framework](#2-aggregation-framework)
3. [Fonctions annexes](#3-fonctions-annexes)
4. [Mises à jour et suppressions](#4-mises-à-jour-et-suppressions)
5. [Modélisation](#5-modélisation)
6. [Transactions](#6-transactions)
7. [Validation JSON Schema](#7-validation-json-schema)
8. [Indexation](#8-indexation)
9. [MapReduce via aggregate](#9-mapreduce-via-aggregate)

---

## 1. Requêtes simples (find)

### 1.1 Comparateurs

Les comparateurs permettent de filtrer les documents selon des conditions de comparaison.

#### Opérateurs disponibles :
- `$gt` : supérieur à (greater than)
- `$lt` : inférieur à (less than)
- `$gte` : supérieur ou égal à (greater than or equal)
- `$lte` : inférieur ou égal à (less than or equal)
- `$ne` : différent de (not equal)
- `$in` : appartient à une liste
- `$nin` : n'appartient pas à une liste

#### Exemples pratiques :

```javascript
// Prix supérieur à 60 €
db.games.find({'infos.prix': {$gt: 60}}, {titre: 1, _id: 0})

// Prix inférieur à 50 €
db.games.find({'infos.prix': {$lt: 50}}, {_id: 0})

// Prix compris entre 50 € et 70 €
db.games.find({'infos.prix': {$gte: 50, $lte: 70}})

// Éditeur parmi une liste
db.games.find({'infos.editeur': {$in: ['Sony', 'Nintendo']}})

// Jeux non édités par Nintendo
db.games.find({'infos.editeur': {$ne: 'Nintendo'}})

// Jeux qui ne fonctionnent ni sur PS5 ni sur Xbox
db.games.find({consoles: {$nin: ['PS5', 'Xbox One', 'Xbox Series X']}})
```

### 1.2 Opérateurs logiques

#### `$or` : Condition OU

Permet de combiner plusieurs conditions avec un OU logique.

```javascript
// Jeux dont le prix est 49.99 € ou 74.99 €
db.games.find({$or: [{'infos.prix': 49.99}, {'infos.prix': 74.99}]})

// Jeux édités par Sony ET prix > 60 € (combinaison implicite avec virgule)
db.games.find({'infos.editeur': 'Sony', 'infos.prix': {$gt: 60}})
```

### 1.3 Projection de champs

La projection permet de sélectionner uniquement les champs souhaités dans les résultats.

```javascript
// Afficher uniquement le titre (sans _id)
db.games.find({'infos.prix': {$gt: 60}}, {titre: 1, _id: 0})

// Afficher tous les champs sauf _id
db.games.find({'infos.prix': {$lt: 50}}, {_id: 0})
```

**Note** : Par défaut, `_id` est toujours inclus sauf si explicitement exclu avec `_id: 0`.

### 1.4 Filtres par regex

Les expressions régulières permettent des recherches textuelles avancées.

```javascript
// Jeux fonctionnant sur les consoles PS (toutes versions)
db.games.find({consoles: /^PS/})

// Jeux dont le titre commence par 'M' (insensible à la casse)
db.games.find({titre: /^M/i})
```

**Options regex** :
- `i` : insensible à la casse
- `m` : mode multiligne
- `x` : ignore les espaces

### 1.5 Tests d'existence

L'opérateur `$exists` permet de vérifier la présence ou l'absence d'un champ.

```javascript
// Jeux sans le champ 'prix adhérent FNAC'
db.games.find({'infos.prix adhérent FNAC': {$exists: false}})

// Jeux dont le champ 'resume' est présent
db.games.find({'infos.resume': {$exists: true}})
```

### 1.6 Tri

La méthode `.sort()` permet de trier les résultats.

```javascript
// Trier par note FNAC décroissante
db.games.find({'note Fnac': {$gte: 3}}).sort({'note Fnac': -1})

// Trier par prix décroissant
db.games.find().sort({'infos.prix': -1})
```

**Valeurs** :
- `1` : ordre croissant
- `-1` : ordre décroissant

### 1.7 Pagination

La méthode `.skip()` permet de sauter un certain nombre de documents.

```javascript
// Afficher les jeux à partir du numéro 3 (skip les 2 premiers)
db.games.find().skip(2)
```

**Combinaison avec `.limit()`** :
```javascript
// Pagination : page 2, 10 résultats par page
db.games.find().skip(10).limit(10)
```

---

## 2. Aggregation Framework

L'Aggregation Framework permet de traiter et transformer des documents en plusieurs étapes (pipeline).

### 2.1 Étapes principales

#### `$match` : Filtrage

Équivalent à `find()`, mais dans un pipeline d'agrégation.

```javascript
// Clients ayant commandé sans jeux
db.commandes.aggregate([
  {
    $match: {
      games: { $exists: false }
    }
  }
])
```

#### `$project` : Transformation et sélection de champs

Permet de créer, modifier ou supprimer des champs.

```javascript
// Calculer le CA TTC par code postal
db.commandes.aggregate([
  {
    $project: {
      cp: "$user.cp",
      ca_ttc: { $add: ["$totalht", "$tva"] }
    }
  },
  {
    $group: {
      _id: "$cp",
      ca_ttc_total: { $sum: "$ca_ttc" }
    }
  }
])

// Nombre de consoles par jeu
db.games.aggregate([
  {
    $project: {
      titre: 1,
      nbConsoles: { $size: '$consoles' }
    }
  }
])
```

#### `$unwind` : Déplier un tableau

Transforme un document avec un tableau en plusieurs documents (un par élément du tableau).

```javascript
// Calculer le CA par titre de jeu
db.commandes.aggregate([
  {
    $unwind: "$games"
  },
  {
    $group: {
      _id: "$games.titre",
      ca: { $sum: "$games.prix" }
    }
  },
  {
    $sort: { ca: -1 }
  }
])

// Note moyenne par éditeur et par console
db.games.aggregate([
  {$unwind: '$notes adherents'},
  {$unwind: '$consoles'},
  {$group: {
      _id: {editeur: '$infos.editeur', console: '$consoles'},
      moyenne: {$avg: '$notes adherents'}
  }}
])
```

#### `$group` : Regroupement

Permet de regrouper des documents et d'appliquer des opérations d'agrégation.

```javascript
// Nombre de jeux par éditeur
db.games.aggregate([
  {$group: {_id: '$infos.editeur', nbJeux: {$count: {}}}}
])

// CA HT par sexe
db.commandes.aggregate([
  {
    $group: {
      _id: { $toUpper: "$user.sexe" },
      ca_ht: { $sum: "$totalht" }
    }
  },
  {
    $sort: { _id: 1 }
  }
])
```

#### `$sort` : Tri dans le pipeline

```javascript
// Nombre de commandes par nom client, tri décroissant
db.commandes.aggregate([
  {
    $group: {
      _id: "$user.nom",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  }
])
```

### 2.2 Expressions internes

#### Opérateurs arithmétiques

- `$add` : addition
- `$subtract` : soustraction
- `$multiply` : multiplication
- `$divide` : division

```javascript
// CA TTC (HT + TVA)
db.commandes.aggregate([
  {
    $project: {
      cp: "$user.cp",
      ca_ttc: { $add: ["$totalht", "$tva"] }
    }
  }
])

// CA total TTC
db.commandes.aggregate([
  {
    $group: {
      _id: null,
      ca_total_ttc: { $sum: { $add: ["$totalht", "$tva"] } }
    }
  }
])
```

#### Opérateurs d'agrégation

- `$sum` : somme
- `$avg` : moyenne
- `$max` : maximum
- `$min` : minimum
- `$count` : comptage

```javascript
// Note moyenne donnée par les adhérents (tous jeux confondus)
db.games.aggregate([
  {$unwind: '$notes adherents'},
  {$group: {_id: null, moyenne: {$avg: '$notes adherents'}}}
])

// Note moyenne par jeu
db.games.aggregate([
  {$unwind: '$notes adherents'},
  {$group: {_id: '$titre', moyenne: {$avg: '$notes adherents'}}}
])

// Note max par éditeur
db.games.aggregate([
  {$unwind: '$notes adherents'},
  {$group: {_id: '$infos.editeur', noteMax: {$max: '$notes adherents'}}}
])
```

#### Opérateurs sur les tableaux

- `$size` : taille d'un tableau
- `$slice` : extraire une portion d'un tableau

```javascript
// Nombre de jeux commandés par client
db.commandes.aggregate([
  {
    $project: {
      nom: "$user.nom",
      nbJeux: {
        $cond: {
          if: { $isArray: "$games" },
          then: { $size: "$games" },
          else: 0
        }
      }
    }
  },
  {
    $group: {
      _id: "$nom",
      total_jeux: { $sum: "$nbJeux" }
    }
  }
])
```

#### Opérateurs sur les chaînes

- `$toUpper` : convertir en majuscules
- `$toLower` : convertir en minuscules
- `$split` : diviser une chaîne
- `$arrayElemAt` : accéder à un élément d'un tableau

```javascript
// CA HT par sexe (en majuscules)
db.commandes.aggregate([
  {
    $group: {
      _id: { $toUpper: "$user.sexe" },
      ca_ht: { $sum: "$totalht" }
    }
  }
])

// Nombre de commandes par famille (nom de famille)
db.commandes.aggregate([
  {
    $project: {
      nom_famille: {
        $arrayElemAt: [
          { $split: ["$user.nom", " "] },
          0
        ]
      }
    }
  },
  {
    $group: {
      _id: "$nom_famille",
      nb_commandes: { $sum: 1 }
    }
  }
])
```

#### Opérateurs conditionnels

- `$cond` : condition if-then-else
- `$isArray` : vérifier si c'est un tableau

```javascript
// Nombre de jeux par commande (avec vérification)
db.commandes.aggregate([
  {
    $project: {
      nbJeux: {
        $cond: {
          if: { $isArray: "$games" },
          then: { $size: "$games" },
          else: 0
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      moyenne_jeux: { $avg: "$nbJeux" }
    }
  }
])
```

#### Opérateurs sur les dates

- `$year` : extraire l'année
- `$month` : extraire le mois
- `$dayOfMonth` : extraire le jour

```javascript
// CA par année/mois
db.commandes.aggregate([
  {
    $project: {
      annee: { $year: "$date" },
      mois: { $month: "$date" },
      ca: "$totalht"
    }
  },
  {
    $group: {
      _id: { annee: "$annee", mois: "$mois" },
      ca_total: { $sum: "$ca" }
    }
  },
  {
    $sort: { "_id.annee": 1, "_id.mois": 1 }
  }
])
```

### 2.3 Groupements simples et composés

#### Groupement simple

```javascript
// Nombre de commandes par code postal
db.commandes.aggregate([
  {
    $group: {
      _id: "$user.cp",
      nb_cmd: { $sum: 1 }
    }
  },
  {
    $sort: { nb_cmd: -1 }
  }
])
```

#### Groupement composé

```javascript
// Note moyenne par éditeur et par console
db.games.aggregate([
  {$unwind: '$notes adherents'},
  {$unwind: '$consoles'},
  {$group: {
      _id: {editeur: '$infos.editeur', console: '$consoles'},
      moyenne: {$avg: '$notes adherents'}
  }}
])

// CA par année et mois
db.commandes.aggregate([
  {
    $project: {
      annee: { $year: "$date" },
      mois: { $month: "$date" },
      ca: "$totalht"
    }
  },
  {
    $group: {
      _id: { annee: "$annee", mois: "$mois" },
      ca_total: { $sum: "$ca" }
    }
  }
])
```

### 2.4 Calculs de moyennes, max, totaux, comptages

```javascript
// Nombre moyen de jeux par commande
db.commandes.aggregate([
  {
    $project: {
      nbJeux: {
        $cond: {
          if: { $isArray: "$games" },
          then: { $size: "$games" },
          else: 0
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      moyenne_jeux: { $avg: "$nbJeux" }
    }
  }
])

// Prix moyen par jeu
db.commandes.aggregate([
  {
    $unwind: "$games"
  },
  {
    $group: {
      _id: "$games.titre",
      prixMoyen: { $avg: "$games.prix" }
    }
  }
])
```

### 2.5 Agrégation multi-dimensionnelle

```javascript
// Note moyenne par éditeur et par console
db.games.aggregate([
  {$unwind: '$notes adherents'},
  {$unwind: '$consoles'},
  {$group: {
      _id: {editeur: '$infos.editeur', console: '$consoles'},
      moyenne: {$avg: '$notes adherents'}
  }}
])
```

### 2.6 Jointures via `$lookup`

`$lookup` permet d'effectuer des jointures entre collections (équivalent d'un LEFT OUTER JOIN).

```javascript
// Jointure entre games2 et pegi (en partant de games2)
db.games2.aggregate([
  {
    $lookup: {
      from: "pegi",
      localField: "pegi",
      foreignField: "_id",
      as: "pegi_info"
    }
  },
  { $unwind: "$pegi_info" },
  {
    $project: {
      _id: 0,
      titre: 1,
      consoles: 1,
      "infos.prix": 1,
      "description PEGI": "$pegi_info.Desc_pegi"
    }
  }
])

// Jointure bidirectionnelle : de pegi vers games2
db.pegi.aggregate([
  {
    $lookup: {
      from: "games2",
      localField: "_id",
      foreignField: "pegi",
      as: "jeux"
    }
  },
  {
    $project: {
      _id: 0,
      Code_pegi: 1,
      Desc_pegi: 1,
      "jeux.titre": 1,
      "jeux.consoles": 1
    }
  }
])
```

**Paramètres de `$lookup`** :
- `from` : collection à joindre
- `localField` : champ de la collection source
- `foreignField` : champ de la collection cible
- `as` : nom du champ résultat (tableau)

### 2.7 Transformation avec `$project`

`$project` permet de restructurer complètement les documents.

```javascript
// Transformation avec renommage et calcul
db.commandes.aggregate([
  {
    $project: {
      cp: "$user.cp",
      ca_ttc: { $add: ["$totalht", "$tva"] },
      nb_jeux: {
        $cond: {
          if: { $isArray: "$games" },
          then: { $size: "$games" },
          else: 0
        }
      }
    }
  }
])
```

---

## 3. Fonctions annexes

### 3.1 `countDocuments()`

Compte le nombre de documents correspondant à un filtre.

```javascript
// Nombre de jeux contenant un champ 'note Fnac'
db.games.countDocuments({'note Fnac': {$exists: true}})
```

### 3.2 `distinct()`

Retourne les valeurs distinctes d'un champ.

```javascript
// Liste des éditeurs distincts
db.games.distinct('infos.editeur')
```

### 3.3 Opérateur `$count` dans le pipeline

```javascript
// Nombre de jeux par éditeur
db.games.aggregate([
  {$group: {_id: '$infos.editeur', nbJeux: {$count: {}}}}
])
```

---

## 4. Mises à jour et suppressions

### 4.1 Mises à jour

#### `updateOne()` : Mettre à jour un seul document

```javascript
// Modifier la note Fnac du jeu ayant _id = 2
db.games.updateOne(
  { _id: 2 },
  { $set: { "note Fnac": 3.0 } }
)
```

#### `updateMany()` : Mettre à jour plusieurs documents

```javascript
// Ajouter un champ "disponible" à tous les jeux Sony
db.games.updateMany(
  { "infos.editeur": "Sony" },
  { $set: { disponible: true } }
)
```

### 4.2 Opérateurs de mise à jour

#### `$set` : Définir ou modifier un champ

```javascript
db.games.updateOne(
  { _id: 2 },
  { $set: { "note Fnac": 3.0 } }
)
```

#### `$unset` : Supprimer un champ

```javascript
// Supprimer le champ "prix adhérent FNAC"
db.games.updateMany(
  { "infos.prix adhérent FNAC": { $exists: true } },
  { $unset: { "infos.prix adhérent FNAC": "" } }
)
```

### 4.3 Suppressions

#### `deleteOne()` : Supprimer un document

```javascript
// Supprimer le jeu avec l'identifiant _id = 2
db.games.deleteOne({ _id: 2 })
```

#### `deleteMany()` : Supprimer plusieurs documents

```javascript
// Supprimer tous les jeux édités par Sony
db.games.deleteMany({ "infos.editeur": "Sony" })
```

---

## 5. Modélisation

### 5.1 Duplication de collection

```javascript
// Dupliquer la collection games en games2
db.games.aggregate([{ $out: "games2" }])
```

**Note** : `$out` remplace complètement la collection cible si elle existe.

### 5.2 Insertion en masse

```javascript
// Création et ajout de données dans la collection "pegi"
db.pegi.insertMany([
  {
    "Code_pegi": "PEGI3",
    "Desc_pegi": "Adapté à toutes les classes d'âge",
    "Categorie_pegi": "Enfant"
  },
  {
    "Code_pegi": "PEGI7",
    "Desc_pegi": "Scènes ou sons potentiellement effrayants",
    "Categorie_pegi": "Enfant"
  },
  {
    "Code_pegi": "PEGI12",
    "Desc_pegi": "Scènes de violence imagées",
    "Categorie_pegi": "Adolescent"
  },
  {
    "Code_pegi": "PEGI16",
    "Desc_pegi": "Scènes de violence ou contacts sexuels semblables à ceux de la réalité",
    "Categorie_pegi": "Adolescent"
  },
  {
    "Code_pegi": "PEGI18",
    "Desc_pegi": "Violence crue donnant un sentiment de dégoût",
    "Categorie_pegi": "Adulte"
  }
])
```

### 5.3 Boucles JavaScript côté shell

```javascript
// Ajouter un champ "pegi" dans la collection "games" (référence enrichie)
var pegis = db.pegi.find().toArray()
var jeux = db.games.find().toArray()

for (var i = 0; i < jeux.length; i++) {
  var pegi = pegis[i % pegis.length]
  db.games.updateOne(
    { _id: jeux[i]._id },
    {
      $set: {
        "pegi": {
          "_id": pegi._id,
          "Code_pegi": pegi.Code_pegi,
          "Desc_pegi": pegi.Desc_pegi
        }
      }
    }
  )
}
```

### 5.4 Référence simple vs référence enrichie

#### Référence enrichie (objet complet)

```javascript
// Injection d'un objet PEGI complet dans games
db.games.updateOne(
  { _id: jeux[i]._id },
  {
    $set: {
      "pegi": {
        "_id": pegi._id,
        "Code_pegi": pegi.Code_pegi,
        "Desc_pegi": pegi.Desc_pegi
      }
    }
  }
)
```

**Avantages** : Accès direct aux données, pas besoin de jointure  
**Inconvénients** : Duplication de données, risque d'incohérence

#### Référence simple (ID uniquement)

```javascript
// Ajouter le champ pegi (version simplifiée) dans games2
var pegis = db.pegi.find().toArray()
var jeux2 = db.games2.find().toArray()

for (var i = 0; i < jeux2.length; i++) {
  var pegi = pegis[i % pegis.length]
  db.games2.updateOne(
    { _id: jeux2[i]._id },
    { $set: { "pegi": pegi._id } }
  )
}
```

**Avantages** : Pas de duplication, source de vérité unique  
**Inconvénients** : Nécessite une jointure pour accéder aux données

### 5.5 Jointures bidirectionnelles via `$lookup`

Voir section 2.6 pour les exemples détaillés.

---

## 6. Transactions

Les transactions garantissent l'atomicité d'opérations sur plusieurs collections.

### 6.1 Création de session

```javascript
var session = db.getMongo().startSession()
session.startTransaction()
```

### 6.2 Structure d'une transaction

```javascript
var session = db.getMongo().startSession()
session.startTransaction()

try {
  // Opérations atomiques
  // ...
  
  session.commitTransaction()
  print("Transaction réussie")
} catch (e) {
  print("Erreur détectée : " + e)
  session.abortTransaction()
} finally {
  session.endSession()
}
```

### 6.3 Transaction d'insertion

```javascript
// Transaction d'insertion (PEGI + 2 jeux)
var session = db.getMongo().startSession()
session.startTransaction()

try {
  var pegiColl = session.getDatabase("bdgames").pegi
  var games2Coll = session.getDatabase("bdgames").games2

  var newPegi = {
    Code_pegi: "PEGI70",
    Desc_pegi: "Jeux spécialement adaptés pour les séniors",
    Categorie_pegi: "Senior"
  }

  pegiColl.insertOne(newPegi)
  var pegiId = pegiColl.findOne({ Code_pegi: "PEGI70" })._id

  games2Coll.insertMany([
    {
      titre: "Brain Relax Deluxe",
      consoles: ["Switch"],
      infos: { editeur: "MindSoft", prix: 39.99 },
      pegi: pegiId
    },
    {
      titre: "Sudoku Master 3D",
      consoles: ["PC", "Switch"],
      infos: { editeur: "Logic Games Studio", prix: 29.99 },
      pegi: pegiId
    }
  ])

  session.commitTransaction()
  print("Transaction réussie : PEGI70 et 2 jeux ajoutés.")
} catch (e) {
  print("Erreur détectée, annulation de la transaction : " + e)
  session.abortTransaction()
} finally {
  session.endSession()
}
```

### 6.4 Transaction de modification synchronisée

```javascript
// Transaction de modification (PEGI + jeux liés)
var session = db.getMongo().startSession()
session.startTransaction()

try {
  var dbSession = session.getDatabase("bdgames")
  var pegiColl = dbSession.pegi
  var gamesColl = dbSession.games

  var pegiToUpdate = pegiColl.findOne({ Desc_pegi: "Scènes de violence imagées" })

  if (pegiToUpdate) {
    // Mise à jour du PEGI
    pegiColl.updateOne(
      { _id: pegiToUpdate._id },
      { $set: { Desc_pegi: "Scènes de violence ou de sexe imagées" } }
    )

    // Mise à jour synchronisée des jeux liés
    gamesColl.updateMany(
      { "pegi._id": pegiToUpdate._id },
      { $set: { "pegi.Desc_pegi": "Scènes de violence ou de sexe imagées" } }
    )

    session.commitTransaction()
    print("Transaction réussie : PEGI et jeux mis à jour.")
  } else {
    print("Aucun PEGI trouvé à mettre à jour.")
    session.abortTransaction()
  }
} catch (e) {
  print("Erreur détectée : " + e)
  session.abortTransaction()
} finally {
  session.endSession()
}
```

**Points importants** :
- Toutes les opérations doivent utiliser la même session
- Utiliser `session.getDatabase()` pour accéder aux collections
- `commitTransaction()` valide toutes les modifications
- `abortTransaction()` annule toutes les modifications en cas d'erreur

---

## 7. Validation JSON Schema

La validation de schéma permet de garantir l'intégrité des données.

### 7.1 Création/Modification de collection avec `collMod`

```javascript
// Nouvelle base de données et collection
use bdmovies
db.createCollection("movies")

// Schéma JSON pour la collection movies
db.runCommand({
  collMod: "movies",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "genre", "title", "year", "country", "director"],
      properties: {
        _id: {
          bsonType: "string",
          description: "doit être une chaîne de caractères et est obligatoire"
        },
        title: {
          bsonType: "string",
          description: "title doit être une chaîne de caractères et est obligatoire"
        },
        year: {
          bsonType: "int",
          minimum: 1950,
          maximum: 2025,
          description: "year doit être un entier entre 1950 et 2025"
        },
        genre: {
          bsonType: "string",
          description: "genre doit être une chaîne de caractères et est obligatoire"
        },
        country: {
          enum: ["USA", "FR", "IT", "DE", "Autre"],
          description: "country doit être parmi USA, FR, IT, DE, Autre"
        },
        director: {
          bsonType: "object",
          required: ["_id"],
          properties: {
            _id: {
              bsonType: "string",
              description: "doit être une chaîne de caractères"
            }
          }
        },
        actors: {
          bsonType: "array",
          maxItems: 6,
          items: {
            bsonType: "object",
            required: ["_id", "role"],
            properties: {
              _id: {
                bsonType: "string"
              },
              role: {
                bsonType: "string"
              }
            }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
})
```

### 7.2 Types BSON

Types couramment utilisés :
- `string` : chaîne de caractères
- `int` : entier
- `double` : nombre décimal
- `bool` : booléen
- `date` : date
- `object` : objet
- `array` : tableau
- `objectId` : ObjectId MongoDB

### 7.3 Contraintes

#### `required` : Champs obligatoires

```javascript
required: ["_id", "genre", "title", "year", "country", "director"]
```

#### `enum` : Valeurs autorisées

```javascript
country: {
  enum: ["USA", "FR", "IT", "DE", "Autre"]
}
```

#### `minimum` / `maximum` : Bornes numériques

```javascript
year: {
  bsonType: "int",
  minimum: 1950,
  maximum: 2025
}
```

#### `maxItems` / `minItems` : Taille des tableaux

```javascript
actors: {
  bsonType: "array",
  maxItems: 6
}
```

### 7.4 Validation et correction des documents non conformes

```javascript
// Correction des années > 2025
db.movies.updateMany(
  { year: { $gt: 2025 } },
  { $set: { year: 2025 } }
)

// Correction des pays non valides
db.movies.updateMany(
  { country: { $nin: ["USA", "FR", "IT", "DE", "Autre"] } },
  { $set: { country: "Autre" } }
)

// Réduction du tableau actors à 6 éléments maximum
db.movies.updateMany(
  { $expr: { $gt: [{ $size: { $ifNull: ["$actors", []] } }, 6] } },
  [
    {
      $set: {
        actors: { $slice: ["$actors", 6] }
      }
    }
  ]
)

// Suppression des documents invalides
db.movies.deleteMany({
  $or: [
    { title: { $exists: false } },
    { genre: { $exists: false } },
    { director: { $exists: false } }
  ]
})
```

### 7.5 `$slice` pour réduire un tableau

```javascript
// Limiter le tableau actors à 6 éléments
db.movies.updateMany(
  { $expr: { $gt: [{ $size: { $ifNull: ["$actors", []] } }, 6] } },
  [
    {
      $set: {
        actors: { $slice: ["$actors", 6] }
      }
    }
  ]
)
```

### 7.6 Exemple complet : Schéma pour la collection games

```javascript
db.runCommand({
  collMod: "games",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["titre", "consoles"],
      properties: {
        titre: {
          bsonType: "string",
          description: "titre doit être une chaîne et est obligatoire"
        },
        consoles: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "string",
            enum: ["PS4", "PS5", "Xbox One", "Xbox Series X", "Switch", "PC"]
          }
        },
        infos: {
          bsonType: "object",
          properties: {
            prix: {
              bsonType: "double",
              minimum: 0
            }
          }
        },
        "note Fnac": {
          bsonType: "double",
          minimum: 0,
          maximum: 5
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
})
```

**Niveaux de validation** :
- `off` : pas de validation
- `strict` : validation sur toutes les opérations
- `moderate` : validation uniquement sur les documents existants modifiés

**Actions de validation** :
- `error` : rejeter les opérations invalides
- `warn` : accepter mais logger un avertissement

---

## 8. Indexation

Les index améliorent les performances des requêtes.

### 8.1 Index simples

```javascript
// Index simple sur le champ titre
db.games.createIndex({ "titre": 1 })
```

**Ordre** :
- `1` : ordre croissant
- `-1` : ordre décroissant

### 8.2 Index composés

```javascript
// Index composé sur les champs editeur et prix
db.games.createIndex({ "infos.editeur": 1, "infos.prix": 1 })
```

**Règle importante** : L'ordre des champs dans l'index est important. Un index `{a: 1, b: 1}` peut être utilisé pour des requêtes sur `a` seul, mais pas efficacement pour `b` seul.

### 8.3 Index texte

```javascript
// Index texte sur le champ resume
db.games.createIndex({ "infos.resume": "text" })
```

**Utilisation** :
```javascript
db.games.find({ $text: { $search: "basket" } })
```

### 8.4 Index multikey

Créé automatiquement sur les tableaux.

```javascript
// Index MultiKey sur le champ consoles
db.games.createIndex({ "consoles": 1 })
```

### 8.5 Index unique

```javascript
// Index unique sur le champ titre
db.games.createIndex({ "titre": 1 }, { unique: true })
```

**Note** : Empêche les doublons sur le champ indexé.

### 8.6 Index TTL (Time To Live)

```javascript
// Index TTL sur le champ date sortie (expire après 10 ans)
db.games.createIndex(
  { "date sortie": 1 },
  { expireAfterSeconds: 315360000 }
)
```

**Utilisation** : Supprime automatiquement les documents après un délai.

### 8.7 Index partiel

```javascript
// Index partiel sur le champ prix (uniquement pour prix > 50)
db.games.createIndex(
  { "infos.prix": 1 },
  { partialFilterExpression: { "infos.prix": { $gt: 50 } } }
)
```

**Avantage** : Index plus petit, plus rapide à maintenir.

### 8.8 Index sparse

```javascript
// Index sparse sur le champ prix (ignore les documents sans ce champ)
db.games.createIndex(
  { "infos.prix": 1 },
  { sparse: true }
)
```

**Différence avec partiel** : Sparse ignore les documents sans le champ, partiel utilise un filtre personnalisé.

### 8.9 Index avec collation

```javascript
// Index insensible à la casse sur le champ titre
db.games.createIndex(
  { "titre": 1 },
  { collation: { locale: "en", strength: 2 } }
)
```

**Strength** :
- `1` : différencie les caractères de base
- `2` : différencie les caractères de base et les accents
- `3` : différencie les caractères de base, accents et casse

### 8.10 Inspection des index

```javascript
// Vérification des index
db.games.getIndexes()

// Validation de la collection
db.games.validate()

// Statistiques de la collection
db.games.stats()

// Taille totale des index
db.games.totalIndexSize()
```

### 8.11 Réindexation

```javascript
// Réindexation de la collection
db.games.reIndex()
```

**Utilisation** : Après suppression d'index ou corruption.

### 8.12 Analyse des plans d'exécution

```javascript
// Exemple de requête avec explain
db.games.find({ "titre": "NBA 2K24 Edition Légende Black Mamba" })
  .explain("executionStats")

// Requête utilisant un index composé
db.games.find({ "infos.editeur": "Take-Two", "infos.prix": { $gt: 50 } })
  .explain("executionStats")

// Requête utilisant un index texte
db.games.find({ $text: { $search: "basket" } })
  .explain("executionStats")
```

**Modes d'explain** :
- `"queryPlanner"` : plan de requête uniquement
- `"executionStats"` : statistiques d'exécution
- `"allPlansExecution"` : tous les plans évalués

**Métriques importantes** :
- `executionTimeMillis` : temps d'exécution
- `totalDocsExamined` : nombre de documents examinés
- `totalKeysExamined` : nombre de clés d'index examinées
- `stage` : type d'opération (IXSCAN = index scan, COLLSCAN = collection scan)

---

## 9. MapReduce via aggregate

L'Aggregation Framework remplace efficacement MapReduce pour la plupart des cas d'usage.

### 9.1 Groupements par attributs complexes

#### CA par sexe

```javascript
// Calculer le CA HT par sexe
db.commandes.aggregate([
  {
    $group: {
      _id: { $toUpper: "$user.sexe" },
      ca_ht: { $sum: "$totalht" }
    }
  },
  {
    $sort: { _id: 1 }
  }
])
```

#### CA par code postal

```javascript
// Calculer le CA TTC par code postal (CP)
db.commandes.aggregate([
  {
    $project: {
      cp: "$user.cp",
      ca_ttc: { $add: ["$totalht", "$tva"] }
    }
  },
  {
    $group: {
      _id: "$cp",
      ca_ttc_total: { $sum: "$ca_ttc" }
    }
  },
  {
    $sort: { _id: 1 }
  }
])
```

### 9.2 Manipulation de dates

```javascript
// Calculer le CA par année/mois
db.commandes.aggregate([
  {
    $project: {
      annee: { $year: "$date" },
      mois: { $month: "$date" },
      ca: "$totalht"
    }
  },
  {
    $group: {
      _id: { annee: "$annee", mois: "$mois" },
      ca_total: { $sum: "$ca" }
    }
  },
  {
    $sort: { "_id.annee": 1, "_id.mois": 1 }
  }
])
```

### 9.3 Découpage logique de champs

#### Extraction du nom de famille

```javascript
// Nombre de commandes par famille (même nom de famille)
db.commandes.aggregate([
  {
    $project: {
      nom_famille: {
        $arrayElemAt: [
          { $split: ["$user.nom", " "] },
          0
        ]
      }
    }
  },
  {
    $group: {
      _id: "$nom_famille",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  }
])
```

### 9.4 Dénormalisation via `$unwind`

```javascript
// Calculer le CA par titre de jeu
db.commandes.aggregate([
  {
    $unwind: "$games"
  },
  {
    $group: {
      _id: "$games.titre",
      ca: { $sum: "$games.prix" }
    }
  },
  {
    $sort: { ca: -1 }
  }
])

// Jeu le plus vendu
db.commandes.aggregate([
  {
    $unwind: "$games"
  },
  {
    $group: {
      _id: "$games.titre",
      nbVentes: { $sum: 1 }
    }
  },
  {
    $sort: { nbVentes: -1 }
  },
  {
    $limit: 1
  }
])
```

### 9.5 Calculs de CA, quantités, moyennes, totaux

#### CA total

```javascript
// CA total (HT + TVA)
db.commandes.aggregate([
  {
    $group: {
      _id: null,
      ca_total_ttc: { $sum: { $add: ["$totalht", "$tva"] } }
    }
  }
])
```

#### Quantités

```javascript
// Nombre de commandes par nom client
db.commandes.aggregate([
  {
    $group: {
      _id: "$user.nom",
      nb_commandes: { $sum: 1 }
    }
  },
  {
    $sort: { nb_commandes: -1 }
  }
])

// Nombre de jeux commandés par client
db.commandes.aggregate([
  {
    $project: {
      nom: "$user.nom",
      nbJeux: {
        $cond: {
          if: { $isArray: "$games" },
          then: { $size: "$games" },
          else: 0
        }
      }
    }
  },
  {
    $group: {
      _id: "$nom",
      total_jeux: { $sum: "$nbJeux" }
    }
  },
  {
    $sort: { total_jeux: -1 }
  }
])
```

#### Moyennes

```javascript
// Nombre moyen de jeux par commande
db.commandes.aggregate([
  {
    $project: {
      nbJeux: {
        $cond: {
          if: { $isArray: "$games" },
          then: { $size: "$games" },
          else: 0
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      moyenne_jeux: { $avg: "$nbJeux" }
    }
  }
])

// Prix moyen par jeu
db.commandes.aggregate([
  {
    $unwind: "$games"
  },
  {
    $group: {
      _id: "$games.titre",
      prixMoyen: { $avg: "$games.prix" }
    }
  },
  {
    $sort: { _id: 1 }
  }
])
```

---

## Conclusion

Ce cours couvre l'ensemble des fonctionnalités MongoDB pour :
- **Requêtes CRUD complètes** : find, update, delete avec filtres avancés
- **Agrégations avancées** : pipeline complexe, jointures, transformations
- **Modélisation** : références, dénormalisation, duplication
- **Transactions** : opérations atomiques multi-collections
- **Schémas** : validation JSON Schema pour l'intégrité des données
- **Indexation** : optimisation des performances
- **Analyses** : plans d'exécution et statistiques

L'ensemble forme un système cohérent pour gérer efficacement des bases de données MongoDB en production.

