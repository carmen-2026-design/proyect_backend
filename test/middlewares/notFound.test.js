
import { describe, it, expect, vi } from "vitest";
import { notFound } from "../../src/middlewares/error.middleware.js";
import { HttpError } from "../../src/utils/HttpError.js";

describe("notFound", () => {
  it("debe pasar un HttpError 404 con el método y la URL", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/recipes/123",
    };

    const res = {};
    const next = vi.fn();

    notFound(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(404);
    expect(error.message).toBe(
      "No existe la ruta GET /api/recipes/123"
    );
  });

  it("debe incluir correctamente otros métodos HTTP", () => {
    const req = {
      method: "POST",
      originalUrl: "/api/unknown",
    };

    const next = vi.fn();

    notFound(req, {}, next);

    expect(next.mock.calls[0][0].message).toBe(
      "No existe la ruta POST /api/unknown"
    );
  });
});
