/**
 * Main Application Controller for EduPlan Studio
 */
class EduPlanApp {
  constructor() {
    this.data = StorageManager.load();
    this.currentTab = 'timetable'; // Default tab based on user preference

    // Initialize Sub-Managers
    this.subjects = new SubjectsManager(this);
    this.timetable = new TimetableManager(this);
    this.tasks = new TasksManager(this);
    this.pomodoro = new PomodoroManager(this);
    this.firebaseSync = new FirebaseSyncManager(this);

    this.init();
  }

  init() {
    this.applyTheme();
    this.bindEvents();
    this.switchTab(this.currentTab);
    this.updateHeaderStats();
    this.firebaseSync.init();

    // Listen for data change events
    window.addEventListener('eduplan-data-changed', (e) => {
      this.data = e.detail;
      this.updateHeaderStats();
    });
  }

  refreshAllViews() {
    this.updateHeaderStats();
    if (this.currentTab === 'timetable') this.timetable.render();
    else if (this.currentTab === 'tasks') this.tasks.render();
    else if (this.currentTab === 'subjects') this.subjects.render();
    else if (this.currentTab === 'pomodoro') this.pomodoro.render();
  }

  saveData() {
    StorageManager.save(this.data);
    this.updateHeaderStats();
    if (this.firebaseSync) {
      this.firebaseSync.pushToCloud();
    }
  }

  applyTheme() {
    const isDark = !!this.data.settings?.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    this.data.settings.darkMode = !this.data.settings.darkMode;
    this.saveData();
    this.applyTheme();
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update Tab Navigation Buttons UI
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-tab');
      const isMobile = btn.closest('.md\\:hidden') !== null;
      if (target === tabName) {
        if (isMobile) {
          btn.classList.add('text-indigo-600', 'dark:text-indigo-400', 'font-black');
          btn.classList.remove('text-slate-500', 'dark:text-slate-400');
        } else {
          btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
          btn.classList.remove('text-slate-600', 'hover:bg-slate-100', 'dark:text-slate-300', 'dark:hover:bg-slate-800');
        }
      } else {
        if (isMobile) {
          btn.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'font-black');
          btn.classList.add('text-slate-500', 'dark:text-slate-400');
        } else {
          btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
          btn.classList.add('text-slate-600', 'hover:bg-slate-100', 'dark:text-slate-300', 'dark:hover:bg-slate-800');
        }
      }
    });

    // Toggle Content Sections
    const tabs = ['timetable', 'tasks', 'subjects', 'pomodoro'];
    tabs.forEach(t => {
      const section = document.getElementById(`tab-section-${t}`);
      if (section) {
        if (t === tabName) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      }
    });

    // Render active view
    if (tabName === 'timetable') this.timetable.render();
    else if (tabName === 'tasks') this.tasks.render();
    else if (tabName === 'subjects') this.subjects.render();
    else if (tabName === 'pomodoro') this.pomodoro.render();
  }

  updateHeaderStats() {
    const urgentCount = this.data.tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
    const badge = document.getElementById('urgent-header-badge');
    if (badge) {
      if (urgentCount > 0) {
        badge.textContent = `${urgentCount} việc khẩn cấp`;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  closeModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }
  }

  bindEvents() {
    // Navigation clicks
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Dark Mode Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleDarkMode());
    }

    // Export Data
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => StorageManager.exportJSON());
    }

    // Import Data
    const importInput = document.getElementById('import-file-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          StorageManager.importJSON(file, (err, newData) => {
            if (err) {
              alert('Lỗi nhập dữ liệu: ' + err.message);
            } else {
              this.data = newData;
              this.applyTheme();
              this.switchTab(this.currentTab);
              alert('Đã khôi phục dữ liệu thành công!');
            }
          });
        }
      });
    }

    // Reset Data
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn đặt lại dữ liệu mẫu ban đầu? Toàn bộ dữ liệu hiện tại sẽ được thay thế.')) {
          this.data = StorageManager.resetToDefault();
          this.applyTheme();
          this.switchTab(this.currentTab);
          alert('Đã nạp lại dữ liệu học tập mẫu thành công!');
        }
      });
    }

    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
}

// Bootstrap on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.eduApp = new EduPlanApp();
});
