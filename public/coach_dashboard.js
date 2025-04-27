// public/coach_dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("⚡ Initializing Coach Dashboard");

  // Persist and retrieve token
  const params = new URLSearchParams(window.location.search);
  let token = params.get('token');
  if (token) {
    localStorage.setItem('coachToken', token);
    history.replaceState({}, '', window.location.pathname);
  }
  token = token || localStorage.getItem('coachToken');
  if (!token) {
    alert('You must log in first');
    return window.location.href = '/auth/discord';
  }
  console.log("🔑 Using JWT token", token);

  // Helper to call API
  const api = (path, opts = {}) => {
    opts.headers = Object.assign({}, opts.headers, {
      'Authorization': 'Bearer ' + token,
      'Content-Type': opts.method === 'GET' ? undefined : 'application/json'
    });
    return fetch(`/api${path}`, opts).then(res => {
      if (res.status === 401) {
        alert('Session expired. Please log in again.');
        return Promise.reject('Unauthorized');
      }
      return res;
    });
  };

  // Tab navigation
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
  window.showTab = tabId => {
    document.querySelectorAll('.tab-content, .tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
  };
  showTab('dashboard');

  // UI elements for gating & read-only toggle
  const saveBtn            = document.getElementById('saveBtn');
  const editBtn            = document.getElementById('editBtn');
  const appStatusIndicator = document.getElementById('appStatusIndicator');
  const applyLink          = document.getElementById('applyLink');
  const form               = document.getElementById('profileForm');

  // Disable or enable form controls
  function setFormReadOnly(readOnly) {
    Array.from(form.elements).forEach(el => {
      if (el.id === 'completeCourseBtn') return;
      el.disabled = readOnly;
    });
    saveBtn.style.display = readOnly ? 'none' : 'inline-block';
    editBtn.style.display = readOnly ? 'inline-block' : 'none';
  }

  let profileData = {};

  // Load coach profile and update UI
  async function loadCoachData() {
    try {
      console.log('⏳ Fetching profile');
      const res = await api('/profile');
      profileData = await res.json();
      console.log('📦 Profile data', profileData);
    } catch (err) {
      console.error('Failed loading profile', err);
      return;
    }

    // Greeting & picture
    document.getElementById('welcomeGreeting').textContent = `Welcome, ${profileData.name}`;
    if (profileData.profile_picture) {
      document.getElementById('profilePic').src = profileData.profile_picture;
    }
    if (profileData.birthdate) {
      document.getElementById('birthdate').value = profileData.birthdate.split('T')[0];
    }

    // Application gating & status
    if (!profileData.application_completed) {
      appStatusIndicator.textContent = '❗ Application pending';
      applyLink.style.display = 'inline-block';
      saveBtn.disabled       = true;
      setFormReadOnly(true);
    } else {
      appStatusIndicator.textContent = '✅ Application completed';
      applyLink.style.display = 'none';
      saveBtn.disabled       = false;
      setFormReadOnly(false);
    }

    // Subscribers & invites
    const subList = document.getElementById('subscriberList');
    subList.innerHTML = (profileData.subscribers || [])
      .map(u => `<li>${u.username} (${u.date})</li>`).join('')
      || '<li>No subscribers yet</li>';
    const invList = document.getElementById('inviteList');
    invList.innerHTML = (profileData.invites || [])
      .map(u => `<li>${u.username} joined ${u.date}</li>`).join('')
      || '<li>No invites yet</li>';

    // Earnings chart
    renderEarningsChart(profileData.earnings || []);
  }

  // Profile picture preview
  document.getElementById('picUpload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => document.getElementById('profilePic').src = reader.result;
    reader.readAsDataURL(file);
  });

  // Maple price mapping
  document.getElementById('usdInput').addEventListener('input', e => {
    const usd = parseFloat(e.target.value) || 0;
    document.getElementById('mapleDisplay').textContent = Math.round((usd / 0.3) * 10);
  });

  // Save profile
  saveBtn.addEventListener('click', async () => {
    if (!profileData.application_completed) {
      return alert('Please submit your coach application first.');
    }
    const payload = {
      birthdate: form.birthdate.value,
      bio:       form.bio.value,
      specialties: form.specialties.value.split(',').map(s => s.trim()),
      profile_picture: document.getElementById('profilePic').src
    };

    try {
      const res = await api('/profile', {
        method: 'POST',
        body:   JSON.stringify(payload)
      });
      if (!res.ok) throw await res.text();
      alert('✅ Profile saved');
      await loadCoachData();  // reload data first
      setFormReadOnly(true);  // then lock form
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save profile');
    }
  });

  // Edit button
  editBtn.addEventListener('click', () => {
    if (!profileData.application_completed) {
      return alert('Please submit your coach application first.');
    }
    setFormReadOnly(false);
  });

  // Course navigation
  const slides = document.querySelectorAll('.course-slide');
  let slideIndex = 0;
  document.getElementById('nextBtn').addEventListener('click', () => {
    slides[slideIndex].classList.remove('active');
    slideIndex = Math.min(slideIndex + 1, slides.length - 1);
    slides[slideIndex].classList.add('active');
  });

  document.getElementById('completeCourseBtn').addEventListener('click', () => {
    alert('✅ Course completed');
  });

  // Earnings chart renderer
  function renderEarningsChart(data) {
    const canvas = document.getElementById('earningsChart');
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!data.length) {
      ctx.fillText('No data', 10, 50);
      return;
    }
    const max  = Math.max(...data.map(d => d.amount));
    const barW = (canvas.width - 40) / data.length;
    data.forEach((d, i) => {
      const h = (d.amount / max) * (canvas.height - 40);
      ctx.fillRect(20 + i * barW, canvas.height - h - 20, barW * 0.6, h);
      ctx.fillText(d.month, 20 + i * barW, canvas.height - 5);
    });
  }

  // Initial load
  await loadCoachData();
});
