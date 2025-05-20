import Photo from '../models/photo.mjs';
import Album from '../models/album.mjs';
import verifyToken from '../middleware/auth.mjs';
import { validateRequest } from '../utils/validator.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', Photo);
    this.AlbumModel = connect.model('Album', Album);
    this.run();
  }

  /**
   * @swagger
   * tags:
   *   name: Photos
   *   description: Opérations de gestion des photos, généralement au sein d'un album
   */

  getall() {
    /**
    * @swagger
    * /albums/{idalbum}/photos:
    *   get:
    *     summary: Obtenir toutes les photos d'un album spécifique
    *     tags: [Photos]
    *     parameters:
    *       - in: path
    *         name: idalbum
    *         schema:
    *           type: string
    *         required: true
    *         description: L'ID de l'album
    *     security:
    *       - bearerAuth: []
    *     responses:
    *       200:
    *         description: Une liste de photos pour l'album
    *         content:
    *           application/json:
    *             schema:
    *               type: array
    *               items:
    *                 $ref: '#/components/schemas/Photo'
    *       400:
    *         description: Mauvaise requête
    *       500:
    *         description: Erreur interne du serveur
     */
    this.app.get('/albums/:idalbum/photos', verifyToken, (req, res) => {
      try {
        console.log('[DEBUG] albums/:idalbum/photos -> idalbum = ', req.params.idalbum);

        this.PhotoModel.find({ album: req.params.idalbum })
          .populate('album')
          .then((photos) => {
            res.status(200).json(photos || []);
          })
          .catch((err) => {
            console.error(`[ERROR] albums/:idalbum/photos -> ${err}`);
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  getById() {
    /**
     * @swagger
     * /albums/{idalbum}/photo/{idphoto}:
     *   get:
     *     summary: Obtenir une photo spécifique par ID au sein d'un album
     *     tags: [Photos]
     *     parameters:
     *       - in: path
     *         name: idalbum
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de l'album
     *       - in: path
     *         name: idphoto
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de la photo
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Photo trouvée
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Photo'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.get('/albums/:idalbum/photo/:idphoto', verifyToken, (req, res) => {
      try {
        this.PhotoModel.findById(req.params.idphoto).populate('album').then((photo) => {
          res.status(200).json(photo || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:idalbum/photo/:idphoto -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  add() {
    /**
     * @swagger
     * /albums/{idalbum}/photo:
     *   post:
     *     summary: Ajouter une nouvelle photo à un album
     *     tags: [Photos]
     *     parameters:
     *       - in: path
     *         name: idalbum
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de l'album auquel ajouter la photo
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: Vue du coucher de soleil
     *               imageUrl:
     *                 type: string
     *                 format: url
     *                 example: http://example.com/coucher_soleil.jpg
     *               # Ajoutez ici les autres propriétés de votre PhotoModel
     *             required:
     *               - title
     *               - imageUrl
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       201:
     *         description: Photo ajoutée et album mis à jour avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Album' # Retourne l'album mis à jour
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.post('/albums/:idalbum/photo', verifyToken, (req, res) => {
      try {
        const validationErrors = validateRequest(req.body, (body) => {
          body.required().isObject(obj => {
            obj('title').required().isString().minLength(1);
            obj('imageUrl').required().isString(); 
          });
        });

        if (validationErrors.length > 0) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: validationErrors
          });
        }

        const photoData = {
          ...req.body,
          album: req.params.idalbum
        };
        const photoModel = new this.PhotoModel(photoData);
        photoModel.save()
          .then((savedPhoto) => {
            if (!savedPhoto) {
              throw new Error('Photo saving failed before album update.');
            }
            return this.AlbumModel.findByIdAndUpdate(
              req.params.idalbum,
              { $push: { photos: savedPhoto._id } },
              { new: true, runValidators: true }
            ).populate('photos');
          })
          .then((updatedAlbum) => {
            if (!updatedAlbum) {
              return res.status(404).json({ code: 404, message: 'Album not found or failed to update after photo creation.' });
            }
            res.status(201).json(updatedAlbum);
          })
          .catch((saveOrUpdateErr) => {
            console.error(`[ERROR] POST /albums/:idalbum/photo save/update -> ${saveOrUpdateErr.message}`);
            if (photoModel._id) {
                 this.PhotoModel.findByIdAndDelete(photoModel._id).catch(delErr => console.error(`Failed to clean up photo ${photoModel._id}: ${delErr.message}`));
            }
            res.status(500).json({
              code: 500,
              message: 'Error adding photo or updating album.'
            });
          });
      } catch (err) {
        console.error(`[ERROR] POST /albums/:idalbum/photo -> ${err.message}`);
        res.status(500).json({
          code: 500,
          message: 'An unexpected error occurred while adding photo.'
        });
      }
    });
  }

  updateById() {
    /**
     * @swagger
     * /album/{idalbum}/photo/{idphoto}:
     *   put:
     *     summary: Mettre à jour une photo spécifique par ID
     *     tags: [Photos]
     *     parameters:
     *       - in: path
     *         name: idalbum
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de l'album (note : le chemin utilise 'album' au singulier)
     *       - in: path
     *         name: idphoto
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de la photo à mettre à jour
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: Magnifique coucher de soleil
     *               imageUrl:
     *                 type: string
     *                 format: url
     *                 example: http://example.com/magnifique_coucher_soleil.jpg
     *               # Ajoutez ici les autres propriétés modifiables de votre PhotoModel
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Photo mise à jour avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Photo'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.put('/albums/:idalbum/photo/:idphoto', verifyToken, (req, res) => {
      try {
        const validationErrors = validateRequest(req.body, (body) => {
          body.isObject(obj => {
            obj('title').isString().minLength(1);
            obj('imageUrl').isString();
          });
        });

        if (validationErrors.length > 0) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: validationErrors
          });
        }

        this.PhotoModel.findByIdAndUpdate(
          req.params.idphoto,
          req.body,
          { new: true, runValidators: true }
        ).then((photo) => {
          if (!photo) {
            return res.status(404).json({ code: 404, message: 'Photo not found' });
          }
          res.status(200).json(photo);
        }).catch((updateErr) => {
          console.error(`[ERROR] PUT /albums/:idalbum/photo/:idphoto update -> ${updateErr.message}`);
          res.status(500).json({
            code: 500,
            message: 'Error updating photo'
          });
        });
      } catch (err) {
        console.error(`[ERROR] PUT /albums/:idalbum/photo/:idphoto -> ${err.message}`);
        res.status(500).json({
          code: 500,
          message: 'An unexpected error occurred while updating photo.'
        });
      }
    });
  }

  deleteById() {
    /**
     * @swagger
     * /albums/{idalbum}/photo/{idphoto}:
     *   delete:
     *     summary: Supprimer une photo spécifique par ID
     *     tags: [Photos]
     *     parameters:
     *       - in: path
     *         name: idalbum
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de l'album
     *       - in: path
     *         name: idphoto
     *         schema:
     *           type: string
     *         required: true
     *         description: L'ID de la photo à supprimer
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Photo supprimée avec succès ou photo non trouvée
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Photo'
     *       400:
     *         description: Mauvaise requête
     *       500:
     *         description: Erreur interne du serveur
     */
    this.app.delete('/albums/:idalbum/photo/:idphoto', verifyToken, (req, res) => {
      try {
        this.PhotoModel.findByIdAndDelete(req.params.idphoto).then((photo) => {
          res.status(200).json(photo || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:idalbum/photo/:idphoto -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.getall();
    this.getById();
    this.add();
    this.updateById();
    this.deleteById();
  }
};

export default Photos;

/**
 * @swagger
 * components:
 *   schemas:
 *     Photo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: L'ID auto-généré de la photo.
 *           example: 70564fcb544b5e001c62c8e8
 *         title:
 *           type: string
 *           description: Titre de la photo.
 *           example: Lever de soleil sur la plage
 *         imageUrl:
 *           type: string
 *           format: url
 *           description: URL de la photo.
 *           example: http://example.com/lever_soleil_plage.jpg
 *         album:
 *           type: string # Or $ref: '#/components/schemas/Album'
 *           description: ID de l'album auquel cette photo appartient.
 *           example: 60564fcb544b5e001c62c8e7
 *         # Ajoutez les autres champs de votre schéma PhotoModel
 *       required:
 *         - title
 *         - imageUrl
 *         - album
 */
