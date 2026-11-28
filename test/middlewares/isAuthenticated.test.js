
import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env.js";
import { HttpError } from "../../src/utils/HttpError.js";
import { isAuthenticated } from "../../src/middlewares/auth.middleware.js";

const userPayload = {
  _id: "6b0aafdc518fa5f39f8cf2a4",
  role: "user",
  username: "Aurora",
};

const createToken = (payload = userPayload, options = {}) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1h", ...options });

const createRequest = (overrides = {}) => ({
  headers: {},
  cookies: {},
  ...overrides,
});

const createResponse = () => ({});

describe("isAuthenticated", () => {
  it("debe devolver 401 si no hay token", () => {
    const req = createRequest();
    const next = vi.fn();

    isAuthenticated(req, createResponse(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe(
      "No hay token de autenticación"
    );
  });

  it("debe autenticar con un token válido en la cabecera", () => {
    const token = createToken();
    const req = createRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const next = vi.fn();

    isAuthenticated(req, createResponse(), next);

    expect(req.user).toEqual(userPayload);
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("debe autenticar con un token válido en la cookie", () => {
    const token = createToken();
    const req = createRequest({
      cookies: { token },
    });
    const next = vi.fn();

    isAuthenticated(req, createResponse(), next);

    expect(req.user).toEqual(userPayload);
    expect(next).toHaveBeenCalledWith();
  });

  it("debe dar prioridad al token de la cabecera sobre la cookie", () => {
    const tokenHeader = createToken(userPayload);
    const tokenCookie = createToken({
      ...userPayload,
      role: "admin",
      username: "Karla",
    });

    const req = createRequest({
      headers: { authorization: `Bearer ${tokenHeader}` },
      cookies: { token: tokenCookie },
    });
    const next = vi.fn();

    isAuthenticated(req, createResponse(), next);

    expect(req.user.role).toBe("user");
    expect(next).toHaveBeenCalledWith();
  });

  it("debe devolver 401 si el token es inválido", () => {
    const req = createRequest({
      headers: { authorization: "Bearer token-invalido" },
    });
    const next = vi.fn();

    isAuthenticated(req, createResponse(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe(
      "Token no válido o caducado"
    );
  });

  it("debe devolver 401 si el token ha caducado", () => {
    const token = createToken(userPayload, { expiresIn: "-1s" });
    const req = createRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const next = vi.fn();

    isAuthenticated(req, createResponse(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(next.mock.calls[0][0].message).toBe(
      "Token no válido o caducado"
    );
  });
});
