import { useCallback, useState, useEffect } from 'react'
import {
    defaultInterval,
    defaultDifficulty,
    Delta,
    Difficulty,
    Direction,
    DirectionKeyCodeMap,
    GameStatus,
    OppositeDirection,
    initialPosition,
    initialValues
} from '../constants'
import {
    initFields,
    isCollision,
    isEatingMyself,
    getFoodPosition
} from '../utils'

let timer = null

const unsubscribe = () => {
    if (!timer) {//timerに値が入ってるときにtrue,入ってないときにfalseとなる
        return
    }
    clearInterval(timer)
}

const useSnakeGame = () => {
    const [fields, setFields] = useState(initialValues)//初期の二次元配列の任意のところだけ更新されていく
    const [body, setBody] = useState([])
    const [status, setStatus] = useState(GameStatus.init)//gameの状態
    const [direction, setDirection] = useState(Direction.up)
    const [difficulty, setDifficulty] = useState(defaultDifficulty)
    const [tick, setTick] = useState(0)
    
    useEffect(() => {//レンダリング後に実行される関数(初回も)
        setBody([initialPosition])//初回、毎回のレンダリング後、蛇の位置が真ん中になる
        const interval = Difficulty[difficulty - 1]
        timer = setInterval(() => {
            setTick((tick) => tick + 1)
        }, interval)
        return unsubscribe
    }, [difficulty])
    
    useEffect(() => {//レンダリング後に実行される関数(初回も)
        if (!body.length === 0 || status !== GameStatus.playing) {
            return
        }
        const canContinue = handleMoving()
        if (!canContinue) {
            unsubscribe()
            setStatus(GameStatus.gameover)
        }
    }, [tick])//timerで100msごとに[tick]の値が一つ増えて、その都度useEffectが動く
    const start = () => setStatus(GameStatus.playing)
    
    const stop = () => setStatus(GameStatus.suspended)
    
    const reload = () => {
        timer = setInterval(() => {
            setTick(tick => tick + 1)
        }, defaultInterval)
        setDirection(Direction.up)//最初に上に行くようにするやつ
        setStatus(GameStatus.init)
        setBody([initialPosition])
        setFields(initFields(35, initialPosition))//fieldsの初期化
    }
    
    const updateDirection = useCallback((newDirection) => {//わからん,manipulationpanelも
        if (status !== GameStatus.playing) {
            return
        }
        if (OppositeDirection[direction] === newDirection) {
            return
        }
        setDirection(newDirection)
    }, [direction, status])
    
    const updateDifficulty = useCallback((difficulty) => {
        if (status !== GameStatus.init) {
            return
        }
        if (difficulty < 1 || difficulty > difficulty.length) {
            return
        }
        setDifficulty(difficulty)
    }, [status, difficulty])
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            const newDirection = DirectionKeyCodeMap[e.keyCode]//keyCodeは実際にキーボードから入力された番号
            if (!newDirection) {
                return
            }
            updateDirection(newDirection)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [updateDirection])
    
    const handleMoving = () => {
        const { x, y } = body[0]
        const delta = Delta[direction]
        const newPosition = {
            x: x + delta.x,
            y: y + delta.y
        }
        if (isCollision(fields.length, newPosition) || isEatingMyself(fields, newPosition)) {
            return false
        }
        const newBody = [...body]
        if (fields[newPosition.y][newPosition.x] !== 'food') {
            const removingTrack = newBody.pop()//pop: 末尾の配列を抜き出して削除
            fields[removingTrack.y][removingTrack.x] = ''
        } else {//foodだった時
            const food = getFoodPosition(fields.length, [...newBody, newPosition])
            fields[food.y][food.x] = 'food'
        }
        fields[newPosition.y][newPosition.x] = 'snake'
        newBody.unshift(newPosition)//unshift: 配列の先頭に要素を追加
        setBody(newBody)
        setFields(fields)
        return true
    }

    return {
        body,
        difficulty,
        fields,
        start,
        stop,
        reload,
        status,
        updateDirection,
        updateDifficulty
    }
}


export default useSnakeGame