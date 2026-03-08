-- ==========================================
-- SCRIPT SAMPLE DATA EDU AI SYSTEM
-- ==========================================
USE EduAI_DB_V5;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ==========================================
-- 1. TẠO BIẾN LƯU TRỮ ID (Sử dụng ID cứng để dễ liên kết)
-- ==========================================
-- GRADE LEVELS
DECLARE @Grade_10 UNIQUEIDENTIFIER = 'A0000000-0000-0000-0000-000000000010';
DECLARE @Grade_11 UNIQUEIDENTIFIER = 'A0000000-0000-0000-0000-000000000011';
DECLARE @Grade_12 UNIQUEIDENTIFIER = 'A0000000-0000-0000-0000-000000000012';

-- SUBJECTS
DECLARE @Subj_Math UNIQUEIDENTIFIER = 'B0000000-0000-0000-0000-000000000001';
DECLARE @Subj_Phys UNIQUEIDENTIFIER = 'B0000000-0000-0000-0000-000000000002';
DECLARE @Subj_Chem UNIQUEIDENTIFIER = 'B0000000-0000-0000-0000-000000000003';
DECLARE @Subj_Eng UNIQUEIDENTIFIER  = 'B0000000-0000-0000-0000-000000000004';

-- CATEGORIES
DECLARE @Cat_Basic UNIQUEIDENTIFIER = 'C0000000-0000-0000-0000-000000000001';
DECLARE @Cat_Advanced UNIQUEIDENTIFIER = 'C0000000-0000-0000-0000-000000000002';

-- USERS (TEACHERS)
DECLARE @Teacher_1 UNIQUEIDENTIFIER = 'D0000000-0000-0000-0000-000000000001';
DECLARE @Teacher_2 UNIQUEIDENTIFIER = 'D0000000-0000-0000-0000-000000000002';
DECLARE @Teacher_3 UNIQUEIDENTIFIER = 'D0000000-0000-0000-0000-000000000003';
DECLARE @Teacher_4 UNIQUEIDENTIFIER = 'D0000000-0000-0000-0000-000000000004';

-- USERS (STUDENTS)
DECLARE @Student_1 UNIQUEIDENTIFIER = 'E0000000-0000-0000-0000-000000000001';
DECLARE @Student_2 UNIQUEIDENTIFIER = 'E0000000-0000-0000-0000-000000000002';
DECLARE @Student_3 UNIQUEIDENTIFIER = 'E0000000-0000-0000-0000-000000000003';
DECLARE @Student_4 UNIQUEIDENTIFIER = 'E0000000-0000-0000-0000-000000000004';

-- USERS (ADMIN & MANAGER)
DECLARE @Admin UNIQUEIDENTIFIER = 'A1000000-0000-0000-0000-000000000001';
DECLARE @Manager UNIQUEIDENTIFIER = '12000000-0000-0000-0000-000000000001';

-- TERMS
DECLARE @Term_HK1 UNIQUEIDENTIFIER = '70000000-0000-0000-0000-000000000001';
DECLARE @Term_HK2 UNIQUEIDENTIFIER = '70000000-0000-0000-0000-000000000002';
DECLARE @Term_Summer UNIQUEIDENTIFIER = '70000000-0000-0000-0000-000000000003';

-- TEMPLATES (Khóa học mẫu do Manager tạo)
DECLARE @Tmpl_Math10 UNIQUEIDENTIFIER = 'AA000000-0000-0000-0000-000000000001';
DECLARE @Tmpl_Phys12 UNIQUEIDENTIFIER = 'AA000000-0000-0000-0000-000000000002';
DECLARE @Tmpl_Chem11 UNIQUEIDENTIFIER = 'AA000000-0000-0000-0000-000000000003';

-- THỰC TẾ
DECLARE @Course_Math10 UNIQUEIDENTIFIER = 'F0000000-0000-0000-0000-000000000001';
DECLARE @Course_Phys12 UNIQUEIDENTIFIER = 'F0000000-0000-0000-0000-000000000002';
DECLARE @Course_Chem11 UNIQUEIDENTIFIER = 'CC000000-0000-0000-0000-000000000001';

-- CLASSES
DECLARE @Class_10A UNIQUEIDENTIFIER = 'BB000000-0000-0000-0000-000000000001';
DECLARE @Class_10B UNIQUEIDENTIFIER = 'BB000000-0000-0000-0000-000000000002';
DECLARE @Class_11A UNIQUEIDENTIFIER = 'BB000000-0000-0000-0000-000000000003';
DECLARE @Class_12A UNIQUEIDENTIFIER = 'BB000000-0000-0000-0000-000000000004';
DECLARE @Class_12B UNIQUEIDENTIFIER = 'BB000000-0000-0000-0000-000000000005';

-- ASSIGNMENTS AND OTHERS
DECLARE @Assign_Chem11_1 UNIQUEIDENTIFIER = 'DD000000-0000-0000-0000-000000000001';
DECLARE @Assign_Chem11_2 UNIQUEIDENTIFIER = 'DD000000-0000-0000-0000-000000000002';

-- ==========================================
-- XÓA DỮ LIỆU CŨ THEO ID ĐÃ ĐỊNH (Ngăn ngừa lỗi trùng lặp khi chạy nhiều lần)
-- ==========================================
-- Tắt FK Check cho nhanh và an toàn
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- Xóa dữ liệu (chỉ xóa những rows liên quan để demo)
DELETE FROM ClassSubjectTeachers;
DELETE FROM CourseClasses;
DELETE FROM StudentClasses;
DELETE FROM Classes;

DELETE FROM QuestionOptions;
DELETE FROM Questions;
DELETE FROM QuizAttempts;
DELETE FROM Quizzes;
DELETE FROM Submissions;
DELETE FROM Assignments;
DELETE FROM LessonProgress;
DELETE FROM Lessons;
DELETE FROM Sections;
DELETE FROM CourseSettings;
DELETE FROM Enrollments;
DELETE FROM Courses;

DELETE FROM Teachers;
DELETE FROM Students;
DELETE FROM UserProfiles;
DELETE FROM Users;
DELETE FROM CourseCategories;
DELETE FROM Subjects;
DELETE FROM GradeLevels;
DELETE FROM Terms;

-- Bật lại FK
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';

-- ==========================================
-- 2. TERMS
-- ==========================================
INSERT INTO Terms (Id, Code, Name, StartDate, EndDate, IsActive, CreatedAt)
VALUES 
(@Term_HK1, 'HK1_2627', N'Học Kỳ 1 (2026-2027)', '2026-09-05', '2027-01-15', 1, SYSDATETIME()),
(@Term_HK2, 'HK2_2627', N'Học Kỳ 2 (2026-2027)', '2027-01-20', '2027-05-25', 1, SYSDATETIME()),
(@Term_Summer, 'HK3_26', N'Học Kỳ Hè 2026', '2026-06-05', '2026-08-15', 0, SYSDATETIME());

-- ==========================================
-- 3. GRADE LEVELS & SUBJECTS
-- ==========================================
INSERT INTO GradeLevels (Id, Code, Name, IsActive, SortOrder, CreatedAt)
VALUES 
(@Grade_10, 'K10', N'Lớp 10', 1, 10, SYSDATETIME()),
(@Grade_11, 'K11', N'Lớp 11', 1, 11, SYSDATETIME()),
(@Grade_12, 'K12', N'Lớp 12', 1, 12, SYSDATETIME());

INSERT INTO Subjects (Id, Code, Name, NameEn, Description, IsActive, SortOrder, CreatedAt)
VALUES 
(@Subj_Math, 'MATH', N'Toán Học', 'Mathematics', N'Toán học cơ bản và nâng cao', 1, 1, SYSDATETIME()),
(@Subj_Phys, 'PHYS', N'Vật Lý', 'Physics', N'Vật lý từ cơ bản đến nâng cao', 1, 2, SYSDATETIME()),
(@Subj_Chem, 'CHEM', N'Hóa Học', 'Chemistry', N'Hóa học vô cơ, hữu cơ', 1, 3, SYSDATETIME()),
(@Subj_Eng, 'ENG', N'Tiếng Anh', 'English', N'Tiếng Anh giao tiếp và học thuật', 1, 4, SYSDATETIME());

INSERT INTO CourseCategories (Id, Name, Slug, Description, IsActive, SortOrder, CreatedAt)
VALUES 
(@Cat_Basic, N'Cơ Bản', 'co-ban', N'Khóa học nền tảng', 1, 1, SYSDATETIME()),
(@Cat_Advanced, N'Nâng Cao', 'nang-cao', N'Khóa học chuyên sâu', 1, 2, SYSDATETIME());

-- ==========================================
-- 4. USERS AND ROLES
-- ==========================================
INSERT INTO Users (Id, Email, PasswordHash, Role, IsActive, IsEmailVerified, IsFirstLogin, CreatedAt)
VALUES 
(@Teacher_1, 'gv.toan@gmail.com', '$2a$11$0Z9PmGRom9Onmf0dvz2LouiAtReDdH0Pv1N48liW0Nrb652w.yYe.', 3, 1, 1, 0, SYSDATETIME()),
(@Teacher_2, 'gv.ly@gmail.com', '$2a$11$j7HmJ2yZhUIlKiHih8r0jOdz9bwOleZBi4K3I4mjQjO5z9RLtllEK', 3, 1, 1, 0, SYSDATETIME()),
(@Teacher_3, 'anhtt@gmail.com', '$2a$11$j7HmJ2yZhUIlKiHih8r0jOdz9bwOleZBi4K3I4mjQjO5z9RLtllEK', 3, 1, 1, 0, SYSDATETIME()),
(@Teacher_4, 'gv.anh@gmail.com', '$2a$11$j7HmJ2yZhUIlKiHih8r0jOdz9bwOleZBi4K3I4mjQjO5z9RLtllEK', 3, 1, 1, 0, SYSDATETIME()),
(@Student_1, 'hs.1@gmail.com', '$2a$11$NtxHK/YiCNBuT.sQvtAVy.5eL/3Uc0fgqPQMVPpiNyNG8t/Ao8sz2', 4, 1, 1, 0, SYSDATETIME()),
(@Student_2, 'ngoc@gmail.com', '$2a$11$JstHdU/bEgylU7Vld14/AurK6V65W3wQs873IieeuuX9EbEWyjTK.', 4, 1, 1, 0, SYSDATETIME()),
(@Student_3, 'sonnh@gmail.com', '$2a$11$ve2dE2np5N4f7IdCqu2CnuspAAWzknYgv.kmfprEOf9mUrf3yjuha', 4, 1, 1, 0, SYSDATETIME()),
(@Student_4, 'ngocnguyen120305@gmail.com', '$2a$11$8b0aBPixSGc3lRoBngVfA..r99ZJ8lkxa2AoBGzcHHNGoj5Zbn19O', 4, 1, 1, 0, SYSDATETIME()),
(@Admin, 'admin@gmail.com', '$2a$11$j7HmJ2yZhUIlKiHih8r0jOdz9bwOleZBi4K3I4mjQjO5z9RLtllEK', 1, 1, 1, 0, SYSDATETIME()),
(@Manager, 'manager@gmail.com', '$2a$11$0Z9PmGRom9Onmf0dvz2LouiAtReDdH0Pv1N48liW0Nrb652w.yYe.', 2, 1, 1, 0, SYSDATETIME());

INSERT INTO UserProfiles (UserId, FullName, Gender, PhoneNumber, Address)
VALUES 
(@Teacher_1, N'Nguyễn Văn Giao Toán', 'Male', '0912345678', N'TP Hồ Chí Minh'),
(@Teacher_2, N'Trần Thị Lý Vật', 'Female', '0987654321', N'Hà Nội'),
(@Teacher_3, N'Anh TT Hoá', 'Male', '0911222333', N'TP Hồ Chí Minh'),
(@Teacher_4, N'Phạm Anh Ngữ', 'Female', '0933333333', N'Đà Nẵng'),
(@Student_1, N'Nguyễn Học Sinh 1', 'Male', '0901111111', N'Đà Nẵng'),
(@Student_2, N'Ngọc', 'Female', '0902222222', N'Huế'),
(@Student_3, N'Son NH', 'Male', '0903333333', N'Cần Thơ'),
(@Student_4, N'Ngọc Nguyễn', 'Female', '0904444444', N'Hải Phòng'),
(@Admin, 'System Admin', 'Other', '0905555555', N'Hà Nội'),
(@Manager, 'System Manager', 'Other', '0906666666', N'Hà Nội');

INSERT INTO Teachers (UserId, Bio, ExperienceYears, Verified, Rating, TotalStudents)
VALUES 
(@Teacher_1, N'Giáo viên dạy Toán chuyên nghiệp với 10 năm kinh nghiệm.', 10, 1, 4.8, 120),
(@Teacher_2, N'Tiến sĩ Vật Lý. 15 năm giảng dạy.', 15, 1, 4.9, 200),
(@Teacher_3, N'Giáo viên dạy Hóa Học, 8 năm kinh nghiệm.', 8, 1, 4.7, 80),
(@Teacher_4, N'Giáo viên tiếng Anh IELTS 8.0', 5, 1, 4.5, 90);

INSERT INTO Students (UserId, StudentCode, EnrollmentDate, GradeLevelId)
VALUES 
(@Student_1, 'HS2026101', SYSDATETIME(), @Grade_10),
(@Student_2, 'HS2026102', SYSDATETIME(), @Grade_11),
(@Student_3, 'HS2026103', SYSDATETIME(), @Grade_11),
(@Student_4, 'HS2026104', SYSDATETIME(), @Grade_10);

-- ==========================================
-- 5. CLASSES (Giáo viên chủ nhiệm duy nhất 1 lớp, 1 môn)
-- ==========================================
-- Teacher 1 (Toán) chủ nhiệm 10A
-- Teacher 4 (English, newly added) chủ nhiệm 10B
-- Teacher 3 (Hoá) chủ nhiệm 11A
-- Teacher 2 (Lý) chủ nhiệm 12A
-- We leave 12B without a homeroom teacher (NULL)
INSERT INTO Classes (Id, Code, Name, Description, TeacherId, TermId, GradeLevelId, MaxStudents, CurrentStudents, IsActive, CreatedAt)
VALUES 
(@Class_10A, '10A-HK1', N'Lớp 10A', N'Lớp chọn 10A', @Teacher_1, @Term_HK1, @Grade_10, 35, 0, 1, SYSDATETIME()),
(@Class_10B, '10B-HK1', N'Lớp 10B', N'Lớp thường 10B', @Teacher_4, @Term_HK1, @Grade_10, 35, 3, 1, SYSDATETIME()),
(@Class_11A, '11A-HK1', N'Lớp 11A', N'Lớp chọn 11A', @Teacher_3, @Term_HK1, @Grade_11, 35, 2, 1, SYSDATETIME()),
(@Class_12A, '12A-HK1', N'Lớp 12A', N'Lớp chọn 12A', @Teacher_2, @Term_HK1, @Grade_12, 35, 0, 1, SYSDATETIME()),
(@Class_12B, '12B-HK1', N'Lớp 12B', N'Lớp thường 12B', NULL, @Term_HK1, @Grade_12, 35, 0, 1, SYSDATETIME());

-- ==========================================
-- 6. STUDENT CLASSES
-- 10B: S1, S4, S2 
-- 11A: S2, S3
-- ==========================================
INSERT INTO StudentClasses (StudentId, ClassId, JoinedAt, IsActive)
VALUES
(@Student_1, @Class_10B, SYSDATETIME(), 1),
(@Student_4, @Class_10B, SYSDATETIME(), 1),
(@Student_2, @Class_10B, SYSDATETIME(), 1), -- Student_2 thuộc cả lớp 10B và 11A để demo môn học linh hoạt
(@Student_2, @Class_11A, SYSDATETIME(), 1),
(@Student_3, @Class_11A, SYSDATETIME(), 1);


-- ==========================================
-- 7. CLASS SUBJECT TEACHERS (Giáo viên dạy đúng chuyên môn)
-- ==========================================
INSERT INTO ClassSubjectTeachers (ClassId, SubjectId, TeacherId, AssignedAt)
VALUES
(@Class_10A, @Subj_Math, @Teacher_1, SYSDATETIME()),
(@Class_10B, @Subj_Math, @Teacher_1, SYSDATETIME()),
(@Class_11A, @Subj_Chem, @Teacher_3, SYSDATETIME()),
(@Class_10A, @Subj_Chem, @Teacher_3, SYSDATETIME()),
(@Class_12A, @Subj_Phys, @Teacher_2, SYSDATETIME()),
(@Class_12B, @Subj_Phys, @Teacher_2, SYSDATETIME());


-- ==========================================
-- 8. COURSES (TEMPLATES & REGULAR)
-- ==========================================
-- TEMPLATES
INSERT INTO Courses (Id, Code, Title, Slug, Description, SubjectId, GradeLevelId, TeacherId, CategoryId, Level, Language, TotalLessons, TotalDuration, Status, IsActive, CreatedAt, CreatedByUserId, IsTemplate)
VALUES
(@Tmpl_Math10, 'TMPL-MATH10', N'[TEMPLATE] Toán 10 Chuẩn', 'tmpl-toan-10', N'Khung chương trình Toán 10.', @Subj_Math, @Grade_10, NULL, @Cat_Basic, 'Beginner', 'vi-VN', 10, 600, 'Published', 1, SYSDATETIME(), @Manager, 1),
(@Tmpl_Phys12, 'TMPL-PHYS12', N'[TEMPLATE] Vật Lý 12 Chuẩn', 'tmpl-vat-ly-12', N'Khung chương trình Vật Lý 12.', @Subj_Phys, @Grade_12, NULL, @Cat_Advanced, 'Advanced', 'vi-VN', 20, 1200, 'Published', 1, SYSDATETIME(), @Manager, 1),
(@Tmpl_Chem11, 'TMPL-CHEM11', N'[TEMPLATE] Hóa 11 Chuẩn', 'tmpl-hoa-11', N'Khung chương trình Hóa Học 11.', @Subj_Chem, @Grade_11, NULL, @Cat_Basic, 'Intermediate', 'vi-VN', 15, 900, 'Published', 1, SYSDATETIME(), @Manager, 1);

-- REGULAR
INSERT INTO Courses (Id, Code, Title, Slug, Description, SubjectId, GradeLevelId, TeacherId, CategoryId, Level, Language, TotalLessons, TotalDuration, Status, IsActive, CreatedAt, CreatedByUserId, IsTemplate, SourceTemplateId)
VALUES 
(@Course_Math10, 'MATH101', N'Toán 10 Cơ Bản', 'toan-10-co-ban', N'Toán 10.', @Subj_Math, @Grade_10, @Teacher_1, @Cat_Basic, 'Beginner', 'vi-VN', 10, 600, 'Published', 1, SYSDATETIME(), @Teacher_1, 0, @Tmpl_Math10),
(@Course_Phys12, 'PHYS121', N'Vật Lý 12 Luyện Thi đại học', 'vat-ly-12-luyen-thi', N'Vật lý 12.', @Subj_Phys, @Grade_12, @Teacher_2, @Cat_Advanced, 'Advanced', 'vi-VN', 20, 1200, 'Published', 1, SYSDATETIME(), @Teacher_2, 0, @Tmpl_Phys12),
(@Course_Chem11, 'CHEM-ANHTT', N'Hóa 11 - Cô Anh TT', 'hoa-11-anh-tt', N'Hóa 11 Anh TT.', @Subj_Chem, @Grade_11, @Teacher_3, @Cat_Basic, 'Intermediate', 'vi-VN', 15, 900, 'Published', 1, SYSDATETIME(), @Teacher_3, 0, @Tmpl_Chem11);

INSERT INTO CourseSettings (CourseId, AllowAIChat, AllowDownloadResources, EnableDiscussions, PassingScore, RequireQuizCompletion)
VALUES 
(@Tmpl_Math10, 1, 1, 1, 60.0, 1),
(@Tmpl_Phys12, 1, 1, 1, 70.0, 1),
(@Tmpl_Chem11, 1, 1, 1, 65.0, 1),
(@Course_Math10, 1, 1, 1, 60.0, 1),
(@Course_Phys12, 1, 1, 1, 70.0, 1),
(@Course_Chem11, 1, 1, 1, 65.0, 1);

-- ==========================================
-- 9. COURSE CLASSES & ENROLLMENTS
-- ==========================================
INSERT INTO CourseClasses (CourseId, ClassId, AssignedAt)
VALUES
(@Course_Math10, @Class_10A, SYSDATETIME()),
(@Course_Math10, @Class_10B, SYSDATETIME()),
(@Course_Phys12, @Class_12A, SYSDATETIME()),
(@Course_Chem11, @Class_11A, SYSDATETIME());

INSERT INTO Enrollments (Id, StudentId, CourseId, EnrolledAt, Status, Progress)
VALUES 
(NEWID(), @Student_1, @Course_Math10, SYSDATETIME(), 'Active', 25.00),
(NEWID(), @Student_4, @Course_Math10, SYSDATETIME(), 'Active', 0.00),
(NEWID(), @Student_2, @Course_Chem11, SYSDATETIME(), 'Active', 20.00),
(NEWID(), @Student_3, @Course_Chem11, SYSDATETIME(), 'Active', 80.00);

-- ==========================================
-- 10. SECTIONS & LESSONS CHO TEMPLATE (Manager)
-- TEMPLATE ĐÃ CÓ SECTIONS VÀ LESSONS THEO YÊU CẦU
-- ==========================================
DECLARE @Sec_T_C1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Sec_T_C2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Sections (Id, CourseId, Title, Description, SortOrder, IsActive, CreatedAt)
VALUES 
(@Sec_T_C1, @Tmpl_Chem11, N'Chương 1: Nguyên tử - Template', N'Cấu tạo nguyên tử chuẩn', 1, 1, SYSDATETIME()),
(@Sec_T_C2, @Tmpl_Chem11, N'Chương 2: Liên kết hóa học - Template', N'Liên kết Hóa Học căn bản', 2, 1, SYSDATETIME());

INSERT INTO Lessons (Id, SectionId, Title, Slug, VideoUrl, Content, SortOrder, Duration, Status, IsPreview, IsActive, CreatedAt)
VALUES 
(NEWID(), @Sec_T_C1, N'Bài 1: Cấu tạo nguyên tử (Tmpl)', 'bai-1-tmpl', 'https://youtube.com/t', N'Tài liệu về chuẩn..', 1, 35, 'Published', 1, 1, SYSDATETIME()),
(NEWID(), @Sec_T_C2, N'Bài 1: Liên kết (Tmpl)', 'bai-2-tmpl', 'https://youtube.com/t', N'Tài liệu về liên kết..', 1, 40, 'Published', 0, 1, SYSDATETIME());


-- ==========================================
-- 11. CẤU TRÚC MÔN HÓA (COURSE_CHEM11) CÔ ANH TT
-- ==========================================
DECLARE @Sec_C1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Sec_C2 UNIQUEIDENTIFIER = NEWID();
DECLARE @Sec_C3 UNIQUEIDENTIFIER = NEWID();
DECLARE @Sec_C4 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Sections (Id, CourseId, Title, Description, SortOrder, IsActive, CreatedAt)
VALUES 
(@Sec_C1, @Course_Chem11, N'Chương 1: Khái niệm nguyên tử', N'Cấu trúc vỏ, hạt nhân, đồng vị', 1, 1, SYSDATETIME()),
(@Sec_C2, @Course_Chem11, N'Chương 2: Bảng tuần hoàn Mendeleev', N'Quy luật biến thiên', 2, 1, SYSDATETIME()),
(@Sec_C3, @Course_Chem11, N'Chương 3: Phản ứng Oxi Hóa - Khử', N'Cân bằng phương trình', 3, 1, SYSDATETIME()),
(@Sec_C4, @Course_Chem11, N'Chương 4: Tốc độ phản ứng hóa học', N'Yếu tố ảnh hưởng và bài tập', 4, 1, SYSDATETIME());

DECLARE @Les_C11 UNIQUEIDENTIFIER = NEWID(); 
DECLARE @Les_C12 UNIQUEIDENTIFIER = NEWID();
DECLARE @Les_C13 UNIQUEIDENTIFIER = NEWID();
DECLARE @Les_C21 UNIQUEIDENTIFIER = NEWID();
DECLARE @Les_C22 UNIQUEIDENTIFIER = NEWID();
DECLARE @Les_C31 UNIQUEIDENTIFIER = NEWID();
DECLARE @Les_C41 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Lessons (Id, SectionId, Title, Slug, VideoUrl, Content, SortOrder, Duration, Status, IsPreview, IsActive, CreatedAt)
VALUES 
(@Les_C11, @Sec_C1, N'Bài 1: Cấu tạo hạt nhân', 'c1-1', 'https://youtube.com/watch?v=1', N'Nội dung hạt nhân...', 1, 40, 'Published', 1, 1, SYSDATETIME()),
(@Les_C12, @Sec_C1, N'Bài 2: Vỏ Electron', 'c1-2', 'https://youtube.com/watch?v=2', N'Phân lớp mức năng lượng...', 2, 45, 'Published', 0, 1, SYSDATETIME()),
(@Les_C13, @Sec_C1, N'Bài 3: Đồng Vị', 'c1-3', 'https://youtube.com/watch?v=2a', N'Nguyên tử khối trung bình...', 3, 30, 'Published', 0, 1, SYSDATETIME()),
(@Les_C21, @Sec_C2, N'Bài 4: Khái quát bảng tuần hoàn', 'c2-1', 'https://youtube.com/watch?v=3', N'Chu kỳ, nhóm...', 1, 50, 'Published', 0, 1, SYSDATETIME()),
(@Les_C22, @Sec_C2, N'Bài 5: Xu hướng biến đổi tính chất', 'c2-2', 'https://youtube.com/watch?v=4', N'Tính kim loại, phi kim...', 2, 50, 'Published', 0, 1, SYSDATETIME()),
(@Les_C31, @Sec_C3, N'Bài 6: Phản ứng Oxi Hoá', 'c3-1', 'https://youtube.com/watch?v=5', N'Giải bài tập...', 1, 60, 'Published', 0, 1, SYSDATETIME()),
(@Les_C41, @Sec_C4, N'Bài 7: Các yếu tố tốc độ', 'c4-1', 'https://youtube.com/watch?v=6', N'Nhiệt độ, áp suất, diện tích tiếp xúc', 1, 40, 'Published', 0, 1, SYSDATETIME());

-- ==========================================
-- 12. BÀI TẬP (ASSIGNMENTS) CHO COURSE CÔ ANH TT
-- ==========================================
INSERT INTO Assignments (Id, CourseId, Title, Description, DueDate, MaxScore, IsPublished, CreatedAt)
VALUES
(@Assign_Chem11_1, @Course_Chem11, N'Bài tập về Vỏ Electron', N'Học sinh làm bài tập SGK trang 45 và nộp file PDF.', DATEADD(DAY, 7, SYSDATETIME()), 10.0, 1, SYSDATETIME()),
(@Assign_Chem11_2, @Course_Chem11, N'Báo cáo thí nghiệm Oxi Hoá Khử', N'Nộp file Word báo cáo thí nghiệm thực hành.', DATEADD(DAY, 14, SYSDATETIME()), 10.0, 1, SYSDATETIME());

-- ==========================================
-- 13. QUIZZES (FORMATIVE/SUMMATIVE)
-- FORMATIVE (Gắn vào Bài/Lesson) & SUMMATIVE (Gắn vào Khóa học)
-- ==========================================
DECLARE @Quiz_Form1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Quiz_Form2 UNIQUEIDENTIFIER = NEWID();
DECLARE @Quiz_Sum1 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Quizzes (Id, LessonId, Title, Description, MaxAttempts, PassingScore, ShowAnswers, ShuffleQuestions, IsPublished, IsActive, CreatedAt)
VALUES 
-- Formative gắn liền với Lesson
(@Quiz_Form1, @Les_C11, N'Test Mini 15 phút: Hạt Nhân', N'Bài kiểm tra nhỏ sau bài Hạt nhân', 3, 50.00, 1, 1, 1, 1, SYSDATETIME()),
(@Quiz_Form2, @Les_C21, N'Test Mini 15 phút: Bảng Tuần Hoàn', N'Kiểm tra kiến thức cốt lõi phần Tùân Hoàn', 5, 50.00, 1, 1, 1, 1, SYSDATETIME()),
-- Summative gắn liền với Course (Vì db ko có CourseId ở Quiz, nên đành gán vào Lesson cuối hoặc tạo Lesson ảo)
(@Quiz_Sum1, @Les_C41, N'ĐỀ THI GIỮA KỲ HÓA 11', N'Kiểm tra 1 tiết hệ số lớn lấy điểm.', 1, 60.00, 0, 1, 1, 1, SYSDATETIME());

-- QUESTIONS CHO QUIZZES
DECLARE @Q_F11 UNIQUEIDENTIFIER = NEWID();
DECLARE @Q_F12 UNIQUEIDENTIFIER = NEWID();
DECLARE @Q_S11 UNIQUEIDENTIFIER = NEWID();
DECLARE @Q_S12 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Questions (Id, QuizId, QuestionText, QuestionType, Points, SortOrder)
VALUES 
(@Q_F11, @Quiz_Form1, N'Hạt mang điện tích dương là gì?', 'MultipleChoice', 1.00, 1),
(@Q_F12, @Quiz_Form1, N'Khối lượng nơtron và proton chênh lệch không đáng kể (Đ/S)?', 'MultipleChoice', 1.00, 2),
(@Q_S11, @Quiz_Sum1, N'Nguyên tố nào có tính kim loại mạnh nhất?', 'MultipleChoice', 2.00, 1),
(@Q_S12, @Quiz_Sum1, N'Nguyên tố nào thuộc nhóm khí hiếm?', 'MultipleChoice', 2.00, 2);

-- OPTIONS
INSERT INTO QuestionOptions (Id, QuestionId, OptionText, IsCorrect, SortOrder)
VALUES 
(NEWID(), @Q_F11, N'Electron', 0, 1), (NEWID(), @Q_F11, N'Proton', 1, 2), (NEWID(), @Q_F11, N'Neutron', 0, 3), (NEWID(), @Q_F11, N'Positron', 0, 4),
(NEWID(), @Q_F12, N'Đúng', 1, 1), (NEWID(), @Q_F12, N'Sai', 0, 2),
(NEWID(), @Q_S11, N'Natri (Na)', 0, 1), (NEWID(), @Q_S11, N'Kali (K)', 0, 2), (NEWID(), @Q_S11, N'Franxi (Fr)', 1, 3), (NEWID(), @Q_S11, N'Liti (Li)', 0, 4),
(NEWID(), @Q_S12, N'Oxi', 0, 1), (NEWID(), @Q_S12, N'Neon', 1, 2), (NEWID(), @Q_S12, N'Lưu huỳnh', 0, 3), (NEWID(), @Q_S12, N'Cacbon', 0, 4);


-- ==========================================
-- 14. LESSON PROGRESS CHO S2 (NGOC) VÀ S3 (SONNH)
-- ==========================================
INSERT INTO LessonProgress (Id, StudentId, LessonId, IsCompleted, WatchedDuration, LastAccessedAt)
VALUES 
-- Ngọc (S2)
(NEWID(), @Student_2, @Les_C11, 1, 40, SYSDATETIME()),
(NEWID(), @Student_2, @Les_C12, 1, 45, SYSDATETIME()),
(NEWID(), @Student_2, @Les_C13, 0, 15, SYSDATETIME()),
-- Sơn (S3)
(NEWID(), @Student_3, @Les_C11, 1, 40, SYSDATETIME()),
(NEWID(), @Student_3, @Les_C12, 1, 45, SYSDATETIME()),
(NEWID(), @Student_3, @Les_C13, 1, 30, SYSDATETIME()),
(NEWID(), @Student_3, @Les_C21, 1, 50, SYSDATETIME());

PRINT 'MẪU DỮ LIỆU CẬP NHẬT HOÀN TOÀN THÀNH CÔNG!';
GO
