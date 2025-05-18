// Mythical Habit Tracker Home Tab Logic
(function() {
  if (!window.lottie) {
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
    script.onload = function() { render(); };
    document.head.appendChild(script);
  }

  // --- State ---
  function getLS(key, fallback) {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
  }
  function setLS(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  let xp = getLS('mh_xp', 50);
  let gold = getLS('mh_gold', 0);
  let level = getLS('mh_level', 1);
  let unlockedCards = getLS('mh_unlockedCards', [0, 1]);
  let completedQuests = getLS('mh_completedQuests', []);
  let activeStage = getLS('mh_activeStage', 1);
  let lastReset = getLS('mh_lastReset', '');
  let journalEntries = getLS('mh_journalEntries', {});

  // --- Data ---
  const stages = [
    { id: 1, name: 'Egg Hatching', image: 'images/egg-hatching.png' },
    { id: 2, name: 'First Steps', image: 'images/first-steps.png' },
    { id: 3, name: 'Training', image: 'images/training.png' },
    { id: 4, name: 'Growing Wings', image: 'images/growing-wings.png' },
    { id: 5, name: 'Flight Training', image: 'images/flight-training.png' },
    { id: 6, name: 'First Battle', image: 'images/first-battle.png' },
    { id: 7, name: 'Meditation', image: 'images/meditation.png' },
    { id: 8, name: 'Receiving Weapon', image: 'images/receiving-weapon.png' },
    { id: 9, name: 'Victory', image: 'images/victory.png' },
    { id: 10, name: 'Full Adult', image: 'images/full-adult.png' },
  ];
  const cards = [
    { id: 0, name: 'Mythical Creature', image: 'images/mythical-creature.png' },
    { id: 1, name: 'Mystical Artifact', image: 'images/mystical-artifact.png' },
    { id: 2, name: 'Legendary Warrior', image: 'images/legendary-warrior.png' },
  ];
  const quests = [
    { id: 0, task: 'Walk 10,000 steps', xpReward: 20 },
    { id: 1, task: 'Read for 30 minutes', xpReward: 30 },
    { id: 2, task: 'Meditate for 10 minutes', xpReward: 25 },
  ];

  // --- UI Rendering ---
  function render() {
    const root = document.getElementById('mythical-habit-home-root');
    if (!root) return;
    // Journal state
    const today = new Date().toISOString().split('T')[0];
    const journalEntry = journalEntries[today] || '';
    const wordCount = journalEntry.trim() ? journalEntry.trim().split(/\s+/).length : 0;
    const journalCompleted = !!journalEntries[today] && journalEntries[today + '_saved'];
    // HTML
    root.innerHTML = `
      <div class="mh-card mh-stats-bar">
        <div class="mh-stat"><div class="mh-stat-label">XP</div><div class="mh-stat-value" id="mh-xp">${xp}</div></div>
        <div class="mh-stat"><div class="mh-stat-label">Gold</div><div class="mh-stat-value" id="mh-gold">${gold}</div></div>
        <div class="mh-stat"><div class="mh-stat-label">Level</div><div class="mh-stat-value" id="mh-level">${level}</div></div>
      </div>
      <div class="mh-card">
        <div class="mh-title">Character Journey</div>
        <div class="mh-grid mh-grid-cols-2">
          ${stages.map(function(stage) {
            // XP logic
            const requiredXp = stage.id * 5 * 100;
            const percent = Math.min(1, xp / requiredXp);
            const xpNeeded = Math.max(0, requiredXp - xp);
            let imgHtml = '';
            if (stage.id === 1) {
              imgHtml = '<div id="egg-hatching-lottie"></div>';
            } else if (stage.id === 2) {
              imgHtml = '<div id="first-steps-lottie"></div>';
            } else if (stage.id === 3) {
              imgHtml = '<div id="training-lottie"></div>';
            } else if (stage.id === 4) {
              imgHtml = '<div id="growing-wings-lottie"></div>';
            } else {
              imgHtml = `<img src="${stage.image}" alt="${stage.name}" class="mh-img" />`;
            }
            return `
              <div class="mh-card ${activeStage === stage.id ? 'mh-card-active' : ''}" style="text-align:center; border:${activeStage === stage.id ? '2px solid var(--color-primary)' : '1px solid #eee'}; cursor:pointer;" data-stage="${stage.id}">
                <div class="mh-stage-img-container">${imgHtml}</div>
                <div class="mh-xp-bar-container"><div class="mh-xp-bar-bg"><div class="mh-xp-bar-fill" style="width:${Math.round(percent*100)}%"></div></div></div>
                <span class="mh-xp-bar-label">${xp >= requiredXp ? 'Completed!' : `${xpNeeded} XP to complete`}</span>
                <span class="mh-stage-label">${stage.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="mh-card">
        <div class="mh-title">NFT Cards Collection</div>
        <div class="mh-grid mh-grid-cols-3">
          ${cards.map(card => `
            <div class="mh-card ${!unlockedCards.includes(card.id) ? 'mh-card-locked' : ''}" style="text-align:center;">
              <img src="${card.image}" alt="${card.name}" class="mh-img" />
              <div style="font-size:0.95em;">${card.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="mh-card">
        <div class="mh-title">Daily Quests</div>
        <div class="mh-grid">
          ${quests.map(quest => `
            <label style="display:flex;align-items:center;">
              <input type="checkbox" class="mh-checkbox" data-quest="${quest.id}" ${completedQuests.includes(quest.id) ? 'checked disabled' : ''} />
              <span>${quest.task}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <div class="mh-card">
        <div class="mh-title">Daily Night Journal</div>
        <textarea class="mh-journal" id="mh-journal" placeholder="Write about your day..." ${journalCompleted ? 'disabled' : ''}>${journalEntry}</textarea>
        <button class="mh-btn" id="mh-journal-save" ${wordCount < 50 || journalCompleted ? 'disabled' : ''}>Save Journal</button>
        <div style="font-size:0.95em;color:#888;margin-top:0.3em;">${wordCount} / 50 words</div>
      </div>
      <div class="mh-card">
        <div class="mh-flex">
          <input type="number" id="mh-xp-input" class="mh-input" placeholder="Enter XP" min="1" value="" />
          <button class="mh-btn" id="mh-xp-convert">Convert</button>
        </div>
      </div>
    `;
    // Attach events
    root.querySelector('#mh-xp-convert').onclick = onConvertXp;
    root.querySelectorAll('[data-stage]').forEach(el => {
      el.onclick = () => onActivateStage(Number(el.getAttribute('data-stage')));
    });
    root.querySelectorAll('[data-quest]').forEach(el => {
      el.onchange = () => onCompleteQuest(Number(el.getAttribute('data-quest')));
    });
    if (!journalCompleted) {
      root.querySelector('#mh-journal').oninput = onJournalInput;
    }
    root.querySelector('#mh-journal-save').onclick = onSaveJournal;

    // Render Lottie for Egg Hatching
    if (window.lottie && document.getElementById('egg-hatching-lottie')) {
      window.lottie.loadAnimation({
        container: document.getElementById('egg-hatching-lottie'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'images/EggHatching.json',
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });
    }
    // Render Lottie for First Steps
    if (window.lottie && document.getElementById('first-steps-lottie')) {
      window.lottie.loadAnimation({
        container: document.getElementById('first-steps-lottie'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'images/FirstSteps.json',
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });
    }
    // Render Lottie for Training
    if (window.lottie && document.getElementById('training-lottie')) {
      window.lottie.loadAnimation({
        container: document.getElementById('training-lottie'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'images/training.json',
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });
    }
    // Render Lottie for Growing Wings
    if (window.lottie && document.getElementById('growing-wings-lottie')) {
      window.lottie.loadAnimation({
        container: document.getElementById('growing-wings-lottie'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'images/growingWings.json',
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });
    }
  }

  // --- Logic ---
  function saveState() {
    setLS('mh_xp', xp);
    setLS('mh_gold', gold);
    setLS('mh_level', level);
    setLS('mh_unlockedCards', unlockedCards);
    setLS('mh_completedQuests', completedQuests);
    setLS('mh_activeStage', activeStage);
    setLS('mh_lastReset', lastReset);
    setLS('mh_journalEntries', journalEntries);
  }
  function addXp(amount) {
    xp += amount;
    const newLevel = Math.floor(xp / 100) + 1;
    if (newLevel > level) {
      const levelsGained = newLevel - level;
      level = newLevel;
      gold += levelsGained * 50;
      alert(`Level Up! You are now level ${newLevel}!\nYou received ${levelsGained * 50} gold for leveling up!`);
    }
    saveState();
    render();
  }
  function onConvertXp() {
    const input = document.getElementById('mh-xp-input');
    const amount = Number(input.value);
    if (isNaN(amount) || amount <= 0) { alert('Please enter a valid XP amount'); return; }
    if (amount > xp) { alert("You don't have enough XP!"); return; }
    const goldAmount = Math.floor(amount * 0.5);
    xp -= amount;
    gold += goldAmount;
    input.value = '';
    alert(`Converted ${amount} XP to ${goldAmount} Gold!`);
    saveState();
    render();
  }
  function unlockRandomCard() {
    const locked = cards.filter(card => !unlockedCards.includes(card.id));
    if (locked.length > 0) {
      const random = locked[Math.floor(Math.random() * locked.length)];
      unlockedCards.push(random.id);
      alert('Congratulations! You unlocked a new character card!');
      saveState();
      render();
    }
  }
  function onCompleteQuest(questId) {
    if (!completedQuests.includes(questId)) {
      completedQuests.push(questId);
      const quest = quests.find(q => q.id === questId);
      addXp(quest ? quest.xpReward : 0);
      alert(`Quest completed! You earned ${quest ? quest.xpReward : 0} XP.`);
      saveState();
      render();
    }
  }
  function onActivateStage(stageId) {
    const requiredLevel = stageId * 5;
    if (level >= requiredLevel) {
      activeStage = stageId;
      if (stageId === 10) unlockRandomCard();
      alert(`You've reached the "${stages[stageId-1].name}" stage!`);
      saveState();
      render();
    } else {
      alert(`You need to reach level ${requiredLevel} to unlock this stage!`);
    }
  }
  function onJournalInput(e) {
    const val = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    journalEntries[today] = val;
    saveState();
  }
  function onSaveJournal() {
    const today = new Date().toISOString().split('T')[0];
    const entry = journalEntries[today] || '';
    const wordCount = entry.trim() ? entry.trim().split(/\s+/).length : 0;
    if (wordCount >= 50) {
      addXp(100);
      journalEntries[today + '_saved'] = true;
      alert('Journal saved! You earned 100 XP.');
      saveState();
      render();
    } else {
      alert('Please write at least 50 words to save your journal.');
    }
  }
  function checkAndResetDaily() {
    const today = new Date().toISOString().split('T')[0];
    if (lastReset !== today) {
      completedQuests = [];
      lastReset = today;
      saveState();
    }
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function() {
    checkAndResetDaily();
    render();
  });
})(); 