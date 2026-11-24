// // import { User } from "../models/testdata.js";
// import { NotFoundError, throwError } from "../utils/errors.js";

// // Nunca devolvemos la contraseña al leer usuarios
// const PUBLIC_ATTRIBUTES = { exclude: ["password"] };

// // Quita la contraseña de un usuario recién creado o modificado
// // (create y save devuelven el objeto completo, con la contraseña)
// const withoutPassword = (user) => {
//     const { password, ...rest } = user.toJSON();
//     return rest;
// }

// // ------------------ CRUD de user ----------------------------

