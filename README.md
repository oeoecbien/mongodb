# MongoDB

## Requêtes simples (find)

- **Comparateurs** : `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$nin`
- **Opérateurs logiques** : `$or`
- **Projection de champs**
- **Filtres par regex**
- **Tests d'existence** : `$exists`
- **Tri** : `.sort()`
- **Pagination** : `.skip()`

## Aggregation Framework

- **Étapes vues** : `$match`, `$project`, `$unwind`, `$group`, `$sort`
- **Expressions internes** : `$avg`, `$max`, `$sum`, `$size`, `$slice`, `$add`, `$toUpper`, `$split`, `$arrayElemAt`, `$cond`, `$isArray`, `$year`, `$month`
- **Groupements** : simples et composés
- **Calculs** : moyennes, max, totaux, comptages
- **Agrégation multi-dimensionnelle** (éditeur + console)
- **Pagination interne** via skip (non dans pipeline ici)
- **Jointures** via `$lookup`
- **Transformation** avec `$project`

## Fonctions annexes

- `countDocuments()`, `distinct()`
- Opérateurs de pipeline modernes : `$count` interne au groupe

## Mises à jour

- **Méthodes** : `updateOne`, `updateMany`
- **Opérateurs** : `$set`, `$unset`
- **Suppressions** : `deleteOne`, `deleteMany`

## Modélisation

- Duplication de collection via `$out`
- Insertion en masse (`insertMany`)
- Boucles JS côté shell
- Injection d'objets imbriqués
- Référence simple (ID) et référence enrichie (objet complet)
- Jointures bidirectionnelles via `$lookup`

## Transactions

- Création de session
- `startTransaction`, `commitTransaction`, `abortTransaction`
- Écritures atomiques multi-collections
- Mise à jour synchronisée de documents liés

## Validation JSON Schema

- Création/Modification de collection avec `collMod`
- Types BSON
- **Contraintes** : `required`, `enum`, `minimum`, `maximum`, `maxItems`
- Validation et correction des documents non conformes
- `$slice` pour réduire un tableau

## Indexation

- **Types d'index** : simples, composés, texte, multikey, unique, TTL, partiel, sparse, collation
- **Inspection** : `getIndexes`, `stats`, `totalIndexSize`
- **Réindexation** : `reIndex()`
- **Analyse des plans** : `.explain("executionStats")`

## MapReduce via aggregate

- Groupements par attributs complexes (CA par sexe, par CP)
- Manipulation de dates
- Découpage logique de champs (nom de famille)
- Dénormalisation via `$unwind`
- Calcul du CA, quantités, moyennes, totaux

---

**Ensemble cohérent** : requêtes CRUD complètes, agrégations avancées, modélisation, transactions, schémas, indexation, analyses de performance.