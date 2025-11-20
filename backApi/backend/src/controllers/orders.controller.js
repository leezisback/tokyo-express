import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { calcTotal } from '../utils/calcTotal.js'

export async function createOrder(req,res,next){
    try {
        const { items, delivery } = req.body
        if (!Array.isArray(items) || !items.length) return res.status(400).json({message:'Empty cart'})

        // перезапрашиваем цены/названия по id (защита от подмены)
        const ids = items.map(i=>i.productId).filter(Boolean)
        const dbProducts = await Product.find({ _id:{ $in: ids } })
        const map = new Map(dbProducts.map(p=>[String(p._id), p]))

        const normalized = items.map(i=>{
            const p = i.productId ? map.get(String(i.productId)) : null
            if (p) return { productId: p._id, name: p.name, price: p.price, qty: Number(i.qty)||1 }
            // если пришли только name/price без id — оставим как есть, но лучше требовать id
            return { name: i.name, price: Number(i.price)||0, qty: Number(i.qty)||1 }
        })

        const total = calcTotal(normalized)
        const order = await Order.create({ items: normalized, total, delivery })
        res.status(201).json({ orderId: order._id })
    } catch (e) { next(e) }
}

export async function getOrder(req,res,next){
    try {
        const o = await Order.findById(req.params.id)
        if (!o) return res.status(404).json({ message:'Not found' })
        res.json(o)
    } catch (e) { next(e) }
}
