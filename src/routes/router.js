import { Router } from "express";
import authRouter from "./auth.routes.js";
import recipeRouter from "./recipe.routes.js";
import categoryRouter from  "./category.routes.js";

// El índice de la API: cada grupo de rutas vive en su propio archivo
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "API en funcionamiento" });
});

router.use("/auth", authRouter);
router.use("/recipe", recipeRouter);
router.use("/category", categoryRouter);

export default router;