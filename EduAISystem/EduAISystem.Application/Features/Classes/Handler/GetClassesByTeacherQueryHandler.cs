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
    public class GetClassesByTeacherQueryHandler : IRequestHandler<GetClassesByTeacherQuery, List<ClassListResponseDto>>
    {
        private readonly IClassRepository _classRepo;

        public GetClassesByTeacherQueryHandler(IClassRepository classRepo)
        {
            _classRepo = classRepo;
        }

        public async Task<List<ClassListResponseDto>> Handle(GetClassesByTeacherQuery request, CancellationToken cancellationToken)
        {
            var classes = await _classRepo.GetClassesByTeacherAsync(request.TeacherUserId, cancellationToken);
            
            return classes.Select(c => new ClassListResponseDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                TeacherName = c.TeacherName,
                TermName = c.TermName,
                GradeLevelName = c.GradeLevelName,
                MaxStudents = c.MaxStudents,
                CurrentStudents = c.CurrentStudents,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            }).ToList();
        }
    }
}
