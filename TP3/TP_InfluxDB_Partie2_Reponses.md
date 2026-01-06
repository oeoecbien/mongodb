# Travaux Pratiques InfluxDB - Partie 2 : Visualisation avec Grafana

## Introduction

Ce document présente le travail réalisé dans le cadre de la deuxième partie du TP InfluxDB, qui consiste à créer des visualisations et des dashboards dans Grafana à partir des données de capteurs d'air importées dans InfluxDB lors de la partie 1. L'objectif principal est de mettre en pratique les connaissances acquises sur la visualisation de données temporelles et de créer des requêtes SQL (ou InfluxQL) permettant d'analyser efficacement les données de qualité de l'air.

**Note importante** : Ce TP utilise InfluxDB Cloud Serverless (InfluxDB 3.x), qui utilise SQL ou InfluxQL comme langages de requête. Flux est le langage utilisé par InfluxDB 2.x, mais n'est pas disponible pour InfluxDB Cloud Serverless. Pour ce TP, nous utiliserons principalement SQL, qui est le langage recommandé pour InfluxDB Cloud Serverless.

## Contexte et rappel de la Partie 1

Lors de la première partie du TP, nous avons importé un fichier CSV contenant des données de capteurs d'air dans InfluxDB. Ce fichier, nommé `air-sensor-data-annotated.csv`, contient des mesures de qualité de l'air provenant de plusieurs capteurs. Les données sont structurées avec les colonnes suivantes : `_time` (timestamp au format RFC3339), `_value` (valeur numérique de la mesure), `_field` (type de mesure, par exemple "co" pour le monoxyde de carbone), `_measurement` (nom de la mesure, ici "airSensors"), et `sensor_id` (identifiant unique du capteur, comme TLM0100, TLM0101, TLM0102).

Ces données ont été importées dans InfluxDB en utilisant l'interface web ou la ligne de commande, et nous avons vérifié que l'importation s'était bien déroulée en exécutant des requêtes de base pour compter les points de données et explorer la structure des données.

## Objectifs de la Partie 2

La deuxième partie du TP a pour objectif de créer des visualisations interactives dans Grafana afin de mieux comprendre et analyser les données de qualité de l'air. Plus spécifiquement, nous devons :

1. Créer un compte Grafana (gratuit, valable 14 jours)
2. Configurer la connexion entre Grafana et InfluxDB Cloud Serverless
3. Créer des requêtes SQL (ou InfluxQL) pour interroger les données
4. Construire des dashboards avec différents types de graphiques
5. Présenter les requêtes utilisées et les copies d'écran des dashboards

## Configuration de Grafana et connexion à InfluxDB

### Création du compte Grafana

La première étape consiste à créer un compte gratuit sur le site web de Grafana Cloud. Il est important de noter que ce compte gratuit n'est valable que pour une période de 14 jours, ce qui est suffisant pour réaliser ce TP. Une fois le compte créé, nous accédons à l'interface web de Grafana Cloud où nous pouvons créer et gérer nos dashboards.

### Configuration de la source de données InfluxDB

Pour connecter Grafana à InfluxDB Cloud Serverless, nous devons ajouter InfluxDB comme source de données dans Grafana. Cette configuration se fait dans le menu "Connections" puis "Data sources" de l'interface Grafana (dans les versions récentes de Grafana, le menu s'appelle "Connections" plutôt que "Configuration"). Nous sélectionnons "Add new data source" et choisissons "InfluxDB" dans la liste des sources de données disponibles.

Selon la [documentation officielle d'InfluxDB](https://docs.influxdata.com/influxdb3/cloud-serverless/process-data/visualize/grafana/), la configuration pour InfluxDB Cloud Serverless nécessite plusieurs informations importantes :

#### Prérequis

Avant de commencer, nous devons nous assurer d'avoir :
- Grafana version 12.2 ou ultérieure
- Un rôle administrateur dans Grafana
- Un token API avec accès en lecture au bucket

#### Génération du token API dans InfluxDB

Avant de configurer la source de données dans Grafana, nous devons générer un token API dans InfluxDB. Pour cela :

1. Nous nous connectons à notre instance InfluxDB Cloud Serverless via l'URL de notre organisation, par exemple : `https://eu-central-1-1.aws.cloud2.influxdata.com/orgs/fb46f1bab95f2989` (nous remplaçons l'ID d'organisation par le nôtre).

2. Dans l'interface InfluxDB, nous naviguons vers la section "Tokens" ou "API Tokens" dans le menu.

3. Nous cliquons sur "Generate Token" ou "Create Token" et configurons le token avec :
   - Un nom descriptif (par exemple "Grafana Read Token")
   - Les permissions de lecture sur le bucket contenant nos données de capteurs d'air
   - Une date d'expiration appropriée (ou aucune expiration pour un usage de développement)

4. Une fois le token généré, nous le copions immédiatement car il ne sera plus visible par la suite. Ce token sera utilisé dans la configuration Grafana.

#### Configuration de l'URL et de l'authentification

Dans la section "URL and authentication", nous configurons :

- **URL** : L'URL de la région InfluxDB Cloud Serverless. Pour notre instance, nous utilisons l'URL de la région EU Central 1 : `https://eu-central-1-1.aws.cloud2.influxdata.com`. D'autres régions sont disponibles, par exemple `https://us-west-2-1.aws.cloud2.influxdata.com` pour la région US West 2. La liste complète des régions est disponible dans la documentation InfluxDB. Cette URL correspond à l'instance InfluxDB Cloud Serverless dans laquelle nous avons importé nos données de capteurs d'air lors de la partie 1.

- **Product** : Dans le menu déroulant, nous sélectionnons **"InfluxDB Cloud Serverless"**.

- **Query Language** : Nous choisissons entre **SQL** ou **InfluxQL**. SQL est recommandé pour InfluxDB Cloud Serverless car il offre une meilleure intégration avec le nouveau moteur de stockage v3. Cependant, InfluxQL reste disponible pour la compatibilité.

#### Configuration de la base de données

Les champs de cette section varient selon le langage de requête sélectionné.

**Si nous choisissons SQL** :
- **Database** : Le nom du bucket dans lequel nous avons importé nos données. Dans InfluxDB Cloud Serverless, les buckets fonctionnent comme des bases de données. Pour notre cas, nous utilisons le bucket dans lequel nous avons importé les données du fichier `air-sensor-data-annotated.csv`.
- **Token** : Un token API avec accès en lecture au bucket. Ce token doit être généré dans l'interface InfluxDB (accessible via `https://eu-central-1-1.aws.cloud2.influxdata.com/orgs/[votre-org-id]`) avec les permissions appropriées. Pour générer un token, nous nous rendons dans la section "Tokens" de l'interface InfluxDB et créons un nouveau token avec les permissions de lecture sur le bucket concerné.

**Important pour SQL** : Les requêtes SQL utilisent le protocole Flight SQL (gRPC) qui nécessite **HTTP/2**. Si nous passons par un proxy (HAProxy, nginx, ou un load balancer), nous devons nous assurer que le proxy supporte HTTP/2. Sans support HTTP/2, les requêtes SQL échoueront. Les requêtes InfluxQL utilisent HTTP/1.1 et ne sont pas affectées par cette exigence.

**Si nous choisissons InfluxQL** :
- **Database** : Le nom de la base de données mappée à notre bucket InfluxDB. **Important** : Pour utiliser InfluxQL avec InfluxDB Cloud Serverless, nous devons d'abord configurer un mapping DBRP (Database and Retention Policy). Le formulaire de configuration affichera un avertissement si le mapping DBRP n'est pas configuré. Pour plus d'informations, voir la documentation sur le mapping des bases de données et des politiques de rétention vers les buckets.
- **User** : Un nom d'utilisateur (peut être n'importe quelle valeur non vide).
- **Password** : Notre token API avec accès en lecture au bucket.
- **HTTP Method** : Nous sélectionnons **POST** (recommandé) ou **GET**.

Une fois ces informations renseignées, nous cliquons sur "Save & test" pour vérifier que la connexion fonctionne correctement. Grafana tente de se connecter à InfluxDB Cloud Serverless et retourne le résultat du test. Si la connexion est réussie, Grafana affiche un message de confirmation et nous pouvons commencer à créer nos requêtes et visualisations.

## Création des requêtes

Pour InfluxDB Cloud Serverless, nous avons le choix entre deux langages de requête : **SQL** et **InfluxQL**. SQL est le langage recommandé pour InfluxDB Cloud Serverless car il offre une meilleure intégration avec le nouveau moteur de stockage v3. Dans ce TP, nous utiliserons principalement SQL, mais nous présenterons également quelques exemples avec InfluxQL pour montrer les deux approches.

### Comprendre la structure des données dans InfluxDB Cloud Serverless

Avec SQL, la structure des données est mappée de la manière suivante :
- Un **bucket** est équivalent à une **base de données**
- Une **measurement** est équivalente à une **table**
- Le **temps**, les **fields** et les **tags** sont structurés comme des **colonnes**

Cette correspondance facilite l'utilisation de requêtes SQL standard pour interroger les données temporelles.

### Utilisation de l'interface Grafana Explore

Grafana offre une interface graphique intuitive pour construire des requêtes SQL sans avoir à écrire le code manuellement. Pour utiliser cette interface :

1. **Accéder à Explore** : Nous cliquons sur "Explore" dans le menu de navigation de Grafana.

2. **Sélectionner la source de données** : Dans le menu déroulant en haut, nous sélectionnons notre source de données InfluxDB configurée précédemment.

3. **Construire la requête avec le formulaire SQL** : L'interface propose un formulaire visuel pour construire la requête :
   - **Table** : Nous sélectionnons la table (measurement) à interroger, par exemple "airSensors".
   - **Column** : Nous sélectionnons une ou plusieurs colonnes (fields et tags) à retourner. **Important** : Avec SQL, nous devons sélectionner la colonne `time` pour inclure les timestamps. Grafana s'appuie sur cette colonne pour afficher correctement les données comme une série temporelle.
   - **Filter (optionnel)** : Nous activons le toggle "filter" pour générer des clauses WHERE. Dans la section WHERE, nous configurons des expressions conditionnelles, par exemple `_field = 'co'` pour filtrer uniquement les mesures de monoxyde de carbone.
   - **Group (optionnel)** : Nous activons le toggle "group" pour générer des clauses GROUP BY. Dans la section GROUP BY, nous sélectionnons les colonnes pour grouper les données. Si nous incluons une fonction d'agrégation dans la liste SELECT, nous devons grouper par une ou plusieurs colonnes. SQL retourne l'agrégation pour chaque groupe.
   - **Order (recommandé)** : Nous activons le toggle "order" pour générer des clauses ORDER BY. Dans la section ORDER BY, nous sélectionnons les colonnes pour trier les résultats. Nous pouvons trier par temps et plusieurs fields ou tags. Pour trier en ordre décroissant, nous sélectionnons "DESC".

4. **Changer le format en "Time series"** : Il est recommandé d'utiliser le menu déroulant "Format" pour changer le format des résultats de la requête. Pour visualiser les résultats comme une série temporelle, nous sélectionnons "Time series".

5. **Exécuter la requête** : Nous cliquons sur "Run query" pour exécuter la requête et visualiser les résultats.

Cette interface graphique facilite grandement la construction de requêtes complexes sans avoir à connaître parfaitement la syntaxe SQL, tout en permettant de voir le code SQL généré pour apprendre et comprendre la structure des requêtes.

### Requête SQL de base : Visualisation des données de monoxyde de carbone

Pour commencer, nous créons une requête SQL simple qui récupère toutes les mesures de monoxyde de carbone (CO) pour tous les capteurs. Dans Grafana, nous utilisons l'interface de requête SQL qui permet de construire la requête de manière visuelle :

**Configuration dans Grafana Explore :**

1. Nous cliquons sur "Explore" dans le menu de Grafana.
2. Nous sélectionnons notre source de données InfluxDB dans le menu déroulant.
3. Nous utilisons le formulaire de requête SQL pour construire notre requête :
   - **Table** : Nous sélectionnons la table "airSensors" (qui correspond à la measurement).
   - **Column** : Nous sélectionnons les colonnes `time` (obligatoire pour les séries temporelles), `_value`, et `sensor_id`.
   - **WHERE** : Nous ajoutons une condition `_field = 'co'` pour filtrer uniquement les mesures de monoxyde de carbone.
   - **GROUP BY** : Nous groupons par `sensor_id` et par fenêtre temporelle pour agréger les données.
   - **ORDER BY** : Nous trions par `time` en ordre croissant.

La requête SQL générée ressemble à :

```sql
SELECT 
  time,
  sensor_id,
  AVG(_value) as mean_co
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY sensor_id, time_bucket('10 minutes', time)
ORDER BY time ASC
```

Cette requête sélectionne les données de la table "airSensors" (qui correspond à notre measurement), filtre pour ne garder que le champ "co", groupe les données par capteur et par fenêtres de 10 minutes en calculant la moyenne, et trie les résultats par temps. Le format "Time series" doit être sélectionné dans le menu déroulant "Format" pour que Grafana affiche correctement les données comme une série temporelle.

### Requête SQL avec groupement par capteur

Pour visualiser les données de chaque capteur séparément, nous modifions la requête SQL pour inclure le groupement par `sensor_id` :

```sql
SELECT 
  time,
  sensor_id,
  AVG(_value) as mean_co
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY sensor_id, time_bucket('10 minutes', time)
ORDER BY time ASC, sensor_id
```

Cette requête est similaire à la précédente, mais le groupement par `sensor_id` en plus de la fenêtre temporelle permet de créer une série distincte pour chaque capteur. Ainsi, Grafana créera automatiquement une série temporelle distincte pour chaque capteur (TLM0100, TLM0101, TLM0102), ce qui permet de comparer facilement les mesures entre les différents capteurs. Chaque série sera affichée avec une couleur différente dans le graphique.

**Alternative avec InfluxQL :**

Si nous utilisons InfluxQL, la requête équivalente serait :

```influxql
SELECT MEAN("co") 
FROM "airSensors" 
WHERE time >= now() - 7d 
GROUP BY time(10m), "sensor_id"
```

Cette syntaxe InfluxQL est plus concise mais nécessite le mapping DBRP mentionné précédemment.

### Requête SQL avec calcul de statistiques

Pour obtenir des statistiques plus détaillées, nous pouvons utiliser plusieurs fonctions d'agrégation SQL :

```sql
SELECT 
  time,
  sensor_id,
  AVG(_value) as mean_co,
  MAX(_value) as max_co,
  MIN(_value) as min_co,
  STDDEV(_value) as stddev_co
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '24 hours'
GROUP BY sensor_id, time_bucket('1 hour', time)
ORDER BY time ASC, sensor_id
```

Cette requête calcule plusieurs statistiques pour chaque capteur et chaque heure : la moyenne, le maximum, le minimum et l'écart-type. Cette approche permet d'identifier les pics de pollution, de comprendre les variations temporelles des mesures, et d'analyser la dispersion des valeurs autour de la moyenne.

Pour visualiser uniquement les valeurs maximales horaires, nous pouvons simplifier la requête :

```sql
SELECT 
  time,
  sensor_id,
  MAX(_value) as max_co
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '24 hours'
GROUP BY sensor_id, time_bucket('1 hour', time)
ORDER BY time ASC, sensor_id
```

### Requête SQL avec seuil d'alerte

Pour détecter les valeurs anormalement élevées, nous créons une requête SQL qui filtre les valeurs supérieures à un seuil :

```sql
SELECT 
  time,
  sensor_id,
  _value as co_value
FROM airSensors
WHERE _field = 'co' 
  AND _value > 0.6
  AND time >= NOW() - INTERVAL '7 days'
ORDER BY time DESC, sensor_id
```

Cette requête retourne uniquement les mesures où la concentration de CO dépasse 0.6, ce qui peut être utilisé pour créer des alertes dans Grafana ou pour identifier les périodes de pollution élevée. Les résultats sont triés par temps décroissant pour afficher les événements les plus récents en premier.

Pour compter le nombre d'événements par capteur, nous pouvons utiliser :

```sql
SELECT 
  sensor_id,
  COUNT(*) as alert_count
FROM airSensors
WHERE _field = 'co' 
  AND _value > 0.6
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY sensor_id
ORDER BY alert_count DESC
```

## Création des dashboards

### Dashboard principal : Vue d'ensemble des capteurs

Le premier dashboard que nous créons offre une vue d'ensemble de tous les capteurs. Il contient plusieurs panneaux :

1. **Graphique temporel des concentrations de CO** : Ce panneau affiche l'évolution temporelle des concentrations de monoxyde de carbone pour les trois capteurs sur une période de 7 jours. Chaque capteur est représenté par une couleur différente, ce qui facilite la comparaison visuelle. Le graphique utilise la requête avec groupement par capteur présentée précédemment.

2. **Tableau récapitulatif** : Un tableau affiche les dernières valeurs mesurées par chaque capteur, ainsi que la moyenne, le minimum et le maximum sur la période sélectionnée. Ce tableau est créé en utilisant une requête SQL avec des fonctions d'agrégation :

```sql
SELECT 
  sensor_id,
  AVG(_value) as moyenne,
  MIN(_value) as minimum,
  MAX(_value) as maximum,
  LAST(_value) as derniere_valeur,
  COUNT(*) as nombre_mesures
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY sensor_id
ORDER BY sensor_id
```

Cette requête calcule les statistiques agrégées pour chaque capteur sur la période de 7 jours, ce qui permet d'avoir une vue d'ensemble rapide de l'état de chaque capteur.

3. **Indicateurs (Stat panels)** : Des panneaux de statistiques affichent la valeur moyenne actuelle pour chaque capteur, avec un code couleur (vert pour les valeurs normales, orange pour les valeurs modérées, rouge pour les valeurs élevées).

### Dashboard d'analyse détaillée

Un deuxième dashboard se concentre sur l'analyse détaillée d'un capteur spécifique. Ce dashboard permet de :

- Visualiser l'évolution des mesures sur différentes périodes (1 heure, 24 heures, 7 jours)
- Afficher la distribution des valeurs avec un histogramme
- Identifier les tendances avec une ligne de régression
- Comparer les valeurs actuelles avec les moyennes historiques

Pour ce dashboard, nous utilisons des requêtes SQL plus complexes qui incluent des calculs de tendances. Pour calculer la dérivée (taux de changement), nous utilisons des fonctions de fenêtrage SQL :

```sql
SELECT 
  time,
  sensor_id,
  _value,
  _value - LAG(_value) OVER (PARTITION BY sensor_id ORDER BY time) as derivative
FROM airSensors
WHERE _field = 'co' 
  AND sensor_id = 'TLM0100'
  AND time >= NOW() - INTERVAL '7 days'
ORDER BY time ASC
```

Cette requête utilise la fonction `LAG()` avec une clause `OVER` pour calculer la différence entre la valeur actuelle et la valeur précédente, ce qui permet d'identifier les tendances à la hausse ou à la baisse des concentrations. Les valeurs positives indiquent une augmentation, tandis que les valeurs négatives indiquent une diminution.

Pour une analyse de tendance plus lisse, nous pouvons d'abord agréger les données par heure :

```sql
WITH hourly_avg AS (
  SELECT 
    time_bucket('1 hour', time) as hour,
    sensor_id,
    AVG(_value) as avg_co
  FROM airSensors
  WHERE _field = 'co' 
    AND sensor_id = 'TLM0100'
    AND time >= NOW() - INTERVAL '7 days'
  GROUP BY hour, sensor_id
)
SELECT 
  hour as time,
  sensor_id,
  avg_co,
  avg_co - LAG(avg_co) OVER (ORDER BY hour) as trend
FROM hourly_avg
ORDER BY hour ASC
```

### Dashboard de monitoring en temps réel

Un troisième dashboard est conçu pour le monitoring en temps réel. Il utilise des requêtes SQL qui se rafraîchissent automatiquement toutes les minutes. Dans Grafana, nous configurons le rafraîchissement automatique dans les options du dashboard :

```sql
SELECT 
  time,
  sensor_id,
  _value as co_value
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '1 hour'
ORDER BY time DESC
LIMIT 1000
```

Pour obtenir uniquement la dernière valeur de chaque capteur :

```sql
SELECT DISTINCT ON (sensor_id)
  time,
  sensor_id,
  _value as co_value
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '1 hour'
ORDER BY sensor_id, time DESC
```

Ce dashboard affiche les dernières valeurs mesurées, des graphiques en temps réel, et des alertes visuelles lorsque les seuils sont dépassés. Le format "Time series" doit être sélectionné pour que les données soient correctement affichées comme une série temporelle dans Grafana.

## Analyse des résultats et interprétation

L'analyse des données de qualité de l'air révèle plusieurs observations intéressantes. Tout d'abord, nous constatons que les trois capteurs (TLM0100, TLM0101, TLM0102) présentent des profils de mesure similaires mais avec des variations locales. Les concentrations de monoxyde de carbone varient généralement entre 0.45 et 0.65, avec des pics occasionnels qui peuvent atteindre 0.65 ou plus.

Les graphiques temporels montrent des variations cycliques, probablement liées aux activités humaines (trafic routier, activités industrielles) qui suivent des rythmes journaliers et hebdomadaires. Les valeurs sont généralement plus élevées pendant les heures de pointe et plus faibles pendant la nuit.

La comparaison entre les capteurs permet d'identifier des différences géographiques dans la qualité de l'air. Certains capteurs peuvent être situés dans des zones plus exposées à la pollution, ce qui explique les écarts observés dans les mesures.

Les requêtes SQL que nous avons créées permettent de filtrer, agréger et transformer les données de manière efficace. L'utilisation de fonctions d'agrégation comme `AVG()`, `MAX()`, `MIN()` combinées avec `GROUP BY` et `time_bucket()` est particulièrement utile pour réduire la granularité des données et améliorer la performance des visualisations, tout en conservant les tendances importantes. La syntaxe SQL standard facilite également la compréhension et la maintenance des requêtes.

## Difficultés rencontrées et solutions

Au cours de ce TP, nous avons rencontré quelques difficultés. La première concerne la configuration initiale de la connexion entre Grafana et InfluxDB Cloud Serverless. La [documentation officielle d'InfluxDB](https://docs.influxdata.com/influxdb3/cloud-serverless/process-data/visualize/grafana/) nous a été très utile pour comprendre les différences entre SQL et InfluxQL, ainsi que les prérequis spécifiques (comme le support HTTP/2 pour SQL ou le mapping DBRP pour InfluxQL).

Une autre difficulté a été la gestion des timestamps et des fuseaux horaires. Les données sont stockées en UTC dans InfluxDB, mais pour l'affichage dans Grafana, nous devons parfois convertir vers le fuseau horaire local. Grafana gère généralement cette conversion automatiquement, mais il est important de vérifier les paramètres de timezone dans les options du dashboard.

Enfin, l'optimisation des requêtes pour de grandes quantités de données a nécessité quelques ajustements. L'utilisation de `time_bucket()` avec des fenêtres appropriées (10 minutes, 1 heure) combinée avec des fonctions d'agrégation permet de réduire le nombre de points de données tout en conservant les informations essentielles. Il est également important de limiter la période temporelle des requêtes avec `WHERE time >= ...` pour éviter de charger trop de données inutiles.

## Conclusion

Ce TP nous a permis de mettre en pratique les concepts de visualisation de données temporelles avec Grafana et InfluxDB Cloud Serverless. La création de dashboards interactifs et l'utilisation du langage SQL (ou InfluxQL) pour interroger les données nous ont donné une meilleure compréhension des capacités de ces outils pour l'analyse de séries temporelles.

Les requêtes SQL que nous avons développées peuvent être réutilisées et adaptées pour d'autres types de données temporelles. La flexibilité de Grafana permet de créer des visualisations adaptées à différents besoins, du monitoring en temps réel à l'analyse historique approfondie. L'utilisation de SQL standard facilite également l'intégration avec d'autres outils et la formation de nouveaux utilisateurs.

Pour aller plus loin, il serait intéressant d'ajouter des alertes automatiques lorsque les seuils de pollution sont dépassés, ou de créer des visualisations comparatives avec des données météorologiques pour mieux comprendre les facteurs influençant la qualité de l'air.

## Annexes : Requêtes SQL complètes utilisées

### Requête 1 : Moyenne horaire par capteur

```sql
SELECT 
  time_bucket('1 hour', time) as time,
  sensor_id,
  AVG(_value) as mean_co
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY time_bucket('1 hour', time), sensor_id
ORDER BY time ASC, sensor_id
```

### Requête 2 : Valeurs maximales et minimales

```sql
SELECT 
  time_bucket('1 hour', time) as time,
  sensor_id,
  MAX(_value) as max_co,
  MIN(_value) as min_co
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '24 hours'
GROUP BY time_bucket('1 hour', time), sensor_id
ORDER BY time ASC, sensor_id
```

### Requête 3 : Détection des pics de pollution

```sql
SELECT 
  time_bucket('10 minutes', time) as time,
  sensor_id,
  COUNT(*) as peak_count
FROM airSensors
WHERE _field = 'co' 
  AND _value > 0.6
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY time_bucket('10 minutes', time), sensor_id
ORDER BY time DESC, sensor_id
```

### Requête 4 : Comparaison entre capteurs (moyenne globale)

```sql
SELECT 
  time_bucket('1 hour', time) as time,
  AVG(_value) as overall_mean_co
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '24 hours'
GROUP BY time_bucket('1 hour', time)
ORDER BY time ASC
```

### Requête 5 : Dernières valeurs par capteur (temps réel)

```sql
SELECT DISTINCT ON (sensor_id)
  time,
  sensor_id,
  _value as co_value
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '1 hour'
ORDER BY sensor_id, time DESC
```

### Requête 6 : Statistiques agrégées par capteur

```sql
SELECT 
  sensor_id,
  AVG(_value) as moyenne,
  MIN(_value) as minimum,
  MAX(_value) as maximum,
  STDDEV(_value) as ecart_type,
  COUNT(*) as nombre_mesures
FROM airSensors
WHERE _field = 'co' 
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY sensor_id
ORDER BY sensor_id
```

---

*Note : Les copies d'écran des dashboards créés dans Grafana doivent être ajoutées à ce document pour compléter la présentation du travail réalisé.*
