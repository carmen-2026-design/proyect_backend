
import mongoose from "mongoose";
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  removeRecipe,
  addReview,
  deleteReview,
} from "../repositories/recipe.repository.js";
import { HttpError } from "../utils/HttpError.js";
import { CategoryModel } from "../models/category.model.js";

// --- Campos modificables de una receta
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

// --- Filtrar los campos que se pueden modificar
const getEditableData = (data = {}) =>
  Object.fromEntries(
    Object.entries(data ?? {}).filter(([key]) => editableFields.includes(key))
  );

// --- Buscar una categoría por su slug
const getCategoryBySlug = async (slug) => {
  if (typeof slug !== "string" || !slug.trim()) {
    throw new HttpError(400, "El identificador de la categoría es obligatorio");
  }

  const category = await CategoryModel.findOne({
    slug: slug.trim().toLowerCase(),
    isActive: true,
  });

  if (!category) {
    throw new HttpError(400, "La categoría no existe o no está activa");
  }

  return category;
};

// --- Comprobar acceso a una receta
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

//---------------- Recetas
// --- Consultar todas las recetas
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

    // Filtro por slug de categoría
    if (req.query.category) {
      const category = await getCategoryBySlug(req.query.category);
      filters.category = category._id;
    }

    //Filtro por parte del nombre de la receta
    if (req.query.name) {
      filters.name = {
      $regex: req.query.name.trim(),
      $options: "i",  //no distingue mayúsculas y minúsculas
    };
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

// --- Crear una receta
const create = async (req, res, next) => {
  try {
    const data = getEditableData(req.body);

    // Convertir el slug de la categoría en su ObjectId
    const category = await getCategoryBySlug(data.category);
    data.category = category._id;

    const recipe = await createRecipe(data);

    res.status(201).json(recipe);
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

    // Convertir el slug en ObjectId si se modifica la categoría
    if (Object.hasOwn(recipeData, "category")) {
      const category = await getCategoryBySlug(recipeData.category);
      recipeData.category = category._id;
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

//----------------- Reseñas

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

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  createReview,
  removeReview,
};

