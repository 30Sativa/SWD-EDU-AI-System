using EduAISystem.Domain.Enums;

namespace EduAISystem.Domain.Entities
{
    public class NotificationDomain
    {
        public Guid Id { get; private set; }

        public Guid UserId { get; private set; }

        public NotificationTypeDomain Type { get; private set; }

        public string Title { get; private set; } = string.Empty;

        public string Message { get; private set; } = string.Empty;

        public string? Link { get; private set; }

        public bool IsRead { get; private set; }

        public DateTime? ReadAt { get; private set; }

        public DateTime CreatedAt { get; private set; }

        protected NotificationDomain() { }

        // =========================
        // CREATE NEW NOTIFICATION
        // =========================
        public NotificationDomain(
            Guid userId,
            NotificationTypeDomain type,
            string title,
            string message,
            string? link = null)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId is required.");

            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");

            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Message is required.");

            Id = Guid.NewGuid();
            UserId = userId;
            Type = type;
            Title = title.Trim();
            Message = message.Trim();
            Link = link?.Trim();
            IsRead = false;
            ReadAt = null;
            CreatedAt = DateTime.UtcNow;
        }

        // =========================
        // LOAD FROM DATABASE
        // =========================
        internal static NotificationDomain Load(
            Guid id,
            Guid userId,
            NotificationTypeDomain type,
            string title,
            string message,
            string? link,
            bool isRead,
            DateTime createdAt,
            DateTime? readAt)
        {
            return new NotificationDomain
            {
                Id = id,
                UserId = userId,
                Type = type,
                Title = title,
                Message = message,
                Link = link,
                IsRead = isRead,
                CreatedAt = createdAt,
                ReadAt = readAt
            };
        }

        // =========================
        // MARK AS READ
        // =========================
        public void MarkAsRead()
        {
            if (IsRead)
                return;

            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }

        // =========================
        // MARK AS UNREAD
        // =========================
        public void MarkAsUnread()
        {
            if (!IsRead)
                return;

            IsRead = false;
            ReadAt = null;
        }
    }
}
