import { Router } from "express";
import recipeController from "../controllers/recipe.controller.js";
import { isAuthenticated, isAdmin, isAuthenticatedOptional } from "../middlewares/auth.middleware.js";

// Documentación de estas rutas (Swagger): src/docs/recipes.yaml
const recipeRouter = Router();

// Receta
recipeRouter.get("/", isAuthenticatedOptional, recipeController.getAll);     //Consultar recetas accesibles (Permiso public/autorized user/admin)
recipeRouter.get("/:id", isAuthenticatedOptional, recipeController.getById); //Consultar una receta según visibilidad

recipeRouter.post("/", isAuthenticated, isAdmin, recipeController.create);       //Crear receta (admin)
recipeRouter.patch("/:id", isAuthenticated, isAdmin, recipeController.update);   //Modificar receta (admin)
recipeRouter.delete("/:id", isAuthenticated, isAdmin, recipeController.remove);  //Eliminar receta (admin)

//Reseña de la receta
recipeRouter.post("/:id/review", isAuthenticated, recipeController.createReview);                       //Añadir reseña
recipeRouter.delete("/:id/review/:reviewId", isAuthenticated, isAdmin, recipeController.removeReview)   //Eliminar reseña (admin)


export default recipeRouter;