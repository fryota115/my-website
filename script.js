// データの読み書き、入力チェック、タスクの表示・操作を担当します。
'use strict';
const STORAGE_KEY = 'mainichi-tasks-v1';
const form = document.querySelector('#task-form');
const nameInput = document.querySelector('#task-name');
const descriptionInput = document.querySelector('#task-description');
const dateInput = document.querySelector('#task-date');
const priorityInput = document.querySelector('#task-priority');
const list = document.querySelector('#task-list');
const priorityNames = { high: '高', medium: '中', low: '低' };
let tasks = [];
let editingId = null;
let filter = 'all';
let storageReadable = true;

function notify(message, error = false) {
  const notice = document.querySelector('#notice');
  notice.textContent = message;
  notice.classList.toggle('error', error);
  notice.hidden = false;
}

function validDate(value) {
  if (value === '') return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validTask(task) {
  return task && typeof task.id === 'string' && task.id.length > 0 &&
    typeof task.title === 'string' && task.title.trim().length > 0 && task.title.length <= 100 &&
    typeof task.description === 'string' && task.description.length <= 2000 &&
    typeof task.dueDate === 'string' && validDate(task.dueDate) &&
    Object.hasOwn(priorityNames, task.priority) && typeof task.completed === 'boolean' &&
    Number.isFinite(task.createdAt);
}

// 壊れた保存データは勝手に上書きせず、エラーを表示します。
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(validTask) || new Set(parsed.map(t => t.id)).size !== parsed.length) {
      throw new Error('Invalid data');
    }
    tasks = parsed;
  }
} catch {
  storageReadable = false;
  notify('保存データを読み込めません。ブラウザの保存設定や保存データを確認してください。元のデータを保護するため変更は保存できません。', true);
}

// 保存が成功した場合だけ画面のデータを変更します。
function commit(nextTasks) {
  if (!storageReadable) {
    notify('保存データを読み込めないため変更できません。ブラウザの保存設定を確認してください。', true);
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
    tasks = nextTasks;
    render();
    return true;
  } catch {
    notify('保存できませんでした。保存容量やブラウザの設定を確認してください。入力内容はそのまま残っています。', true);
    return false;
  }
}

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ユーザー入力はすべて textContent で表示し、HTMLとして実行しません。
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render() {
  const completed = tasks.filter(task => task.completed).length;
  const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  document.querySelector('#total-count').textContent = tasks.length;
  document.querySelector('#completed-count').textContent = completed;
  document.querySelector('#percentage').textContent = percentage;
  const progress = document.querySelector('#progress');
  progress.value = percentage;
  progress.textContent = `${percentage}%`;
  document.querySelector('#progress-message').textContent = tasks.length === 0 ? 'タスクはありません。' : completed === tasks.length ? 'すべてのタスクが完了しています。' : `未完了のタスク：${tasks.length - completed} 件`;
  const visible = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));
  const sort = document.querySelector('#sort').value;
  const ranks = { high: 0, medium: 1, low: 2 };
  visible.sort((a, b) => {
    if (sort === 'due') return (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99') || b.createdAt - a.createdAt;
    if (sort === 'priority') return ranks[a.priority] - ranks[b.priority] || b.createdAt - a.createdAt;
    return b.createdAt - a.createdAt;
  });
  document.querySelector('#visible-count').textContent = visible.length;
  list.replaceChildren();
  for (const task of visible) {
    const card = element('article', 'task-card' + (task.completed ? ' completed' : ''));
    const check = element('input', 'task-check');
    check.type = 'checkbox';
    check.checked = task.completed;
    check.setAttribute('aria-label', `${task.title}を${task.completed ? '未完了' : '完了'}にする`);
    check.addEventListener('change', () => {
      if (commit(tasks.map(item => item.id === task.id ? { ...item, completed: check.checked } : item))) notify(check.checked ? 'タスクを完了しました。' : '未完了に戻しました。');
      else check.checked = task.completed;
    });
    const content = element('div', 'task-content');
    content.append(element('h3', 'task-title', task.title));
    if (task.description) content.append(element('p', 'task-description', task.description));
    const meta = element('div', 'task-meta');
    meta.append(element('span', `badge ${task.priority}`, `優先度：${priorityNames[task.priority]}`));
    if (task.dueDate) {
      const overdue = !task.completed && task.dueDate < localDate();
      meta.append(element('span', overdue ? 'overdue' : '', `${task.dueDate.replaceAll('-', '/')} 締切${overdue ? '・期限超過' : ''}`));
    }
    if (task.completed) meta.append(element('span', '', '✓ 完了済み'));
    content.append(meta);
    const actions = element('div', 'task-actions');
    const edit = element('button', '', '編集');
    edit.type = 'button';
    edit.setAttribute('aria-label', `${task.title}を編集`);
    edit.addEventListener('click', () => startEdit(task));
    const remove = element('button', 'delete', '削除');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${task.title}を削除`);
    remove.addEventListener('click', () => {
      if (!window.confirm(`「${task.title}」を削除しますか？この操作は取り消せません。`)) return;
      if (commit(tasks.filter(item => item.id !== task.id))) {
        if (editingId === task.id) resetForm();
        notify('タスクを削除しました。');
      }
    });
    actions.append(edit, remove);
    card.append(check, content, actions);
    list.append(card);
  }
  const empty = document.querySelector('#empty-state');
  empty.hidden = visible.length > 0;
  empty.querySelector('h3').textContent = tasks.length ? '該当するタスクはありません' : 'タスクはありません';
  empty.querySelector('p').textContent = tasks.length ? '絞り込みを変えると、ほかのタスクを確認できます。' : 'フォームからタスクを追加してください。';
}

function startEdit(task) {
  editingId = task.id;
  nameInput.value = task.title;
  descriptionInput.value = task.description;
  dateInput.value = task.dueDate;
  priorityInput.value = task.priority;
  document.querySelector('#form-title').textContent = 'タスクを編集';
  document.querySelector('#submit-button').textContent = '変更を保存';
  document.querySelector('#cancel-edit').hidden = false;
  nameInput.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  nameInput.setCustomValidity('');
  document.querySelector('#form-title').textContent = 'タスクを追加';
  document.querySelector('#submit-button').textContent = '＋ タスクを追加';
  document.querySelector('#cancel-edit').hidden = true;
}

nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const title = nameInput.value.trim();
  if (!title) {
    nameInput.setCustomValidity('タスク名を入力してください（空白のみは使用できません）。');
    nameInput.reportValidity();
    return;
  }
  if (!form.reportValidity() || !validDate(dateInput.value) || !Object.hasOwn(priorityNames, priorityInput.value)) {
    notify('入力内容を確認してください。締切日は正しい日付を指定してください。', true);
    return;
  }
  const values = { title, description: descriptionInput.value.trim(), dueDate: dateInput.value, priority: priorityInput.value };
  const isEditing = editingId !== null;
  if (isEditing && !tasks.some(task => task.id === editingId)) {
    notify('編集対象のタスクが見つかりません。', true);
    return;
  }
  const next = isEditing ? tasks.map(task => task.id === editingId ? { ...task, ...values } : task) :
    [...tasks, { ...values, id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, completed: false, createdAt: Date.now() }];
  if (commit(next)) {
    resetForm();
    notify(isEditing ? 'タスクを更新しました。' : 'タスクを追加しました。');
    nameInput.focus();
  }
});
document.querySelector('#cancel-edit').addEventListener('click', resetForm);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  render();
}));
document.querySelector('#sort').addEventListener('change', render);
document.querySelector('#today').textContent = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
render();
