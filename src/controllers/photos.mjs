import Photo from '../models/photo.mjs';
import Album from '../models/album.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', Photo);
    this.AlbumModel = connect.model('Album', Album);
    this.run();
  }

  getall() {
    this.app.get('/albums/:idalbum/photos', (req, res) => {
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
    this.app.get('/albums/:idalbum/photo/:idphoto', (req, res) => {
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
    this.app.post('/albums/:idalbum/photo', (req, res) => {
      try {
        const photoData = {
          ...req.body,
          album: req.params.idalbum
        };
        const photoModel = new this.PhotoModel(photoData);
        photoModel.save()
          .then((savedPhoto) => this.AlbumModel.findByIdAndUpdate(
            req.params.idalbum,
            { $push: { photos: savedPhoto._id } },
            { new: true }
          ))
          .then((updatedAlbum) => {
            res.status(201).json(updatedAlbum || {});
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] albums/:idalbum/photo -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  updateById() {
    this.app.put('/album/:idalbum/photo/:idphoto', (req, res) => {
      try {
        this.PhotoModel.findByIdAndUpdate(
          req.params.idphoto,
          req.body,
          { new: true }
        ).then((photo) => {
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

  deleteById() {
    this.app.delete('/albums/:idalbum/photo/:idphoto', (req, res) => {
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
