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

  // API helper
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

  // UI elements
  const saveBtn = document.getElementById('saveBtn');
  const editBtn = document.getElementById('editBtn');
  const appStatusIndicator = document.getElementById('appStatusIndicator');
  const approvalStatus = document.getElementById('approvalStatus');
  const applyLink = document.getElementById('applyLink');
  const form = document.getElementById('profileForm');

  let profileData = {};
  let editingMode = false;

  // Toggle form readonly/edit mode
  function updateFormState() {
    if (!profileData.application_completed) {
      // Application pending: lock and hide edit/save
      form.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
      saveBtn.style.display = 'none';
      editBtn.style.display = 'none';
      applyLink.style.display = 'inline-block';
      appStatusIndicator.textContent = '❗ Application pending';
      approvalStatus.textContent = profileData.approved ? '✅ Approved' : '⏳ Awaiting approval';
      return;
    }
    // Application completed
    applyLink.style.display = 'none';
    appStatusIndicator.textContent = '✅ Application completed';
    // Approval status (do not re-show approval gating)
    approvalStatus.textContent = profileData.approved ? '✅ Approved' : '⏳ Awaiting approval';

    if (editingMode) {
      // In edit mode: unlock fields, show save
      form.querySelectorAll('input, textarea, select').forEach(el => el.disabled = false);
      saveBtn.style.display = 'inline-block';
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline-block';
      saveBtn.disabled = false;      // ← make it clickable
      editBtn.style.display = 'none'
    } else {
      // View mode: lock fields, show edit
      form.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
      saveBtn.style.display = 'none';
      editBtn.style.display = 'inline-block';
      saveBtn.style.display = 'none';
      saveBtn.disabled = true;       // ← keep it disabled when hidden
      editBtn.style.display = 'inline-block';
    }
  }

  // Listen for changes to enable save in view mode
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', () => {
      if (!editingMode && profileData.application_completed) {
        editingMode = true;
        updateFormState();
      }
    });
  });

  // Load and render profile
  async function loadCoachData() {
    try {
      const res = await api('/profile');
      profileData = await res.json();
    } catch (err) {
      console.error('Failed loading profile', err);
      return;
    }
    // Populate fields
    document.getElementById('welcomeGreeting').textContent = `Welcome, ${profileData.name}`;
    if (profileData.profile_picture) document.getElementById('profilePic').src = profileData.profile_picture;
    if (profileData.birthdate) document.getElementById('birthdate').value = profileData.birthdate.split('T')[0];
    form.bio.value = profileData.bio || '';
    form.specialties.value = (profileData.specialties||[]).join(', ');
    form.experience.value = profileData.experience || '';
    form.instagram.value = profileData.instagram || '';
    form.twitter.value = profileData.twitter || '';
    form.linkedin.value = profileData.linkedin || '';
    form.discordTag.value = profileData.discordTag || '';
    form.paypal.value = profileData.paypal || '';
    form.monthly_price_usd.value = profileData.monthly_price_usd || 0;
    document.getElementById('mapleDisplay').textContent = Math.round((profileData.monthly_price_usd/0.3)*10);
    // Reset editing mode after data load
    editingMode = false;
    updateFormState();
  }

  // Picture preview
  document.getElementById('picUpload').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => document.getElementById('profilePic').src = reader.result;
    reader.readAsDataURL(file);
  });
  // Price mapping
  document.getElementById('usdInput').addEventListener('input', e => {
    const usd = parseFloat(e.target.value) || 0;
    document.getElementById('mapleDisplay').textContent = Math.round((usd/0.3)*10);
  });

  // Save
  saveBtn.addEventListener('click', async () => {
    if (!profileData.application_completed) {
      return alert('Please submit your coach application first.');
    }
    const payload = {
      birthdate: form.birthdate.value,
      bio: form.bio.value,
      specialties: form.specialties.value.split(',').map(s=>s.trim()),
      experience: form.experience.value,
      instagram: form.instagram.value,
      twitter: form.twitter.value,
      linkedin: form.linkedin.value,
      discordTag: form.discordTag.value,
      paypal: form.paypal.value,
      monthly_price_usd: parseFloat(form.monthly_price_usd.value)
    };

    try {
      const res = await api('/profile', { method:'POST', body: JSON.stringify(payload) });
      if (!res.ok) throw await res.text();
      alert('✅ Profile saved');
      await loadCoachData();
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save profile');
    }
  });

  // Edit
  editBtn.addEventListener('click', () => {
    if (!profileData.application_completed) {
      return alert('Please submit your coach application first.');
    }
    editingMode = true;
    updateFormState();
  });

  // Initial load
  await loadCoachData();
});
