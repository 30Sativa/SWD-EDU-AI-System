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
    /// Lấy danh sách lớp mà giáo viên được phân công dạy bộ môn theo teacherId
    /// </summary>
    public class GetTeacherClassSubjectsQueryHandler
        : IRequestHandler<GetTeacherClassSubjectsQuery, List<TeacherClassSubjectResponseDto>>
    {
        private readonly ITeacherAssignmentRepository _assignmentRepo;

        public GetTeacherClassSubjectsQueryHandler(ITeacherAssignmentRepository assignmentRepo)
        {
            _assignmentRepo = assignmentRepo;
        }

        public async Task<List<TeacherClassSubjectResponseDto>> Handle(
            GetTeacherClassSubjectsQuery request,
            CancellationToken cancellationToken)
        {
            return await _assignmentRepo.GetTeacherClassSubjectsAsync(request.TeacherId, cancellationToken);
        }
    }
}
