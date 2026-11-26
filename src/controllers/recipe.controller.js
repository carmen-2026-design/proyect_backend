
import mongoose from "mongoose";
import { createRecipe, getRecipes, getRecipeById, updateRecipe, removeRecipe, addReview, deleteReview } from "../repositories/recipe.repository.js";
import { HttpError } from "../utils/HttpError.js";
import recipeRouter from "../routes/recipe.routes.js";
import { CategoryModel } from "../models/category.model.js";

// ---Campos modificables de una receta
const editableFields = [
  "name",
  "description",
  "origin",
  "url",
  "category",
  "difficulty",
  "preparationTime",
  "cookingTime",
  "servings",
  "notes",
  "visibility",
  "authorizedUsers",
  "ingredients",
  "steps",
];

// ---Filtrar los campos que se pueden modificar
const getEditableData = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) =>
      editableFields.includes(key)
    )
  );
};

// ---Comprobar acceso a una receta
const canAccessRecipe = (recipe, user) => {
  // Recetas públicas: cualquier persona
  if (recipe.visibility === "public") {
    return true;
  }

  // Recetas privadas: solo administradores
  if (recipe.visibility === "private") {
    return user?.role === "admin";
  }

  // Los administradores pueden consultar todas las recetas friends
  if (user?.role === "admin") {
    return true;
  }

  // Recetas friends: usuarios autorizados
  if (recipe.visibility === "friends" && user) {
    return recipe.authorizedUsers.some(
      (authorized) =>
        authorized.userId.toString() === user._id.toString()
    );
  }

  return false;
};

//----------------Recetas
// ---Crear una receta
const create = async (req, res, next) => {
  try {
    const recipeData = getEditableData(req.body);

    const recipe = await createRecipe(recipeData);

    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

// ---Consultar todas las recetas
const getAll = async (req, res, next) => {
  try {
    let filters = {};

    // Administrador: todas las recetas
    if (req.user?.role === "admin") {
      filters = {};
    }
    // Usuario autenticado: públicas y friends autorizadas
    else if (req.user) {
      filters = {
        $or: [
          { visibility: "public" },
          {
            visibility: "friends",
            "authorizedUsers.userId": req.user._id,
          },
        ],
      };
    }
    // Usuario anónimo: solo públicas
    else {
      filters = { visibility: "public" };
    }

    //---filtro por nombre de la categoría
    if (req.query.category) {
      const categoryName = req.query.category.trim();

      const category = await CategoryModel.findOne({
        name: { $regex: `^${categoryName}$`, $options: "i" },
      });

      // Si no existe la categoría, no hay recetas que devolver.
      if (!category) {
        return res.status(200).json([]);
      }

      filters.category = category._id;
    }

    const recipes = await getRecipes(filters);

    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

// --- Consultar una receta
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, "El identificador de la receta no es válido");
    }

    const recipe = await getRecipeById(id);

    if (!recipe || !canAccessRecipe(recipe, req.user)) {
      throw new HttpError(404, "Receta no encontrada");
    }

    res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

// --- Modificar una receta
const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, "El identificador de la receta no es válido");
    }

    const recipeData = getEditableData(req.body);

    if (Object.keys(recipeData).length === 0) {
      throw new HttpError(400, "No se han indicado campos para modificar");
    }

    const recipe = await updateRecipe(id, recipeData);

    if (!recipe) {
      throw new HttpError(404, "Receta no encontrada");
    }

    res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
};

// --- Eliminar una receta
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, "El identificador de la receta no es válido");
    }

    const recipe = await removeRecipe(id);

    if (!recipe) {
      throw new HttpError(404, "Receta no encontrada");
    }

    res.status(200).json({
      message: "Receta eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

//-----------------Reseñas
// --- Añadir una reseña
const createReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new HttpError(400, "El identificador de la receta no es válido");
    }

    if (typeof text !== "string" || !text.trim()) {
      throw new HttpError(400, "El texto de la reseña es obligatorio");
    }

    // Comprobar que existe la receta y que el usuario tiene acceso
    const existingRecipe = await getRecipeById(id);

    if (
      !existingRecipe ||
      !canAccessRecipe(existingRecipe, req.user)
    ) {
      throw new HttpError(404, "Receta no encontrada");
    }

    // Preparar los datos de la reseña
    const reviewData = {
      userId: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    const recipe = await addReview(id, reviewData);

    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

// --- Eliminar una reseña
const removeReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(reviewId)
    ) {
      throw new HttpError(400, "El identificador no es válido");
    }

    const recipe = await deleteReview(id, reviewId);

    if (!recipe) {
      throw new HttpError(404, "Receta o reseña no encontrada");
    }

    res.status(200).json({
      message: "Reseña eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

export default{ 
  getAll,
  getById,
  create,
  update,
  remove,
  createReview,
  removeReview,
};


