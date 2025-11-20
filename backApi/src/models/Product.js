const { Schema, model } = require("mongoose");

const productSchema = new Schema(
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
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        composition: {
            type: String,
            default: "", // состав для модалки
            trim: true,
        },
        weight: {
            type: String, // например "250 г" или число + единица
            default: "",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String, // путь вида "/uploads/filename.jpg"
            default: "",
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isPromotion: {
            type: Boolean,
            default: false,
        },
        discountPercent: {
            type: Number,
            default: 0, // на случай индивидуальной скидки на товар
        },
        position: {
            type: Number,
            default: 0, // сортировка внутри категории
        },
    },
    {
        timestamps: true,
    }
);

const Product = model("Product", productSchema);

module.exports = Product;
