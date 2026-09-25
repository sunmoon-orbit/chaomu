import { useStore } from './store'
import { APP } from './config'

const DEFAULT_BASE = 'https://memory.ravenlove.cc'
const DEVICE_KEY = 'zhaohua-device-v1'
function conn() {
  const s = useStore.getState()
  // 旧持久化里 baseUrl 可能是空（老版本遗留），空 baseUrl 会让 fetch 变成相对路径、
  // 在 GitHub Pages 上打到 sunmoon-orbit.github.io 返回 404 HTML。空或缺协议一律回退默认绝对地址。
  let b = (s.baseUrl || '').trim().replace(/\/$/, '')
  if (!b) b = DEFAULT_BASE
  else if (!/^https?:\/\//i.test(b)) b = 'https://' + b
  return { baseUrl: b, token: s.apiToken }
}

async function req(path, options = {}) {
  const { baseUrl, token } = conn()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(baseUrl + APP.apiPrefix + path, { ...options, headers })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    if (res.status === 401) {
      useStore.getState().setSessionToken('')
      window.dispatchEvent(new Event('zhaohua-auth-expired'))
    }
    throw new Error(`${res.status}: ${t.slice(0, 140)}`)
  }
  return res.status === 204 ? null : res.json()
}

export async function loginZhaohua(password) {
  const { baseUrl } = conn()
  const pairingToken = new URLSearchParams(window.location.hash.slice(1)).get('pair') || ''
  let deviceSecret = localStorage.getItem(DEVICE_KEY) || ''
  if (!deviceSecret && !pairingToken) throw new Error('这台设备还没有配对，请使用专属配对链接')
  const pairing = !deviceSecret && Boolean(pairingToken)
  if (pairing) {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    deviceSecret = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  const res = await fetch(baseUrl + (pairing ? '/zhaohua/pair' : '/zhaohua/session'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password, deviceSecret,
      ...(pairing ? { pairingToken, deviceName: navigator.userAgent.slice(0, 120) } : {}),
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.token) throw new Error(data.error || `登录失败 (${res.status})`)
  if (pairing) {
    localStorage.setItem(DEVICE_KEY, deviceSecret)
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
  return data.token
}

export function isDevicePaired() {
  return Boolean(localStorage.getItem(DEVICE_KEY))
}

export async function revokeThisDevice() {
  try { await req('/device', { method: 'DELETE' }) } finally {
    localStorage.removeItem(DEVICE_KEY)
    useStore.getState().setSessionToken('')
  }
}

function qs(params = {}) {
  const u = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) u.set(k, String(v)) })
  const s = u.toString()
  return s ? '?' + s : ''
}

export const api = {
  list: (params = {}) => req('/memories/filter' + qs(params)),
  heatmap: (params = {}) => req('/memories/heatmap' + qs(params)),
  trash: () => req('/memories/trash?limit=300'),
  create: (body) => req('/memories', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => req(`/memories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  moveToTrash: (id) => req(`/memories/${id}/trash`, { method: 'POST', body: '{}' }),
  restore: (id) => req(`/memories/${id}/restore`, { method: 'POST', body: '{}' }),
  related: (id, k = 5) => req(`/memories/${id}/related?k=${k}`),
  graph: () => req('/memories/graph'),
  get: (id) => req(`/memories/${id}`),
  semantic: (q, k = 20) => req(`/memories/semantic?q=${encodeURIComponent(q)}&k=${k}`),
  emotionHeatmap: (params = {}) => req('/memories/emotion-heatmap' + qs(params)),
  health: () => req('/health'),
  maintainHealth: () => req('/maintain/health'),
}
