(() => {
  'use strict';
  // Firebase is initialized by firebase-config.js before this script.
  const firebaseReady = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
  const auth = firebaseReady ? firebase.auth() : null;
  const db = firebaseReady ? firebase.firestore() : null;
  let authActionInProgress = false;
  let authStateReady = false;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let currentEmail = '';
  let currentUid = '';
  let currentUser = null;
  let authMode = 'signup';
  let activeWorkout = null;
  let generatedWorkout = null;
  let toastTimer = null;

  const ranks = [
    { name: 'Seedling', min: 0, icon: '🌱', color: '#6b9b62', bg: '#eaf4e7', title: 'Every journey starts somewhere.' },
    { name: 'Sprout', min: 150, icon: '🍃', color: '#65975d', bg: '#edf5e8', title: 'Your habits are taking root.' },
    { name: 'Kindling', min: 400, icon: '🪵', color: '#bf7838', bg: '#fff0e1', title: 'You are building momentum.' },
    { name: 'Flamekeeper', min: 800, icon: '🔥', color: '#e47b24', bg: '#fff0df', title: 'Consistency is becoming a habit.' },
    { name: 'Wildfire', min: 1400, icon: '🌋', color: '#d85b35', bg: '#ffebe4', title: 'Your effort is adding up.' },
    { name: 'Phoenix', min: 2200, icon: '🪽', color: '#a96cbe', bg: '#f6eafa', title: 'A new level of consistency.' },
    { name: 'Legend', min: 3300, icon: '👑', color: '#c29425', bg: '#fff7dc', title: 'A journey built one session at a time.' }
  ];

  const baseWorkouts = [
    { id: 'upper-foundation', title: 'Upper body foundation', category: 'Upper body', duration: 35, level: 'Steady', icon: '💪', description: 'A balanced push-and-pull session for your upper body.', exercises: [
      ex('Push-ups', '3 sets', '8–15 reps'), ex('Backpack rows', '3 sets', '10–15 each side'), ex('Pike push-ups', '2 sets', '6–10 reps'), ex('Biceps curls', '2 sets', '10–15 reps'), ex('Reverse snow angels', '2 sets', '10–12 reps')
    ]},
    { id: 'upper-arms', title: 'Arms & chest focus', category: 'Upper body', duration: 30, level: 'Steady', icon: '⚡', description: 'A focused session for chest, triceps, and biceps.', exercises: [
      ex('Push-ups', '3 sets', '8–15 reps'), ex('Diamond push-ups', '2 sets', '6–12 reps'), ex('One-arm backpack rows', '3 sets', '10–15 each side'), ex('Biceps curls', '2 sets', '10–15 reps'), ex('Triceps extensions', '2 sets', '10–15 reps')
    ]},
    { id: 'pull-posture', title: 'Back & posture', category: 'Upper body', duration: 30, level: 'Steady', icon: '🪽', description: 'Train your back and the muscles that support your shoulders.', exercises: [
      ex('One-arm backpack rows', '3 sets', '10–15 each side'), ex('Reverse snow angels', '3 sets', '10–12 reps'), ex('Backpack curls', '2 sets', '10–15 reps'), ex('Bird dogs', '2 sets', '8 each side')
    ]},
    { id: 'lower-strength', title: 'Lower body strength', category: 'Lower body', duration: 35, level: 'Steady', icon: '🦵', description: 'A balanced lower-body session with single-leg work.', exercises: [
      ex('Squats', '3 sets', '10–15 reps'), ex('Reverse lunges', '3 sets', '8–12 each leg'), ex('Glute bridges', '3 sets', '12–15 reps'), ex('Calf raises', '3 sets', '12–20 reps'), ex('Bird dogs', '2 sets', '8 each side')
    ]},
    { id: 'lower-control', title: 'Legs & control', category: 'Lower body', duration: 30, level: 'Steady', icon: '🌿', description: 'Controlled leg work with balance and stability.', exercises: [
      ex('Tempo squats', '3 sets', '8–12 reps'), ex('Reverse lunges', '2 sets', '8–10 each leg'), ex('Single-leg glute bridges', '2 sets', '10 each leg'), ex('Calf raises', '3 sets', '15–20 reps')
    ]},
    { id: 'full-body', title: 'Full body reset', category: 'Full body', duration: 40, level: 'Steady', icon: '✨', description: 'A little of everything in one balanced session.', exercises: [
      ex('Squats', '3 sets', '10–15 reps'), ex('Push-ups', '3 sets', '8–12 reps'), ex('Backpack rows', '3 sets', '10–15 each side'), ex('Reverse lunges', '2 sets', '8 each leg'), ex('Plank', '2 sets', '20–40 seconds')
    ]},
    { id: 'core-control', title: 'Core control', category: 'Core', duration: 20, level: 'All levels', icon: '🎯', description: 'Build trunk stability with controlled movements.', exercises: [
      ex('Dead bugs', '3 sets', '8–10 each side'), ex('Reverse crunches', '3 sets', '10–15 reps'), ex('Bird dogs', '2 sets', '8–10 each side'), ex('Plank', '2 sets', '20–40 seconds')
    ]},
    { id: 'mobility-reset', title: 'Mobility & reset', category: 'Full body', duration: 15, level: 'All levels', icon: '☁️', description: 'A light movement day for comfortable mobility.', exercises: [
      ex('Cat-cow', '2 sets', '8 slow reps'), ex('World’s greatest stretch', '2 sets', '5 each side'), ex('Bodyweight good mornings', '2 sets', '10 reps'), ex('Easy march in place', '2 sets', '60 seconds')
    ]}
  ];
  function ex(name, sets, reps) { return { name, sets, reps }; }

  function defaultChallenges() {
    return [
      { id: 'first-session', name: 'Show up for a session', target: 1, unit: 'workouts', progress: 0, xp: 40, type: 'workouts', custom: false },
      { id: 'three-sessions', name: 'Build a rhythm', target: 3, unit: 'workouts', progress: 0, xp: 60, type: 'workouts', custom: false },
      { id: 'xp-starter', name: 'Collect 150 XP', target: 150, unit: 'XP', progress: 0, xp: 50, type: 'xp', custom: false },
      { id: 'push-practice', name: 'Push-up practice', target: 30, unit: 'reps', progress: 0, xp: 35, type: 'manual', custom: false }
    ];
  }

  // Cloud profile data is stored at users/{uid}; passwords are handled only by Firebase Auth.
  function saveCurrent() {
    if (!currentUser || !currentUid || !db) return Promise.resolve();
    const payload = { ...currentUser, email: currentEmail, updatedAt: new Date().toISOString() };
    return db.collection('users').doc(currentUid).set(payload, { merge: true })
      .catch(err => { console.error('Could not save profile to Firestore:', err); toast('Could not sync progress. Check your connection and Firebase rules.'); });
  }
  function safeName(value) { return String(value || '').trim().slice(0, 24) || 'Athlete'; }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  }
  function randomSalt() {
    if (window.crypto && crypto.getRandomValues) { const arr = new Uint8Array(16); crypto.getRandomValues(arr); return [...arr].map(v => v.toString(16).padStart(2,'0')).join(''); }
    return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  async function hashPassword(password, salt) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 90000, hash: 'SHA-256' }, key, 256);
      return [...new Uint8Array(bits)].map(v => v.toString(16).padStart(2,'0')).join('');
    }
    let hash = 2166136261; const input = salt + password;
    for (let pass=0; pass<5000; pass++) for (let i=0;i<input.length;i++) { hash ^= input.charCodeAt(i) + pass; hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(16);
  }
  function makeUser(email, name) {
    return { email, name: safeName(name || email.split('@')[0]), goal: 'Build strength', xp: 0, workoutXp: 0, challengeXp: 0, logs: [], challenges: defaultChallenges(), savedWorkouts: [], createdAt: new Date().toISOString() };
  }
  function showAuth(message='') {
    $('#authScreen').classList.remove('hidden'); $('#app').classList.add('hidden'); $('#authMessage').textContent = message;
  }
  function setAuthMode(mode) {
    authMode = mode;
    $$('.auth-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.authMode === mode));
    $('#nameField').classList.toggle('hidden', mode === 'login');
    $('#authSubmit').innerHTML = mode === 'signup' ? 'Create my account <span>→</span>' : 'Log in <span>→</span>';
    $('#authPassword').setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
    $('#authMessage').textContent = '';
  }
  async function handleAuth(event) {
    event.preventDefault();
    if (!firebaseReady) { $('#authMessage').textContent = 'Firebase is not configured yet. Add your project settings to firebase-config.js.'; return; }
    const email = $('#authEmail').value.trim().toLowerCase();
    const password = $('#authPassword').value;
    const name = safeName($('#authName').value || email.split('@')[0]);
    $('#authSubmit').disabled = true;
    authActionInProgress = true;
    try {
      if (!email || !email.includes('@')) throw new Error('Enter a valid email address.');
      if (password.length < 6) throw new Error('Use a password with at least 6 characters.');
      let credential;
      if (authMode === 'signup') {
        credential = await auth.createUserWithEmailAndPassword(email, password);
        const user = makeUser(email, name);
        await db.collection('users').doc(credential.user.uid).set({ ...user, email, name, uid: credential.user.uid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        currentUid = credential.user.uid; currentEmail = email; currentUser = user;
      } else {
        credential = await auth.signInWithEmailAndPassword(email, password);
        currentUid = credential.user.uid; currentEmail = credential.user.email || email;
        const snap = await db.collection('users').doc(currentUid).get();
        if (snap.exists) currentUser = { ...makeUser(currentEmail, snap.data().name), ...snap.data() };
        else { currentUser = makeUser(currentEmail, credential.user.displayName || email.split('@')[0]); await saveCurrent(); }
      }
      $('#authPassword').value = '';
      authActionInProgress = false;
      launchApp();
    } catch (err) {
      authActionInProgress = false;
      const messages = {
        'auth/email-already-in-use': 'An account already exists for this email. Try logging in.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
        'auth/user-not-found': 'No account was found for that email. Create an account first.',
        'auth/wrong-password': 'That email and password do not match.',
        'auth/invalid-credential': 'That email and password do not match.',
        'auth/operation-not-allowed': 'Enable Email/Password in Firebase Authentication settings.',
        'permission-denied': 'Firestore blocked the request. Check that you published the included security rules.'
      };
      $('#authMessage').textContent = messages[err.code] || err.message || 'Something went wrong. Please try again.';
    } finally { $('#authSubmit').disabled = false; }
  }
  function launchApp() {
    if (!currentUser || !currentUid) { showAuth(); return; }
    $('#authScreen').classList.add('hidden'); $('#app').classList.remove('hidden');
    refreshAutoChallenges();
    saveCurrent();
    renderAll();
    goPage('home');
  }
  async function signOut() {
    try { await saveCurrent(); if (auth) await auth.signOut(); }
    catch (err) { console.error('Sign out issue:', err); }
    currentUser = null; currentEmail = ''; currentUid = '';
    showAuth(); toast('You have signed out.');
  }

  function localDateKey(date = new Date()) {
    const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }
  function parseKey(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d); }
  function dayDiff(a,b) { return Math.round((parseKey(b)-parseKey(a))/86400000); }
  function uniqueWorkoutDays() { return [...new Set((currentUser?.logs || []).map(log => log.dateKey))].sort(); }
  function getStreak() {
    const days = uniqueWorkoutDays(); if (!days.length) return 0;
    const today = localDateKey(); let cursor = days.includes(today) ? today : localDateKey(new Date(Date.now()-86400000));
    if (!days.includes(cursor)) return 0;
    let count=0; while (days.includes(cursor)) { count++; const prev = new Date(parseKey(cursor).getTime()-86400000); cursor = localDateKey(prev); }
    return count;
  }
  function getWeekStart(date = new Date()) { const d = new Date(date); d.setHours(0,0,0,0); const offset = (d.getDay()+6)%7; d.setDate(d.getDate()-offset); return d; }
  function weekLogs() { const start=getWeekStart(); const end=new Date(start); end.setDate(end.getDate()+7); return (currentUser?.logs||[]).filter(log => { const d=parseKey(log.dateKey); return d>=start && d<end; }); }
  function currentRank(xp=currentUser?.xp||0) { let rank=ranks[0]; for (const item of ranks) if (xp>=item.min) rank=item; return rank; }
  function nextRank(xp=currentUser?.xp||0) { return ranks.find(item => item.min>xp) || null; }
  function currentLevel(xp=currentUser?.xp||0) { return Math.floor(xp/250)+1; }
  function refreshAutoChallenges() {
    if (!currentUser) return;
    if (!Array.isArray(currentUser.challenges)) currentUser.challenges = defaultChallenges();
    const workoutCount = currentUser.logs.length;
    const streak = getStreak();
    currentUser.challenges.forEach(ch => {
      if (ch.type === 'workouts') ch.progress = Math.min(ch.target, workoutCount);
      if (ch.type === 'xp') ch.progress = Math.min(ch.target, currentUser.xp);
      if (ch.type === 'streak') ch.progress = Math.min(ch.target, streak);
    });
  }
  function awardChallengeRewards() {
    if (!currentUser) return;
    currentUser.challenges.forEach(ch => {
      if (ch.progress >= ch.target && !ch.claimed) {
        ch.claimed = true; currentUser.xp += Number(ch.xp||0); currentUser.challengeXp += Number(ch.xp||0);
        toast(`Challenge complete! +${ch.xp} XP`);
      }
    });
  }
  function toast(message) {
    const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
  }
  const pageTitles = { home:'Good to see you', workouts:'Workout library', roadmap:'Your rank roadmap', generator:'Workout generator', challenges:'Challenges', progress:'Your progress', profile:'Your profile' };
  function goPage(page) {
    if (!pageTitles[page]) return;
    $$('.page').forEach(el=>el.classList.toggle('active',el.id===`page-${page}`));
    $$('.nav-item[data-page],.mobile-nav [data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
    $('#pageTitle').innerHTML = `${pageTitles[page]}<span class="title-period">.</span>`;
    $('#todayLabel').textContent = page==='home' ? 'YOUR DAILY RESET' : 'YOUR TRAINING JOURNEY';
    window.scrollTo({top:0,behavior:'smooth'});
    if (page==='profile') renderProfile();
  }

  function renderUserBits() {
    const rank=currentRank(); const avatar=`<span class="tiny-avatar">${rank.icon}</span>`;
    $('#sideUser').innerHTML=`${avatar}<div><strong>${escapeHtml(currentUser.name)}</strong><small>Level ${currentLevel()} · ${escapeHtml(rank.name)}</small></div>`;
    $('#topUser').innerHTML=`<span class="tiny-avatar">${rank.icon}</span><span>${escapeHtml(currentUser.name)}</span>`;
  }
  function renderDashboard() {
    const xp=currentUser.xp||0; const rank=currentRank(xp); const next=nextRank(xp);
    $('#streakValue').textContent=getStreak(); $('#xpValue').textContent=xp; $('#levelValue').textContent=`Level ${currentLevel(xp)}`;
    $('#rankValue').textContent=rank.name; $('#rankNext').textContent=next?`${next.min-xp} XP to ${next.name}`:'Top rank unlocked';
    $('#homeRankBadge').textContent=rank.icon; $('#homeRankBadge').style.background=rank.bg; $('#homeRankBadge').style.color=rank.color;
    const count=weekLogs().length; $('#weekCount').textContent=`${Math.min(count,3)}/3`; $('#weekRing').style.setProperty('--ring-progress',`${Math.min(count/3,1)*100}%`);
    $('#weekSummary').textContent=count>=3?'Weekly goal reached!':count===0?'Your week is waiting.':`${3-count} more session${3-count===1?'':'s'} to your weekly goal.`;
    $('#weekSub').textContent=count?`${count} workout${count===1?'':'s'} completed this week.`:'Complete a workout to start your weekly progress.';
    const start=getWeekStart(); const today=new Date();
    $('#weekDays').innerHTML=['M','T','W','T','F','S','S'].map((label,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);const key=localDateKey(d);const done=(currentUser.logs||[]).some(l=>l.dateKey===key);const isToday=key===localDateKey();return `<div class="day-column"><span>${label}</span><span class="day-dot ${done?'done':isToday?'today':''}">${done?'✓':isToday?'•':''}</span></div>`}).join('');
    const cycle=(currentUser.logs.length)%3; const focus=cycle===0?'Upper body focus':cycle===1?'Legs & core focus':'Recovery day';
    $('#todayFocusTitle').textContent=focus; $('#todayFocusText').textContent=cycle===2?'You have earned a recovery day. Take a walk, stretch gently, and come back refreshed.':'Build strength and control with a balanced session you can complete at home.';
    $('#startTodayBtn').textContent=cycle===2?'View your progress':'Start workout →'; $('#startTodayBtn').dataset.action=cycle===2?'progress':'start';
    renderHomeChallenges(); renderQuickWorkouts();
  }
  function renderHomeChallenges() {
    const list=currentUser.challenges.filter(ch=>!ch.custom || !ch.claimed).slice(0,4);
    $('#homeChallenges').innerHTML=list.map(ch=>{const percent=Math.min(100,(ch.progress/ch.target)*100);const icon=ch.unit==='reps'?'↗':ch.unit==='minutes'?'◷':ch.unit==='XP'?'★':'✓';return `<article class="challenge-mini"><div class="challenge-art">${icon}</div><strong>${escapeHtml(ch.name)}</strong><small>${Math.min(ch.progress,ch.target)} / ${ch.target} ${escapeHtml(ch.unit)}</small><div class="mini-track"><span style="width:${percent}%"></span></div></article>`}).join('')||'<p class="muted">Create your first challenge to get started.</p>';
  }
  function renderQuickWorkouts() {
    const items=[baseWorkouts[0],baseWorkouts[3],baseWorkouts[5]];
    $('#quickWorkouts').innerHTML=items.map(w=>`<button class="quick-workout" data-workout="${w.id}"><span class="workout-emoji">${w.icon}</span><span><strong>${escapeHtml(w.title)}</strong><small>${w.duration} min · ${w.category}</small></span></button>`).join('');
  }
  function getAllWorkouts() { return [...baseWorkouts,...(currentUser.savedWorkouts||[])]; }
  let workoutFilter='All';
  function renderWorkoutLibrary() {
    const all=getAllWorkouts().filter(w=>workoutFilter==='All'||w.category===workoutFilter);
    $('#workoutGrid').innerHTML=all.map(w=>`<article class="workout-card"><div class="workout-top"><span class="workout-icon">${w.icon||'✦'}</span><span class="workout-tag">${escapeHtml(w.level||'Custom')}</span></div><h3>${escapeHtml(w.title)}</h3><p>${escapeHtml(w.description||'A custom session built for your training journey.')}</p><div class="workout-meta"><span>◷ ${w.duration||30} min</span><span>▤ ${w.exercises.length} exercises</span></div><button class="btn soft wide" data-workout="${escapeHtml(w.id)}">View session →</button></article>`).join('')||'<div class="panel"><p class="muted">No workouts in this category yet.</p></div>';
  }
  function renderRoadmap() {
    const xp=currentUser.xp||0;const rank=currentRank(xp);const next=nextRank(xp);
    $('#roadmapCurrent').innerHTML=`<span>${rank.icon}</span> ${rank.name}`;
    if(next){const prev=rank.min;const progress=Math.max(0,Math.min(100,((xp-prev)/(next.min-prev))*100));$('#nextRankTitle').textContent=next.name;$('#nextRankCopy').textContent=next.title;$('#rankProgressBar').style.width=`${progress}%`;$('#rankProgressText').textContent=`${xp-prev} / ${next.min-prev} XP toward ${next.name}`;$('#nextRankBadge').textContent=next.icon;}else{$('#nextRankTitle').textContent='Every rank unlocked';$('#nextRankCopy').textContent='You reached the final badge. Keep training for your own progress.';$('#rankProgressBar').style.width='100%';$('#rankProgressText').textContent=`${xp} XP earned`;$ ('#nextRankBadge').textContent='👑';}
    $('#roadmapList').innerHTML=ranks.map((r,i)=>{const unlocked=xp>=r.min;const upcoming=ranks[i+1];return `<article class="roadmap-step ${unlocked?'unlocked':'locked'}"><div class="roadmap-medal" style="--badge-bg:${r.bg};--badge-color:${r.color}">${unlocked?r.icon:'🔒'}</div><div><h3>${r.name}</h3><p>${r.title}</p></div><span class="step-xp">${unlocked?'✓ Unlocked':`${r.min.toLocaleString()} XP`}</span></article>`}).join('');
  }
  function renderChallenges() {
    $('#challengeList').innerHTML=currentUser.challenges.map(ch=>{const value=Math.min(ch.progress,ch.target);const percent=Math.min(100,value/ch.target*100);return `<article class="challenge-item ${ch.claimed?'complete':''}" data-challenge-id="${escapeHtml(ch.id)}"><div class="challenge-item-head"><div><h3>${escapeHtml(ch.name)}</h3><p>${ch.custom?'Personal challenge':'Arc challenge'} · Reward ${ch.xp} XP</p></div><span class="challenge-xp">${ch.claimed?'✓ Claimed':`+${ch.xp} XP`}</span></div><div class="challenge-progress-row"><span>Progress</span><strong>${value} / ${ch.target} ${escapeHtml(ch.unit)}</strong></div><div class="progress-track"><span style="width:${percent}%"></span></div>${ch.type==='manual'&&!ch.claimed?`<div class="challenge-controls"><button data-challenge-add="5" aria-label="Add five">+5</button><button data-challenge-add="10" aria-label="Add ten">+10</button><button data-challenge-add="1" aria-label="Add one">+1</button></div>`:''}${ch.custom?`<div class="challenge-controls"><button data-delete-challenge="${escapeHtml(ch.id)}">Remove challenge</button></div>`:''}</article>`}).join('');
  }
  function renderProgress() {
    const logs=currentUser.logs;const count=logs.length;const week=weekLogs().length;const xp=currentUser.xp||0;const rank=currentRank(xp);const n=nextRank(xp);
    $('#progressStats').innerHTML=[['WORKOUTS COMPLETED',count],['THIS WEEK',week],['DAY STREAK',getStreak()],['CURRENT LEVEL',currentLevel()]].map(([label,value])=>`<div class="progress-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
    $('#activityList').innerHTML=logs.slice().reverse().slice(0,8).map(log=>`<div class="activity-row"><span class="activity-symbol">${escapeHtml(log.icon||'✦')}</span><div><strong>${escapeHtml(log.title)}</strong><small>${escapeHtml(log.dateLabel)} · ${log.completedExercises}/${log.exerciseCount} exercises</small></div><span class="activity-xp">+${log.xp} XP</span></div>`).join('')||'<div class="empty-activity">No workouts logged yet. Your first session will show up here.</div>';
    $('#progressXp').textContent=xp;const levelStart=(currentLevel()-1)*250;const levelPct=((xp-levelStart)/250)*100;$('#xpProgressBar').style.width=`${levelPct}%`;$('#xpProgressCaption').textContent=`${250-(xp-levelStart)} XP until level ${currentLevel()+1}. Current rank: ${rank.name}${n?` · ${n.name} at ${n.min} XP`:''}`;
    $('#workoutXp').textContent=`${currentUser.workoutXp||0} XP`;$('#challengeXp').textContent=`${currentUser.challengeXp||0} XP`;
  }
  function renderProfile() {
    const rank=currentRank();$('#profileAvatar').textContent=rank.icon;$('#profileName').textContent=currentUser.name;$('#profileEmail').textContent=currentEmail;$('#profileNameInput').value=currentUser.name;$('#profileGoal').value=currentUser.goal||'Build strength';
    $('#profileRankRow').innerHTML=`<span class="profile-rank-chip">${rank.icon} ${rank.name} · Level ${currentLevel()}</span>`;
    $('#profileNumbers').innerHTML=`<div><strong>${currentUser.xp}</strong><span>Total XP</span></div><div><strong>${currentUser.logs.length}</strong><span>Workouts</span></div><div><strong>${getStreak()}</strong><span>Day streak</span></div>`;
  }
  function renderAll() {
    renderUserBits(); renderDashboard(); renderWorkoutLibrary(); renderRoadmap(); renderChallenges(); renderProgress(); renderProfile();
    const now=new Date();$('#todayLabel').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
  }

  function openSession(workout) {
    if (!workout || !Array.isArray(workout.exercises)) return;
    activeWorkout=workout;
    $('#sessionTitle').textContent=workout.title;$('#sessionSub').textContent=workout.description||'Check off each exercise as you complete it.';
    $('#sessionMeta').innerHTML=`<span class="meta-pill">◷ ${workout.duration||30} min</span><span class="meta-pill">▤ ${workout.exercises.length} exercises</span><span class="meta-pill">${escapeHtml(workout.category||'Custom')}</span>`;
    $('#sessionExercises').innerHTML=workout.exercises.map((item,i)=>`<label class="session-exercise"><input type="checkbox" data-session-check="${i}"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.sets)} · ${escapeHtml(item.reps)}</small></span></label>`).join('');
    $('#sessionCount').textContent=`0 / ${workout.exercises.length} exercises complete`;$('#sessionMessage').textContent='';$('#finishWorkoutBtn').disabled=false;
    $('#sessionModal').classList.remove('hidden');
  }
  function finishWorkout() {
    if (!activeWorkout) return;
    const checked=$$('[data-session-check]:checked').length;
    if (checked===0) { $('#sessionMessage').textContent='Check off at least one exercise before completing your session.';return; }
    const total=activeWorkout.exercises.length;const full=checked===total;const gained=30+(checked*7)+(full?15:0);
    currentUser.xp=(currentUser.xp||0)+gained;currentUser.workoutXp=(currentUser.workoutXp||0)+gained;
    const now=new Date();currentUser.logs.push({id:`log-${Date.now()}`,title:activeWorkout.title,category:activeWorkout.category||'Custom',icon:activeWorkout.icon||'✦',dateKey:localDateKey(now),dateLabel:now.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}),completedExercises:checked,exerciseCount:total,xp:gained});
    currentUser.logs=currentUser.logs.slice(-150);
    refreshAutoChallenges();awardChallengeRewards();refreshAutoChallenges();saveCurrent();$('#sessionModal').classList.add('hidden');activeWorkout=null;renderAll();toast(`Workout saved! +${gained} XP${full?' · Session complete!':''}`);
  }

  const exerciseBank = {
    'Upper body': [
      { name:'Push-ups', sets:3, reps:'8–15 reps', equipment:'bodyweight' },{ name:'Pike push-ups',sets:2,reps:'6–10 reps',equipment:'bodyweight'},{name:'Backpack rows',sets:3,reps:'10–15 each side',equipment:'home'},{name:'Biceps curls',sets:2,reps:'10–15 reps',equipment:'home'},{name:'Reverse snow angels',sets:2,reps:'10–12 reps',equipment:'bodyweight'},{name:'Diamond push-ups',sets:2,reps:'6–12 reps',equipment:'bodyweight'},{name:'One-arm backpack rows',sets:3,reps:'10–15 each side',equipment:'home'},{name:'Triceps extensions',sets:2,reps:'10–15 reps',equipment:'home'}
    ],
    'Lower body': [
      {name:'Bodyweight squats',sets:3,reps:'10–15 reps',equipment:'bodyweight'},{name:'Backpack squats',sets:3,reps:'8–12 reps',equipment:'home'},{name:'Reverse lunges',sets:3,reps:'8–12 each leg',equipment:'bodyweight'},{name:'Glute bridges',sets:3,reps:'12–15 reps',equipment:'bodyweight'},{name:'Backpack Romanian deadlifts',sets:3,reps:'10–15 reps',equipment:'home'},{name:'Calf raises',sets:3,reps:'12–20 reps',equipment:'bodyweight'}
    ],
    'Full body': [
      {name:'Squats',sets:3,reps:'10–15 reps',equipment:'bodyweight'},{name:'Push-ups',sets:3,reps:'8–15 reps',equipment:'bodyweight'},{name:'Backpack rows',sets:3,reps:'10–15 each side',equipment:'home'},{name:'Reverse lunges',sets:2,reps:'8–10 each leg',equipment:'bodyweight'},{name:'Glute bridges',sets:2,reps:'12–15 reps',equipment:'bodyweight'},{name:'Plank',sets:2,reps:'20–40 seconds',equipment:'bodyweight'}
    ],
    'Core': [
      {name:'Dead bugs',sets:3,reps:'8–10 each side',equipment:'bodyweight'},{name:'Reverse crunches',sets:3,reps:'10–15 reps',equipment:'bodyweight'},{name:'Bird dogs',sets:2,reps:'8–10 each side',equipment:'bodyweight'},{name:'Plank',sets:2,reps:'20–40 seconds',equipment:'bodyweight'},{name:'Side plank',sets:2,reps:'15–30 seconds each side',equipment:'bodyweight'}
    ]
  };
  function generateWorkout(event) {
    event.preventDefault();
    const focus=$('#genFocus').value;const mins=Number($('#genTime').value);const equipment=$('#genEquipment').value;const level=$('#genLevel').value;
    const maxItems=mins<=20?4:mins<=30?5:mins<=45?6:7;
    let bank=exerciseBank[focus].filter(item=>equipment==='bodyweight'?item.equipment==='bodyweight':true);
    if (equipment==='home') bank=bank.filter(item=>item.equipment==='home'||item.equipment==='bodyweight');
    if (equipment==='mixed') bank=bank;
    const shuffled=bank.slice().sort(()=>Math.random()-.5).slice(0,Math.min(maxItems,bank.length));
    const exercises=shuffled.map(item=>({name:item.name,sets:level==='new'?Math.max(2,item.sets-1):level==='regular'?item.sets+0:item.sets,reps:item.reps}));
    const title=`${focus} · ${mins} min session`;
    generatedWorkout={id:`generated-${Date.now()}`,title,category:focus,duration:mins,level:level==='regular'?'Regular':'Steady',icon:focus==='Upper body'?'💪':focus==='Lower body'?'🦵':focus==='Core'?'🎯':'✨',description:`A ${mins}-minute ${focus.toLowerCase()} session made for your available equipment.`,exercises};
    renderGenerated();
  }
  function renderGenerated() {
    const w=generatedWorkout;if(!w)return;
    $('#generatedPanel').innerHTML=`<div class="generated-header"><div><p class="eyebrow orange">YOUR GENERATED SESSION</p><h3>${escapeHtml(w.title)}</h3><p>${w.duration} minutes · ${w.exercises.length} exercises · ${escapeHtml(w.level)}</p></div><span class="workout-icon">${w.icon}</span></div>${w.exercises.map((item,i)=>`<div class="generated-exercise"><div><strong>${i+1}. ${escapeHtml(item.name)}</strong><small>${escapeHtml(item.reps)}</small></div><span class="sets">${escapeHtml(item.sets)}</span></div>`).join('')}<div class="generated-actions"><button class="btn primary" id="startGeneratedBtn">Start this workout →</button><button class="btn soft" id="saveGeneratedBtn">＋ Save to library</button><button class="btn soft" id="regenerateBtn">↻ Regenerate</button></div>`;
  }
  function saveGeneratedWorkout() {
    if(!generatedWorkout)return;
    if(!currentUser.savedWorkouts)currentUser.savedWorkouts=[];
    currentUser.savedWorkouts=currentUser.savedWorkouts.filter(w=>w.id!==generatedWorkout.id);
    const saved={...generatedWorkout,id:`saved-${Date.now()}`};currentUser.savedWorkouts.unshift(saved);saveCurrent();renderWorkoutLibrary();toast('Workout saved to your library.');
  }

  function addChallenge(event) {
    event.preventDefault();const name=$('#challengeName').value.trim();const target=Number($('#challengeTarget').value);const unit=$('#challengeUnit').value;
    if(!name||!Number.isFinite(target)||target<1){toast('Add a name and a valid target.');return;}
    currentUser.challenges.push({id:`custom-${Date.now()}`,name,target,unit,progress:0,xp:Math.max(15,Math.min(100,Math.round(target*1.5))),type:'manual',custom:true,claimed:false});saveCurrent();$('#customChallengeForm').reset();$('#challengeTarget').value=20;renderChallenges();renderHomeChallenges();toast('Your custom challenge is ready!');
  }
  function bumpChallenge(card, amount) {
    const id=card.dataset.challengeId;const ch=currentUser.challenges.find(item=>item.id===id);if(!ch||ch.claimed)return;
    ch.progress=Math.min(ch.target,ch.progress+Number(amount));awardChallengeRewards();refreshAutoChallenges();saveCurrent();renderChallenges();renderHomeChallenges();renderRoadmap();renderProgress();
  }
  function resetChallenges() { currentUser.challenges=defaultChallenges();refreshAutoChallenges();saveCurrent();renderChallenges();renderHomeChallenges();toast('Default challenges restored.'); }
  function deleteChallenge(id) { currentUser.challenges=currentUser.challenges.filter(ch=>ch.id!==id);saveCurrent();renderChallenges();renderHomeChallenges();toast('Challenge removed.'); }

  function exportData() {
    const data={app:'Ember Arc',exportedAt:new Date().toISOString(),profile:{name:currentUser.name,email:currentEmail,goal:currentUser.goal,xp:currentUser.xp},logs:currentUser.logs,challenges:currentUser.challenges,savedWorkouts:currentUser.savedWorkouts||[]};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='ember-arc-progress.json';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);toast('Your progress backup was exported.');
  }
  async function deleteAccount() {
    if (!confirm('Delete your Ember Arc profile and workout history from the cloud? This cannot be undone.')) return;
    const uidToDelete = currentUid;
    authActionInProgress = true;
    try {
      const user = auth.currentUser;
      if (user) await user.delete();
      await db.collection('users').doc(uidToDelete).delete();
      currentUser = null; currentEmail = ''; currentUid = '';
      authActionInProgress = false;
      showAuth('Your account and cloud profile were deleted.');
    } catch (err) {
      authActionInProgress = false;
      const message = err.code === 'auth/requires-recent-login'
        ? 'For security, sign out and sign back in, then delete your account again.'
        : (err.message || 'Could not delete the account.');
      toast(message);
    }
  }

  // Event wiring
  $$('.auth-tab').forEach(button=>button.addEventListener('click',()=>setAuthMode(button.dataset.authMode)));
  $('#authForm').addEventListener('submit',handleAuth);
  $$('.nav-item[data-page],.mobile-nav [data-page],.topbar [data-page],.page [data-page]').forEach(button=>button.addEventListener('click',()=>goPage(button.dataset.page)));
  $('#logoutBtn').addEventListener('click',signOut);
  $('#quickAddBtn').addEventListener('click',()=>goPage('workouts'));
  $('#startTodayBtn').addEventListener('click',()=>{if($('#startTodayBtn').dataset.action==='progress'){goPage('progress');return;}const cycle=currentUser.logs.length%3;openSession(baseWorkouts[cycle===1?3:0]);});
  document.addEventListener('click',event=>{
    const workoutButton=event.target.closest('[data-workout]');if(workoutButton){const workout=getAllWorkouts().find(item=>item.id===workoutButton.dataset.workout);if(workout)openSession(workout);}
    if(event.target.closest('[data-close-modal]'))$('#sessionModal').classList.add('hidden');
    const add=event.target.closest('[data-challenge-add]');if(add){const card=add.closest('[data-challenge-id]');if(card)bumpChallenge(card,add.dataset.challengeAdd);}
    const del=event.target.closest('[data-delete-challenge]');if(del)deleteChallenge(del.dataset.deleteChallenge);
    if(event.target.id==='startGeneratedBtn'&&generatedWorkout)openSession(generatedWorkout);
    if(event.target.id==='saveGeneratedBtn')saveGeneratedWorkout();
    if(event.target.id==='regenerateBtn')$('#generatorForm').requestSubmit();
  });
  $('#sessionExercises').addEventListener('change',()=>{const count=$$('[data-session-check]:checked').length;$('#sessionCount').textContent=`${count} / ${activeWorkout?.exercises.length||0} exercises complete`;});
  $('#finishWorkoutBtn').addEventListener('click',finishWorkout);
  $('#workoutFilters').addEventListener('click',event=>{const chip=event.target.closest('[data-filter]');if(!chip)return;workoutFilter=chip.dataset.filter;$$('[data-filter]',$('#workoutFilters')).forEach(el=>el.classList.toggle('active',el===chip));renderWorkoutLibrary();});
  $('#generatorForm').addEventListener('submit',generateWorkout);
  $('#customChallengeForm').addEventListener('submit',addChallenge);
  $('#resetChallengesBtn').addEventListener('click',resetChallenges);
  $('#exportBtn').addEventListener('click',exportData);
  $('#profileForm').addEventListener('submit',event=>{event.preventDefault();currentUser.name=safeName($('#profileNameInput').value);currentUser.goal=$('#profileGoal').value;saveCurrent();renderAll();$('#profileMessage').textContent='Profile saved.';toast('Profile updated.');});
  $('#deleteAccountBtn').addEventListener('click',deleteAccount);
  $('#sessionModal').addEventListener('click',event=>{if(event.target===$('#sessionModal'))$('#sessionModal').classList.add('hidden');});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')$('#sessionModal').classList.add('hidden');});

  // Restore Firebase Authentication session and load the signed-in user's cloud profile.
  if (!firebaseReady) {
    showAuth('Firebase is not configured. Add your web app settings to firebase-config.js, then reload.');
  } else {
    auth.onAuthStateChanged(async user => {
      if (authActionInProgress) return;
      authStateReady = true;
      if (!user) { currentUser = null; currentEmail = ''; currentUid = ''; showAuth(); return; }
      try {
        currentUid = user.uid; currentEmail = user.email || '';
        const ref = db.collection('users').doc(user.uid);
        const snap = await ref.get();
        if (snap.exists) currentUser = { ...makeUser(currentEmail, snap.data().name), ...snap.data() };
        else {
          currentUser = makeUser(currentEmail, user.displayName || currentEmail.split('@')[0]);
          await ref.set({ ...currentUser, uid: user.uid, email: currentEmail, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
        launchApp();
      } catch (err) {
        console.error('Could not load Firebase profile:', err);
        showAuth('Could not load your cloud profile. Check Firestore setup and security rules.');
      }
    });
  }
})();
