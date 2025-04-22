# 🎶 iTunes Seeker – Mini iTunes App (React Native + Expo)

Bienvenue sur **iTunes Seeker**, une application mobile ✨ développée avec **React Native + Expo** permettant de :

- 🎷 Explorer l’immense base de données musicale d’iTunes
- 🔍 Rechercher des titres ou des artistes
- 💾 Ajouter des morceaux à ses propres playlists
- 🖼️ Créer des playlists avec image personnalisée
- 🌃 Utiliser un mode sombre ou clair
- ⭐ Donner une note à chaque musique

---

## 🚀 Fonctionnalités

- 🔐 Authentification avec persistance de session (`AsyncStorage`)
- 🏠 Accueil avec albums aléatoires (keywords dynamiques)
- 🧹 Playlists personnelles : création, édition, suppression
- 📂 Détail des albums → liste des morceaux + preview audio
- 🧠 Détail des morceaux → avec notation personnalisée (1 à 5 ⭐)
- 🔎 Recherche en temps réel depuis l’API iTunes
- 📦 Stockage local sécurisé avec `@react-native-async-storage/async-storage`
- ↻ Navigation fluide avec `@react-navigation/native`
- 🎨 Dark mode toggle automatique avec `useColorScheme`
- 🎵 Audio via `expo-av`

---

## 🛠️ Installation

```bash
# 1. Cloner le repo
git clone https://github.com/ton_profil/itunes-seeker.git

# 2. Installer les dépendances
cd itunes-seeker
npm install

# 3. Lancer le projet avec Expo
npx expo start
```

📱 **Scanne le QR code dans Expo Go (Android/iOS)**

---

## 🥪 Technologies principales

| Fonction                | Librairie                           |
|-------------------------|-------------------------------------|
| Navigation              | `@react-navigation/native`          |
| Stockage local          | `@react-native-async-storage/async-storage` |
| Lecture audio           | `expo-av`                           |
| Sélecteur d'image       | `expo-image-picker`                 |
| Thème clair/sombre      | `useColorScheme` + `ThemeContext`   |
| API iTunes              | `https://itunes.apple.com/search`  |

---


## 🙋‍♂️ Pour les curieux

- ↻ Modifier le thème avec l'icône 🌙
- ✏️ Cliquer sur une playlist pour l’éditer (image + nom)
- ℹ️ Cliquer sur une musique dans une playlist ou un album pour voir tous les détails

---

## 💬 Aide

Tu veux contribuer, tester ou adapter le projet ?  
Tu peux me DM ici ou ouvrir une issue sur GitHub 🙌


