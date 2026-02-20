using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Courses.Commands;
using EduAISystem.Application.Features.Courses.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            var course = await _courseRepository.GetByIdAsync(request.CourseId);

            if (course == null || !course.IsTemplate)
                throw new Exception("Invalid template course");

            // 1) Extract text
            var text = await _fileExtractor.ExtractAsync(
                request.FileContent,
                request.ContentType);

            // 2) Send to AI
            var result = await _aiService.AnalyzeStructureAsync(text);

            return result;
        }
    }
}
