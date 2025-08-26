# Planificateur Météo Randonnée

Une application Next.js 15 pour planifier vos randonnées avec les prévisions météo en temps réel.

## 🛠 Technologies

- **Next.js 15** (Pages Router)
- **TypeScript**
- **TailwindCSS v4**
- **shadcn/ui** pour les composants
- **OpenWeatherMap API** pour les données météo
- **date-fns** pour la gestion des dates
- **lucide-react** pour les icônes

## ✨ Fonctionnalités

- 📅 **Sélection de date** avec un DatePicker moderne
- 🌍 **Recherche de localisation** avec autocomplétion
- 🌤 **Prévisions météo** détaillées (température, précipitations, vent, etc.)
- 📱 **Interface responsive** et moderne
- 🎨 **Design élégant** avec shadcn/ui
- 🔄 **Actualisation** des données météo
- 📋 **Gestion** des jours de randonnée

## 🚀 Installation

1. **Clonez le repository**

   ```bash
   git clone <votre-repo>
   cd weather-map
   ```

2. **Installez les dépendances**

   ```bash
   npm install
   ```

3. **Configurez les variables d'environnement**

   ```bash
   cp .env.local.example .env.local
   ```

   Puis ajoutez votre clé API OpenWeatherMap dans `.env.local` :

   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=votre_cle_api_ici
   ```

4. **Obtenez une clé API gratuite**

   - Allez sur [OpenWeatherMap](https://openweathermap.org/api)
   - Créez un compte gratuit
   - Obtenez votre clé API
   - Collez-la dans le fichier `.env.local`

5. **Lancez l'application**

   ```bash
   npm run dev
   ```

6. **Ouvrez votre navigateur**
   ```
   http://localhost:3000
   ```

## 📁 Structure du projet

```
weather-map/
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   ├── TripForm.tsx        # Formulaire d'ajout de randonnée
│   ├── WeatherCard.tsx     # Carte d'affichage météo
│   └── TripPlanner.tsx     # Composant principal
├── lib/
│   ├── utils.ts           # Utilitaires shadcn
│   └── weather-api.ts     # API météo
├── types/
│   └── weather.ts         # Types TypeScript
├── pages/
│   └── index.tsx          # Page principale
└── styles/
    └── globals.css        # Styles globaux
```

## 🎯 Utilisation

1. **Ajoutez un jour de randonnée**

   - Sélectionnez une date future
   - Recherchez et sélectionnez une localisation
   - Cliquez sur "Ajouter à mon voyage"

2. **Consultez les prévisions**

   - Les données météo se chargent automatiquement
   - Température min/max, conditions, précipitations, vent
   - Icônes météo en temps réel

3. **Gérez votre voyage**
   - Supprimez des jours avec le bouton 🗑️
   - Actualisez les données avec le bouton 🔄
   - Vue chronologique automatique

## 🔧 Configuration

### Variables d'environnement

- `NEXT_PUBLIC_OPENWEATHER_API_KEY` : Votre clé API OpenWeatherMap

### API Météo

L'application utilise l'API gratuite d'OpenWeatherMap qui offre :

- Prévisions 5 jours
- Données toutes les 3 heures
- Température en Celsius
- Vitesse du vent en km/h

## 🎨 Personnalisation

### Couleurs

Les couleurs de température sont automatiques :

- 🔵 < 0°C : Bleu
- 🔷 0-10°C : Cyan
- 🟢 10-20°C : Vert
- 🟠 20-30°C : Orange
- 🔴 > 30°C : Rouge

### Thème

L'application utilise le thème neutre de shadcn/ui, personnalisable dans `components.json`.

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez la variable d'environnement `NEXT_PUBLIC_OPENWEATHER_API_KEY`
3. Déployez !

### Autres plateformes

L'application est compatible avec tous les hébergeurs supportant Next.js.

## 📝 Licence

MIT License - Libre d'utilisation et de modification.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouvelles fonctionnalités

---

**Bonnes randonnées ! 🏔️**
# WEATHER-TRIP
