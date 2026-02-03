using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Subjects.Commands;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Handler
{
    public class CreateSubjectCommandHandler : IRequestHandler<CreateSubjectCommand, SubjectDetailResponseDto>
    {
        private readonly ISubjectRepository _subjectRepository;

        public CreateSubjectCommandHandler(ISubjectRepository subjectRepository)
        {
            _subjectRepository = subjectRepository;
        }

        public async Task<SubjectDetailResponseDto> Handle(CreateSubjectCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var codeExists = await _subjectRepository.CodeExistsAsync(dto.Code, null, cancellationToken);
            if (codeExists)
            {
                throw new InvalidOperationException("Mã môn học đã tồn tại.");
            }

            var subject = SubjectDomain.Create(
                dto.Code,
                dto.Name,
                dto.NameEn,
                dto.Description,
                dto.IconUrl,
                dto.Color,
                dto.SortOrder);

            await _subjectRepository.AddAsync(subject, cancellationToken);

            return new SubjectDetailResponseDto
            {
                Id = subject.Id,
                Code = subject.Code,
                Name = subject.Name,
                NameEn = subject.NameEn,
                Description = subject.Description,
                IconUrl = subject.IconUrl,
                Color = subject.Color,
                SortOrder = subject.SortOrder,
                IsActive = subject.IsActive
            };
        }
    }
}

