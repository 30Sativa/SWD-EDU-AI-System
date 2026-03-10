using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.Commands;
using EduAISystem.Domain.Enums;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class AssignSubjectTeacherCommandHandler : IRequestHandler<AssignSubjectTeacherCommand, bool>
    {
        private readonly ITeacherAssignmentRepository _assignmentRepo;
        private readonly IClassRepository _classRepository;
        private readonly ISubjectRepository _subjectRepository;
        private readonly INotificationService _notificationService;

        public AssignSubjectTeacherCommandHandler(
            ITeacherAssignmentRepository assignmentRepo,
            IClassRepository classRepository,
            ISubjectRepository subjectRepository,
            INotificationService notificationService)
        {
            _assignmentRepo = assignmentRepo;
            _classRepository = classRepository;
            _subjectRepository = subjectRepository;
            _notificationService = notificationService;
        }

        public async Task<bool> Handle(AssignSubjectTeacherCommand request, CancellationToken cancellationToken)
        {
            await _assignmentRepo.AssignSubjectTeacherAsync(
                request.ClassId, 
                request.SubjectId, 
                request.TeacherId, 
                cancellationToken);

            var cls = await _classRepository.GetByIdAsync(request.ClassId, cancellationToken);
            var subject = await _subjectRepository.GetByIdAsync(request.SubjectId, cancellationToken);

            if (cls != null && subject != null)
            {
                await _notificationService.SendNotificationAsync(
                    request.TeacherId,
                    NotificationTypeDomain.System,
                    "Phân công giảng dạy",
                    $"Bạn đã được phân công dạy môn '{subject.Name}' cho lớp '{cls.Name}'.",
                    $"/teacher/classes/{cls.Id}",
                    cancellationToken);
            }

            return true;
        }
    }
}
