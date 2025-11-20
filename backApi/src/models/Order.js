const { Schema, model } = require("mongoose");

const orderItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        qty: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const addressSchema = new Schema(
    {
        street: { type: String, default: "" },
        house: { type: String, default: "" },
        entrance: { type: String, default: "" },
        floor: { type: String, default: "" },
        apartment: { type: String, default: "" },
        isPrivateHouse: { type: Boolean, default: false },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        items: {
            type: [orderItemSchema],
            required: true,
            validate: v => Array.isArray(v) && v.length > 0,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        mode: {
            type: String,
            enum: ["delivery", "pickup"],
            required: true,
        },
        address: {
            type: addressSchema,
            default: () => ({}),
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        comment: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: [
                "new",
                "accepted",
                "cooking",
                "to_courier",
                "on_way",
                "done",
                "canceled",
            ],
            default: "new",
        },
        // На будущее: связь с пользователем (если будет авторизация клиентов)
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Order = model("Order", orderSchema);

module.exports = Order;
