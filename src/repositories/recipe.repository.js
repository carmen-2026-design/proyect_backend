import { RecipeModel } from "../models/recipe.model.js";
import { CategoryModel } from "../models/category.model.js";

//CRUD de recetas

//Crear una receta
const createRecipe = async (data) => {
  const recipe = new RecipeModel(data);
  return await recipe.save();
};

//Leer todas las recetas
const getRecipes = async (filters = {}) => {
  return await RecipeModel.find(filters)
  .populate("category")
  .sort({ name: 1 });
};

//Leer una receta
const getRecipeById = async (id) => {
  return await RecipeModel.findById(id).populate("category");
};

//Modificar una receta
const updateRecipe = async (id, data) => {
  return await RecipeModel.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true,
    }
  ).populate("category");
};

//Eliminar receta
const removeRecipe = async (id) => {
  return await RecipeModel.findByIdAndDelete(id);
};

//------------Reseñas
//Añadir reseña
const addReview = async (id, data) => {
  return await RecipeModel.findByIdAndUpdate(
    id,
    {
      $push: {
        reviews: data,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("category");
};

//Eliminar reseña
const deleteReview = async (id, reviewId) => {
  return await RecipeModel.findOneAndUpdate(
    {
      _id: id,
      "reviews._id": reviewId,
    },
    {
      $pull: {
        reviews: { _id: reviewId },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("category");
};


export {
    createRecipe,
    getRecipes,
    getRecipeById,
    updateRecipe,
    removeRecipe,
    addReview,
    deleteReview
}
