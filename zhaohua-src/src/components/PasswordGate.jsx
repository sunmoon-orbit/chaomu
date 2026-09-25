import { useState } from 'react'
import { useStore } from '../store'
import { isDevicePaired, loginZhaohua } from '../api'
import { APP } from '../config'

// 昭华密码门：图标和输入区从晨光开屏中浮现。
export default function PasswordGate({ onUnlock }) {
  const setSessionToken = useStore((s) => s.setSessionToken)

  const [pw,  setPw]  = useState('')
  const [err, setErr] = useState('')
  const [out, setOut] = useState(false) // 解锁淡出中

  function pass() {
    setOut(true)
    setTimeout(onUnlock, 420)
  }

  async function submit() {
    if (out) return
    try {
      const token = await loginZhaohua(pw)
      setSessionToken(token)
      pass()
    } catch (error) {
      setErr(error.message || '密码不对'); setPw('')
    }
  }

  return (
    <div className={'gate-minimal gate-ink' + (out ? ' gate-out' : '')}>
      <img className="gate-app-icon" src={import.meta.env.BASE_URL + 'icon.svg'} alt="" />

      {/* 标题 */}
      <div className="gate-brand">
        <h1 className="gate-title-cn">{APP.name}</h1>
        <p className="gate-brand-sub">Zhaohua · luminous memory</p>
      </div>

      {/* 输入区 */}
      <div className="gate-inputs">
        {!isDevicePaired() && new URLSearchParams(window.location.hash.slice(1)).get('pair') && (
          <p className="gate-pair-text">首次进入：输入密码即可配对这台设备</p>
        )}
        {err && <p className="gate-err-text gate-err-shake" key={err}>{err}</p>}
        <div className="ink-field">
          <input
            className="ink-input" type="password"
            value={pw} autoFocus
            placeholder="昭华访问密码"
            onChange={(e) => { setPw(e.target.value); setErr('') }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>
        <button className={'gate-enter' + (pw ? ' show' : '')} onClick={submit} tabIndex={pw ? 0 : -1}>进入</button>
      </div>
    </div>
  )
}
