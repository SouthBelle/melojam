# MeloJam – Tài liệu code

Web nghe nhạc theo ngữ cảnh (học tập, làm việc, tập luyện, lái xe, nghỉ ngơi, chiều mưa).
Dự án là **web tĩnh thuần HTML + CSS + JavaScript**, không framework, không bước build, không cần server.
Mở thẳng `index.html` bằng trình duyệt (hoặc kéo cả thư mục lên Netlify / GitHub Pages).

Một `index.html` chứa **3 "trang"** hiển thị chồng nhau, bật/tắt bằng class của `<body>`:

| Trang | Thành phần HTML | Khi nào hiện |
|---|---|---|
| **Landing** (giới thiệu + đăng nhập/đăng ký) | `#landing`, `#authModal` | `body.guest` (mặc định khi mở web) |
| **Trang nghe nhạc chính** (app) | `.app` (thanh bên, 16 màn hình `#view-*`, panel phải, trình phát) | sau khi đăng nhập user thường |
| **Trang quản trị** (admin) | `#admin` | `body.admin`, sau khi đăng nhập tài khoản admin |

---

## 1. Cấu trúc thư mục

```
index.html          Khung HTML của cả 3 trang + thẻ nạp CSS/JS
css/                Style (nạp theo đúng thứ tự trong index.html)
js/                 Logic (nạp theo đúng thứ tự, tất cả là script thường, không module)
assets/img/         Ảnh bìa album / ảnh nghệ sĩ
assets/icons/       Favicon, apple-touch-icon, logo SVG, ảnh nhỏ
audio/              7 file mp3 + 2 file âm thanh quảng cáo
README.txt          Ghi chú cũ (cách thêm bài, tim yêu thích, tab bạn bè)
README.md           Tài liệu này
```

> **Thứ tự nạp rất quan trọng.** CSS sau ghi đè CSS trước; JS dùng chung biến/hàm toàn cục (`isPremium`, `nav`, `D`, `MJ_TRACKS`…) nên không đổi thứ tự thẻ `<link>`/`<script>` trong `index.html`.

### Thứ tự nạp

CSS: `base` → `responsive` → `landing` → `figma-export` → `responsive-landscape` → `landing-fixes` → `now-playing` → `landscape-mobile` → `components` → `admin` → `ads` → `library` → `theme`

JS (cuối `<body>`): `tracks` → `app` → *(HTML admin)* → `i18n` → `auth` → `a11y` → `now-playing` → `back-nav` → `select` → `admin` → `ads` → `favorites` → `friends` → `theme`

Hai script nhỏ **inline** trong `<head>` được giữ lại có chủ đích: một cái đặt `data-theme="dark"` trước khi vẽ trang (tránh nháy trắng khi tải), một cái bật class `figma` khi URL có `?figma`.

---

## 2. CSS

| File | Nội dung |
|---|---|
| `base.css` | Biến màu `:root` (`--bg --card --soft --line --tx --mu --pr …`), lưới `.app` (thanh bên / nội dung / panel phải), thành phần dùng chung (nút, thẻ, ô nhập, modal, gói Premium, công tắc), ảnh bìa dạng `.im-*` (ảnh nằm trong `assets/`) và logo `.im-logo` |
| `responsive.css` | Co giãn theo màn hình: desktop lớn (zoom `--z`), tablet, điện thoại (thanh tab dưới cùng, ẩn thanh bên) |
| `landing.css` | Toàn bộ landing: nav, hero, demo hoàn cảnh, tính năng, 3 bước, gói dịch vụ, CTA, footer, hộp thoại đăng nhập/đăng ký, hiệu ứng chuyển tab đăng nhập |
| `figma-export.css` | Chế độ `?figma`: bỏ sticky/cuộn để xuất layout sang Figma |
| `responsive-landscape.css` | Điện thoại xoay ngang |
| `landing-fixes.css` | Chỉnh nhỏ landing: hiệu ứng hiện dần khi cuộn, marquee, menu nhanh trên mobile |
| `now-playing.css` | Màn hình "Đang phát" toàn màn hình (điện thoại), thanh phát nổi, chữ chạy |
| `landscape-mobile.css` | Thanh phát và panel khi điện thoại xoay ngang, vùng an toàn (tai thỏ) |
| `components.css` | Hover của thanh phát, dropdown `<select>` tuỳ biến (`.msel`) |
| `admin.css` | Toàn bộ giao diện admin (thanh bên, KPI, bảng, modal, toast) + chuyển động |
| `ads.css` | Lớp phủ quảng cáo `.adv` |
| `library.css` | Mục Yêu thích, trang Bạn bè, thanh tab dưới chỉ có biểu tượng |
| `theme.css` | **Chế độ tối**: `html[data-theme=dark]` ghi đè biến màu và vài chỗ đặc biệt; kiểu nút chuyển giao diện |

### Chế độ sáng / tối
- Mọi màu dùng biến CSS. Dark mode chỉ **đổi giá trị biến** (và vài ghi đè nhỏ), không viết lại style từng thành phần.
- Biến thêm cho theme: `--bg2` (nền phía sau thẻ), `--hov`, `--line2`, `--tx2/--tx3` (chữ phụ), `--errbg/--dngbg/--okbg/--warnbg` (nền trạng thái), `--g1/--g2` (gradient xanh), `--glass` (RGB cho nền kính mờ), `--bar` (cột biểu đồ admin).
- Muốn đổi bảng màu tối: sửa **một dòng** `html[data-theme=dark]{…}` đầu `css/theme.css`.

---

## 3. JavaScript – tổng quan

Tất cả file là IIFE hoặc script toàn cục. Giao tiếp giữa file qua **đối tượng `window`**:

| Biến / hàm toàn cục | Định nghĩa ở | Dùng ở |
|---|---|---|
| `MJ_TRACKS` | `tracks.js` | mọi nơi cần dữ liệu bài hát |
| `nav(view,arg)`, `isPremium`, `setPremium()`, `play()` … | `app.js` | `auth.js`, `ads.js`, `favorites.js` |
| `D` (từ điển Việt→Anh), `mjT()`, `mjSetLang()` | `i18n.js` | `auth.js`, `theme.js` |
| `mjEnterAdmin()`, `MJ_ADMIN_CFG` | `admin.js` | `auth.js` (khi đăng nhập admin) |
| `MJAds`, `MJ_ADS_CFG` | `ads.js` | `app.js` (chặn / xen quảng cáo) |
| `mjFav` | `favorites.js` | `app.js`, `now-playing.js` |
| `mjTheme` | `theme.js` | nút chuyển giao diện |

### Dữ liệu lưu trên trình duyệt

| Khoá | Kho | Nội dung |
|---|---|---|
| `mj-theme` | localStorage | `"dark"` / `"light"` |
| `mj-auth` | localStorage | thông tin user đã đăng ký (demo, không có server) |
| `mj-session` | localStorage | cờ đã đăng nhập |
| `mj-premium`, `mj-sub` | localStorage | trạng thái gói Premium và chi tiết đăng ký (kỳ, tự gia hạn, phương thức) |
| `mj-fav-v1` | localStorage | danh sách bài yêu thích (đồng bộ giữa các tab) |
| `mj-volume` | localStorage | âm lượng |
| `mj-avatar` | localStorage | ảnh đại diện |
| `mj-admin-db-v2` | localStorage | "cơ sở dữ liệu" giả của admin (user, bài, giao dịch) |
| `mj-admin` | sessionStorage | giữ phiên admin khi tải lại trang |

> Đây là bản demo: **không có backend**. Đăng ký/đăng nhập, thanh toán, quảng cáo, dữ liệu admin đều mô phỏng và lưu cục bộ.

---

## 4. Trang Landing + Đăng nhập / Đăng ký

**HTML:** `#landing` (nav `.lp-nav`, hero, demo hoàn cảnh, marquee, tính năng, 3 bước, nghệ sĩ, gói dịch vụ, CTA, footer `.lp-foot`) và `#authModal` (modal đăng nhập/đăng ký).

**`js/auth.js`**
- `lpDraw / lpPick`: demo "Thử ngay: bạn đang ở hoàn cảnh nào?" – chọn chip hoàn cảnh, hiện playlist gợi ý (dữ liệu `lpCtx`).
- `lpGo`: cuộn mượt tới mục (Tính năng, Cách hoạt động, Gói dịch vụ); menu nhanh trên mobile.
- Hiệu ứng hiện dần khi cuộn, marquee chạy ngang (đo lại khi đổi ngôn ngữ qua `mjMarqMeasure`).
- Form: `openAuth(mode)` / `closeAuth` / `authMode` đổi giữa đăng nhập ↔ đăng ký; `submitAuth` kiểm tra hợp lệ từng ô (`FIELDS`, `setFieldErr`): họ tên ≥ 2 ký tự, email đúng định dạng, mật khẩu ≥ 8 ký tự có cả chữ và số, nhập lại khớp.
- `finishAuth` → `enterApp(user)`: bỏ class `guest`, nạp user (`applyUser`), mở trang chủ. Nếu `u.role==="admin"` thì gọi `mjEnterAdmin` thay vì vào app.
- Quản lý tài khoản: `saveProfile` (thông tin cá nhân), `changePass`, `pickAvatar` / `paintAvatar` (ảnh đại diện), `logout / doLogout`.

**`js/i18n.js`** – Việt (gốc) ↔ English cho **landing và modal đăng nhập**.
- Văn bản gốc là tiếng Việt ngay trong HTML; `D.en` là từ điển `"câu Việt": "English"`.
- `walk()` quét text node, `aria-label`, `placeholder` rồi thay theo ngôn ngữ; `mjT(vi, vars)` dịch chuỗi do JS sinh ra (hỗ trợ `{biến}`).
- Thêm chuỗi mới: thêm một cặp vào `D.en`.

---

## 5. Trang nghe nhạc chính

### 5.1 Bố cục HTML
`.app` = lưới 3 cột:
- **Thanh bên** (menu: Trang chủ, Album, Thể loại, Nghệ sĩ, Gợi ý theo ngữ cảnh, Gần đây, Danh sách nhạc, Yêu thích, Tài khoản, Bạn bè)
- **Nội dung** – 16 màn hình `section.view#view-*`, mỗi lúc chỉ một cái có class `on`:
  `home, search, suggest, genre, artists, artist, playlist, library, premium, account, acc-info, acc-context, acc-pass, recent, favorites, friends`
- **Panel phải** (Thư viện + đang phát) và **trình phát** dưới đáy. Trên điện thoại: ẩn thanh bên, dùng thanh tab dưới cùng (6 tab chỉ icon).

### 5.2 `js/tracks.js` – danh mục nhạc
`MJ_TRACKS = [{k, t, a, c, src, d}]`: khoá, tên bài, nghệ sĩ, khoá ảnh bìa, đường dẫn mp3, thời lượng (giây). **Đây là nơi duy nhất cần sửa để thêm bài** (xem README.txt cho các danh sách phải bổ sung thêm).

### 5.3 `js/app.js` – logic chính (≈ 550 dòng)
| Nhóm | Hàm chính |
|---|---|
| Tiện ích bài hát | `mjNorm`, `mjTrack(t,a)` (tra bài theo tên+nghệ sĩ), `mjFmt`, `mjDur`, `mjByArtist` |
| **Gợi ý theo ngữ cảnh** | dữ liệu `C` (6 hoàn cảnh), `S` (bài theo hoàn cảnh), `WHY` (lý do gợi ý); `chips`, `draw`, `guess` (đoán hoàn cảnh từ mô tả tự do), `go` |
| Tìm kiếm | `openSearch`, `doSearch` (bài hát / nghệ sĩ / playlist), `SEARCH_*` |
| Điều hướng | `nav(view,arg)` bật/tắt `#view-*`, `syncTabbar`, `genre`, `artist`, `playlist`, `friend`, thư viện `libTab` |
| **Premium & thanh toán** | `openPay`, `selectPay` (MoMo / Apple Pay / Google Pay / Thẻ), kiểm tra: `checkMomo`, `checkCardNumber` (thuật toán **Luhn**), `checkCardExpiry`, `checkCardCVV`, `submitPay`; `setPremium`, `renderActivePlan`, `toggleAuto`, đổi gói tháng↔năm (`openPlanConfirm`), huỷ gói (`confirmCancelPlan`); `billingPeriod` (49.000đ/tháng; gói năm 470.400đ = 39.200đ/tháng, giảm 20%) |
| **Trình phát** | `Audio` thật (`au`), nếu bài không có file thì **chạy giả lập** bằng bộ đếm giờ; `play / setNowPlaying`, `queue`, `advance`, `shuffleOn`, `cycleRepeat` (tắt / lặp danh sách / lặp 1 bài), `applySeek`, âm lượng, `tick`; tự cập nhật thời lượng thật từ `loadedmetadata` |
| Thông báo & panel | `toggleNotif`, `toggleRight` |

Cổng quảng cáo nằm trong trình phát: `adGate`, `holdForAd`, `peekAfterEnd` hỏi `MJAds` có phải chèn quảng cáo trước khi phát/chuyển bài.

### 5.4 `js/now-playing.js` – màn hình "Đang phát" & menu bài hát
- Mini-player trên điện thoại → mở **sheet toàn màn hình** `openNowPlaying / closeSheet`, vuốt xuống để đóng, kéo thanh tiến trình, vuốt ngang đổi bài.
- Chia sẻ bài hát `shareSong`, sao chép liên kết `copyLink`.
- Menu chuột phải / nhấn giữ trên dòng bài hát (`openMenu`): thêm vào yêu thích, mở album, mở nghệ sĩ…
- Chữ tên bài tự chạy ngang khi quá dài (`marquee`, `build/update/init`).

### 5.5 Các module phụ
| File | Vai trò |
|---|---|
| `favorites.js` | Tim yêu thích: `toggle`, `isFav`, `decorate` (gắn nút tim cho mọi dòng bài), `renderFavorites`; lưu `mj-fav-v1`, có `SEED` 5 bài mặc định; lắng nghe sự kiện `storage` để đồng bộ nhiều tab; API `window.mjFav` |
| `friends.js` | Danh sách bạn bè và "Vừa nghe: …" (`friendsList`, `window.mjFriends`) |
| `ads.js` | **Quảng cáo cho gói Miễn phí**: cấu hình ở đầu file (`MJ_ADS_CFG`: `everyEnded` nghe hết N bài, `skipLimit` bấm skip N lần, `adSeconds`, `skippableAfter`, `minGapSec`, `adSounds`); `gate` quyết định có chèn không, `showAd / tickAd / closeAd` điều khiển lớp phủ + đếm ngược "Bỏ qua sau 5s"; **Premium không bao giờ thấy quảng cáo** |
| `select.js` | Biến `<select>` trong `.field` thành dropdown đẹp (giữ `<select>` ẩn nên code cũ vẫn đọc `.value`) |
| `a11y.js` | Phần tử `[onclick]` không phải button/link tự nhận `role="button"` + `tabindex`, Enter/Space kích hoạt |
| `back-nav.js` | Nút Back của trình duyệt/điện thoại: mỗi lần `nav()` ghi một mục lịch sử nên Back lùi từng màn; đang mở popup / sheet đang phát / bảng thông báo thì Back chỉ đóng lớp đó; ở trang đầu của app thì hiện hộp "Thoát tài khoản?" thay vì văng về landing |

---

## 6. Trang quản trị (Admin)

### 6.1 Vào / ra
- Đăng nhập ở modal landing bằng tài khoản admin trong `MJ_ADMIN_CFG` (đầu `js/admin.js`):
  `admin@melojam.vn` / `MeloAdmin@2026` (**đổi trước khi dùng thật**).
- `auth.js` nhận ra `role==="admin"` → `mjEnterAdmin()`: bỏ `guest`, thêm class `admin`, hiện `#admin`, lưu `sessionStorage["mj-admin"]` để tải lại trang vẫn ở admin. `leaveAdmin()` quay lại landing.

### 6.2 Bố cục `#admin`
Thanh bên (`.ad-side`: Tổng quan, Người dùng, Nội dung, Giao dịch + chuyển giao diện, Khôi phục dữ liệu mẫu, Đăng xuất) · thanh trên `.ad-top` · vùng nội dung `#adMain` · modal `#adModal` · toast `#adToast`. Trên mobile thanh bên thành ngăn kéo (`openDrawer / closeDrawer`).

### 6.3 `js/admin.js` – logic (≈ 360 dòng)
| Nhóm | Mô tả |
|---|---|
| **Dữ liệu giả** | `ensure()` sinh dữ liệu mẫu **có hạt giống cố định** (`seed`, `rng`): 120 người dùng, danh sách bài hát, ~91 giao dịch; lưu/đọc `load / save` ở `localStorage["mj-admin-db-v2"]`; nút "Khôi phục dữ liệu mẫu" xoá và sinh lại |
| Tiện ích | định dạng tiền `money`, ngày `fdate/ftime`, "x giờ trước" `ago`, màu avatar theo tên `hue`, thoát HTML `esc`, icon SVG `ic` |
| **Tổng quan** `pageDash` | 4 KPI (tổng user, thuê bao Premium, doanh thu 30 ngày + % so kỳ trước, tổng lượt nghe), biểu đồ cột người dùng mới & doanh thu 6 tháng (`bars`), biểu đồ tròn phương thức thanh toán (`donut`), hoạt động gần đây, "Bài hát nghe nhiều nhất". Biểu đồ là **SVG tự vẽ bằng JS**, màu lấy từ biến CSS nên tự đổi theo sáng/tối |
| **Người dùng** `pageUsers` | tìm theo tên/email, lọc theo gói và trạng thái, sắp xếp cột (`sort`), phân trang `PER=10` (`pager`); `userModal` xem/sửa; **Khoá/Mở khoá** `toggleLock`, xoá `udel` (có xác nhận `confirmBox`) |
| **Nội dung** `pageSongs` | CRUD bài hát: thêm `sadd`, sửa `sedit` / `saveSong`, ẩn-hiện `stog`, xoá `sdel` |
| **Giao dịch** `pageTx` | tìm mã GD, lọc trạng thái + phương thức, **Hoàn tiền** (`refund`), **Xuất CSV** `exportCsv` |
| Khung | `render()` gọi `VIEWS[trang]`, `go(page)` đổi trang, `refreshTable()` chỉ vẽ lại bảng (giữ ô tìm kiếm đang gõ), `openModal/closeModal` có bẫy focus |

Sự kiện dùng **uỷ quyền một listener** trên `#admin` qua thuộc tính `data-act="…"` (`csv mclose mok pg refund sadd sdel sedit sort ssave stog udel ulock usave user`) – thêm hành động mới chỉ cần thêm một nhánh `case`.

---

## 7. Chế độ sáng / tối – `js/theme.js`
- Nút icon (mặt trời/mặt trăng) ở **3 chỗ**, cùng gắn thuộc tính `data-mj-theme`: cuối landing, dòng "Giao diện" trong Tài khoản, cuối thanh bên admin. Một listener `click` chung bắt mọi phần tử có thuộc tính này.
- `set(mode)`: đặt/bỏ `data-theme="dark"` trên `<html>`, lưu `mj-theme`, cập nhật `<meta name="theme-color">`, đổi `aria-label`/nhãn (qua `mjT` nên có cả tiếng Anh).
- `toggle()`: hiệu ứng mờ dần 0,35s bằng một lớp phủ chỉ đổi `opacity` (nhẹ, không giật); tự tắt khi người dùng bật *prefers-reduced-motion*.
- Đồng bộ giữa các tab qua sự kiện `storage`.
- Logo `.im-logo` có hai bản SVG (sáng/tối) đổi theo `data-theme`; sóng nhạc ở bản tối là xanh rất nhạt để không chìm vào nền.

---

## 8. Việc thường làm

| Muốn… | Sửa ở |
|---|---|
| Thêm bài hát | `audio/` + `js/tracks.js` (+ các danh sách trong README.txt) |
| Đổi màu tối | `css/theme.css` dòng `html[data-theme=dark]{…}` |
| Đổi màu thương hiệu | `--pr` trong `css/base.css` (và `css/theme.css` cho tối) |
| Chỉnh tần suất quảng cáo | `window.MJ_ADS_CFG` / mặc định ở đầu `js/ads.js` |
| Đổi giá Premium | chuỗi giá trong `setBilling` / `openPay` (`js/app.js`) và `PRICE` (`js/admin.js`) |
| Đổi tài khoản admin | `MJ_ADMIN_CFG` đầu `js/admin.js` |
| Thêm câu tiếng Anh cho landing | `D.en` trong `js/i18n.js` |
| Thêm trang admin mới | thêm nút `data-p` ở `.ad-nav`, hàm `pageXxx`, rồi đăng ký vào `TITLES` + `VIEWS` trong `js/admin.js` |

## 9. Hạn chế đã biết
- Không có backend: đăng nhập, thanh toán, dữ liệu admin chỉ là mô phỏng trong trình duyệt; xoá dữ liệu trình duyệt là mất.
- Trình duyệt chỉ cho phát nhạc sau khi người dùng bấm vào trang ít nhất một lần.
- Landing có 2 ngôn ngữ (Việt/Anh); trang nghe nhạc và admin hiện chỉ có tiếng Việt.
- Font Geologica tải từ Google Fonts; offline sẽ dùng font hệ thống.
