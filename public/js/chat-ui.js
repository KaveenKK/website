import { LitElement, html, css } from 'lit';

export class PowerhouseChatUI extends LitElement {
  static properties = {
    houseId: { type: String },
    houseName: { type: String },
    userToken: { type: String },
    userData: { type: Object },
    apiBase: { type: String },
    socket: { type: Object },
    messages: { type: Array },
    loading: { type: Boolean },
    done: { type: Boolean },
    page: { type: Number },
    limit: { type: Number },
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
    .chat-header {
      font-size: 1.2em;
      font-weight: 700;
      color: #5a5ad6;
      text-align: center;
      padding: 1em 0 0.5em 0;
      border-bottom: 1.5px solid #e9eafc;
      position: relative;
    }
    .close-btn {
      position: absolute;
      top: 1em;
      right: 1em;
      background: none;
      border: none;
      font-size: 1.5em;
      color: #888;
      cursor: pointer;
      z-index: 2;
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
    .msg-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #b3b3f7;
      object-fit: cover;
    }
    .msg-content {
      flex: 1;
    }
    .msg-username {
      font-weight: 600;
      color: #5a5ad6;
      font-size: 1em;
    }
    .msg-time {
      color: #aaa;
      font-size: 0.93em;
      font-weight: 400;
      margin-left: 0.5em;
    }
    .msg-text {
      font-size: 1.07em;
      color: #222;
      margin-top: 0.1em;
      word-break: break-word;
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
      border: 1.5px solid #5a5ad6;
    }
    button[type="submit"] {
      background: #5a5ad6;
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
      background: #4a4ac6;
    }
  `;

  constructor() {
    super();
    this.houseId = '';
    this.houseName = '';
    this.userToken = '';
    this.userData = {};
    this.apiBase = '';
    this.socket = null;
    this.messages = [];
    this.loading = false;
    this.done = false;
    this.page = 1;
    this.limit = 30;
    this._scrolling = false;
  }

  firstUpdated() {
    this._messagesDiv = this.renderRoot.querySelector('.messages');
    this._loadMessages(true);
    this._setupSocket();
    this._messagesDiv.addEventListener('scroll', () => this._onScroll());
  }

  updated(changed) {
    if (changed.has('messages') && !this._scrolling) {
      this.updateComplete.then(() => {
        this._messagesDiv.scrollTop = this._messagesDiv.scrollHeight;
      });
    }
  }

  _setupSocket() {
    if (!this.socket) return;
    this.socket.off('houseMessage');
    this.socket.on('houseMessage', (data) => {
      if (!data || data.houseId !== this.houseId) return;
      if (data.user && data.user._id === this.userData._id) return;
      this.messages = [...this.messages, data];
      this._scrollToBottom();
    });
    this.socket.emit('joinHouseRoom', this.houseId);
  }

  async _loadMessages(initial = false) {
    if (this.loading || this.done) return;
    this.loading = true;
    const headers = { Authorization: 'Bearer ' + this.userToken };
    const res = await fetch(`${this.apiBase}/api/houses/${this.houseId}/chat?page=${this.page}&limit=${this.limit}`, { headers });
    if (!res.ok) { this.loading = false; return; }
    const msgs = await res.json();
    if (msgs.length < this.limit) this.done = true;
    this.messages = initial ? msgs : [...msgs, ...this.messages];
    this.loading = false;
    this.page++;
    if (initial) this._scrollToBottom();
  }

  _onScroll() {
    if (this._messagesDiv.scrollTop === 0 && !this.loading && !this.done) {
      this._scrolling = true;
      const prevHeight = this._messagesDiv.scrollHeight;
      this._loadMessages().then(() => {
        this.updateComplete.then(() => {
          this._messagesDiv.scrollTop = this._messagesDiv.scrollHeight - prevHeight;
          this._scrolling = false;
        });
      });
    }
  }

  _scrollToBottom() {
    this.updateComplete.then(() => {
      this._messagesDiv.scrollTop = this._messagesDiv.scrollHeight;
    });
  }

  _escapeHtml(text) {
    return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  async _sendMessage(e) {
    e.preventDefault();
    const input = this.renderRoot.querySelector('input[type="text"]');
    const text = input.value.trim();
    if (!text) return;
    const headers = { Authorization: 'Bearer ' + this.userToken, 'Content-Type': 'application/json' };
    const res = await fetch(`${this.apiBase}/api/houses/${this.houseId}/chat`, {
      method: 'POST', headers, body: JSON.stringify({ message: text })
    });
    if (res.ok) {
      input.value = '';
      this.page = 1; this.done = false; this.messages = [];
      await this._loadMessages(true);
      this._scrollToBottom();
      this.socket.emit('houseMessage', {
        houseId: this.houseId,
        message: text,
        user: {
          username: this.userData.username,
          avatar: this.userData.avatar,
          discord_id: this.userData.discord_id,
          _id: this.userData._id
        }
      });
    }
  }

  _close() {
    this.dispatchEvent(new CustomEvent('close-chat', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="chat-header">
        ${this.houseName}
        <button class="close-btn" @click="${this._close}">&times;</button>
      </div>
      <div class="messages">
        ${this.messages.map(msg => html`
          <div class="msg">
            <img class="msg-avatar" src="${msg.user?.avatar ? `https://cdn.discordapp.com/avatars/${msg.user.discord_id || msg.user._id || ''}/${msg.user.avatar}.png` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}" alt="Avatar">
            <div class="msg-content">
              <div><span class="msg-username">${msg.user?.username || 'User'}</span><span class="msg-time">${new Date(msg.createdAt).toLocaleString()}</span></div>
              <div class="msg-text">${this._escapeHtml(msg.message)}</div>
            </div>
          </div>
        `)}
      </div>
      <form @submit="${this._sendMessage}">
        <input type="text" autocomplete="off" placeholder="Type a message...">
        <button type="submit">Send</button>
      </form>
    `;
  }
}

customElements.define('powerhouse-chat-ui', PowerhouseChatUI); 