using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Domain.Enums;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class AssignClassToCourseHandler : IRequestHandler<AssignClassToCourseCommand, bool>
    {
        private readonly ICourseRepository _courseRepo;
        private readonly ITeacherAssignmentRepository _assignmentRepo;
        private readonly IStudentRepository _studentRepository;
        private readonly INotificationService _notificationService;

        public AssignClassToCourseHandler(
            ICourseRepository courseRepo, 
            ITeacherAssignmentRepository assignmentRepo,
            IStudentRepository studentRepository,
            INotificationService notificationService)
        {
            _courseRepo = courseRepo;
            _assignmentRepo = assignmentRepo;
            _studentRepository = studentRepository;
            _notificationService = notificationService;
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

            // Gửi thông báo cho học sinh trong lớp (chỉ nếu khóa học đã Published)
            if (course.Status == CourseStatusDomain.Published)
            {
                var studentIds = await _studentRepository.GetStudentIdsByClassIdAsync(request.ClassId, cancellationToken);
                if (studentIds.Any())
                {
                    await _notificationService.SendBatchNotificationAsync(
                        studentIds,
                        NotificationTypeDomain.System,
                        "Khóa học mới xuất bản",
                        $"Lớp của bạn đã được thêm vào khóa học '{course.Title}'.",
                        $"/student/courses/{course.Id}",
                        cancellationToken);
                }
            }

            return true;
        }
    }
}
