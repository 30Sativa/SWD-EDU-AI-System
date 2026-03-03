using EduAISystem.Application.Abstractions.Persistence;
using EduAISystem.Application.Abstractions.Security;
using EduAISystem.Application.Common.Exceptions;
using EduAISystem.Application.Features.Submissions.Commands;
using EduAISystem.Application.Features.Submissions.DTOs.Request;
using EduAISystem.Application.Features.Submissions.Handler;
using EduAISystem.Application.Features.Submissions.Queries;
using EduAISystem.Domain.Entities;
using EduAISystem.Domain.Enums;
using EduAISystem.Tests.TestDoubles;
using FluentAssertions;
using Xunit;

namespace EduAISystem.Tests.Submissions;

public class SubmissionHandlersTests
{
    private static AssignmentDomain CreateAssignment(Guid id, Guid courseId, AssignmentStatusDomain status)
    {
        // Sử dụng constructor internal để rehydrate AssignmentDomain
        return (AssignmentDomain)Activator.CreateInstance(
            typeof(AssignmentDomain),
            nonPublic: true,
            args: new object[]
            {
                id,
                courseId,
                "Bài tập 1",
                null,
                DateTime.UtcNow.AddDays(7),
                10m,
                status,
                DateTime.UtcNow,
                null
            })!;
    }

    [Fact]
    public async Task SubmitAssignment_Should_Throw_When_User_Not_Authenticated()
    {
        // Arrange
        IAssignmentRepository assignmentRepo = new InMemoryAssignmentRepository();
        ISubmissionRepository submissionRepo = new InMemorySubmissionRepository();
        ICurrentUserService currentUser = new FakeCurrentUserService { UserId = Guid.Empty };

        var handler = new SubmitAssignmentCommandHandler(assignmentRepo, submissionRepo, currentUser);

        var dto = new SubmitAssignmentRequestDto("content", "fileUrl");

        // Act
        var act = async () => await handler.Handle(
            new SubmitAssignmentCommand(Guid.NewGuid(), dto),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task SubmitAssignment_Should_Throw_When_Assignment_Not_Published()
    {
        // Arrange
        var assignmentRepo = new InMemoryAssignmentRepository();
        var submissionRepo = new InMemorySubmissionRepository();
        var currentUser = new FakeCurrentUserService { UserId = Guid.NewGuid() };

        var assignmentId = Guid.NewGuid();
        var assignment = CreateAssignment(assignmentId, Guid.NewGuid(), AssignmentStatusDomain.Draft);
        await assignmentRepo.CreateAsync(assignment, CancellationToken.None);

        var handler = new SubmitAssignmentCommandHandler(assignmentRepo, submissionRepo, currentUser);

        var dto = new SubmitAssignmentRequestDto("content", "fileUrl");

        // Act
        var act = async () => await handler.Handle(
            new SubmitAssignmentCommand(assignmentId, dto),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task SubmitAssignment_First_Time_Should_Create_New_Submission()
    {
        // Arrange
        var assignmentRepo = new InMemoryAssignmentRepository();
        var submissionRepo = new InMemorySubmissionRepository();
        var studentId = Guid.NewGuid();
        var currentUser = new FakeCurrentUserService { UserId = studentId };

        var assignmentId = Guid.NewGuid();
        var assignment = CreateAssignment(assignmentId, Guid.NewGuid(), AssignmentStatusDomain.Published);
        await assignmentRepo.CreateAsync(assignment, CancellationToken.None);

        var handler = new SubmitAssignmentCommandHandler(assignmentRepo, submissionRepo, currentUser);

        var dto = new SubmitAssignmentRequestDto("content 1", "file1");

        // Act
        var submissionId = await handler.Handle(
            new SubmitAssignmentCommand(assignmentId, dto),
            CancellationToken.None);

        // Assert
        submissionId.Should().NotBeEmpty();
        var saved = await submissionRepo.GetByIdAsync(submissionId, CancellationToken.None);
        saved.Should().NotBeNull();
        saved!.Content.Should().Be("content 1");
        saved.FileUrl.Should().Be("file1");
        saved.Status.Should().Be(SubmissionStatusDomain.Submitted);
    }

    [Fact]
    public async Task SubmitAssignment_Second_Time_Should_Resubmit_And_Reset_Score()
    {
        // Arrange
        var assignmentRepo = new InMemoryAssignmentRepository();
        var submissionRepo = new InMemorySubmissionRepository();
        var studentId = Guid.NewGuid();
        var currentUser = new FakeCurrentUserService { UserId = studentId };

        var assignmentId = Guid.NewGuid();
        var assignment = CreateAssignment(assignmentId, Guid.NewGuid(), AssignmentStatusDomain.Published);
        await assignmentRepo.CreateAsync(assignment, CancellationToken.None);

        var handler = new SubmitAssignmentCommandHandler(assignmentRepo, submissionRepo, currentUser);

        // Lần 1
        var dto1 = new SubmitAssignmentRequestDto("content 1", "file1");
        var id1 = await handler.Handle(
            new SubmitAssignmentCommand(assignmentId, dto1),
            CancellationToken.None);

        // Giả lập đã chấm điểm lần 1
        var saved1 = await submissionRepo.GetByIdAsync(id1, CancellationToken.None);
        saved1!.Grade(8, "Good");
        await submissionRepo.UpdateAsync(saved1, CancellationToken.None);

        // Lần 2 (resubmit)
        var dto2 = new SubmitAssignmentRequestDto("content 2", "file2");
        var id2 = await handler.Handle(
            new SubmitAssignmentCommand(assignmentId, dto2),
            CancellationToken.None);

        // Assert: vẫn là cùng một submission Id, nhưng nội dung mới, score bị reset
        id2.Should().Be(id1);

        var saved2 = await submissionRepo.GetByIdAsync(id2, CancellationToken.None);
        saved2!.Content.Should().Be("content 2");
        saved2.FileUrl.Should().Be("file2");
        saved2.Score.Should().BeNull();
        saved2.Feedback.Should().BeNull();
        saved2.Status.Should().Be(SubmissionStatusDomain.Submitted);
    }

    [Fact]
    public async Task GradeSubmission_Should_Update_Score_And_Status()
    {
        // Arrange
        var submissionRepo = new InMemorySubmissionRepository();
        var assignmentId = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        var submission = SubmissionDomain.CreateDraft(
            assignmentId,
            studentId,
            "content",
            "file");

        await submissionRepo.CreateAsync(submission, CancellationToken.None);

        var handler = new GradeSubmissionCommandHandler(submissionRepo);
        var dto = new GradeSubmissionRequestDto(9, "Very good");

        // Act
        var id = await handler.Handle(
            new GradeSubmissionCommand(submission.Id, dto),
            CancellationToken.None);

        // Assert
        id.Should().Be(submission.Id);
        var saved = await submissionRepo.GetByIdAsync(id, CancellationToken.None);
        saved!.Score.Should().Be(9);
        saved.Feedback.Should().Be("Very good");
        saved.Status.Should().Be(SubmissionStatusDomain.Graded);
        saved.GradedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task GetMySubmissionForAssignment_Should_Return_Null_When_Not_Exists()
    {
        // Arrange
        var submissionRepo = new InMemorySubmissionRepository();
        var currentUser = new FakeCurrentUserService { UserId = Guid.NewGuid() };

        var handler = new GetMySubmissionForAssignmentQueryHandler(submissionRepo, currentUser);

        // Act
        var result = await handler.Handle(
            new GetMySubmissionForAssignmentQuery(Guid.NewGuid()),
            CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }
}

