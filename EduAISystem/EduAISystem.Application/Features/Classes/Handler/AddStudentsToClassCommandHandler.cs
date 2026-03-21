using EduAISystem.Application.Abstractions.Common;
using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Features.Classes.Commands;
using EduAISystem.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EduAISystem.Application.Features.Classes.Handler
{
    public class AddStudentsToClassCommandHandler : IRequestHandler<AddStudentsToClassCommand, bool>
    {
        private readonly IClassRepository _classRepo;
        private readonly IUserRepository _userRepo;
        private readonly IEmailService _emailService;
        public AddStudentsToClassCommandHandler(IClassRepository classRepo, IUserRepository userRepo, IEmailService emailService)
        {
            _classRepo = classRepo;
            _userRepo = userRepo;
            _emailService = emailService;
        }

        public async Task<bool> Handle(AddStudentsToClassCommand request, CancellationToken cancellationToken)
        {
            var classEntity = await _classRepo.GetByIdAsync(request.ClassId, cancellationToken);
            if (classEntity == null) return false;

            foreach (var studentId in request.StudentUserIds)
            {
                var student = await _userRepo.GetByIdAsync(studentId, cancellationToken);
                if (student != null && student.Role == UserRoleDomain.Student)
                {
                    // Kiểm tra xem học sinh đã có lớp khác chưa
                    var currentClass = await _classRepo.GetStudentCurrentClassAsync(studentId, cancellationToken);
                    if (currentClass != null && currentClass.Id != request.ClassId)
                    {
                        throw new InvalidOperationException($"Học sinh {student.Email} hiện đã thuộc lớp {currentClass.Name}. Vui lòng xóa học sinh khỏi lớp đó trước khi thêm vào lớp mới.");
                    }

                    await _classRepo.EnrollStudentToClassAsync(studentId, request.ClassId, cancellationToken);
                    
                    try 
                    {
                        await _emailService.SendClassEnrollmentEmailAsync(student.Email, student.UserProfile!.FullName, classEntity.Name);
                    }
                    catch (Exception ex) 
                    { 
                        Console.WriteLine($"[EMAIL ERROR at AddToClass]: {ex.Message}");
                    }
                }
            }

            return true;
        }
    }
}
