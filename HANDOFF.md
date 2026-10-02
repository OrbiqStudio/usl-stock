# USL Stock — Document de passation complet (pour une autre IA / un autre ordinateur)

> **Consigne à l'IA qui lit ce document :** lis tout, puis **pose à l'utilisateur toutes les questions dont tu as besoin** avant de coder (priorités, comportements ambigus, accès). L'utilisateur n'est PAS développeur : explique simplement, en français, sans jargon, et fais les choses à sa place plutôt que de lui demander des manipulations techniques.

---

## 1. Le projet et l'utilisateur

- **Client / utilisateur** : responsable de l'**US Laval Basket** (club de basket). Francophone, non technique. Il pilote le développement par messages courts, captures d'écran et références visuelles (Pinterest, composants collés). Il préfère qu'on **reproduise fidèlement une image/un composant de référence** plutôt qu'on interprète.
- **Application** : « **USL Stock** » = gestion de stock + caisse (point de vente) pour la **buvette** et la **boutique** du club, utilisée les jours de match.
- **Livrables** : application **Windows (.exe, Electron)** et **Android (.apk, Capacitor)**, données **synchronisées en temps réel** entre appareils via **Firebase Firestore**.
- **Règle de travail** : chaque modification validée → **nouvelle version publiée sur GitHub Releases** (.exe + .apk), et l'utilisateur est informé de l'emplacement des fichiers. Avant de builder l'.exe, il faut que l'app soit **fermée** sur l'ordinateur (sinon erreur EPERM sur `dist/win-unpacked`).
- Langue de l'UI et des échanges : **français**.

## 2. Dépôt et versions

- Dépôt GitHub : **https://github.com/OrbiqStudio/usl-stock** (public, branche `main`). Le compte a été renommé AGTCWEB → **OrbiqStudio** ; le compte `gh` connecté sur l'ancien PC est `AGTCWEB`.
- Version courante : **1.4.1** (`package.json`). Releases existantes : v1.2.x → v1.4.1 (`latest.yml` + exe + apk).
- Le dépôt est public : **aucun secret ne doit y être commité** (voir §9).

## 3. Stack technique

- React 19 + TypeScript + Vite 8 + Tailwind v4 + shadcn/Radix UI, `HashRouter`, lucide-react (icônes), sonner (toasts), `motion` (dock flottant), `xlsx` (export Excel).
- Firebase Firestore via une classe maison `FirestoreCollection` (cache `onSnapshot` + hooks `useSyncExternalStore`) dans `src/lib/collections.ts` / `src/hooks/useData.ts`. **Firestore interdit les valeurs `undefined`** : toujours utiliser des spreads conditionnels (`...(x ? {x} : {})`). Un bug de ce type a cassé la v1.2.0.
- Electron 41 + electron-builder (NSIS) + electron-updater ; `electron/main.cjs` + `electron/preload.cjs` (pont IPC → `window.electronAPI`).
- Capacitor 8 Android (`android/`), appId `fr.agtcweb.uslstock` (les tirets sont interdits dans un appId Capacitor). `MainActivity.java` met l'app en plein écran immersif.
- Outils locaux : Gradle 8.14, **JDK 21** (aussi 17), Android SDK en `C:\Android\sdk` (`android/local.properties` : `sdk.dir` avec slashs `/`). JAVA_HOME court utilisé : `C:\PROGRA~1\ECLIPS~1\JDK-21~1.8-H`.
- Commandes : `npm install`, `npm run dev`, `npm run build` (tsc -b + vite build), `npm run electron:build` (.exe), puis `npx cap sync android` + `gradlew assembleRelease` dans `android/` (APK).
- TypeScript strict avec `noUnusedLocals` : un import inutilisé fait échouer le build.

## 4. Système de mise à jour (important, fragile)

- Source des mises à jour : **GitHub Releases** de `OrbiqStudio/usl-stock` (`src/lib/updateConfig.ts` : `UPDATE_REPO_OWNER`, `UPDATE_REPO_NAME` ; et `build.publish` dans `package.json`).
- **Windows** : electron-updater (`autoDownload=false`), IPC `update:check/download/install`. **Android** : appel API GitHub → téléchargement du lien .apk. Bouton dans **Admin → Paramètres** (`src/screens/admin/AdminUpdateCard.tsx`, logique dans `src/lib/updater.ts`). `__APP_VERSION__` est injecté par Vite depuis `package.json`.
- **Piège n°1** : GitHub remplace les **espaces par des points** dans les noms de fichiers uploadés → `latest.yml` ne pointait plus vers le bon fichier (404). Solution : `nsis.artifactName = "USL-Stock-Setup-${version}.${ext}"` (sans espace).
- **Piège n°2** : changement de nom de compte GitHub → 404 ; mettre à jour owner dans `package.json` ET `updateConfig.ts`.
- **Piège n°3** : l'installeur affiche parfois « USL Stock ne peut pas être fermé… » : fermer via Gestionnaire des tâches (processus `USL Stock.exe`), désinstaller l'ancienne version (Paramètres → Applications), redémarrer, relancer l'installeur. Le problème est apparu sur un autre appareil du club (pas sur le PC de dev).
- Publier une release : bump de version dans `package.json`, build exe + apk, `gh release create vX.Y.Z` avec `latest.yml`, `USL-Stock-Setup-X.Y.Z.exe` (+ `.blockmap`) et l'APK. Vérifier que les noms de fichiers dans `latest.yml` correspondent EXACTEMENT aux assets.

## 5. Modèle de données (src/types/index.ts, src/lib/data.ts)

- **Sections** : `boutique` / `bar` (buvette). **Dossiers** (catégories) par section, **Articles**, **Packs**, **Matchs/événements** (un match « actif »), **Commandes** (lignes, remise, totaux HT/TVA/TTC, statut `en_cours`/payée/annulée, moyen de paiement), **tablettes** (identifiant par appareil).
- **Stock** : un seul nombre `stock` par article, **remis à zéro/renseigné avant chaque match** (pas de collection de stock par match). Flux voulu : dans Gestion des stocks → Bar/Boutique → choisir « **Produits globaux** » (configuration unique des articles/prix/TVA/packs) ou « **Stock du match** » (ne refaire que les quantités à chaque match).
- **Alcool** : `estAlcool`, `contenances` (prix pour 25 / 33 / 50 cl), popup de choix de contenance en caisse. **Conversion bouteille → verres** : `stockEnBouteilles`, `bouteilles1L`, `bouteilles15L` (1 L = 4 verres, 1,5 L = 6 verres).
- **Consigne** : `consigneAuto` sur l'article (bière/boissons sauf café et eau). Ligne virtuelle `CONSIGNE_ARTICLE_ID="__consigne__"`, **1 € (100 centimes), TVA 20 %**, non suivie en stock. En caisse : ajout automatique à l'ajout d'un article marqué, boutons **Consigne** (+1 €) et **Déconsigne** (−1 €).
- **Packs** : articles fixes + **slots** (choix) : `PackSlot {id,label,options[]}`, `PackSlotOption {articleId, articleNom, prixDelta}`. Prix final = `prixPack + Σ prixDelta` ; nom du type « Pack (Boisson + Sandwich) ». Les ajustements −0,50 € sont gérés par `prixDelta`. À l'encaissement, le stock des `pack.articles` et des `ligne.packChoix` est décrémenté.
- **Remise** : déjà en pourcentage ET en montant fixe (`RemiseDialog`) ; le client veut surtout le **montant**.
- **Montants en centimes** (entiers). `formatEuros` dans `src/lib/money.ts`.
- **Marge** : doit déduire la TVA sélectionnée (bug corrigé).
- **Stock en direct** : on ne peut pas vendre plus que le stock (toast « Stock insuffisant »).

## 6. Fonctions déjà livrées (historique des demandes)

Android + Windows ; plein écran APK ; logo du club (`public/logo-club.png`) ; vidéo de veille (`public/veille.mp4`, sans logo/texte, après **1 minute** d'inactivité partout sauf en admin, clic pour réveiller) ; dashboard admin **par match** avec détail paiements (espèces/CB/chèque/autre) + **export Excel** ; packs déplacés dans la gestion de stock ; déconnexion admin ; encaissement espèces simplifié (**plus de « montant reçu »**), confirmation raccourcie (`COUNTDOWN_MS=1000`), croix **Annuler** en bas à gauche pendant l'étape de paiement ; bouton de mise à jour intégré ; icônes lucide (plus d'emoji) pour les dossiers ; refonte graphique complète (voir §7).

## 7. Design (refonte « à plat », écran par écran)

Style validé par l'utilisateur : **flat bleu**, fond blanc, cartes `rounded-2xl` avec bordure fine, **aucune ombre** (sauf dock flottant et dossiers 3D), couleur principale **#003DA5** (boutons pleins/outline), icônes fines (`strokeWidth` bas). Il détestait l'ancien rendu « typique IA ».
- Navigation admin : **dock flottant façon macOS** (`src/components/ui/floating-dock.tsx`, dans `AdminScreen.tsx`), pas de barre latérale.
- Dossiers : **dossiers 3D bleus façon Apple** (`src/components/ui/animated-folder.tsx`, utilisé par `DossiersScreen` / `StockMatchDossiersScreen`).
- Dashboard admin : carte héro sombre « CA », cartes de stats, diagramme en barres des paiements, panneau match, export (`AdminDashboard.tsx`).
- Caisse « En direct » : reproduit d'après une référence « Chili POS » (grille d'articles, pastilles de catégories, récap commande à droite avec icônes de paiement rapide).
- **Pas encore refondus** (à faire si l'utilisateur le demande) : onglets Matchs / Paramètres / Export de l'admin, écran Packs, certaines boîtes de dialogue, `AdminPasswordGate`. Il a dit vouloir « changer toute l'interface » : continuer écran par écran, **lui demander une référence visuelle ou la reproduire à l'identique**.
- Fichiers UI clés : `src/screens/...`, `src/components/ScreenHeader.tsx`, `UslLogo.tsx`, `DossierIcon.tsx`, `IconPicker.tsx`, `src/lib/icons.ts`, `GlobalIdleOverlay.tsx`, `IdleOverlay.tsx`, `src/screens/direct/components/*` (ArticleGrid, CommandeRecap, CategorySidebar, OtherOrdersBar, CaisseSidebar, PackSlotDialog, ContenanceDialog, RemiseDialog, EncaissementDialog, AnnulerDialog, LowStockPopup).

## 8. Arborescence rapide

```
electron/            main.cjs, preload.cjs (Electron + mises à jour)
android/             projet Capacitor (build.gradle lit keystore.properties s'il existe)
public/              logo-club.png, veille.mp4, LISEZMOI.txt
src/lib/             data.ts (logique métier), collections.ts (Firestore), money.ts, updater.ts, updateConfig.ts, sound.ts
src/types/index.ts   tous les types + constantes (CONSIGNE_*, CONTENANCES, VERRES_PAR_BOUTEILLE_*)
src/hooks/useData.ts hooks temps réel
src/screens/         HomeScreen, direct/ (caisse), stock/ (gestion), admin/
```

## 9. Sécurité, légal, risques connus

- **Ne JAMAIS commiter** `android/keystore.properties` ni les `.jks` (gitignorés). Sans eux **impossible de signer l'APK avec la même clé** → les tablettes refuseraient la mise à jour (désinstallation obligatoire). Ils ont été copiés/conservés sur l'ancien PC ; **demander à l'utilisateur où ils sont** sur le nouvel ordinateur. Sans `keystore.properties`, Gradle produit `app-release-unsigned.apk` (inutilisable).
- Mot de passe admin : **SHA-256 non salé**, un seul mot de passe → faible ; à renforcer.
- **Règles Firestore non visibles dans le dépôt** → vérifier dans la console Firebase qu'elles ne sont pas ouvertes à tous.
- Légal (analyse déjà donnée à l'utilisateur) : si le club est assujetti à la TVA, **logiciel de caisse certifié / inaltérabilité des tickets** (loi anti-fraude TVA) ; **licence de débit de boissons** pour l'alcool ; mentions légales / RGPD si données personnelles. Recommandé mais non fait : verrouiller les commandes payées, sauvegarde/export automatique, mot de passe plus robuste.
- Dossiers existants avec d'anciennes icônes emoji : l'utilisateur doit re-choisir les icônes.

## 10. Historique des bugs/pièges (pour ne pas les refaire)

1. Java 8 trop ancien → JDK 21 requis pour Gradle.
2. `undefined` dans un document Firestore (champ `contenance`) → toute ajout d'article cassé (v1.2.0, corrigé en 1.2.1).
3. Noms de fichiers avec espaces vs GitHub (voir §4).
4. Renommage du compte GitHub (voir §4).
5. APK non signé si `keystore.properties` absent.
6. Build Electron EPERM si l'app tourne.
7. Test navigateur : les clics par coordonnées sont peu fiables ; utiliser des clics DOM via JS et le setter natif d'input + événement `input` pour les champs React.

## 11. Ce que la nouvelle IA doit faire en premier

1. `git clone`, `npm install`, `npm run dev` et vérifier que ça démarre ; `npm run build` doit passer sans erreur TS.
2. Demander à l'utilisateur : où sont `keystore.properties` / le `.jks` ? Quelle config Firebase est utilisée (la config est dans le code source `src/lib/firebase.ts` ou équivalent — la lire) ? A-t-il Git/Node/JDK/Android SDK installés sur ce PC ? Peut-on se connecter à `gh` avec le compte propriétaire du dépôt ?
3. **Poser toutes les questions utiles** avant de modifier quoi que ce soit : quelles fonctions sont prioritaires, quels écrans restent à redessiner et avec quelle référence visuelle, règles de consigne/packs/remise exactes, fréquence des matchs, nombre de tablettes, besoin légal (TVA, certification), sauvegardes.
4. Pour toute modif : build local, test, bump de version, release GitHub (.exe + .apk), et dire à l'utilisateur où récupérer les fichiers.
