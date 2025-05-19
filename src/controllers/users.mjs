import jwt from 'jsonwebtoken';
import UserModel from '../models/user.mjs';
import config from '../config.mjs';
import verifyToken from '../middleware/auth.mjs';

const Users = class Users {
  constructor(app, connect) {
    this.app = app;
    this.UserModel = connect.model('User', UserModel);
    this.config = config[process.argv[2]] || config.development;

    this.run();
  }

  login() {
    /**
     * @swagger
     * /user/login:
     *   post:
     *     summary: Connecter un utilisateur
     *     tags: [Utilisateurs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstname:
     *                 type: string
     *                 example: Jean
     *               lastname:
     *                 type: string
     *                 example: Dupont
     *             required:
     *               - firstname
     *               - lastname
     *     responses:
     *       200:
     *         description: Connexion réussie, token JWT retourné
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *       400:
     *         description: Prénom ou nom manquant
     *       401:
     *         description: Identifiants invalides
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.post('/user/login', async (req, res) => {
      try {
        const { firstname, lastname } = req.body;

        if (!firstname || !lastname) {
          return res.status(400).json({
            code: 400,
            message: 'Firstname and lastname are required'
          });
        }

        const user = await this.UserModel.findOne({ firstname, lastname });

        if (!user) {
          return res.status(401).json({
            code: 401,
            message: 'Invalid credentials'
          });
        }

        // NOTE: This is insecure. In a real application, passwords should be hashed and compared.
        // For now, we are just checking if the user exists based on firstname and lastname.

        const token = jwt.sign(
          { id: user.id, firstname: user.firstname, lastname: user.lastname },
          this.config.jwtSecret,
          { expiresIn: '1h' }
        );

        return res.status(200).json({ token });
      } catch (err) {
        console.error(`[ERROR] user/login -> ${err}`);
        return res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      }
    });
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
    *     security:
    *       - bearerAuth: []
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
    this.app.delete('/user/:id', verifyToken, (req, res) => {
      try {
        this.UserModel.findByIdAndDelete(req.params.id)
          .then((user) => res.status(200).json(user || {}))
          .catch(() => res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          }));
      } catch (err) {
        console.error(`[ERROR] users/:id -> ${err}`);

        return res.status(400).json({
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
     *     security:
     *       - bearerAuth: []
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
    this.app.get('/user/:id', verifyToken, (req, res) => {
      try {
        this.UserModel.findById(req.params.id)
          .then((user) => res.status(200).json(user || {}))
          .catch(() => res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          }));
      } catch (err) {
        console.error(`[ERROR] users/:id -> ${err}`);

        return res.status(400).json({
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
     *               firstname:
     *                 type: string
     *                 example: Jean
     *               lastname:
     *                 type: string
     *                 example: Dupont
     *               avatar:
     *                 type: string
     *                 example: http://example.com/avatar.jpg
     *               age:
     *                 type: number
     *                 example: 30
     *               city:
     *                 type: string
     *                 example: Paris
     *             required:
     *               - firstname
     *               - lastname
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

        userModel.save()
          .then((user) => {
            if (!user) {
              return res.status(500).json({ code: 500, message: 'User creation failed unexpectedly.' });
            }
            const token = jwt.sign(
              { id: user.id, firstname: user.firstname, lastname: user.lastname },
              this.config.jwtSecret,
              { expiresIn: '24h' }
            );
            return res.status(201).json({ user, token });
          })
          .catch((errSave) => { // This block was also mostly correct.
            console.error(`[ERROR] users/create save -> ${errSave}`);
            return res.status(500).json({
              code: 500,
              message: 'Error saving user'
            });
          });
      } catch (err) {
        console.error(`[ERROR] users/create -> ${err}`);

        return res.status(400).json({
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
    this.login(); // Add the login route
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
 *         id:
 *           type: string
 *           description: L'ID de l'utilisateur (transformé depuis _id).
 *           example: 60564fcb544b5e001c62c8e6
 *         firstname:
 *           type: string
 *           description: Prénom de l'utilisateur.
 *           example: Jean
 *         lastname:
 *           type: string
 *           description: Nom de famille de l'utilisateur.
 *           example: Dupont
 *         avatar:
 *           type: string
 *           description: URL de l'avatar de l'utilisateur.
 *           example: http://example.com/avatar.jpg
 *         age:
 *           type: number
 *           description: Age de l'utilisateur.
 *           example: 30
 *         city:
 *           type: string
 *           description: Ville de l'utilisateur.
 *           example: Paris
 *       required:
 *         - firstname
 *         - lastname
 */
