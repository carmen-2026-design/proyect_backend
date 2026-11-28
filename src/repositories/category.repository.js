import { CategoryModel } from "../models/category.model.js";

//CRUD de categorias

//Leer todas las categorías
const getCategories = async () => {
  return await CategoryModel.find()
  .sort({ name: 1 });
};


export {
    getCategories
}