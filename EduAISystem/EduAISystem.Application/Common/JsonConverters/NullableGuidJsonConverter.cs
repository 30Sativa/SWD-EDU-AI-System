using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EduAISystem.Application.Common.JsonConverters
{

    public sealed class NullableGuidJsonConverter : JsonConverter<Guid?>
    {
        public override Guid? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            if (reader.TokenType == JsonTokenType.String)
            {
                var s = reader.GetString();
                if (string.IsNullOrWhiteSpace(s))
                    return null;

                if (Guid.TryParse(s, out var g))
                    return g;

                throw new JsonException($"Invalid GUID value: '{s}'.");
            }

            throw new JsonException($"Unexpected token parsing Guid?: {reader.TokenType}.");
        }

        public override void Write(Utf8JsonWriter writer, Guid? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value);
            else
                writer.WriteNullValue();
        }
    }
}

