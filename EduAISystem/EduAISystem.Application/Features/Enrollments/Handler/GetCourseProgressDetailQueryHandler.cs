using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Features.Enrollments.DTOs.Response;
using EduAISystem.Application.Features.Enrollments.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Enrollments.Handler
{
    public class GetCourseProgressDetailQueryHandler
        : IRequestHandler<GetCourseProgressDetailQuery, CourseProgressDetailResponseDto>
    {
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly ISectionRepository _sectionRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonProgressRepository _lessonProgressRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetCourseProgressDetailQueryHandler(
            IEnrollmentRepository enrollmentRepository,
            ICourseRepository courseRepository,
            ISectionRepository sectionRepository,
            ILessonRepository lessonRepository,
            ILessonProgressRepository lessonProgressRepository,
            ICurrentUserService currentUserService)
        {
            _enrollmentRepository = enrollmentRepository;
            _courseRepository = courseRepository;
            _sectionRepository = sectionRepository;
            _lessonRepository = lessonRepository;
            _lessonProgressRepository = lessonProgressRepository;
            _currentUserService = currentUserService;
        }

        public async Task<CourseProgressDetailResponseDto> Handle(
            GetCourseProgressDetailQuery request,
            CancellationToken cancellationToken)
        {
            var studentId = _currentUserService.UserId;
            if (studentId == Guid.Empty)
            {
                throw new UnauthorizedAccessException("Student must be authenticated to view course progress.");
            }

            var enrollment = await _enrollmentRepository
                .GetAsync(studentId, request.CourseId, cancellationToken);

            if (enrollment == null)
            {
                throw new KeyNotFoundException("Student is not enrolled in this course.");
            }

            var course = await _courseRepository
                .GetByIdAsync(request.CourseId, cancellationToken);

            if (course == null)
            {
                throw new KeyNotFoundException("Course not found.");
            }

            var sections = await _sectionRepository.GetByCourseIdAsync(request.CourseId);
            var sectionIds = sections.Select(s => s.Id).ToList();

            var lessons = sectionIds.Any()
                ? await _lessonRepository.GetBySectionIdAsync(sectionIds, cancellationToken)
                : new List<Domain.Entities.LessonDomain>();

            var lessonProgressList = await _lessonProgressRepository
                .GetByStudentAndCourseAsync(studentId, request.CourseId, cancellationToken);

            var progressLookup = lessonProgressList
                .ToDictionary(p => p.LessonId, p => p);

            var sectionDtos = new List<CourseSectionProgressResponseDto>();
            var totalLessons = 0;
            var completedLessons = 0;

            foreach (var section in sections.OrderBy(s => s.SortOrder))
            {
                var sectionLessons = lessons
                    .Where(l => l.SectionId == section.Id)
                    .OrderBy(l => l.SortOrder)
                    .ToList();

                var lessonDtos = new List<CourseLessonProgressResponseDto>();

                foreach (var lesson in sectionLessons)
                {
                    totalLessons++;

                    progressLookup.TryGetValue(lesson.Id, out var lessonProgress);

                    var isCompleted = lessonProgress?.IsCompleted ?? false;
                    if (isCompleted)
                    {
                        completedLessons++;
                    }

                    lessonDtos.Add(new CourseLessonProgressResponseDto
                    {
                        LessonId = lesson.Id,
                        SectionId = lesson.SectionId,
                        Title = lesson.Title,
                        SortOrder = lesson.SortOrder,
                        Duration = lesson.Duration,
                        IsCompleted = isCompleted,
                        WatchedDuration = lessonProgress?.WatchedDuration ?? 0,
                        LastAccessedAt = lessonProgress?.LastAccessedAt
                    });
                }

                sectionDtos.Add(new CourseSectionProgressResponseDto
                {
                    SectionId = section.Id,
                    Title = section.Title,
                    Description = section.Description,
                    Order = section.SortOrder,
                    Lessons = lessonDtos
                });
            }

            return new CourseProgressDetailResponseDto
            {
                CourseId = course.Id,
                CourseTitle = course.Title,
                Progress = enrollment.Progress,
                Status = enrollment.Status.ToString(),
                TotalLessons = totalLessons,
                CompletedLessons = completedLessons,
                Sections = sectionDtos
            };
        }
    }
}

