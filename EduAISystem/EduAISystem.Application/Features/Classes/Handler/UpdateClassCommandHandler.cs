using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Classes.Commands;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class UpdateClassCommandHandler : IRequestHandler<UpdateClassCommand, ClassDetailResponseDto?>
    {
        private readonly IClassRepository _classes;
        private readonly IUserRepository _users;
        private readonly ITermRepository _terms;
        private readonly IGradeLevelRepository _gradeLevels;

        public UpdateClassCommandHandler(
            IClassRepository classes,
            IUserRepository users,
            ITermRepository terms,
            IGradeLevelRepository gradeLevels)
        {
            _classes = classes;
            _users = users;
            _terms = terms;
            _gradeLevels = gradeLevels;
        }

        public async Task<ClassDetailResponseDto?> Handle(UpdateClassCommand request, CancellationToken cancellationToken)
        {
            var existing = await _classes.GetByIdAsync(request.Id, cancellationToken);
            if (existing == null)
                return null;

            var dto = request.Request;

            if (dto.TermId.HasValue)
            {
                var term = await _terms.GetByIdAsync(dto.TermId.Value, cancellationToken);
                if (term == null)
                    throw new NotFoundException("Không tìm thấy kỳ học.");
            }

            if (dto.GradeLevelId.HasValue)
            {
                var grade = await _gradeLevels.GetByIdAsync(dto.GradeLevelId.Value, cancellationToken);
                if (grade == null)
                    throw new NotFoundException("Không tìm thấy khối/lớp.");
            }

            existing.Update(
                dto.Name,
                dto.Description,
                dto.TeacherId,
                dto.TermId,
                dto.GradeLevelId,
                dto.MaxStudents);

            await _classes.UpdateAsync(existing, cancellationToken);

            string? teacherName = null;
            if (existing.TeacherId.HasValue)
            {
                teacherName = await _users.GetFullNameByIdAsync(existing.TeacherId.Value, cancellationToken);
            }

            string? termName = null;
            if (existing.TermId.HasValue)
            {
                var term = await _terms.GetByIdAsync(existing.TermId.Value, cancellationToken);
                termName = term?.Name;
            }

            string? gradeName = null;
            if (existing.GradeLevelId.HasValue)
            {
                var grade = await _gradeLevels.GetByIdAsync(existing.GradeLevelId.Value, cancellationToken);
                gradeName = grade?.Name;
            }

            return new ClassDetailResponseDto
            {
                Id = existing.Id,
                Code = existing.Code,
                Name = existing.Name,
                Description = existing.Description,
                TeacherId = existing.TeacherId,
                TeacherName = teacherName,
                TermId = existing.TermId,
                TermName = termName,
                GradeLevelId = existing.GradeLevelId,
                GradeLevelName = gradeName,
                MaxStudents = existing.MaxStudents,
                CurrentStudents = existing.CurrentStudents,
                IsActive = existing.IsActive,
                CreatedAt = existing.CreatedAt,
                UpdatedAt = existing.UpdatedAt
            };
        }
    }
}

