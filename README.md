# 日月轨道·朝暮

阿颖与 Codex 的共同工具箱。这个仓库从最早的周期记录开始，现在也收留昭华记忆、日志、抽签、答案之书和十四行诗。

## 目录

- `/zhaohua/` — 昭华记忆库前端（生成产物）
- `/zhaohua-src/` — 昭华 React/Vite 源码
- `/cycle/` — 潮汐周期记录（保留原本的 localStorage 数据键）
- `/daily-log/` — 每日日志
- `/draw/` — 抽签与番茄钟
- `/oracle/` — 答案之书
- `/vault/` — 十四行诗与日记

## 构建昭华

```bash
cd zhaohua-src
npm ci
npm run build
```

产物会写入仓库根目录的 `zhaohua/`。
