import { Schema, model } from "mongoose";
import { INGREDIENT_SECTIONS } from "../config/constants.js";

// ─── Ingredientes
//unit: tbsp: cucharada sopera, tsp: cucharadita, pinch: pizca
const ingredientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del ingrediente es obligatorio"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [Number.MIN_VALUE, "La cantidad debe ser mayor que cero"],
    },
    unit: {
      type: String,
      required: [true, "La unidad de medida es obligatoria"],
      enum: {
        values: ["g", "kg", "ml", "l", "unit", "tbsp", "tsp", "pinch"],
        message: "La unidad de medida no es válida",
      },
    },
    section: {
        type: String,
        enum: INGREDIENT_SECTIONS,
        default: "other",
        },
    observations: {
      type: String,
      trim: true,
      default: "",
    },
    optional: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

// ─── Pasos de elaboración
const stepSchema = new Schema(
  {
    order: {
      type: Number,
      required: [true, "El orden del paso es obligatorio"],
      min: [1, "El orden debe ser como mínimo 1"],
    },
    description: {
      type: String,
      required: [true, "La descripción del paso es obligatoria"],
      trim: true,
    },
  },
  { _id: false }
);

// ─── Usuarios autorizados
const authorizedUserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
    id: false,
  }
);

// ─── Reseñas 
const reviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: [true, "El texto de la reseña es obligatorio"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ─── Receta 
const recipeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la receta es obligatorio"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    origin: {
      type: String,
      trim: true,
      default: "",
    },
    url: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) => {
          if (!value) return true;

          try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
        message: "La URL de origen no es válida",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es obligatoria"],
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "La dificultad debe ser easy, medium o hard",
      },
      required: [true, "La dificultad es obligatoria"],
    },
    preparationTime: {
      type: Number,
      required: [true, "El tiempo de preparación es obligatorio"],
      min: [0, "El tiempo no puede ser negativo"],
    },
    cookingTime: {
      type: Number,
      required: [true, "El tiempo de cocción es obligatorio"],
      min: [0, "El tiempo no puede ser negativo"],
    },
    servings: {
      type: Number,
      required: [true, "El número de comensales es obligatorio"],
      min: [1, "Debe haber al menos un comensal"],
      default: 4,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    visibility: {
      type: String,
      enum: {
        values: ["public", "friends", "private"],
        message: "La visibilidad debe ser public, friends o private",
      },
      required: [true, "La visibilidad es obligatoria"],
      default: "private",
    },
    authorizedUsers: {
      type: [authorizedUserSchema],
      default: [],
    },
    ingredients: {
      type: [ingredientSchema],
      required: true,
      validate: {
        validator: (ingredients) => ingredients.length > 0,
        message: "La receta debe tener al menos un ingrediente",
      },
    },
    steps: {
      type: [stepSchema],
      required: true,
      validate: {
        validator: (steps) => steps.length > 0,
        message: "La receta debe tener al menos un paso de elaboración",
      },
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Modelo 
export const RecipeModel = model("Recipe", recipeSchema);
