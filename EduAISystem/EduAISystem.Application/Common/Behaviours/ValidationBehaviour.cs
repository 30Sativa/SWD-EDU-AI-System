using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using EduAISystem.Application.Common.Exceptions;

namespace EduAISystem.Application.Common.Behaviours
{
    public class ValidationBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (_validators.Any())
            {
                var context = new ValidationContext<TRequest>(request);

                var failures = _validators
                    .Select(v => v.Validate(context))
                    .SelectMany(r => r.Errors)
                    .Where(f => f != null)
                    .GroupBy(
                        f => f.PropertyName,
                        f => f.ErrorMessage,
                        (key, values) => new { key, values })
                    .ToDictionary(
                        x => x.key,
                        x => x.values.ToArray());

                if (failures.Any())
                    throw new EduAISystem.Application.Common.Exceptions.ValidationException(failures);
            }

            return await next();
        }
    }
}
