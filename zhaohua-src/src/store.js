import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { APP } from './config'

const SESSION_KEY = 'zhaohua-session-v1'
const savedSession = sessionStorage.getItem(SESSION_KEY) || ''

export const useStore = create(
  persist(
    (set) => ({
      // ── 后端连接 ──
      baseUrl: 'https://memory.ravenlove.cc',
      // 短期会话只留在当前浏览器会话，不持久化到 localStorage。
      apiToken: savedSession,
      fetchLimit: 100,
      setConn: (p) => set(p),
      setSessionToken: (token) => {
        if (token) sessionStorage.setItem(SESSION_KEY, token)
        else sessionStorage.removeItem(SESSION_KEY)
        set({ apiToken: token || '' })
      },

      // ── 主题 ──
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      // ── 当前面板 ──
      panel: 'memory',
      setPanel: (panel) => set({ panel }),

      // ── 记忆视图（年轮列表 / 记忆星图）──
      memoryView: 'list',
      setMemoryView: (memoryView) => set({ memoryView }),
    }),
    {
      name: APP.storeKey,
      version: 2,
      migrate: (persisted) => {
        const { apiToken: _oldToken, passwordHash: _oldHash, ...safe } = persisted || {}
        return { ...safe, apiToken: savedSession }
      },
      partialize: (s) => ({
        baseUrl: s.baseUrl,
        fetchLimit: s.fetchLimit,
        theme: s.theme,
        memoryView: s.memoryView,
      }),
    }
  )
)
