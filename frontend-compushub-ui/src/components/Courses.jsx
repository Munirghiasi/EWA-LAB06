import { useEffect, useState } from "react";
import { getCourses, updateCourse, deleteCourse } from "../services/courseApi";

const EMPTY_FORM = { code: "", title: "", credits: "" };

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // failed to LOAD the list
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null); // null = edit form hidden
  const [course, setCourse] = useState(EMPTY_FORM); // edit form values
  const [message, setMessage] = useState(""); // success feedback
  const [actionError, setActionError] = useState(""); // failed update/delete

  // Initial load (GET) with loading + error state and a cleanup guard.
  useEffect(() => {
    let ignore = false;

    async function fetchCourses() {
      try {
        const response = await getCourses();
        if (ignore) return;
        if (!Array.isArray(response.data)) {
          throw new Error("Expected an array of courses");
        }
        setCourses(response.data);
        setError("");
      } catch (err) {
        if (!ignore) {
          console.error("Error loading courses:", err);
          setCourses([]);
          setError("Unable to load courses. Check the backend and try again.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchCourses();
    return () => {
      ignore = true;
    };
  }, []);

  // Re-fetch after a successful update/delete so the table matches the backend.
  const loadCourses = async () => {
    const response = await getCourses();
    if (!Array.isArray(response.data)) {
      throw new Error("Expected an array of courses");
    }
    setCourses(response.data);
  };

  // Edit: copy the selected row into the form. String(... ?? "") keeps the
  // inputs safe even if a value is a number, null or undefined.
  const handleEdit = (selectedCourse) => {
    setEditingId(selectedCourse.id);
    setCourse({
      code: String(selectedCourse.code ?? ""),
      title: String(selectedCourse.title ?? ""),
      credits: String(selectedCourse.credits ?? ""),
    });
    setMessage("");
    setActionError("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setCourse(EMPTY_FORM);
  };

  // One handler for all three inputs: the input's name picks the property.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setCourse((previous) => ({ ...previous, [name]: value }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault(); // stop the browser reloading the page

    // Fix for "course.code.trim is not a function": convert to string first.
    const updatedCourse = {
      code: String(course.code ?? "").trim(),
      title: String(course.title ?? "").trim(),
      credits: Number(course.credits),
    };

    if (!updatedCourse.code || !updatedCourse.title || !(updatedCourse.credits > 0)) {
      setMessage("");
      setActionError("Code, title and a positive credit value are required.");
      return;
    }

    try {
      await updateCourse(editingId, updatedCourse);
    } catch (err) {
      console.error(err);
      setMessage("");
      setActionError(
        err.response?.status === 409
          ? "Another course already uses this code."
          : "Failed to update course. Check the API response."
      );
      return;
    }

    // The update itself succeeded; now refresh the table.
    setEditingId(null);
    setCourse(EMPTY_FORM);
    setActionError("");
    setMessage("Course updated successfully!");
    try {
      await loadCourses();
    } catch (err) {
      console.error(err);
      setActionError("Saved, but the list could not be refreshed. Reload the page.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await deleteCourse(id);
    } catch (err) {
      console.error(err);
      setMessage("");
      setActionError(
        err.response?.status === 404
          ? "This course no longer exists."
          : "Failed to delete course. Check the API response."
      );
      return;
    }

    if (editingId === id) handleCancel(); // close the form if it was open for this row
    setActionError("");
    setMessage("Course deleted successfully!");
    try {
      await loadCourses();
    } catch (err) {
      console.error(err);
      setActionError("Deleted, but the list could not be refreshed. Reload the page.");
    }
  };

  const term = search.trim().toLowerCase();
  const visibleCourses = term
    ? courses.filter(
        (c) =>
          String(c.title).toLowerCase().includes(term) ||
          String(c.code).toLowerCase().includes(term)
      )
    : courses;

  // Order: loading -> error -> empty result -> populated table.
  function renderCourseList() {
    if (loading) {
      return <p className="mb-0">Loading courses…</p>;
    }
    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      );
    }
    if (courses.length === 0) {
      return <p className="mb-0">No courses available.</p>;
    }
    return (
      <>
        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-6">
            <strong>Total courses: {courses.length}</strong>
            {term && (
              <span className="text-muted ms-2">
                (showing {visibleCourses.length})
              </span>
            )}
          </div>
          <div className="col-md-6">
            <input
              type="search"
              className="form-control"
              placeholder="Search by title or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Title</th>
                <th>Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.code}</td>
                  <td>{item.title}</td>
                  <td>{item.credits}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {visibleCourses.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-muted">
                    No courses match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Course Management</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {editingId !== null && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-warning">
            <strong>Edit Course</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    name="code"
                    className="form-control"
                    value={course.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={course.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    name="credits"
                    min="1"
                    className="form-control"
                    value={course.credits}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-success w-100">
                    Update
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary mt-3"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <strong>Add New Course</strong>
        </div>
        <div className="card-body">
          <form>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Course Code</label>
                <input type="text" className="form-control" placeholder="e.g. CS401" />
              </div>
              <div className="col-md-5">
                <label className="form-label">Course Title</label>
                <input type="text" className="form-control" placeholder="Course title" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Credits</label>
                <input type="number" className="form-control" min="1" />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="button" className="btn btn-primary w-100">
                  Add Course
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <strong>Course List</strong>
        </div>
        <div className="card-body">{renderCourseList()}</div>
      </div>
    </div>
  );
}

export default Courses;
