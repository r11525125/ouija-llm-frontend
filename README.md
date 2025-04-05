# ouija-llm-frontend
Below is a sample **README.md** you can use for the `r11525125-ouija-llm-frontend` project. It includes:

- Project Introduction  
- Installation & Development Guide  
- Build & Deployment Steps  
- Environment Variable Setup for Secure API Endpoint (avoid hardcoding IP in code)  

Feel free to modify any details or wording to match your workflow.

---

## README.md

```markdown
# r11525125-ouija-llm-frontend

靈境低語：Ouija LLM 前端  
透過 Vue 3 + Vite + Tesseract.js 打造的「碟仙」前端示範，支援串流讀取後端 LLM 回覆、可選的 Tesseract OCR 自動微調，以及純 CSS 製作的碟仙指標。

---

## 目錄結構

```
r11525125-ouija-llm-frontend/
├─ README.md              # 專案說明文件
├─ index.html             # 入口 HTML
├─ package.json           # npm 專案設定
├─ replace.txt            # BFG/Filter-Repo 用來替換敏感資訊的檔案(若已不需，可刪除)
├─ vite.config.js         # Vite 設定
├─ public/                # 可放置靜態檔案 (ex: 圖片)
└─ src/
   ├─ App.vue             # 主元件
   ├─ main.js             # Vue 進入點
   ├─ style.css           # 全域 CSS
   └─ assets/             # 其它靜態/圖檔
```

---

## 功能說明

- **Vue 3 + Vite 專案**  
  利用 Vite 的快速開發伺服器與 ES Module 打包機制，搭配 Vue 3 開發 SPA。  

- **弧形字母排布 & 碟仙指標**  
  - `initCharPositions()` & `placeArc()` 將字母/數字/符號分散在 Ouija 板上。  
  - CSS `.pointer` 製作「碟仙」造型，並以 `(pointerX, pointerY)` 控制位置。

- **串流讀取後端**  
  - `sendPrompt()` 使用 `fetch(..., {stream:true})` 方式逐行讀取 NDJSON，並在 `processCharacter()` 逐字驅動碟仙。  

- **自動微調 (Tesseract)**  
  - `autoAdjustPositions()` 會透過 Canvas 擷取局部圖塊並 OCR 辨識，嘗試微調每個字符的座標。  
  - 在多弧線/符號情況下，偵測效果可能有限。

---

## 安裝與開發

### 1. 安裝 Node & npm / yarn
- 建議使用 [Node.js LTS 版本 (16+)](https://nodejs.org/en/) 或更高。
- 若用 [nvm](https://github.com/nvm-sh/nvm) 管理更好。

### 2. 下載專案並安裝依賴
```bash
git clone <your-repo-url> r11525125-ouija-llm-frontend
cd r11525125-ouija-llm-frontend
npm install
```
(或 `yarn` 依喜好)

### 3. 啟動開發伺服器
```bash
npm run dev
```
- 瀏覽器打開 <http://localhost:5173> 即可看到前端介面。

---

## 環境變數設定 (推薦)

為避免將後端 IP/Domain 寫死在程式碼，可使用 **Vite 的環境變數**機制，讓前端在 build 或 dev 時自動注入 API URL：

1. 在專案根目錄建立 `.env` (建議列入 `.gitignore` 以免上傳)  
   ```bash
   VITE_API_BASE_URL="http://my-server-ip-or-domain:11434"
   ```
2. 在程式中改用：
   ```js
   const apiUrl = import.meta.env.VITE_API_BASE_URL + '/api/generate'
   ```
3. CI/CD 或本地開發時各自放不同 `.env.*`。  
4. **此專案已示範**在 `sendPrompt()` 中以 `import.meta.env.VITE_API_BASE_URL` 接上 `/api/generate`，確保 IP 不留在檔案內。

---

## 打包與部署

### 1. Build
```bash
npm run build
```
- 產生 `dist/` 資料夾，裡面是靜態檔案可供部署到任意靜態伺服器。

### 2. 預覽 (serve)
```bash
npm run serve
```
- 使用 Vite preview 在本機伺服器 <http://localhost:4173> 預覽打包後的結果。

### 3. 部署
- 部署 `dist/` 到各種雲服務 (如 Netlify, GitHub Pages, AWS S3, Vercel 等)。
- 後端 IP 須在執行 build 前透過 `.env` 方式設定或於網頁中以 Proxy 方式連線。

---

## 敏感資訊移除

如曾在 git commit 歷史中洩漏過 IP，可使用下列方式改寫歷史並覆蓋遠端：

- **BFG Repo-Cleaner** (建議)
  ```bash
  # 以 replace.txt 中 "140.112.27.83==<REMOVED_IP>" 規則替換
  java -jar bfg.jar --replace-text replace.txt
  # 然後 git push --force
  ```

- **git filter-repo**  
  ```bash
  git filter-repo --replace-text <(echo "140\.112\.27\.83==<REMOVED_IP>")
  git push --force
  ```
  
請注意，強制改寫 commit 會破壞原 hash，需確保所有開發者重新同步新歷史。

---

## 常見問題

1. **Tesseract OCR 效果不佳**  
   - 多弧線及裝飾度高的版面會干擾 OCR。  
   - 可調整字體大小、對比度、把背景改得更單純，或只在微調時使用專門生成之簡單 Canvas。

2. **串流 fetch 出現瀏覽器相容問題**  
   - 確認在較新版本瀏覽器 (Chrome/Edge/Firefox) 或 Node.js 18+。  
   - 不支援 IE。

3. **環境變數**  
   - Vite 只有帶 `VITE_` 前綴的變數會被注入 `import.meta.env`。  
   - 部署時需確保 `.env` 設置正確。

---

## 授權

此範例僅做教學示範，可自由使用、修改或再發布。  
若有疑問或建議，歡迎在 Issues 區回饋。

---

## 未來規劃

- 更多裝飾與互動 (e.g. 音效、訊息彈出)  
- 優化 Tesseract OCR，或改用其他方式微調座標  
- 支援多語言 UI  
- 改進對中文/日文等字體的排布  
- 提供檔案型設定 (JSON) 供自訂弧線佈局  

---

**作者:**  
- [Your Name or ID]  
- [Your Contact / GitHub Profile]

若想對本專案貢獻，歡迎發送 Pull Request 或提出 Issue。 感謝您的使用與參與！
```

---

### 說明

- **Project introduction**: 描述該「Ouija LLM」的目的與特色  
- **Installation / Dev**: `npm install`、`npm run dev`  
- **Build/Serve**: `npm run build` & `npm run serve`  
- **Environment Variables**: 說明如何透過 `import.meta.env.VITE_API_BASE_URL` 讀取後端地址  
- **Rewrite History** (BFG / filter-repo) 提醒  
- **License / Future Plans**: 視需求增加

請依照您的實際情況編輯與更新以上內容，讓其他使用者或開發者能順利上手此專案。祝開發順利！