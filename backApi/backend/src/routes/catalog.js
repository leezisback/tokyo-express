import { Router } from 'express'
import { listCategories } from '../controllers/categories.controller.js'
import { listProducts, getProduct } from '../controllers/products.controller.js'
const r = Router()

r.get('/categories', listCategories)
r.get('/products', listProducts)
r.get('/products/:id', getProduct)

export default r
