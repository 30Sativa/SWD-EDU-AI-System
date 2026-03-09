using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    // ===== GET ALL =====
    public class GetLessonFaqsHandler : IRequestHandler<GetLessonFaqsQuery, List<LessonFaqResponseDto>>
    {
        private readonly ILessonFaqRepository _repo;
        public GetLessonFaqsHandler(ILessonFaqRepository repo) => _repo = repo;

        public Task<List<LessonFaqResponseDto>> Handle(GetLessonFaqsQuery request, CancellationToken ct)
            => _repo.GetByLessonIdAsync(request.LessonId, ct);
    }

    // ===== GET BY ID =====
    public class GetLessonFaqByIdHandler : IRequestHandler<GetLessonFaqByIdQuery, LessonFaqResponseDto?>
    {
        private readonly ILessonFaqRepository _repo;
        public GetLessonFaqByIdHandler(ILessonFaqRepository repo) => _repo = repo;

        public Task<LessonFaqResponseDto?> Handle(GetLessonFaqByIdQuery request, CancellationToken ct)
            => _repo.GetByIdAsync(request.Id, ct);
    }

    // ===== CREATE =====
    public class CreateLessonFaqHandler : IRequestHandler<CreateLessonFaqCommand, Guid>
    {
        private readonly ILessonFaqRepository _repo;
        public CreateLessonFaqHandler(ILessonFaqRepository repo) => _repo = repo;

        public async Task<Guid> Handle(CreateLessonFaqCommand request, CancellationToken ct)
        {
            var lessonExists = await _repo.LessonExistsAsync(request.LessonId, ct);
            if (!lessonExists)
                throw new NotFoundException($"Lesson with id {request.LessonId} not found.");

            return await _repo.AddAsync(
                request.LessonId,
                request.Dto.Question,
                request.Dto.Answer,
                request.Dto.SortOrder,
                ct);
        }
    }

    // ===== UPDATE =====
    public class UpdateLessonFaqHandler : IRequestHandler<UpdateLessonFaqCommand, bool>
    {
        private readonly ILessonFaqRepository _repo;
        public UpdateLessonFaqHandler(ILessonFaqRepository repo) => _repo = repo;

        public async Task<bool> Handle(UpdateLessonFaqCommand request, CancellationToken ct)
        {
            var updated = await _repo.UpdateAsync(
                request.Id,
                request.Dto.Question,
                request.Dto.Answer,
                request.Dto.SortOrder,
                request.Dto.IsActive,
                ct);

            if (!updated)
                throw new NotFoundException($"LessonFaq with id {request.Id} not found.");

            return true;
        }
    }

    // ===== DELETE =====
    public class DeleteLessonFaqHandler : IRequestHandler<DeleteLessonFaqCommand, bool>
    {
        private readonly ILessonFaqRepository _repo;
        public DeleteLessonFaqHandler(ILessonFaqRepository repo) => _repo = repo;

        public async Task<bool> Handle(DeleteLessonFaqCommand request, CancellationToken ct)
        {
            var deleted = await _repo.DeleteAsync(request.Id, ct);
            if (!deleted)
                throw new NotFoundException($"LessonFaq with id {request.Id} not found.");
            return true;
        }
    }
}
