using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Application.Features.Classes.Queries;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class GetStudentsInClassQueryHandler : IRequestHandler<GetStudentsInClassQuery, List<StudentInClassResponseDto>>
    {
        private readonly IClassRepository _classRepo;

        public GetStudentsInClassQueryHandler(IClassRepository classRepo)
        {
            _classRepo = classRepo;
        }

        public async Task<List<StudentInClassResponseDto>> Handle(GetStudentsInClassQuery request, CancellationToken cancellationToken)
        {
            return await _classRepo.GetStudentsByClassIdAsync(request.ClassId, cancellationToken);
        }
    }
}
