/**
 * Storage & State Management for EduPlan Studio
 */
const STORAGE_KEY = 'eduplan_app_data_v1';

const DEFAULT_DATA = {
  subjects: [
    {
      id: 'sub-1',
      code: 'CS102',
      name: 'Lập trình Web nâng cao',
      credits: 3,
      teacher: 'TS. Nguyễn Văn Toàn',
      room: 'A2-304',
      color: '#4f46e5', // indigo
      targetGrade: 'A',
      currentGrade: 8.8,
      notes: 'Học kỳ 1 - Thực hành React & REST API'
    },
    {
      id: 'sub-2',
      code: 'CS205',
      name: 'Cơ sở dữ liệu phân tán',
      credits: 3,
      teacher: 'ThS. Trần Thị Mai',
      room: 'B1-201',
      color: '#0891b2', // cyan
      targetGrade: 'A+',
      currentGrade: 9.0,
      notes: 'Đồ án cuối kỳ chiếm 40% số điểm'
    },
    {
      id: 'sub-3',
      code: 'ENG301',
      name: 'Tiếng Anh chuyên ngành CNTT',
      credits: 2,
      teacher: 'Cô Jessica Smith',
      room: 'Online Zoom',
      color: '#16a34a', // green
      targetGrade: 'B+',
      currentGrade: 8.0,
      notes: 'Thuyết trình nhóm tuần thứ 10'
    },
    {
      id: 'sub-4',
      code: 'MATH101',
      name: 'Xác suất thống kê ứng dụng',
      credits: 4,
      teacher: 'PGS. TS. Lê Hoàng Nam',
      room: 'C3-102',
      color: '#ea580c', // orange
      targetGrade: 'A',
      currentGrade: 8.5,
      notes: 'Kiểm tra trắc nghiệm 30 câu giữa kỳ'
    }
  ],
  timetable: [
    // days: 1: Monday, 2: Tuesday, ..., 7: Sunday
    {
      id: 'tt-1',
      subjectId: 'sub-1',
      dayOfWeek: 1, // Thứ 2
      startTime: '07:30',
      endTime: '09:50',
      room: 'A2-304',
      type: 'Lý thuyết'
    },
    {
      id: 'tt-2',
      subjectId: 'sub-3',
      dayOfWeek: 1, // Thứ 2
      startTime: '13:30',
      endTime: '15:15',
      room: 'Online Zoom',
      type: 'Thực hành'
    },
    {
      id: 'tt-3',
      subjectId: 'sub-2',
      dayOfWeek: 3, // Thứ 4
      startTime: '08:00',
      endTime: '11:15',
      room: 'B1-201',
      type: 'Thực hành máy'
    },
    {
      id: 'tt-4',
      subjectId: 'sub-4',
      dayOfWeek: 4, // Thứ 5
      startTime: '13:00',
      endTime: '16:30',
      room: 'C3-102',
      type: 'Lý thuyết'
    },
    {
      id: 'tt-5',
      subjectId: 'sub-1',
      dayOfWeek: 5, // Thứ 6
      startTime: '09:00',
      endTime: '11:30',
      room: 'Lab-3',
      type: 'Thực hành'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Hoàn thành bài tập thiết kế UI trang Dashboard',
      subjectId: 'sub-1',
      dueDate: getRelativeDate(1, '23:59'),
      priority: 'high', // 'urgent' | 'high' | 'medium' | 'low'
      category: 'assignment', // 'assignment' | 'exam' | 'project' | 'study'
      status: 'in_progress', // 'todo' | 'in_progress' | 'done'
      description: 'Làm giao diện Dashboard với Tailwind CSS và nộp file zip lên Portal.',
      pomodoros: 2
    },
    {
      id: 'task-2',
      title: 'Ôn tập chương 3: Chuẩn hóa cơ sở dữ liệu (3NF, BCNF)',
      subjectId: 'sub-2',
      dueDate: getRelativeDate(3, '20:00'),
      priority: 'urgent',
      category: 'exam',
      status: 'todo',
      description: 'Luyện 15 bài tập dạng phân rã không mất thông tin và bảo toàn phụ thuộc hàm.',
      pomodoros: 3
    },
    {
      id: 'task-3',
      title: 'Viết bài luận 500 từ về AI Ethics bằng Tiếng Anh',
      subjectId: 'sub-3',
      dueDate: getRelativeDate(5, '18:00'),
      priority: 'medium',
      category: 'assignment',
      status: 'todo',
      description: 'Chọn chủ đề Autonomous Vehicles và nộp lên Google Classroom.',
      pomodoros: 1
    },
    {
      id: 'task-4',
      title: 'Làm bài tập trắc nghiệm Xác suất biến ngẫu nhiên',
      subjectId: 'sub-4',
      dueDate: getRelativeDate(2, '22:00'),
      priority: 'high',
      category: 'assignment',
      status: 'in_progress',
      description: 'Trắc nghiệm online 20 câu tính kỳ vọng và phương sai.',
      pomodoros: 2
    },
    {
      id: 'task-5',
      title: 'Đăng ký đề tài Đồ án môn Lập trình Web',
      subjectId: 'sub-1',
      dueDate: getRelativeDate(-1, '17:00'),
      priority: 'low',
      category: 'project',
      status: 'done',
      description: 'Gửi danh sách thành viên nhóm và mô tả ứng dụng cho thầy.',
      pomodoros: 1
    }
  ],
  settings: {
    darkMode: false,
    pomodoro: {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      soundEnabled: true
    }
  }
};

function getRelativeDate(dayOffset, timeStr) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T${timeStr || '23:59'}`;
}

class StorageManager {
  static load() {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (!dataStr) {
        this.save(DEFAULT_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
      const parsed = JSON.parse(dataStr);
      // Ensure schema backwards-compatibility
      return {
        subjects: parsed.subjects || DEFAULT_DATA.subjects,
        timetable: parsed.timetable || DEFAULT_DATA.timetable,
        tasks: parsed.tasks || DEFAULT_DATA.tasks,
        settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) }
      };
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ LocalStorage:', err);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  static save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('eduplan-data-changed', { detail: data }));
    } catch (err) {
      console.error('Lỗi khi lưu dữ liệu:', err);
      alert('Không thể lưu dữ liệu vào bộ nhớ máy!');
    }
  }

  static exportJSON() {
    const data = this.load();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `eduplan_backup_${now}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.subjects || !parsed.timetable || !parsed.tasks) {
          throw new Error('Định dạng file sao lưu không hợp lệ!');
        }
        this.save(parsed);
        if (callback) callback(null, parsed);
      } catch (err) {
        if (callback) callback(err);
      }
    };
    reader.readAsText(file);
  }

  static resetToDefault() {
    this.save(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}
window.StorageManager = StorageManager;
