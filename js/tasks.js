/**
 * Study Planner & Task / Deadline Manager Module (Kanban + List View)
 */
class TasksManager {
  constructor(app) {
    this.app = app;
    this.currentView = 'kanban'; // 'kanban' | 'list'
    this.filterSubject = 'all';
    this.filterPriority = 'all';
  }

  getPriorityBadge(priority) {
    switch (priority) {
      case 'urgent':
        return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 urgent-pulse"><span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1"></span>Khẩn cấp</span>';
      case 'high':
        return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>Cao</span>';
      case 'medium':
        return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Trung bình</span>';
      default:
        return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Thấp</span>';
    }
  }

  getCategoryBadge(category) {
    const map = {
      assignment: { label: 'Bài tập', icon: '📝', cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
      exam: { label: 'Thi / KT', icon: '🎯', cls: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
      project: { label: 'Đồ án', icon: '🚀', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      study: { label: 'Ôn tập', icon: '📖', cls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' }
    };
    const c = map[category] || { label: 'Nhiệm vụ', icon: '📌', cls: 'bg-slate-100 text-slate-700' };
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium ${c.cls}"><span class="mr-1">${c.icon}</span>${c.label}</span>`;
  }

  formatDeadline(dateString) {
    if (!dateString) return { text: 'Không thời hạn', status: 'normal' };
    const now = new Date();
    const due = new Date(dateString);
    const diffMs = due - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const dateFormatted = `${due.getDate().toString().padStart(2, '0')}/${(due.getMonth() + 1).toString().padStart(2, '0')} ${due.getHours().toString().padStart(2, '0')}:${due.getMinutes().toString().padStart(2, '0')}`;

    if (diffMs < 0) {
      return {
        text: `Quá hạn (${dateFormatted})`,
        status: 'overdue',
        badgeCls: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800'
      };
    } else if (diffHours <= 24) {
      return {
        text: `Hôm nay / Còn ${diffHours}h (${dateFormatted})`,
        status: 'today',
        badgeCls: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800'
      };
    } else if (diffDays <= 3) {
      return {
        text: `Còn ${diffDays} ngày (${dateFormatted})`,
        status: 'soon',
        badgeCls: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
      };
    } else {
      return {
        text: `${dateFormatted}`,
        status: 'normal',
        badgeCls: 'text-slate-500 bg-slate-50 dark:bg-slate-800'
      };
    }
  }

  render() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const data = this.app.data;

    // Filter tasks
    let filteredTasks = [...data.tasks];
    if (this.filterSubject !== 'all') {
      filteredTasks = filteredTasks.filter(t => t.subjectId === this.filterSubject);
    }
    if (this.filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(t => t.priority === this.filterPriority);
    }

    // Header Controls: View Switcher (Kanban vs List), Filters, Add Task Button
    container.innerHTML = `
      <!-- Toolbar Filter & View Switcher -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div class="flex flex-wrap items-center gap-2">
          <!-- View Toggle -->
          <div class="bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl flex items-center space-x-1">
            <button onclick="window.eduApp.tasks.switchView('kanban')"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${this.currentView === 'kanban' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
              <span>Bảng Kanban</span>
            </button>
            <button onclick="window.eduApp.tasks.switchView('list')"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${this.currentView === 'list' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              <span>Danh sách / Deadline</span>
            </button>
          </div>

          <!-- Subject Filter -->
          <select onchange="window.eduApp.tasks.setSubjectFilter(this.value)" class="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="all">Tất cả môn học</option>
            ${data.subjects.map(s => `<option value="${s.id}" ${this.filterSubject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>

          <!-- Priority Filter -->
          <select onchange="window.eduApp.tasks.setPriorityFilter(this.value)" class="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="all" ${this.filterPriority === 'all' ? 'selected' : ''}>Mọi độ ưu tiên</option>
            <option value="urgent" ${this.filterPriority === 'urgent' ? 'selected' : ''}>🔴 Khẩn cấp</option>
            <option value="high" ${this.filterPriority === 'high' ? 'selected' : ''}>🟠 Cao</option>
            <option value="medium" ${this.filterPriority === 'medium' ? 'selected' : ''}>🔵 Trung bình</option>
            <option value="low" ${this.filterPriority === 'low' ? 'selected' : ''}>⚪ Thấp</option>
          </select>
        </div>

        <button onclick="window.eduApp.tasks.openModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span>+ Thêm kế hoạch / Deadline</span>
        </button>
      </div>

      <!-- Main Tasks Content -->
      <div id="tasks-view-content">
        ${this.currentView === 'kanban' ? this.renderKanban(filteredTasks) : this.renderList(filteredTasks)}
      </div>
    `;

    this.attachDragAndDrop();
  }

  renderKanban(tasks) {
    const columns = [
      { id: 'todo', title: 'Cần làm', bg: 'bg-slate-50/70 dark:bg-slate-800/40', badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
      { id: 'in_progress', title: 'Đang thực hiện', bg: 'bg-indigo-50/30 dark:bg-indigo-950/20', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
      { id: 'done', title: 'Đã hoàn thành', bg: 'bg-emerald-50/30 dark:bg-emerald-950/20', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' }
    ];

    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        ${columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return `
            <div class="flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-700/80 ${col.bg} p-3 min-h-[500px]">
              <!-- Column Header -->
              <div class="flex items-center justify-between px-2 py-2 mb-3">
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-sm text-slate-800 dark:text-white">${col.title}</span>
                  <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${col.badge}">${colTasks.length}</span>
                </div>
                <button onclick="window.eduApp.tasks.openModal(null, '${col.id}')" class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg transition" title="Thêm việc vào cột này">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>

              <!-- Task Cards Container -->
              <div class="kanban-column flex-1 space-y-3 p-1 rounded-xl transition" data-status="${col.id}">
                ${colTasks.length === 0 ? `
                  <div class="h-32 flex flex-col items-center justify-center text-center text-slate-300 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <span class="text-xs">Kéo thả hoặc thêm việc vào đây</span>
                  </div>
                ` : colTasks.map(task => this.renderTaskCard(task)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderTaskCard(task) {
    const sub = this.app.data.subjects.find(s => s.id === task.subjectId);
    const deadlineInfo = this.formatDeadline(task.dueDate);

    return `
      <div class="task-card bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/80 shadow-xs hover:shadow-md transition cursor-grab group select-none"
           draggable="true" data-id="${task.id}">
        <!-- Subject Badge & Priority -->
        <div class="flex items-center justify-between mb-2 gap-1">
          <span class="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[160px]"
                style="background-color: ${sub ? sub.color + '15' : '#f1f5f9'}; color: ${sub ? sub.color : '#64748b'}">
            ${sub ? sub.name : 'Chưa phân môn'}
          </span>
          ${this.getPriorityBadge(task.priority)}
        </div>

        <!-- Task Title -->
        <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1.5 ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''}">
          ${task.title}
        </h5>

        <!-- Description (if any) -->
        ${task.description ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">${task.description}</p>` : ''}

        <!-- Deadline Tag & Category -->
        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
          <div class="flex items-center space-x-1 px-1.5 py-0.5 rounded ${deadlineInfo.badgeCls || 'text-slate-500'}">
            <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span class="truncate font-medium">${deadlineInfo.text}</span>
          </div>
          <div>${this.getCategoryBadge(task.category)}</div>
        </div>

        <!-- Quick actions footer -->
        <div class="mt-2.5 pt-2 border-t border-dashed border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <!-- Pomodoro shortcut -->
          <button onclick="window.eduApp.pomodoro.startForTask('${task.id}')" title="Bắt đầu Pomodoro cho việc này"
            class="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center space-x-1 font-medium transition">
            <span>⏱️ ${task.pomodoros || 0} phiên</span>
          </button>

          <!-- Edit & Move Menu -->
          <div class="flex items-center space-x-1">
            ${task.status !== 'todo' ? `
              <button onclick="window.eduApp.tasks.changeStatus('${task.id}', '${task.status === 'done' ? 'in_progress' : 'todo'}')" title="Lùi bước" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                &larr;
              </button>
            ` : ''}
            ${task.status !== 'done' ? `
              <button onclick="window.eduApp.tasks.changeStatus('${task.id}', '${task.status === 'todo' ? 'in_progress' : 'done'}')" title="Chuyển tiếp" class="p-1 text-slate-400 hover:text-emerald-600">
                &rarr;
              </button>
            ` : ''}
            <button onclick="window.eduApp.tasks.openModal('${task.id}')" title="Sửa" class="p-1 text-slate-400 hover:text-indigo-600">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button onclick="window.eduApp.tasks.deleteTask('${task.id}')" title="Xóa" class="p-1 text-slate-400 hover:text-rose-600">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderList(tasks) {
    if (tasks.length === 0) {
      return `
        <div class="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p class="text-sm text-slate-400">Không tìm thấy kế hoạch / deadline nào phù hợp bộ lọc.</p>
        </div>
      `;
    }

    // Sort: Due date ascending
    const sorted = [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return `
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="divide-y divide-slate-100 dark:divide-slate-700">
          ${sorted.map(task => {
            const sub = this.app.data.subjects.find(s => s.id === task.subjectId);
            const deadlineInfo = this.formatDeadline(task.dueDate);

            return `
              <div class="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-750 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="flex items-start space-x-3 flex-1">
                  <!-- Complete checkbox -->
                  <input type="checkbox" ${task.status === 'done' ? 'checked' : ''}
                    onchange="window.eduApp.tasks.changeStatus('${task.id}', this.checked ? 'done' : 'todo')"
                    class="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer">

                  <div>
                    <div class="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                      <span class="text-xs font-semibold px-2 py-0.5 rounded"
                            style="background-color: ${sub ? sub.color + '18' : '#f1f5f9'}; color: ${sub ? sub.color : '#64748b'}">
                        ${sub ? sub.name : 'Chưa phân môn'}
                      </span>
                      ${this.getCategoryBadge(task.category)}
                      ${this.getPriorityBadge(task.priority)}
                    </div>
                    <h5 class="text-sm font-bold text-slate-800 dark:text-slate-100 ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''}">
                      ${task.title}
                    </h5>
                    ${task.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${task.description}</p>` : ''}
                  </div>
                </div>

                <!-- Right Meta & Actions -->
                <div class="flex items-center space-x-4 self-end md:self-center">
                  <!-- Deadline -->
                  <div class="px-2.5 py-1 rounded-lg text-xs font-semibold ${deadlineInfo.badgeCls || 'text-slate-500 bg-slate-50'}">
                    ${deadlineInfo.text}
                  </div>

                  <!-- Status tag -->
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full ${
                    task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                    task.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }">
                    ${task.status === 'done' ? 'Đã xong' : task.status === 'in_progress' ? 'Đang làm' : 'Cần làm'}
                  </span>

                  <!-- Actions -->
                  <div class="flex items-center space-x-1">
                    <button onclick="window.eduApp.pomodoro.startForTask('${task.id}')" title="Chạy Pomodoro" class="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      ⏱️
                    </button>
                    <button onclick="window.eduApp.tasks.openModal('${task.id}')" title="Sửa" class="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="window.eduApp.tasks.deleteTask('${task.id}')" title="Xóa" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  attachDragAndDrop() {
    const cards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.kanban-column');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      });
      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = col.getAttribute('data-status');
        if (taskId && newStatus) {
          this.changeStatus(taskId, newStatus);
        }
      });
    });
  }

  switchView(view) {
    this.currentView = view;
    this.render();
  }

  setSubjectFilter(val) {
    this.filterSubject = val;
    this.render();
  }

  setPriorityFilter(val) {
    this.filterPriority = val;
    this.render();
  }

  changeStatus(taskId, newStatus) {
    const task = this.app.data.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      this.app.saveData();
      this.render();
      if (this.app.subjects) this.app.subjects.render();
    }
  }

  openModal(taskId = null, defaultStatus = 'todo') {
    const isEdit = !!taskId;
    const task = isEdit ? this.app.data.tasks.find(t => t.id === taskId) : null;
    const subjects = this.app.data.subjects;

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl modal-enter border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">${isEdit ? 'Chỉnh sửa Kế hoạch / Deadline' : 'Thêm Kế hoạch / Deadline mới'}</h3>
            <button onclick="window.eduApp.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form id="task-form" onsubmit="window.eduApp.tasks.handleFormSubmit(event, '${taskId || ''}')" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tiêu đề nhiệm vụ *</label>
              <input type="text" id="task-title" required placeholder="VD: Nộp bài tập lớn chương 2" value="${task ? task.title : ''}"
                class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Môn học liên quan</label>
                <select id="task-subject" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Không chọn --</option>
                  ${subjects.map(s => `
                    <option value="${s.id}" ${task && task.subjectId === s.id ? 'selected' : ''}>${s.name}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Hạn chót (Deadline) *</label>
                <input type="datetime-local" id="task-due" required value="${task ? task.dueDate : ''}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Độ ưu tiên</label>
                <select id="task-priority" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="urgent" ${task && task.priority === 'urgent' ? 'selected' : ''}>🔴 Khẩn cấp</option>
                  <option value="high" ${(!task || task.priority === 'high') ? 'selected' : ''}>🟠 Cao</option>
                  <option value="medium" ${task && task.priority === 'medium' ? 'selected' : ''}>🔵 Trung bình</option>
                  <option value="low" ${task && task.priority === 'low' ? 'selected' : ''}>⚪ Thấp</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phân loại</label>
                <select id="task-category" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="assignment" ${!task || task.category === 'assignment' ? 'selected' : ''}>📝 Bài tập</option>
                  <option value="exam" ${task && task.category === 'exam' ? 'selected' : ''}>🎯 Thi / Kiểm tra</option>
                  <option value="project" ${task && task.category === 'project' ? 'selected' : ''}>🚀 Đồ án / BTL</option>
                  <option value="study" ${task && task.category === 'study' ? 'selected' : ''}>📖 Tự ôn tập</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Trạng thái</label>
                <select id="task-status" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="todo" ${(task ? task.status === 'todo' : defaultStatus === 'todo') ? 'selected' : ''}>Cần làm</option>
                  <option value="in_progress" ${(task ? task.status === 'in_progress' : defaultStatus === 'in_progress') ? 'selected' : ''}>Đang làm</option>
                  <option value="done" ${(task ? task.status === 'done' : defaultStatus === 'done') ? 'selected' : ''}>Đã hoàn thành</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Chi tiết & Ghi chú</label>
              <textarea id="task-desc" rows="3" placeholder="Yêu cầu đề bài, tài liệu cần đọc, lưu ý đặc biệt..."
                class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">${task ? task.description || '' : ''}</textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onclick="window.eduApp.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
                Hủy
              </button>
              <button type="submit" class="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition">
                ${isEdit ? 'Lưu thay đổi' : 'Thêm kế hoạch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  handleFormSubmit(e, taskId) {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const subjectId = document.getElementById('task-subject').value;
    const dueDate = document.getElementById('task-due').value;
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;
    const status = document.getElementById('task-status').value;
    const description = document.getElementById('task-desc').value.trim();

    if (!title || !dueDate) {
      alert('Vui lòng điền tiêu đề và hạn chót!');
      return;
    }

    if (taskId) {
      const idx = this.app.data.tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        this.app.data.tasks[idx] = {
          ...this.app.data.tasks[idx],
          title,
          subjectId,
          dueDate,
          priority,
          category,
          status,
          description
        };
      }
    } else {
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        subjectId,
        dueDate,
        priority,
        category,
        status,
        description,
        pomodoros: 0
      };
      this.app.data.tasks.push(newTask);
    }

    this.app.saveData();
    this.app.closeModal();
    this.render();
    if (this.app.subjects) this.app.subjects.render();
  }

  deleteTask(taskId) {
    if (confirm('Bạn có muốn xóa kế hoạch / nhiệm vụ này?')) {
      this.app.data.tasks = this.app.data.tasks.filter(t => t.id !== taskId);
      this.app.saveData();
      this.render();
      if (this.app.subjects) this.app.subjects.render();
    }
  }
}
window.TasksManager = TasksManager;
