# EDUTEST AI

> **Hệ thống hỗ trợ thiết kế ma trận, bản đặc tả, đề kiểm tra và hướng dẫn chấm bằng AI**  
> Tuân thủ chuẩn Chương trình Giáo dục Phổ thông 2018 (GDPT 2018), Nghị định 30/2020/NĐ-CP và hướng dẫn khảo thí Bộ GD&ĐT.

---

## 1. TỔNG QUAN HỆ THỐNG

**EDUTEST AI** là nền tảng số hỗ trợ giáo viên THCS, THPT, Tổ trưởng chuyên môn và Ban giám hiệu tự động hóa và chuẩn hóa toàn diện quy trình xây dựng hồ sơ đề kiểm tra định kỳ (Giữa kì, Cuối kì).

### Nguyên tắc vận hành cốt lõi:
```
[AI Đề xuất] ──> [Hệ thống Kiểm định độc lập] ──> [Giáo viên / Tổ trưởng Phê duyệt] ──> [Chuyển bước tiếp theo]
```
- **Không cho phép AI tạo một lần ra toàn bộ hồ sơ**: Mỗi sản phẩm được sinh theo từng mô-đun riêng biệt, có dữ liệu nguồn, có mã liên kết và bắt buộc qua bước kiểm định.
- **Không giao phép tính tổng cho AI**: Toàn bộ bộ máy tính điểm, đếm số câu và kiểm định số liệu (V01 - V20) được lập trình bằng thuật toán mã thuần túy (Deterministic Programmatic Validation Engine) bảo đảm độ chính xác 100%.

---

## 2. QUY TRÌNH 9 BƯỚC THIẾT KẾ ĐỀ THI

1. **Khởi tạo đề thi (F01 - F05)**: Thiết lập thông tin kỳ thi, môn học, khối lớp, bộ sách giáo khoa, thời gian làm bài và khung năng lực.
2. **Nguồn tài liệu (F06 - F09)**: Tải lên SGK / SGV định dạng PDF / DOCX, tự động lập chỉ mục văn bản và số trang tham chiếu.
3. **Chuẩn hóa dữ liệu nguồn - Data Pack (F10 - F13)**: Phân rã Chủ đề, Bài học và danh mục Yêu cầu cần đạt (YCCĐ) có mã định danh duy nhất.
4. **Cơ cấu đề thi - Blueprint (F14 - F17)**: Thiết lập tỉ lệ ma trận nhận thức (NB 40% - TH 30% - VD 20% - VDC 10%) và số lượng từng dạng câu.
5. **Ma trận đề kiểm tra (F18 - F21)**: Bảng lưới ma trận 2 chiều tự động tính tổng điểm và kiểm tra toán học trực tiếp.
6. **Bản đặc tả đề kiểm tra (F22 - F25)**: Liên kết ma trận với chuẩn YCCĐ, chỉ rõ năng lực thành phần và nguồn trang SGK.
7. **Biên soạn & Lắp ráp đề (F26 - F33)**:
   - **Dạng 1: Trắc nghiệm 4 lựa chọn (Multiple Choice)**: 4 phương án A, B, C, D; 0.25 điểm/câu.
   - **Dạng 2: Trắc nghiệm Đúng - Sai (True/False 4 items)**: 4 ý a, b, c, d; 1.0 điểm/câu.
   - **Dạng 3: Trắc nghiệm Trả lời ngắn (Short Answer)**: Giá trị số, đơn vị, dung sai sai số; 0.5 điểm/câu.
   - **Dạng 4: Tự luận (Essay with Rubric)**: Rubric thang điểm từng bước; 1.0 điểm/câu.
   - Hỗ trợ công thức toán, lý, hóa hiển thị bằng **LaTeX KaTeX** (`$...$`).
   - Tự động xáo trộn và sinh 4 mã đề thi chuẩn (101, 102, 103, 104).
8. **Kiểm định chất lượng 20 quy tắc (V01 - V20) (F34 - F37)**: Động cơ kiểm tra toàn diện, lập Ma trận truy vết nguồn gốc (Traceability Matrix).
9. **Xuất bản đa định dạng (F38 - F43)**:
   - Tệp Excel (.xlsx): Ma trận & Bản đặc tả gộp ô và định dạng bảng chuẩn.
   - Tệp Word (.docx): Đề thi học sinh và Hướng dẫn chấm kèm Rubric chi tiết.
   - Tệp Gói dự án (.zip): Chứa toàn bộ Word, Excel, JSON và Báo cáo kiểm định.
   - Xem trước bản in A4 tiêu chuẩn trực tiếp trên trình duyệt.

---

## 3. BỘ 20 QUY TẮC KIỂM ĐỊNH CHẤT LƯỢNG (V01 - V20)

| Mã quy tắc | Tên quy tắc | Mức độ nghiêm trọng |
| :--- | :--- | :--- |
| **V01** | Tổng điểm ma trận bắt buộc đúng bằng 10.0 điểm | `CRITICAL` |
| **V02** | Sai số tỉ lệ nhận thức (NB/TH/VD/VDC) không vượt quá dung sai cho phép | `WARNING` |
| **V03** | Điểm số và số lượng câu hỏi khớp chính xác với cấu hình Blueprint | `ERROR` |
| **V04** | Tổng điểm các ô ma trận bằng tổng điểm toàn bộ đề thi | `CRITICAL` |
| **V05** | Số lượng dòng trong bản đặc tả khớp 1:1 với ma trận | `CRITICAL` |
| **V06** | Mức độ nhận thức trong đặc tả không được lệch so với ma trận | `CRITICAL` |
| **V07** | Mỗi dòng đặc tả bắt buộc tham chiếu đến một mã YCCĐ hợp lệ | `CRITICAL` |
| **V08** | Không có dòng đặc tả nào bị thiếu nội dung mô tả yêu cầu | `ERROR` |
| **V09** | Tổng số câu hỏi thực tế trong đề khớp chính xác với ma trận | `CRITICAL` |
| **V10** | Mọi câu hỏi trắc nghiệm 4 lựa chọn có đúng 1 đáp án đúng | `CRITICAL` |
| **V11** | Câu trắc nghiệm Đúng - Sai có đủ 4 lệnh hỏi a, b, c, d và có khóa đáp án | `CRITICAL` |
| **V12** | Câu trả lời ngắn có đáp án kỳ vọng và đơn vị đo chuẩn | `ERROR` |
| **V13** | Câu tự luận có Rubric chi tiết với tổng điểm các bước bằng điểm câu | `CRITICAL` |
| **V14** | Mức độ nhận thức của câu hỏi khớp với mức độ khai báo trong đặc tả | `ERROR` |
| **V15** | Mã đề con (101, 102...) giữ nguyên phân bố điểm và cấu trúc câu | `CRITICAL` |
| **V16** | Không trùng lặp nội dung câu hỏi trong cùng một đề thi | `WARNING` |
| **V17** | Mọi câu hỏi đều có liên kết truy vết ngược về nguồn SGK | `WARNING` |
| **V18** | Đề thi đã qua bước giáo viên/tổ trưởng chuyên môn phê duyệt | `CRITICAL` |
| **V19** | Cú pháp công thức LaTeX hợp lệ, đóng mở ngoặc chuẩn xác | `ERROR` |
| **V20** | Tất cả các tệp đính kèm và hình ảnh minh họa tồn tại hợp lệ | `WARNING` |

---

## 4. CÔNG NGHỆ SỬ DỤNG

- **Frontend**: React 18, Vite 6, Tailwind CSS, KaTeX, Lucide React, React Router 7.
- **Backend API**: Node.js, Express, TypeScript (TSX), Multer.
- **Tài liệu & Xuất bản**: ExcelJS (XLSX gộp ô), Docx.js (DOCX bảng biểu & rubric), JSZip (Gói ZIP dự án).
- **AI Orchestration**: Google Gemini Pro / Flash (@google/generative-ai) kết hợp Fallback sinh dữ liệu mẫu thông minh.
- **Kiểm thử tự động**: Vitest.

---

## 5. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường
Tạo tệp `.env` tại thư mục gốc (hoặc sao chép từ `.env.example`):
```env
PORT=3001
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
JWT_SECRET=edutest-jwt-secret-key-2026
NODE_ENV=development
```
*(Ghi chú: Nếu chưa cấu hình `GEMINI_API_KEY`, hệ thống sẽ tự động kích hoạt bộ giả lập AI thông minh đảm bảo 100% tính năng hoạt động mượt mà).*

### Bước 3: Khởi chạy máy chủ phát triển
Mở 2 cửa sổ terminal (hoặc chạy song song):

- **Terminal 1 - Máy chủ Backend API:**
```bash
npm run dev:server
```

- **Terminal 2 - Giao diện Frontend Client:**
```bash
npm run dev
```
Truy cập giao diện tại: **`http://localhost:5173`**

### Bước 4: Chạy kiểm thử tự động
```bash
npm test
```

### Bước 5: Đóng gói bản phát hành Production
```bash
npm run build
```

---

## 6. PHÂN QUYỀN HỆ THỐNG (RBAC)

Hệ thống hỗ trợ chuyển đổi nhanh 6 vai trò trực tiếp trên thanh công cụ để kiểm thử nghiệp vụ:
- **R01_SYSTEM_ADMIN**: Quản trị toàn hệ thống, xem nhật ký AI, cấu hình quy tắc môn học.
- **R02_SCHOOL_ADMIN**: Ban Giám Hiệu duyệt phát hành kỳ thi cấp trường.
- **R03_HEAD_OF_DEPT**: Tổ trưởng chuyên môn phê duyệt Ma trận và Bản đặc tả.
- **R04_TEACHER**: Giáo viên bộ môn khởi tạo, biên soạn câu hỏi và lắp ráp đề.
- **R05_REVIEWER**: Giáo viên phản biện thẩm định nội dung và ma trận truy vết.
- **R06_VIEWER**: Cán bộ khảo thí xem và in ấn đề thi.

---

*Phát triển cho ngành Giáo dục và Đào tạo Việt Nam • GDPT 2018*
