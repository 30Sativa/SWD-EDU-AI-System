using System;

namespace EduAISystem.Application.Features.Dashboards.DTOs.Response
{
    public class AdminDashboardResponseDto
    {
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalCourses { get; set; }
        public int TotalClasses { get; set; }
        public int TotalEnrollments { get; set; }
    }

    public class TeacherDashboardResponseDto
    {
        public int TotalCourses { get; set; }
        public int TotalClasses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalAssignments { get; set; }
        // Can add more if needed
    }

    public class StudentDashboardResponseDto
    {
        public int TotalEnrolledCourses { get; set; }
        public int TotalCompletedCourses { get; set; }
        public int TotalClasses { get; set; }
        public int TotalAssignments { get; set; }
    }
}
