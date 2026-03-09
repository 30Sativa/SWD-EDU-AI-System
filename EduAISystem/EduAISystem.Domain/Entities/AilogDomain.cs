using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Domain.Entities
{
    public class AilogDomain
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? Feature { get; set; }
        public string? InputText { get; set; }
        public string? OutputText { get; set; }
        public int? TokensUsed { get; set; }
        public decimal? Cost { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
