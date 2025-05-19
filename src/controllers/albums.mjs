import AlbumModel from '../models/album.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);

    this.run();
  }

  /**
   * @swagger
   * tags:
   *   name: Albums
   *   description: Opérations de gestion des albums
   */

  getById() {
    /**
    * @swagger
    * /album/{id}:
    *   get:
    *     summary: Obtenir un album par ID
    *     tags: [Albums]
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: string
    *         required: true
    *         description: L'ID de l'album
    *     responses:
    *       200:
    *         description: Album trouvé
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/Album'
    *       400:
    *         description: Mauvaise requête
    *       500:
    *         description: Erreur interne du serveur
     */
    this.app.get('/album/:id', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.id).populate('photos').then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

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
     * /album:
     *   post:
     *     summary: Créer un nouvel album
     *     tags: [Albums]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: Mes photos de vacances
     *               description:
     *                 type: string
     *                 example: Photos de mes vacances 2024.
     *               # Ajoutez ici les autres propriétés de votre AlbumModel
     *             required:
     *               - title
     *     responses:
     *       201:
     *         description: Album créé avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Album'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.post('/album/', (req, res) => {
      try {
        const albumModel = new this.AlbumModel(req.body);

        albumModel.save().then((album) => {
          res.status(201).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/ -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  updateById() {
    /**
     * @swagger
     * /album/{id}:
     *   put:
     *     summary: Mettre à jour un album par ID
     *     tags: [Albums]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de l'album
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: Titre de l'album mis à jour
     *               description:
     *                 type: string
     *                 example: Description mise à jour.
     *               # Ajoutez ici les autres propriétés de votre AlbumModel
     *     responses:
     *       200:
     *         description: Album mis à jour avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Album'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.put('/album/:id', (req, res) => {
      try {
        this.AlbumModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  deleteById() {
    /**
     * @swagger
     * /album/{id}:
     *   delete:
     *     summary: Supprimer un album par ID
     *     tags: [Albums]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de l'album
     *     responses:
     *       200:
     *         description: Album supprimé avec succès ou album non trouvé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Album'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.delete('/album/:id', (req, res) => {
      try {
        this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getAll() {
    /**
     * @swagger
     * /albums:
     *   get:
     *     summary: Obtenir tous les albums
     *     tags: [Albums]
     *     responses:
     *       200:
     *         description: Une liste d'albums
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Album'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.get('/albums/', (req, res) => {
      try {
        this.AlbumModel.find().sort({ title: 1 }).populate('photos').then((albums) => {
          res.status(200).json(albums || []);
        })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] albums/ -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.getById();
    this.create();
    this.updateById();
    this.deleteById();
    this.getAll();
  }
};

export default Albums;

/**
 * @swagger
 * components:
 *   schemas:
 *     Album:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: L'ID auto-généré de l'album.
 *           example: 60564fcb544b5e001c62c8e7
 *         title:
 *           type: string
 *           description: Titre de l'album.
 *           example: Mon voyage génial
 *         description:
 *           type: string
 *           description: Description de l'album.
 *           example: Photos de mon voyage à la montagne.
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *             # Ou $ref: '#/components/schemas/Photo' si vous définissez un schéma Photo
 *           description: Liste des ID de photos ou des objets photo associés à l'album.
 *         # Ajoutez les autres champs de votre schéma AlbumModel
 *       required:
 *         - title
 */
