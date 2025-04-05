以下是針對你的專案完整撰寫的 `README.md` 文件，涵蓋專案介紹、使用技術、安裝方法、執行步驟與其他實用資訊。

---

# 🕯️ Ouija LLM Frontend

> 一個結合「碟仙」概念與現代 AI (LLM) 串流 API 的互動式網頁，讓你透過神秘的「碟仙板」與靈界（LLM）進行文字對話。  
> 使用 Vue.js 3、Vite 與 Tesseract OCR。

---

## 🚩 專案簡介

「**靈境低語：Ouija LLM**」前端專案，整合 Vue.js 3 與串流式大型語言模型（LLM）API，實現類似碟仙(Ouija)的互動體驗。  
使用者輸入提問後，會逐字從 AI 模型取得回答，同時移動虛擬的「碟仙指針」至對應字元，打造獨特的互動體驗。

此外，本專案整合了 Tesseract OCR 功能，以便自動調整字元位置，確保準確性與視覺效果。

---

## 📦 專案結構

```
r11525125-ouija-llm-frontend/
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── App.vue
    ├── main.js
    ├── style.css
    └── assets/
```

- `index.html`: 主要的 HTML 頁面入口
- `App.vue`: 主要的 Vue 元件，包含 Ouija 介面及所有互動邏輯
- `main.js`: Vue App 啟動檔案
- `vite.config.js`: Vite 開發伺服器設定檔
- `package.json`: 專案所需套件定義檔

---

## 🛠️ 技術與工具

| 技術名稱                   | 用途與說明                     |
| ------------------------ | --------------------------- |
| [Vue.js 3](https://vuejs.org/) | 前端 UI 元件框架                |
| [Vite](https://vitejs.dev/) | 快速開發工具 (Dev Server & Build Tool) |
| [Tesseract.js](https://github.com/naptha/tesseract.js) | 客戶端 OCR 文字辨識工具            |

---

## 📥 安裝與執行專案

請依照以下步驟操作：

### ① 複製專案

```bash
git clone <your_repo_url>
cd r11525125-ouija-llm-frontend
```

### ② 安裝相關套件

```bash
npm install
```

### ③ 設定 API 路徑 (重要！)

本專案需連接外部 LLM API (如 Ollama 等串流 API)。

請在專案根目錄新增 `.env` 檔案：

```env
VITE_API_BASE_URL=http://<你的 API 伺服器位址>:11434
```

- 例如：

```
VITE_API_BASE_URL=http://localhost:11434
```

將會取代程式中的 `import.meta.env.VITE_API_BASE_URL`。

### ④ 啟動開發伺服器

```bash
npm run dev
```

預設網址：

- [http://localhost:5173](http://localhost:5173)

### ⑤ 編譯與部署 (可選)

如果需要部署到正式環境，執行：

```bash
npm run build
```

編譯後的靜態資源將存放於 `dist/` 資料夾，可透過任何靜態伺服器部署。

---

## 🎮 如何使用

1. 開啟網頁，輸入你想詢問靈界（AI）的問題。
2. 點擊「傳遞訊息」按鈕，將問題發送到 AI 模型。
3. 畫面將即時顯示 AI 的回覆，並模擬碟仙指針逐字移動。
4. 若要調整字元排列位置（例如視覺效果不理想），可點擊「校準符文」，利用 OCR 技術自動微調位置。

---

## 📌 專案特色

- 🕯️ 獨特的「碟仙」互動概念結合 LLM 串流回覆。
- 🎨 使用 CSS 精緻繪製的碟仙指針 (Planchette)。
- 📖 支援多種字元與特殊符號的辨識與顯示。
- 🔍 OCR 文字辨識自動調整字元位置，提高文字精準性。
- ⚡️ Vue 3 搭配 Vite 開發，開發體驗快速流暢。

---

## ⚠️ 注意事項

- 本專案僅為前端實作，需搭配後端 API 使用。
- 使用串流 API (如 Ollama、OpenAI API 等) 時，請確認 API 正常運作與 CORS 設定。

---

## 📝 聲明

本專案僅供教育、娛樂與技術示範用途，無任何宗教或靈異意涵。

---

## 📚 參考資料

- [Vue.js 3 官方文件](https://vuejs.org/)
- [Vite 官方文件](https://vitejs.dev/)
- [Tesseract.js 文件](https://github.com/naptha/tesseract.js/blob/master/docs/examples.md)

---

## 👨‍💻 作者

**Ouija LLM Frontend** 專案由 [你的名字或 GitHub 帳號](https://github.com/yourusername) 開發與維護。

若有疑問，歡迎透過 [Issues](https://github.com/yourusername/ouija-llm-frontend/issues) 與我聯絡。

---

🎉 **Ouija LLM Frontend** — 結合科技與神秘，與 AI 的靈性互動之旅，即刻展開！