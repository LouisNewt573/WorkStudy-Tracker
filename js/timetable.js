/**
 * Visual Weekly Timetable Module
 */
class TimetableManager {
  constructor(app) {
    this.app = app;
    this.days = [
      { id: 1, name: 'Thứ 2', short: 'T2' },
      { id: 2, name: 'Thứ 3', short: 'T3' },
      { id: 3, name: 'Thứ 4', short: 'T4' },
      { id: 4, name: 'Thứ 5', short: 'T5' },
      { id: 5, name: 'Thứ 6', short: 'T6' },
      { id: 6, name: 'Thứ 7', short: 'T7' },
      { id: 7, name: 'Chủ Nhật', short: 'CN' }
    ];
  }

  getTodayDayOfWeek() {
    // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
  }

  render() {
    const container = document.getElementById('timetable-container');
    if (!container) return;

    const data = this.app.data;
    const today = this.getTodayDayOfWeek();

    // Today's classes
    const todayClasses = data.timetable.filter(t => t.dayOfWeek === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Render Today Banner + Schedule Grid
    container.innerHTML = `
      <!-- Today's Highlight Box -->
      <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100 dark:border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-none">
            ${this.days.find(d => d.id === today)?.short || 'NA'}
          </div>
          <div>
            <h4 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Lịch học hôm nay (${this.days.find(d => d.id === today)?.name})
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${todayClasses.length > 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
                ${todayClasses.length} tiết / ca học
              </span>
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ${todayClasses.length > 0 
                ? todayClasses.map(c => {
                    const s = data.subjects.find(sub => sub.id === c.subjectId);
                    return `<b>${s ? s.name : 'Môn học'}</b> (${c.startTime} - ${c.endTime} @ ${c.room || s?.room || 'Phòng học'})`;
                  }).join(' &bull; ')
                : 'Hôm nay bạn không có lịch lên lớp. Hãy dành thời gian ôn tập hoặc làm bài tập!'}
            </p>
          </div>
        </div>
        <button onclick="window.eduApp.timetable.openModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap">
          + Thêm lịch học
        </button>
      </div>

      <!-- Weekly Grid View -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        ${this.days.map(day => {
          const isCurrentDay = day.id === today;
          const dayItems = data.timetable.filter(item => item.dayOfWeek === day.id)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return `
            <div class="flex flex-col rounded-2xl border ${isCurrentDay ? 'border-indigo-500/60 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20' : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800'} shadow-sm min-h-[350px]">
              <!-- Day Header -->
              <div class="p-3 border-b ${isCurrentDay ? 'border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/30' : 'border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50'} rounded-t-2xl flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold ${isCurrentDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}">${day.name}</span>
                  ${isCurrentDay ? '<span class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-medium">Hôm nay</span>' : ''}
                </div>
                <button onclick="window.eduApp.timetable.openModal(null, ${day.id})" title="Thêm lịch cho ngày này" class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md transition">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>

              <!-- Classes in Day -->
              <div class="p-2 space-y-2.5 flex-1">
                ${dayItems.length === 0 ? `
                  <div class="h-32 flex flex-col items-center justify-center text-center text-slate-300 dark:text-slate-600 p-2">
                    <svg class="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span class="text-xs">Không có tiết</span>
                  </div>
                ` : dayItems.map(item => {
                  const sub = data.subjects.find(s => s.id === item.subjectId);
                  const subName = sub ? sub.name : 'Môn đã xóa';
                  const subColor = sub ? sub.color : '#64748b';
                  const room = item.room || sub?.room || 'Chưa có phòng';

                  return `
                    <div class="group relative p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-750 shadow-xs hover:shadow-md transition text-left"
                         style="border-left-width: 4px; border-left-color: ${subColor}">
                      <div class="flex items-start justify-between gap-1 mb-1">
                        <span class="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1">${subName}</span>
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <button onclick="window.eduApp.timetable.openModal('${item.id}')" title="Sửa" class="text-slate-400 hover:text-indigo-600">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button onclick="window.eduApp.timetable.deleteItem('${item.id}')" title="Xóa" class="text-slate-400 hover:text-rose-600">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      </div>

                      <div class="flex items-center text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                        <svg class="w-3 h-3 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>${item.startTime} - ${item.endTime}</span>
                      </div>

                      <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span class="truncate flex items-center gap-1">
                          <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          ${room}
                        </span>
                        <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          ${item.type || 'Học'}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  openModal(timetableId = null, preselectedDay = null) {
    const isEdit = !!timetableId;
    const item = isEdit ? this.app.data.timetable.find(t => t.id === timetableId) : null;
    const subjects = this.app.data.subjects;

    if (subjects.length === 0) {
      alert('Vui lòng thêm ít nhất một môn học trước khi xếp thời khóa biểu!');
      this.app.switchTab('subjects');
      this.app.subjects.openModal();
      return;
    }

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const currentDay = item ? item.dayOfWeek : (preselectedDay || this.getTodayDayOfWeek());

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl modal-enter border border-slate-100 dark:border-slate-700">
          <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">${isEdit ? 'Chỉnh sửa Ca học' : 'Thêm Tiết học mới'}</h3>
            <button onclick="window.eduApp.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form id="timetable-form" onsubmit="window.eduApp.timetable.handleFormSubmit(event, '${timetableId || ''}')" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Môn học *</label>
              <select id="tt-subject" required class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                ${subjects.map(s => `
                  <option value="${s.id}" ${item && item.subjectId === s.id ? 'selected' : ''}>
                    ${s.code} - ${s.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Thứ trong tuần *</label>
                <select id="tt-day" required class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  ${this.days.map(d => `
                    <option value="${d.id}" ${currentDay === d.id ? 'selected' : ''}>${d.name}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Hình thức học</label>
                <select id="tt-type" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Lý thuyết" ${item && item.type === 'Lý thuyết' ? 'selected' : ''}>Lý thuyết</option>
                  <option value="Thực hành" ${item && item.type === 'Thực hành' ? 'selected' : ''}>Thực hành</option>
                  <option value="Bài tập lớn" ${item && item.type === 'Bài tập lớn' ? 'selected' : ''}>Bài tập lớn / Đồ án</option>
                  <option value="Trực tuyến" ${item && item.type === 'Trực tuyến' ? 'selected' : ''}>Học Online (Zoom/Teams)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Giờ bắt đầu *</label>
                <input type="time" id="tt-start" required value="${item ? item.startTime : '07:30'}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Giờ kết thúc *</label>
                <input type="time" id="tt-end" required value="${item ? item.endTime : '09:50'}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phòng học (tùy chọn)</label>
              <input type="text" id="tt-room" placeholder="Để trống nếu dùng phòng mặc định của môn" value="${item ? item.room || '' : ''}"
                class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onclick="window.eduApp.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
                Hủy
              </button>
              <button type="submit" class="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition">
                ${isEdit ? 'Lưu thay đổi' : 'Thêm ca học'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  handleFormSubmit(e, timetableId) {
    e.preventDefault();
    const subjectId = document.getElementById('tt-subject').value;
    const dayOfWeek = parseInt(document.getElementById('tt-day').value, 10);
    const type = document.getElementById('tt-type').value;
    const startTime = document.getElementById('tt-start').value;
    const endTime = document.getElementById('tt-end').value;
    const room = document.getElementById('tt-room').value.trim();

    if (startTime >= endTime) {
      alert('Giờ kết thúc phải sau giờ bắt đầu!');
      return;
    }

    if (timetableId) {
      const idx = this.app.data.timetable.findIndex(t => t.id === timetableId);
      if (idx !== -1) {
        this.app.data.timetable[idx] = {
          ...this.app.data.timetable[idx],
          subjectId,
          dayOfWeek,
          type,
          startTime,
          endTime,
          room
        };
      }
    } else {
      const newItem = {
        id: 'tt-' + Date.now(),
        subjectId,
        dayOfWeek,
        type,
        startTime,
        endTime,
        room
      };
      this.app.data.timetable.push(newItem);
    }

    this.app.saveData();
    this.app.closeModal();
    this.render();
  }

  deleteItem(id) {
    if (confirm('Bạn có muốn xóa ca học này khỏi thời khóa biểu?')) {
      this.app.data.timetable = this.app.data.timetable.filter(t => t.id !== id);
      this.app.saveData();
      this.render();
    }
  }
}
window.TimetableManager = TimetableManager;
