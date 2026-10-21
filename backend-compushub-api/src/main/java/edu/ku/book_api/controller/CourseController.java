package edu.ku.book_api.controller;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    // Response model: what the API sends back.
    public record Course(long id, String code, String title, int credits) {}

    // Request model: what the client sends (no id, the id comes from the URL).
    public record CourseInput(String code, String title, int credits) {}

    // In-memory, modifiable and thread-safe list (List.of would be immutable).
    private final List<Course> courses = new CopyOnWriteArrayList<>(List.of(
            new Course(1, "EWA301", "Enterprise Web App", 3),
            new Course(2, "DB201", "Database Systems", 3),
            new Course(3, "SE202", "Software Engineering", 3)
    ));

    // GET /api/v1/courses -> 200 + JSON array
    @GetMapping
    public List<Course> getCourses() {
        return courses;
    }

    // PUT /api/v1/courses/{id} -> 200 updated course, 400, 404 or 409
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable long id,
            @RequestBody CourseInput input) {

        // 1. Validate first (a null code would crash trim() below).
        if (input.code() == null || input.code().isBlank()
                || input.title() == null || input.title().isBlank()
                || input.credits() <= 0) {
            return ResponseEntity.badRequest().body(
                    "Course code, title, and a positive credit value are required.");
        }

        String code = input.code().trim().toUpperCase();

        // 2. Reject a code that already belongs to a DIFFERENT course.
        boolean codeTaken = courses.stream()
                .anyMatch(c -> c.id() != id && c.code().equalsIgnoreCase(code));
        if (codeTaken) {
            return ResponseEntity.status(409).body(
                    "A course with this code already exists.");
        }

        // 3. Find the course and replace it (records are immutable).
        for (int index = 0; index < courses.size(); index++) {
            if (courses.get(index).id() == id) {
                Course updated = new Course(id, code, input.title().trim(), input.credits());
                courses.set(index, updated);
                return ResponseEntity.ok(updated);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE /api/v1/courses/{id} -> 204, or 404 if it does not exist
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable long id) {
        boolean removed = courses.removeIf(c -> c.id() == id);
        if (!removed) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
