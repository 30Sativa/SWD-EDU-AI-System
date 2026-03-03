using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Infrastructure.Persistence.Context;
using EduAISystem.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduAISystem.Infrastructure.Persistence.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly EduAiDbV5Context _context;

        public SubmissionRepository(EduAiDbV5Context context)
        {
            _context = context;
        }

        public async Task CreateAsync(SubmissionDomain submission, CancellationToken cancellationToken = default)
        {
            var entity = MapToEntity(submission);
            _context.Submissions.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateAsync(SubmissionDomain submission, CancellationToken cancellationToken = default)
        {
            var entity = MapToEntity(submission);
            _context.Submissions.Update(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<SubmissionDomain?> GetByIdAsync(Guid submissionId, CancellationToken cancellationToken = default)
        {
            var entity = await _context.Submissions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == submissionId, cancellationToken);

            return entity is null ? null : MapToDomain(entity);
        }

        public async Task<SubmissionDomain?> GetLatestByStudentAsync(
            Guid assignmentId,
            Guid studentId,
            CancellationToken cancellationToken = default)
        {
            var entity = await _context.Submissions
                .AsNoTracking()
                .Where(s => s.AssignmentId == assignmentId && s.StudentId == studentId)
                .OrderByDescending(s => s.SubmittedAt)
                .FirstOrDefaultAsync(cancellationToken);

            return entity is null ? null : MapToDomain(entity);
        }

        public async Task<List<SubmissionDomain>> GetByAssignmentAsync(Guid assignmentId, CancellationToken cancellationToken = default)
        {
            var entities = await _context.Submissions
                .AsNoTracking()
                .Where(s => s.AssignmentId == assignmentId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync(cancellationToken);

            return entities.Select(MapToDomain).ToList();
        }

        private static Submission MapToEntity(SubmissionDomain d)
        {
            return new Submission
            {
                Id = d.Id,
                AssignmentId = d.AssignmentId,
                StudentId = d.StudentId,
                Content = d.Content,
                FileUrl = d.FileUrl,
                Score = d.Score,
                Feedback = d.Feedback,
                Status = MapStatusToString(d.Status),
                SubmittedAt = d.SubmittedAt,
                GradedAt = d.GradedAt
            };
        }

        private static SubmissionDomain MapToDomain(Submission e)
        {
            return new SubmissionDomain(
                e.Id,
                e.AssignmentId,
                e.StudentId,
                e.Content,
                e.FileUrl,
                e.Score,
                e.Feedback,
                MapStatusToEnum(e.Status),
                e.SubmittedAt,
                e.GradedAt
            );
        }

        private static string MapStatusToString(SubmissionStatusDomain status)
        {
            return status switch
            {
                SubmissionStatusDomain.Submitted => "Submitted",
                SubmissionStatusDomain.Graded => "Graded",
                _ => "Submitted"
            };
        }

        private static SubmissionStatusDomain MapStatusToEnum(string? status)
        {
            return status switch
            {
                "Graded" => SubmissionStatusDomain.Graded,
                "Submitted" => SubmissionStatusDomain.Submitted,
                _ => SubmissionStatusDomain.Submitted
            };
        }
    }
}

