const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
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
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null, // для подкатегорий типа "Классические роллы"
        },
        position: {
            type: Number,
            default: 0, // сортировка в меню
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

const Category = model("Category", categorySchema);

module.exports = Category;
