using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Classes.Queries
{
    public class GetClassesByTeacherQuery : IRequest<List<ClassListResponseDto>>
    {
        public Guid TeacherUserId { get; set; }
    }
}
