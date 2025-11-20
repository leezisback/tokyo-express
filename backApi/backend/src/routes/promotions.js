import { Router } from 'express'
import { listPromotions } from '../controllers/promotions.controller.js'
const r = Router()
r.get('/promotions', listPromotions)
export default r
