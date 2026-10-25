# 🎓 EduPlan Studio - Ứng dụng Quản lý Môn học & Lên Kế hoạch Học tập

EduPlan Studio là một ứng dụng hiện đại, trực quan và tiện dụng, được thiết kế chuyên biệt để giúp học sinh, sinh viên và người tự học:
- **Theo dõi toàn diện các môn học**: Số tín chỉ, giảng viên, phòng học, điểm thành phần & GPA dự kiến.
- **Thời khóa biểu tuần trực quan**: Bảng phân bố tiết học từ Thứ 2 đến Chủ Nhật, hiển thị nổi bật lịch học trong ngày.
- **Lập kế hoạch & Quản lý Deadline thông minh**: Bảng Kanban (Cần làm -> Đang làm -> Hoàn thành) hoặc Danh sách đếm ngược deadline theo mức độ ưu tiên.
- **Đồng hồ Pomodoro Focus**: Tích hợp chu kỳ học tập tập trung 25/5/15 phút gắn liền với từng môn học/nhiệm vụ.
- **Lưu trữ dữ liệu an toàn & Offline-ready**: Tự động lưu trên máy (LocalStorage), hỗ trợ Xuất / Nhập file sao lưu JSON không lo mất dữ liệu.

---

## 🚀 Cách mở và sử dụng ứng dụng

1. **Cách nhanh nhất**: Nhấp đúp chuột vào file `Mo_Ung_Dung.bat` trong thư mục dự án.
2. **Hoặc**: Nhấp đúp chuột trực tiếp vào file `index.html` để mở ngay trên trình duyệt yêu thích của bạn (Google Chrome, Cốc Cốc, Microsoft Edge, Firefox, Brave...).

> Ứng dụng chạy trực tiếp trên trình duyệt máy khách, **không yêu cầu cài đặt Node.js, Python hay bất kỳ phần mềm backend phức tạp nào!**

---

## 🌟 Các tính năng nổi bật

### 1. Thời khóa biểu tuần trực quan (Weekly Timetable)
- Giao diện 7 ngày trong tuần với nhãn nhận diện môn học theo màu sắc riêng biệt.
- **Hộp thông minh "Hôm nay tôi học gì?"**: Tự động phát hiện ngày hiện tại và liệt kê các ca học, phòng học, khung giờ ngay đầu trang.
- Thêm / sửa / xóa các ca học dễ dàng chỉ với 1 click.

### 2. Kế hoạch học tập & Quản lý Deadline (Study Planner & Kanban)
- Chuyển đổi linh hoạt giữa **Bảng Kanban** (kéo thả hoặc bấm chuyển trạng thái) và **Danh sách chi tiết theo thời hạn**.
- Phân loại trực quan:
  - 📝 **Bài tập (Assignment)**
  - 🎯 **Thi / Kiểm tra (Exam)**
  - 🚀 **Đồ án / BTL (Project)**
  - 📖 **Tự ôn tập (Study)**
- Mức độ ưu tiên: Khẩn cấp (nhấp nháy cảnh báo), Cao, Trung bình, Thấp.
- Cảnh báo thời gian: *Quá hạn*, *Hết hạn hôm nay*, *Còn X ngày*.
- Bộ lọc thông minh theo từng môn học hoặc theo độ ưu tiên.

### 3. Quản lý Môn học & Tính điểm GPA (Subjects Tracking)
- Thống kê tổng số môn, tổng số tín chỉ đăng ký trong kỳ.
- Tự động tính điểm trung bình (GPA hệ 10) theo trọng số số tín chỉ của các môn.
- Quản lý mục tiêu điểm số (A+, A, B+, B, C) giúp bạn có động lực học tập.
- Thanh tiến độ (Progress bar) cho biết tỷ lệ hoàn thành các bài tập của từng môn.

### 4. Đồng hồ Tập trung Pomodoro (Focus Timer)
- Hỗ trợ phương pháp Pomodoro chuẩn: 25 phút học, 5 phút nghỉ ngắn, 15 phút nghỉ dài sau chu kỳ 4 phiên.
- Liên kết trực tiếp với các bài tập / kế hoạch trong danh sách để đếm số phiên đã nỗ lực.
- Âm thanh thông báo tự động (Web Audio API) khi hoàn thành phiên học.

### 5. Sao lưu dữ liệu & Giao diện Đêm (Dark Mode)
- Nút **Xuất dữ liệu (Export)**: Tải file `.json` về máy để lưu trữ hoặc chuyển sang máy khác.
- Nút **Khôi phục dữ liệu (Import)**: Tải file `.json` đã lưu để phục hồi mọi lịch học và nhiệm vụ.
- Nút **Chế độ Sáng / Tối (Dark/Light mode)**: Bảo vệ mắt khi học bài vào ban đêm.
- Nút **Nạp lại dữ liệu mẫu**: Khôi phục lại bộ dữ liệu học kỳ mẫu để tham khảo bất kỳ lúc nào.

---

## 📁 Cấu trúc thư mục

```text
d:\Project Antigravity/
├── index.html            # Giao diện chính ứng dụng SPA
├── Mo_Ung_Dung.bat       # Phím tắt mở app nhanh
├── README.md             # Tài liệu hướng dẫn sử dụng
├── css/
│   └── style.css         # Hiệu ứng chuyển động, thanh cuộn, hiệu ứng kính mờ
└── js/
    ├── app.js            # Điều hướng tab, Dark Mode, sự kiện toàn cục
    ├── storage.js        # Quản lý lưu trữ LocalStorage, xuất/nhập file JSON
    ├── subjects.js       # Module quản lý môn học, thống kê & GPA
    ├── timetable.js      # Module thời khóa biểu tuần trực quan
    ├── tasks.js          # Module kế hoạch học tập, Kanban & deadline countdown
    └── pomodoro.js       # Module đồng hồ tập trung Pomodoro
```
