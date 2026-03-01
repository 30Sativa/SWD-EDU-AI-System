using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;

namespace EduAISystem.Application.Features.Courses.Handler
{
    public class ScanTemplateCourseHandler
    : IRequestHandler<ScanTemplateCourseCommand, ScanTemplateCourseResponseDto>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IFileTextExtractor _fileExtractor;
        private readonly ICourseAiService _aiService;

        public ScanTemplateCourseHandler(
            ICourseRepository courseRepository,
            IFileTextExtractor fileExtractor,
            ICourseAiService aiService)
        {
            _courseRepository = courseRepository;
            _fileExtractor = fileExtractor;
            _aiService = aiService;
        }

        public async Task<ScanTemplateCourseResponseDto> Handle(
            ScanTemplateCourseCommand request,
            CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetByIdAsync(request.CourseId, cancellationToken);

            if (course == null)
                throw new NotFoundException($"Course with id {request.CourseId} does not exist.");

            if (!course.IsTemplate)
                throw new ConflictException($"Course with id {request.CourseId} is not a template course.");

            // 1) Extract text
            string text;
            try
            {
                text = await _fileExtractor.ExtractAsync(
                    request.FileContent,
                    request.ContentType);
            }
            catch (NotSupportedException ex)
            {
                throw new ConflictException($"File type not supported: {ex.Message}");
            }

            // 2) Send to AI
            ScanTemplateCourseResponseDto result;
            try
            {
                result = await _aiService.AnalyzeStructureAsync(text);
            }
            catch (InvalidOperationException ex)
            {
                // Wrap AI service errors with more context
                throw new ConflictException($"AI service error: {ex.Message}");
            }

            return result;
        }
    }
}
