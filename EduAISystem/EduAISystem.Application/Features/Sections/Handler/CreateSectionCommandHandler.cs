using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using EduAISystem.Application.Features.Sections.Commands;
using EduAISystem.Application.Features.Sections.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Handler
{
    public class CreateSectionCommandHandler : IRequestHandler<CreateSectionCommand, SectionResponseDto>
    {
        private readonly ISectionRepository _sectionRepository;
        private readonly ICourseRepository _courseRepository;
        public CreateSectionCommandHandler(ISectionRepository sectionRepository, ICourseRepository courseRepository)
        {
            _sectionRepository = sectionRepository;
            _courseRepository = courseRepository;
        }



        public async Task<SectionResponseDto> Handle(CreateSectionCommand request, CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId);
            if (course == null)
            {
                throw new NotFoundException("Không tìm thấy khoá học");
            }
            var newSection = SectionDomain.Create(
                request.CourseId,
                request.Request.Title,
                request.Request.Description,
                request.Request.SortOrder
            );
            await _sectionRepository.AddAsync(newSection, cancellationToken);
            var response = new SectionResponseDto
            {
                Id = newSection.Id,
                Title = newSection.Title,
                Description = newSection.Description,
                Order = newSection.SortOrder,
            };
            return response;
        }
    }
}
