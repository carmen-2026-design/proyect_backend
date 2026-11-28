import { Router } from "express";
import categoryController from "../controllers/category.controller.js";

// Documentación de estas rutas (Swagger): src/docs/category.yaml
const categoryRouter = Router();

// Categoría
categoryRouter.get("/", categoryController.getAll);     //Consultar categorías (para conocer sus _id)

export default categoryRouter;