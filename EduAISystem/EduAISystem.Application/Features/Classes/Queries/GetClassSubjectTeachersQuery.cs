using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Classes.Queries
{
    /// <summary>
    /// Lấy danh sách giáo viên bộ môn của 1 lớp theo classId
    /// </summary>
    public class GetClassSubjectTeachersQuery : IRequest<List<ClassSubjectTeacherResponseDto>>
    {
        public Guid ClassId { get; set; }
    }
}
