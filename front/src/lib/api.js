const Api = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export async function fetchCategories(){
    const r = await fetch(`${Api}/api/categories`)
    return r.json()
}

export async function fetchProducts(params={}){
    const q = new URLSearchParams(params).toString()
    const r = await fetch(`${Api}/api/products?${q}`)
    return r.json()
}

export async function createOrder(payload){
    const r = await fetch(`${Api}/api/orders`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
    })
    if (!r.ok) throw new Error('Order error')
    return r.json()
}
