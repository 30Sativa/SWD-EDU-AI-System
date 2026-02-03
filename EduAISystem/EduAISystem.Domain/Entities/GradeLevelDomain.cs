using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Domain.Entities
{
    public class GradeLevelDomain
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        

        protected GradeLevelDomain()
        {
        }
        internal GradeLevelDomain(
            Guid id,
            string code,
            string name,
            int sortOrder,
            bool isActive,
            DateTime createdAt)
        {
            Id = id;
            Code = code;
            Name = name;
            SortOrder = sortOrder;
            IsActive = isActive;
            CreatedAt = createdAt;
        }

        public static GradeLevelDomain Create(
            string code,
            string name,
            int sortOrder)
        {
            return new GradeLevelDomain
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = name,
                SortOrder = sortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
        }
        public void Update(
            string name,
            int sortOrder,
            bool isActive)
        {
            Name = name;
            SortOrder = sortOrder;
            IsActive = isActive;
        }
    }
}
