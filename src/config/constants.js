// Valores permitidos, definidos UNA sola vez.
// Object.freeze impide que alguien los modifique por error.

/** Roles de usuario */
export const ROLES = Object.freeze(["user", "admin"]);

// /** Tecnologías que se pueden asignar a un bug */
// export const TECHNOLOGIES = Object.freeze([
//   "javascript", "typescript", "html", "css", "react",
//   "node", "express", "mongodb", "git", "vite", "other",
// ]);

// /**
//  * Comprueba si un valor es una tecnología válida.
//  *
//  * @param {*} value - Cualquier valor (por ejemplo, un query param)
//  * @returns {boolean} true si es una de las TECHNOLOGIES
//  * @example
//  * isTechnology("react") // true
//  * isTechnology("cobol") // false
//  */
// export function isTechnology(value) {
//   return typeof value === "string" && TECHNOLOGIES.includes(value);
// }