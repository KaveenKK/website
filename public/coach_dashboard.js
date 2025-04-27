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
  const saveBtn           = document.getElementById('saveBtn');
  const editBtn           = document.getElementById('editBtn');
  const publishBtn        = document.getElementById('publishBtn');
  const appStatusIndicator= document.getElementById('appStatusIndicator');
  const applyLink         = document.getElementById('applyLink');
  const form              = document.getElementById('profileForm');

  // Disable or enable all form controls (except the application link/button)
  function setFormReadOnly(readOnly) {
    Array.from(form.elements).forEach(el => {
      // never disable the "Complete Course" or hidden controls if you have any
      if (el.id === 'completeCourseBtn') return;
      el.disabled = readOnly;
    });
    // Toggle visibility of Save vs Edit
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
    // TODO: populate the rest of the form fields similarly...

    // Application gating
    if (!profileData.application_completed) {
      appStatusIndicator.textContent = '❗ You must complete the application first.';
      saveBtn.disabled = true;
      applyLink.style.display = 'inline-block';
      setFormReadOnly(true);
    } else {
      appStatusIndicator.textContent = '✅ Application completed';
      saveBtn.disabled = false;
      applyLink.style.display = 'none';
      setFormReadOnly(false);
    }

    // Approval & publish status
    if (!profileData.approved) {
      appStatusIndicator.textContent = '⏳ Awaiting approval';
      publishBtn.disabled = true;
    } else if (profileData.approved && !profileData.published) {
      appStatusIndicator.textContent = '✅ Approved: Ready to publish';
      publishBtn.disabled = false;
    } else {
      appStatusIndicator.textContent = '🚀 Published';
      publishBtn.disabled = true;
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

  // Handle profile picture preview
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
    const payload = {
      birthdate: form.birthdate.value,
      bio: form.bio.value,
      specialties: form.specialties.value.split(',').map(s => s.trim()),
      // TODO: gather the rest of the fields here...
      profile_picture: document.getElementById('profilePic').src
    };
    try {
      const res = await api('/profile', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw await res.text();
      alert('✅ Profile saved');
      // Lock form until they click "Edit"
      setFormReadOnly(true);
      await loadCoachData();
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save profile');
    }
  });

  // Edit again
  editBtn.addEventListener('click', () => {
    setFormReadOnly(false);
  });

  // Publish profile
  publishBtn.addEventListener('click', async () => {
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
    if (profileData.approved) publishBtn.disabled = false;
    alert('✅ Course completed');
  });

  // Earnings chart renderer
  function renderEarningsChart(data) {
    const canvas = document.getElementById('earningsChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!data.length) {
      ctx.fillText('No data', 10, 50);
      return;
    }
    const max = Math.max(...data.map(d => d.amount));
    const barW = (canvas.width - 40) / data.length;
    data.forEach((d, i) => {
      const h = (d.amount / max) * (canvas.height - 40);
      ctx.fillRect(20 + i * barW, canvas.height - h - 20, barW * 0.6, h);
      ctx.fillText(d.month, 20 + i * barW, canvas.height - 5);
    });
  }

  // Kick things off
  await loadCoachData();
});
