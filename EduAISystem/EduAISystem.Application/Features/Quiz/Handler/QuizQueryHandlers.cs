using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Quiz.DTOs.Response;
using EduAISystem.Application.Features.Quiz.Queries;
using MediatR;

namespace EduAISystem.Application.Features.Quiz.Handler
{
    // =============================================
    // GET QUIZZES BY LESSON — Flow 1
    // =============================================
    public class GetQuizzesByLessonQueryHandler
        : IRequestHandler<GetQuizzesByLessonQuery, List<QuizSummaryResponseDto>>
    {
        private readonly IQuizRepository _quizRepository;

        public GetQuizzesByLessonQueryHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<List<QuizSummaryResponseDto>> Handle(
            GetQuizzesByLessonQuery request, CancellationToken cancellationToken)
        {
            var quizzes = await _quizRepository.GetByLessonIdAsync(request.LessonId, cancellationToken);

            return quizzes.Select(q => new QuizSummaryResponseDto(
                QuizId: q.Id,
                Title: q.Title,
                Description: q.Description,
                QuizType: q.QuizType.ToString(),
                TimeLimit: q.TimeLimit,
                MaxAttempts: q.MaxAttempts,
                PassingScore: q.PassingScore,
                IsPublished: q.IsPublished,
                IsRequired: q.IsRequired,
                ShowAnswers: q.ShowAnswers,
                ShuffleQuestions: q.ShuffleQuestions,
                CreatedAt: q.CreatedAt
            )).ToList();
        }
    }

    // =============================================
    // GET QUIZZES BY COURSE — Flow 2
    // =============================================
    public class GetQuizzesByCourseQueryHandler
        : IRequestHandler<GetQuizzesByCourseQuery, List<QuizSummaryResponseDto>>
    {
        private readonly IQuizRepository _quizRepository;

        public GetQuizzesByCourseQueryHandler(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;
        }

        public async Task<List<QuizSummaryResponseDto>> Handle(
            GetQuizzesByCourseQuery request, CancellationToken cancellationToken)
        {
            var quizzes = await _quizRepository.GetByCourseIdAsync(request.CourseId, cancellationToken);

            return quizzes.Select(q => new QuizSummaryResponseDto(
                QuizId: q.Id,
                Title: q.Title,
                Description: q.Description,
                QuizType: q.QuizType.ToString(),
                TimeLimit: q.TimeLimit,
                MaxAttempts: q.MaxAttempts,
                PassingScore: q.PassingScore,
                IsPublished: q.IsPublished,
                IsRequired: q.IsRequired,
                ShowAnswers: q.ShowAnswers,
                ShuffleQuestions: q.ShuffleQuestions,
                CreatedAt: q.CreatedAt
            )).ToList();
        }
    }

    // =============================================
    // GET QUIZ DETAIL — Student lấy đề (ẩn đáp án)
    // =============================================
    public class GetQuizDetailQueryHandler
        : IRequestHandler<GetQuizDetailQuery, QuizDetailResponseDto>
    {
        private readonly IQuizRepository _quizRepository;
        private readonly ICurrentUserService _currentUser;

        public GetQuizDetailQueryHandler(
            IQuizRepository quizRepository,
            ICurrentUserService currentUser)
        {
            _quizRepository = quizRepository;
            _currentUser = currentUser;
        }

        public async Task<QuizDetailResponseDto> Handle(
            GetQuizDetailQuery request, CancellationToken cancellationToken)
        {
            var studentId = _currentUser.UserId;
            if (studentId == Guid.Empty) throw new UnauthorizedException("Bạn chưa đăng nhập.");

            var quizDetail = await _quizRepository.GetWithQuestionsAsync(request.QuizId, cancellationToken)
                ?? throw new NotFoundException("Quiz không tồn tại.");

            var quiz = quizDetail.Quiz;
            var attemptsUsed = await _quizRepository.CountAttemptsAsync(
                request.QuizId, studentId, cancellationToken);

            // Map câu hỏi — KHÔNG trả về IsCorrect / CorrectAnswer
            var questions = quizDetail.Questions.Select(q => new QuestionResponseDto(
                QuestionId: q.Id,
                QuestionText: q.QuestionText,
                QuestionType: q.QuestionType,
                Points: q.Points,
                SortOrder: q.SortOrder,
                Options: q.Options.Select(o => new OptionResponseDto(
                    OptionId: o.Id,
                    OptionText: o.OptionText,
                    SortOrder: o.SortOrder
                // KHÔNG có IsCorrect ở đây
                )).ToList()
            )).ToList();

            return new QuizDetailResponseDto(
                QuizId: quiz.Id,
                Title: quiz.Title,
                Description: quiz.Description,
                QuizType: quiz.QuizType.ToString(),
                TimeLimit: quiz.TimeLimit,
                MaxAttempts: quiz.MaxAttempts,
                AttemptsUsed: attemptsUsed,
                PassingScore: quiz.PassingScore,
                ShuffleQuestions: quiz.ShuffleQuestions,
                Questions: questions
            );
        }
    }

    // =============================================
    // GET ATTEMPT RESULT — Student xem kết quả
    // =============================================
    public class GetAttemptResultQueryHandler
        : IRequestHandler<GetAttemptResultQuery, AttemptResultResponseDto>
    {
        private readonly IQuizAttemptRepository _attemptRepository;
        private readonly ICurrentUserService _currentUser;

        public GetAttemptResultQueryHandler(
            IQuizAttemptRepository attemptRepository,
            ICurrentUserService currentUser)
        {
            _attemptRepository = attemptRepository;
            _currentUser = currentUser;
        }

        public async Task<AttemptResultResponseDto> Handle(
            GetAttemptResultQuery request, CancellationToken cancellationToken)
        {
            var studentId = _currentUser.UserId;
            if (studentId == Guid.Empty) throw new UnauthorizedException("Bạn chưa đăng nhập.");

            var data = await _attemptRepository.GetWithAnswersAsync(request.AttemptId, cancellationToken)
                ?? throw new NotFoundException("Attempt không tồn tại.");

            if (data.Attempt.StudentId != studentId)
                throw new ForbiddenException("Bạn không có quyền xem kết quả này.");

            if (data.Attempt.IsInProgress)
                throw new BusinessException("Bài thi chưa nộp, không thể xem kết quả.");

            var quiz = data.QuizDetail.Quiz;
            var questions = data.QuizDetail.Questions;
            var answers = data.Answers.ToDictionary(a => a.QuestionId);
            var showAnswers = quiz.ShowAnswers ?? false;

            var questionResults = questions.Select(q =>
            {
                answers.TryGetValue(q.Id, out var answer);

                // Tìm option text mà student đã chọn
                var selectedOption = answer?.SelectedOptionId.HasValue == true
                    ? q.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId)
                    : null;

                // Option đúng (chỉ hiện nếu ShowAnswers = true)
                var correctOption = showAnswers
                    ? q.Options.FirstOrDefault(o => o.IsCorrect == true)
                    : null;

                return new QuestionResultDto(
                    QuestionId: q.Id,
                    QuestionText: q.QuestionText,
                    QuestionType: q.QuestionType,
                    Points: q.Points,
                    SelectedOptionId: answer?.SelectedOptionId,
                    SelectedOptionText: selectedOption?.OptionText,
                    IsCorrect: answer?.IsCorrect ?? false,
                    PointsEarned: answer?.PointsEarned ?? 0m,
                    CorrectOptionText: correctOption?.OptionText,
                    Explanation: showAnswers ? q.Explanation : null
                );
            }).ToList();

            return new AttemptResultResponseDto(
                AttemptId: data.Attempt.Id,
                QuizId: quiz.Id,
                QuizTitle: quiz.Title,
                Status: data.Attempt.Status,
                Score: data.Attempt.Score ?? 0m,
                MaxScore: data.Attempt.MaxScore ?? 0m,
                Percentage: data.Attempt.Percentage ?? 0m,
                IsPassed: data.Attempt.IsPassed ?? false,
                PassingScore: quiz.PassingScore ?? 70m,
                StartedAt: data.Attempt.StartedAt,
                SubmittedAt: data.Attempt.SubmittedAt,
                TimeSpent: data.Attempt.TimeSpent,
                Questions: questionResults
            );
        }
        // =============================================
        // GET QUESTION OPTIONS
        // =============================================
        public class GetQuestionOptionsQueryHandler
            : IRequestHandler<GetQuestionOptionsQuery, List<OptionDetailResponseDto>>
        {
            private readonly IQuizRepository _quizRepository;

            public GetQuestionOptionsQueryHandler(IQuizRepository quizRepository)
            {
                _quizRepository = quizRepository;
            }

            public async Task<List<OptionDetailResponseDto>> Handle(
                GetQuestionOptionsQuery request, CancellationToken cancellationToken)
            {
                var options = await _quizRepository.GetQuestionOptionsAsync(request.QuestionId, cancellationToken);

                return options.Select(o => new OptionDetailResponseDto(
                    OptionId: o.Id,
                    OptionText: o.OptionText,
                    IsCorrect: o.IsCorrect,
                    SortOrder: o.SortOrder
                )).ToList();
            }
        }
    }
}
