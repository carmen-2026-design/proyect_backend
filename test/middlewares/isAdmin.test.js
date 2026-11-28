
import { describe, it, expect, vi } from "vitest";
import { HttpError } from "../../src/utils/HttpError.js";
import { isAdmin } from "../../src/middlewares/auth.middleware.js";

const createRequest = (overrides = {}) => ({
  headers: {},
  cookies: {},
  ...overrides,
});

const createResponse = () => ({});

describe("isAdmin", () => {
  it("debe permitir el acceso a un administrador", () => {
    const req = createRequest({
      user: {
        _id: "6b0aafdc518fa5f39f8cf2a3",
        role: "admin",
        username: "Karla",
      },
    });
    const next = vi.fn();

    isAdmin(req, createResponse(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("debe devolver 403 si el usuario no es administrador", () => {
    const req = createRequest({
      user: {
        _id: "6b0aafdc518fa5f39f8cf2a4",
        role: "user",
        username: "Aurora",
      },
    });
    const next = vi.fn();

    isAdmin(req, createResponse(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
    expect(next.mock.calls[0][0].status).toBe(403);
    expect(next.mock.calls[0][0].message).toBe("No tienes permiso");
  });

  it("debe devolver 401 si no hay usuario autenticado", () => {
    const req = createRequest();
    const next = vi.fn();

    isAdmin(req, createResponse(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe(
      "No hay token de autenticación"
    );
  });
});
