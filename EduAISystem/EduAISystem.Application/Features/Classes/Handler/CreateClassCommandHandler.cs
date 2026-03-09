using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Classes.Commands;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class CreateClassCommandHandler : IRequestHandler<CreateClassCommand, ClassDetailResponseDto>
    {
        private readonly IClassRepository _classes;
        private readonly IUserRepository _users;
        private readonly ITermRepository _terms;
        private readonly IGradeLevelRepository _gradeLevels;

        public CreateClassCommandHandler(
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

        public async Task<ClassDetailResponseDto> Handle(CreateClassCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var codeExists = await _classes.CodeExistsAsync(dto.Code, null, cancellationToken);
            if (codeExists)
                throw new ConflictException("Mã lớp đã tồn tại.");

            // FK validation (optional but helpful)
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

            string? teacherName = null;
            if (dto.TeacherId.HasValue)
            {
                var teacherFullName = await _users.GetFullNameByIdAsync(dto.TeacherId.Value, cancellationToken);
                // If user exists but no profile yet, allow it (name can be null)
                teacherName = teacherFullName;
            }

            var classEntity = ClassDomain.Create(
                dto.Code,
                dto.Name,
                dto.Description,
                dto.TeacherId,
                dto.TermId,
                dto.GradeLevelId,
                dto.MaxStudents);

            await _classes.AddAsync(classEntity, cancellationToken);

            string? termName = null;
            if (dto.TermId.HasValue)
            {
                var term = await _terms.GetByIdAsync(dto.TermId.Value, cancellationToken);
                termName = term?.Name;
            }

            string? gradeName = null;
            if (dto.GradeLevelId.HasValue)
            {
                var grade = await _gradeLevels.GetByIdAsync(dto.GradeLevelId.Value, cancellationToken);
                gradeName = grade?.Name;
            }

            return new ClassDetailResponseDto
            {
                Id = classEntity.Id,
                Code = classEntity.Code,
                Name = classEntity.Name,
                Description = classEntity.Description,
                TeacherId = classEntity.TeacherId,
                TeacherName = teacherName,
                TermId = classEntity.TermId,
                TermName = termName,
                GradeLevelId = classEntity.GradeLevelId,
                GradeLevelName = gradeName,
                MaxStudents = classEntity.MaxStudents,
                CurrentStudents = classEntity.CurrentStudents,
                IsActive = classEntity.IsActive,
                CreatedAt = classEntity.CreatedAt,
                UpdatedAt = classEntity.UpdatedAt
            };
        }
    }
}

