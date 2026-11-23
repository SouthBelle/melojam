MELOJAM - BẢN CÓ NHẠC THẬT
==========================

CÁCH CHẠY
  Giữ nguyên thư mục này (index.html và thư mục audio/ nằm cạnh nhau) rồi mở index.html bằng trình duyệt,
  hoặc kéo cả thư mục lên Netlify / GitHub Pages. Nếu thiếu thư mục audio/, web vẫn chạy nhưng quay về
  chế độ nghe giả lập (đếm giờ, không có tiếng).

7 BÀI HÁT (file trong audio/)  -  thời lượng đọc trực tiếp từ từng file mp3
  Crescendolls            Daft Punk     3:32 (211,80 giây)   audio/daft-punk-crescendolls.mp3
  Saturn (Gali Remix)     SZA           3:19 (199,03 giây)   audio/sza-saturn-gali-remix.mp3
  Don’t Need To Know      Galimatias    2:20 (139,86 giây)   audio/galimatias-dont-need-to-know.mp3
  red leather             53 Thieves    3:47 (226,85 giây)   audio/53-thieves-red-leather.mp3
  Lonely                  Mac Ayres     4:20 (259,79 giây)   audio/mac-ayres-lonely.mp3
  Birds Eye View          Alina Baraz   2:51 (171,39 giây)   audio/alina-baraz-birds-eye-view.mp3
  Like You Do             Joji          4:00 (240,40 giây)   audio/joji-like-you-do.mp3

Toàn bộ bài hát demo cũ đã được thay bằng 7 bài này ở mọi nơi: trang chủ, thể loại, gợi ý theo hoàn cảnh,
playlist, thư viện, gần đây, yêu thích, tìm kiếm, trang nghệ sĩ, bạn bè, landing và trang quản trị.

THÊM BÀI MỚI
  1. Bỏ file mp3 vào audio/.
  2. Thêm một dòng vào danh sách MJ_TRACKS (đầu thẻ <script> chính trong index.html):
       {k:"id",t:"Tên bài",a:"Nghệ sĩ",c:"khoá-ảnh-bìa",src:"audio/ten-file.mp3",d:SỐ_GIÂY}
     (d = thời lượng giây, có thể xem bằng:  ffprobe -show_entries format=duration file.mp3)
  3. Đưa bài vào các danh sách muốn hiện (SEARCH_SONGS, GENRES, S, SEARCH_PLAYLISTS, FRIEND_RECENT...).
  Nếu thời lượng ghi sai, khi file tải xong web tự lấy theo thời lượng thật của file.

YÊU THÍCH (tim)
  - Mọi dòng bài hát đều có nút tim; ngoài ra còn tim ở panel phải, màn hình Đang phát và mục "Thêm vào yêu thích"
    trong menu chuột phải.
  - Thích -> bài hiện ở đầu mục Yêu thích. Bỏ thích -> bài biến mất khỏi mục Yêu thích (hàng mờ dần).
  - Danh sách được lưu trong trình duyệt (localStorage, khoá "mj-fav-v1") nên tải lại trang vẫn còn,
    và đồng bộ giữa các tab. Lần chạy đầu tiên có sẵn 5 bài yêu thích mặc định; muốn bắt đầu từ danh sách
    trống thì đặt SEED=[] trong <script id="fav-js"> hoặc xoá khoá mj-fav-v1 trong localStorage.

BẠN BÈ (tab thứ 6 trên thanh tab điện thoại)
  - Thanh tab dưới cùng giờ có 6 mục: Trang chủ · Gợi ý · Thư viện · Yêu thích · Bạn bè · Tài khoản.
  - Thanh tab chỉ hiện biểu tượng (không có chữ bên dưới); tab đang chọn có nền viên thuốc xanh nhạt.
    Tên từng tab vẫn còn trong aria-label / title cho trình đọc màn hình. Muốn hiện lại chữ: xoá khối
    <style id="tabbar-icons-css"> trong index.html.
  - Trang Bạn bè liệt kê 5 người bạn với dòng "Vừa nghe: tên bài · nghệ sĩ". Bấm dòng để xem hồ sơ,
    bấm nút ▶ để nghe bài họ vừa nghe. Ở hồ sơ, dòng "‹ Bạn bè" quay lại danh sách và tab Bạn bè vẫn sáng.
  - Trên máy tính cột Bạn bè ở thanh bên vẫn dùng như cũ.

GHI CHÚ
  - Thể loại "Hip-Hop" đổi thành "Alternative" vì không còn bài nào thuộc Hip-Hop.
  - SZA có trang nghệ sĩ (mở từ tên ca sĩ hoặc tìm kiếm); ô "Top Nghệ sĩ" ở trang chủ vẫn giữ 6 nghệ sĩ cũ.
  - Một số danh sách ngữ cảnh / thể loại chỉ có 2-4 bài vì chỉ có 7 bài.
  - Trình duyệt chỉ cho phát sau khi người dùng bấm vào trang ít nhất một lần.
