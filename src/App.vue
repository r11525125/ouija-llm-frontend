<template>
    <!-- 新增 wrapper 來套用全域背景 -->
    <div class="app-wrapper">
      <div class="app-container">
        <h1>靈境低語：Ouija LLM</h1>
    
        <!-- 使用者輸入區 -->
        <div class="input-section">
          <!-- 更新提示文字 -->
          <textarea
            v-model="userPrompt"
            placeholder="低語你的疑問..."
            rows="3"
          ></textarea>
          <div class="button-group">
            <button @click="sendPrompt" :disabled="loading || adjusting" class="send-button">
              <span v-if="!loading">傳遞訊息</span>
              <span v-else>感應中...</span>
            </button>
            <!-- 自動微調 (Tesseract) -->
            <div class="auto-adjust">
              <button @click="autoAdjustPositions" :disabled="adjusting || loading" class="adjust-button">
                <span v-if="!adjusting">校準符文</span>
                <span v-else>校準中...</span>
              </button>
              <span v-if="adjusting" class="loading-adjust">⚙️</span>
            </div>
          </div>
        </div>
    
        <!-- 顯示 LLM 回覆 -->
        <div class="reply-section">
          <h2>靈界回響：</h2>
          <p>{{ displayedReply }}</p>
        </div>
    
        <!-- 「Ouija」板區域 -->
        <div class="ouija-container">
          <!-- 裝飾元素 -->
          <div class="decoration sun">☀️</div>
          <div class="decoration moon">🌙</div>
          <div class="decoration text-yes">YES</div>
          <div class="decoration text-no">NO</div>
          <div class="decoration text-goodbye">GOODBYE</div>
    
          <!-- 使用 arcs 排列出的字母/數字 -->
          <div
            v-for="(pos, char) in charPositions"
            :key="char"
            class="char"
            :style="{
              left: pos.x + 'px',
              top: pos.y + 'px'
            }"
          >
            {{ char }}
          </div>
    
          <!-- 碟仙指標 (CSS 繪製) -->
          <div
            class="pointer"
            :style="{
              transform: 'translate(' + pointerX + 'px,' + pointerY + 'px)'
            }"
          >
            <div class="pointer-body">
              <div class="pointer-lens"></div>
            </div>
          </div>
    
          <!-- 用於 Tesseract OCR 擷取 -->
          <canvas
            ref="canvasEl"
            width="800"
            height="530"
            style="display:none;"
          ></canvas>
        </div>
      </div>
    </div>
  </template>
    
  <script>
  import Tesseract from 'tesseract.js'
    
  export default {
    name: "App",
    data() {
      return {
        userPrompt: "",
        displayedReply: "",
        loading: false,
        adjusting: false,
        // 碟仙指標座標 (初始置中，減去指針大小的一半)
        pointerX: 400 - 30, // 指針寬度 60px
        pointerY: 265 - 40, // 指針高度 80px
        charPositions: {},
      };
    },
    async mounted() {
      this.initCharPositions();
      this.movePointerToCenter(); // 確保初始在中心
    
      // 示範：將部分文字繪到 canvas
      const canvas = this.$refs.canvasEl;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#333"; // 使用深色繪製
      ctx.font = "bold 28px 'Times New Roman', serif"; // 使用易於辨識的字體
    
      // 繪製所有需要辨識的字符到隱藏的 canvas 上，位置需對應 CSS 佈局
      ctx.fillText("ABCDEFGHIJKLMNOPQRSTUVWXYZ 123456789", 50, 50);
    },
    methods: {
      /**
       * 初始化字母/數字位置 (弧形排列)
       * 此處參數已做調整：
       *  - 上半弧 (A–M)：圓心 y 設為 boardHeight * 0.42，半徑 240，角度從 165° 到 15°
       *  - 下半弧 (N–Z)：圓心 y 設為 boardHeight * 0.48，半徑 240，角度從 195° 到 345°
       *  - 小弧 (數字 0–9)：圓心 y 設為 boardHeight * 0.72，半徑 180，角度從 150° 到 30°
       */
      initCharPositions() {
        const centerX = 400;
        const boardHeight = 530;
        // A–M (上半弧)
        this.placeArc("ABCDEFGHIJKLM", centerX, boardHeight * 0.42, 210, 180, 0);
        // N–Z (下半弧)
        this.placeArc("NOPQRSTUVWXYZ", centerX, boardHeight * 0.48, 220, 195, 345);
        // 數字 0–9 (下弧)
        this.placeArc("1234567890", centerX, boardHeight * 0.72, 180, 150, 30);
      },
    
      /**
       * 將字串沿弧線放置
       */
      placeArc(chars, cx, cy, radius, startDeg, endDeg) {
        const count = chars.length;
        const totalAngle = Math.abs(startDeg - endDeg);
        const angleStep = count > 1 ? totalAngle / (count - 1) : 0;
        const direction = startDeg > endDeg ? -1 : 1;
    
        for (let i = 0; i < count; i++) {
          const c = chars[i];
          const angleDeg = startDeg + direction * angleStep * i;
          const rad = (angleDeg * Math.PI) / 180;
          // 計算座標，確保文字中心對準
          const x = cx + radius * Math.cos(rad);
          const y = cy - radius * Math.sin(rad);
          this.charPositions[c] = { x, y };
        }
      },
    
      /**
       * 自動微調 (Tesseract)
       */
      async autoAdjustPositions() {
        this.adjusting = true;
        const canvas = this.$refs.canvasEl;
        const ctx = canvas.getContext("2d");
    
        // 重新繪製 Canvas 以匹配當前 charPositions
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 28px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    
        Object.entries(this.charPositions).forEach(([char, pos]) => {
          ctx.fillText(char, pos.x, pos.y);
        });
    
        const SEARCH_RADIUS = 8;
        const STEP = 2;
        const CHAR_WIDTH = 30;
        const CHAR_HEIGHT = 30;
    
        const charList = Object.keys(this.charPositions);
        console.log(`開始自動微調 ${charList.length} 個字符...`);
    
        for (let i = 0; i < charList.length; i++) {
          const ch = charList[i];
          const initialPos = this.charPositions[ch];
          if (!initialPos) continue;
    
          let bestScore = -Infinity;
          let bestDx = 0;
          let bestDy = 0;
    
          console.log(`微調字符: ${ch}, 初始位置: (${initialPos.x.toFixed(1)}, ${initialPos.y.toFixed(1)})`);
    
          await this.sleep(10);
    
          for (let dy = -SEARCH_RADIUS; dy <= SEARCH_RADIUS; dy += STEP) {
            for (let dx = -SEARCH_RADIUS; dx <= SEARCH_RADIUS; dx += STEP) {
              const captureX = initialPos.x + dx - CHAR_WIDTH / 2;
              const captureY = initialPos.y + dy - CHAR_HEIGHT / 2;
    
              if (captureX < 0 || captureY < 0 || captureX + CHAR_WIDTH > canvas.width || captureY + CHAR_HEIGHT > canvas.height) {
                continue;
              }
    
              try {
                const imgData = ctx.getImageData(captureX, captureY, CHAR_WIDTH, CHAR_HEIGHT);
                const result = await Tesseract.recognize(imgData, 'eng', {
                  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                });
    
                const recognizedText = (result.data.text || "").trim().toUpperCase();
                const confidence = result.data.confidence || 0;
    
                let currentScore = -Infinity;
                if (recognizedText === ch) {
                  currentScore = confidence;
                }
    
                if (currentScore > bestScore) {
                  bestScore = currentScore;
                  bestDx = dx;
                  bestDy = dy;
                }
              } catch (error) {
                console.error(`Tesseract 識別錯誤 for ${ch} at (${dx}, ${dy}):`, error);
              }
            }
          }
    
          if (bestScore > -Infinity) {
            this.charPositions[ch].x = initialPos.x + bestDx;
            this.charPositions[ch].y = initialPos.y + bestDy;
            console.log(`字符 ${ch} 更新位置到 (${this.charPositions[ch].x.toFixed(1)}, ${this.charPositions[ch].y.toFixed(1)}), 最佳信心: ${bestScore.toFixed(1)}`);
          } else {
            console.warn(`字符 ${ch} 未能成功微調，保持原位。`);
          }
        }
    
        this.adjusting = false;
        console.log("自動微調結束！");
        alert("自動微調結束！部分字符可能因識別困難未移動。");
      },
    
      /**
       * 送出 Prompt
       */
      async sendPrompt() {
        if (!this.userPrompt.trim() || this.loading || this.adjusting) return;
        this.loading = true;
        this.displayedReply = "";
    
        try {
          const apiUrl = "http://<REMOVED_IP>:11434/api/generate";
    
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llama3.3",
              prompt: this.userPrompt,
              stream: true
            }),
          });
    
          if (!res.ok) {
            const errorBody = await res.text();
            console.error(`API 請求失敗: ${res.status} ${res.statusText}`, errorBody);
            this.displayedReply = `錯誤：無法連接到靈界 (${res.status})。`;
            this.loading = false;
            return;
          }
    
          if (!res.body) {
            console.error("瀏覽器不支援 fetch streaming 或後端未返回串流");
            this.displayedReply = "錯誤：無法建立靈魂連結 (串流失敗)。";
            this.loading = false;
            return;
          }
    
          const reader = res.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";
    
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              console.log("串流結束");
              break;
            }
    
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
    
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (!line) continue;
    
              try {
                const json = JSON.parse(line);
                const chunk = json.response || "";
    
                for (const c of chunk) {
                  await this.processCharacter(c);
                }
    
                if (json.done) {
                  console.log("收到 done=true 的 chunk，理論上串流應結束");
                }
              } catch (err) {
                console.error("解析 JSON 行錯誤:", err, "問題行:", line);
              }
            }
    
            buffer = lines[lines.length - 1];
          }
    
          const lastLine = buffer.trim();
          if (lastLine) {
            try {
              const json = JSON.parse(lastLine);
              const chunk = json.response || "";
              for (const c of chunk) {
                await this.processCharacter(c);
              }
            } catch (err) {
              console.error("解析最後殘留行錯誤:", err, "問題行:", lastLine);
            }
          }
    
        } catch (err) {
          console.error("發送請求或讀取串流時發生錯誤:", err);
          this.displayedReply = "錯誤：與靈界的連結中斷。";
        } finally {
          this.loading = false;
          await this.movePointerToCenter();
          console.log("請求處理完畢");
        }
      },
    
      /**
       * 處理單個字符，移動指針
       */
      async processCharacter(c) {
        const upperC = c.toUpperCase();
        if (!upperC.trim() && upperC !== ' ') return;
    
        if (this.charPositions[upperC]) {
          await this.movePointerTo(upperC);
          this.displayedReply += c;
        } else if (upperC === ' ') {
          await this.sleep(150);
          this.displayedReply += c;
        } else {
          this.displayedReply += c;
          await this.sleep(50);
        }
        await this.sleep(100);
      },
    
      /**
       * 移動指針到指定字符位置
       */
      async movePointerTo(ch) {
        const pos = this.charPositions[ch];
        if (!pos) return;
        this.pointerX = pos.x - 30;
        this.pointerY = pos.y - 40;
        await this.sleep(250);
      },
    
      /**
       * 移動指針回中心
       */
      async movePointerToCenter() {
        const centerX = 400;
        const centerY = 265;
        this.pointerX = centerX - 30;
        this.pointerY = centerY - 40;
        await this.sleep(250);
      },
    
      /**
       * 延遲函數
       */
      sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },
    },
  };
  </script>
    
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Noto+Sans+TC:wght@300;400;700&display=swap');
    
  /* 全局 Wrapper 背景 */
  .app-wrapper {
    background: radial-gradient(ellipse at center, #4a3a4b 0%, #2c212d 100%);
    min-height: 100vh;
    padding: 2rem 1rem;
    box-sizing: border-box;
  }
    
  /* 整體容器 */
  .app-container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    font-family: 'Noto Sans TC', sans-serif;
    color: #e0e0e0;
  }
    
  h1 {
    font-family: 'Cinzel Decorative', cursive;
    color: #f0e6d2;
    font-size: 2.8rem;
    margin-bottom: 1.5rem;
    text-shadow: 0 0 5px rgba(240, 230, 210, 0.5), 0 0 10px rgba(240, 230, 210, 0.3);
  }
    
  h2 {
    font-family: 'Cinzel Decorative', cursive;
    color: #d1c4b0;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    text-align: left;
  }
    
  /* 輸入區 */
  .input-section {
    margin-bottom: 2rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
  }
    
  .input-section textarea {
    width: calc(100% - 2rem);
    padding: 0.8rem 1rem;
    margin-bottom: 1rem;
    border-radius: 6px;
    border: 1px solid #554a56;
    background-color: #3d313e;
    color: #e0e0e0;
    font-size: 1rem;
    font-family: 'Noto Sans TC', sans-serif;
    resize: vertical;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
    
  .input-section textarea:focus {
    outline: none;
    border-color: #a89cac;
    box-shadow: 0 0 5px rgba(168, 156, 172, 0.5), inset 0 1px 2px rgba(0,0,0,0.3);
  }
    
  .button-group {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
    
  .input-section button {
    padding: 0.7rem 1.5rem;
    border-radius: 20px;
    border: none;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    font-family: 'Noto Sans TC', sans-serif;
  }
    
  .input-section button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
    
  .send-button {
    background: linear-gradient(to bottom, #8a6d8a, #6b4f6b);
    color: #ffffff;
  }
    
  .send-button:hover:not(:disabled) {
    background: linear-gradient(to bottom, #9b7e9b, #7c607c);
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    transform: translateY(-1px);
  }
    
  .adjust-button {
    background: linear-gradient(to bottom, #6c7a89, #4a5763);
    color: #ffffff;
  }
    
  .adjust-button:hover:not(:disabled) {
    background: linear-gradient(to bottom, #7d8b9a, #5b6874);
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    transform: translateY(-1px);
  }
    
  .auto-adjust {
    display: flex;
    align-items: center;
  }
    
  .loading-adjust {
    margin-left: 0.5rem;
    font-size: 1.2rem;
    animation: spin 1.5s linear infinite;
  }
    
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
    
  /* 回覆區塊 */
  .reply-section {
    margin: 2rem 0;
    background: rgba(0, 0, 0, 0.25);
    padding: 1.5rem;
    min-height: 100px;
    border-radius: 8px;
    text-align: left;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    color: #d1c4b0;
    line-height: 1.6;
    font-size: 1.1rem;
  }
    
  .reply-section p {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
    
  /* Ouija 板 */
  .ouija-container {
    position: relative;
    width: 800px;
    height: 530px;
    margin: 2rem auto;
    background: radial-gradient(ellipse at top, #e0d6c3 0%, #c4b7a3 50%, #a99a88 100%);
    border: 8px solid #4d3f3a;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.3);
    overflow: hidden;
    font-family: 'Cinzel Decorative', cursive;
  }
    
  /* 板上裝飾元素 */
  .decoration {
    position: absolute;
    color: #4d3f3a;
    font-weight: bold;
    user-select: none;
  }
  .sun { top: 20px; left: 30px; font-size: 2.2rem; }
  .moon { top: 20px; right: 30px; font-size: 2.2rem; }
  .text-yes { top: 80px; left: 60px; font-size: 1.5rem; }
  .text-no { top: 80px; right: 60px; font-size: 1.5rem; }
  .text-goodbye { bottom: 20px; left: 50%; transform: translateX(-50%); font-size: 1.2rem; }
    
  /* 字母/數字 (char) */
  .char {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 1.2rem; /* 調整為較小尺寸 */
    font-weight: 700;
    color: #3b302b;
    user-select: none;
    padding: 2px; /* 減少內距 */
    text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.2);
  }
    
  /* 碟仙指標 (CSS Planchette) */
  .pointer {
    position: absolute;
    width: 60px;
    height: 80px;
    pointer-events: none;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    filter: drop-shadow(3px 5px 5px rgba(0,0,0,0.4));
  }
    
  .pointer-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center bottom, #b89f83 0%, #8b735b 100%);
    border-radius: 50% 50% 10px 10px / 60% 60% 10px 10px;
    position: relative;
    border: 2px solid #5c4a3e;
    box-shadow: inset 0 -5px 10px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.1);
  }
    
  .pointer-lens {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 24px;
    background: radial-gradient(ellipse at center, rgba(230,220,200,0.1) 0%, rgba(50,40,30,0.6) 100%);
    border-radius: 50%;
    border: 2px solid #5c4a3e;
    box-shadow: 0 0 5px rgba(0,0,0,0.3), inset 0 0 5px rgba(0,0,0,0.4);
  }
  </style>
  