/**
 * Firebase Authentication & Cloud Firestore Synchronization Module
 * Cho phép đăng nhập/đăng ký và đồng bộ 2 chiều tức thì giữa Máy tính và Điện thoại
 */
const FIREBASE_CONFIG_STORAGE_KEY = 'eduplan_firebase_config_v1';

class FirebaseSyncManager {
  constructor(app) {
    this.app = app;
    this.isInitialized = false;
    this.currentUser = null;
    this.unsubscribeFirestore = null;
    this.isSyncing = false;
  }

  // Lấy cấu hình Firebase đã lưu trên máy
  getConfig() {
    try {
      const cfg = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      return cfg ? JSON.parse(cfg) : null;
    } catch (e) {
      return null;
    }
  }

  saveConfig(configObj) {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(configObj));
    return this.initFirebase(configObj);
  }

  init() {
    const savedConfig = this.getConfig();
    if (savedConfig && savedConfig.apiKey && savedConfig.projectId) {
      this.initFirebase(savedConfig);
    } else {
      this.updateSyncUI('unconfigured');
    }
  }

  initFirebase(config) {
    try {
      if (!window.firebase) {
        console.warn('Firebase SDK chưa được tải.');
        return false;
      }

      // Tránh khởi tạo nhiều lần
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }

      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.isInitialized = true;

      // Lắng nghe trạng thái đăng nhập
      this.auth.onAuthStateChanged(user => {
        this.currentUser = user;
        this.onAuthChange(user);
      });

      return true;
    } catch (err) {
      console.error('Lỗi khởi tạo Firebase:', err);
      alert('Không thể kết nối với Firebase. Vui lòng kiểm tra lại cấu hình API Key và Project ID!');
      this.updateSyncUI('error');
      return false;
    }
  }

  onAuthChange(user) {
    if (user) {
      console.log('Đã đăng nhập tài khoản:', user.email);
      this.updateSyncUI('connected', user);
      this.startRealtimeSync(user.uid);
    } else {
      console.log('Chưa đăng nhập (chế độ khách)');
      if (this.unsubscribeFirestore) {
        this.unsubscribeFirestore();
        this.unsubscribeFirestore = null;
      }
      this.updateSyncUI('logged_out');
    }
  }

  // Lắng nghe dữ liệu thời gian thực từ Cloud Firestore
  startRealtimeSync(uid) {
    if (!this.db) return;

    this.updateSyncUI('syncing');

    const docRef = this.db.collection('users').doc(uid).collection('data').doc('study_plan');

    this.unsubscribeFirestore = docRef.onSnapshot(doc => {
      this.isSyncing = false;
      if (doc.exists) {
        const cloudData = doc.data();
        if (cloudData && cloudData.subjects) {
          console.log('Đã đồng bộ dữ liệu mới nhất từ Cloud');
          // Cập nhật state app
          this.app.data = {
            subjects: cloudData.subjects || [],
            timetable: cloudData.timetable || [],
            tasks: cloudData.tasks || [],
            settings: { ...this.app.data.settings, ...(cloudData.settings || {}) }
          };
          // Lưu vào local cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.app.data));
          this.app.refreshAllViews();
          this.updateSyncUI('synced');
        }
      } else {
        // Lần đầu đăng nhập, đẩy dữ liệu hiện tại lên Cloud
        console.log('Tạo mới dữ liệu học tập trên Cloud cho tài khoản...');
        this.pushToCloud();
      }
    }, err => {
      console.error('Lỗi khi đồng bộ Firestore:', err);
      this.updateSyncUI('error');
    });
  }

  // Đẩy dữ liệu lên Cloud khi có thay đổi từ máy hiện tại
  async pushToCloud() {
    if (!this.isInitialized || !this.currentUser || !this.db) {
      return;
    }

    try {
      this.updateSyncUI('syncing');
      const docRef = this.db.collection('users').doc(this.currentUser.uid).collection('data').doc('study_plan');
      await docRef.set({
        subjects: this.app.data.subjects,
        timetable: this.app.data.timetable,
        tasks: this.app.data.tasks,
        settings: this.app.data.settings,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      this.updateSyncUI('synced');
    } catch (err) {
      console.error('Lỗi khi đẩy dữ liệu lên Cloud:', err);
      this.updateSyncUI('error');
    }
  }

  // Đăng ký tài khoản
  async register(email, password, displayName) {
    if (!this.isInitialized) {
      throw new Error('Vui lòng thiết lập cấu hình Firebase trước khi đăng ký!');
    }
    const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
    if (displayName && userCredential.user) {
      await userCredential.user.updateProfile({ displayName });
    }
    return userCredential.user;
  }

  // Đăng nhập
  async login(email, password) {
    if (!this.isInitialized) {
      throw new Error('Vui lòng thiết lập cấu hình Firebase trước khi đăng nhập!');
    }
    const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  }

  // Đăng xuất
  async logout() {
    if (!this.isInitialized) return;
    await this.auth.signOut();
  }

  // Cập nhật thanh trạng thái đồng bộ trên Header
  updateSyncUI(status, user = this.currentUser) {
    const container = document.getElementById('cloud-sync-status-container');
    if (!container) return;

    if (status === 'unconfigured') {
      container.innerHTML = `
        <button onclick="window.eduApp.firebaseSync.openAuthModal('config')" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition">
          <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span class="hidden sm:inline">Bật Đồng bộ Điện thoại</span>
          <span class="sm:hidden">Đồng bộ</span>
        </button>
      `;
    } else if (status === 'logged_out') {
      container.innerHTML = `
        <button onclick="window.eduApp.firebaseSync.openAuthModal('login')" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition shadow-xs">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          <span>Đăng nhập Cloud</span>
        </button>
      `;
    } else if (status === 'syncing') {
      container.innerHTML = `
        <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <svg class="animate-spin w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="hidden md:inline">Đang đồng bộ...</span>
        </div>
      `;
    } else {
      // Synced / Connected
      const email = user ? (user.displayName || user.email.split('@')[0]) : 'Tài khoản';
      container.innerHTML = `
        <div class="flex items-center space-x-2 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl px-2.5 py-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-300 truncate max-w-[120px] sm:max-w-[180px]">${email}</span>
          <button onclick="window.eduApp.firebaseSync.openAuthModal('profile')" title="Quản lý tài khoản" class="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-0.5 rounded">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
      `;
    }
  }

  openAuthModal(defaultTab = 'login') {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const currentConfig = this.getConfig() || {};
    const isLoggedIn = !!this.currentUser;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl modal-enter border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div class="flex items-center space-x-2">
              <div class="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-800 dark:text-white">Đồng bộ Đám mây (Cloud Sync)</h3>
                <p class="text-[11px] text-slate-400">Dùng chung dữ liệu giữa Máy tính & Điện thoại</p>
              </div>
            </div>
            <button onclick="window.eduApp.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          ${isLoggedIn ? this.renderProfileView() : this.renderAuthTabs(defaultTab, currentConfig)}
        </div>
      </div>
    `;
  }

  renderProfileView() {
    return `
      <div class="space-y-4 py-2">
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 text-center">
          <div class="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-md">
            ${(this.currentUser.email || 'U')[0].toUpperCase()}
          </div>
          <h4 class="font-bold text-slate-800 dark:text-white text-base">${this.currentUser.displayName || 'Học viên'}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">${this.currentUser.email}</p>
          <div class="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Đang tự động đồng bộ thời gian thực</span>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button onclick="window.eduApp.firebaseSync.pushToCloud().then(() => alert('Đã ép đồng bộ dữ liệu lên Cloud thành công!'))"
            class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Đồng bộ ngay bây giờ</span>
          </button>
          
          <button onclick="window.eduApp.firebaseSync.logout().then(() => { window.eduApp.closeModal(); })"
            class="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    `;
  }

  renderAuthTabs(activeTab, currentConfig) {
    const isConfigured = !!(currentConfig.apiKey && currentConfig.projectId);

    return `
      <!-- Tab Header Buttons -->
      <div class="flex p-1 bg-slate-100 dark:bg-slate-700/60 rounded-xl mb-4">
        <button onclick="window.eduApp.firebaseSync.switchAuthTab('login')" id="tab-btn-login" class="flex-1 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'login' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs' : 'text-slate-500'}">
          Đăng nhập
        </button>
        <button onclick="window.eduApp.firebaseSync.switchAuthTab('register')" id="tab-btn-register" class="flex-1 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'register' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs' : 'text-slate-500'}">
          Đăng ký mới
        </button>
        <button onclick="window.eduApp.firebaseSync.switchAuthTab('config')" id="tab-btn-config" class="flex-1 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'config' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs' : 'text-slate-500'}">
          Cài đặt Cloud
        </button>
      </div>

      <!-- Tab 1: Đăng nhập -->
      <div id="auth-panel-login" class="${activeTab === 'login' ? '' : 'hidden'} space-y-3">
        ${!isConfigured ? `
          <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
            <svg class="w-4 h-4 shrink-0 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <span>Bạn cần kết nối Firebase Cloud trước khi đăng nhập. Hãy bấm sang tab <b>Cài đặt Cloud</b> (hoàn toàn miễn phí, chỉ mất 1 phút).</span>
            </div>
          </div>
        ` : ''}

        <form onsubmit="window.eduApp.firebaseSync.handleLogin(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email đăng nhập</label>
            <input type="email" id="auth-login-email" required placeholder="vidu@gmail.com"
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mật khẩu</label>
            <input type="password" id="auth-login-pass" required placeholder="••••••••"
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <button type="submit" ${!isConfigured ? 'disabled' : ''} class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm">
            Đăng nhập & Đồng bộ dữ liệu
          </button>
        </form>
      </div>

      <!-- Tab 2: Đăng ký -->
      <div id="auth-panel-register" class="${activeTab === 'register' ? '' : 'hidden'} space-y-3">
        <form onsubmit="window.eduApp.firebaseSync.handleRegister(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Họ và tên của bạn</label>
            <input type="text" id="auth-reg-name" required placeholder="Nguyễn Văn A"
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email</label>
            <input type="email" id="auth-reg-email" required placeholder="vidu@gmail.com"
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mật khẩu (tối thiểu 6 ký tự)</label>
            <input type="password" id="auth-reg-pass" minlength="6" required placeholder="••••••••"
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <button type="submit" ${!isConfigured ? 'disabled' : ''} class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm">
            Tạo tài khoản & Bắt đầu đồng bộ
          </button>
        </form>
      </div>

      <!-- Tab 3: Cài đặt Cloud Config -->
      <div id="auth-panel-config" class="${activeTab === 'config' ? '' : 'hidden'} space-y-3">
        <div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Dán cấu hình <b>Firebase Config</b> của bạn vào đây. Dữ liệu chỉ cần dán 1 lần và sẽ lưu an toàn trong trình duyệt của bạn.
        </div>
        <form onsubmit="window.eduApp.firebaseSync.handleSaveConfig(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Dán đoạn mã firebaseConfig (JSON hoặc JS)</label>
            <textarea id="auth-config-raw" rows="6" placeholder='apiKey: "...",&#10;authDomain: "...",&#10;projectId: "..."'
              class="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">${currentConfig.apiKey ? JSON.stringify(currentConfig, null, 2) : ''}</textarea>
          </div>
          <button type="submit" class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
            Lưu cấu hình Cloud
          </button>
        </form>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500">
          💡 Chưa có Firebase? Xem file <a href="#" onclick="alert('Hãy mở file HUONG_DAN_DONG_BO_DIEN_THOAI.md trong thư mục để xem hướng dẫn 4 bước tạo tài khoản Firebase miễn phí 100%!'); return false;" class="text-indigo-600 underline font-semibold">HUONG_DAN_DONG_BO_DIEN_THOAI.md</a> đi kèm để tạo miễn phí trong 2 phút!
        </div>
      </div>
    `;
  }

  switchAuthTab(tab) {
    ['login', 'register', 'config'].forEach(t => {
      const panel = document.getElementById(`auth-panel-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (panel) panel.classList.toggle('hidden', t !== tab);
      if (btn) {
        if (t === tab) {
          btn.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-white dark:bg-slate-800 text-indigo-600 shadow-xs";
        } else {
          btn.className = "flex-1 py-1.5 rounded-lg text-xs font-bold transition text-slate-500";
        }
      }
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('auth-login-email').value.trim();
    const pass = document.getElementById('auth-login-pass').value;
    try {
      await this.login(email, pass);
      alert('Đăng nhập thành công! Dữ liệu đang được đồng bộ tự động giữa các thiết bị.');
      this.app.closeModal();
    } catch (err) {
      alert('Đăng nhập thất bại: ' + err.message);
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('auth-reg-name').value.trim();
    const email = document.getElementById('auth-reg-email').value.trim();
    const pass = document.getElementById('auth-reg-pass').value;
    try {
      await this.register(email, pass, name);
      alert('Tạo tài khoản thành công! Dữ liệu học tập của bạn đã được liên kết với đám mây.');
      this.app.closeModal();
    } catch (err) {
      alert('Đăng ký thất bại: ' + err.message);
    }
  }

  handleSaveConfig(e) {
    e.preventDefault();
    const raw = document.getElementById('auth-config-raw').value.trim();
    if (!raw) {
      alert('Vui lòng dán đoạn mã cấu hình Firebase!');
      return;
    }

    try {
      let configObj = null;
      if (raw.startsWith('{') && raw.endsWith('}')) {
        configObj = JSON.parse(raw);
      } else {
        // Trích xuất các key phổ biến nếu người dùng copy cả đoạn `const firebaseConfig = { ... }`
        const extractKey = (key) => {
          const m = raw.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
          return m ? m[1] : '';
        };
        configObj = {
          apiKey: extractKey('apiKey'),
          authDomain: extractKey('authDomain'),
          projectId: extractKey('projectId'),
          storageBucket: extractKey('storageBucket'),
          messagingSenderId: extractKey('messagingSenderId'),
          appId: extractKey('appId')
        };
      }

      if (!configObj.apiKey || !configObj.projectId) {
        throw new Error('Không tìm thấy apiKey hoặc projectId trong cấu hình!');
      }

      this.saveConfig(configObj);
      alert('Đã lưu cấu hình Firebase Cloud thành công! Bây giờ bạn có thể Đăng ký hoặc Đăng nhập.');
      this.switchAuthTab('login');
    } catch (err) {
      alert('Định dạng cấu hình chưa chính xác: ' + err.message);
    }
  }
}

window.FirebaseSyncManager = FirebaseSyncManager;
