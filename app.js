const ROOM_LABEL = 'Raum 008';
const BOOKINGS_KEY = 'bridge_bookings_v4';
const GALLERY_KEY = 'bridge_gallery_v4';
const SESSION_KEY = 'bridge_session_v4';
const USERS_KEY = 'bridge_users_v4';
const WORKSPACE_VIEW_KEY = 'bridge_workspace_view_v4';
const NOTIFICATIONS_KEY = 'bridge_notifications_v4';

const DEFAULT_USERS = [
  { email: 'admin@example.com', password: 'ChangeMe123!', role: 'admin', name: 'System Admin' },
  { email: 'teacher@example.com', password: 'Teacher123!', role: 'teacher', name: 'Lehrkraft' },
  { email: 'mediator@example.com', password: 'Mediator123!', role: 'mediator', name: 'Mediator Team' }
];

const STATUS = {
  new: 'Neu',
  confirmed: 'In Bearbeitung',
  resolved: 'Abgeschlossen',
  cancelled: 'Archiviert'
};

const PRIORITY = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig'
};

const TEAM_META = {
  admin: {
    title: 'Admin',
    description: 'Verwaltet Rollen, Exporte, Galerie und Struktur.',
    gradient: 'accent'
  },
  teacher: {
    title: 'Lehrkraft',
    description: 'Begleitet Fälle, priorisiert und steuert Termine.',
    gradient: 'warning'
  },
  mediator: {
    title: 'Mediator',
    description: 'Moderiert Gespräche und dokumentiert Lösungen.',
    gradient: 'success'
  }
};

const seedDate = new Date();
const plusDays = (n) => {
  const d = new Date(seedDate);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const DEFAULT_BOOKINGS = [
  {
    id: crypto.randomUUID(),
    fullName: 'Aylin Demir',
    className: '7b',
    appointmentDate: plusDays(1),
    breakSlot: '2. Pause',
    priority: 'high',
    category: 'Konflikt',
    concern: 'Spannung im Team nach Gruppenarbeit und wiederholten Missverständnissen.',
    room: ROOM_LABEL,
    status: 'new',
    assignee: '',
    notes: [],
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    fullName: 'Noah Becker',
    className: '5a',
    appointmentDate: plusDays(2),
    breakSlot: '1. Pause',
    priority: 'medium',
    category: 'Mediation',
    concern: 'Nach einem Streit soll ein moderiertes Gespräch mit zwei Beteiligten stattfinden.',
    room: ROOM_LABEL,
    status: 'confirmed',
    assignee: 'Mediator Team',
    notes: ['Gespräch vorbereitet'],
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
  },
  {
    id: crypto.randomUUID(),
    fullName: 'Team Nord',
    className: 'Projektgruppe',
    appointmentDate: plusDays(3),
    breakSlot: 'Nach dem Unterricht',
    priority: 'low',
    category: 'Teamthema',
    concern: 'Rollen im Projekt sollen neu verteilt und Erwartungen geklärt werden.',
    room: ROOM_LABEL,
    status: 'resolved',
    assignee: 'Lehrkraft',
    notes: ['Neue Rollen vereinbart', 'Follow-up in einer Woche'],
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
  }
];

const DEFAULT_GALLERY = [
  { id: crypto.randomUUID(), title: 'Moderationskreis', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: 'Vertrauensraum', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: 'Team Session', imageUrl: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80', createdAt: new Date().toISOString() }
];

const DEFAULT_NOTIFICATIONS = [
  { id: crypto.randomUUID(), tone: 'high', text: 'Ein neuer Fall mit hoher Priorität wartet auf Übernahme.', createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), tone: 'info', text: 'Der Kalender wurde mit allen offenen Terminen synchronisiert.', createdAt: new Date(Date.now() - 3600 * 1000).toISOString() }
];

const state = {
  currentTab: 'home',
  workspaceView: localStorage.getItem(WORKSPACE_VIEW_KEY) || 'overview',
  bookings: [],
  gallery: [],
  notifications: [],
  search: '',
  filter: 'all',
  priorityOnly: false,
  session: JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'),
  firebaseEnabled: false,
  firebase: null,
  deferredPrompt: null,
  unsubBookings: null,
  unsubGallery: null
};

const els = {
  notice: document.getElementById('notice'),
  modePill: document.getElementById('mode-pill'),
  bookingForm: document.getElementById('booking-form'),
  galleryForm: document.getElementById('gallery-form'),
  teamForm: document.getElementById('team-form'),
  loginForm: document.getElementById('admin-login-form'),
  workspaceLocked: document.getElementById('workspace-locked'),
  workspaceApp: document.getElementById('workspace-app'),
  bookingList: document.getElementById('booking-list'),
  calendarGrid: document.getElementById('calendar-grid'),
  galleryGrid: document.getElementById('gallery-grid'),
  bookingFilter: document.getElementById('booking-filter'),
  bookingSearch: document.getElementById('booking-search'),
  statNew: document.getElementById('stat-new'),
  statConfirmed: document.getElementById('stat-confirmed'),
  statResolved: document.getElementById('stat-resolved'),
  statCancelled: document.getElementById('stat-cancelled'),
  currentRolePill: document.getElementById('current-role-pill'),
  heroOpenCount: document.getElementById('hero-open-count'),
  heroBookingCount: document.getElementById('hero-booking-count'),
  heroResolutionRate: document.getElementById('hero-resolution-rate'),
  installButton: document.getElementById('install-app'),
  logoutButton: document.getElementById('logout-button'),
  reloadButton: document.getElementById('reload-app'),
  pwaToast: document.getElementById('pwa-toast'),
  notificationList: document.getElementById('notification-list'),
  teamBoard: document.getElementById('team-board'),
  focusHeadline: document.getElementById('focus-headline'),
  insightOpen: document.getElementById('insight-open'),
  insightHigh: document.getElementById('insight-high'),
  insightNext: document.getElementById('insight-next'),
  exportSummary: document.getElementById('export-summary'),
  exportCases: document.getElementById('export-cases'),
  createSampleCase: document.getElementById('create-sample-case'),
  focusHighPriority: document.getElementById('focus-high-priority'),
  clearNotifications: document.getElementById('clear-notifications')
};

function showNotice(text) {
  els.notice.textContent = text;
  els.notice.classList.remove('hidden');
  clearTimeout(showNotice.t);
  showNotice.t = setTimeout(() => els.notice.classList.add('hidden'), 3200);
}

function getStore(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initLocalData() {
  state.bookings = getStore(BOOKINGS_KEY, DEFAULT_BOOKINGS);
  state.gallery = getStore(GALLERY_KEY, DEFAULT_GALLERY);
  state.notifications = getStore(NOTIFICATIONS_KEY, DEFAULT_NOTIFICATIONS);
  getStore(USERS_KEY, DEFAULT_USERS);
}

function setSession(session) {
  state.session = session;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function canEdit() {
  return ['admin', 'teacher', 'mediator'].includes(state.session?.role);
}

function isAdmin() {
  return state.session?.role === 'admin';
}

function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.tab-section').forEach((section) => {
    section.classList.toggle('active', section.id === `tab-${tab}`);
  });
  document.querySelectorAll('.nav-tabs [data-tab-target]').forEach((button) => {
    button.classList.toggle('active', button.dataset.tabTarget === tab);
  });
}

function switchWorkspaceView(view) {
  state.workspaceView = view;
  localStorage.setItem(WORKSPACE_VIEW_KEY, view);
  document.querySelectorAll('.workspace-view').forEach((section) => {
    section.classList.toggle('active', section.id === `workspace-view-${view}`);
  });
  document.querySelectorAll('[data-workspace-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.workspaceView === view);
  });
}

function relativeTimeline(booking) {
  if (booking.history?.length) {
    return [...booking.history]
      .sort((a, b) => (b.at || '').localeCompare(a.at || ''))
      .slice(0, 5)
      .map((item) => `${formatDate(item.at)} · ${item.text}`);
  }
  const steps = [
    `Anfrage erstellt von ${booking.fullName}`,
    booking.assignee ? `Zugewiesen an ${booking.assignee}` : 'Noch nicht zugewiesen',
    `Status: ${STATUS[booking.status]}`,
    `Raum: ${booking.room}`
  ];
  if (booking.notes?.length) steps.push(`Letzte Notiz: ${booking.notes[booking.notes.length - 1]}`);
  return steps;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(dateString));
}

function statusCounts() {
  return {
    new: state.bookings.filter((b) => b.status === 'new').length,
    confirmed: state.bookings.filter((b) => b.status === 'confirmed').length,
    resolved: state.bookings.filter((b) => b.status === 'resolved').length,
    cancelled: state.bookings.filter((b) => b.status === 'cancelled').length
  };
}

function nextAppointment() {
  const upcoming = state.bookings
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => `${a.appointmentDate} ${a.breakSlot}`.localeCompare(`${b.appointmentDate} ${b.breakSlot}`))[0];
  if (!upcoming) return '—';
  return `${formatDate(upcoming.appointmentDate)} · ${upcoming.breakSlot}`;
}

function renderCounts() {
  const counts = statusCounts();
  const openCount = counts.new + counts.confirmed;
  const resolutionRate = state.bookings.length ? Math.round((counts.resolved / state.bookings.length) * 100) : 0;
  els.heroOpenCount.textContent = String(openCount);
  els.heroBookingCount.textContent = String(state.bookings.length);
  els.heroResolutionRate.textContent = `${resolutionRate}%`;
  els.statNew.textContent = String(counts.new);
  els.statConfirmed.textContent = String(counts.confirmed);
  els.statResolved.textContent = String(counts.resolved);
  els.statCancelled.textContent = String(counts.cancelled);
  els.insightOpen.textContent = String(openCount);
  els.insightHigh.textContent = String(state.bookings.filter((b) => b.priority === 'high' && b.status !== 'resolved' && b.status !== 'cancelled').length);
  els.insightNext.textContent = nextAppointment();
  els.focusHeadline.textContent = openCount ? `${openCount} offene Fälle brauchen heute Aufmerksamkeit` : 'Aktuell ist kein offener Fall unbearbeitet';
}

function renderNotifications() {
  if (!els.notificationList) return;
  const items = [...state.notifications].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  els.notificationList.innerHTML = items.length
    ? items.map((item) => `
      <article class="notification-card ${item.tone || 'info'}">
        <strong>${item.tone === 'high' ? 'Wichtig' : 'Info'}</strong>
        <p>${item.text}</p>
        <small>${formatDate(item.createdAt)}</small>
      </article>
    `).join('')
    : '<div class="notification-card info"><p>Keine offenen Benachrichtigungen.</p></div>';
}

function renderGallery() {
  els.galleryGrid.innerHTML = '';
  state.gallery.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'gallery-card glass';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.title}">
      <div class="gallery-body">
        <div>
          <strong>${item.title}</strong>
          <p class="muted">${formatDate(item.createdAt)}</p>
        </div>
        ${isAdmin() ? `<button class="small-btn danger-button" data-remove-gallery="${item.id}">Entfernen</button>` : ''}
      </div>
    `;
    els.galleryGrid.appendChild(card);
  });
}

function renderCalendar() {
  const groups = new Map();
  state.bookings.forEach((booking) => {
    if (!groups.has(booking.appointmentDate)) groups.set(booking.appointmentDate, []);
    groups.get(booking.appointmentDate).push(booking);
  });
  const days = [...groups.keys()].sort();
  els.calendarGrid.innerHTML = days.length
    ? days.map((date) => {
        const items = groups.get(date)
          .sort((a, b) => a.breakSlot.localeCompare(b.breakSlot))
          .map((booking) => `
            <li>
              <span>${booking.breakSlot}</span>
              <strong>${booking.fullName}</strong>
              <small>${STATUS[booking.status]} · ${PRIORITY[booking.priority]}</small>
            </li>`)
          .join('');
        return `<article class="calendar-day"><strong>${formatDate(date)}</strong><ul>${items}</ul></article>`;
      }).join('')
    : '<article class="calendar-day"><strong>Noch keine Termine</strong><p class="muted">Neue Anfragen erscheinen hier automatisch.</p></article>';
}

function filteredBookings() {
  const q = state.search.trim().toLowerCase();
  return state.bookings
    .filter((booking) => state.filter === 'all' || booking.status === state.filter)
    .filter((booking) => !state.priorityOnly || booking.priority === 'high')
    .filter((booking) => {
      if (!state.session) return true;
      if (state.session.role === 'admin') return true;
      const owner = (booking.assignee || '').toLowerCase();
      const meA = (state.session.name || '').toLowerCase();
      const meB = (state.session.email || '').toLowerCase();
      const mine = owner.includes(meA) || owner.includes(meB);
      return mine || booking.status === 'new';
    })
    .filter((booking) => {
      const haystack = [booking.fullName, booking.className, booking.category, booking.concern, booking.assignee || ''].join(' ').toLowerCase();
      return !q || haystack.includes(q);
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function renderBookings() {
  const items = filteredBookings();
  els.bookingList.innerHTML = items.length ? items.map((booking) => {
    const timeline = relativeTimeline(booking).map((item) => `<li>${item}</li>`).join('');
    const notes = booking.notes?.length ? `<p class="booking-note">${booking.notes.join(' · ')}</p>` : '<p class="booking-note">Noch keine Notizen</p>';
    return `
      <article class="booking-card">
        <div class="booking-head">
          <div>
            <strong>${booking.fullName}</strong>
            <p class="booking-meta">${booking.className} · ${booking.category} · ${formatDate(booking.appointmentDate)} · ${booking.breakSlot}</p>
          </div>
          <div class="chip-row">
            <span class="status ${booking.status}">${STATUS[booking.status]}</span>
            <span class="priority-chip ${booking.priority}">${PRIORITY[booking.priority]}</span>
          </div>
        </div>
        <p>${booking.concern}</p>
        <p class="booking-meta">Zuständig: <strong>${booking.assignee || 'Offen'}</strong> · Ort: <strong>${booking.room}</strong></p>
        ${notes}
        <div class="timeline">
          <h4>Verlauf</h4>
          <ul>${timeline}</ul>
        </div>
        ${canEdit() ? `
        <div class="booking-actions">
          <button class="small-btn" data-status="new" data-id="${booking.id}">Neu</button>
          <button class="small-btn" data-status="confirmed" data-id="${booking.id}">In Bearbeitung</button>
          <button class="small-btn" data-status="resolved" data-id="${booking.id}">Abgeschlossen</button>
          <button class="small-btn ghost" data-note="${booking.id}">Notiz</button>
          <button class="small-btn ghost" data-assign="${booking.id}">Übernehmen</button>
          <button class="small-btn ghost" data-export-case="${booking.id}">PDF</button>
          ${isAdmin() ? `<button class="small-btn danger-button" data-delete-booking="${booking.id}">Archivieren</button>` : ''}
        </div>` : ''}
      </article>
    `;
  }).join('') : '<div class="booking-card"><strong>Keine passenden Fälle</strong><p class="muted">Passen Sie Suche oder Filter an.</p></div>';
}

function renderTeamBoard() {
  const users = getStore(USERS_KEY, DEFAULT_USERS);
  els.teamBoard.innerHTML = users.map((user) => {
    const meta = TEAM_META[user.role] || TEAM_META.teacher;
    const owned = state.bookings.filter((b) => (b.assignee || '').toLowerCase().includes((user.name || '').toLowerCase())).length;
    return `
      <article class="team-card ${meta.gradient}">
        <div class="team-card-head">
          <div class="avatar">${user.name.charAt(0)}</div>
          <div>
            <strong>${user.name}</strong>
            <p>${meta.title}</p>
          </div>
        </div>
        <p>${meta.description}</p>
        <div class="team-meta-row">
          <span>${user.email}</span>
          <strong>${owned} Fälle</strong>
        </div>
      </article>
    `;
  }).join('');
}

function renderWorkspace() {
  const loggedIn = Boolean(state.session);
  els.workspaceLocked.classList.toggle('hidden', loggedIn);
  els.workspaceApp.classList.toggle('hidden', !loggedIn);
  if (loggedIn) {
    els.currentRolePill.textContent = `Rolle: ${state.session.role}`;
    switchWorkspaceView(state.workspaceView);
  }
  renderCounts();
  renderNotifications();
  renderGallery();
  renderCalendar();
  renderBookings();
  renderTeamBoard();
}

function appendHistory(booking, text) {
  return [
    { id: crypto.randomUUID(), at: new Date().toISOString(), text },
    ...(booking.history || [])
  ].slice(0, 20);
}

async function saveUsers(items) {
  setStore(USERS_KEY, items);
  renderTeamBoard();
}

async function persistBookings(items) {
  if (!state.firebaseEnabled) {
    state.bookings = items;
    setStore(BOOKINGS_KEY, items);
    renderWorkspace();
    return;
  }
}

async function persistGallery(items) {
  if (!state.firebaseEnabled) {
    state.gallery = items;
    setStore(GALLERY_KEY, items);
    renderWorkspace();
    return;
  }
}

function pushNotification(text, tone = 'info') {
  const notification = { id: crypto.randomUUID(), text, tone, createdAt: new Date().toISOString() };
  state.notifications = [notification, ...state.notifications].slice(0, 12);
  setStore(NOTIFICATIONS_KEY, state.notifications);
  renderNotifications();
}

async function createBooking(payload) {
  const booking = {
    id: crypto.randomUUID(),
    room: ROOM_LABEL,
    status: 'new',
    assignee: '',
    notes: [],
    history: [{ id: crypto.randomUUID(), at: new Date().toISOString(), text: 'Fall wurde erstellt' }],
    createdAt: new Date().toISOString(),
    ...payload
  };
  if (!state.firebaseEnabled) {
    const items = [booking, ...state.bookings];
    await persistBookings(items);
    pushNotification(`Neue Anfrage von ${booking.fullName} wurde angelegt.`, booking.priority === 'high' ? 'high' : 'info');
    return;
  }
  const { setDoc, doc, db } = state.firebase;
  await setDoc(doc(db, 'bookings', booking.id), booking);
}

async function patchBooking(id, patch) {
  if (!state.firebaseEnabled) {
    const items = state.bookings.map((b) => {
      if (b.id !== id) return b;
      const next = { ...b, ...patch };
      if (patch._historyText) next.history = appendHistory(b, patch._historyText);
      delete next._historyText;
      return next;
    });
    await persistBookings(items);
    return;
  }
  const { updateDoc, doc, db } = state.firebase;
  await updateDoc(doc(db, 'bookings', id), patch);
}

async function archiveBooking(id) {
  await patchBooking(id, { status: 'cancelled', _historyText: 'Fall wurde archiviert' });
  pushNotification('Ein Fall wurde archiviert.', 'info');
}

async function deleteGalleryItem(id) {
  if (!state.firebaseEnabled) {
    await persistGallery(state.gallery.filter((item) => item.id !== id));
    return;
  }
  const { deleteDoc, doc, db } = state.firebase;
  await deleteDoc(doc(db, 'gallery', id));
}

async function addGalleryItem(payload) {
  const image = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...payload };
  if (!state.firebaseEnabled) {
    await persistGallery([image, ...state.gallery]);
    pushNotification('Ein neues Bild wurde gespeichert.', 'info');
    return;
  }
  const { setDoc, doc, db } = state.firebase;
  await setDoc(doc(db, 'gallery', image.id), image);
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function handleLocalLogin(email, password) {
  const users = getStore(USERS_KEY, DEFAULT_USERS);
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) return null;
  return { email: user.email, role: user.role, name: user.name };
}

function exportPrintable(title, html) {
  const w = window.open('', '_blank', 'width=1100,height=800');
  w.document.write(`<!doctype html><html><head><title>${title}</title><style>
    body{font-family:Inter,Arial,sans-serif;padding:40px;color:#111827}
    h1{margin:0 0 10px;font-size:28px} h2{margin:24px 0 10px} p,li{line-height:1.55}
    .meta{color:#4b5563;margin-bottom:20px}.card{border:1px solid #d1d5db;border-radius:16px;padding:20px;margin:16px 0}
    .chip{display:inline-block;border:1px solid #cbd5e1;border-radius:999px;padding:6px 10px;margin-right:8px;font-size:12px}
  </style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function exportCase(booking) {
  exportPrintable(`Fall – ${booking.fullName}`,
    `<h1>Bridge Fallübersicht</h1>
     <p class="meta">Exportiert am ${formatDate(new Date().toISOString())}</p>
     <div class="card">
       <h2>${booking.fullName}</h2>
       <p>${booking.className} · ${booking.category}</p>
       <p><span class="chip">${STATUS[booking.status]}</span><span class="chip">${PRIORITY[booking.priority]}</span><span class="chip">${formatDate(booking.appointmentDate)} · ${booking.breakSlot}</span></p>
       <p><strong>Ort:</strong> ${booking.room}</p>
       <p><strong>Zuständig:</strong> ${booking.assignee || 'Offen'}</p>
       <p><strong>Anliegen:</strong> ${booking.concern}</p>
       <h2>Notizen</h2>
       <p>${booking.notes?.length ? booking.notes.join('<br>') : 'Noch keine Notizen'}</p>
     </div>`);
}

function exportCasesSummary() {
  const rows = filteredBookings().map((b) => `<li><strong>${b.fullName}</strong> — ${STATUS[b.status]} · ${PRIORITY[b.priority]} · ${formatDate(b.appointmentDate)} · ${b.breakSlot}</li>`).join('');
  exportPrintable('Bridge Tagesübersicht',
    `<h1>Bridge Tagesübersicht</h1>
     <p class="meta">${state.bookings.length} Fälle insgesamt · ${statusCounts().resolved} abgeschlossen</p>
     <div class="card">
       <h2>Fallliste</h2>
       <ul>${rows || '<li>Keine Fälle vorhanden</li>'}</ul>
     </div>`);
}

async function initFirebase() {
  if (!window.STREITSCHLICHTER_FIREBASE?.enabled || !window.STREITSCHLICHTER_FIREBASE?.config) return;
  try {
    const appModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js');
    const authModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js');
    const fsModule = await import('https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js');

    const app = appModule.initializeApp(window.STREITSCHLICHTER_FIREBASE.config);
    const auth = authModule.getAuth(app);
    const db = fsModule.getFirestore(app);

    state.firebaseEnabled = true;
    state.firebase = {
      auth, db,
      signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
      signOut: authModule.signOut,
      collection: fsModule.collection,
      query: fsModule.query,
      orderBy: fsModule.orderBy,
      onSnapshot: fsModule.onSnapshot,
      setDoc: fsModule.setDoc,
      updateDoc: fsModule.updateDoc,
      deleteDoc: fsModule.deleteDoc,
      doc: fsModule.doc
    };
    els.modePill.textContent = 'Cloud Live';
    document.getElementById('admin-login-help').textContent = 'Mit Firebase Auth anmelden. Firestore kann Rollen und Live-Daten synchronisieren.';
    bindRealtime();
  } catch (error) {
    console.error(error);
    showNotice('Firebase konnte nicht geladen werden. Lokaler Modus bleibt aktiv.');
  }
}

function bindRealtime() {
  if (!state.firebaseEnabled) return;
  const { collection, query, orderBy, onSnapshot, db } = state.firebase;
  state.unsubBookings?.();
  state.unsubGallery?.();
  state.unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), (snap) => {
    state.bookings = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderWorkspace();
  });
  state.unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), (snap) => {
    state.gallery = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderWorkspace();
  });
}

function installPWA() {
  if (!state.deferredPrompt) {
    showNotice('Auf iPhone: Teilen → Zum Home-Bildschirm.');
    return;
  }
  state.deferredPrompt.prompt();
  state.deferredPrompt = null;
}

function bindEvents() {
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-tab-target], [data-workspace-view], [data-status], [data-delete-booking], [data-remove-gallery], [data-note], [data-assign], [data-export-case]');
    if (!target) return;

    if (target.dataset.tabTarget) {
      switchTab(target.dataset.tabTarget);
      return;
    }

    if (target.dataset.workspaceView) {
      switchWorkspaceView(target.dataset.workspaceView);
      return;
    }

    if (target.dataset.status && canEdit()) {
      await patchBooking(target.dataset.id, { status: target.dataset.status, _historyText: `Status geändert zu ${STATUS[target.dataset.status]}` });
      pushNotification(`Status wurde auf ${STATUS[target.dataset.status]} gesetzt.`, 'info');
      showNotice('Status aktualisiert.');
      return;
    }

    if (target.dataset.deleteBooking && isAdmin()) {
      await archiveBooking(target.dataset.deleteBooking);
      showNotice('Fall archiviert.');
      return;
    }

    if (target.dataset.removeGallery && isAdmin()) {
      await deleteGalleryItem(target.dataset.removeGallery);
      showNotice('Bild entfernt.');
      return;
    }

    if (target.dataset.note && canEdit()) {
      const note = prompt('Kurze Notiz hinzufügen');
      if (!note) return;
      const booking = state.bookings.find((item) => item.id === target.dataset.note);
      const notes = [...(booking.notes || []), note];
      await patchBooking(target.dataset.note, { notes, _historyText: `Neue Notiz: ${note}` });
      pushNotification('Eine neue Fallnotiz wurde gespeichert.', 'info');
      showNotice('Notiz gespeichert.');
      return;
    }

    if (target.dataset.assign && canEdit()) {
      await patchBooking(target.dataset.assign, { assignee: state.session.name || state.session.email, status: 'confirmed', _historyText: `Fall übernommen von ${state.session.name || state.session.email}` });
      pushNotification(`${state.session.name} hat einen Fall übernommen.`, 'info');
      showNotice('Fall übernommen.');
      return;
    }

    if (target.dataset.exportCase) {
      const booking = state.bookings.find((item) => item.id === target.dataset.exportCase);
      if (booking) exportCase(booking);
    }
  });

  els.bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    await createBooking({
      fullName: fd.get('fullName').trim(),
      className: fd.get('className').trim(),
      appointmentDate: fd.get('appointmentDate'),
      breakSlot: fd.get('breakSlot'),
      priority: fd.get('priority'),
      category: fd.get('category'),
      concern: fd.get('concern').trim()
    });
    event.currentTarget.reset();
    switchTab('workspace');
    if (state.session) switchWorkspaceView('cases');
    showNotice('Anfrage wurde erfolgreich angelegt.');
  });

  els.galleryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isAdmin()) {
      showNotice('Nur Admin kann Bilder speichern.');
      return;
    }
    const fd = new FormData(event.currentTarget);
    const file = fd.get('imageFile');
    const title = fd.get('title').trim();
    let imageUrl = fd.get('imageUrl').trim();
    if (file && file.size) imageUrl = await fileToDataUrl(file);
    if (!imageUrl) {
      showNotice('Bitte Datei oder URL angeben.');
      return;
    }
    await addGalleryItem({ title, imageUrl });
    event.currentTarget.reset();
    showNotice('Galeriebild gespeichert.');
  });

  els.teamForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isAdmin()) {
      showNotice('Nur Admin kann Teammitglieder anlegen.');
      return;
    }
    const fd = new FormData(event.currentTarget);
    const user = {
      name: fd.get('name').trim(),
      email: fd.get('email').trim().toLowerCase(),
      password: fd.get('password').trim(),
      role: fd.get('role')
    };
    const users = getStore(USERS_KEY, DEFAULT_USERS);
    if (users.some((u) => u.email === user.email)) {
      showNotice('Diese E-Mail existiert bereits.');
      return;
    }
    await saveUsers([...users, user]);
    pushNotification(`${user.name} wurde als ${TEAM_META[user.role].title} angelegt.`, 'info');
    event.currentTarget.reset();
    showNotice('Teammitglied angelegt.');
  });

  els.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = fd.get('email').trim();
    const password = fd.get('password').trim();

    if (!state.firebaseEnabled) {
      const session = handleLocalLogin(email, password);
      if (!session) {
        showNotice('Login fehlgeschlagen.');
        return;
      }
      setSession(session);
      renderWorkspace();
      switchWorkspaceView('overview');
      pushNotification(`${session.name} hat sich angemeldet.`, 'info');
      showNotice(`Willkommen, ${session.name}.`);
      return;
    }

    try {
      const cred = await state.firebase.signInWithEmailAndPassword(state.firebase.auth, email, password);
      const localUsers = getStore(USERS_KEY, DEFAULT_USERS);
      const known = localUsers.find((u) => u.email.toLowerCase() === cred.user.email.toLowerCase());
      const role = known?.role || (email.includes('teacher') ? 'teacher' : email.includes('mediator') ? 'mediator' : 'admin');
      setSession({ email: cred.user.email, role, name: known?.name || cred.user.email });
      renderWorkspace();
      switchWorkspaceView('overview');
      showNotice('Live Login erfolgreich.');
    } catch (error) {
      console.error(error);
      showNotice('Firebase Login fehlgeschlagen.');
    }
  });

  els.bookingFilter.addEventListener('change', (event) => {
    state.filter = event.target.value;
    renderBookings();
  });

  els.bookingSearch.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderBookings();
  });

  els.installButton.addEventListener('click', installPWA);
  els.logoutButton.addEventListener('click', async () => {
    if (state.firebaseEnabled) {
      try { await state.firebase.signOut(state.firebase.auth); } catch (error) { console.error(error); }
    }
    setSession(null);
    renderWorkspace();
    showNotice('Abgemeldet.');
  });

  els.exportSummary.addEventListener('click', exportCasesSummary);
  els.exportCases.addEventListener('click', exportCasesSummary);
  els.createSampleCase.addEventListener('click', async () => {
    await createBooking({
      fullName: 'Beispiel-Fall',
      className: '8c',
      appointmentDate: plusDays(4),
      breakSlot: '2. Pause',
      priority: 'high',
      category: 'Beratung',
      concern: 'Ein zusätzlicher Fall wurde für die Produktpräsentation angelegt.'
    });
    showNotice('Beispiel-Fall wurde erstellt.');
  });
  els.focusHighPriority.addEventListener('click', () => {
    state.priorityOnly = !state.priorityOnly;
    els.focusHighPriority.textContent = state.priorityOnly ? 'Alle Prioritäten zeigen' : 'Hohe Priorität filtern';
    renderBookings();
  });
  els.clearNotifications.addEventListener('click', () => {
    state.notifications = [];
    setStore(NOTIFICATIONS_KEY, []);
    renderNotifications();
    showNotice('Benachrichtigungen geleert.');
  });
  els.reloadButton?.addEventListener('click', () => window.location.reload());

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
  });
}

function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        els.pwaToast.classList.remove('hidden');
      });
    }).catch(console.error);
  }
}

async function init() {
  initLocalData();
  bindEvents();
  initPWA();
  switchTab(state.currentTab);
  await initFirebase();
  renderWorkspace();
  if (state.session) switchWorkspaceView(state.workspaceView);
}

init();
