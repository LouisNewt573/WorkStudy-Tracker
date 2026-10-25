/**
 * Pomodoro Focus Timer Module
 */
class PomodoroManager {
  constructor(app) {
    this.app = app;
    this.timer = null;
    this.mode = 'work'; // 'work' | 'shortBreak' | 'longBreak'
    this.timeLeft = 25 * 60;
    this.isRunning = false;
    this.completedSessions = 0;
    this.currentTaskId = null;
    this.currentSubjectId = null;
  }

  getDurations() {
    const s = this.app.data.settings?.pomodoro || {};
    return {
      work: (s.workDuration || 25) * 60,
      shortBreak: (s.shortBreak || 5) * 60,
      longBreak: (s.longBreak || 15) * 60
    };
  }

  startForTask(taskId) {
    const task = this.app.data.tasks.find(t => t.id === taskId);
    if (!task) return;
    this.currentTaskId = taskId;
    this.currentSubjectId = task.subjectId;
    this.app.switchTab('pomodoro');
    this.render();
  }

  setMode(newMode) {
    this.pause();
    this.mode = newMode;
    const durations = this.getDurations();
    this.timeLeft = durations[newMode] || (25 * 60);
    this.updateDisplay();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.completeCycle();
      }
    }, 1000);
    this.updateControls();
  }

  pause() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.updateControls();
  }

  reset() {
    this.pause();
    const durations = this.getDurations();
    this.timeLeft = durations[this.mode];
    this.updateDisplay();
  }

  completeCycle() {
    this.pause();
    this.playNotificationSound();

    if (this.mode === 'work') {
      this.completedSessions++;
      if (this.currentTaskId) {
        const task = this.app.data.tasks.find(t => t.id === this.currentTaskId);
        if (task) {
          task.pomodoros = (task.pomodoros || 0) + 1;
          this.app.saveData();
        }
      }

      alert('🎉 Chúc mừng! Bạn vừa hoàn thành một phiên tập trung. Hãy nghỉ ngơi một chút nhé!');

      if (this.completedSessions % 4 === 0) {
        this.setMode('longBreak');
      } else {
        this.setMode('shortBreak');
      }
    } else {
      alert('⏰ Hết giờ nghỉ ngơi! Sẵn sàng cho phiên học tập tiếp theo chưa?');
      this.setMode('work');
    }
  }

  playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio playback not supported or blocked:', e);
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  updateDisplay() {
    const timeEl = document.getElementById('pomo-timer-display');
    const titleEl = document.getElementById('pomo-mode-title');
    const docTitle = document.querySelector('title');

    if (timeEl) timeEl.textContent = this.formatTime(this.timeLeft);
    if (docTitle) docTitle.textContent = `${this.formatTime(this.timeLeft)} - EduPlan Focus`;

    if (titleEl) {
      titleEl.textContent = this.mode === 'work' ? 'Học tập tập trung' : this.mode === 'shortBreak' ? 'Nghỉ giải lao ngắn' : 'Nghỉ giải lao dài';
    }
  }

  updateControls() {
    const playBtn = document.getElementById('pomo-play-btn');
    if (!playBtn) return;
    if (this.isRunning) {
      playBtn.innerHTML = `
        <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Tạm dừng</span>
      `;
      playBtn.className = "px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg transition flex items-center";
    } else {
      playBtn.innerHTML = `
        <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Bắt đầu học</span>
      `;
      playBtn.className = "px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition flex items-center";
    }
  }

  render() {
    const container = document.getElementById('pomodoro-container');
    if (!container) return;

    const data = this.app.data;
    const currentTask = this.currentTaskId ? data.tasks.find(t => t.id === this.currentTaskId) : null;

    container.innerHTML = `
      <div class="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl p-8 text-center relative overflow-hidden">
        <!-- Background Glow -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Mode Buttons -->
        <div class="inline-flex p-1 bg-slate-100 dark:bg-slate-700/60 rounded-2xl mb-8">
          <button onclick="window.eduApp.pomodoro.setMode('work')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.mode === 'work' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}">
            🎯 Tập trung (25p)
          </button>
          <button onclick="window.eduApp.pomodoro.setMode('shortBreak')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.mode === 'shortBreak' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}">
            ☕ Nghỉ ngắn (5p)
          </button>
          <button onclick="window.eduApp.pomodoro.setMode('longBreak')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.mode === 'longBreak' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}">
            🛋️ Nghỉ dài (15p)
          </button>
        </div>

        <!-- Linked Task / Subject Info -->
        <div class="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 text-left flex items-center justify-between">
          <div class="truncate pr-2">
            <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mục tiêu hiện tại</span>
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
              ${currentTask ? currentTask.title : 'Chung (Tự học / Đọc sách)'}
            </span>
          </div>
          <select onchange="window.eduApp.pomodoro.setTask(this.value)" class="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <option value="">-- Đổi mục tiêu --</option>
            ${data.tasks.filter(t => t.status !== 'done').map(t => `
              <option value="${t.id}" ${this.currentTaskId === t.id ? 'selected' : ''}>${t.title}</option>
            `).join('')}
          </select>
        </div>

        <!-- Big Timer Display -->
        <div class="py-6">
          <p id="pomo-mode-title" class="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            ${this.mode === 'work' ? 'Học tập tập trung' : this.mode === 'shortBreak' ? 'Nghỉ giải lao ngắn' : 'Nghỉ giải lao dài'}
          </p>
          <div id="pomo-timer-display" class="font-mono text-7xl md:text-8xl font-black text-slate-800 dark:text-white tracking-tight">
            ${this.formatTime(this.timeLeft)}
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center space-x-4 my-6">
          <button id="pomo-play-btn" onclick="window.eduApp.pomodoro.toggle()" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition flex items-center">
            <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Bắt đầu học</span>
          </button>
          <button onclick="window.eduApp.pomodoro.reset()" title="Đặt lại thời gian" class="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>

        <!-- Session Dots -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center space-x-2">
          <span class="text-xs text-slate-400 font-medium mr-2">Chu kỳ:</span>
          ${[0, 1, 2, 3].map(i => `
            <span class="w-3 h-3 rounded-full ${i < (this.completedSessions % 4) ? 'bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'bg-slate-200 dark:bg-slate-700'}"></span>
          `).join('')}
          <span class="text-xs text-slate-400 font-medium ml-2">(${this.completedSessions} phiên hôm nay)</span>
        </div>
      </div>
    `;
  }

  setTask(taskId) {
    this.currentTaskId = taskId || null;
    this.render();
  }
}
window.PomodoroManager = PomodoroManager;
