document.addEventListener("DOMContentLoaded", function() {
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        window.showTab(t.dataset.tab);
      });
    });
  
    window.showTab = function(tabId) {
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    };
  
    // Load coach data
    const token = new URLSearchParams(window.location.search).get('token');
    let courseCompleted = false;
    let profileData = {};
  
    async function loadCoachData() {
      const res = await fetch("/api/profile", {
        headers: { "Authorization": "Bearer " + token }
      });
      profileData = await res.json();
  
      // Greeting
      document.getElementById('welcomeGreeting').textContent = `Welcome, ${profileData.name}`;
  
      // Profile fields
      if (profileData.profile_picture) {
        document.getElementById('profilePic').src = profileData.profile_picture;
      }
      if (profileData.birthdate) {
        document.getElementById('birthdate').value = profileData.birthdate.split('T')[0];
      }
      document.querySelector("[name='bio']").value = profileData.bio || "";
      document.querySelector("[name='specialties']").value = (profileData.specialties || []).join(', ');
      document.querySelector("[name='experience']").value = profileData.experience || "";
      document.querySelector("[name='instagram']").value = profileData.social_links.instagram || "";
      document.querySelector("[name='twitter']").value = profileData.social_links.twitter || "";
      document.querySelector("[name='linkedin']").value = profileData.social_links.linkedin || "";
      document.querySelector("[name='discordTag']").value = profileData.social_links.discord || "";
      document.querySelector("[name='paypal']").value = profileData.paypal || "";
      document.getElementById('usdInput').value = profileData.monthly_price_usd || 0;
      document.getElementById('usdInput').dispatchEvent(new Event('input'));
  
      // Approval & Publish
      const apr = profileData.approved;
      const pub = profileData.published;
      const statusDiv = document.getElementById('approvalStatus');
      const publishBtn = document.getElementById('publishBtn');
      if (!apr) {
        statusDiv.textContent = "⏳ Awaiting approval by Nevengi team";
        publishBtn.disabled = true;
      } else if (apr && !pub) {
        statusDiv.textContent = "✅ Approved: Ready to publish";
        publishBtn.disabled = false;
      } else {
        statusDiv.textContent = "🚀 Profile Published";
        publishBtn.disabled = true;
      }
  
      // Subscribers
      const subs = profileData.subscribers || [];
      const subList = document.getElementById('subscriberList');
      subList.innerHTML = subs.length
        ? subs.map(u => `<li>${u.username} (${u.date})</li>`).join('')
        : '<li>No subscribers yet</li>';
  
      // Invites
      const invs = profileData.invites || [];
      const invList = document.getElementById('inviteList');
      invList.innerHTML = invs.length
        ? invs.map(u => `<li>${u.username} joined ${u.date}</li>`).join('')
        : '<li>No invited members yet</li>';
  
      // Earnings chart
      renderEarningsChart(profileData.earnings || []);
    }
  
    // Profile picture upload preview
    document.getElementById('picUpload').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        document.getElementById('profilePic').src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  
    // Price → Maple conversion
    document.getElementById('usdInput').addEventListener('input', () => {
      const usd = parseFloat(document.getElementById('usdInput').value) || 0;
      const maples = Math.round((usd / 0.3) * 10);
      document.getElementById('mapleDisplay').textContent = maples;
    });
  
    // Save profile
    document.getElementById('saveBtn').addEventListener('click', async () => {
      const dob = new Date(document.getElementById('birthdate').value);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18 || age > 80) {
        return alert('Age must be between 18 and 80');
      }
  
      const form = document.getElementById('profileForm');
      const data = {
        birthdate: form.birthdate.value,
        bio: form.bio.value,
        specialties: form.specialties.value.split(',').map(s => s.trim()),
        experience: form.experience.value,
        social_links: {
          instagram: form.instagram.value,
          twitter: form.twitter.value,
          linkedin: form.linkedin.value,
          discord: form.discordTag.value
        },
        paypal: form.paypal.value,
        monthly_price_usd: parseFloat(form.monthly_price_usd.value),
        monthly_price_maples: Math.round((parseFloat(form.monthly_price_usd.value) / 0.3) * 10),
        profile_picture: document.getElementById('profilePic').src
      };
  
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
      });
  
      if (res.ok) {
        alert('✅ Profile saved!');
        await loadCoachData();
      } else {
        alert('❌ Failed to save profile.');
      }
    });
  
    // Publish profile
    document.getElementById('publishBtn').addEventListener('click', async () => {
      const res = await fetch('/api/profile/publish', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (res.ok) {
        alert('🚀 Profile published!');
        await loadCoachData();
      } else {
        alert('❌ Failed to publish.');
      }
    });
  
    // Starter Course navigation
    let currentSlide = 0;
    const slides = document.querySelectorAll('.course-slide');
    document.getElementById('nextBtn').addEventListener('click', () => {
      slides[currentSlide].classList.remove('active');
      currentSlide = Math.min(currentSlide + 1, slides.length - 1);
      slides[currentSlide].classList.add('active');
    });
    document.getElementById('completeCourseBtn').addEventListener('click', () => {
      courseCompleted = true;
      if (profileData.approved) {
        document.getElementById('publishBtn').disabled = false;
      }
      alert("✅ You’ve completed the starter course!");
    });
  
    // Earnings chart rendering
    function renderEarningsChart(data) {
      const canvas = document.getElementById('earningsChart');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if (!data.length) {
        ctx.fillStyle = '#888';
        ctx.fillText('No earnings data yet', 10, 50);
        return;
      }
      const max = Math.max(...data.map(d => d.amount));
      const barWidth = (canvas.width - 40) / data.length;
      data.forEach((d, i) => {
        const barHeight = (d.amount / max) * (canvas.height - 40);
        ctx.fillStyle = '#008cba';
        ctx.fillRect(20 + i*barWidth, canvas.height - barHeight - 20, barWidth*0.6, barHeight);
        ctx.fillStyle = '#333';
        ctx.fillText(d.month, 20 + i*barWidth, canvas.height - 5);
      });
    }
  
    // Initialize
    loadCoachData();
  });
  