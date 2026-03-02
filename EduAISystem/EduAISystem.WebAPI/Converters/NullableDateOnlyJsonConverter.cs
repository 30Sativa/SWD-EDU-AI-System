using System.Text.Json;
using System.Text.Json.Serialization;

namespace EduAISystem.WebAPI.Converters
{
    /// <summary>
    /// Xử lý trường hợp frontend gửi "" (chuỗi rỗng) cho DateOnly?
    /// → tự động chuyển thành null thay vì báo lỗi 400
    /// </summary>
    public class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
    {
        public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            if (reader.TokenType == JsonTokenType.String)
            {
                var str = reader.GetString();

                // Chuỗi rỗng hoặc null → trả về null (không update)
                if (string.IsNullOrWhiteSpace(str))
                    return null;

                // Parse định dạng "yyyy-MM-dd"
                if (DateOnly.TryParse(str, out var date))
                    return date;

                throw new JsonException($"Không thể convert '{str}' sang DateOnly. Định dạng hợp lệ: yyyy-MM-dd");
            }

            throw new JsonException($"Token type không hợp lệ cho DateOnly?: {reader.TokenType}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd"));
            else
                writer.WriteNullValue();
        }
    }
}
