using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Context;

public partial class EduAiDbV5Context : DbContext
{
    public EduAiDbV5Context()
    {
    }

    public EduAiDbV5Context(DbContextOptions<EduAiDbV5Context> options)
        : base(options)
    {
    }

    public virtual DbSet<AilessonDraft> AilessonDrafts { get; set; }

    public virtual DbSet<AilessonDraftBlock> AilessonDraftBlocks { get; set; }

    public virtual DbSet<Ailog> Ailogs { get; set; }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<AttemptAnswer> AttemptAnswers { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CourseCategory> CourseCategories { get; set; }

    public virtual DbSet<CourseClass> CourseClasses { get; set; }

    public virtual DbSet<CourseSetting> CourseSettings { get; set; }

    public virtual DbSet<Enrollment> Enrollments { get; set; }

    public virtual DbSet<GradeLevel> GradeLevels { get; set; }

    public virtual DbSet<Lesson> Lessons { get; set; }

    public virtual DbSet<LessonBlock> LessonBlocks { get; set; }

    public virtual DbSet<LessonFaq> LessonFaqs { get; set; }

    public virtual DbSet<LessonProgress> LessonProgresses { get; set; }

    public virtual DbSet<LoginAttempt> LoginAttempts { get; set; }

    public virtual DbSet<LoginSession> LoginSessions { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<PasswordReset> PasswordResets { get; set; }

    public virtual DbSet<Question> Questions { get; set; }

    public virtual DbSet<QuestionOption> QuestionOptions { get; set; }

    public virtual DbSet<Quiz> Quizzes { get; set; }

    public virtual DbSet<QuizAttempt> QuizAttempts { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Section> Sections { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<StudentClass> StudentClasses { get; set; }

    public virtual DbSet<StudentQuestion> StudentQuestions { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<Submission> Submissions { get; set; }

    public virtual DbSet<Teacher> Teachers { get; set; }

    public virtual DbSet<TeacherDocument> TeacherDocuments { get; set; }

    public virtual DbSet<Term> Terms { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    //    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
    //        => optionsBuilder.UseSqlServer("Data Source=(local);Database=EduAI_DB_V5;User Id=sa;Password=12345;TrustServerCertificate=true;Trusted_Connection=SSPI;Encrypt=false;");

   
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AilessonDraft>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AILesson__3214EC077140B623");

            entity.ToTable("AILessonDrafts");

            entity.HasIndex(e => e.DocumentId, "IX_AILessonDrafts_DocumentId");

            entity.HasIndex(e => e.Status, "IX_AILessonDrafts_Status");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.ModelUsed).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Document).WithMany(p => p.AilessonDrafts)
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AILessonD__Docum__3DE82FB7");
        });

        modelBuilder.Entity<AilessonDraftBlock>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AILesson__3214EC078940AC6D");

            entity.ToTable("AILessonDraftBlocks");

            entity.HasIndex(e => e.DraftLessonId, "IX_AILessonDraftBlocks_DraftLessonId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.BlockType).HasMaxLength(30);
            entity.Property(e => e.IsEditedByTeacher).HasDefaultValue(false);

            entity.HasOne(d => d.DraftLesson).WithMany(p => p.AilessonDraftBlocks)
                .HasForeignKey(d => d.DraftLessonId)
                .HasConstraintName("FK__AILessonD__Draft__43A1090D");
        });

        modelBuilder.Entity<Ailog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AILogs__3214EC076DCF5F35");

            entity.ToTable("AILogs");

            entity.HasIndex(e => e.CreatedAt, "IX_AILogs_CreatedAt");

            entity.HasIndex(e => e.Feature, "IX_AILogs_Feature");

            entity.HasIndex(e => e.UserId, "IX_AILogs_UserId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Cost).HasColumnType("decimal(10, 6)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Feature).HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.Ailogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__AILogs__UserId__67DE6983");
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Assignme__3214EC074864DDC7");

            entity.HasIndex(e => e.CourseId, "IX_Assignments_CourseId");

            entity.HasIndex(e => e.DueDate, "IX_Assignments_DueDate");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsPublished).HasDefaultValue(false);
            entity.Property(e => e.MaxScore)
                .HasDefaultValue(10m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Course).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__Assignmen__Cours__28ED12D1");
        });

        modelBuilder.Entity<AttemptAnswer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AttemptA__3214EC0716B5A266");

            entity.HasIndex(e => e.AttemptId, "IX_AttemptAnswers_AttemptId");

            entity.HasIndex(e => new { e.AttemptId, e.QuestionId }, "UQ__AttemptA__59C66E1DF39AD1A1").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.PointsEarned).HasColumnType("decimal(6, 2)");

            entity.HasOne(d => d.Attempt).WithMany(p => p.AttemptAnswers)
                .HasForeignKey(d => d.AttemptId)
                .HasConstraintName("FK__AttemptAn__Attem__1F63A897");

            entity.HasOne(d => d.Question).WithMany(p => p.AttemptAnswers)
                .HasForeignKey(d => d.QuestionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AttemptAn__Quest__2057CCD0");

            entity.HasOne(d => d.SelectedOption).WithMany(p => p.AttemptAnswers)
                .HasForeignKey(d => d.SelectedOptionId)
                .HasConstraintName("FK__AttemptAn__Selec__214BF109");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AuditLog__3214EC076120C5A9");

            entity.HasIndex(e => e.CreatedAt, "IX_AuditLogs_CreatedAt");

            entity.HasIndex(e => new { e.Entity, e.EntityId }, "IX_AuditLogs_Entity");

            entity.HasIndex(e => e.UserId, "IX_AuditLogs_UserId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Entity).HasMaxLength(50);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.UserAgent).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__AuditLogs__UserI__6CA31EA0");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Classes__3214EC07015F4093");

            entity.HasIndex(e => e.TeacherId, "IX_Classes_TeacherId");

            entity.HasIndex(e => e.TermId, "IX_Classes_TermId");

            entity.HasIndex(e => e.Code, "UQ__Classes__A25C5AA77C2C065D").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Code).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.CurrentStudents).HasDefaultValue(0);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MaxStudents).HasDefaultValue(50);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.GradeLevel).WithMany(p => p.Classes)
                .HasForeignKey(d => d.GradeLevelId)
                .HasConstraintName("FK__Classes__GradeLe__3D2915A8");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Classes)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("FK__Classes__Teacher__3B40CD36");

            entity.HasOne(d => d.Term).WithMany(p => p.Classes)
                .HasForeignKey(d => d.TermId)
                .HasConstraintName("FK__Classes__TermId__3C34F16F");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Courses__3214EC0796AA0F39");

            entity.HasIndex(e => e.GradeLevelId, "IX_Courses_GradeLevelId");

            entity.HasIndex(e => e.Slug, "IX_Courses_Slug").HasFilter("([DeletedAt] IS NULL)");

            entity.HasIndex(e => e.Status, "IX_Courses_Status").HasFilter("([DeletedAt] IS NULL)");

            entity.HasIndex(e => e.SubjectId, "IX_Courses_SubjectId");

            entity.HasIndex(e => e.TeacherId, "IX_Courses_TeacherId");

            entity.HasIndex(e => e.Code, "UQ__Courses__A25C5AA745EFCD6A").IsUnique();

            entity.HasIndex(e => e.Slug, "UQ__Courses__BC7B5FB6F2E10F34").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Code).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.DiscountPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.EnrollmentCount).HasDefaultValue(0);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsFeatured).HasDefaultValue(false);
            entity.Property(e => e.Language)
                .HasMaxLength(20)
                .HasDefaultValue("vi-VN");
            entity.Property(e => e.Level).HasMaxLength(20);
            entity.Property(e => e.Price)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Rating)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(3, 2)");
            entity.Property(e => e.ReviewCount).HasDefaultValue(0);
            entity.Property(e => e.Slug).HasMaxLength(200);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Draft");
            entity.Property(e => e.Thumbnail).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.TotalDuration).HasDefaultValue(0);
            entity.Property(e => e.TotalLessons).HasDefaultValue(0);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Category).WithMany(p => p.Courses)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Courses__Categor__31B762FC");

            entity.HasOne(d => d.GradeLevel).WithMany(p => p.Courses)
                .HasForeignKey(d => d.GradeLevelId)
                .HasConstraintName("FK__Courses__GradeLe__2FCF1A8A");

            entity.HasOne(d => d.Subject).WithMany(p => p.Courses)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Courses__Subject__2EDAF651");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Courses)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Courses__Teacher__30C33EC3");
        });

        modelBuilder.Entity<CourseCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CourseCa__3214EC077AC4056C");

            entity.HasIndex(e => e.ParentId, "IX_CourseCategories_ParentId");

            entity.HasIndex(e => e.Slug, "IX_CourseCategories_Slug").HasFilter("([DeletedAt] IS NULL)");

            entity.HasIndex(e => e.Slug, "UQ__CourseCa__BC7B5FB6816572CC").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IconUrl).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Slug).HasMaxLength(100);
            entity.Property(e => e.SortOrder).HasDefaultValue(0);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK__CourseCat__Paren__151B244E");
        });

        modelBuilder.Entity<CourseClass>(entity =>
        {
            entity.HasKey(e => new { e.CourseId, e.ClassId }).HasName("PK__CourseCl__D59CE3DB6AAF714C");

            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Class).WithMany(p => p.CourseClasses)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__CourseCla__Class__47A6A41B");

            entity.HasOne(d => d.Course).WithMany(p => p.CourseClasses)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__CourseCla__Cours__46B27FE2");
        });

        modelBuilder.Entity<CourseSetting>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__CourseSe__C92D71A79500B5E7");

            entity.Property(e => e.CourseId).ValueGeneratedNever();
            entity.Property(e => e.AllowAichat)
                .HasDefaultValue(true)
                .HasColumnName("AllowAIChat");
            entity.Property(e => e.AllowDownloadResources).HasDefaultValue(true);
            entity.Property(e => e.EnableDiscussions).HasDefaultValue(true);
            entity.Property(e => e.PassingScore)
                .HasDefaultValue(70m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.RequireQuizCompletion).HasDefaultValue(false);

            entity.HasOne(d => d.Course).WithOne(p => p.CourseSetting)
                .HasForeignKey<CourseSetting>(d => d.CourseId)
                .HasConstraintName("FK__CourseSet__Cours__61316BF4");
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Enrollme__3214EC07615D6C96");

            entity.HasIndex(e => e.CourseId, "IX_Enrollments_CourseId");

            entity.HasIndex(e => e.Status, "IX_Enrollments_Status");

            entity.HasIndex(e => e.StudentId, "IX_Enrollments_StudentId");

            entity.HasIndex(e => new { e.StudentId, e.CourseId }, "UQ__Enrollme__5E57FC8209866D2E").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.EnrolledAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Progress)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Active");

            entity.HasOne(d => d.Course).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__Enrollmen__Cours__69FBBC1F");

            entity.HasOne(d => d.Student).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Enrollmen__Stude__690797E6");
        });

        modelBuilder.Entity<GradeLevel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__GradeLev__3214EC0745D0C9A8");

            entity.HasIndex(e => e.SortOrder, "IX_GradeLevels_SortOrder");

            entity.HasIndex(e => e.Code, "UQ__GradeLev__A25C5AA76D2CEB07").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Code).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Lessons__3214EC07E00013EA");

            entity.HasIndex(e => e.SectionId, "IX_Lessons_SectionId");

            entity.HasIndex(e => new { e.SectionId, e.SortOrder }, "IX_Lessons_SortOrder");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsPreview).HasDefaultValue(false);
            entity.Property(e => e.Slug).HasMaxLength(200);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Draft");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.VideoUrl).HasMaxLength(500);

            entity.HasOne(d => d.Section).WithMany(p => p.Lessons)
                .HasForeignKey(d => d.SectionId)
                .HasConstraintName("FK__Lessons__Section__58D1301D");
        });

        modelBuilder.Entity<LessonBlock>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__LessonBl__3214EC0777CC4F64");

            entity.HasIndex(e => e.LessonId, "IX_LessonBlocks_LessonId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.BlockType).HasMaxLength(30);
            entity.Property(e => e.IsRequired).HasDefaultValue(true);

            entity.HasOne(d => d.Lesson).WithMany(p => p.LessonBlocks)
                .HasForeignKey(d => d.LessonId)
                .HasConstraintName("FK__LessonBlo__Lesso__5F7E2DAC");
        });

        modelBuilder.Entity<LessonFaq>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__LessonFA__3214EC071E1D7032");

            entity.ToTable("LessonFAQs");

            entity.HasIndex(e => e.LessonId, "IX_LessonFAQs_LessonId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.SortOrder).HasDefaultValue(0);

            entity.HasOne(d => d.Lesson).WithMany(p => p.LessonFaqs)
                .HasForeignKey(d => d.LessonId)
                .HasConstraintName("FK__LessonFAQ__Lesso__51EF2864");
        });

        modelBuilder.Entity<LessonProgress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__LessonPr__3214EC075DE86777");

            entity.ToTable("LessonProgress");

            entity.HasIndex(e => e.LessonId, "IX_LessonProgress_LessonId");

            entity.HasIndex(e => e.StudentId, "IX_LessonProgress_StudentId");

            entity.HasIndex(e => new { e.StudentId, e.LessonId }, "UQ__LessonPr__29CD615580BE5384").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);
            entity.Property(e => e.LastAccessedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.WatchedDuration).HasDefaultValue(0);

            entity.HasOne(d => d.Lesson).WithMany(p => p.LessonProgresses)
                .HasForeignKey(d => d.LessonId)
                .HasConstraintName("FK__LessonPro__Lesso__72910220");

            entity.HasOne(d => d.Student).WithMany(p => p.LessonProgresses)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LessonPro__Stude__719CDDE7");
        });

        modelBuilder.Entity<LoginAttempt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__LoginAtt__3214EC07A9E61166");

            entity.HasIndex(e => new { e.Email, e.AttemptAt }, "IX_LoginAttempts_Email_AttemptAt");

            entity.HasIndex(e => e.IpAddress, "IX_LoginAttempts_IpAddress");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.AttemptAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FailureReason).HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.LoginAttempts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__LoginAtte__UserI__7F2BE32F");
        });

        modelBuilder.Entity<LoginSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__LoginSes__3214EC07DA2C065A");

            entity.HasIndex(e => e.IsActive, "IX_LoginSessions_IsActive");

            entity.HasIndex(e => e.UserId, "IX_LoginSessions_UserId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.DeviceName).HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LastActivityAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.UserAgent).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.LoginSessions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__LoginSess__UserI__7A672E12");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Notifica__3214EC074F369EEE");

            entity.HasIndex(e => new { e.UserId, e.IsRead }, "IX_Notifications_IsRead");

            entity.HasIndex(e => e.UserId, "IX_Notifications_UserId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Link).HasMaxLength(500);
            entity.Property(e => e.Message).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Type).HasMaxLength(30);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Notificat__UserI__589C25F3");
        });

        modelBuilder.Entity<PasswordReset>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Password__3214EC07225FF72D");

            entity.HasIndex(e => e.ExpiresAt, "IX_PasswordResets_ExpiresAt");

            entity.HasIndex(e => e.Token, "IX_PasswordResets_Token").HasFilter("([IsUsed]=(0))");

            entity.HasIndex(e => e.Token, "UQ__Password__1EB4F8171BAE843D").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.Token).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.PasswordResets)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__PasswordR__UserI__73BA3083");
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Question__3214EC072A9282BD");

            entity.HasIndex(e => e.QuizId, "IX_Questions_QuizId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Points)
                .HasDefaultValue(1m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.QuestionType).HasMaxLength(20);

            entity.HasOne(d => d.Quiz).WithMany(p => p.Questions)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__Questions__QuizI__09746778");
        });

        modelBuilder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Question__3214EC07CEC7F7D4");

            entity.HasIndex(e => e.QuestionId, "IX_QuestionOptions_QuestionId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.IsCorrect).HasDefaultValue(false);
            entity.Property(e => e.OptionText).HasMaxLength(500);

            entity.HasOne(d => d.Question).WithMany(p => p.QuestionOptions)
                .HasForeignKey(d => d.QuestionId)
                .HasConstraintName("FK__QuestionO__Quest__0E391C95");
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Quizzes__3214EC070647997E");

            entity.HasIndex(e => e.LessonId, "IX_Quizzes_LessonId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsPublished).HasDefaultValue(false);
            entity.Property(e => e.IsRequired).HasDefaultValue(true);
            entity.Property(e => e.MaxAttempts).HasDefaultValue(3);
            entity.Property(e => e.PassingScore)
                .HasDefaultValue(70m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.ShowAnswers).HasDefaultValue(true);
            entity.Property(e => e.ShuffleQuestions).HasDefaultValue(false);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Lesson).WithMany(p => p.Quizzes)
                .HasForeignKey(d => d.LessonId)
                .HasConstraintName("FK__Quizzes__LessonI__01D345B0");
        });

        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__QuizAtte__3214EC078DDF1B77");

            entity.HasIndex(e => e.QuizId, "IX_QuizAttempts_QuizId");

            entity.HasIndex(e => e.StudentId, "IX_QuizAttempts_StudentId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.IsPassed).HasDefaultValue(false);
            entity.Property(e => e.MaxScore).HasColumnType("decimal(6, 2)");
            entity.Property(e => e.Percentage).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Score).HasColumnType("decimal(6, 2)");
            entity.Property(e => e.StartedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizAttempts)
                .HasForeignKey(d => d.QuizId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__QuizAttem__QuizI__18B6AB08");

            entity.HasOne(d => d.Student).WithMany(p => p.QuizAttempts)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__QuizAttem__Stude__17C286CF");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RefreshT__3214EC07B4B66A5E");

            entity.HasIndex(e => e.Token, "IX_RefreshTokens_Token").HasFilter("([RevokedAt] IS NULL)");

            entity.HasIndex(e => e.UserId, "IX_RefreshTokens_UserId");

            entity.HasIndex(e => e.Token, "UQ__RefreshT__1EB4F8172C82C095").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.ReplacedByToken).HasMaxLength(500);
            entity.Property(e => e.Token).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__RefreshTo__UserI__04E4BC85");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3214EC077B193FA1");

            entity.HasIndex(e => e.Name, "IX_Roles_Name");

            entity.HasIndex(e => e.Name, "UQ__Roles__737584F6AE4A46CA").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Name).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");
        });

        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Sections__3214EC0786F5796F");

            entity.HasIndex(e => e.CourseId, "IX_Sections_CourseId");

            entity.HasIndex(e => new { e.CourseId, e.SortOrder }, "IX_Sections_SortOrder");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Course).WithMany(p => p.Sections)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__Sections__Course__4E53A1AA");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Students__1788CC4CE01A7131");

            entity.HasIndex(e => e.StudentCode, "IX_Students_StudentCode");

            entity.HasIndex(e => e.StudentCode, "UQ__Students__1FC88604A64B800B").IsUnique();

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.EnrollmentDate).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.StudentCode).HasMaxLength(20);

            entity.HasOne(d => d.GradeLevel).WithMany(p => p.Students)
                .HasForeignKey(d => d.GradeLevelId)
                .HasConstraintName("FK__Students__GradeL__6C190EBB");

            entity.HasOne(d => d.User).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.UserId)
                .HasConstraintName("FK__Students__UserId__6D0D32F4");
        });

        modelBuilder.Entity<StudentClass>(entity =>
        {
            entity.HasKey(e => new { e.StudentId, e.ClassId }).HasName("PK__StudentC__2E74B9E559917A46");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Class).WithMany(p => p.StudentClasses)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("FK__StudentCl__Class__42E1EEFE");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentClasses)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StudentCl__Stude__41EDCAC5");
        });

        modelBuilder.Entity<StudentQuestion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__StudentQ__3214EC074DE58DAF");

            entity.HasIndex(e => e.ConversationId, "IX_StudentQuestions_ConversationId");

            entity.HasIndex(e => e.LessonId, "IX_StudentQuestions_LessonId");

            entity.HasIndex(e => e.StudentId, "IX_StudentQuestions_StudentId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Airesponse).HasColumnName("AIResponse");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsAnswered).HasDefaultValue(false);
            entity.Property(e => e.ModelUsed).HasMaxLength(100);
            entity.Property(e => e.Provider).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Lesson).WithMany(p => p.StudentQuestions)
                .HasForeignKey(d => d.LessonId)
                .HasConstraintName("FK__StudentQu__Lesso__4B422AD5");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentQuestions)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StudentQu__Stude__4A4E069C");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Subjects__3214EC07F4AED5DD");

            entity.HasIndex(e => e.Code, "IX_Subjects_Code").HasFilter("([DeletedAt] IS NULL)");

            entity.HasIndex(e => e.IsActive, "IX_Subjects_IsActive").HasFilter("([DeletedAt] IS NULL)");

            entity.HasIndex(e => e.Code, "UQ__Subjects__A25C5AA7F869EA53").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Code).HasMaxLength(20);
            entity.Property(e => e.Color).HasMaxLength(7);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IconUrl).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.SortOrder).HasDefaultValue(0);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Submissi__3214EC0709FB4A65");

            entity.HasIndex(e => e.AssignmentId, "IX_Submissions_AssignmentId");

            entity.HasIndex(e => e.StudentId, "IX_Submissions_StudentId");

            entity.HasIndex(e => new { e.AssignmentId, e.StudentId }, "UQ__Submissi__B165CCCF0E312C6C").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Feedback).HasMaxLength(1000);
            entity.Property(e => e.FileUrl).HasMaxLength(500);
            entity.Property(e => e.Score).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Submitted");
            entity.Property(e => e.SubmittedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Assignment).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.AssignmentId)
                .HasConstraintName("FK__Submissio__Assig__308E3499");

            entity.HasOne(d => d.Student).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Submissio__Stude__318258D2");
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Teachers__1788CC4CC7B2BBDC");

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.Bio).HasMaxLength(500);
            entity.Property(e => e.ExperienceYears).HasDefaultValue(0);
            entity.Property(e => e.Rating)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(3, 2)");
            entity.Property(e => e.TotalStudents).HasDefaultValue(0);
            entity.Property(e => e.Verified).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithOne(p => p.Teacher)
                .HasForeignKey<Teacher>(d => d.UserId)
                .HasConstraintName("FK__Teachers__UserId__619B8048");
        });

        modelBuilder.Entity<TeacherDocument>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TeacherD__3214EC079FD66AD3");

            entity.HasIndex(e => e.Status, "IX_TeacherDocuments_Status");

            entity.HasIndex(e => e.TeacherId, "IX_TeacherDocuments_TeacherId");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.ErrorMessage).HasMaxLength(500);
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.FileType).HasMaxLength(50);
            entity.Property(e => e.FileUrl).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(30);

            entity.HasOne(d => d.Teacher).WithMany(p => p.TeacherDocuments)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__TeacherDo__Teach__373B3228");
        });

        modelBuilder.Entity<Term>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Terms__3214EC0744A1808E");

            entity.HasIndex(e => new { e.StartDate, e.EndDate }, "IX_Terms_DateRange");

            entity.HasIndex(e => e.IsActive, "IX_Terms_IsActive");

            entity.HasIndex(e => e.Code, "UQ__Terms__A25C5AA7A81F234C").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Code).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07C080A4E4");

            entity.HasIndex(e => e.Email, "IX_Users_Email").HasFilter("([DeletedAt] IS NULL)");

            entity.HasIndex(e => e.IsActive, "IX_Users_IsActive").HasFilter("([DeletedAt] IS NULL)");

            entity.HasIndex(e => e.RoleId, "IX_Users_RoleId");

            entity.HasIndex(e => e.UserName, "UQ__Users__C9F28456DDCF5713").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsEmailVerified).HasDefaultValue(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.UserName).HasMaxLength(100);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RoleId__5629CD9C");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__UserProf__1788CC4C75C4721E");

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.AvatarUrl).HasMaxLength(500);
            entity.Property(e => e.Bio).HasMaxLength(1000);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .HasForeignKey<UserProfile>(d => d.UserId)
                .HasConstraintName("FK__UserProfi__UserI__59FA5E80");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
