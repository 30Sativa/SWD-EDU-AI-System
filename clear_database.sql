USE EduAI_DB_V5;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. Tạm thời vô hiệu hóa tất cả các khóa ngoại (Foreign key constraints)
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- 2. Xóa toàn bộ dữ liệu từ tất cả các bảng (Ngoại trừ bảng lịch sử của Entity Framework)
EXEC sp_MSforeachtable 
    @command1 = 'SET QUOTED_IDENTIFIER ON; IF ''?'' NOT LIKE ''%__EFMigrationsHistory%'' DELETE FROM ?';
GO

-- 3. Bật lại tất cả các khóa ngoại
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
GO

PRINT N'TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC XÓA THÀNH CÔNG!';
GO
