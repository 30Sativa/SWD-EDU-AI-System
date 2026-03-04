using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Lessons.Commands;
using EduAISystem.Application.Features.Lessons.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Lessons.Handler
{
    // ===== GET ALL =====
    public class GetLessonBlocksHandler : IRequestHandler<GetLessonBlocksQuery, List<LessonBlockResponseDto>>
    {
        private readonly ILessonBlockRepository _repo;
        public GetLessonBlocksHandler(ILessonBlockRepository repo) => _repo = repo;

        public Task<List<LessonBlockResponseDto>> Handle(GetLessonBlocksQuery request, CancellationToken ct)
            => _repo.GetByLessonIdAsync(request.LessonId, ct);
    }

    // ===== GET BY ID =====
    public class GetLessonBlockByIdHandler : IRequestHandler<GetLessonBlockByIdQuery, LessonBlockResponseDto?>
    {
        private readonly ILessonBlockRepository _repo;
        public GetLessonBlockByIdHandler(ILessonBlockRepository repo) => _repo = repo;

        public Task<LessonBlockResponseDto?> Handle(GetLessonBlockByIdQuery request, CancellationToken ct)
            => _repo.GetByIdAsync(request.Id, ct);
    }

    // ===== CREATE =====
    public class CreateLessonBlockHandler : IRequestHandler<CreateLessonBlockCommand, Guid>
    {
        private readonly ILessonBlockRepository _repo;
        public CreateLessonBlockHandler(ILessonBlockRepository repo) => _repo = repo;

        public async Task<Guid> Handle(CreateLessonBlockCommand request, CancellationToken ct)
        {
            var lessonExists = await _repo.LessonExistsAsync(request.LessonId, ct);
            if (!lessonExists)
                throw new NotFoundException($"Lesson with id {request.LessonId} not found.");

            return await _repo.AddAsync(
                request.LessonId,
                request.Dto.BlockType,
                request.Dto.Content,
                request.Dto.SortOrder,
                request.Dto.IsRequired,
                request.Dto.EstimatedMinutes,
                ct);
        }
    }

    // ===== UPDATE =====
    public class UpdateLessonBlockHandler : IRequestHandler<UpdateLessonBlockCommand, bool>
    {
        private readonly ILessonBlockRepository _repo;
        public UpdateLessonBlockHandler(ILessonBlockRepository repo) => _repo = repo;

        public async Task<bool> Handle(UpdateLessonBlockCommand request, CancellationToken ct)
        {
            var updated = await _repo.UpdateAsync(
                request.Id,
                request.Dto.BlockType,
                request.Dto.Content,
                request.Dto.SortOrder,
                request.Dto.IsRequired,
                request.Dto.EstimatedMinutes,
                ct);

            if (!updated)
                throw new NotFoundException($"LessonBlock with id {request.Id} not found.");

            return true;
        }
    }

    // ===== DELETE =====
    public class DeleteLessonBlockHandler : IRequestHandler<DeleteLessonBlockCommand, bool>
    {
        private readonly ILessonBlockRepository _repo;
        public DeleteLessonBlockHandler(ILessonBlockRepository repo) => _repo = repo;

        public async Task<bool> Handle(DeleteLessonBlockCommand request, CancellationToken ct)
        {
            var deleted = await _repo.DeleteAsync(request.Id, ct);
            if (!deleted)
                throw new NotFoundException($"LessonBlock with id {request.Id} not found.");
            return true;
        }
    }
}
