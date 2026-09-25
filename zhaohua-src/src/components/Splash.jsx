import { useEffect, useState } from 'react'
import { APP } from '../config'

// 昭华开场：天将明，地平线展开，晨日升起；点击可跳过。
export default function Splash({ onLeave, onDone }) {
  const [leaving, setLeaving] = useState(false)
  const revealAt = 3800
  const doneAt = 4550

  useEffect(() => {
    const t1 = setTimeout(() => { setLeaving(true); onLeave() }, revealAt)
    const t2 = setTimeout(onDone, doneAt)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onLeave, onDone, revealAt, doneAt])

  const skip = () => {
    if (leaving) return
    setLeaving(true)
    onLeave()
    setTimeout(onDone, 900)
  }

  return (
    <div className={'zhaohua-dawn' + (leaving ? ' leaving' : '')} onClick={skip}>
      <div className="dawn-sky" aria-hidden="true">
        <span className="dawn-haze dawn-haze-far" />
        <span className="dawn-haze dawn-haze-near" />
        <span className="dawn-sun" />
        <span className="dawn-horizon" />
      </div>
      <div className="dawn-wordmark">
        <div className="dawn-title">{APP.name}</div>
        <div className="dawn-rule" aria-hidden="true" />
        <div className="dawn-sub">{APP.english}</div>
      </div>
    </div>
  )
}
