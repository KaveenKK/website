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
    form.experience.value = profileData.experience || '';
    form.youtube.value  = (profileData.social_links?.youtube ) || '';
    form.tiktok.value   = (profileData.social_links?.tiktok  ) || '';
    form.threads.value  = (profileData.social_links?.threads ) || '';
    form.facebook.value = (profileData.social_links?.facebook) || '';
    form.instagram.value = (profileData.social_links?.instagram) || '';
    form.twitter.value = (profileData.social_links?.twitter) || '';
    form.linkedin.value = (profileData.social_links?.linkedin) || '';
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
      experience: form.experience.value,
      social_links: {
        youtube:  form.youtube.value.trim(),
        tiktok:   form.tiktok.value.trim(),
        threads:  form.threads.value.trim(),
        facebook: form.facebook.value.trim(),
        instagram: form.instagram.value.trim(),
        twitter: form.twitter.value.trim(),
        linkedin: form.linkedin.value.trim()
      },  
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

  // Load and render subscribers
  async function loadSubscribers() {
    const list = document.getElementById('subscriberList');
    list.innerHTML = '<li>Loading subscribers…</li>';
    try {
      const res = await api('/profile/subscribers');
      const users = await res.json();
      if (!users.length) {
        list.innerHTML = '<li>No subscribers yet.</li>';
        return;
      }
      list.innerHTML = users.map(u => `
        <li>
          <img src="${u.avatar ? `https://cdn.discordapp.com/avatars/${u.discord_id}/${u.avatar}.png` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;margin-right:8px;">
          <strong>${u.username || u.email || u.discord_id}</strong>
        </li>
      `).join('');
    } catch (err) {
      list.innerHTML = '<li>Failed to load subscribers.</li>';
    }
  }

  // Load and render invited users
  async function loadInvited() {
    const list = document.getElementById('inviteList');
    list.innerHTML = '<li>Loading invited members…</li>';
    try {
      const res = await api('/profile/invited');
      const users = await res.json();
      if (!users.length) {
        list.innerHTML = '<li>No invited users yet.</li>';
        return;
      }
      list.innerHTML = users.map(u => `
        <li>
          <img src="${u.avatar ? `https://cdn.discordapp.com/avatars/${u.discord_id}/${u.avatar}.png` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;margin-right:8px;">
          <strong>${u.username || u.email || u.discord_id}</strong>
        </li>
      `).join('');
    } catch (err) {
      list.innerHTML = '<li>Failed to load invited users.</li>';
    }
  }

  // Tab navigation: load data when switching to Subscribers or Invites
  tabs.forEach(t => t.addEventListener('click', () => {
    if (t.dataset.tab === 'subscribers') loadSubscribers();
    if (t.dataset.tab === 'invites') loadInvited();
  }));

  // Initial load
  await loadCoachData();

  // Exclusive Video Upload Logic
  const exclusiveForm = document.getElementById('exclusiveUploadForm');
  const exclusiveStatus = document.getElementById('exclusiveUploadStatus');

  if (exclusiveForm) {
    exclusiveForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      exclusiveStatus.textContent = '';
      const title = document.getElementById('exclusiveTitle').value.trim();
      const description = document.getElementById('exclusiveDescription').value.trim();
      const niche = document.getElementById('exclusiveNiche').value.trim();
      const fileInput = document.getElementById('exclusiveVideo');
      const file = fileInput.files[0];
      if (!title || !niche || !file) {
        exclusiveStatus.textContent = 'Please fill all required fields.';
        return;
      }
      // Step 1: Create upload session on backend
      let uploadUrl, contentId;
      try {
        const res = await fetch('/api/coach/exclusive-content/upload', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + (localStorage.getItem('coachToken') || ''),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, description, niche })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create upload');
        uploadUrl = data.uploadUrl;
        contentId = data.contentId;
      } catch (err) {
        exclusiveStatus.textContent = 'Error: ' + err.message;
        return;
      }
      // Step 2: Upload video file directly to Mux
      exclusiveStatus.textContent = 'Uploading video to Mux...';
      try {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type
          },
          body: file
        });
        if (!uploadRes.ok) throw new Error('Mux upload failed');
        exclusiveStatus.textContent = 'Upload complete! Your video will be available after processing.';
        exclusiveForm.reset();
      } catch (err) {
        exclusiveStatus.textContent = 'Mux upload error: ' + err.message;
      }
    });
  }
});
