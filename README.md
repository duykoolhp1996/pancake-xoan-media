# 🥞 Pancake Xoăn - Hộp Thư Đa Kênh & Pancake POS

Ứng dụng độc lập phục vụ tư vấn khách hàng đa kênh và chốt cọc kỷ yếu siêu tốc cho **Xoăn Media Studio**.

---

## 🌟 Tính Năng Cốt Lõi

1. **Dải Kênh Đa Nền Tảng (Omnichannel Rail)**:
   - Tích hợp Fanpage Facebook (Meta Graph API & Webhooks Realtime), Zalo OA, TikTok Shop, Instagram.
   - Hiển thị huy hiệu đếm tin nhắn chưa đọc theo từng kênh.

2. **Hộp Thư Hội Thoại & Bộ Lọc Nhanh**:
   - Lọc: Tất cả, Chưa trả lời, Có SĐT, Chưa có SĐT, Đã cọc.
   - Lọc theo Thẻ tag màu sắc (VIP, Cần gọi lại, Đang tư vấn, Đã cọc...).
   - Lọc theo nhân viên Sales phụ trách.

3. **Khung Chat Tương Tác 1 Chạm**:
   - Gõ phím tắt `/` để bung kịch bản tư vấn mẫu (Báo giá, Concept hot, STK cọc, Xin SĐT...).
   - Gửi Card Báo Giá kỷ yếu 1 chạm tự động tính chi phí theo sĩ số.
   - Gửi Card VietQR MB Bank có sẵn mã QR chuyển khoản cọc.

4. **Pancake POS Chốt Đơn**:
   - Chọn gói dịch vụ (Basic, VIP, The Trip, Prom...).
   - Nhập sĩ số học sinh $\rightarrow$ Tự động tính thành tiền và số tiền cọc.
   - Bấm **"Tạo Booking & Chốt Lịch Trên CRM"** $\rightarrow$ Tự động sinh mã `BK-XXXXXX`, gửi thẻ xác nhận vào chat và đẩy thẳng vào CSDL Bookings của CRM.

---

## 📡 Kết Nối REST API Máy Chủ CRM

Pancake Xoăn hoạt động độc lập và kết nối với máy chủ CRM Xoăn Media (`https://crm.xoanmedia.com/api`):
- `GET /api/customers` & `POST /api/customers`: Đồng bộ thông tin khách hàng.
- `POST /api/bookings`: Tạo đơn Booking chốt cọc vào CRM.
- `GET /api/service-packages`: Lấy danh mục các gói kỷ yếu.
- `GET /api/sales-staff`: Lấy danh sách nhân viên tư vấn.
- `GET/POST /api/facebook/webhook`: Máy chủ tiếp nhận tin nhắn Messenger tức thì (0.1s).

---

## 🚀 Hướng Dẫn Cài Đặt & Phát Triển

```bash
# Cài đặt thư viện
npm install

# Khởi chạy môi trường phát triển
npm run dev

# Biên dịch ứng dụng
npm run build

# Triển khai lên GitHub Pages
npm run deploy

# Triển khai lên Server Production
./deploy.sh
```

---

© 2026 Xoăn Media Studio. Bản quyền thuộc về hệ sinh thái Xoăn Media Suite.
