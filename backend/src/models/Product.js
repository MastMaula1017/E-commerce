import mongoose from "mongoose";
import slugify from "slugify";

// Basic product schema for ecommerce
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      index: true,
    },
    brand: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attributes: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Simple helper to generate a slug from name if not provided
productSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true, // remove special chars
      trim: true,
    });
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
