namespace EduAISystem.Application.Common.Helpers;

/// <summary>
/// Helper xử lý giá trị từ request: null, "", " " → coi là "không cập nhật", giữ nguyên giá trị cũ.
/// </summary>
public static class StringUpdateHelper
{
    /// <summary>
    /// Kiểm tra chuỗi có phải "có dữ liệu" hay không.
    /// null, "", " ", chuỗi chỉ có whitespace → false (không cập nhật).
    /// </summary>
    public static bool HasValue(string? value) =>
        !string.IsNullOrWhiteSpace(value);

    /// <summary>
    /// Nếu <paramref name="incoming"/> có giá trị (không null/empty/whitespace) thì dùng nó,
    /// ngược lại giữ nguyên <paramref name="existing"/>.
    /// </summary>
    public static string Resolve(string? incoming, string existing) =>
        HasValue(incoming) ? incoming!.Trim() : existing;

    /// <summary>
    /// Tương tự Resolve nhưng cho nullable string.
    /// </summary>
    public static string? ResolveNullable(string? incoming, string? existing)
    {
        if (incoming is null) return existing;
        if (string.IsNullOrWhiteSpace(incoming)) return existing;
        return incoming.Trim();
    }

    /// <summary>
    /// Chỉ dùng incoming khi nó có giá trị; nếu null/empty/whitespace thì dùng existing.
    /// Cho các kiểu value type (int, decimal, bool).
    /// </summary>
    public static T ResolveValue<T>(T? incoming, T existing) where T : struct =>
        incoming.HasValue ? incoming.Value : existing;
}
