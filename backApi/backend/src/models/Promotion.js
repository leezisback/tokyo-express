import mongoose from 'mongoose'
const PromotionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    oldPrice: Number,
    newPrice: Number,
    bannerUrl: String,
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true }
}, { timestamps: true })
export default mongoose.model('Promotion', PromotionSchema)
