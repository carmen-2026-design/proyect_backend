
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { errorHandler } from "../../src/middlewares/error.middleware.js";
import { HttpError } from "../../src/utils/HttpError.js";

describe("errorHandler", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  it("debe responder con el status y mensaje de un HttpError", () => {
    const error = new HttpError(403, "No tienes permiso");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "No tienes permiso",
    });
  });

  it("debe responder 400 con los detalles de un ValidationError", () => {
    const error = new mongoose.Error.ValidationError();

    error.errors = {
      name: { message: "El nombre es obligatorio" },
      description: { message: "La descripción es obligatoria" },
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Hay datos que no son válidos",
      details: {
        name: "El nombre es obligatorio",
        description: "La descripción es obligatoria",
      },
    });
  });

  it("debe responder 400 cuando el ObjectId no tiene un formato válido", () => {
    const error = new mongoose.Error.CastError(
      "ObjectId",
      "patata",
      "_id"
    );

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: '"patata" no es un id válido',
    });
  });

  it("debe responder 409 cuando existe un dato duplicado", () => {
    const error = {
      code: 11000,
      keyValue: {
        email: "aurora@ejemplo.com",
      },
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Ese email ya está registrado",
    });
  });

  it("debe responder 409 con el campo genérico si no existe keyValue", () => {
    const error = {
      code: 11000,
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Ese dato ya está registrado",
    });
  });

  it("debe responder 400 cuando el JSON del body está mal escrito", () => {
    const error = {
      type: "entity.parse.failed",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "El body no es un JSON válido",
    });
  });

  describe("errores internos", () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it("debe responder 500 ante un error desconocido", () => {
      const error = new Error("Error inesperado");

      errorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error interno del servidor",
      });
    });
  });
});
