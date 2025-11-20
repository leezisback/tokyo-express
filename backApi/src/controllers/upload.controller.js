import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function postImage(req,res){
    if (!req.file) return res.status(400).json({ message:'No file' })
    const url = `/uploads/${req.file.filename}`
    return res.status(201).json({ url })
}
