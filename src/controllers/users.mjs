import UserModel from '../models/user.mjs';

const Users = class Users {
  constructor(app, connect) {
    this.app = app;
    this.UserModel = connect.model('User', UserModel);

    this.run();
  }

  /**
   * @swagger
   * tags:
   *   name: Utilisateurs
   *   description: Opérations de gestion des utilisateurs
   */

  deleteById() {
    /**
    * @swagger
    * /user/{id}:
    *   delete:
    *     summary: Supprimer un utilisateur par ID
    *     tags: [Utilisateurs]
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: string
    *         required: true
    *         description: L'ID de l'utilisateur
    *     responses:
    *       200:
    *         description: Utilisateur supprimé avec succès ou utilisateur non trouvé
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       400:
    *         description: Mauvaise requête
    *       500:
    *         description: Erreur interne du serveur
     */
    this.app.delete('/user/:id', (req, res) => {
      try {
        this.UserModel.findByIdAndDelete(req.params.id).then((user) => {
          res.status(200).json(user || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] users/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showById() {
    /**
     * @swagger
     * /user/{id}:
     *   get:
     *     summary: Obtenir un utilisateur par ID
     *     tags: [Utilisateurs]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de l'utilisateur
     *     responses:
     *       200:
     *         description: Utilisateur trouvé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.get('/user/:id', (req, res) => {
      try {
        this.UserModel.findById(req.params.id).then((user) => {
          res.status(200).json(user || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] users/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  create() {
    /**
     * @swagger
     * /user:
     *   post:
     *     summary: Créer un nouvel utilisateur
     *     tags: [Utilisateurs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               # Définissez ici les propriétés de votre UserModel pour le corps de la requête
     *               # Exemple :
     *               name:
     *                 type: string
     *                 example: Jean Dupont
     *               email:
     *                 type: string
     *                 format: email
     *                 example: jean.dupont@example.com
     *             required:
     *               - name # Ajoutez les champs requis
     *               - email
     *     responses:
     *       200: # Note : 201 Créé est plus typique pour un POST réussi
     *         description: Utilisateur créé avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Mauvaise requête
     */
    this.app.post('/user/', (req, res) => {
      try {
        const userModel = new this.UserModel(req.body);

        userModel.save().then((user) => {
          res.status(200).json(user || {});
        }).catch(() => {
          res.status(200).json({});
        });
      } catch (err) {
        console.error(`[ERROR] users/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.showById();
    this.deleteById();
  }
};

export default Users;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: L'ID auto-généré de l'utilisateur.
 *           example: 60564fcb544b5e001c62c8e6
 *         # Ajoutez ici les autres propriétés de votre UserModel
 *         # Exemple :
 *         name:
 *           type: string
 *           description: Nom de l'utilisateur.
 *           example: Jean Dupont
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur.
 *           example: jean.dupont@example.com
 *         # Ajoutez les autres champs de votre schéma UserModel
 *       required:
 *         - name
 *         - email # Ajoutez les autres champs requis de votre modèle
 */
