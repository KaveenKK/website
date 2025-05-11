import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3.1.2/+esm';

export class DecisionHelperUI extends LitElement {
  static properties = {
    options: { type: Array },
    newOption: { type: String },
    background: { type: String },
    aiSuggestion: { type: String },
    loading: { type: Boolean },
    warning: { type: String },
    confidence: { type: Number },
    suggestedCoaches: { type: Array },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100vw;
      max-width: 420px;
      margin: 0 auto;
      background: #fafbfc;
      border-radius: 18px;
      box-shadow: 0 4px 24px rgba(90,90,214,0.13);
      font-family: 'Segoe UI', sans-serif;
      padding: 0.5em 0 2em 0;
    }
    .decision-header {
      font-size: 1.3em;
      font-weight: 700;
      color: #2e7d32;
      text-align: center;
      padding: 1.2em 0 0.7em 0;
      border-bottom: 1.5px solid #e9eafc;
      letter-spacing: 0.01em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5em;
    }
    .section-label {
      font-weight: 600;
      font-size: 1.08em;
      margin: 1.2em 0 0.5em 0.2em;
      color: #222;
    }
    .option-list {
      background: #f4f7f6;
      border-radius: 14px;
      padding: 0.7em 0.8em 0.5em 0.8em;
      margin-bottom: 0.5em;
      box-shadow: 0 1px 4px #0001;
    }
    .option-row {
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 0.5em;
      padding: 0.5em 0.7em;
      box-shadow: 0 1px 2px #0001;
      font-size: 1.08em;
      justify-content: space-between;
    }
    .option-row:last-child { margin-bottom: 0; }
    .remove-btn {
      background: none;
      border: none;
      color: #d32f2f;
      font-size: 1.2em;
      cursor: pointer;
      margin-left: 0.5em;
    }
    .add-option-row {
      display: flex;
      gap: 0.5em;
      margin-bottom: 0.5em;
    }
    input[type="text"] {
      flex: 1;
      padding: 0.7em 1em;
      font-size: 1em;
      border-radius: 8px;
      border: 1.5px solid #e0e0e0;
      outline: none;
      transition: border 0.2s;
      background: #fff;
    }
    input[type="text"]:focus {
      border: 1.5px solid #2e7d32;
    }
    .add-btn {
      background: #2e7d32;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.7em 1.2em;
      font-size: 1.08em;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .add-btn:active { background: #1b5e20; }
    .option-hint {
      color: #888;
      font-size: 0.98em;
      margin-bottom: 0.3em;
      text-align: center;
    }
    textarea {
      width: 100%;
      min-height: 70px;
      border-radius: 10px;
      border: 1.5px solid #e0e0e0;
      padding: 0.8em 1em;
      font-size: 1em;
      margin-bottom: 0.5em;
      background: #fff;
      resize: vertical;
      transition: border 0.2s;
    }
    textarea:focus {
      border: 1.5px solid #2e7d32;
    }
    .suggest-btn {
      background: #2e7d32;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.8em 1.5em;
      font-size: 1.13em;
      font-weight: 600;
      cursor: pointer;
      margin: 1em 0 0.5em 0;
      transition: background 0.2s;
      width: 100%;
      box-shadow: 0 2px 8px #0001;
    }
    .suggest-btn:disabled {
      background: #bdbdbd;
      cursor: not-allowed;
    }
    .ai-suggestion {
      background: #ff8a4c;
      color: #fff;
      border-radius: 14px;
      padding: 1.1em 1.2em;
      margin: 1em 0 0.5em 0;
      font-size: 1.13em;
      font-weight: 500;
      box-shadow: 0 2px 8px #0002;
      text-align: left;
      word-break: break-word;
    }
    .warning {
      color: #d32f2f;
      text-align: center;
      margin: 0.5em 0;
      font-weight: 600;
    }
    @media (max-width: 600px) {
      :host { width: 100vw; max-width: 100vw; border-radius: 0; }
    }
  `;

  constructor() {
    super();
    this.options = [];
    this.newOption = '';
    this.background = '';
    this.aiSuggestion = '';
    this.loading = false;
    this.warning = '';
    this.confidence = null;
    this.suggestedCoaches = [];
  }

  _addOption(e) {
    e.preventDefault();
    const val = this.newOption.trim();
    if (!val) return;
    if (this.options.length >= 10) {
      this.warning = 'You can add up to 10 options.';
      return;
    }
    if (this.options.includes(val)) {
      this.warning = 'Option already added.';
      return;
    }
    this.options = [...this.options, val];
    this.newOption = '';
    this.warning = '';
  }

  _removeOption(idx) {
    this.options = this.options.filter((_, i) => i !== idx);
  }

  _onBackgroundInput(e) {
    this.background = e.target.value;
  }

  async _getSuggestion() {
    if (this.options.length < 2) {
      this.warning = 'Add at least 2 options.';
      return;
    }
    this.loading = true;
    this.warning = '';
    this.aiSuggestion = '';
    this.confidence = null;
    this.suggestedCoaches = [];
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch('/api/decision-helper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          question: `Options: ${this.options.join(', ')}\nBackground: ${this.background}`,
          useWebSearch: true
        })
      });
      if (!res.ok) {
        this.warning = 'Failed to get AI suggestion.';
        this.loading = false;
        return;
      }
      const data = await res.json();
      let aiText = data.response;
      if (typeof aiText !== 'string') aiText = JSON.stringify(aiText);
      this.aiSuggestion = aiText;
      this.confidence = typeof data.confidence === 'number' ? data.confidence : null;
      this.suggestedCoaches = Array.isArray(data.suggestedCoaches) ? data.suggestedCoaches : [];
    } catch (err) {
      this.warning = 'Error contacting server.';
    }
    this.loading = false;
  }

  _clearAll() {
    this.options = [];
    this.newOption = '';
    this.background = '';
    this.aiSuggestion = '';
    this.warning = '';
    this.loading = false;
  }

  render() {
    return html`
      <div class="decision-header">
        <span style="font-size:1.4em;">🤖</span> Personal Decider
      </div>
      <div style="display:flex;justify-content:flex-end;margin:0.5em 1em 0 0;">
        <button @click="${this._clearAll}" style="background:#e0f2f1;color:#2e7d32;border:none;border-radius:7px;padding:0.4em 1.1em;font-weight:600;cursor:pointer;font-size:0.98em;box-shadow:0 1px 4px #0001;">Clear</button>
      </div>
      <div class="section-label">Add Your</div>
      <form class="add-option-row" @submit="${this._addOption}">
        <input type="text" .value="${this.newOption}" @input="${e => this.newOption = e.target.value}" placeholder="Type your option" maxlength="60" ?disabled="${this.options.length >= 10}">
        <button class="add-btn" type="submit" ?disabled="${this.options.length >= 10}">Add Option</button>
      </form>
      <div class="option-hint">You can add up to 10 options.</div>
      <div class="option-list">
        ${this.options.map((opt, idx) => html`
          <div class="option-row">
            <span>${opt}</span>
            <button class="remove-btn" @click="${() => this._removeOption(idx)}" title="Remove">&times;</button>
          </div>
        `)}
      </div>
      <div class="section-label">Background</div>
      <textarea placeholder="Add any background information here..." .value="${this.background}" @input="${this._onBackgroundInput}"></textarea>
      <button class="suggest-btn" @click="${this._getSuggestion}" ?disabled="${this.loading || this.options.length < 2}">
        ${this.loading ? html`<span style="display:inline-flex;align-items:center;gap:0.5em;"><span class="wave" style="font-size:1.2em;animation:waving 1.2s infinite;">👋</span> Personal Decider is thinking...</span>` : 'Get AI Suggestion'}
      </button>
      <style>
        @keyframes waving {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      </style>
      ${this.aiSuggestion ? html`<div class="section-label" style="margin-top:1.2em;">AI Suggestion</div><div class="ai-suggestion">${this.aiSuggestion}</div>${this.confidence !== null ? html`<div style="text-align:right;font-size:0.98em;color:#2e7d32;margin:0.2em 0.2em 0.7em 0;"><b>Confidence:</b> ${this.confidence}%</div>` : ''}${this.suggestedCoaches.length ? html`<div class="section-label" style="margin-top:1.2em;">Suggested Coaches for Further Advice</div><div style="overflow-x:auto;display:flex;gap:1em;padding-bottom:0.5em;">${this.suggestedCoaches.map(coach => html`<div style="min-width:210px;max-width:210px;background:#e8f5e9;border-radius:14px;box-shadow:0 2px 8px #0001;padding:1em 1em 0.7em 1em;display:flex;flex-direction:column;align-items:center;"><img src="${coach.profile_picture || '/images/default-avatar.png'}" alt="Profile" style="width:64px;height:64px;border-radius:50%;object-fit:cover;margin-bottom:0.7em;"><div style="font-weight:700;color:#2e7d32;font-size:1.08em;margin-bottom:0.2em;">${coach.name}</div><div style="font-size:0.98em;color:#555;margin-bottom:0.3em;text-align:center;">${coach.bio || coach.experience || ''}</div><div style="font-size:0.95em;color:#388e3c;margin-bottom:0.2em;"><b>Niche:</b> ${coach.niche || 'General'}</div>${coach.average_rating ? html`<div style="font-size:0.93em;color:#ff9800;">⭐ ${coach.average_rating.toFixed(1)}</div>` : ''}</div>`)} </div>` : ''}` : ''}
      ${this.warning ? html`<div class="warning">${this.warning}</div>` : ''}
    `;
  }
}

customElements.define('decision-helper-ui', DecisionHelperUI); 