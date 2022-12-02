export const changeArrToFlatten = (arr = []) => {
    return arr.reduce((prev, item) => {
        prev[item.id] = item;
        return prev
    }, {})
}

export const changeFlattenToArr = (obj = {}) => {
    return Object.keys(obj).map(item => obj[item])
}