using System;
using System.Collections.Generic;

namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class CourseSetting
{
    public Guid CourseId { get; set; }

    public bool? AllowAichat { get; set; }

    public bool? RequireQuizCompletion { get; set; }

    public decimal? PassingScore { get; set; }

    public bool? AllowDownloadResources { get; set; }

    public bool? EnableDiscussions { get; set; }

    public virtual Course Course { get; set; } = null!;
}
