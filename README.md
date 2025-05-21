# API Efrei Mongoose - Pipeline de Génération d'Utilisateur Aléatoire

Ce projet (et plus spécifiquement cette branche) est dédié à la démonstration d'un script de pipeline qui agrège des données de plusieurs API web pour générer un profil utilisateur aléatoire.

## Pipeline de Génération d'Utilisateur Aléatoire

Le script principal de cette démonstration est situé dans [`src/controllers/agregation.mjs`](src/controllers/agregation.mjs:1).

### Fonctionnement

Le script [`agregation.mjs`](src/controllers/agregation.mjs:1) effectue les actions suivantes :
1.  Récupère des informations de base sur l'utilisateur (nom, email, genre, localisation, photo) depuis l'API [RandomUser](https://randomuser.me/).
2.  Récupère des données supplémentaires (numéro de téléphone, IBAN, détails de carte de crédit (fictifs), nom aléatoire, nom d'animal de compagnie) depuis l'API [Randommer](https://randommer.io/).
3.  Récupère une citation aléatoire depuis l'API [ZenQuotes](https://zenquotes.io/).
4.  Récupère une blague aléatoire (orientée programmation/divers) depuis l'API [JokeAPI](https://v2.jokeapi.dev/).
5.  Combine toutes ces informations en un seul objet JSON.
6.  Sauvegarde le profil utilisateur généré dans le fichier [`src/controllers/pipeline_result/results.json`](src/controllers/pipeline_result/results.json:1).

### Exécution du Script

Pour exécuter le script directement et générer/mettre à jour le fichier de résultats :
```bash
node src/controllers/agregation.mjs
```
Après l'exécution, le fichier [`results.json`](src/controllers/pipeline_result/results.json:1) sera créé ou mis à jour dans le répertoire [`src/controllers/pipeline_result/`](src/controllers/pipeline_result/:1) avec les nouvelles données.

### Exemple de Résultat (`results.json`)

Le fichier JSON généré contiendra une structure similaire à celle-ci :
```json
{
  "user": {
    "name": "Viroslava Krishen",
    "email": "viroslava.krishen@example.com",
    "gender": "female",
    "location": "Lozova, Ukraine",
    "picture": "https://randomuser.me/api/portraits/thumb/women/41.jpg"
  },
  "phoneNumber": "+1 505-916-8197",
  "iban": "FR25050060008497K0740178882",
  "creditCard": {
    "type": "Visa",
    "date": "2027-07-21T09:00:20.6090041+00:00",
    "fullName": "Teagan Power",
    "cardNumber": "4870455740204818",
    "cvv": "585",
    "pin": 5087
  },
  "random_name": "Vicente Waddell",
  "pet_name": "Tes",
  "quote": {
    "content": "Everyone has a sense of humor. If you don't laugh at jokes, you probably laugh at opinions.",
    "author": "Criss Jami"
  },
  "joke": {
    "type": "Pun",
    "content": "I have these weird muscle spasms in my gluteus maximus.\\nI figured out from my doctor that everything was alright:\\nHe said \\"Weird flex, butt okay.\\""
  }
}