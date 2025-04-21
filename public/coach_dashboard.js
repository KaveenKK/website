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

  let profileData = {};

  // Load coach profile and UI
  async function loadCoachData() {
    try {
      console.log('⏳ Fetching profile');
      const res = await api('/profile');
      profileData = await res.json();
      console.log('📦 Profile data', profileData);
    } catch (err) {
      return console.error('Failed loading profile', err);
    }

    // Greeting
    document.getElementById('welcomeGreeting').textContent = `Welcome, ${profileData.name}`;
    if (profileData.profile_picture) {
      document.getElementById('profilePic').src = profileData.profile_picture;
    }
    if (profileData.birthdate) {
      document.getElementById('birthdate').value = profileData.birthdate.split('T')[0];
    }
    // ...populate other fields similarly

    // Approval & publish
    const publishBtn = document.getElementById('publishBtn');
    const statusDiv = document.getElementById('approvalStatus');
    if (!profileData.approved) {
      statusDiv.textContent = '⏳ Awaiting approval';
      publishBtn.disabled = true;
    } else if (profileData.approved && !profileData.published) {
      statusDiv.textContent = '✅ Approved: Ready to publish';
      publishBtn.disabled = false;
    } else {
      statusDiv.textContent = '🚀 Published';
      publishBtn.disabled = true;
    }

    // Subscribers & invites
    const subList = document.getElementById('subscriberList');
    subList.innerHTML = (profileData.subscribers || []).map(u => `<li>${u.username} (${u.date})</li>`).join('')
      || '<li>No subscribers yet</li>';
    const invList = document.getElementById('inviteList');
    invList.innerHTML = (profileData.invites || []).map(u => `<li>${u.username} joined ${u.date}</li>`).join('')
      || '<li>No invites yet</li>';

    // Earnings chart
    renderEarningsChart(profileData.earnings || []);
  }

  // Profile form handlers
  document.getElementById('picUpload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => document.getElementById('profilePic').src = reader.result;
    reader.readAsDataURL(file);
  });

  document.getElementById('usdInput').addEventListener('input', () => {
    const usd = parseFloat(e.target.value) || 0;
    document.getElementById('mapleDisplay').textContent = Math.round((usd / 0.3) * 10);
  });

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const form = document.getElementById('profileForm');
    const payload = {
      birthdate: form.birthdate.value,
      bio: form.bio.value,
      specialties: form.specialties.value.split(',').map(s => s.trim()),
      // ...other fields
      profile_picture: document.getElementById('profilePic').src
    };
    try {
      const res = await api('/profile', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) throw await res.text();
      alert('✅ Profile saved');
      await loadCoachData();
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save profile');
    }
  });

  document.getElementById('publishBtn').addEventListener('click', async () => {
    try {
      const res = await api('/profile/publish', { method: 'POST' });
      if (!res.ok) throw await res.text();
      alert('🚀 Profile published');
      await loadCoachData();
    } catch (err) {
      console.error('Publish error', err);
      alert('Failed to publish');
    }
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
    if (profileData.approved) document.getElementById('publishBtn').disabled = false;
    alert('✅ Course completed');
  });

  // Earnings chart
  function renderEarningsChart(data) {
    const canvas = document.getElementById('earningsChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!data.length) return ctx.fillText('No data', 10, 50);
    const max = Math.max(...data.map(d => d.amount));
    const barW = (canvas.width - 40) / data.length;
    data.forEach((d,i) => {
      const h = (d.amount / max) * (canvas.height - 40);
      ctx.fillRect(20 + i*barW, canvas.height - h - 20, barW*0.6, h);
      ctx.fillText(d.month, 20 + i*barW, canvas.height - 5);
    });
  }

  // Initial load
  await loadCoachData();
});
