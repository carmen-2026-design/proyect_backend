import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    illustration: {
      type: String,
      required: [true, "La ilustración de la categoría es obligatoria"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = model("Category", categorySchema);
