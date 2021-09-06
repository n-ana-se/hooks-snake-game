export const getFoodPosition = (fieldSize, excludes) => {
    while(true) {
        const x = Math.floor(Math.random() * (fieldSize - 2)) + 1
        const y = Math.floor(Math.random() * (fieldSize - 2)) + 1
        const conflict = excludes.some(item => item.x === x && item.y === y)//[snake]の中の一つとでもかぶればtrueが返り、random関数が走る
        if (!conflict) {
            return { x, y }
        }
    }
}

export const initFields = (fieldSize, snake) => {
    const fields = []
    for (let i = 0; i < fieldSize; i++) {
        const cols = new Array(fieldSize).fill('')
        fields.push(cols)
    }

    fields[snake.y][snake.x] = 'snake'

    const food = getFoodPosition(fieldSize, [snake])
    fields[food.y][food.x] = 'food'

    return fields
}