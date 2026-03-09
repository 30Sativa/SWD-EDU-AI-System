using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.DTOs.Response;
using EduAISystem.Application.Features.Classes.Queries;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Classes.Handler
{
    /// <summary>
    /// Lấy danh sách giáo viên bộ môn của 1 lớp theo classId
    /// </summary>
    public class GetClassSubjectTeachersQueryHandler
        : IRequestHandler<GetClassSubjectTeachersQuery, List<ClassSubjectTeacherResponseDto>>
    {
        private readonly ITeacherAssignmentRepository _assignmentRepo;

        public GetClassSubjectTeachersQueryHandler(ITeacherAssignmentRepository assignmentRepo)
        {
            _assignmentRepo = assignmentRepo;
        }

        public async Task<List<ClassSubjectTeacherResponseDto>> Handle(
            GetClassSubjectTeachersQuery request,
            CancellationToken cancellationToken)
        {
            return await _assignmentRepo.GetClassSubjectTeachersAsync(request.ClassId, cancellationToken);
        }
    }
}
