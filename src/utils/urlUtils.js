/**
 * Utility để lưu/lấy ID hiện tại từ sessionStorage
 * Giúp ẩn hoàn toàn UUID/ID khỏi URL, chỉ dùng state/sessionStorage
 * Hoàn toàn xử lý ở frontend, không cần thay đổi backend
 */

// ─── Student ─────────────────────────────────────────
export function saveCurrentCourseId(id) {
    if (id) sessionStorage.setItem('current_course_id', id);
}
export function getCurrentCourseId() {
    return sessionStorage.getItem('current_course_id') || '';
}

export function saveCurrentLessonId(id) {
    if (id) sessionStorage.setItem('current_lesson_id', id);
}
export function getCurrentLessonId() {
    return sessionStorage.getItem('current_lesson_id') || '';
}

// ─── Teacher ─────────────────────────────────────────
export function saveTeacherCourseId(id) {
    if (id) sessionStorage.setItem('teacher_course_id', id);
}
export function getTeacherCourseId() {
    return sessionStorage.getItem('teacher_course_id') || '';
}

export function saveTeacherLessonId(id) {
    if (id) sessionStorage.setItem('teacher_lesson_id', id);
}
export function getTeacherLessonId() {
    return sessionStorage.getItem('teacher_lesson_id') || '';
}

export function saveTeacherQuizId(id) {
    if (id) sessionStorage.setItem('teacher_quiz_id', id);
}
export function getTeacherQuizId() {
    return sessionStorage.getItem('teacher_quiz_id') || '';
}

export function saveTeacherAssignmentId(id) {
    if (id) sessionStorage.setItem('teacher_assignment_id', id);
}
export function getTeacherAssignmentId() {
    return sessionStorage.getItem('teacher_assignment_id') || '';
}

export function saveTeacherSubmissionId(id) {
    if (id) sessionStorage.setItem('teacher_submission_id', id);
}
export function getTeacherSubmissionId() {
    return sessionStorage.getItem('teacher_submission_id') || '';
}

export function saveTeacherClassId(id) {
    if (id) sessionStorage.setItem('teacher_class_id', id);
}
export function getTeacherClassId() {
    return sessionStorage.getItem('teacher_class_id') || '';
}

export function saveTeacherFolderId(id) {
    if (id) sessionStorage.setItem('teacher_folder_id', id);
}
export function getTeacherFolderId() {
    return sessionStorage.getItem('teacher_folder_id') || '';
}

// ─── Manager ─────────────────────────────────────────
export function saveManagerSubjectId(id) {
    if (id) sessionStorage.setItem('manager_subject_id', id);
}
export function getManagerSubjectId() {
    return sessionStorage.getItem('manager_subject_id') || '';
}

export function saveManagerClassId(id) {
    if (id) sessionStorage.setItem('manager_class_id', id);
}
export function getManagerClassId() {
    return sessionStorage.getItem('manager_class_id') || '';
}
