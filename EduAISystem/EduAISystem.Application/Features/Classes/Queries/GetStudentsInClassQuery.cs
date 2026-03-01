using EduAISystem.Application.Features.Classes.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;

namespace EduAISystem.Application.Features.Classes.Queries
{
    public class GetStudentsInClassQuery : IRequest<List<StudentInClassResponseDto>>
    {
        public Guid ClassId { get; set; }
    }
}
