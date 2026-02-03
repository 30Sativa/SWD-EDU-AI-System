using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using EduAISystem.Application.Features.Subjects.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Handler
{
    public class GetSubjectByIdQueryHandler : IRequestHandler<GetSubjectByIdQuery, SubjectDetailResponseDto?>
    {
        private readonly ISubjectRepository _subjectRepository;

        public GetSubjectByIdQueryHandler(ISubjectRepository subjectRepository)
        {
            _subjectRepository = subjectRepository;
        }

        public async Task<SubjectDetailResponseDto?> Handle(GetSubjectByIdQuery request, CancellationToken cancellationToken)
        {
            var subject = await _subjectRepository.GetByIdAsync(request.Id, cancellationToken);
            if (subject == null)
                return null;

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

