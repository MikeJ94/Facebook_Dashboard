import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from 'pino-http';
import router from './routes/index.js';
import { logger } from "./lib/logger";

const app: Express = express();

// Eliminamos el app.use(pinoHttp()) duplicado y dejamos solo el configurado
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

// 1. Tus rutas normales de la API (ej. /api/usuarios, /api/auth)
app.use("/api", router);

// 2. NUEVO: Ruta raíz de escape para verificar en el navegador que Express responde
app.get("/", (req, res) => {
  res.json({ 
    status: "healthy", 
    message: "Facebook Dashboard API Server corriendo con éxito en Vercel",
    timestamp: new Date().toISOString()
  });
});

export default app;
