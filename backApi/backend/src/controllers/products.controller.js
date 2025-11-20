import Product from '../models/Product.js'

export async function listProducts(req, res, next) {
    try {
        const { cat, q, sort='popular', page=1, limit=12 } = req.query
        const filter = { isActive: true }
        if (cat) filter.categorySlug = cat
        if (q) filter.name = { $regex: q, $options: 'i' }

        const sortMap = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            popular: { popularity: -1, createdAt: -1 },
            new: { createdAt: -1 }
        }
        const skip = (Number(page)-1) * Number(limit)
        const [items, count] = await Promise.all([
            Product.find(filter).sort(sortMap[sort] || sortMap.popular).skip(skip).limit(Number(limit)),
            Product.countDocuments(filter)
        ])
        res.json({ items, count })
    } catch (e) { next(e) }
}

export async function getProduct(req,res,next){
    try {
        const item = await Product.findById(req.params.id)
        if (!item) return res.status(404).json({ message:'Not found' })
        res.json(item)
    } catch (e) { next(e) }
}
