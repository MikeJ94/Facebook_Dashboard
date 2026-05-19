import express, { type Express } from "express";
import cors from "cors";
//import pinoHttp from "pino-http";
import { pinoHttp } from 'pino-http';
//import router from "./routes";
// Por esto (añadiendo el archivo explícitamente):
import router from './routes/index.js';
import { logger } from "./lib/logger";

const app: Express = express();
app.use(pinoHttp()); // Ahora sí tendrá firma de llamada

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
//app.use("/", router);

export default app;
