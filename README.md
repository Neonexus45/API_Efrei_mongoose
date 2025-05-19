# API Efrei Mongoose - Branche de Démonstration Sécurité

Ce projet est une API Express simple utilisant Mongoose, axée sur la démonstration de diverses mesures de sécurité web.

## Lancement du Projet

1.  **Prérequis**: Node.js et npm installés.
2.  **Installer les Dépendances**:
    ```bash
    npm install
    ```
3.  **Exécuter en Mode Développement (avec HTTPS)**:
    ```bash
    npm run dev
    ```
    Le serveur démarrera sur `https://localhost:3000` (ou le port spécifié dans `src/config.mjs`).

    **Note sur HTTPS & Certificat Auto-signé**:
    Le serveur utilise HTTPS avec un certificat SSL auto-signé généré dynamiquement. Lors de votre premier accès à `https://localhost:3000` dans votre navigateur, vous verrez un avertissement de sécurité. Vous devez accepter cet avertissement (généralement en cliquant sur "Avancé" puis "Continuer vers localhost (non sécurisé)") pour continuer. Ceci est un comportement attendu pour les certificats auto-signés.

## Mesures de Sécurité Implémentées

Ce projet démontre les fonctionnalités de sécurité suivantes :

### 1. Communication HTTPS
Le serveur est configuré pour fonctionner exclusivement via HTTPS, assurant que toutes les données échangées entre le client et le serveur sont chiffrées. Un certificat SSL auto-signé est généré automatiquement au démarrage du serveur à des fins de développement et de démonstration.
*   **Implémentation**: module `https` et paquet `selfsigned` dans [`src/server.mjs`](src/server.mjs:0).

### 2. CORS (Cross-Origin Resource Sharing)
CORS est configuré pour n'autoriser que les requêtes provenant d'origines spécifiques (`http://localhost:8080` et `http://localhost:3000` par défaut). Cela empêche les pages web non autorisées de domaines différents d'effectuer des requêtes vers l'API.
*   **Implémentation**: middleware `cors` dans [`src/server.mjs`](src/server.mjs:0).

### 3. Helmet pour les En-têtes de Sécurité
Helmet.js est utilisé pour définir divers en-têtes HTTP qui aident à protéger contre les vulnérabilités web courantes comme XSS, clickjacking, etc.
*   **Implémentation**: middleware `helmet` dans [`src/server.mjs`](src/server.mjs:0).
*   L'en-tête `X-Powered-By` est également explicitement désactivé.

### 4. Authentification JWT (JSON Web Token)
Un système d'authentification basé sur les tokens JWT est implémenté :
*   **Génération de Token**: Lors d'une inscription (`POST /user/`) ou d'une connexion (`POST /user/login`) réussie, un JWT est généré et retourné au client.
*   **Vérification de Token**: Un middleware ([`src/middleware/auth.mjs`](src/middleware/auth.mjs:0)) protège des routes spécifiques. Ce middleware vérifie la présence d'un JWT valide dans l'en-tête `Authorization: Bearer <token>`.
*   **Routes Protégées**: Toutes les routes pour les albums et les photos, ainsi que les routes pour récupérer/supprimer les détails d'utilisateurs spécifiques, sont protégées et nécessitent un JWT valide.
*   **Implémentation**: paquet `jsonwebtoken`, middleware d'authentification personnalisé, et logique dans [`src/controllers/users.mjs`](src/controllers/users.mjs:0).

### 5. Validation des Entrées
Les entrées utilisateur pour l'inscription et la connexion sont validées pour assurer l'intégrité des données et prévenir les problèmes courants.
*   **Inscription Utilisateur (`POST /user/`)**: Valide `firstname`, `lastname`, et optionnellement `avatar` (URL), `age` (plage d'entiers), `city` (longueur de chaîne).
*   **Connexion Utilisateur (`POST /user/login`)**: Valide `firstname` et `lastname`.
*   Si la validation échoue, une réponse `400 Bad Request` est envoyée avec des messages d'erreur détaillés.
*   **Implémentation**: paquet `better-validator` dans [`src/controllers/users.mjs`](src/controllers/users.mjs:0).

### 6. Limitation de Débit (Rate Limiting)
Pour aider à atténuer les attaques DDOS et prévenir les abus, un limiteur de débit global est en place.
*   **Limite**: Chaque adresse IP est limitée à 10 requêtes par heure sur tous les points de terminaison.
*   Si la limite est dépassée, une erreur `429 Too Many Requests` est retournée.
*   **Implémentation**: middleware `express-rate-limit` dans [`src/server.mjs`](src/server.mjs:0).

## Documentation de l'API & Test avec Swagger UI

Une documentation API interactive est disponible via Swagger UI.

1.  **Accéder à Swagger UI**:
    Une fois le serveur lancé, ouvrez votre navigateur et allez à :
    `https://localhost:3000/api-docs` (N'oubliez pas d'accepter l'avertissement du certificat auto-signé).

2.  **Utiliser l'Authentification JWT dans Swagger UI**:
    De nombreux points de terminaison dans cette API sont protégés et nécessitent un JWT. Voici comment utiliser l'authentification dans Swagger :
    *   **Étape 1: Obtenir un Token**
        *   Utilisez le point de terminaison `POST /user/` pour inscrire un nouvel utilisateur (par ex., avec `firstname` et `lastname`).
        *   Ou, si vous avez des identifiants utilisateur existants, utilisez le point de terminaison `POST /user/login`.
        *   Exécutez la requête. Le corps de la réponse contiendra une chaîne `token`. Copiez cette valeur de token entière.
    *   **Étape 2: Autoriser dans Swagger UI**
        *   En haut à droite de la page Swagger UI, cliquez sur le bouton "Authorize".
        *   Une boîte de dialogue apparaîtra. Dans la section "bearerAuth (JWT)", collez le token que vous avez copié dans le champ "Value".
        *   Cliquez sur le bouton "Authorize" dans la boîte de dialogue, puis "Close".
    *   **Étape 3: Tester les Points de Terminaison Protégés**
        *   Vous êtes maintenant authentifié dans Swagger UI pour votre session actuelle.
        *   Essayez n'importe quel point de terminaison protégé (par ex., `GET /albums`, `POST /album/{id}/photo`, `GET /user/{id}`). Swagger inclura automatiquement votre JWT dans l'en-tête `Authorization: Bearer <token>` pour ces requêtes.
        *   Si vous essayez un point de terminaison protégé sans autorisation, ou avec un token invalide/expiré, vous recevrez une erreur `401 Unauthorized` ou `403 Forbidden`.