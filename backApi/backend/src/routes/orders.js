import { Router } from 'express'
import { createOrder, getOrder } from '../controllers/orders.controller.js'
const r = Router()

r.post('/orders', createOrder)
r.get('/orders/:id', getOrder)
// admin PATCH /orders/:id/status — добавим позже

export default r
