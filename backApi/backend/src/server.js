import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'

import authRoutes from './routes/auth.js'
import catalogRoutes from './routes/catalog.js'
import promotionRoutes from './routes/promotions.js'
import orderRoutes from './routes/orders.js'
import uploadRoutes from './routes/upload.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// статика для картинок
app.use('/uploads', express.static(path.join(__dirname, '..', env.UPLOADS_DIR)))

app.use('/api/auth', authRoutes)
app.use('/api', catalogRoutes)       // /categories, /products
app.use('/api', promotionRoutes)     // /promotions
app.use('/api', orderRoutes)         // /orders
app.use('/api/upload', uploadRoutes) // /image

app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

connectDB().then(() => {
    app.listen(env.PORT, () => console.log(`API on http://localhost:${env.PORT}`))
})
