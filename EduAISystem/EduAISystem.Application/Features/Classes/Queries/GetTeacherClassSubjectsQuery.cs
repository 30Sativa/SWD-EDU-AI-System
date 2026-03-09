using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Classes.Queries
{
    /// <summary>
    /// Lấy danh sách lớp mà giáo viên được phân công dạy bộ môn (theo teacherId)
    /// </summary>
    public class GetTeacherClassSubjectsQuery : IRequest<List<TeacherClassSubjectResponseDto>>
    {
        public Guid TeacherId { get; set; }
    }
}
