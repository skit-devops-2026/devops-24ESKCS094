/* ---------------- State ---------------- */
  const STORAGE_KEY = 'petpal_care_state_v1';
  const todayStr = new Date().toISOString().slice(0,10);

  const defaultState = {
    date: todayStr,
    meals: { breakfast:false, lunch:false, dinner:false },
    qty: { breakfast:1, lunch:1, dinner:1.5 },
    groom: { brush:false, teeth:false, ears:false, nails:false },
    checklist: { 'c-breakfast':false, 'c-walk':false, 'c-brush':false, 'c-lunch':false, 'c-water':false, 'c-dinner':false },
    walks: { count:0, distanceKm:0, lastWalkText:'—' },
    walkRunning:false,
    walkStartedAt:null,
    streak: 4,
    weekHits: [true, true, false, true, true, false, false] // Mon..Sun-ish demo data, today handled separately
  };

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      if(parsed.date !== todayStr){
        // New day: keep streak/week history, reset today's tasks
        return {
          ...structuredClone(defaultState),
          streak: parsed.streak || 4,
          weekHits: parsed.weekHits || defaultState.weekHits
        };
      }
      return parsed;
    }catch(e){
      return structuredClone(defaultState);
    }
  }

  let state = loadState();

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> t.classList.remove('show'), 1800);
  }

  /* ---------------- Meals ---------------- */
  function renderMeals(){
    document.querySelectorAll('.meal-item').forEach(el=>{
      const key = el.dataset.meal;
      el.classList.toggle('done', state.meals[key]);
      const qtyEl = el.querySelector('.meal-qty');
      const unit = key === 'dinner' ? 'cups' : (state.qty[key] === 1 ? 'cup' : 'cups');
      qtyEl.textContent = `${state.qty[key]} ${unit}`;
    });
    const done = Object.values(state.meals).filter(Boolean).length;
    document.getElementById('mealMeta').textContent = `${done} of 3 meals logged`;
  }

  document.querySelectorAll('.meal-item').forEach(el=>{
    el.addEventListener('click', (e)=>{
      if(e.target.closest('.qty-stepper')) return;
      const key = el.dataset.meal;
      state.meals[key] = !state.meals[key];
      if(state.meals[key]) showToast(`${capitalize(key)} logged 🍖`);
      // keep matching checklist row in sync for breakfast/lunch/dinner
      const map = { breakfast:'c-breakfast', lunch:'c-lunch', dinner:'c-dinner' };
      if(map[key]) state.checklist[map[key]] = state.meals[key];
      save();
      renderAll();
    });
  });

  function stepQty(e, key, delta){
    e.stopPropagation();
    let v = state.qty[key] + delta * 0.5;
    v = Math.max(0.5, Math.min(3, v));
    state.qty[key] = v;
    save();
    renderMeals();
  }

  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------------- Grooming ---------------- */
  function renderGroom(){
    document.querySelectorAll('.groom-item').forEach(el=>{
      const key = el.dataset.groom;
      el.classList.toggle('done', state.groom[key]);
    });
    const done = Object.values(state.groom).filter(Boolean).length;
    document.getElementById('groomMeta').textContent = `${done} of 4 done`;
  }

  document.querySelectorAll('.groom-item').forEach(el=>{
    el.addEventListener('click', ()=>{
      const key = el.dataset.groom;
      state.groom[key] = !state.groom[key];
      if(key === 'brush') state.checklist['c-brush'] = state.groom[key];
      if(state.groom[key]) showToast(`${el.querySelector('span').textContent} ✓`);
      save();
      renderAll();
    });
  });

  /* ---------------- Full checklist ---------------- */
  function renderChecklist(){
    document.querySelectorAll('.check-row').forEach(el=>{
      const key = el.dataset.key;
      el.classList.toggle('done', state.checklist[key]);
    });
    const vals = Object.values(state.checklist);
    const done = vals.filter(Boolean).length;
    document.getElementById('checklistMeta').textContent = `${done} / ${vals.length}`;
    return { done, total: vals.length };
  }

  document.querySelectorAll('.check-row').forEach(el=>{
    el.addEventListener('click', ()=>{
      const key = el.dataset.key;
      state.checklist[key] = !state.checklist[key];
      // sync back to meals / grooming cards where relevant
      const backMap = { 'c-breakfast':['meals','breakfast'], 'c-lunch':['meals','lunch'], 'c-dinner':['meals','dinner'], 'c-brush':['groom','brush'] };
      if(backMap[key]){
        const [group, sub] = backMap[key];
        state[group][sub] = state.checklist[key];
      }
      save();
      renderAll();
    });
  });

  /* ---------------- Progress ring + paw trail ---------------- */
  const RING_CIRC = 2 * Math.PI * 62;

  function renderProgress(){
    const { done, total } = renderChecklist();
    const pct = Math.round((done/total) * 100);

    document.getElementById('ringPct').textContent = pct + '%';
    const offset = RING_CIRC - (pct/100) * RING_CIRC;
    document.getElementById('ringFg').style.strokeDashoffset = offset;

    document.getElementById('trailPct').textContent = pct + '%';

    // paw trail
    const pawRow = document.getElementById('pawRow');
    pawRow.querySelectorAll('.paw').forEach(p=>p.remove());
    const den = pawRow.querySelector('.paw-den');
    for(let i=0;i<total;i++){
      const paw = document.createElement('div');
      paw.className = 'paw' + (i < done ? ' filled' : '');
      paw.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 21c-4-1-8-4.2-8-8.6C4 9 6.5 7 9 8c1 .4 1.6 1.2 3 1.2S13 8.4 14 8c2.5-1 5 1 5 4.4 0 4.4-4 7.6-8 8.6Z" fill="#2C4A3B"/></svg>';
      pawRow.insertBefore(paw, den);
    }

    // full-completion celebration
    if(done === total){
      document.getElementById('encourageBox').innerHTML = '<b>All done! 🎉</b> Every task is checked off for today — great care!';
    } else {
      const remaining = total - done;
      document.getElementById('encourageBox').innerHTML = `<b>Almost there.</b> ${remaining} task${remaining===1?'':'s'} left to finish today's care.`;
    }
  }

  /* ---------------- Walk tracker ---------------- */
  let walkInterval = null;

  function formatClock(ms){
    const total = Math.floor(ms/1000);
    const m = String(Math.floor(total/60)).padStart(2,'0');
    const s = String(total%60).padStart(2,'0');
    return `${m}:${s}`;
  }

  function renderWalk(){
    document.getElementById('walkDist').textContent = state.walks.distanceKm.toFixed(1);
    document.getElementById('walkCount').textContent = state.walks.count;
    document.getElementById('lastWalk').textContent = state.walks.lastWalkText;
    document.getElementById('walkMeta').textContent = state.walks.count > 0
      ? `${state.walks.count} walk${state.walks.count===1?'':'s'} logged today`
      : 'No walk logged yet';

    const btn = document.getElementById('walkBtn');
    btn.textContent = state.walkRunning ? 'End walk' : 'Start walk';
    btn.classList.toggle('active', state.walkRunning);
  }

  function toggleWalk(){
    if(!state.walkRunning){
      state.walkRunning = true;
      state.walkStartedAt = Date.now();
      save();
      startWalkTimer();
      showToast('Walk started 🚶 — have fun!');
    } else {
      const elapsedMs = Date.now() - state.walkStartedAt;
      const minutes = elapsedMs / 60000;
      const estDist = +(minutes * 0.08).toFixed(1); // rough est. ~4.8 km/h pace
      state.walks.count += 1;
      state.walks.distanceKm = +(state.walks.distanceKm + estDist).toFixed(1);
      state.walks.lastWalkText = `${formatClock(elapsedMs)} · ~${estDist} km`;
      state.walkRunning = false;
      state.walkStartedAt = null;
      state.checklist['c-walk'] = true;
      clearInterval(walkInterval);
      document.getElementById('walkClock').textContent = '00:00';
      save();
      renderAll();
      showToast('Walk saved 🐾 nice job!');
      return;
    }
    renderWalk();
  }

  function startWalkTimer(){
    clearInterval(walkInterval);
    walkInterval = setInterval(()=>{
      const elapsed = Date.now() - state.walkStartedAt;
      document.getElementById('walkClock').textContent = formatClock(elapsed);
    }, 1000);
  }

  /* ---------------- Week dots / streak ---------------- */
  function renderWeek(){
    const wrap = document.getElementById('weekDots');
    wrap.innerHTML = '';
    const labels = ['M','T','W','T','F','S','S'];
    const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
    state.weekHits.forEach((hit, i)=>{
      const d = document.createElement('div');
      d.className = 'week-dot' + (hit ? ' hit' : '') + (i === todayIdx ? ' today' : '');
      d.title = labels[i];
      wrap.appendChild(d);
    });
    document.getElementById('streakNum').textContent = state.streak + '🔥';
  }

  /* ---------------- Bulk actions ---------------- */
  function markAllVisible(){
    Object.keys(state.meals).forEach(k => state.meals[k] = true);
    Object.keys(state.groom).forEach(k => state.groom[k] = true);
    Object.keys(state.checklist).forEach(k => state.checklist[k] = true);
    save();
    renderAll();
    showToast('Everything marked done — great job! 🎉');
  }

  function resetDay(){
    if(!confirm("Reset all of today's care tasks?")) return;
    const keepStreak = state.streak, keepWeek = state.weekHits;
    state = structuredClone(defaultState);
    state.streak = keepStreak;
    state.weekHits = keepWeek;
    save();
    renderAll();
    showToast('Today has been reset.');
  }

  /* ---------------- Render all ---------------- */
  function renderAll(){
    renderMeals();
    renderGroom();
    renderProgress();
    renderWalk();
    renderWeek();
  }

  renderAll();
  if(state.walkRunning) startWalkTimer();