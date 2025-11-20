const { Schema, model } = require("mongoose");

const promotionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        // Общий процент скидки, например -20% при сумме заказа от 2000
        discountPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        minOrderTotal: {
            type: Number,
            default: 0, // например 2000 для главного баннера
        },
        activeFrom: {
            type: Date,
            default: null,
        },
        activeTo: {
            type: Date,
            default: null,
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

const Promotion = model("Promotion", promotionSchema);

module.exports = Promotion;
