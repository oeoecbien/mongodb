# Travail Pratique - InfluxDB
## Partie 1 : Concepts fondamentaux et implémentation

---

## Table des matières

1. [Introduction](#introduction)
2. [Travail à faire n°1](#travail-à-faire-n°1)
   - [Concepts de base d'InfluxDB](#concepts-de-base-dinfluxdb)
   - [Guidelines de conception de schéma](#guidelines-de-conception-de-schéma)
   - [Mise en place de l'environnement](#mise-en-place-de-lenvironnement)
3. [Travail à faire n°2](#travail-à-faire-n°2)
   - [Requêtes Flux et visualisation](#requêtes-flux-et-visualisation)
   - [Création de dashboards](#création-de-dashboards)
4. [Conclusion](#conclusion)
5. [Références](#références)

---

## Introduction

InfluxDB constitue une solution de base de données de séries temporelles (Time Series Database) open-source, spécialement conçue pour le stockage et l'interrogation de données horodatées. Cette technologie s'avère particulièrement adaptée aux domaines nécessitant la gestion de métriques, de données de capteurs IoT, d'analyses en temps réel et de monitoring de systèmes.

Le présent travail pratique vise à explorer les concepts fondamentaux d'InfluxDB, à comprendre les principes de conception de schémas optimisés, et à mettre en pratique l'utilisation de cette technologie à travers la création de requêtes et de visualisations de données.

---

## TRAVAIL A FAIRE N°1

### 1. Concepts de base d'InfluxDB

#### 1.1 Définition et contexte

InfluxDB est une base de données de séries temporelles optimisée pour stocker et interroger des données horodatées. Elle se distingue des bases de données relationnelles traditionnelles par son architecture spécialisée dans la gestion de flux de données temporelles, ce qui la rend particulièrement efficace pour les applications de monitoring, de télémétrie et d'analyse de métriques.

#### 1.2 Concepts fondamentaux

**1.2.1 Measurement (Mesure)**

Une mesure correspond conceptuellement à une table dans une base de données relationnelle. Elle regroupe un ensemble de points de données partageant une même nature sémantique. Les mesures permettent d'organiser les données par type de métrique ou d'événement.

Exemples de mesures : `temperature`, `cpu_usage`, `sensor_data`.

**1.2.2 Tags**

Les tags représentent des métadonnées indexées utilisées pour filtrer et grouper les données. Ils sont stockés sous forme de paires clé-valeur et constituent un élément clé de l'optimisation des performances dans InfluxDB.

Caractéristiques importantes :
- Les tags sont indexés, permettant des requêtes de filtrage très performantes
- Ils doivent présenter une cardinalité faible à modérée (idéalement moins de 100 000 valeurs uniques)
- Chaque combinaison unique de tags crée une série distincte

Exemples : `location=paris`, `sensor_id=001`, `host=server1`.

**1.2.3 Fields (Champs)**

Les champs contiennent les valeurs mesurées effectives. Contrairement aux tags, les champs ne sont pas indexés, ce qui explique leur utilisation pour les valeurs numériques ou textuelles qui changent fréquemment.

Types de données supportés : float, integer, string, boolean.

Exemples : `temperature=23.5`, `humidity=65`, `status="active"`.

**1.2.4 Timestamp (Horodatage)**

Chaque point de données doit être associé à un timestamp. Par défaut, InfluxDB utilise le format nanosecondes Unix. Si aucun timestamp n'est spécifié lors de l'insertion, le système utilise automatiquement l'heure actuelle.

**1.2.5 Point de données**

Un point de données constitue l'unité atomique d'information dans InfluxDB. Il se compose de :
- Une mesure
- Des tags (optionnels mais recommandés)
- Des fields (au moins un requis)
- Un timestamp

Format de ligne (Line Protocol) :
```
measurement,tag1=value1,tag2=value2 field1=value1,field2=value2 timestamp
```

Exemple concret :
```
temperature,location=paris,sensor_id=001 value=23.5,humidity=65 1609459200000000000
```

**1.2.6 Series (Série)**

Une série représente l'ensemble des points partageant la même mesure et les mêmes valeurs de tags. Le nombre de séries dans une base de données impacte directement les performances et la consommation mémoire. Il est donc crucial de minimiser la cardinalité des tags pour éviter une explosion du nombre de séries.

**1.2.7 Bucket**

Dans InfluxDB 2.0 et versions ultérieures, le concept de bucket remplace celui de base de données. Un bucket constitue un conteneur pour les données associé à une politique de rétention. L'organisation des données par buckets permet une meilleure gestion et isolation des données.

**1.2.8 Retention Policy (Politique de rétention)**

La politique de rétention définit la durée de conservation des données dans un bucket. Les données dépassant la période de rétention sont automatiquement supprimées, permettant une gestion automatique du cycle de vie des données.

---

### 2. Guidelines concernant le design d'une base InfluxDB

#### 2.1 Principes fondamentaux de conception

La conception d'un schéma InfluxDB efficace repose sur plusieurs principes fondamentaux visant à optimiser les performances, réduire la consommation de ressources et faciliter les requêtes futures.

**2.1.1 Tags vs Fields : stratégie de choix**

La distinction entre tags et fields constitue l'un des aspects les plus critiques de la conception d'un schéma InfluxDB.

**Critères pour l'utilisation de tags :**
- Métadonnées utilisées pour filtrer ou grouper les données
- Valeurs présentant une cardinalité faible à modérée (inférieure à 100 000 valeurs uniques)
- Identifiants de ressources stables (host, device_id, location)
- Catégories ou types de classification (status, type, level)

**Critères pour l'utilisation de fields :**
- Valeurs numériques mesurées (température, pression, vitesse)
- Valeurs changeant fréquemment
- Valeurs présentant une cardinalité très élevée
- Données non utilisées pour le filtrage dans les requêtes

Exemple illustratif :
```
temperature,location=paris,device=sensor01 value=23.5,unit="celsius" 1609459200
```

Dans cet exemple :
- `location` et `device` sont des tags (utilisés pour filtrage/groupage)
- `value` et `unit` sont des fields (valeurs mesurées)

**2.1.2 Minimisation de la cardinalité des tags**

La cardinalité des tags représente un facteur déterminant pour les performances d'InfluxDB. Chaque combinaison unique de valeurs de tags crée une nouvelle série, ce qui peut rapidement conduire à une explosion du nombre de séries.

**Problèmes associés à une haute cardinalité :**
- Dégradation significative des performances
- Consommation mémoire excessive
- Augmentation du temps de réponse des requêtes
- Difficultés de maintenance

**Bonnes pratiques :**
- Limiter le nombre de tags à 3-5 par mesure
- Éviter l'utilisation de valeurs uniques comme tags (IDs de transactions, timestamps)
- Utiliser des fields pour les valeurs à haute cardinalité
- Prévoir la structure avant l'insertion massive de données

**2.1.3 Conventions de nommage**

L'adoption de conventions de nommage cohérentes facilite la maintenance et l'utilisation de la base de données.

**Recommandations :**
- Utiliser des noms en minuscules avec underscores comme séparateurs
- Adopter une nomenclature descriptive mais concise
- Éviter les caractères spéciaux et les espaces
- Maintenir la cohérence à travers l'ensemble du schéma

Exemples : `cpu_usage`, `sensor_temperature`, `http_requests`.

**2.1.4 Structure des mesures**

L'organisation des mesures doit refléter la logique métier de l'application.

**Principes d'organisation :**
- Une mesure par type de métrique logique
- Regrouper les métriques conceptuellement liées dans la même mesure
- Éviter la création excessive de mesures différentes
- Maintenir une granularité appropriée

Exemple :
```
cpu,host=server1 usage=45.2,load=1.5
memory,host=server1 used=8192,free=4096
```

**2.1.5 Optimisation des requêtes**

L'efficacité des requêtes dépend fortement de la structure du schéma et des pratiques d'interrogation.

**Recommandations :**
- Inclure systématiquement des filtres de temps dans les requêtes
- Privilégier les tags pour le filtrage plutôt que les fields
- Limiter le nombre de points retournés à l'aide de la clause LIMIT
- Utiliser des fonctions d'agrégation (MEAN, SUM, MAX, MIN) pour réduire le volume de données
- Éviter les requêtes sur de larges plages temporelles sans agrégation

**2.1.6 Politique de rétention**

La définition de politiques de rétention appropriées permet de gérer efficacement le stockage et les coûts.

**Stratégies recommandées :**
- Définir des politiques de rétention adaptées aux besoins métier
- Utiliser le downsampling pour les données anciennes
- Conserver les données brutes pour une période limitée
- Agréger les données pour la conservation à long terme

**2.1.7 Structure de schéma recommandée**

Structure type d'un point de données :
```
measurement_name,
  tag1=value1,      // Cardinalité faible
  tag2=value2,      // Cardinalité faible
  tag3=value3       // Cardinalité faible
field1=value1,      // Valeur mesurée
field2=value2,      // Valeur mesurée
timestamp
```

**2.1.8 Pièges courants à éviter**

**Pratiques contre-productives :**
- Utiliser des valeurs numériques changeantes comme tags
- Créer un tag pour chaque point de données unique
- Générer dynamiquement des noms de mesures
- Stocker des données non temporelles dans InfluxDB

**Pratiques recommandées :**
- Planifier la structure du schéma avant l'insertion de données
- Effectuer des tests avec des volumes de données réalistes
- Surveiller régulièrement la cardinalité des séries
- Documenter exhaustivement le schéma de données

---

### 3. Mise en place de l'environnement InfluxDB Cloud

#### 3.1 Création d'un compte

La première étape consiste à créer un compte sur la plateforme InfluxDB Cloud, accessible via l'interface web officielle.

**Procédure :**
1. Accéder au site web : https://www.influxdata.com/
2. Sélectionner l'option "Get Started" ou "Sign Up"
3. Choisir l'offre "Free Tier" ou "Cloud Free"
4. Compléter le formulaire d'inscription avec :
   - Adresse email
   - Mot de passe
   - Nom d'organisation
5. Valider l'inscription via le lien de confirmation envoyé par email

#### 3.2 Connexion à InfluxDB Cloud

Une fois le compte créé et validé, la connexion s'effectue via l'interface web :
1. Accéder à : https://cloud2.influxdata.com/
2. S'authentifier avec les identifiants créés
3. Accéder au dashboard principal de l'organisation

#### 3.3 Création d'un bucket

Un bucket constitue le conteneur principal pour l'organisation des données.

**Procédure de création :**
1. Dans le menu de navigation, sélectionner "Load Data" ou "Buckets"
2. Cliquer sur "Create Bucket" ou sur l'icône "+"
3. Renseigner les paramètres :
   - **Name** : Nommer le bucket (exemples : `tp_influxdb`, `sample_data`)
   - **Retention Period** : Définir la durée de rétention
     - Pour les travaux pratiques : `Never` ou `30 days` selon les besoins
4. Valider la création en cliquant sur "Create"

#### 3.4 Chargement de jeux de données d'exemple

Plusieurs méthodes permettent de charger des données d'exemple dans le bucket créé.

**Méthode 1 : Utilisation des données d'exemple intégrées**

1. Dans le menu, accéder à "Sample Data" ou "Data" > "Sample Data"
2. Sélectionner un jeu de données parmi :
   - **Air Sensor Sample Data** : Données de capteurs d'air
   - **NOAA Water Sample Data** : Données météorologiques
   - **Bird Migration Sample Data** : Données de migration d'oiseaux
3. Cliquer sur "Add Data" ou "Load Sample Data"
4. Sélectionner le bucket créé précédemment
5. Attendre le chargement complet des données

**Méthode 2 : Import depuis GitHub**

1. Accéder au dépôt : https://github.com/influxdata/influxdb2-sample-data
2. Télécharger un fichier de données d'exemple
3. Dans InfluxDB Cloud, accéder à "Data" > "Sources" ou "Load Data"
4. Utiliser l'outil d'import pour charger le fichier dans le bucket

**Méthode 3 : Utilisation de l'API REST**

L'insertion de données peut également s'effectuer via l'API REST d'InfluxDB :

```bash
curl --request POST \
  'https://us-west-2-1.aws.cloud2.influxdata.com/api/v2/write?org=YOUR_ORG&bucket=YOUR_BUCKET&precision=ns' \
  --header 'Authorization: Token YOUR_TOKEN' \
  --header 'Content-Type: text/plain; charset=utf-8' \
  --data-binary 'temperature,location=paris value=23.5 1609459200000000000'
```

#### 3.5 Vérification des données

La vérification de l'intégrité et de la présence des données s'effectue via le Data Explorer :

1. Accéder à "Data Explorer" ou "Explore" dans le menu
2. Sélectionner le bucket concerné
3. Exécuter une requête de test :

```flux
from(bucket: "votre_bucket")
  |> range(start: -1h)
  |> limit(n: 10)
```

---

## TRAVAIL A FAIRE N°2

### 1. Requêtes Flux et visualisation de données

#### 1.1 Introduction au langage Flux

Flux constitue le langage de requête fonctionnel utilisé par InfluxDB 2.0. Il permet d'interroger, transformer et analyser les données de séries temporelles de manière déclarative et composable.

#### 1.2 Exemples de requêtes Flux

**1.2.1 Requête de base : Affichage des données récentes**

Cette requête permet de récupérer les points de données les plus récents dans un intervalle de temps donné.

```flux
from(bucket: "votre_bucket")
  |> range(start: -1h)
  |> limit(n: 100)
```

**1.2.2 Filtrage par mesure spécifique**

Le filtrage par mesure permet de restreindre les résultats à un type de données particulier.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
```

**1.2.3 Filtrage par tag**

Le filtrage par tag permet d'affiner les résultats selon des critères de métadonnées.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["location"] == "paris")
```

**1.2.4 Calcul de moyenne sur une période**

L'agrégation temporelle permet de réduire le volume de données et d'obtenir des statistiques sur des fenêtres temporelles.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
```

**1.2.5 Calcul de valeurs extrêmes**

Les fonctions d'agrégation permettent d'identifier les valeurs maximales et minimales.

```flux
from(bucket: "votre_bucket")
  |> range(start: -7d)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
```

**1.2.6 Groupement par tag**

Le groupement permet d'analyser les données selon différentes dimensions.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> group(columns: ["location"])
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
```

**1.2.7 Calcul de statistiques multiples**

Les requêtes peuvent combiner plusieurs opérations d'agrégation pour obtenir des statistiques complètes.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> aggregateWindow(
    every: 1h,
    fn: (tables=<-) => tables
      |> mean()
      |> map(fn: (r) => ({r with _value: r._value}))
  )
```

**1.2.8 Requête multi-champs**

Il est possible d'interroger plusieurs champs simultanément.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "sensor_data")
  |> filter(fn: (r) => r["_field"] == "temperature" or r["_field"] == "humidity")
```

**1.2.9 Calcul de taux de variation**

La fonction derivative permet de calculer le taux de variation entre les points de données.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> derivative(unit: 1s, nonNegative: false)
```

**1.2.10 Détection de seuils**

Les filtres conditionnels permettent d'identifier les valeurs dépassant certains seuils.

```flux
from(bucket: "votre_bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_value"] > 25.0)
```

#### 1.3 Requêtes adaptées aux différents types de visualisations

**1.3.1 Graphique en ligne (Line Chart)**

Les graphiques en ligne sont adaptés à la visualisation de séries temporelles continues.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["location"] == "paris")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
```

**1.3.2 Graphique à barres (Bar Chart)**

Les graphiques à barres conviennent aux comparaisons de valeurs agrégées sur des périodes discrètes.

```flux
from(bucket: "votre_bucket")
  |> range(start: -7d)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
```

**1.3.3 Graphique de type Gauge (Jauge)**

Les jauges permettent d'afficher une valeur actuelle ou récente.

```flux
from(bucket: "votre_bucket")
  |> range(start: -5m)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> last()
```

**1.3.4 Graphique Heatmap**

Les heatmaps visualisent l'intensité des valeurs sur deux dimensions (temps et catégorie).

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
```

**1.3.5 Graphique multi-séries**

La visualisation de plusieurs séries simultanément permet les comparaisons.

```flux
data = from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")

data
  |> filter(fn: (r) => r["location"] == "paris")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> yield(name: "Paris")

data
  |> filter(fn: (r) => r["location"] == "lyon")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> yield(name: "Lyon")
```

---

### 2. Création de dashboards

#### 2.1 Procédure de création

La création d'un dashboard dans InfluxDB Cloud s'effectue via l'interface Data Explorer selon la procédure suivante :

**Étape 1 : Accès au Data Explorer**
- Dans InfluxDB Cloud, sélectionner "Data Explorer" dans le menu de navigation

**Étape 2 : Sélection du bucket**
- Choisir le bucket contenant les données à visualiser dans le menu déroulant

**Étape 3 : Écriture de la requête Flux**
- Utiliser l'éditeur de requête pour composer la requête Flux
- Valider la requête avec le bouton "Submit" pour vérifier les résultats

**Étape 4 : Configuration de la visualisation**
- Sélectionner le type de graphique approprié :
  - **Line Chart** : Pour les séries temporelles continues
  - **Bar Chart** : Pour les comparaisons de valeurs agrégées
  - **Gauge** : Pour l'affichage de valeurs actuelles
  - **Table** : Pour la visualisation tabulaire des données brutes

**Étape 5 : Personnalisation du graphique**
- Ajuster les paramètres d'affichage (couleurs, axes, légendes)
- Définir les seuils et alertes si nécessaire
- Configurer les options de formatage

**Étape 6 : Sauvegarde dans un dashboard**
- Cliquer sur "Save As" > "Dashboard Cell"
- Créer un nouveau dashboard ou ajouter à un dashboard existant
- Attribuer un nom descriptif au dashboard

**Étape 7 : Personnalisation du dashboard**
- Réorganiser les cellules selon la logique de présentation
- Ajouter des annotations pour contextualiser les données
- Configurer les variables de dashboard pour la flexibilité

#### 2.2 Exemple de dashboard : Monitoring de température

L'exemple suivant illustre la création d'un dashboard complet pour le monitoring de température avec plusieurs visualisations complémentaires.

**Requête 1 : Température moyenne par heure**

Cette visualisation présente l'évolution de la température moyenne sur une période de 24 heures avec agrégation horaire.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
```

**Requête 2 : Température actuelle**

Cette visualisation affiche la dernière valeur de température mesurée, utile pour un monitoring en temps réel.

```flux
from(bucket: "votre_bucket")
  |> range(start: -5m)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> last()
```

**Requête 3 : Température par location**

Cette visualisation permet de comparer les températures entre différentes localisations.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> group(columns: ["location"])
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
```

**Requête 4 : Statistiques agrégées**

Cette visualisation présente plusieurs statistiques (minimum, maximum, moyenne) sur une période donnée.

```flux
from(bucket: "votre_bucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> aggregateWindow(every: 1h, fn: (tables=<-) => tables
    |> mean()
    |> map(fn: (r) => ({r with _value: r._value}))
  )
```

---

## Conclusion

Ce travail pratique a permis d'explorer les concepts fondamentaux d'InfluxDB et de mettre en pratique l'utilisation de cette technologie de base de données de séries temporelles. Les principaux enseignements tirés de cette étude concernent :

1. **Architecture et concepts** : La compréhension de la structure des données (measurements, tags, fields, séries) est essentielle pour concevoir des schémas efficaces.

2. **Optimisation du schéma** : La distinction entre tags et fields, ainsi que la gestion de la cardinalité, constituent des facteurs critiques pour les performances.

3. **Langage Flux** : Le langage de requête Flux offre une flexibilité importante pour l'analyse et la transformation des données temporelles.

4. **Visualisation** : L'intégration des requêtes avec les outils de visualisation permet de créer des dashboards informatifs pour le monitoring et l'analyse.

Les bonnes pratiques identifiées, notamment concernant la minimisation de la cardinalité des tags et l'optimisation des requêtes, sont applicables à tout projet utilisant InfluxDB pour garantir des performances optimales.

---

## Références

1. InfluxData. (2024). *InfluxDB Documentation*. https://docs.influxdata.com/influxdb/

2. InfluxData. (2024). *Schema Design Best Practices*. https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/schema-design/

3. InfluxData. (2024). *Flux Language Guide*. https://docs.influxdata.com/flux/

4. InfluxData. (2024). *InfluxDB 2.0 Sample Data*. https://github.com/influxdata/influxdb2-sample-data

5. InfluxData. (2024). *Sample Data Documentation*. https://docs.influxdata.com/influxdb/cloud/reference/sample-data/
