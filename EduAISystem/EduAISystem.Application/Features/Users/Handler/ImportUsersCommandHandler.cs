using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Features.Users.Commands;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Users.Handler
{
    public class ImportUsersCommandHandler
    : IRequestHandler<ImportUsersCommand>
    {
        private readonly IUserRepository _userRepo;
        private readonly IExcelUserParser _excelParser;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;

        public ImportUsersCommandHandler(
            IUserRepository userRepo,
            IExcelUserParser excelParser,
            IPasswordHasher passwordHasher,
            IEmailService emailService)
        {
            _userRepo = userRepo;
            _excelParser = excelParser;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
        }

        public async Task Handle(
            ImportUsersCommand request,
            CancellationToken cancellationToken)
        {
            var users = _excelParser.Parse(request.FileContent);

            foreach (var item in users)
            {
                var existingUser = await _userRepo.GetByEmailAsync(item.Email);

                if (existingUser != null)
                    continue;

                var passwordHash = _passwordHasher.Hash("123456");

                var user = UserDomain.CreateImported(
                    item.Email,
                    passwordHash,
                    UserRoleDomain.Student
                );

                await _userRepo.AddAsync(user);

                await _emailService.SendWelcomeEmail(
                    item.Email,
                    "123456"
                );
            }
        }
    }
}
