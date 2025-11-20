import Promotion from '../models/Promotion.js'
export async function listPromotions(req,res,next){
    try {
        const now = new Date()
        const items = await Promotion.find({
            isActive:true,
            $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
        }).find({
            $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
        }).sort({ createdAt:-1 })
        res.json(items)
    } catch (e) { next(e) }
}
