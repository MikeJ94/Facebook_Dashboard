import { Router, type IRouter } from "express";
//import { HealthCheckResponse } from "@workspace/api-zod";
//import { HealthCheckResponse } from "../../lib/api-zod/src/index.js";
// Cambia la ruta relativa por el alias del workspace apuntando al archivo .js final:
import { HealthCheckResponse } from "@workspace/api-zod/src/index.js";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
