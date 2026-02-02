using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Users.Commands;
using MediatR;

namespace EduAISystem.Application.Features.Users.Handler
{
    public class SoftDeleteUserCommandHandler : IRequestHandler<SoftDeleteUserCommand, bool>
    {
        private readonly IUserRepository _userRepository;

        public SoftDeleteUserCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> Handle(SoftDeleteUserCommand request, CancellationToken cancellationToken)
        {
            return await _userRepository.SoftDeleteAsync(request.Id, cancellationToken);
        }
    }
}
