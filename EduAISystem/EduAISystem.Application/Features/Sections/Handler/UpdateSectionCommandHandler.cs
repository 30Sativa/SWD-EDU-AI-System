using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Sections.Commands;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Handler
{
    public class UpdateSectionCommandHandler : IRequestHandler<UpdateSectionCommand>
    {
        private readonly ISectionRepository _sectionRepository;
        public UpdateSectionCommandHandler(ISectionRepository sectionRepository)
        {
            _sectionRepository = sectionRepository;
        }
        public async Task Handle(UpdateSectionCommand request, CancellationToken cancellationToken)
        {
            var section = await _sectionRepository.GetByIdAsync(request.SectionId);
            if (section == null)
            {
                throw new NotFoundException($"Section with ID {request.SectionId} not found.");
            }
            section.Update(
                title: request.Request.Title,
                description: request.Request.Description,
                sortOrder: request.Request.SortOrder
            );

            await _sectionRepository.UpdateAsync(section);
        }
    }
}
