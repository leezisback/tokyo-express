import { connectDB } from '../config/db.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'

await connectDB()

const categories = [
    { slug:'classic', name:'Классические роллы', position:1 },
    { slug:'baked',   name:'Запечённые роллы',   position:2 },
    { slug:'sushi',   name:'Суши',               position:3 },
    { slug:'sashimi', name:'Сашими',             position:4 },
    { slug:'wok',     name:'WOK-лапша',          position:5 },
    { slug:'soups',   name:'Супы',               position:6 },
    { slug:'salads',  name:'Салаты',             position:7 },
    { slug:'drinks',  name:'Напитки',            position:8 },
]

const products = [
    { name:'Запечённая филадельфия', slug:'zapech-phila', categorySlug:'baked', price:695, weight:245,
        composition:'рис, нори, сливочный сыр, лосось, соус для запекания', imageUrl:'/images/phila.jpg', popularity:10 },
    { name:'Запечённый Эби', slug:'zapech-ebi', categorySlug:'baked', price:510, weight:245,
        composition:'рис, нори, креветка, соус для запекания', imageUrl:'/images/ebi.jpg', popularity:7 },
    { name:'Запечённый Цезарь', slug:'zapech-cezar', categorySlug:'baked', price:455, weight:245,
        composition:'рис, нори, помидор, лист салата, соус цезарь, сырный соус, куриное филе', imageUrl:'/images/cezar.jpg', popularity:6 },
]

async function run(){
    await Category.deleteMany({})
    await Product.deleteMany({})
    await Category.insertMany(categories)
    await Product.insertMany(products)
    console.log('Seed done')
    process.exit(0)
}
run()
