// script.js

document.addEventListener("DOMContentLoaded", async function() {
    console.log("⚡ DOMContentLoaded fired – starting initialization");
  
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        console.log("🔖 Tab clicked:", t.dataset.tab);
        window.showTab(t.dataset.tab);
      });
    });
  
    window.showTab = function(tabId) {
      console.log("👉 showTab:", tabId);
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    };
  
    // Load coach data
    const token = new URLSearchParams(window.location.search).get('token');
    console.log("🔑 Retrieved token:", token);
    let courseCompleted = false;
    let profileData = {};
  
    async function loadCoachData() {
      console.log("⏳ Calling /api/profile...");
      try {
        const res = await fetch("/api/profile", {
          headers: { "Authorization": "Bearer " + token }
        });
        console.log("📬 /api/profile status:", res.status);
        profileData = await res.json();
        console.log("📦 profileData:", profileData);
      } catch (err) {
        console.error("❌ Error fetching profile data:", err);
        alert("Failed to load profile data—see console for details.");
        return;
      }
  
      // Greeting
      document.getElementById('welcomeGreeting').textContent = `Welcome, ${profileData.name}`;
  
      // Profile fields
      try {
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
      } catch (err) {
        console.error("⚠️ Error populating form fields:", err);
      }
  
      // Approval & Publish
      const apr = profileData.approved, pub = profileData.published;
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
      console.log("🖼️ Pic upload changed");
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        document.getElementById('profilePic').src = reader.result;
        console.log("👀 Previewing new profile picture");
      };
      reader.readAsDataURL(file);
    });
  
    // Price → Maple conversion
    document.getElementById('usdInput').addEventListener('input', () => {
      const usd = parseFloat(document.getElementById('usdInput').value) || 0;
      const maples = Math.round((usd / 0.3) * 10);
      document.getElementById('mapleDisplay').textContent = maples;
      console.log(`💲 USD ${usd} → 🍁 Maples ${maples}`);
    });
  
    // Save profile
    document.getElementById('saveBtn').addEventListener('click', async () => {
      console.log("💾 Save button clicked");
      const dob = new Date(document.getElementById('birthdate').value);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18 || age > 80) {
        console.warn("🚫 Invalid age:", age);
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
      console.log("📤 Saving data:", data);
  
      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(data)
        });
        console.log("📬 /api/profile POST status:", res.status);
  
        if (res.ok) {
          alert('✅ Profile saved!');
          await loadCoachData();
        } else {
          const errText = await res.text();
          console.error("❌ Save failed:", errText);
          alert('❌ Failed to save profile. See console for details.');
        }
      } catch (err) {
        console.error("🔥 Exception during save:", err);
        alert('❌ Error saving profile. See console for details.');
      }
    });
  
    // Publish profile
    document.getElementById('publishBtn').addEventListener('click', async () => {
      console.log("🚀 Publish button clicked");
      try {
        const res = await fetch('/api/profile/publish', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        console.log("📬 /api/profile/publish status:", res.status);
  
        if (res.ok) {
          alert('🚀 Profile published!');
          await loadCoachData();
        } else {
          const errText = await res.text();
          console.error("❌ Publish failed:", errText);
          alert('❌ Failed to publish profile. See console.');
        }
      } catch (err) {
        console.error("🔥 Exception during publish:", err);
        alert('❌ Error publishing profile. See console.');
      }
    });
  
    // Starter Course navigation
    let currentSlide = 0;
    const slides = document.querySelectorAll('.course-slide');
    document.getElementById('nextBtn').addEventListener('click', () => {
      console.log("➡️ Next slide");
      slides[currentSlide].classList.remove('active');
      currentSlide = Math.min(currentSlide + 1, slides.length - 1);
      slides[currentSlide].classList.add('active');
    });
    document.getElementById('completeCourseBtn').addEventListener('click', () => {
      console.log("✅ Course completed button clicked");
      courseCompleted = true;
      if (profileData.approved) {
        document.getElementById('publishBtn').disabled = false;
      }
      alert("✅ You’ve completed the starter course!");
    });
  
    // Earnings chart rendering
    function renderEarningsChart(data) {
      console.log("📊 Rendering earnings chart, data:", data);
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
    try {
      await loadCoachData();
      console.log("✅ Initialization complete");
    } catch (err) {
      console.error("🚨 Error during initialization:", err);
    }
  });
  