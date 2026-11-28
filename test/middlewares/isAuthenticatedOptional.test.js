
import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env.js";
import { HttpError } from "../../src/utils/HttpError.js";
import { isAuthenticatedOptional } from "../../src/middlewares/auth.middleware.js";

const userPayload = {
  _id: "6b0aafdc518fa5f39f8cf2a4",
  role: "user",
  username: "Aurora",
};

const createToken = (payload = userPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1h" });

const createRequest = (overrides = {}) => ({
  headers: {},
  cookies: {},
  ...overrides,
});

const createResponse = () => ({});

describe("isAuthenticatedOptional", () => {
  it("debe permitir el acceso sin token como usuario anónimo", () => {
    const req = createRequest();
    const next = vi.fn();

    isAuthenticatedOptional(req, createResponse(), next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("debe autenticar si recibe un token válido", () => {
    const token = createToken();
    const req = createRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const next = vi.fn();

    isAuthenticatedOptional(req, createResponse(), next);

    expect(req.user).toEqual(userPayload);
    expect(next).toHaveBeenCalledWith();
  });

  it("debe autenticar si recibe un token válido en la cookie", () => {
    const token = createToken();
    const req = createRequest({
      cookies: { token },
    });
    const next = vi.fn();

    isAuthenticatedOptional(req, createResponse(), next);

    expect(req.user).toEqual(userPayload);
    expect(next).toHaveBeenCalledWith();
  });

  it("debe devolver 401 si recibe un token inválido", () => {
    const req = createRequest({
      headers: { authorization: "Bearer token-invalido" },
    });
    const next = vi.fn();

    isAuthenticatedOptional(req, createResponse(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe(
      "Token no válido o caducado"
    );
  });
});
