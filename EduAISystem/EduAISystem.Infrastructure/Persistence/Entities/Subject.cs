namespace EduAISystem.Infrastructure.Persistence.Entities;

public partial class Subject
{
    public Guid Id { get; set; }

    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? NameEn { get; set; }

    public string? Description { get; set; }

    public string? IconUrl { get; set; }

    public string? Color { get; set; }

    public int? SortOrder { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}
