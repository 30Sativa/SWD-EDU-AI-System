using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Subjects.Commands;
using EduAISystem.Application.Features.Subjects.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Subjects.Handler
{
    public class UpdateSubjectCommandHandler : IRequestHandler<UpdateSubjectCommand, SubjectDetailResponseDto?>
    {
        private readonly ISubjectRepository _subjectRepository;

        public UpdateSubjectCommandHandler(ISubjectRepository subjectRepository)
        {
            _subjectRepository = subjectRepository;
        }

        public async Task<SubjectDetailResponseDto?> Handle(UpdateSubjectCommand request, CancellationToken cancellationToken)
        {
            var existing = await _subjectRepository.GetByIdAsync(request.Id, cancellationToken);
            if (existing == null)
                return null;

            existing.Update(
                request.Request.Name,
                request.Request.NameEn,
                request.Request.Description,
                request.Request.IconUrl,
                request.Request.Color,
                request.Request.SortOrder);

            await _subjectRepository.UpdateAsync(existing, cancellationToken);

            return new SubjectDetailResponseDto
            {
                Id = existing.Id,
                Code = existing.Code,
                Name = existing.Name,
                NameEn = existing.NameEn,
                Description = existing.Description,
                IconUrl = existing.IconUrl,
                Color = existing.Color,
                SortOrder = existing.SortOrder,
                IsActive = existing.IsActive
            };
        }
    }
}

