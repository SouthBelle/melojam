# 🎵 MeloJam

Website nghe nhạc **gợi ý theo hoàn cảnh**: chọn bạn đang học tập, làm việc, tập luyện, lái xe, nghỉ ngơi hay chiều mưa, MeloJam đưa ra playlist phù hợp kèm lý do.

> Đây là bản demo chạy hoàn toàn trên trình duyệt (không có server/cơ sở dữ liệu). Dữ liệu được lưu bằng `localStorage`.

## Cách chạy

1. Tải hoặc clone repo, giữ nguyên cấu trúc thư mục.
2. Mở `index.html` bằng trình duyệt (không cần cài đặt gì).
   Hoặc xem online qua GitHub Pages / Netlify nếu đã deploy.

> Lần đầu cần bấm vào trang một lần thì trình duyệt mới cho phát nhạc.

## Tài khoản dùng thử

| Vai trò | Cách vào |
|---|---|
| Người dùng | Bấm **Đăng ký**, nhập thông tin bất kỳ hợp lệ (mật khẩu ≥ 8 ký tự, có chữ và số) |
| Quản trị viên | Bấm **Đăng nhập** với `admin@melojam.vn` / `MeloAdmin@2026` |

## Chức năng chính

**Landing page**: giới thiệu, demo chọn hoàn cảnh, bảng giá, đăng ký / đăng nhập, Việt ↔ English.

**Trang nghe nhạc**
- Phát nhạc thật (7 bài mp3), phát / dừng / tua / lặp / ngẫu nhiên, chỉnh âm lượng
- Gợi ý playlist theo hoàn cảnh, có thể mô tả tự do
- Tìm kiếm bài hát, nghệ sĩ, playlist; thể loại, album, nghệ sĩ
- Yêu thích, gần đây, bạn bè đang nghe gì
- Gói Premium: thanh toán giả lập (MoMo, Apple Pay, Google Pay, thẻ), đổi / huỷ gói
- Gói Miễn phí có quảng cáo xen kẽ, Premium thì không
- Quản lý tài khoản: hồ sơ, ảnh đại diện, đổi mật khẩu
- Giao diện sáng / tối, dùng được trên điện thoại, máy tính bảng và máy tính

**Trang quản trị**
- Tổng quan: số liệu, biểu đồ người dùng mới, doanh thu, phương thức thanh toán
- Quản lý người dùng (tìm, lọc, khoá / mở khoá, xoá), bài hát (thêm / sửa / ẩn / xoá), giao dịch (hoàn tiền, xuất CSV)

## Công nghệ

HTML5 · CSS3 (biến CSS, Grid, Flexbox, responsive) · JavaScript thuần (không framework, không bước build) · Web Audio qua thẻ `Audio` · `localStorage`

## Cấu trúc thư mục

```
index.html     Khung HTML (landing, trang nghe nhạc, trang admin)
css/           Giao diện, chia theo từng phần (landing, admin, theme sáng/tối...)
js/            Logic, chia theo từng phần (app, auth, admin, ads, i18n...)
assets/        Ảnh bìa, icon, logo
audio/         File nhạc mp3
docs/CODE.md   Tài liệu code chi tiết
```

Mô tả chi tiết từng file và hàm xem [docs/CODE.md](docs/CODE.md).

## Lưu ý

- Đăng nhập, thanh toán và dữ liệu admin đều là **mô phỏng** cho mục đích học tập.
- Nhạc dùng để minh hoạ, bản quyền thuộc về nghệ sĩ và đơn vị phát hành tương ứng.
