using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Auth.Commands;
using EduAISystem.Application.Features.Auth.DTOs.Response;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Auth.Handler
{
    public class RegisterCommandHandle : IRequestHandler<RegisterCommand, RegisterResponseDto>
    {
        private readonly IUserRepository _users;
        private readonly IPasswordHasher _hasher;

        public RegisterCommandHandle(IUserRepository users, IPasswordHasher hasher)
        {
            _users = users;
            _hasher = hasher;
        }
        public async Task<RegisterResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            //check mail exist
            var existEmail = await _users.GetByEmailAsync(request.Request.Email);
            if(existEmail !=null)
            {
                throw new ConflictException("Email already exists");
            }
            //Hash password
            var passwordHash = _hasher.Hash(request.Request.PasswordHash);
            //Create user
            var user = UserDomain.Create(request.Request.Email,passwordHash, request.Request.FullName,UserRoleDomain.Admin);

            await _users.AddAsync(user);

            return new RegisterResponseDto
            {
                UserId = user.Id,
                Email = user.Email
            };

        }
    }
}
