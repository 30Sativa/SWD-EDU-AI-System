namespace EduAISystem.Domain.Entities
{
    /// <summary>
    /// Domain entity cho Question trong Quiz — dùng để grading và hiển thị kết quả.
    /// </summary>
    public class QuestionDomain
    {
        public Guid Id { get; private set; }

        public Guid QuizId { get; private set; }

        public string QuestionText { get; private set; } = null!;

        /// <summary>multiple_choice | true_false | short_answer</summary>
        public string QuestionType { get; private set; } = null!;

        public string? CorrectAnswer { get; private set; }

        public decimal Points { get; private set; } = 1m;

        public string? Explanation { get; private set; }

        public int SortOrder { get; private set; }

        public IReadOnlyList<QuestionOptionDomain> Options { get; private set; } = [];

        private QuestionDomain() { }

        internal QuestionDomain(
            Guid id,
            Guid quizId,
            string questionText,
            string questionType,
            string? correctAnswer,
            decimal points,
            string? explanation,
            int sortOrder,
            IReadOnlyList<QuestionOptionDomain> options)
        {
            Id = id;
            QuizId = quizId;
            QuestionText = questionText;
            QuestionType = questionType;
            CorrectAnswer = correctAnswer;
            Points = points;
            Explanation = explanation;
            SortOrder = sortOrder;
            Options = options;
        }

        /// <summary>Tính điểm cho một câu hỏi dựa trên option Student chọn.</summary>
        public decimal GradeAnswer(Guid? selectedOptionId)
        {
            if (selectedOptionId == null) return 0m;

            var correct = Options.FirstOrDefault(o => o.IsCorrect == true);
            return correct?.Id == selectedOptionId ? Points : 0m;
        }

        /// <summary>Kiểm tra đáp án đúng/sai với option Student chọn.</summary>
        public bool IsCorrect(Guid? selectedOptionId)
        {
            if (selectedOptionId == null) return false;
            return Options.Any(o => o.Id == selectedOptionId && o.IsCorrect == true);
        }
    }

    /// <summary>Domain entity cho một lựa chọn của Question.</summary>
    public class QuestionOptionDomain
    {
        public Guid Id { get; private set; }
        public Guid QuestionId { get; private set; }
        public string OptionText { get; private set; } = null!;
        public bool? IsCorrect { get; private set; }
        public int SortOrder { get; private set; }

        private QuestionOptionDomain() { }

        internal QuestionOptionDomain(Guid id, Guid questionId, string optionText, bool? isCorrect, int sortOrder)
        {
            Id = id;
            QuestionId = questionId;
            OptionText = optionText;
            IsCorrect = isCorrect;
            SortOrder = sortOrder;
        }
    }
}
