using EduAISystem.Infrastructure.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Infrastructure.Persistence.Seed
{
    public interface IMasterSeeder
    {
        Task SeedAsync(EduAiDbV5Context context);
    }
}
