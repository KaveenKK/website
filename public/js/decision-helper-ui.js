import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3.1.2/+esm';

export class DecisionHelperUI extends LitElement {
  static properties = {
    messages: { type: Array },
    loading: { type: Boolean },
    warning: { type: String },
    useWebSearch: { type: Boolean },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      background: #fff;
      border-radius: 0px;
      box-shadow: 0 4px 24px rgba(90,90,214,0.13);
      position: relative;
      font-family: 'Segoe UI', sans-serif;
    }
    .decision-header {
      font-size: 1.2em;
      font-weight: 700;
      color: #2e7d32;
      text-align: center;
      padding: 1em 0 0.5em 0;
      border-bottom: 1.5px solid #e9eafc;
      position: relative;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 1em 0.7em 0.7em 0.7em;
      display: flex;
      flex-direction: column;
      min-height: 0;
      max-height: calc(100vh - 120px);
      scroll-behavior: smooth;
      background: #fafbfc;
    }
    .msg {
      display: flex;
      align-items: flex-start;
      gap: 0.7em;
      margin-bottom: 0.7em;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .msg-content {
      flex: 1;
      background: #e8f5e9;
      border-radius: 8px;
      padding: 0.7em 1em;
      color: #222;
      font-size: 1.07em;
      word-break: break-word;
    }
    .msg-user {
      font-weight: 600;
      color: #388e3c;
      font-size: 1em;
      margin-bottom: 0.2em;
    }
    form {
      display: flex;
      gap: 0.5em;
      padding: 0.7em;
      border-top: 1.5px solid #e9eafc;
      background: #fafbfc;
    }
    input[type="text"] {
      flex: 1;
      padding: 0.7em 1em;
      font-size: 1em;
      border-radius: 8px;
      border: 1.5px solid #e0e0e0;
      outline: none;
      transition: border 0.2s;
    }
    input[type="text"]:focus {
      border: 1.5px solid #2e7d32;
    }
    button[type="submit"] {
      background: #2e7d32;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.7em 1.2em;
      font-size: 1.1em;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button[type="submit"]:active {
      background: #1b5e20;
    }
  `;

  constructor() {
    super();
    this.messages = [];
    this.loading = false;
    this.warning = '';
    this.useWebSearch = true;
  }

  _showWarning(msg) {
    this.warning = msg;
    this.requestUpdate();
    setTimeout(() => {
      this.warning = '';
      this.requestUpdate();
    }, 2000);
  }

  _escapeHtml(text) {
    return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  async _sendMessage(e) {
    e.preventDefault();
    const input = this.renderRoot.querySelector('input[type="text"]');
    const text = input.value.trim();
    if (!text) return;
    this.messages = [...this.messages, { sender: 'user', text }];
    input.value = '';
    this.loading = true;
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch('/api/decision-helper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ question: text, useWebSearch: this.useWebSearch })
      });
      if (!res.ok) {
        this._showWarning('Failed to get AI response.');
        this.loading = false;
        return;
      }
      const data = await res.json();
      console.log('AI response data:', data);
      let aiText = data.response;
      if (typeof aiText !== 'string') {
        aiText = JSON.stringify(aiText);
      }
      if (aiText && aiText.trim()) {
        this.messages = [
          ...this.messages,
          { sender: 'ai', text: aiText }
        ];
      } else {
        this._showWarning('No response from AI.');
      }
      if (data.followUpQuestions && Array.isArray(data.followUpQuestions)) {
        data.followUpQuestions.forEach(q => {
          this.messages = [
            ...this.messages,
            { sender: 'ai', text: q }
          ];
        });
      }
    } catch (err) {
      this._showWarning('Error contacting server.');
    }
    this.loading = false;
  }

  async waitForModelReady(maxWait = 120000) {
    const start = Date.now();
    const delay = ms => new Promise(res => setTimeout(res, ms));
    while (Date.now() - start < maxWait) {
      try {
        const res = await fetch("/ping");
        if (res.ok) return true;
      } catch (e) {
        console.warn("Ollama not ready yet...");
      }
      await delay(2000);
    }
    throw new Error("Model failed to load within timeout.");
  }

  firstUpdated() {
    // Disable input until model is ready
    const input = this.renderRoot.querySelector('input[type="text"]');
    if (input) input.disabled = true;
    this.waitForModelReady()
      .then(() => {
        console.log("Model ready. Unlocking UI.");
        if (input) input.disabled = false;
      })
      .catch(err => {
        console.error(err.message);
        alert("The AI model is still warming up. Please try again shortly.");
      });
  }

  _toggleWebSearch() {
    this.useWebSearch = !this.useWebSearch;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="decision-header">
        Decision Helper
        <button @click="${this._toggleWebSearch}" style="float:right;margin-right:1em;background:${this.useWebSearch ? '#2e7d32' : '#888'};color:#fff;border:none;border-radius:8px;padding:0.4em 1em;font-size:0.95em;cursor:pointer;">${this.useWebSearch ? 'Web Search: ON' : 'Web Search: OFF'}</button>
      </div>
      <div class="messages">
        ${this.messages.map(msg => html`
          <div class="msg">
            <div class="msg-content">
              <div class="msg-user">${msg.sender === 'user' ? 'You' : 'AI'}</div>
              <div>${msg.text}</div>
            </div>
          </div>
        `)}
      </div>
      <form @submit="${this._sendMessage}">
        <input type="text" autocomplete="off" placeholder="Ask your question..." maxlength="500">
        <button type="submit">Ask</button>
      </form>
      ${this.warning ? html`<div style="color:#d32f2f;text-align:center;margin:0.5em 0;font-weight:600;">${this.warning}</div>` : ''}
    `;
  }
}

customElements.define('decision-helper-ui', DecisionHelperUI); 