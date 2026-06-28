# Guide d'Import de Données

## Vue d'ensemble

Le système d'import vous permet de synchroniser vos données ERP existantes avec le dashboard BâtiPilot sans saisie manuelle. Exportez simplement vos données en CSV depuis votre ERP et importez-les en quelques clics.

## 🎯 Workflow recommandé

1. **Export hebdomadaire** : Exportez vos données depuis votre ERP chaque lundi matin
2. **Import** : Uploadez les fichiers CSV sur `/import`
3. **Vérification** : Les données s'affichent automatiquement sur le dashboard
4. **Agents IA** : Les agents utilisent ces données en temps réel

## 📁 Formats de fichiers supportés

- CSV (`.csv`)
- Excel (`.xlsx`, `.xls`)

## 📊 Types de données importables

### 1. Devis

**Colonnes attendues :**
- `client` - Nom du client (requis)
- `montant` - Montant en euros (requis)
- `date_envoi` - Date d'envoi du devis
- `statut` - Statut : "En attente", "Accepté", "Refusé", "Envoyé"
- `relances` - Nombre de relances effectuées

**Template :** `/public/templates/devis-template.csv`

**Exemple :**
```csv
client,montant,date_envoi,statut,relances
Villa Dubois,34500,2024-06-18,En attente,2
Restaurant Le Phare,12800,2024-06-21,En attente,1
```

### 2. Chantiers

**Colonnes attendues :**
- `nom` - Nom du chantier (requis)
- `montant` - Montant total en euros (requis)
- `heures_pointees` - Heures travaillées
- `avancement` - Pourcentage d'avancement (0-100)
- `rentabilite` - Pourcentage de rentabilité

**Template :** `/public/templates/chantiers-template.csv`

**Exemple :**
```csv
nom,montant,heures_pointees,avancement,rentabilite
Extension Pavillon Nord,86000,124,78,34
Rénovation Loft Bastille,52400,88,61,28
```

### 3. Logs d'activité des agents

**Colonnes attendues :**
- `agent` - Nom de l'agent (requis)
- `action` - Description de l'action (requis)
- `timestamp` - Date et heure (ISO 8601)
- `details` - Détails supplémentaires

**Template :** `/public/templates/logs-template.csv`

**Exemple :**
```csv
agent,action,timestamp,details
Relance Devis,Email envoyé,2024-06-28T10:30:00Z,Relance client Villa Dubois
Briefing du matin,Rapport généré,2024-06-28T08:00:00Z,Briefing quotidien compilé
```

## 🔄 Mapping automatique des colonnes

Le système est flexible et peut reconnaître plusieurs noms de colonnes :

### Devis
- `client` = `customer` = `nom_client`
- `montant` = `amount` = `prix`
- `date_envoi` = `date` = `sent_date`
- `statut` = `status` = `etat`

### Chantiers
- `nom` = `name` = `chantier`
- `heures_pointees` = `heures` = `hours`
- `avancement` = `progress` = `progression`
- `rentabilite` = `rentabilité` = `profitability`

### Logs
- `agent` = `agent_name` = `nom_agent`
- `action` = `activity` = `activite`
- `timestamp` = `date` = `datetime`

## 🚀 Comment faire l'export depuis votre ERP

### Pour la plupart des ERP :

1. Ouvrez votre module Devis/Chantiers
2. Cherchez "Exporter" ou "Export to CSV"
3. Sélectionnez les colonnes nécessaires
4. Sauvegardez le fichier

### ERP populaires :

#### Sage
1. Aller dans la liste des devis/chantiers
2. Clic droit → "Exporter"
3. Choisir format CSV
4. Sélectionner les colonnes

#### EBP
1. Menu "Fichier" → "Exporter"
2. Choisir la liste à exporter
3. Format CSV délimité par virgules

#### Excel/Custom
Si vous gérez vos données dans Excel :
1. Structurez vos colonnes comme dans les templates
2. Sauvegardez en CSV (UTF-8)

## 💡 Conseils

### Encodage
- Utilisez UTF-8 pour éviter les problèmes d'accents
- Dans Excel : "Enregistrer sous" → CSV UTF-8

### Séparateur
- Utilisez la virgule `,` comme séparateur
- Évitez les points-virgules `;`

### Dates
- Format recommandé : `YYYY-MM-DD` (ex: `2024-06-28`)
- Format ISO 8601 accepté : `2024-06-28T10:30:00Z`

### Nombres
- Utilisez le point `.` pour les décimales (ex: `34.5`)
- Pas d'espace dans les nombres (ex: `34500` pas `34 500`)
- Les pourcentages peuvent avoir le symbole `%` (sera supprimé automatiquement)

## 🔐 Sécurité

- Les fichiers sont traités côté serveur et ne sont jamais stockés
- Seules les données validées sont insérées dans la base
- Les imports sont tracés dans les logs système

## ❓ Dépannage

### "Aucune donnée valide trouvée"
- Vérifiez que vos colonnes correspondent aux noms attendus
- Assurez-vous que le fichier n'est pas vide
- Vérifiez l'encodage (UTF-8)

### "Erreur lors de l'insertion"
- Vérifiez que les données sont au bon format
- Les montants doivent être numériques
- Les pourcentages entre 0 et 100

### Caractères spéciaux mal affichés
- Ré-exportez en UTF-8
- Dans Excel : "CSV UTF-8" pas "CSV"

## 📞 Support

Pour toute question sur l'import de données, consultez la documentation technique dans `/app/api/import/`.
