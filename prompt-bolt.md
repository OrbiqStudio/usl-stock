# USL Stock — Application de gestion de stock & caisse pour club de basketball

## Contexte

Application web PWA pour l'**US Laval Basket** (club de basketball français). Utilisée sur **tablettes Windows** tactiles pour gérer les stocks de la boutique du club et de la buvette, et servir de système de caisse pendant les matchs. Plusieurs tablettes partagent les mêmes données en temps réel.

## Stack technique

- **React 18+ / TypeScript / Vite**
- **Tailwind CSS + Shadcn/ui** (composants)
- **Firebase** : Firestore (base de données temps réel), Firebase Storage (images articles), Firebase Auth (authentification admin simple)
- **Région Firebase : `europe-west9` (Paris, France)** — les données doivent être hébergées en France
- **Bibliothèque `xlsx`** (SheetJS) pour les exports Excel
- **PWA** : manifest.json + service worker pour mode plein écran installable sur tablettes
- **Lucide React** pour les icônes

## Design & Charte graphique

- **Couleurs principales** : Bleu USL `#003DA5` (primaire), blanc `#FFFFFF` (secondaire), gris clair `#F1F5F9` (fond)
- **Couleurs d'état** : Vert `#16A34A` (stock OK / succès), Orange `#F59E0B` (attention / stock bas), Rouge `#DC2626` (alerte / rupture)
- **IMPORTANT : PAS de dégradés bleus**. Couleurs solides uniquement.
- **Interface tactile** : tous les boutons et éléments interactifs font minimum **48px** de hauteur/largeur
- **Police** : Inter (ou système), grande taille (16px minimum pour le texte, 20px+ pour les titres)
- **Espacement généreux** entre les éléments
- **Design moderne, épuré, intuitif** — les bénévoles du club (pas des techniciens) doivent pouvoir l'utiliser sans formation
- **Mode plein écran** : l'app est une PWA installable, pas de barre de navigateur

---

## ARCHITECTURE GLOBALE

L'application a **2 grandes parties** accessibles depuis l'écran d'accueil :

### Écran d'accueil
- Logo USL centré en haut (placeholder pour l'instant, image qu'on remplacera)
- **Titre** : "USL Stock"
- **Deux grands boutons** côte à côte :
  - 📦 **"Gestion des stocks"** → accède à la partie gestion
  - 🔴 **"En direct"** → accède à la partie caisse match
- **Icône engrenage** en haut à droite → accède au panneau Admin (protégé par mot de passe)

---

## PARTIE 1 : GESTION DES STOCKS (avant match)

### 1.1 — Écran choix de section
- Deux grandes cartes : **"Boutique"** et **"Buvette / Bar"**
- Bouton retour vers l'accueil

### 1.2 — Écran section (liste des dossiers)
- **Titre** de la section en haut (ex: "Boutique")
- **Bouton retour**
- **Grille de cartes** montrant les dossiers existants
- Chaque carte dossier affiche :
  - Emoji/icône choisie à la création
  - Nom du dossier
  - Nombre d'articles dans le dossier
  - Indicateur : nombre d'articles en alerte stock
- **Bouton flottant "+"** en bas à droite pour créer un nouveau dossier
- Clic sur un dossier → entre dans le dossier
- Possibilité de **modifier** ou **supprimer** un dossier (swipe ou menu contextuel)

### 1.3 — Modal création/modification de dossier
- **Nom du dossier** (texte libre)
- **Icône** (sélecteur d'emoji ou liste d'icônes prédéfinies)
- **Section** : Boutique ou Buvette (pré-rempli selon d'où on vient)
- Boutons Sauvegarder / Annuler

### 1.4 — Écran dossier (liste des articles)
- **Breadcrumb** : Section > Dossier
- **Bouton retour**
- **Grille de cartes** articles (3 colonnes sur tablette)
- Chaque carte article affiche :
  - **Image** de l'article (photo)
  - **Nom** de l'article
  - **Stock actuel** avec **badge coloré** :
    - 🟢 Vert si stock > seuil d'alerte
    - 🟠 Orange si stock ≤ seuil d'alerte ET stock > 0
    - 🔴 Rouge si stock = 0
  - **Prix de vente TTC**
- **Bouton flottant "+"** pour ajouter un article
- Clic sur un article → ouvre la fiche article en modal

### 1.5 — Modal ajout/modification d'article
Formulaire avec les champs suivants :
- **Image** : zone de drop / bouton upload (compresser l'image avant upload, max 500KB)
- **Nom de l'article** (texte, obligatoire)
- **Stock actuel** (nombre entier, obligatoire)
- **Prix d'achat HT** (nombre décimal, en €)
- **Prix de vente TTC** (nombre décimal, en €)
- **Taux de TVA** : dropdown avec 3 options → 5.5% / 10% / 20%
- **Seuil d'alerte stock** (nombre entier — en dessous de ce nombre, l'article passe en alerte)
- **Marquer comme favori** (toggle) — les favoris apparaîtront en priorité en mode "En direct"
- Affichage calculé automatiquement :
  - Marge unitaire = Prix vente HT - Prix achat HT
  - Valeur du stock = Stock × Prix d'achat HT
- Boutons **Sauvegarder / Annuler / Supprimer** (supprimer avec confirmation)

### 1.6 — Modification manuelle du stock
- Dans la fiche article, bouton **"Modifier le stock"**
- Permet d'**ajouter** (réception marchandise) ou **retirer** (casse, périmé) des unités
- Champ : quantité à ajouter/retirer + motif optionnel
- Le stock se met à jour et la date de dernière modification est enregistrée

---

## PARTIE 2 : EN DIRECT (caisse pendant le match)

### 2.1 — Écran choix du poste
Quand on clique sur "En direct" depuis l'accueil :
- **Choix du poste** : "Boutique" ou "Bar / Restauration"
- Ce choix détermine quels articles sont affichés (seulement ceux de la section choisie)
- Bouton retour vers l'accueil

### 2.2 — Vérification match actif
- Si **aucun match n'est actif** : message "Aucun événement en cours. Demandez à un administrateur de démarrer un match." + bouton retour
- Si un **match est actif** : on entre dans l'interface de caisse

### 2.3 — Interface de caisse (écran principal EN DIRECT)

Layout inspiré d'une interface de caisse professionnelle, divisé en 3 zones :

#### Zone gauche (sidebar ~15% largeur) — Infos & navigation
- **Nom du match** en cours (ex: "USL vs Cholet")
- **Type** (Championnat / Coupe / Amical)
- **Numéro de commande** en cours (ex: "Commande n°12")
- **Indicateur commandes en cours** sur les autres tablettes : affiche combien d'autres commandes sont ouvertes et depuis combien de temps (ex: "2 autres commandes en cours — 1min30 / 0min45"). Cela évite les conflits de numéros.
- Boutons de navigation :
  - 🛒 **Nouvelle commande** (créer)
  - 💰 **Encaisser** (passer au paiement)
  - ❌ **Annuler commande** (avec motif obligatoire : Erreur / Client parti / Autre)
- Bouton **Retour à l'accueil** tout en bas

#### Zone centrale (~55% largeur) — Récapitulatif commande
- **En-tête** : "COMMANDE n°XX"
- **Liste des articles** ajoutés à la commande :
  - Quantité × Nom de l'article — Prix unitaire — Sous-total
  - Bouton - et + pour modifier la quantité de chaque ligne
  - Bouton supprimer (🗑️) pour retirer un article
- **Section remise** (optionnelle) :
  - Bouton "Ajouter une remise"
  - Choix : pourcentage (%) ou montant fixe (€)
  - Saisie de la valeur
  - Affichage du montant de la remise
- **Pied du récapitulatif** :
  - Sous-total HT
  - TVA (détail par taux si plusieurs taux dans la commande)
  - **Remise** (si appliquée)
  - **TOTAL TTC** en gros et en gras

#### Zone droite (~30% largeur) — Grille d'articles + catégories

**Barre latérale de catégories** (colonne tout à droite, ~60px de large) :
- Liste verticale des dossiers/catégories de la section choisie
- Chaque catégorie = icône + nom court
- La catégorie sélectionnée est surlignée en bleu
- **Première catégorie spéciale : ⭐ "Favoris"** qui affiche tous les articles marqués comme favoris
- **Deuxième catégorie spéciale : 📦 "Packs"** qui affiche les menus/packs préconfigurés

**Grille d'articles** (à gauche de la barre de catégories) :
- **Barre de recherche** en haut pour filtrer les articles par nom
- **Grille de cartes** (3 colonnes) des articles de la catégorie sélectionnée
- Chaque carte article affiche :
  - Image de l'article (en fond de carte, légèrement opacifiée)
  - **Nom** de l'article
  - **Prix TTC**
  - **Badge compteur** (coin supérieur droit) : quand on clique sur un article, un badge orange affiche le nombre ajouté à la commande (ex: "2")
  - **Badge stock restant** (coin inférieur gauche) si le stock est bas (orange/rouge)
- **Clic sur une carte** = ajouter 1 unité à la commande en cours
- Les articles avec **stock = 0** sont grisés et non cliquables

### 2.4 — Packs / Menus
- Dans la partie Admin, on peut créer des **packs** (menus combinés)
- Un pack = un nom + une liste d'articles + un prix pack (inférieur à la somme des prix individuels)
- En mode "En direct", les packs apparaissent dans la catégorie spéciale "Packs"
- Quand on ajoute un pack à la commande, tous ses articles sont ajoutés d'un coup au prix du pack

### 2.5 — Pop-up alerte rupture en direct
- **Pendant la prise de commande** (PAS pendant l'encaissement) :
  - Si le stock d'un article passe en dessous du seuil d'alerte → **pop-up rouge** qui apparaît
  - Contenu : "⚠️ Stock bas — [Nom de l'article] : X restant(s)"
  - Un bouton "OK" pour fermer rapidement
  - La pop-up ne bloque pas longtemps, c'est juste une notification visuelle rapide

### 2.6 — Écran d'encaissement

Quand le vendeur clique sur "Encaisser" :

**Étape 1 : Choix du moyen de paiement**
- 4 gros boutons :
  - 💵 **Espèces**
  - 💳 **Carte bancaire**
  - 📝 **Chèque**
  - 📎 **Autre**

**Étape 2a : Si Espèces**
- Affichage du **total à payer**
- Champ **"Montant reçu"** (clavier numérique tactile intégré)
- Calcul automatique du **rendu de monnaie** = Montant reçu - Total
- Le rendu s'affiche en GROS quand il est calculé
- Bouton **"Valider le paiement"** (actif uniquement si montant reçu ≥ total)

**Étape 2b : Si CB / Chèque / Autre**
- Affichage du **total à payer** en gros
- Message : "En attente du paiement..."
- Bouton **"Valider le paiement"**

**Étape 3 : Confirmation**
- Écran avec message : **"Paiement en cours d'encaissement..."**
- **Compteur de 5 secondes** visuel (barre de progression circulaire ou linéaire)
- Ce temps laisse au vendeur le temps de finaliser physiquement (rendre monnaie, prendre la CB, etc.)
- Après les 5 secondes : le compteur disparaît et un **gros bouton vert** apparaît : **"✅ Commande payée"**
- **Son de confirmation** (un "ding" court et agréable) quand le bouton vert apparaît
- Clic sur le bouton vert → la commande est enregistrée, le stock est décrémenté, et on **retourne directement** à l'interface de caisse pour créer une **nouvelle commande** (n° suivant)

### 2.7 — Annulation de commande
- Bouton "Annuler commande" dans la sidebar gauche
- **Motif obligatoire** : Erreur de saisie / Client parti / Autre (texte libre)
- Confirmation : "Êtes-vous sûr d'annuler la commande n°XX ?"
- Si confirmé : la commande est annulée (stock non décrémenté), et on revient à l'interface pour une nouvelle commande

### 2.8 — Mode veille
- **Uniquement sur l'écran de création de commande** (PAS pendant une commande en cours, PAS pendant l'encaissement)
- Après **20 secondes d'inactivité** (pas de touche, pas de clic) :
  - L'écran se couvre d'un **overlay sombre** avec une **vidéo en boucle** en fond (la vidéo sera fournie plus tard, mettre un placeholder avec le logo USL et une animation subtile pour l'instant)
  - Un simple **clic n'importe où** sur l'écran ferme le mode veille et **revient exactement à l'endroit** où le vendeur s'était arrêté
- Le timer de 20s se reset à chaque interaction utilisateur

---

## PARTIE 3 : PANNEAU ADMIN

### 3.1 — Accès
- Icône engrenage en haut à droite de l'écran d'accueil
- **Saisie d'un mot de passe** (mot de passe par défaut : "usl2024", modifiable dans les paramètres)
- Le mot de passe est stocké hashé dans Firestore

### 3.2 — Dashboard Admin
Page d'accueil admin avec des **cartes de statistiques** :
- 📦 Nombre total d'articles (boutique + buvette)
- ⚠️ Nombre d'articles en alerte stock
- 💰 Valeur totale du stock au prix d'achat
- 💰 Valeur totale du stock au prix de vente
- 📊 CA total (toutes les ventes enregistrées)
- 📈 Marge totale estimée

### 3.3 — Gestion des matchs / événements
- **Liste des matchs** préconfigurés (à venir et passés)
- **Bouton "Créer un match"** avec les champs :
  - **Date** du match (date picker)
  - **Nom du match** (texte libre, ex: "USL vs Cholet Basket")
  - **Type** : dropdown → Championnat / Coupe de France / Amical
- **Bouton "Démarrer"** pour activer un match (un seul match actif à la fois)
- **Bouton "Terminer"** pour clore un match (déclenche le recomptage du fond de caisse)
- Les commandes sont rattachées au match actif
- Le numéro de commande repart à 1 pour chaque nouveau match

### 3.4 — Fond de caisse
- **Au démarrage d'un match** : écran de saisie du fond de caisse initial
  - Pour chaque coupure (personnalisable par l'admin) : champ quantité
  - Coupures par défaut : 1c, 2c, 5c, 10c, 20c, 50c, 1€, 2€, 5€, 10€, 20€, 50€, 100€, 200€, 500€
  - L'admin peut **désactiver** les coupures qu'il n'utilise jamais (ex: 500€, 200€, 1c, 2c)
  - **Total calculé automatiquement** en bas
- **À la fin d'un match** : même écran de recomptage
  - Affichage du **fond de caisse théorique** = fond initial + total espèces encaissées
  - Affichage du **fond de caisse réel** = ce qu'on vient de recompter
  - **Écart** affiché clairement (vert si ça correspond, rouge si écart)

### 3.5 — Gestion des packs / menus
- **Liste des packs** existants
- **Créer un pack** :
  - Nom du pack (ex: "Menu supporter")
  - Sélection des articles qui composent le pack (multi-select depuis la liste d'articles)
  - Prix du pack TTC
  - Taux de TVA du pack
  - Image (optionnelle)
- Modifier / Supprimer un pack

### 3.6 — Gestion des coupures
- Cocher/décocher les coupures à utiliser pour le fond de caisse
- Ce réglage est persistant

### 3.7 — Paramètres
- **Modifier le mot de passe admin**
- **Nom du club** (pré-rempli "US Laval Basket")
- **Configurer la vidéo de veille** (upload de la vidéo)

### 3.8 — Exports Excel
Bouton d'export avec choix de la période et du contenu :

**Options de filtre :**
- Par match spécifique (dropdown des matchs passés)
- Par période (date début → date fin)
- Tout (depuis le début)

**Le fichier Excel (.xlsx) généré contient plusieurs onglets :**

**Onglet 1 — "Stock actuel"**
| Section | Dossier | Article | Stock | Seuil alerte | Prix achat HT | Prix vente TTC | TVA % | Valeur stock (achat) | Valeur stock (vente) | Marge unitaire | Statut |

**Onglet 2 — "Ventes"**
| Date | Match | N° Commande | Section | Dossier | Article | Quantité | Prix vente TTC | Prix achat HT | TVA | Marge | Moyen de paiement |

**Onglet 3 — "Résumé"**
- Valeur totale du stock (au prix d'achat / au prix de vente)
- Chiffre d'affaires total sur la période
- Marge totale
- Nombre de commandes
- Panier moyen
- Répartition par moyen de paiement (Espèces / CB / Chèque / Autre)
- Top 10 articles les plus vendus
- Articles en alerte stock
- Liste des commandes annulées avec motifs

**Onglet 4 — "Fond de caisse"**
- Pour chaque match : fond initial, fond final, recettes espèces, écart

---

## BASE DE DONNÉES FIRESTORE

### Collection `dossiers`
```
{
  id: string (auto-generated),
  section: "boutique" | "buvette",
  nom: string,
  icone: string (emoji),
  ordre: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `articles`
```
{
  id: string (auto-generated),
  dossierId: string (ref vers dossier),
  section: "boutique" | "buvette",
  nom: string,
  imageUrl: string (Firebase Storage URL),
  stock: number,
  prixAchat: number (HT, en centimes pour éviter les flottants),
  prixVente: number (TTC, en centimes),
  tauxTVA: number (5.5 | 10 | 20),
  seuilAlerte: number,
  favori: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `matchs`
```
{
  id: string (auto-generated),
  nom: string,
  date: Timestamp,
  type: "championnat" | "coupe_de_france" | "amical",
  statut: "planifie" | "en_cours" | "termine",
  fondCaisseInitial: { [coupure: string]: number },
  fondCaisseFinal: { [coupure: string]: number } | null,
  totalFondInitial: number (en centimes),
  totalFondFinal: number (en centimes) | null,
  compteurCommande: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `commandes`
```
{
  id: string (auto-generated),
  matchId: string,
  numero: number (n° séquentiel dans le match),
  section: "boutique" | "buvette",
  lignes: [
    {
      articleId: string,
      articleNom: string,
      quantite: number,
      prixUnitaire: number (en centimes),
      tauxTVA: number,
      sousTotal: number (en centimes)
    }
  ],
  remise: { type: "pourcentage" | "montant", valeur: number } | null,
  montantRemise: number (en centimes),
  totalHT: number (en centimes),
  totalTVA: number (en centimes),
  totalTTC: number (en centimes),
  moyenPaiement: "especes" | "cb" | "cheque" | "autre",
  montantRecu: number | null (en centimes, pour espèces),
  renduMonnaie: number | null (en centimes),
  statut: "en_cours" | "payee" | "annulee",
  motifAnnulation: string | null,
  tabletteId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `packs`
```
{
  id: string (auto-generated),
  nom: string,
  articles: [{ articleId: string, articleNom: string, quantite: number }],
  prixPack: number (TTC, en centimes),
  tauxTVA: number,
  imageUrl: string | null,
  actif: boolean,
  createdAt: Timestamp
}
```

### Collection `config`
```
{
  adminPasswordHash: string,
  clubName: string,
  coupuresActives: string[] (ex: ["50c", "1€", "2€", "5€", "10€", "20€", "50€"]),
  videoVeilleUrl: string | null
}
```

---

## COMPORTEMENTS TECHNIQUES IMPORTANTS

1. **Synchronisation temps réel** : utiliser Firestore `onSnapshot` pour que toutes les tablettes voient les mêmes données en direct (stock, commandes en cours, etc.)
2. **Identifiant tablette** : générer un UUID au premier lancement et le stocker en localStorage. Sert à identifier quelle tablette a créé quelle commande.
3. **Numérotation commandes** : utiliser une transaction Firestore pour incrémenter le compteur dans le document du match de manière atomique (pas de doublon entre tablettes).
4. **Images** : compresser côté client avant upload (max 500KB, format WebP si supporté). Stocker dans Firebase Storage, URL dans Firestore.
5. **Prix en centimes** : tous les montants sont stockés en centimes (integer) pour éviter les erreurs d'arrondi. Afficher en euros avec 2 décimales.
6. **Son de confirmation** : utiliser l'API Web Audio pour jouer un son "ding" quand la commande est validée. Le son doit être embarqué en base64 dans l'app.
7. **PWA** : manifest.json avec `"display": "fullscreen"`, icônes, thème bleu USL. Service worker pour le cache des assets statiques.
8. **Mode veille** : timer JS qui se reset à chaque événement `click`, `touchstart`, `keydown`. Après 20s d'inactivité, overlay avec vidéo. Clic sur l'overlay = retour à l'écran précédent sans perdre l'état.
9. **Pop-up alerte stock** : listener Firestore qui écoute les changements de stock. Si un article passe sous le seuil ET qu'on est sur l'interface de caisse (pas encaissement), afficher la pop-up.
10. **Commandes simultanées** : écouter en temps réel les commandes avec `statut: "en_cours"` du match actif, exclure celle de la tablette courante, afficher le nombre et la durée.
11. **Responsive tablette** : optimisé pour écrans 10-12 pouces en mode paysage. Pas besoin de responsive mobile.
12. **Animations** : transitions douces (200-300ms) sur les changements d'état. Pas d'animations excessives.
