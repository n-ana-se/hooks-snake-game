import React, { useState, useEffect, useCallback  } from 'react'
import Navigation from './components/Navigation';
import Field from './components/Field';
import Button from './components/Button';
import ManipulationPanel from './components/ManipulationPanel';
import { initFields, getFoodPosition } from './utils'

const initialPosition = { x: 17, y: 17 }//蛇の位置
const initialValues = initFields(35, initialPosition)//二次元配列

const defaultInterval = 100
let timer = undefined

const defaultDifficulty = 3
const Difficulty = [1000, 500, 100, 50, 10]

const GameStatus = Object.freeze({
  init: 'init',
  playing: 'playing',
  suspended: 'suspended',
  gameover: 'gameover'
})

export const Direction = Object.freeze({
  up: 'up',
  right: 'right',
  left: 'left',
  down: 'down'
})

const DirectionKeyCodeMap = Object.freeze({
  37: Direction.left,
  38: Direction.up,
  39: Direction.right,
  40: Direction.down
})

const OppsiteDirection = Object.freeze({
  up: 'down',
  right: 'left',
  left: 'left',
  down: 'up'
})

const Delta = Object.freeze({
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 }
})

const unsubscribe = () => {
  if (!timer) {//timerに値が入ってるときにtrue,入ってないときにfalseとなる
    return
  }
  clearInterval(timer)
}

const isCollision = (fieldSize, position) => {
  //はみ出し
  if (position.y < 0 || position.x < 0) {
    return true
  }
  if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
    return true
  }
  //中
  return false
}

const isEatingMyself = (fields, position) => {
  return fields[position.y][position.x] === 'snake'
}

function App() {
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

  const onStart = () => setStatus(GameStatus.playing)

  const onStop = () => setStatus(GameStatus.suspended)
 
  const onRestart = () => {
    timer = setInterval(() => {
      setTick(tick => tick + 1)
    }, defaultInterval)
    setDirection(Direction.up)//最初に上に行くようにするやつ
    setStatus(GameStatus.init)
    setBody([initialPosition])
    setFields(initFields(35, initialPosition))//fieldsの初期化
  }

  const onChangeDirection = useCallback((newDirection) => {//わからん,manipulationpanelも
      if (status !== GameStatus.playing) {
        return 
      }
      if (OppsiteDirection[direction] === newDirection) {
        return
      }
      setDirection(newDirection)
  }, [direction, status])

  const onChangeDifficulty = useCallback((difficulty) => {
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
      onChangeDirection(newDirection)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onChangeDirection])

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

  return (
    <div className="App">
      <header className="header">
        <div className="title-container">
          <h1 className="title">Snake Game</h1>
        </div>
        <Navigation
          length={body.length}
          difficulty={difficulty}
          onChangeDifficulty={onChangeDifficulty}
        />
      </header>
      <main className="main">
        <Field fields={fields} />
      </main>
      <footer className="footerd">
        <Button
          status={status}
          onStart={onStart}
          onStop={onStop}
          onRestart={onRestart}
        />
        <ManipulationPanel onChange={onChangeDirection} />
      </footer>
    </div>
  );
}

export default App;
