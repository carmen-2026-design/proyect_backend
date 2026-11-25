import { Router } from "express";
import authRouter from "./auth.routes.js";

// El índice de la API: cada grupo de rutas vive en su propio archivo
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "API en funcionamiento" });
});

router.use("/auth", authRouter);

export default router;