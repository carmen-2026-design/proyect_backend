
import { describe, it, expect, vi, beforeEach } from "vitest";

// Simulamos las funciones del repositorio y el modelo de categorías
const mocks = vi.hoisted(() => ({
  createRecipe: vi.fn(),
  getRecipes: vi.fn(),
  getRecipeById: vi.fn(),
  updateRecipe: vi.fn(),
  removeRecipe: vi.fn(),
  addReview: vi.fn(),
  deleteReview: vi.fn(),
  findCategory: vi.fn(),
}));

vi.mock("../../src/repositories/recipe.repository.js", () => ({
  createRecipe: mocks.createRecipe,
  getRecipes: mocks.getRecipes,
  getRecipeById: mocks.getRecipeById,
  updateRecipe: mocks.updateRecipe,
  removeRecipe: mocks.removeRecipe,
  addReview: mocks.addReview,
  deleteReview: mocks.deleteReview,
}));

vi.mock("../../src/models/category.model.js", () => ({
  CategoryModel: {
    findOne: mocks.findCategory,
  },
}));

import recipeController from "../../src/controllers/recipe.controller.js";
import { HttpError } from "../../src/utils/HttpError.js";

// Identificadores válidos de MongoDB para las pruebas
const recipeId = "507f1f77bcf86cd799439011";
const categoryId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";
const otherUserId = "507f1f77bcf86cd799439014";
const reviewId = "507f1f77bcf86cd799439015";

describe("recipe.controller", () => {
  let req;
  let res;
  let next;

  const publicRecipe = {
    _id: recipeId,
    name: "Tortilla de patatas",
    visibility: "public",
    authorizedUsers: [],
  };

  const friendsRecipe = {
    _id: recipeId,
    name: "Ensalada de pasta",
    visibility: "friends",
    authorizedUsers: [
      {
        userId,
        username: "Aurora",
      },
    ],
  };

  const privateRecipe = {
    _id: recipeId,
    name: "Receta privada",
    visibility: "private",
    authorizedUsers: [],
  };

  const category = {
    _id: categoryId,
    name: "Carnes",
    slug: "carnes",
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
      query: {},
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  // -----------------------------
  // GET ALL
  // -----------------------------

  describe("getAll", () => {
    it("debe listar únicamente recetas públicas para usuarios anónimos", async () => {
      mocks.getRecipes.mockResolvedValue([publicRecipe]);

      await recipeController.getAll(req, res, next);

      expect(mocks.getRecipes).toHaveBeenCalledWith({
        visibility: "public",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([publicRecipe]);
      expect(next).not.toHaveBeenCalled();
    });

    it("debe listar recetas públicas y friends autorizadas para usuarios", async () => {
      req.user = {
        _id: userId,
        role: "user",
      };

      mocks.getRecipes.mockResolvedValue([]);

      await recipeController.getAll(req, res, next);

      expect(mocks.getRecipes).toHaveBeenCalledWith({
        $or: [
          { visibility: "public" },
          {
            visibility: "friends",
            "authorizedUsers.userId": userId,
          },
        ],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it("debe listar todas las recetas para administradores", async () => {
      req.user = {
        _id: userId,
        role: "admin",
      };

      mocks.getRecipes.mockResolvedValue([
        publicRecipe,
        friendsRecipe,
        privateRecipe,
      ]);

      await recipeController.getAll(req, res, next);

      expect(mocks.getRecipes).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it("debe filtrar por slug de categoría", async () => {
      req.query.category = "carnes";

      mocks.findCategory.mockResolvedValue(category);
      mocks.getRecipes.mockResolvedValue([]);

      await recipeController.getAll(req, res, next);

      expect(mocks.findCategory).toHaveBeenCalledWith({
        slug: "carnes",
        isActive: true,
      });

      expect(mocks.getRecipes).toHaveBeenCalledWith({
        visibility: "public",
        category: categoryId,
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("debe normalizar el slug de categoría", async () => {
      req.query.category = " CARNES ";

      mocks.findCategory.mockResolvedValue(category);
      mocks.getRecipes.mockResolvedValue([]);

      await recipeController.getAll(req, res, next);

      expect(mocks.findCategory).toHaveBeenCalledWith({
        slug: "carnes",
        isActive: true,
      });
    });

    it("debe devolver 400 si la categoría no existe o no está activa", async () => {
      req.query.category = "categoria-inexistente";

      mocks.findCategory.mockResolvedValue(null);

      await recipeController.getAll(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.getRecipes).not.toHaveBeenCalled();
    });

    it("debe filtrar por parte del nombre sin distinguir mayúsculas", async () => {
      req.query.name = "tortilla";

      mocks.getRecipes.mockResolvedValue([publicRecipe]);

      await recipeController.getAll(req, res, next);

      expect(mocks.getRecipes).toHaveBeenCalledWith({
        visibility: "public",
        name: {
          $regex: "tortilla",
          $options: "i",
        },
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("debe combinar los filtros de categoría y nombre", async () => {
      req.query.category = "carnes";
      req.query.name = "pollo";

      mocks.findCategory.mockResolvedValue(category);
      mocks.getRecipes.mockResolvedValue([]);

      await recipeController.getAll(req, res, next);

      expect(mocks.getRecipes).toHaveBeenCalledWith({
        visibility: "public",
        category: categoryId,
        name: {
          $regex: "pollo",
          $options: "i",
        },
      });
    });

    it("debe pasar al siguiente middleware si ocurre un error", async () => {
      const error = new Error("Error de base de datos");

      mocks.getRecipes.mockRejectedValue(error);

      await recipeController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // -----------------------------
  // GET BY ID
  // -----------------------------

  describe("getById", () => {
    it("debe consultar una receta pública sin autenticación", async () => {
      req.params.id = recipeId;
      mocks.getRecipeById.mockResolvedValue(publicRecipe);

      await recipeController.getById(req, res, next);

      expect(mocks.getRecipeById).toHaveBeenCalledWith(recipeId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(publicRecipe);
    });

    it("debe permitir consultar una receta friends a un usuario autorizado", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: userId,
        role: "user",
      };

      mocks.getRecipeById.mockResolvedValue(friendsRecipe);

      await recipeController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(friendsRecipe);
    });

    it("debe impedir consultar una receta friends a un usuario no autorizado", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: otherUserId,
        role: "user",
      };

      mocks.getRecipeById.mockResolvedValue(friendsRecipe);

      await recipeController.getById(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
    });

    it("debe permitir consultar recetas privadas a administradores", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: userId,
        role: "admin",
      };

      mocks.getRecipeById.mockResolvedValue(privateRecipe);

      await recipeController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("debe impedir consultar recetas privadas a usuarios normales", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: userId,
        role: "user",
      };

      mocks.getRecipeById.mockResolvedValue(privateRecipe);

      await recipeController.getById(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
    });

    it("debe devolver 400 si el identificador no es válido", async () => {
      req.params.id = "patata";

      await recipeController.getById(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.getRecipeById).not.toHaveBeenCalled();
    });

    it("debe devolver 404 si la receta no existe", async () => {
      req.params.id = recipeId;
      mocks.getRecipeById.mockResolvedValue(null);

      await recipeController.getById(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
    });
  });

  // -----------------------------
  // CREATE
  // -----------------------------

  describe("create", () => {
    it("debe crear una receta convirtiendo el slug de categoría en ObjectId", async () => {
      req.body = {
        name: "Pollo al horno",
        category: "carnes",
        difficulty: "easy",
        unexpectedField: "No permitido",
      };

      const createdRecipe = {
        name: "Pollo al horno",
        category: categoryId,
      };

      mocks.findCategory.mockResolvedValue(category);
      mocks.createRecipe.mockResolvedValue(createdRecipe);

      await recipeController.create(req, res, next);

      expect(mocks.findCategory).toHaveBeenCalledWith({
        slug: "carnes",
        isActive: true,
      });

      expect(mocks.createRecipe).toHaveBeenCalledWith({
        name: "Pollo al horno",
        category: categoryId,
        difficulty: "easy",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdRecipe);
    });

    it("debe rechazar una categoría inexistente", async () => {
      req.body = {
        name: "Pollo al horno",
        category: "inexistente",
      };

      mocks.findCategory.mockResolvedValue(null);

      await recipeController.create(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.createRecipe).not.toHaveBeenCalled();
    });

    it("debe rechazar la creación si no se indica categoría", async () => {
      req.body = {
        name: "Pollo al horno",
      };

      await recipeController.create(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.createRecipe).not.toHaveBeenCalled();
    });
  });

  // -----------------------------
  // UPDATE
  // -----------------------------

  describe("update", () => {
    it("debe modificar una receta con los campos permitidos", async () => {
      req.params.id = recipeId;
      req.body = {
        name: "Nueva tortilla",
        unexpectedField: "No permitido",
      };

      const updatedRecipe = {
        ...publicRecipe,
        name: "Nueva tortilla",
      };

      mocks.updateRecipe.mockResolvedValue(updatedRecipe);

      await recipeController.update(req, res, next);

      expect(mocks.updateRecipe).toHaveBeenCalledWith(recipeId, {
        name: "Nueva tortilla",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedRecipe);
    });

    it("debe convertir el slug de categoría al modificarla", async () => {
      req.params.id = recipeId;
      req.body = {
        category: "carnes",
      };

      mocks.findCategory.mockResolvedValue(category);
      mocks.updateRecipe.mockResolvedValue(publicRecipe);

      await recipeController.update(req, res, next);

      expect(mocks.updateRecipe).toHaveBeenCalledWith(recipeId, {
        category: categoryId,
      });
    });

    it("debe devolver 400 si el identificador no es válido", async () => {
      req.params.id = "incorrecto";
      req.body = {
        name: "Nueva receta",
      };

      await recipeController.update(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.updateRecipe).not.toHaveBeenCalled();
    });

    it("debe devolver 400 si no hay campos modificables", async () => {
      req.params.id = recipeId;
      req.body = {
        unknownField: "valor",
      };

      await recipeController.update(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.updateRecipe).not.toHaveBeenCalled();
    });

    it("debe devolver 404 si la receta no existe", async () => {
      req.params.id = recipeId;
      req.body = {
        name: "Nueva receta",
      };

      mocks.updateRecipe.mockResolvedValue(null);

      await recipeController.update(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
    });
  });

  // -----------------------------
  // REMOVE
  // -----------------------------

  describe("remove", () => {
    it("debe eliminar una receta existente", async () => {
      req.params.id = recipeId;
      mocks.removeRecipe.mockResolvedValue(publicRecipe);

      await recipeController.remove(req, res, next);

      expect(mocks.removeRecipe).toHaveBeenCalledWith(recipeId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Receta eliminada correctamente",
      });
    });

    it("debe devolver 400 si el identificador no es válido", async () => {
      req.params.id = "incorrecto";

      await recipeController.remove(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.removeRecipe).not.toHaveBeenCalled();
    });

    it("debe devolver 404 si la receta no existe", async () => {
      req.params.id = recipeId;
      mocks.removeRecipe.mockResolvedValue(null);

      await recipeController.remove(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
    });
  });

  // -----------------------------
  // CREATE REVIEW
  // -----------------------------

  describe("createReview", () => {
    it("debe añadir una reseña de un usuario autenticado", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: userId,
        username: "Aurora",
        role: "user",
      };
      req.body = {
        text: "  Muy buena receta  ",
      };

      mocks.getRecipeById.mockResolvedValue(publicRecipe);
      mocks.addReview.mockResolvedValue(publicRecipe);

      await recipeController.createReview(req, res, next);

      expect(mocks.addReview).toHaveBeenCalledWith(recipeId, {
        userId,
        username: "Aurora",
        text: "Muy buena receta",
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("debe permitir también publicar reseñas a administradores", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: userId,
        username: "Karla",
        role: "admin",
      };
      req.body = {
        text: "Buena receta",
      };

      mocks.getRecipeById.mockResolvedValue(publicRecipe);
      mocks.addReview.mockResolvedValue(publicRecipe);

      await recipeController.createReview(req, res, next);

      expect(mocks.addReview).toHaveBeenCalledWith(recipeId, {
        userId,
        username: "Karla",
        text: "Buena receta",
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("debe rechazar un identificador incorrecto", async () => {
      req.params.id = "incorrecto";
      req.user = {
        _id: userId,
        username: "Aurora",
      };
      req.body = {
        text: "Buena receta",
      };

      await recipeController.createReview(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.addReview).not.toHaveBeenCalled();
    });

    it("debe rechazar una reseña vacía", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: userId,
        username: "Aurora",
      };
      req.body = {
        text: "   ",
      };

      await recipeController.createReview(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.addReview).not.toHaveBeenCalled();
    });

    it("debe impedir reseñar una receta a la que no se tiene acceso", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: otherUserId,
        username: "Ander",
        role: "user",
      };
      req.body = {
        text: "Buena receta",
      };

      mocks.getRecipeById.mockResolvedValue(privateRecipe);

      await recipeController.createReview(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
      expect(mocks.addReview).not.toHaveBeenCalled();
    });

    it("debe devolver 404 si la receta no existe", async () => {
      req.params.id = recipeId;
      req.user = {
        _id: userId,
        username: "Aurora",
      };
      req.body = {
        text: "Buena receta",
      };

      mocks.getRecipeById.mockResolvedValue(null);

      await recipeController.createReview(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
      expect(mocks.addReview).not.toHaveBeenCalled();
    });
  });

  // -----------------------------
  // REMOVE REVIEW
  // -----------------------------

  describe("removeReview", () => {
    it("debe eliminar una reseña existente", async () => {
      req.params = {
        id: recipeId,
        reviewId,
      };

      mocks.deleteReview.mockResolvedValue(publicRecipe);

      await recipeController.removeReview(req, res, next);

      expect(mocks.deleteReview).toHaveBeenCalledWith(
        recipeId,
        reviewId
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Reseña eliminada correctamente",
      });
    });

    it("debe devolver 400 si alguno de los identificadores no es válido", async () => {
      req.params = {
        id: recipeId,
        reviewId: "incorrecto",
      };

      await recipeController.removeReview(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(mocks.deleteReview).not.toHaveBeenCalled();
    });

    it("debe devolver 404 si no existe la receta o la reseña", async () => {
      req.params = {
        id: recipeId,
        reviewId,
      };

      mocks.deleteReview.mockResolvedValue(null);

      await recipeController.removeReview(req, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
    });
  });
});
