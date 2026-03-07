using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Common.Models;
using EduAISystem.Application.Features.Students.DTOs.Response;
using EduAISystem.Application.Features.Students.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Students.Handler
{
    public class GetStudentsQueryHandler : IRequestHandler<GetStudentsQuery, PagedResult<StudentListResponseDto>>
    {
        private readonly IStudentRepository _studentRepository;

        public GetStudentsQueryHandler(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<PagedResult<StudentListResponseDto>> Handle(GetStudentsQuery request, CancellationToken cancellationToken)
        {
            var result = await _studentRepository.GetStudentsPagedAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.GradeLevelId,
                request.TermId,
                request.ClassId,
                request.IsActiveFilter,
                cancellationToken);

            var dtoItems = result.Items.Select(s => new StudentListResponseDto
            {
                UserId = s.UserId,
                Email = s.Email,
                FullName = s.FullName,
                StudentCode = s.StudentCode,
                Role = (int)s.Role,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt,
                GradeLevelId = s.GradeLevelId,
                GradeLevelName = s.GradeLevelName,
                Classes = s.Classes.Select(c => new StudentClassDto
                {
                    ClassId = c.ClassId,
                    ClassName = c.ClassName,
                    TermId = c.TermId,
                    TermName = c.TermName
                }).ToList()
            }).ToList();

            return new PagedResult<StudentListResponseDto>
            {
                Items = dtoItems,
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }
    }
}
