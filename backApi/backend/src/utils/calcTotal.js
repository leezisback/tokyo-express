export function calcTotal(items=[]) {
    return items.reduce((s,i)=> s + (Number(i.price)||0)*(Number(i.qty)||0), 0)
}
