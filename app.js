const STORAGE_KEY = 'pulse-chat-state-v1';

function generateId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createInitialState() {
  return {
    userName: 'Guest',
    selectedGroupId: null,
    groups: [
      {
        id: generateId(),
        name: 'General',
        messages: [
          { id: generateId(), author: 'Mina', text: 'Welcome to Pulse Chat!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { id: generateId(), author: 'You', text: 'This is a demo group to get started.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      },
      {
        id: generateId(),
        name: 'Design Team',
        messages: [
          { id: generateId(), author: 'Jules', text: 'Let us review the new UI mockups.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }
    ]
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (!parsed.groups || !Array.isArray(parsed.groups)) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();
if (!state.selectedGroupId && state.groups.length) {
  state.selectedGroupId = state.groups[0].id;
  saveState(state);
}

const userNameInput = document.getElementById('userName');
const groupNameInput = document.getElementById('groupName');
const createGroupBtn = document.getElementById('createGroupBtn');
const groupsList = document.getElementById('groupsList');
const groupTitle = document.getElementById('groupTitle');
const groupMeta = document.getElementById('groupMeta');
const messagesEl = document.getElementById('messages');
const composerForm = document.getElementById('composer');
const messageInput = document.getElementById('messageInput');

function getSelectedGroup() {
  return state.groups.find((group) => group.id === state.selectedGroupId) || state.groups[0];
}

function renderGroups() {
  groupsList.innerHTML = '';

  state.groups.forEach((group) => {
    const item = document.createElement('button');
    item.className = `group-item ${group.id === state.selectedGroupId ? 'active' : ''}`;
    item.type = 'button';
    item.innerHTML = `<strong>${group.name}</strong><span>${group.messages.length} messages</span>`;
    item.addEventListener('click', () => {
      state.selectedGroupId = group.id;
      saveState(state);
      render();
    });
    groupsList.appendChild(item);
  });
}

function renderMessages() {
  const group = getSelectedGroup();
  if (!group) {
    messagesEl.innerHTML = '<div class="empty-state">Create or choose a group to start chatting.</div>';
    return;
  }

  groupTitle.textContent = group.name;
  groupMeta.textContent = `${group.messages.length} message${group.messages.length === 1 ? '' : 's'} in this room`;

  if (!group.messages.length) {
    messagesEl.innerHTML = '<div class="empty-state">No messages yet. Say hello!</div>';
    return;
  }

  messagesEl.innerHTML = group.messages.map((message) => {
    const mine = message.author === 'You' || message.author === state.userName;
    return `<div class="message ${mine ? 'mine' : ''}"><strong>${message.author}</strong>${message.text}<small>${message.time}</small></div>`;
  }).join('');

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function render() {
  renderGroups();
  renderMessages();
}

function createGroup(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  state.groups.unshift({
    id: generateId(),
    name: trimmed,
    messages: []
  });
  state.selectedGroupId = state.groups[0].id;
  saveState(state);
  groupNameInput.value = '';
  render();
}

function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const group = getSelectedGroup();
  if (!group) return;

  group.messages.push({
    id: generateId(),
    author: state.userName || 'You',
    text: trimmed,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveState(state);
  messageInput.value = '';
  render();
}

userNameInput.value = state.userName || 'Guest';
userNameInput.addEventListener('change', (event) => {
  state.userName = event.target.value.trim() || 'Guest';
  saveState(state);
  render();
});

createGroupBtn.addEventListener('click', () => createGroup(groupNameInput.value));

groupNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    createGroup(groupNameInput.value);
  }
});

composerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

render();
