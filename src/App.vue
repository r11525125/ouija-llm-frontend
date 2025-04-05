<template>
    <div class="app-container">
      <h1>碟仙 LLM 前端範例</h1>
      
      <!-- 使用者輸入區 -->
      <div class="input-section">
        <textarea
          v-model="userPrompt"
          placeholder="請輸入你的問題..."
          rows="3"
        ></textarea>
        <button @click="sendPrompt" :disabled="loading">送出提問</button>
      </div>
  
      <!-- 顯示 LLM 回覆（逐字產生後的最終內容） -->
      <div class="reply-section">
        <h2>回覆：</h2>
        <p>{{ displayedReply }}</p>
      </div>
  
      <!-- 碟仙盤容器 -->
      <div class="ouija-container">
        <!-- 畫出所有字母/符號 -->
        <div
          v-for="(pos, char) in charPositions"
          :key="char"
          class="char"
          :style="{
            left: pos.x + 'px',
            top: pos.y + 'px',
          }"
        >
          {{ char }}
        </div>
  
        <!-- 指標 (碟仙) -->
        <div
          class="pointer"
          :style="{
            transform: 'translate(' + pointerX + 'px,' + pointerY + 'px)',
          }"
        >
          <!-- 可以在此放一張小圖，或純文字標記 -->
          <div class="pointer-inner">🔮</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App',
    data() {
      return {
        // 使用者輸入的 prompt
        userPrompt: '',
        // 前端逐字顯示出來的回覆
        displayedReply: '',
        // 是否正在處理中（loading）
        loading: false,
  
        // 指標 (碟仙) 的即時座標
        pointerX: 0,
        pointerY: 0,
  
        // 文字盤上字符對應的座標
        charPositions: {},
      }
    },
    created() {
      // 預先計算每個字元在 "碟仙盤" 上的座標
      this.initCharPositions();
      // 初始指標放在盤面中央 (200, 200)
      this.pointerX = 200;
      this.pointerY = 200;
    },
    methods: {
      // 建立文字盤佈局（此處畫成圓形）
      initCharPositions() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.!? ';
        const centerX = 200;
        const centerY = 200;
        const radius = 150;
  
        const total = characters.length;
        for (let i = 0; i < total; i++) {
          const angle = (2 * Math.PI * i) / total;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          this.charPositions[characters[i]] = { x, y };
        }
      },
  
      // 送出 Prompt，並以「串流」方式逐行讀取後端回覆
      async sendPrompt() {
        if (!this.userPrompt.trim()) return;
  
        this.loading = true;
        this.displayedReply = '';
  
        try {
          // 發送 POST 請求給後端，後端會以「行為 JSON」形式回傳
          const response = await fetch('http://<REMOVED_IP>:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama3.3',
              prompt: this.userPrompt,
            }),
          });
  
          // 如果瀏覽器支援串流，res.body 會是一個 ReadableStream
          if (!response.body) {
            console.error('此瀏覽器不支援 fetch streaming');
            return;
          }
  
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = ''; // 暫存未完整的資料
  
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
  
            // 將抓到的 Uint8Array 轉成文字，加到 buffer
            buffer += decoder.decode(value, { stream: true });
  
            // 以換行符號分割，取得多行(或部分行)
            let lines = buffer.split('\n');
  
            // 最後一行可能是不完整的資料，先留下來繼續累積
            // 只處理前 (n-1) 行
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (!line) continue;
  
              // 解析 JSON
              let json;
              try {
                json = JSON.parse(line);
              } catch (e) {
                console.error('解析 JSON 出錯：', e, line);
                continue;
              }
  
              // 取得這一行的 response
              const chunk = json.response || '';
              // 每一行中的 "response" 可能包含多個字元
              // 一次把字逐個顯示
              for (const c of chunk) {
                // 將該字加入畫面上
                await this.processCharacter(c);
              }
  
              // 如果後端標示 done: true，表示整個回覆結束
              if (json.done) {
                // 可在此判斷 json.done_reason 作相應處理
                break;
              }
            }
  
            // 處理完 (n-1) 行後，buffer 留下最後一行(可能是 incomplete)
            buffer = lines[lines.length - 1];
          }
        } catch (err) {
          console.error('串流讀取時發生錯誤：', err);
        } finally {
          this.loading = false;
        }
      },
  
      // 處理單個字元：移動指標＆加到 displayedReply
      async processCharacter(c) {
        // 如果盤面上有對應字元，移動指標到該處；否則移到中心
        if (this.charPositions[c]) {
          await this.movePointerTo(c);
        } else {
          // 包含符號、換行、空白等盤上沒有的字，可自訂規則
          await this.movePointerToCenter();
        }
        // 將該字元追加到畫面上
        this.displayedReply += c;
  
        // 控制逐字速度，視需求調整
        // 不建議過大，免得速度太慢
        await this.sleep(100);
      },
  
      // 移動指標到指定字元
      async movePointerTo(char) {
        const { x, y } = this.charPositions[char];
        // 指標平滑移動（CSS transition 已設定 0.4s）
        this.pointerX = x - 10;
        this.pointerY = y - 10;
        // 稍等指標移動完
        await this.sleep(300);
      },
  
      // 移動指標到盤面中央
      async movePointerToCenter() {
        this.pointerX = 200 - 10;
        this.pointerY = 200 - 10;
        await this.sleep(300);
      },
  
      // 工具：睡眠指定毫秒
      sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },
    },
  }
  </script>
  
  <style scoped>
  /* 佈局與整體設定 */
  .app-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    text-align: center;
    font-family: sans-serif;
  }
  
  h1 {
    margin-bottom: 1rem;
    color: #3c2f2f;
  }
  
  .input-section {
    margin-bottom: 1rem;
  }
  
  textarea {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    box-sizing: border-box;
    resize: vertical;
  }
  
  button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    background: #6b5b95;
    color: #fff;
    border: none;
    border-radius: 4px;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* 回覆區塊 */
  .reply-section {
    margin: 1rem 0;
    background: #fff;
    padding: 1rem;
    min-height: 100px;
    border-radius: 5px;
    text-align: left;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .reply-section h2 {
    margin-top: 0;
    color: #6b5b95;
  }
  
  /* 碟仙盤容器 */
  .ouija-container {
    position: relative;
    width: 400px;
    height: 400px;
    margin: 2rem auto;
    border: 3px solid #3c2f2f;
    border-radius: 50%;
    background: radial-gradient(circle at center, #f9f9f9 10%, #e9e9e9 90%);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2), inset 0 0 15px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  /* 盤面上的字母/符號 */
  .char {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 1.1rem;
    font-weight: 700;
    color: #3c2f2f;
    user-select: none;
  }
  
  /* 碟仙指標 */
  .pointer {
    position: absolute;
    width: 40px;
    height: 40px;
    pointer-events: none;
    transition: transform 0.4s ease-in-out; /* 指標移動動畫 */
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .pointer-inner {
    font-size: 1.5rem;
    line-height: 40px;
    text-align: center;
    filter: drop-shadow(0 0 5px rgba(0,0,0,0.3));
  }
  </style>
  