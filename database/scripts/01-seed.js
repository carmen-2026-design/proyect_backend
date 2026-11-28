
// Datos iniciales de Recipia.
//
// Mongo ejecuta este script automáticamente SOLO la primera vez que arranca
// con el volumen vacío (carpeta /docker-entrypoint-initdb.d).
//
// Para volver a ejecutarlo:
// docker compose down -v && docker compose up
//
// Se ejecuta con mongosh dentro del contenedor.
// "db" es la base de datos indicada en MONGO_INITDB_DATABASE.
//
// Todos los usuarios tienen la contraseña "Secreta-1".
// Guardamos directamente su hash bcrypt (coste 10).

const PASSWORD_HASH =
  "$2b$10$.kXu7LLre5ivPJvGtr2PNeomd4co7YHUUt32ZLaGLq.Ipr00BrnDq";

const now = new Date();

const daysAgo = (days) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

// ─── Usuarios ────────────────────────────────────────────────────────────────

const karla = {
  _id: new ObjectId(),
  username: "Karla",
  email: "karla@recipia.dev",
  role: "admin",
};

const koldo = {
  _id: new ObjectId(),
  username: "Koldo",
  email: "koldo@recipia.dev",
  role: "admin",
};

const aurora = {
  _id: new ObjectId(),
  username: "Aurora",
  email: "aurora@ejemplo.com",
  role: "user",
};

const sofia = {
  _id: new ObjectId(),
  username: "Sofía",
  email: "sofia@ejemplo.com",
  role: "user",
};

const ander = {
  _id: new ObjectId(),
  username: "Ander",
  email: "ander@ejemplo.com",
  role: "user",
};

db.users.insertMany(
  [karla, koldo, aurora, sofia, ander].map((user) => ({
    ...user,
    password: PASSWORD_HASH,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
    __v: 0,
  }))
);

// ─── Categorías ──────────────────────────────────────────────────────────────

const entrantes = {
  _id: new ObjectId(),
  name: "Entrantes",
  slug: "entrantes",
  description: "Platos para comenzar una comida.",
  isActive: true,
};

const ensaladas = {
  _id: new ObjectId(),
  name: "Ensaladas",
  slug: "ensaladas",
  description: "Ensaladas y platos frescos.",
  isActive: true,
};

const carnes = {
  _id: new ObjectId(),
  name: "Carnes",
  slug: "carnes",
  description: "Recetas elaboradas con carne.",
  isActive: true,
};

const pescados = {
  _id: new ObjectId(),
  name: "Pescados",
  slug: "pescados",
  description: "Platos de pescado y marisco.",
  isActive: true,
};

const pasta = {
  _id: new ObjectId(),
  name: "Pasta",
  slug: "pasta",
  description: "Recetas de pasta.",
  isActive: true,
};

const postres = {
  _id: new ObjectId(),
  name: "Postres",
  slug: "postres",
  description: "Dulces y postres caseros.",
  isActive: true,
};

db.categories.insertMany(
  [entrantes, ensaladas, carnes, pescados, pasta, postres].map(
    (category) => ({
      ...category,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
      __v: 0,
    })
  )
);

// ─── Funciones auxiliares ────────────────────────────────────────────────────

// Ingrediente embebido.
const ingredient = (
  name,
  quantity,
  unit,
  section,
  optional = false,
  observations = ""
) => ({
  name,
  quantity,
  unit,
  section,
  optional,
  ...(observations ? { observations } : {}),
});

// Paso de elaboración embebido.
const step = (order, description) => ({
  order,
  description,
});

// Usuario autorizado.
// Guardamos el identificador y el nombre de usuario.
const authorizedUser = (user) => ({
  userId: user._id,
  username: user.username,
});

// Reseña embebida.
// Guardamos también el nombre del usuario para mostrarlo sin populate.
const review = (user, text, days = 1) => ({
  userId: user._id,
  username: user.username,
  text,
  createdAt: daysAgo(days),
});

// Receta.
const recipe = (data, days = 10) => ({
  _id: new ObjectId(),
  ...data,
  createdAt: daysAgo(days),
  updatedAt: daysAgo(days),
  __v: 0,
});

// ─── Recetas ─────────────────────────────────────────────────────────────────

// Receta 1: pública.
// Cualquier persona puede consultarla, incluso sin iniciar sesión.

const tortillaPatatas = recipe(
  {
    name: "Tortilla de patatas",
    description:
      "Tortilla de patatas tradicional, jugosa por dentro y dorada por fuera.",
    origin: "Receta de casa",
    url: "",
    category: entrantes._id,
    difficulty: "medium",
    preparationTime: 15,
    cookingTime: 25,
    servings: 4,
    notes: "Se puede preparar con o sin cebolla.",
    visibility: "public",
    authorizedUsers: [],

    ingredients: [
      ingredient("Patata", 600, "g", "fruit_vegetables"),
      ingredient("Huevo", 6, "unit", "dairy_eggs"),
      ingredient("Cebolla", 1, "unit", "fruit_vegetables", true),
      ingredient("Aceite de oliva", 200, "ml", "oils_sauces"),
      ingredient("Sal", 1, "pinch", "spices_condiments"),
    ],

    steps: [
      step(1, "Pelar las patatas y cortarlas en rodajas finas."),
      step(2, "Cortar la cebolla en trozos pequeños."),
      step(3, "Freír las patatas y la cebolla a fuego medio hasta que estén tiernas."),
      step(4, "Batir los huevos y añadir las patatas escurridas."),
      step(5, "Cuajar la tortilla por ambos lados al gusto."),
    ],

    reviews: [
      review(aurora, "La receta de toda la vida. ¡Queda buenísima!", 5),
      review(sofia, "Yo le añado un poquito más de cebolla.", 3),
    ],
  },
  15
);

// Receta 2: pública.

const ensaladaPasta = recipe(
  {
    name: "Ensalada de pasta",
    description: "Ensalada fría de pasta con tomate, atún y huevo.",
    origin: "Internet",
    url: "https://www.ejemplo.com/ensalada-pasta",
    category: ensaladas._id,
    difficulty: "easy",
    preparationTime: 15,
    cookingTime: 10,
    servings: 2,
    notes: "Servir fría.",
    visibility: "public",
    authorizedUsers: [],

    ingredients: [
      ingredient("Macarrones", 160, "g", "pasta_rice_legumes"),
      ingredient("Tomate cherry", 150, "g", "fruit_vegetables"),
      ingredient("Atún en conserva", 1, "unit", "canned_preserves"),
      ingredient("Huevo", 2, "unit", "dairy_eggs"),
      ingredient("Aceite de oliva", 15, "ml", "oils_sauces"),
      ingredient("Sal", 1, "pinch", "spices_condiments"),
    ],

    steps: [
      step(1, "Cocer la pasta siguiendo las indicaciones del fabricante."),
      step(2, "Cocer los huevos y dejarlos enfriar."),
      step(3, "Cortar los tomates cherry por la mitad."),
      step(4, "Mezclar la pasta con el tomate y el atún."),
      step(5, "Añadir el huevo troceado y aliñar."),
    ],

    reviews: [
      review(ander, "Muy fácil y rápida para el verano.", 2),
    ],
  },
  12
);

// Receta 3: compartida con usuarios autorizados.
// Solo Aurora y Sofía pueden consultarla, además de los administradores.

const albondigas = recipe(
  {
    name: "Albóndigas en salsa",
    description: "Albóndigas caseras con una salsa de verduras.",
    origin: "Mi madre",
    url: "",
    category: carnes._id,
    difficulty: "medium",
    preparationTime: 25,
    cookingTime: 40,
    servings: 4,
    notes: "Están todavía más ricas de un día para otro.",
    visibility: "friends",
    authorizedUsers: [
      authorizedUser(aurora),
      authorizedUser(sofia),
    ],

    ingredients: [
      ingredient("Carne picada de ternera", 500, "g", "meat"),
      ingredient("Huevo", 1, "unit", "dairy_eggs"),
      ingredient("Pan rallado", 40, "g", "bakery"),
      ingredient("Cebolla", 2, "unit", "fruit_vegetables"),
      ingredient("Zanahoria", 2, "unit", "fruit_vegetables"),
      ingredient("Ajo", 2, "unit", "fruit_vegetables"),
      ingredient("Harina", 30, "g", "bakery"),
      ingredient("Aceite de oliva", 50, "ml", "oils_sauces"),
    ],

    steps: [
      step(1, "Mezclar la carne picada con el huevo y el pan rallado."),
      step(2, "Formar las albóndigas y pasarlas ligeramente por harina."),
      step(3, "Dorar las albóndigas en una sartén."),
      step(4, "Pochar la cebolla, la zanahoria y el ajo."),
      step(5, "Añadir agua y cocinar la salsa durante unos minutos."),
      step(6, "Incorporar las albóndigas y cocinar a fuego lento."),
    ],

    reviews: [
      review(aurora, "¡Las mejores albóndigas!", 4),
    ],
  },
  10
);

// Receta 4: privada.
// Solo los administradores pueden consultarla.

const merluza = recipe(
  {
    name: "Merluza en salsa verde",
    description: "Merluza cocinada con ajo, perejil y una salsa ligera.",
    origin: "Curso de cocina",
    url: "",
    category: pescados._id,
    difficulty: "medium",
    preparationTime: 10,
    cookingTime: 20,
    servings: 2,
    notes: "No cocinar demasiado el pescado para que quede jugoso.",
    visibility: "private",
    authorizedUsers: [],

    ingredients: [
      ingredient("Merluza", 400, "g", "fish_seafood"),
      ingredient("Ajo", 2, "unit", "fruit_vegetables"),
      ingredient("Perejil", 1, "pinch", "fruit_vegetables"),
      ingredient("Harina", 10, "g", "bakery"),
      ingredient("Caldo de pescado", 200, "ml", "canned_preserves"),
      ingredient("Aceite de oliva", 20, "ml", "oils_sauces"),
    ],

    steps: [
      step(1, "Picar el ajo y el perejil."),
      step(2, "Dorar el ajo en una cazuela con aceite."),
      step(3, "Añadir la harina y remover."),
      step(4, "Incorporar el caldo y el perejil."),
      step(5, "Añadir la merluza y cocinar hasta que esté hecha."),
    ],

    reviews: [],
  },
  8
);

// Receta 5: pública.

const espaguetis = recipe(
  {
    name: "Espaguetis a la carbonara",
    description: "Pasta con huevo, queso y panceta.",
    origin: "Internet",
    url: "https://www.ejemplo.com/carbonara",
    category: pasta._id,
    difficulty: "easy",
    preparationTime: 10,
    cookingTime: 15,
    servings: 2,
    notes: "Esta versión utiliza huevo y queso, sin nata.",
    visibility: "friends",
    authorizedUsers: [
      authorizedUser(ander),
    ],

    ingredients: [
      ingredient("Espaguetis", 200, "g", "pasta_rice_legumes"),
      ingredient("Huevo", 2, "unit", "dairy_eggs"),
      ingredient("Queso parmesano", 50, "g", "dairy_eggs"),
      ingredient("Panceta", 100, "g", "meat"),
      ingredient("Pimienta", 1, "pinch", "spices_condiments"),
      ingredient("Sal", 1, "pinch", "spices_condiments"),
    ],

    steps: [
      step(1, "Cocer los espaguetis en agua con sal."),
      step(2, "Dorar la panceta en una sartén."),
      step(3, "Batir los huevos con el queso rallado."),
      step(4, "Mezclar la pasta escurrida con la panceta."),
      step(5, "Retirar del fuego y añadir la mezcla de huevo y queso."),
      step(6, "Remover hasta conseguir una salsa cremosa."),
    ],

    reviews: [],
  },
  6
);

// Receta 6: pública.

const tartaManzana = recipe(
  {
    name: "Tarta de manzana",
    description: "Tarta casera de manzana con una base crujiente.",
    origin: "Prima Cruci",
    url: "",
    category: postres._id,
    difficulty: "medium",
    preparationTime: 20,
    cookingTime: 40,
    servings: 8,
    notes: "Dejar enfriar antes de servir.",
    visibility: "friends",
    authorizedUsers: [
      authorizedUser(aurora),
    ],

    ingredients: [
      ingredient("Manzana", 3, "unit", "fruit_vegetables"),
      ingredient("Harina", 200, "g", "bakery"),
      ingredient("Azúcar", 120, "g", "other"),
      ingredient("Huevo", 2, "unit", "dairy_eggs"),
      ingredient("Leche", 200, "ml", "dairy_eggs"),
      ingredient("Mantequilla", 80, "g", "dairy_eggs"),
      ingredient("Levadura", 8, "g", "other"),
    ],

    steps: [
      step(1, "Precalentar el horno a 180 grados."),
      step(2, "Mezclar la harina, el azúcar y la levadura."),
      step(3, "Añadir los huevos, la leche y la mantequilla."),
      step(4, "Pelar y cortar las manzanas."),
      step(5, "Colocar la mezcla en un molde y repartir la manzana."),
      step(6, "Hornear durante unos 40 minutos."),
      step(7, "Dejar enfriar antes de desmoldar."),
    ],

    reviews: [
      review(aurora, "La hice el fin de semana y salió estupenda.", 1),
    ],
  },
  4
);

db.recipes.insertMany([
  tortillaPatatas,
  ensaladaPasta,
  albondigas,
  merluza,
  espaguetis,
  tartaManzana,
]);

// ─── Listas de la compra ─────────────────────────────────────────────────────

// Lista creada por un administrador.
//
// Se guardan las referencias a las recetas seleccionadas mediante objetos
// con su identificador y nombre.
//
// También se guardan los ingredientes y las cantidades calculadas.
// La lista es independiente de los cambios posteriores en las recetas.

const listaCompraRealizada = {
  _id: new ObjectId(),
  createdBy: {
    id: karla._id,
    username: karla.username,
  },
  name: "Compra para la tortilla de patatas",
  purchaseList: true,
  recipes: [
    {
      id: tortillaPatatas._id,
      name: tortillaPatatas.name,
    },
  ],
  items: [
    {
      name: "Patata",
      quantity: 600,
      unit: "g",
      section: "fruit_vegetables",
      observations: "",
      purchased: true,
    },
    {
      name: "Huevo",
      quantity: 6,
      unit: "unit",
      section: "dairy_eggs",
      observations: "",
      purchased: true,
    },
    {
      name: "Cebolla",
      quantity: 1,
      unit: "unit",
      section: "fruit_vegetables",
      observations: "Ingrediente opcional para la tortilla.",
      purchased: true,
    },
    {
      name: "Aceite de oliva",
      quantity: 200,
      unit: "ml",
      section: "oils_sauces",
      observations: "",
      purchased: true,
    },
    {
      name: "Sal",
      quantity: 1,
      unit: "pinch",
      section: "spices_condiments",
      observations: "",
      purchased: true,
    },
  ],
  createdAt: daysAgo(4),
  updatedAt: daysAgo(2),
  __v: 0,
};

const listaCompraPendiente = {
  _id: new ObjectId(),
  createdBy: {
    id: koldo._id,
    username: koldo.username,
  },
  name: "Compra para la ensalada de pasta",
  purchaseList: false,
  recipes: [
    {
      id: ensaladaPasta._id,
      name: ensaladaPasta.name,
    },
  ],
  items: [
    {
      name: "Macarrones",
      quantity: 160,
      unit: "g",
      section: "pasta_rice_legumes",
      observations: "",
      purchased: false,
    },
    {
      name: "Tomate cherry",
      quantity: 150,
      unit: "g",
      section: "fruit_vegetables",
      observations: "",
      purchased: false,
    },
    {
      name: "Atún en conserva",
      quantity: 1,
      unit: "unit",
      section: "canned_preserves",
      observations: "",
      purchased: false,
    },
    {
      name: "Huevo",
      quantity: 2,
      unit: "unit",
      section: "dairy_eggs",
      observations: "",
      purchased: false,
    },
    {
      name: "Aceite de oliva",
      quantity: 15,
      unit: "ml",
      section: "oils_sauces",
      observations: "",
      purchased: false,
    },
    {
      name: "Sal",
      quantity: 1,
      unit: "pinch",
      section: "spices_condiments",
      observations: "",
      purchased: false,
    },
  ],
  createdAt: daysAgo(1),
  updatedAt: daysAgo(1),
  __v: 0,
};

db.shoppingLists.insertMany([listaCompraRealizada, listaCompraPendiente]);

// ─── Índices ─────────────────────────────────────────────────────────────────

// Evitar usuarios duplicados.
db.users.createIndex({ email: 1 }, { unique: true });

// Evitar categorías duplicadas por nombre o slug.
db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ slug: 1 }, { unique: true });

// Facilitar búsquedas y filtros de recetas.
db.recipes.createIndex({ category: 1 });
db.recipes.createIndex({ visibility: 1 });
db.recipes.createIndex({ name: 1 });

// Facilitar la consulta de listas por administrador.
db.shoppingLists.createIndex({ "createdBy.id": 1 });

// ─── Resultado ───────────────────────────────────────────────────────────────

print("✅ Recipia: datos iniciales cargados correctamente.");
print("   - 5 usuarios (2 administradores y 3 usuarios)");
print("   - 6 categorías");
print("   - 6 recetas");
print("   - 2 listas de la compra (1 realizada y 1 pendiente)");
print("   - Contraseña de todos los usuarios: Secreta-1");
