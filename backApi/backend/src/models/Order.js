import mongoose from 'mongoose'
const OrderSchema = new mongoose.Schema({
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: Number
    }],
    total: Number,
    delivery: {
        type: { type: String, enum: ['delivery','pickup'], default: 'delivery' },
        address: {
            street: String, house: String, entrance: String, floor: String, apt: String, isPrivate: Boolean
        },
        phone: String,
        comment: String
    },
    status: { type: String, enum: ['new','accepted','cooking','courier','onway','done','cancelled'], default: 'new' }
}, { timestamps: true })
export default mongoose.model('Order', OrderSchema)
