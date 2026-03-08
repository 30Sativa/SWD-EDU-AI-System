using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class LessonProgressRepository : ILessonProgressRepository
    {
        private readonly EduAiDbV5Context _context;

        public LessonProgressRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task UpdateProgressAsync(Guid studentId, Guid lessonId, int watchedDuration, bool isCompleted, CancellationToken cancellationToken = default)
        {
            var progress = await _context.LessonProgresses
                .FirstOrDefaultAsync(lp => lp.StudentId == studentId && lp.LessonId == lessonId, cancellationToken);

            if (progress == null)
            {
                progress = new LessonProgress
                {
                    Id = Guid.NewGuid(),
                    StudentId = studentId,
                    LessonId = lessonId,
                    WatchedDuration = watchedDuration,
                    IsCompleted = isCompleted,
                    CompletedAt = isCompleted ? DateTime.UtcNow : null,
                    LastAccessedAt = DateTime.UtcNow
                };
                _context.LessonProgresses.Add(progress);
            }
            else
            {
                // Only update highest watched duration
                if (watchedDuration > progress.WatchedDuration)
                {
                    progress.WatchedDuration = watchedDuration;
                }

                // If not completed previously, but now is completed
                if (isCompleted && progress.IsCompleted != true)
                {
                    progress.IsCompleted = true;
                    progress.CompletedAt = DateTime.UtcNow;
                }

                progress.LastAccessedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Update enrollment last accessed
            var lesson = await _context.Lessons
                .Include(l => l.Section)
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lessonId, cancellationToken);
            
            if (lesson?.Section != null)
            {
                var enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == lesson.Section.CourseId, cancellationToken);
                
                if (enrollment != null)
                {
                    enrollment.LastAccessedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync(cancellationToken);

                    // Update Course Progress
                    await UpdateCourseProgressAsync(studentId, lesson.Section.CourseId, cancellationToken);
                }
            }
        }

        public async Task UpdateCourseProgressAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default)
        {
            // Calculate progress = (completed items) / (total items) * 100
            
            // 1. Total Lessons in Course
            var totalLessons = await _context.Lessons
                .Where(l => l.Section.CourseId == courseId && l.DeletedAt == null && l.Section.DeletedAt == null)
                .CountAsync(cancellationToken);

            var completedLessons = await _context.LessonProgresses
                .Where(lp => lp.StudentId == studentId && lp.Lesson.Section.CourseId == courseId && lp.IsCompleted == true)
                .CountAsync(cancellationToken);

            // 2. Total Assignments in Course
            var totalAssignments = await _context.Assignments
                .Where(a => a.CourseId == courseId && a.IsPublished == true)
                .CountAsync(cancellationToken);

            var completedAssignments = await _context.Submissions
                .Where(s => s.StudentId == studentId && s.Assignment.CourseId == courseId)
                .Select(s => s.AssignmentId)
                .Distinct()
                .CountAsync(cancellationToken);

            // 3. Total Quizzes in Course
            // Quizzes can be attached to Course directly, or through Lessons
            var courseQuizzes = await _context.Quizzes
                .Where(q => (q.CourseId == courseId || (q.Lesson != null && q.Lesson.Section != null && q.Lesson.Section.CourseId == courseId)) && q.IsActive != false)
                .CountAsync(cancellationToken);

            var completedQuizzes = await _context.QuizAttempts
                .Where(qa => qa.StudentId == studentId && 
                            (qa.Quiz.CourseId == courseId || 
                            (qa.Quiz.Lesson != null && qa.Quiz.Lesson.Section != null && qa.Quiz.Lesson.Section.CourseId == courseId)) 
                            && qa.Status == "COMPLETED")
                .Select(qa => qa.QuizId)
                .Distinct()
                .CountAsync(cancellationToken);

            var totalItems = totalLessons + totalAssignments + courseQuizzes;
            var completedItems = completedLessons + completedAssignments + completedQuizzes;

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId, cancellationToken);

            if (enrollment != null && totalItems > 0)
            {
                decimal progress = Math.Round((decimal)completedItems / totalItems * 100, 2);
                enrollment.Progress = progress;

                if (progress >= 100)
                {
                    enrollment.CompletedAt = DateTime.UtcNow;
                    enrollment.Status = "COMPLETED";
                }
                else if (enrollment.Status == "NOT_STARTED")
                {
                    enrollment.Status = "IN_PROGRESS";
                }

                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task<List<LessonProgressSnapshot>> GetByStudentAndCourseAsync(
            Guid studentId,
            Guid courseId,
            CancellationToken cancellationToken = default)
        {
            var query = _context.LessonProgresses
                .AsNoTracking()
                .Where(lp => lp.StudentId == studentId &&
                             lp.Lesson.Section.CourseId == courseId);

            return await query
                .Select(lp => new LessonProgressSnapshot
                {
                    LessonId = lp.LessonId,
                    IsCompleted = lp.IsCompleted == true,
                    WatchedDuration = lp.WatchedDuration ?? 0,
                    LastAccessedAt = lp.LastAccessedAt
                })
                .ToListAsync(cancellationToken);
        }
    }
}
