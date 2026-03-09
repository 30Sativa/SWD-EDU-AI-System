using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class AssignClassToCourseHandler : IRequestHandler<AssignClassToCourseCommand, bool>
    {
        private readonly ICourseRepository _courseRepo;
        private readonly ITeacherAssignmentRepository _assignmentRepo;

        public AssignClassToCourseHandler(
            ICourseRepository courseRepo, 
            ITeacherAssignmentRepository assignmentRepo)
        {
            _courseRepo = courseRepo;
            _assignmentRepo = assignmentRepo;
        }

        public async Task<bool> Handle(AssignClassToCourseCommand request, CancellationToken cancellationToken)
        {
            // 1. Lấy thông tin khóa học
            var course = await _courseRepo.GetByIdAsync(request.CourseId, cancellationToken);
            if (course == null) throw new NotFoundException("Không tìm thấy khóa học.");

            // 🔥 System check: Phải đúng giáo viên sở hữu khóa học
            if (course.TeacherId != request.TeacherId)
                throw new ForbiddenException("Bạn không có quyền quản lý khóa học này.");

            // 2. Lấy thông tin môn học của khóa học
            var subjectId = course.SubjectId;

            // 3. System check (FLOW B2): Giáo viên có được phân công dạy môn này cho lớp này không?
            var isAssigned = await _assignmentRepo.IsTeacherAssignedToSubjectAsync(
                request.ClassId, 
                subjectId, 
                request.TeacherId, 
                cancellationToken);

            if (!isAssigned)
                throw new InvalidOperationException("Bạn chưa được cấp phép (phân công) dạy môn này cho lớp này.");

            // 4. Gọi repository để gán (CourseClass)
            await _courseRepo.AssignClassToCourseAsync(request.CourseId, request.ClassId, cancellationToken);

            return true;
        }
    }
}
