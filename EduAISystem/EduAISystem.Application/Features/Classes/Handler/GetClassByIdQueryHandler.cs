using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Application.Features.Classes.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class GetClassByIdQueryHandler : IRequestHandler<GetClassByIdQuery, ClassDetailResponseDto?>
    {
        private readonly IClassRepository _classes;
        private readonly ITermRepository _terms;
        private readonly IGradeLevelRepository _gradeLevels;
        private readonly IUserRepository _users;

        public GetClassByIdQueryHandler(
            IClassRepository classes,
            ITermRepository terms,
            IGradeLevelRepository gradeLevels,
            IUserRepository users)
        {
            _classes = classes;
            _terms = terms;
            _gradeLevels = gradeLevels;
            _users = users;
        }

        public async Task<ClassDetailResponseDto?> Handle(GetClassByIdQuery request, CancellationToken cancellationToken)
        {
            var c = await _classes.GetByIdAsync(request.Id, cancellationToken);
            if (c == null)
                return null;

            string? teacherName = null;
            if (c.TeacherId.HasValue)
            {
                teacherName = await _users.GetFullNameByIdAsync(c.TeacherId.Value, cancellationToken);
            }

            string? termName = null;
            if (c.TermId.HasValue)
            {
                var term = await _terms.GetByIdAsync(c.TermId.Value, cancellationToken);
                termName = term?.Name;
            }

            string? gradeLevelName = null;
            if (c.GradeLevelId.HasValue)
            {
                var grade = await _gradeLevels.GetByIdAsync(c.GradeLevelId.Value, cancellationToken);
                gradeLevelName = grade?.Name;
            }

            return new ClassDetailResponseDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Description = c.Description,
                TeacherId = c.TeacherId,
                TeacherName = teacherName,
                TermId = c.TermId,
                TermName = termName,
                GradeLevelId = c.GradeLevelId,
                GradeLevelName = gradeLevelName,
                MaxStudents = c.MaxStudents,
                CurrentStudents = c.CurrentStudents,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            };
        }
    }
}

