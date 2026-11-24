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
// Todos los usuarios tienen la contraseña "supersecreta".
// Guardamos directamente su hash bcrypt (coste 10).

const PASSWORD_HASH =
  "$2b$10$ji280zdAqkxuv5tjkCmq0uKZ3Xp.eAUOGKoB7kCJ3IGtvsh434HZK";

const now = new Date();

const daysAgo = (days) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

// ─── Usuarios ────────────────────────────────────────────────────────────────

const admin = {
  _id: new ObjectId(),
  username: "admin",
  email: "admin@recipia.dev",
  role: "admin",
};

const ana = {
  _id: new ObjectId(),
  username: "ana",
  email: "ana@ejemplo.com",
  role: "user",
};

const bea = {
  _id: new ObjectId(),
  username: "bea",
  email: "bea@ejemplo.com",
  role: "user",
};

const carlos = {
  _id: new ObjectId(),
  username: "carlos",
  email: "carlos@ejemplo.com",
  role: "user",
};

db.users.insertMany(
  [admin, ana, bea, carlos].map((user) => ({
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
  description: "Platos para comenzar una comida.",
  illustration: "entrantes",
  isActive: true,
};

const ensaladas = {
  _id: new ObjectId(),
  name: "Ensaladas",
  description: "Ensaladas y platos frescos.",
  illustration: "ensaladas",
  isActive: true,
};

const carnes = {
  _id: new ObjectId(),
  name: "Carnes",
  description: "Recetas elaboradas con carne.",
  illustration: "carnes",
  isActive: true,
};

const pescados = {
  _id: new ObjectId(),
  name: "Pescados",
  description: "Platos de pescado y marisco.",
  illustration: "pescados",
  isActive: true,
};

const pasta = {
  _id: new ObjectId(),
  name: "Pasta",
  description: "Recetas de pasta.",
  illustration: "pasta",
  isActive: true,
};

const postres = {
  _id: new ObjectId(),
  name: "Postres",
  description: "Dulces y postres caseros.",
  illustration: "postres",
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

// Reseña embebida.
// Solo guardamos userId, text y createdAt.
const review = (user, text, days = 1) => ({
  userId: user._id,
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
    category: entrantes._id,
    difficulty: "medium",
    preparationTime: 15,
    cookingTime: 25,
    servings: 4,
    notes: "Se puede preparar con o sin cebolla.",
    visibility: "public",
    authorizedUsers: [],

    ingredients: [
      ingredient("Patata", 600, "g", "Frutas y verduras"),
      ingredient("Huevo", 6, "unit", "Huevos y lácteos"),
      ingredient("Cebolla", 1, "unit", "Frutas y verduras", true),
      ingredient("Aceite de oliva", 200, "ml", "Aceites"),
      ingredient("Sal", 1, "pinch", "Especias"),
    ],

    steps: [
      step(1, "Pelar las patatas y cortarlas en rodajas finas."),
      step(2, "Cortar la cebolla en trozos pequeños."),
      step(3, "Freír las patatas y la cebolla a fuego medio hasta que estén tiernas."),
      step(4, "Batir los huevos y añadir las patatas escurridas."),
      step(5, "Cuajar la tortilla por ambos lados al gusto."),
    ],

    reviews: [
      review(ana, "La receta de toda la vida. ¡Queda buenísima!", 5),
      review(bea, "Yo le añado un poquito más de cebolla.", 3),
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
      ingredient("Macarrones", 160, "g", "Pasta y arroz"),
      ingredient("Tomate cherry", 150, "g", "Frutas y verduras"),
      ingredient("Atún en conserva", 1, "unit", "Conservas"),
      ingredient("Huevo", 2, "unit", "Huevos y lácteos"),
      ingredient("Aceite de oliva", 15, "ml", "Aceites"),
      ingredient("Sal", 1, "pinch", "Especias"),
    ],

    steps: [
      step(1, "Cocer la pasta siguiendo las indicaciones del fabricante."),
      step(2, "Cocer los huevos y dejarlos enfriar."),
      step(3, "Cortar los tomates cherry por la mitad."),
      step(4, "Mezclar la pasta con el tomate y el atún."),
      step(5, "Añadir el huevo troceado y aliñar."),
    ],

    reviews: [
      review(carlos, "Muy fácil y rápida para el verano.", 2),
    ],
  },
  12
);

// Receta 3: compartida con usuarios autorizados.
// Solo Ana y Bea pueden consultarla, además del administrador.

const albondigas = recipe(
  {
    name: "Albóndigas en salsa",
    description: "Albóndigas caseras con una salsa de verduras.",
    origin: "Mi madre",
    category: carnes._id,
    difficulty: "medium",
    preparationTime: 25,
    cookingTime: 40,
    servings: 4,
    notes: "Están todavía más ricas de un día para otro.",
    visibility: "friends",
    authorizedUsers: [ana._id, bea._id],

    ingredients: [
      ingredient("Carne picada de ternera", 500, "g", "Carnicería"),
      ingredient("Huevo", 1, "unit", "Huevos y lácteos"),
      ingredient("Pan rallado", 40, "g", "Panadería"),
      ingredient("Cebolla", 2, "unit", "Frutas y verduras"),
      ingredient("Zanahoria", 2, "unit", "Frutas y verduras"),
      ingredient("Ajo", 2, "unit", "Frutas y verduras"),
      ingredient("Harina", 30, "g", "Harinas"),
      ingredient("Aceite de oliva", 50, "ml", "Aceites"),
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
      review(ana, "¡Las mejores albóndigas!", 4),
    ],
  },
  10
);

// Receta 4: privada.
// Solo el administrador puede consultarla.

const merluza = recipe(
  {
    name: "Merluza en salsa verde",
    description: "Merluza cocinada con ajo, perejil y una salsa ligera.",
    origin: "Curso de cocina",
    category: pescados._id,
    difficulty: "medium",
    preparationTime: 10,
    cookingTime: 20,
    servings: 2,
    notes: "No cocinar demasiado el pescado para que quede jugoso.",
    visibility: "private",
    authorizedUsers: [],

    ingredients: [
      ingredient("Merluza", 400, "g", "Pescadería"),
      ingredient("Ajo", 2, "unit", "Frutas y verduras"),
      ingredient("Perejil", 1, "pinch", "Frutas y verduras"),
      ingredient("Harina", 10, "g", "Harinas"),
      ingredient("Caldo de pescado", 200, "ml", "Conservas"),
      ingredient("Aceite de oliva", 20, "ml", "Aceites"),
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
    visibility: "public",
    authorizedUsers: [],

    ingredients: [
      ingredient("Espaguetis", 200, "g", "Pasta y arroz"),
      ingredient("Huevo", 2, "unit", "Huevos y lácteos"),
      ingredient("Queso parmesano", 50, "g", "Huevos y lácteos"),
      ingredient("Panceta", 100, "g", "Carnicería"),
      ingredient("Pimienta", 1, "pinch", "Especias"),
      ingredient("Sal", 1, "pinch", "Especias"),
    ],

    steps: [
      step(1, "Cocer los espaguetis en agua con sal."),
      step(2, "Dorar la panceta en una sartén."),
      step(3, "Batir los huevos con el queso rallado."),
      step(4, "Mezclar la pasta escurrida con la panceta."),
      step(5, "Retirar del fuego y añadir la mezcla de huevo y queso."),
      step(6, "Remover hasta conseguir una salsa cremosa."),
    ],

    reviews: [
      review(bea, "Muy buena, aunque hay que tener cuidado con el huevo.", 2),
      review(carlos, "Una de mis recetas favoritas.", 1),
    ],
  },
  6
);

// Receta 6: pública.

const tartaManzana = recipe(
  {
    name: "Tarta de manzana",
    description: "Tarta casera de manzana con una base crujiente.",
    origin: "Prima Cruci",
    category: postres._id,
    difficulty: "medium",
    preparationTime: 20,
    cookingTime: 40,
    servings: 8,
    notes: "Dejar enfriar antes de servir.",
    visibility: "public",
    authorizedUsers: [],

    ingredients: [
      ingredient("Manzana", 3, "unit", "Frutas y verduras"),
      ingredient("Harina", 200, "g", "Harinas"),
      ingredient("Azúcar", 120, "g", "Despensa"),
      ingredient("Huevo", 2, "unit", "Huevos y lácteos"),
      ingredient("Leche", 200, "ml", "Huevos y lácteos"),
      ingredient("Mantequilla", 80, "g", "Huevos y lácteos"),
      ingredient("Levadura", 8, "g", "Despensa"),
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
      review(ana, "La hice el fin de semana y salió estupenda.", 1),
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

// Lista creada por el administrador.
// Se guardan las referencias a las recetas seleccionadas y los ingredientes
// calculados. La lista es independiente de los cambios posteriores en recetas.

const listaCompra = {
  _id: new ObjectId(),
  userId: admin._id,
  name: "Compra para el fin de semana",

  recipes: [
    tortillaPatatas._id,
    ensaladaPasta._id,
  ],

  items: [
    {
      name: "Patata",
      quantity: 600,
      unit: "g",
      section: "Frutas y verduras",
      observations: "",
      purchased: false,
    },
    {
      name: "Huevo",
      quantity: 8,
      unit: "unit",
      section: "Huevos y lácteos",
      observations: "",
      purchased: false,
    },
    {
      name: "Cebolla",
      quantity: 1,
      unit: "unit",
      section: "Frutas y verduras",
      observations: "Ingrediente opcional para la tortilla.",
      purchased: false,
    },
    {
      name: "Tomate cherry",
      quantity: 150,
      unit: "g",
      section: "Frutas y verduras",
      observations: "",
      purchased: false,
    },
    {
      name: "Macarrones",
      quantity: 160,
      unit: "g",
      section: "Pasta y arroz",
      observations: "",
      purchased: false,
    },
    {
      name: "Atún en conserva",
      quantity: 1,
      unit: "unit",
      section: "Conservas",
      observations: "",
      purchased: true,
    },
    {
      name: "Aceite de oliva",
      quantity: 215,
      unit: "ml",
      section: "Aceites",
      observations: "",
      purchased: false,
    },
    {
      name: "Sal",
      quantity: 2,
      unit: "pinch",
      section: "Especias",
      observations: "",
      purchased: false,
    },
  ],

  createdAt: daysAgo(2),
  updatedAt: daysAgo(1),
  __v: 0,
};

db.shoppingLists.insertOne(listaCompra);

// ─── Índices ─────────────────────────────────────────────────────────────────

// Evitar usuarios duplicados.
db.users.createIndex({ email: 1 }, { unique: true });

// Evitar categorías con el mismo nombre.
db.categories.createIndex({ name: 1 }, { unique: true });

// Facilitar búsquedas y filtros de recetas.
db.recipes.createIndex({ category: 1 });
db.recipes.createIndex({ visibility: 1 });
db.recipes.createIndex({ name: 1 });

// Facilitar la consulta de listas del administrador.
db.shoppingLists.createIndex({ userId: 1 });

print("✅ Recipia: datos iniciales cargados correctamente.");
print("   - 4 usuarios (1 administrador y 3 usuarios)");
print("   - 6 categorías");
print("   - 6 recetas");
print("   - 1 lista de la compra");
print("   - Contraseña de prueba: supersecreta");