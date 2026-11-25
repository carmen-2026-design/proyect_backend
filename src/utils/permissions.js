/**
 * El usuario que viaja en el token y que isAuthenticated guarda en req.user.
 *
 * @typedef {Object} AuthUser
 * @property {string} _id - Id del usuario
 * @property {"user"|"admin"} role - Rol
 * @property {string} username - Nombre de usuario
 */

/**
 * ¿Es este usuario el autor del recurso?
 *
 * @param {AuthUser} user - El usuario del token (req.user)
 * @param {Object|string} authorId - El id del autor, como ObjectId o como string
 * @returns {boolean} true si son el mismo usuario
 * @example
 * isOwner(req.user, bug.author)          // un bug
 * isOwner(req.user, solution.author.id)  // una solución
 */
export function isOwner(user, authorId) {
  return user._id === authorId.toString();
}

/**
 * ¿Puede editar o borrar el recurso? Solo su autor o un admin.
 *
 * @param {AuthUser} user - El usuario del token (req.user)
 * @param {Object|string} authorId - El id del autor, como ObjectId o como string
 * @returns {boolean} true si es el autor o si es admin
 */
export function isOwnerOrAdmin(user, authorId) {
  return user.role === "admin" || isOwner(user, authorId);
}
