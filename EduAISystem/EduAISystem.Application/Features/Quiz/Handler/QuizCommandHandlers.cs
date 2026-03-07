using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Quiz.Commands;
using EduAISystem.Application.Features.Quiz.DTOs.Request;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Domain.Entities;
using MediatR;

namespace EduAISystem.Application.Features.Quiz.Handler
{
    // =============================================
    // START ATTEMPT — Student bắt đầu làm bài
    // Dùng chung cho cả Flow 1 và Flow 2
    // =============================================
    public class StartQuizAttemptCommandHandler
        : IRequestHandler<StartQuizAttemptCommand, StartAttemptResponseDto>
    {
        private readonly IQuizRepository _quizRepository;
        private readonly IQuizAttemptRepository _attemptRepository;
        private readonly ICurrentUserService _currentUser;

        public StartQuizAttemptCommandHandler(
            IQuizRepository quizRepository,
            IQuizAttemptRepository attemptRepository,
            ICurrentUserService currentUser)
        {
            _quizRepository = quizRepository;
            _attemptRepository = attemptRepository;
            _currentUser = currentUser;
        }

        public async Task<StartAttemptResponseDto> Handle(
            StartQuizAttemptCommand request, CancellationToken cancellationToken)
        {
            var studentId = _currentUser.UserId;
            if (studentId == Guid.Empty) throw new UnauthorizedException("Bạn chưa đăng nhập.");

            // 1. Lấy quiz — validate tồn tại và đã publish
            var quiz = await _quizRepository.GetByIdAsync(request.QuizId, cancellationToken)
                ?? throw new NotFoundException("Quiz không tồn tại hoặc đã bị xoá.");

            if (quiz.IsPublished != true)
                throw new BusinessException("Quiz chưa được publish, không thể làm bài.");

            // 2. Kiểm tra MaxAttempts
            if (quiz.MaxAttempts.HasValue)
            {
                var usedAttempts = await _quizRepository.CountAttemptsAsync(
                    request.QuizId, studentId, cancellationToken);

                if (usedAttempts >= quiz.MaxAttempts.Value)
                    throw new BusinessException(
                        $"Bạn đã làm bài {usedAttempts} lần, đã đạt giới hạn {quiz.MaxAttempts} lần.");
            }

            // 3. Không được có Attempt IN_PROGRESS hiện tại
            var activeAttempt = await _attemptRepository.GetActiveAttemptAsync(
                request.QuizId, studentId, cancellationToken);

            if (activeAttempt is not null)
                throw new BusinessException(
                    $"Bạn đang có bài chưa nộp (AttemptId: {activeAttempt.Id}). Vui lòng nộp bài trước.");

            // 4. Tạo Attempt mới
            var attempt = QuizAttemptDomain.Start(studentId, request.QuizId);
            await _attemptRepository.CreateAsync(attempt, cancellationToken);

            return new StartAttemptResponseDto(
                AttemptId: attempt.Id,
                QuizId: quiz.Id,
                Status: attempt.Status,
                StartedAt: attempt.StartedAt,
                TimeLimitSeconds: quiz.TimeLimit.HasValue ? quiz.TimeLimit.Value * 60 : null
            );
        }
    }

    // =============================================
    // SUBMIT ATTEMPT — Student nộp bài
    // Dùng chung cho cả Flow 1 và Flow 2
    // =============================================
    public class SubmitQuizAttemptCommandHandler
        : IRequestHandler<SubmitQuizAttemptCommand, SubmitAttemptResponseDto>
    {
        private readonly IQuizRepository _quizRepository;
        private readonly IQuizAttemptRepository _attemptRepository;
        private readonly ICurrentUserService _currentUser;

        public SubmitQuizAttemptCommandHandler(
            IQuizRepository quizRepository,
            IQuizAttemptRepository attemptRepository,
            ICurrentUserService currentUser)
        {
            _quizRepository = quizRepository;
            _attemptRepository = attemptRepository;
            _currentUser = currentUser;
        }

        public async Task<SubmitAttemptResponseDto> Handle(
            SubmitQuizAttemptCommand request, CancellationToken cancellationToken)
        {
            var studentId = _currentUser.UserId;
            if (studentId == Guid.Empty) throw new UnauthorizedException("Bạn chưa đăng nhập.");

            // 1. Lấy Attempt và validate ownership
            var attempt = await _attemptRepository.GetByIdAsync(request.AttemptId, cancellationToken)
                ?? throw new NotFoundException("Attempt không tồn tại.");

            if (attempt.StudentId != studentId)
                throw new ForbiddenException("Bạn không có quyền nộp bài này.");

            if (!attempt.IsInProgress)
                throw new BusinessException("Bài này đã được nộp rồi.");

            // 2. Load Quiz + Questions + Options để grading
            var quizDetail = await _quizRepository.GetWithQuestionsAsync(attempt.QuizId, cancellationToken)
                ?? throw new NotFoundException("Quiz không tồn tại.");

            var quiz = quizDetail.Quiz;
            var questions = quizDetail.Questions;

            // 3. Grade từng câu trả lời
            var answers = new List<AttemptAnswerDomain>();
            decimal totalScore = 0m;
            decimal maxScore = questions.Sum(q => q.Points);

            foreach (var answer in request.Request.Answers)
            {
                var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question is null) continue; // bỏ qua câu hỏi không thuộc quiz

                var isCorrect = question.IsCorrect(answer.SelectedOptionId);
                var pointsEarned = question.GradeAnswer(answer.SelectedOptionId);
                totalScore += pointsEarned;

                answers.Add(new AttemptAnswerDomain
                {
                    AttemptId = attempt.Id,
                    QuestionId = question.Id,
                    AnswerText = answer.AnswerText,
                    SelectedOptionId = answer.SelectedOptionId,
                    IsCorrect = isCorrect,
                    PointsEarned = pointsEarned
                });
            }

            // 4. Lưu câu trả lời
            await _attemptRepository.SaveAnswersAsync(attempt.Id, answers, cancellationToken);

            // 5. Submit + Auto-grade
            var passingScore = quiz.PassingScore ?? 70m;
            attempt.Submit(totalScore, maxScore, passingScore, request.Request.TimeSpentSeconds ?? 0);
            await _attemptRepository.UpdateAsync(attempt, cancellationToken);

            return new SubmitAttemptResponseDto(
                AttemptId: attempt.Id,
                Status: attempt.Status,
                Score: attempt.Score ?? 0m,
                MaxScore: attempt.MaxScore ?? maxScore,
                Percentage: attempt.Percentage ?? 0m,
                IsPassed: attempt.IsPassed ?? false
            );
        }
    }

    // =============================================
    // CREATE FORMATIVE QUIZ — Teacher (Flow 1)
    // =============================================
    public class CreateFormativeQuizCommandHandler
        : IRequestHandler<CreateFormativeQuizCommand, Guid>
    {
        private readonly IQuizRepository _quizRepository;

        public CreateFormativeQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Guid> Handle(CreateFormativeQuizCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            var quiz = QuizDomain.CreateFormative(
                lessonId: dto.LessonId,
                title: dto.Title,
                description: dto.Description,
                timeLimit: dto.TimeLimit,
                maxAttempts: dto.MaxAttempts,
                passingScore: dto.PassingScore,
                isPublished: dto.IsPublished,
                isRequired: dto.IsRequired,
                showAnswers: dto.ShowAnswers,
                shuffleQuestions: dto.ShuffleQuestions
            );

            await _quizRepository.CreateAsync(quiz, cancellationToken);
            return quiz.Id;
        }
    }

    // =============================================
    // CREATE SUMMATIVE QUIZ — Teacher (Flow 2)
    // =============================================
    public class CreateSummativeQuizCommandHandler
        : IRequestHandler<CreateSummativeQuizCommand, Guid>
    {
        private readonly IQuizRepository _quizRepository;

        public CreateSummativeQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Guid> Handle(CreateSummativeQuizCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            var quiz = QuizDomain.CreateSummative(
                courseId: dto.CourseId,
                title: dto.Title,
                description: dto.Description,
                timeLimit: dto.TimeLimit,
                maxAttempts: dto.MaxAttempts,
                passingScore: dto.PassingScore,
                isPublished: dto.IsPublished,
                isRequired: dto.IsRequired,
                showAnswers: dto.ShowAnswers,
                shuffleQuestions: dto.ShuffleQuestions
            );

            await _quizRepository.CreateAsync(quiz, cancellationToken);
            return quiz.Id;
        }
    }

    // =============================================
    // ADD QUESTION TO QUIZ — Teacher
    // =============================================
    public class AddQuestionToQuizCommandHandler
        : IRequestHandler<AddQuestionToQuizCommand, Guid>
    {
        private readonly IQuizRepository _quizRepository;

        public AddQuestionToQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Guid> Handle(AddQuestionToQuizCommand request, CancellationToken cancellationToken)
        {
            var quizDetail = await _quizRepository.GetWithQuestionsAsync(request.QuizId, cancellationToken)
                ?? throw new NotFoundException($"Quiz {request.QuizId} không tồn tại.");

            var dto = request.Request;
            var questionId = Guid.NewGuid();

            var options = dto.Options.Select(o => 
            {
                // Sử dụng Reflection để tạo instance của internal QuestionOptionDomain
                var option = (QuestionOptionDomain)Activator.CreateInstance(
                    typeof(QuestionOptionDomain),
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                    null,
                    [Guid.NewGuid(), questionId, o.OptionText, o.IsCorrect, o.SortOrder],
                    null)!;
                return option;
            }).ToList();

            string? correctAnswer = null;
            if (dto.QuestionType == "TrueFalse" || dto.QuestionType == "ShortAnswer")
            {
                var correctOption = dto.Options.FirstOrDefault(o => o.IsCorrect);
                correctAnswer = correctOption?.OptionText ?? "Correct Answer";
            }

            // Reflection để tạo instance của internal QuestionDomain
            var question = (QuestionDomain)Activator.CreateInstance(
                typeof(QuestionDomain),
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                null,
                [questionId, request.QuizId, dto.QuestionText, dto.QuestionType, 
                 correctAnswer, dto.Points, dto.Explanation, dto.SortOrder, options],
                null)!;

            await _quizRepository.AddQuestionsAsync(request.QuizId, [question], cancellationToken);
            return questionId;
        }
    }

    // =============================================
    // UPDATE QUIZ — Teacher
    // =============================================
    public class UpdateQuizCommandHandler
        : IRequestHandler<UpdateQuizCommand, Guid>
    {
        private readonly IQuizRepository _quizRepository;

        public UpdateQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Guid> Handle(UpdateQuizCommand request, CancellationToken cancellationToken)
        {
            var quiz = await _quizRepository.GetByIdAsync(request.QuizId, cancellationToken)
                ?? throw new NotFoundException($"Quiz {request.QuizId} không tồn tại.");

            var dto = request.Request;

            QuizDomain.Update(
                quiz,
                title: dto.Title,
                description: dto.Description,
                timeLimit: dto.TimeLimit,
                maxAttempts: dto.MaxAttempts,
                passingScore: dto.PassingScore,
                isPublished: dto.IsPublished,
                isRequired: dto.IsRequired,
                showAnswers: dto.ShowAnswers,
                shuffleQuestions: dto.ShuffleQuestions
            );

            await _quizRepository.UpdateAsync(quiz, cancellationToken);
            return quiz.Id;
        }
    }

    // =============================================
    // DELETE QUIZ — Teacher (soft delete)
    // =============================================
    public class DeleteQuizCommandHandler
        : IRequestHandler<DeleteQuizCommand, Unit>
    {
        private readonly IQuizRepository _quizRepository;

        public DeleteQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Unit> Handle(DeleteQuizCommand request, CancellationToken cancellationToken)
        {
            var quiz = await _quizRepository.GetByIdAsync(request.QuizId, cancellationToken)
                ?? throw new NotFoundException($"Quiz {request.QuizId} không tồn tại.");

            QuizDomain.Delete(quiz);
            await _quizRepository.DeleteAsync(quiz, cancellationToken);

            return Unit.Value;
        }
    }

    // =============================================
    // UPDATE QUESTION — Teacher
    // =============================================
    public class UpdateQuestionInQuizCommandHandler
        : IRequestHandler<UpdateQuestionInQuizCommand, Unit>
    {
        private readonly IQuizRepository _quizRepository;

        public UpdateQuestionInQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Unit> Handle(UpdateQuestionInQuizCommand request, CancellationToken cancellationToken)
        {
            var quizDetail = await _quizRepository.GetWithQuestionsAsync(request.QuizId, cancellationToken)
                ?? throw new NotFoundException($"Quiz {request.QuizId} không tồn tại.");

            var existingQuestion = quizDetail.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
            if (existingQuestion is null)
                throw new NotFoundException($"Question {request.QuestionId} không tồn tại trong quiz.");

            var dto = request.Request;

            var options = dto.Options.Select(o =>
            {
                var optionId = o.OptionId ?? Guid.NewGuid();

                var option = (QuestionOptionDomain)Activator.CreateInstance(
                    typeof(QuestionOptionDomain),
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                    null,
                    new object[] { optionId, existingQuestion.Id, o.OptionText, o.IsCorrect, o.SortOrder },
                    null
                )!;

                return option;
            }).ToList();

            string? correctAnswer = null;
            if (dto.QuestionType == "TrueFalse" || dto.QuestionType == "ShortAnswer")
            {
                var correctOption = dto.Options.FirstOrDefault(o => o.IsCorrect);
                correctAnswer = correctOption?.OptionText ?? existingQuestion.CorrectAnswer ?? "Correct Answer";
            }

            var question = (QuestionDomain)Activator.CreateInstance(
                typeof(QuestionDomain),
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                null,
                new object[]
                {
                    existingQuestion.Id,
                    request.QuizId,
                    dto.QuestionText,
                    dto.QuestionType,
                    correctAnswer,
                    dto.Points,
                    dto.Explanation,
                    dto.SortOrder,
                    options
                },
                null
            )!;

            await _quizRepository.UpdateQuestionAsync(question, cancellationToken);

            return Unit.Value;
        }
    }

    // =============================================
    // DELETE QUESTION — Teacher
    // =============================================
    public class DeleteQuestionFromQuizCommandHandler
        : IRequestHandler<DeleteQuestionFromQuizCommand, Unit>
    {
        private readonly IQuizRepository _quizRepository;

        public DeleteQuestionFromQuizCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Unit> Handle(DeleteQuestionFromQuizCommand request, CancellationToken cancellationToken)
        {
            await _quizRepository.DeleteQuestionAsync(request.QuizId, request.QuestionId, cancellationToken);
            return Unit.Value;
        }
    }

    // =============================================
    // UPDATE QUESTION OPTION — Teacher
    // =============================================
    public class UpdateQuestionOptionCommandHandler
        : IRequestHandler<UpdateQuestionOptionCommand, Unit>
    {
        private readonly IQuizRepository _quizRepository;

        public UpdateQuestionOptionCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Unit> Handle(UpdateQuestionOptionCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            var option = (QuestionOptionDomain)Activator.CreateInstance(
                typeof(QuestionOptionDomain),
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
                null,
                [request.OptionId, request.QuestionId, dto.OptionText, dto.IsCorrect, dto.SortOrder],
                null
            )!;

            await _quizRepository.UpdateQuestionOptionAsync(request.QuestionId, option, cancellationToken);
            return Unit.Value;
        }
    }

    // =============================================
    // DELETE QUESTION OPTION — Teacher
    // =============================================
    public class DeleteQuestionOptionCommandHandler
        : IRequestHandler<DeleteQuestionOptionCommand, Unit>
    {
        private readonly IQuizRepository _quizRepository;

        public DeleteQuestionOptionCommandHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<Unit> Handle(DeleteQuestionOptionCommand request, CancellationToken cancellationToken)
        {
            await _quizRepository.DeleteQuestionOptionAsync(request.QuestionId, request.OptionId, cancellationToken);
            return Unit.Value;
        }
    }
}
