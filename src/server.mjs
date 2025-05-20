// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import rateLimit from 'express-rate-limit';
import https from 'https';
import selfsigned from 'selfsigned';

// Core
import config from './config.mjs';
import routes from './controllers/routes.mjs';

const Server = class Server {
  constructor() {
    this.app = express();
    this.config = config[process.argv[2]] || config.development;
  }

  async dbConnect() {
    try {
      const host = this.config.mongodb;

      this.connect = await mongoose.createConnection(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      const close = () => {
        this.connect.close((error) => {
          if (error) {
            console.error('[ERROR] api dbConnect() close() -> mongodb error', error);
          } else {
            console.log('[CLOSE] api dbConnect() -> mongodb closed');
          }
        });
      };

      this.connect.on('error', (err) => {
        setTimeout(() => {
          console.log('[ERROR] api dbConnect() -> mongodb error');
          this.connect = this.dbConnect(host);
        }, 5000);

        console.error(`[ERROR] api dbConnect() -> ${err}`);
      });

      this.connect.on('disconnected', () => {
        setTimeout(() => {
          console.log('[DISCONNECTED] api dbConnect() -> mongodb disconnected');
          this.connect = this.dbConnect(host);
        }, 5000);
      });

      process.on('SIGINT', () => {
        close();
        console.log('[API END PROCESS] api dbConnect() -> close mongodb connection');
        process.exit(0);
      });
    } catch (err) {
      console.error(`[ERROR] api dbConnect() -> ${err}`);
    }
  }

  middleware() {
    const limiter = rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 429,
        message: 'Too many requests created from this IP, please try again after an hour'
      }
    });
    this.app.use(limiter);

    this.app.use(compression());
    this.app.use(cors({
      origin: ['http://localhost:8080', 'http://localhost:3000']
    }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API Efrei Mongoose',
          version: '1.0.0',
          description: "Documentation de l'API pour le projet Efrei Mongoose"
        },
        servers: [
          {
            url: `https://localhost:${this.config.port}`,
            description: 'Serveur de développement (HTTPS)'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter JWT Bearer token **_only_**'
            }
          }
        }
      },
      apis: ['./src/controllers/routes.mjs', './src/controllers/users.mjs', './src/controllers/photos.mjs', './src/controllers/albums.mjs']
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  routes() {
    new routes.Users(this.app, this.connect);
    new routes.Photos(this.app, this.connect);
    new routes.Albums(this.app, this.connect);

    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: 'Not Found'
      });
    });

    this.app.use((err, req, res, next) => {
      console.error(`[GLOBAL ERROR HANDLER] Path: ${req.path}, Error: ${err.message}`, err.stack);

      if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
          code: 400,
          message: 'Malformed JSON in request body. Please check your JSON syntax.'
        });
      }

      const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status < 600
        ? err.status
        : 500;
      
      return res.status(statusCode).json({
        code: statusCode,
        message: 'An unexpected server error occurred. Please try again later.'
      });
    });
  }

  security() {
    this.app.use(helmet());
    this.app.disable('x-powered-by');
  }

  async run() {
    try {
      await this.dbConnect();
      this.security();
      this.middleware();
      this.routes();

      const attrs = [{ name: 'commonName', value: 'localhost' }];
      const pems = selfsigned.generate(attrs, {
        keySize: 2048,
        days: 365,
        algorithm: 'sha256',
      });

      const httpsOptions = {
        key: pems.private,
        cert: pems.cert,
      };

      const httpsServer = https.createServer(httpsOptions, this.app);

      httpsServer.listen(this.config.port, () => {
        console.log(`[API START] HTTPS Server running on https://localhost:${this.config.port}`);
        console.log(`[API DOCS] Swagger UI available at https://localhost:${this.config.port}/api-docs`);
      });

    } catch (err) {
      console.error(`[ERROR] Server run() -> ${err}`);
    }
  }
};

export default Server;
