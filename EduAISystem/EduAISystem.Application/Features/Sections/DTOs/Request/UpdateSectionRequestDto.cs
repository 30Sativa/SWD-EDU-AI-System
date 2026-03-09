using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Sections.DTOs.Request
{
    public class UpdateSectionRequestDto
    {
        public string Title { get; set; } = null;
        public string Description { get; set; } = string.Empty;
        public int SortOrder { get; set; }
    }
}
