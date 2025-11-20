import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { env } from '../config/env.js'
import { postImage } from '../controllers/upload.controller.js'

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(process.cwd(), env.UPLOADS_DIR)),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const name = Date.now() + '-' + Math.round(Math.random()*1e9) + ext
        cb(null, name)
    }
})
const upload = multer({ storage })

const r = Router()
r.post('/image', upload.single('image'), postImage)

export default r
