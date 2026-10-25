# 📱 Hướng Dẫn Đồng Bộ Dữ Liệu Học Tập Giữa Máy Tính Và Điện Thoại

Để luân phiên mở ứng dụng trên cả **Máy tính** và **Điện thoại** mà **KHÔNG CẦN xuất/tải file JSON**, bạn có 2 cách thực hiện rất đơn giản sau đây:

---

## 🌟 CÁCH 1: Dùng Cloud Firebase (Đồng bộ mọi lúc mọi nơi cả 4G & Wi-Fi - Khuyên dùng)

Với cách này, dữ liệu sẽ tự động lưu lên đám mây của Google Firebase (hoàn toàn miễn phí 100% vĩnh viễn). Bạn tạo tài khoản Email/Mật khẩu và đăng nhập trên cả máy tính lẫn điện thoại, mọi thay đổi (thêm môn, deadline mới, check xong bài) sẽ tự động nhảy sang thiết bị kia ngay lập tức!

### Bước 1: Tạo dự án Firebase miễn phí (Chỉ mất 2 phút)
1. Truy cập vào trang: [https://console.firebase.google.com/](https://console.firebase.google.com/) và đăng nhập bằng tài khoản Gmail của bạn.
2. Bấm nút **"Add project"** (Thêm dự án) $\rightarrow$ Đặt tên dự án (VD: `eduplan-my-study`) $\rightarrow$ Bấm **Continue** cho đến khi hoàn tất.
3. Trong bảng điều khiển dự án vừa tạo:
   - Bấm vào menu bên trái: **Build** $\rightarrow$ **Authentication** $\rightarrow$ Bấm **Get Started** $\rightarrow$ Chọn **Email/Password** $\rightarrow$ Bật công tắc **Enable** đầu tiên $\rightarrow$ Bấm **Save**.
   - Bấm vào menu bên trái: **Build** $\rightarrow$ **Firestore Database** $\rightarrow$ Bấm **Create database** $\rightarrow$ Chọn vị trí bất kỳ $\rightarrow$ Chọn **Start in test mode** (Chế độ thử nghiệm) $\rightarrow$ Bấm **Create**.

### Bước 2: Lấy mã cấu hình Firebase
1. Bấm vào icon **Bánh răng cài đặt (Project settings)** ở góc trên bên trái màn hình Firebase.
2. Cuộn xuống mục **Your apps**, bấm vào icon Web `</>`.
3. Đặt nickname cho app (VD: `EduPlan Web`) rồi bấm **Register app**.
4. Bạn sẽ thấy một đoạn mã `firebaseConfig` tương tự như sau:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD...",
     authDomain: "eduplan-xxxx.firebaseapp.com",
     projectId: "eduplan-xxxx",
     storageBucket: "eduplan-xxxx.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. Sao chép toàn bộ đoạn mã đó.

### Bước 3: Dán vào ứng dụng EduPlan
1. Mở ứng dụng **EduPlan Studio** trên máy tính của bạn.
2. Ở thanh menu trên cùng, bấm nút **"Bật Đồng bộ Điện thoại"** (hoặc icon bánh răng đám mây).
3. Chọn tab **Cài đặt Cloud**, dán đoạn mã vừa copy vào ô và bấm **"Lưu cấu hình Cloud"**.
4. Chuyển sang tab **"Đăng ký mới"**: Nhập tên, email và mật khẩu của bạn.

---

### Bước 4: Mở trên điện thoại của bạn
Để điện thoại có thể mở web từ bất cứ đâu:
- **Cách đơn giản nhất**: Bạn có thể đưa thư mục này lên dịch vụ hosting miễn phí như **Vercel** ([vercel.com](https://vercel.com)) hoặc **Netlify** ([netlify.com](https://netlify.com)) hoặc **GitHub Pages**:
  - Chỉ cần kéo thả thư mục `Project Antigravity` vào Vercel / Netlify là bạn sẽ nhận được một đường link miễn phí như `https://eduplan-cua-ban.vercel.app`.
  - Trên điện thoại, bạn mở trình duyệt (Safari hoặc Chrome) vào link đó, bấm **Đăng nhập** với cùng Email/Mật khẩu $\rightarrow$ Toàn bộ môn học và lịch học sẽ hiện ra ngay lập tức!
  - Bạn có thể bấm nút **"Thêm vào Màn hình chính" (Add to Home Screen)** trên Safari/Chrome của điện thoại để dùng y hệt như 1 app cài từ App Store/Google Play!

---

## ⚡ CÁCH 2: Dùng Mạng Wi-Fi Nội Bộ (Không cần tạo tài khoản Cloud)

Nếu máy tính và điện thoại của bạn đang kết nối vào **cùng một mạng Wi-Fi ở nhà**:

1. Trên máy tính, nhấp đúp chuột vào file [**`Chay_May_Chu_Wifi.bat`**](file:///d:/Project%20Antigravity/Chay_May_Chu_Wifi.bat).
2. Màn hình sẽ hiện ra địa chỉ truy cập (Ví dụ: `http://192.168.1.15:8080`).
3. Cầm điện thoại lên, mở trình duyệt Safari (iPhone) hoặc Chrome (Android) và nhập chính xác địa chỉ đó vào.
4. Ứng dụng sẽ hiển thị ngay trên điện thoại của bạn!
