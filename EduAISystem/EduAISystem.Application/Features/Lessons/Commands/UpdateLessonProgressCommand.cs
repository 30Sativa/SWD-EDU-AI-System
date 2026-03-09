using EduAISystem.Application.Features.Lessons.DTOs.Request;
using MediatR;

namespace EduAISystem.Application.Features.Lessons.Commands
{
    public class UpdateLessonProgressCommand : IRequest<bool>
    {
        public Guid LessonId { get; set; }
        public UpdateLessonProgressRequestDto Payload { get; set; }

        public UpdateLessonProgressCommand(Guid lessonId, UpdateLessonProgressRequestDto payload)
        {
            LessonId = lessonId;
            Payload = payload;
        }
    }
}
