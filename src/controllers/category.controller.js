import mongoose from "mongoose";
import { getCategories } from "../repositories/category.repository.js";
import { HttpError } from "../utils/HttpError.js";
import categoryRouter from "../routes/category.routes.js";
import { CategoryModel } from "../models/category.model.js";

// ---Consultar todas las categorias
const getAll = async (req, res, next) => {
  try {
    const categories = await getCategories();

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export default{ 
  getAll,
};