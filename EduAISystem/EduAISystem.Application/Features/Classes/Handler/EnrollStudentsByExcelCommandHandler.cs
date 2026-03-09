using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.Commands;
using EduAISystem.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class EnrollStudentsByExcelCommandHandler : IRequestHandler<EnrollStudentsByExcelCommand, (int count, List<string> errors)>
    {
        private readonly IClassRepository _classRepo;
        private readonly IUserRepository _userRepo;
        private readonly IExcelUserParser _excelParser;

        public EnrollStudentsByExcelCommandHandler(
            IClassRepository classRepo, 
            IUserRepository userRepo, 
            IExcelUserParser excelParser)
        {
            _classRepo = classRepo;
            _userRepo = userRepo;
            _excelParser = excelParser;
        }

        public async Task<(int count, List<string> errors)> Handle(EnrollStudentsByExcelCommand request, CancellationToken cancellationToken)
        {
            var classEntity = await _classRepo.GetByIdAsync(request.ClassId, cancellationToken);
            if (classEntity == null) throw new Exception("Không tìm thấy lớp học.");

            var enrollmentList = _excelParser.Parse(request.FileContent);
            int successCount = 0;
            var errorList = new List<string>();

            foreach (var item in enrollmentList)
            {
                var userFound = await _userRepo.GetByEmailAsync(item.Email);
                if (userFound == null)
                {
                    errorList.Add($"Không tìm thấy tài khoản học sinh: {item.Email}");
                    continue;
                }

                if (userFound.Role != UserRoleDomain.Student)
                {
                    errorList.Add($"Tài khoản {item.Email} không phải là học sinh.");
                    continue;
                }

                await _classRepo.EnrollStudentToClassAsync(userFound.Id, request.ClassId, cancellationToken);
                successCount++;
            }

            return (successCount, errorList);
        }
    }
}
