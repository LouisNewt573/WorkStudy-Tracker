/**
 * Subjects Manager Module
 */
class SubjectsManager {
  constructor(app) {
    this.app = app;
    this.palette = [
      '#4f46e5', // Indigo
      '#0891b2', // Cyan
      '#16a34a', // Emerald/Green
      '#ea580c', // Orange
      '#dc2626', // Red
      '#9333ea', // Purple
      '#0d9488', // Teal
      '#db2777', // Pink
      '#475569'  // Slate
    ];
  }

  render() {
    const data = this.app.data;
    const container = document.getElementById('subjects-list-container');
    const statsContainer = document.getElementById('subjects-stats-container');
    if (!container) return;

    // Calculate statistics
    const totalSubjects = data.subjects.length;
    const totalCredits = data.subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    
    // Average Grade calculation (weighted by credits)
    let totalWeightedScore = 0;
    let creditsWithGrades = 0;
    data.subjects.forEach(s => {
      if (s.currentGrade !== undefined && s.currentGrade !== null && s.currentGrade !== '') {
        const c = Number(s.credits) || 1;
        totalWeightedScore += Number(s.currentGrade) * c;
        creditsWithGrades += c;
      }
    });
    const avgScore = creditsWithGrades > 0 ? (totalWeightedScore / creditsWithGrades).toFixed(2) : 'Chưa có';

    // Pending tasks count
    const pendingTasks = data.tasks.filter(t => t.status !== 'done').length;

    // Render Stats Bar
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
            <div class="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng số môn</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-white">${totalSubjects}</p>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
            <div class="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng tín chỉ</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-white">${totalCredits} <span class="text-xs font-normal text-slate-400">tín</span></p>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
            <div class="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Điểm TB dự tính (hệ 10)</p>
              <p class="text-2xl font-bold text-slate-800 dark:text-white">${avgScore}</p>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
            <div class="p-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Deadline đang chờ</p>
              <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">${pendingTasks}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (totalSubjects === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <div class="w-16 h-16 mx-auto mb-3 text-slate-300 dark:text-slate-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Chưa có môn học nào</h3>
          <p class="text-sm text-slate-400 mt-1 mb-4">Hãy thêm các môn học của học kỳ này để bắt đầu theo dõi và lên kế hoạch!</p>
          <button onclick="window.eduApp.subjects.openModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm">
            + Thêm môn học đầu tiên
          </button>
        </div>
      `;
      return;
    }

    // Render Subjects Cards Grid
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${data.subjects.map(s => {
          const subjectTasks = data.tasks.filter(t => t.subjectId === s.id && t.status !== 'done');
          const completedTasks = data.tasks.filter(t => t.subjectId === s.id && t.status === 'done').length;
          const totalSubTasks = subjectTasks.length + completedTasks;
          const progressPercent = totalSubTasks > 0 ? Math.round((completedTasks / totalSubTasks) * 100) : 0;

          return `
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between group">
              <div>
                <!-- Top Color Accent Bar & Code -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span class="w-3.5 h-3.5 rounded-full inline-block" style="background-color: ${s.color || '#4f46e5'}"></span>
                    <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${s.code || 'MÃ MÔN'}</span>
                    <span class="text-xs font-medium text-slate-400">${s.credits || 0} tín chỉ</span>
                  </div>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <button onclick="window.eduApp.subjects.openModal('${s.id}')" title="Chỉnh sửa" class="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="window.eduApp.subjects.deleteSubject('${s.id}')" title="Xóa môn" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                <!-- Subject Title -->
                <h4 class="text-base font-bold text-slate-800 dark:text-white leading-snug mb-2">${s.name}</h4>

                <!-- Lecturer & Room Info -->
                <div class="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div class="flex items-center space-x-1.5">
                    <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span class="truncate">${s.teacher || 'Chưa cập nhật GV'}</span>
                  </div>
                  <div class="flex items-center space-x-1.5">
                    <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    <span class="truncate">${s.room || 'Chưa có phòng'}</span>
                  </div>
                </div>

                <!-- Grade Target & Current Score -->
                <div class="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-4 text-center">
                  <div>
                    <span class="block text-[11px] text-slate-400">Mục tiêu</span>
                    <span class="font-bold text-sm text-indigo-600 dark:text-indigo-400">${s.targetGrade || 'A'}</span>
                  </div>
                  <div class="border-l border-slate-200 dark:border-slate-600">
                    <span class="block text-[11px] text-slate-400">Điểm hiện tại</span>
                    <span class="font-bold text-sm text-slate-700 dark:text-slate-200">${s.currentGrade !== undefined && s.currentGrade !== '' ? s.currentGrade : '--'}</span>
                  </div>
                </div>
              </div>

              <!-- Footer with task progress -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Tiến độ nhiệm vụ</span>
                  <span class="font-semibold ${subjectTasks.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}">
                    ${subjectTasks.length} việc cần làm
                  </span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div class="h-1.5 rounded-full transition-all duration-300" style="width: ${progressPercent}%; background-color: ${s.color || '#4f46e5'}"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  openModal(subjectId = null) {
    const isEdit = !!subjectId;
    const subject = isEdit ? this.app.data.subjects.find(s => s.id === subjectId) : null;

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl modal-enter border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">${isEdit ? 'Chỉnh sửa Môn học' : 'Thêm Môn học Mới'}</h3>
            <button onclick="window.eduApp.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form id="subject-form" onsubmit="window.eduApp.subjects.handleFormSubmit(event, '${subjectId || ''}')" class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-1">
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mã môn *</label>
                <input type="text" id="sub-code" required placeholder="VD: CS101" value="${subject ? subject.code : ''}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase">
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tên môn học *</label>
                <input type="text" id="sub-name" required placeholder="VD: Lập trình Web" value="${subject ? subject.name : ''}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Số tín chỉ</label>
                <input type="number" id="sub-credits" min="1" max="15" value="${subject ? subject.credits : 3}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mục tiêu điểm</label>
                <select id="sub-target" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="A+" ${subject && subject.targetGrade === 'A+' ? 'selected' : ''}>A+ (Xuất sắc)</option>
                  <option value="A" ${!subject || subject.targetGrade === 'A' ? 'selected' : ''}>A (Giỏi)</option>
                  <option value="B+" ${subject && subject.targetGrade === 'B+' ? 'selected' : ''}>B+ (Khá giỏi)</option>
                  <option value="B" ${subject && subject.targetGrade === 'B' ? 'selected' : ''}>B (Khá)</option>
                  <option value="C" ${subject && subject.targetGrade === 'C' ? 'selected' : ''}>C (Trung bình)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Giảng viên phụ trách</label>
                <input type="text" id="sub-teacher" placeholder="VD: ThS. Nguyễn Văn A" value="${subject ? subject.teacher : ''}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phòng học / Link online</label>
                <input type="text" id="sub-room" placeholder="VD: A2-301 hoặc Zoom" value="${subject ? subject.room : ''}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Điểm hiện tại (hệ 10)</label>
                <input type="number" id="sub-grade" step="0.1" min="0" max="10" placeholder="VD: 8.5" value="${subject && subject.currentGrade !== undefined ? subject.currentGrade : ''}"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Màu sắc đại diện</label>
                <div class="flex items-center space-x-1.5 pt-1">
                  ${this.palette.map(color => `
                    <label class="cursor-pointer relative">
                      <input type="radio" name="sub-color" value="${color}" class="sr-only peer" ${(subject && subject.color === color) || (!subject && color === this.palette[0]) ? 'checked' : ''}>
                      <span class="w-6 h-6 rounded-full inline-block border-2 border-transparent peer-checked:border-slate-900 dark:peer-checked:border-white shadow-sm transition transform peer-checked:scale-110" style="background-color: ${color}"></span>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Ghi chú thêm</label>
              <textarea id="sub-notes" rows="2" placeholder="VD: Tỷ lệ điểm: CC 10%, BT 20%, Thi 70%"
                class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">${subject ? subject.notes || '' : ''}</textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onclick="window.eduApp.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
                Hủy
              </button>
              <button type="submit" class="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition">
                ${isEdit ? 'Lưu thay đổi' : 'Thêm môn học'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  handleFormSubmit(e, subjectId) {
    e.preventDefault();
    const code = document.getElementById('sub-code').value.trim();
    const name = document.getElementById('sub-name').value.trim();
    const credits = parseInt(document.getElementById('sub-credits').value, 10) || 1;
    const targetGrade = document.getElementById('sub-target').value;
    const teacher = document.getElementById('sub-teacher').value.trim();
    const room = document.getElementById('sub-room').value.trim();
    const rawGrade = document.getElementById('sub-grade').value.trim();
    const currentGrade = rawGrade !== '' ? parseFloat(rawGrade) : null;
    const notes = document.getElementById('sub-notes').value.trim();
    
    const selectedColor = document.querySelector('input[name="sub-color"]:checked')?.value || this.palette[0];

    if (!code || !name) {
      alert('Vui lòng điền mã môn và tên môn học!');
      return;
    }

    if (subjectId) {
      // Edit
      const index = this.app.data.subjects.findIndex(s => s.id === subjectId);
      if (index !== -1) {
        this.app.data.subjects[index] = {
          ...this.app.data.subjects[index],
          code,
          name,
          credits,
          targetGrade,
          teacher,
          room,
          currentGrade,
          color: selectedColor,
          notes
        };
      }
    } else {
      // Add
      const newSubject = {
        id: 'sub-' + Date.now(),
        code,
        name,
        credits,
        targetGrade,
        teacher,
        room,
        currentGrade,
        color: selectedColor,
        notes
      };
      this.app.data.subjects.push(newSubject);
    }

    this.app.saveData();
    this.app.closeModal();
    this.render();
    if (this.app.timetable) this.app.timetable.render();
    if (this.app.tasks) this.app.tasks.render();
  }

  deleteSubject(subjectId) {
    const subject = this.app.data.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    if (confirm(`Bạn có chắc chắn muốn xóa môn học "${subject.name}"? Lịch học và nhiệm vụ liên quan cũng sẽ được cập nhật.`)) {
      this.app.data.subjects = this.app.data.subjects.filter(s => s.id !== subjectId);
      this.app.data.timetable = this.app.data.timetable.filter(t => t.subjectId !== subjectId);
      // Remove or detach subject from tasks
      this.app.data.tasks = this.app.data.tasks.filter(t => t.subjectId !== subjectId);
      this.app.saveData();
      this.render();
      if (this.app.timetable) this.app.timetable.render();
      if (this.app.tasks) this.app.tasks.render();
    }
  }
}
window.SubjectsManager = SubjectsManager;
