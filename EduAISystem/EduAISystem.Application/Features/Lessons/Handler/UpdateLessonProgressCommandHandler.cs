using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Features.Lessons.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    public class UpdateLessonProgressCommandHandler : IRequestHandler<UpdateLessonProgressCommand, bool>
    {
        private readonly ILessonProgressRepository _lessonProgressRepository;
        private readonly ICurrentUserService _currentUserService;

        public UpdateLessonProgressCommandHandler(
            ILessonProgressRepository lessonProgressRepository,
            ICurrentUserService currentUserService)
        {
            _lessonProgressRepository = lessonProgressRepository;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(UpdateLessonProgressCommand request, CancellationToken cancellationToken)
        {
            var studentId = _currentUserService.UserId;
            if (studentId == Guid.Empty)
                throw new UnauthorizedAccessException("Người dùng chưa đăng nhập");

            await _lessonProgressRepository.UpdateProgressAsync(
                studentId,
                request.LessonId,
                request.Payload.WatchedDuration,
                request.Payload.IsCompleted,
                cancellationToken);

            return true;
        }
    }
}
