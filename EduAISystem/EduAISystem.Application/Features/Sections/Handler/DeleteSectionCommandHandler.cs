using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Sections.Commands;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.Handler
{
    public class DeleteSectionCommandHandler : IRequestHandler<DeleteSectionCommand>
    {
        private readonly ISectionRepository _sectionRepository;

        public DeleteSectionCommandHandler(ISectionRepository sectionRepository)
        {
            _sectionRepository = sectionRepository;
        }

        public async Task Handle(DeleteSectionCommand request, CancellationToken cancellationToken)
        {
            var section = await _sectionRepository.GetByIdAsync(request.SectionId)
                ?? throw new NotFoundException($"Section with ID {request.SectionId} not found.");

            await _sectionRepository.DeleteAsync(section);
        }
    }
}

