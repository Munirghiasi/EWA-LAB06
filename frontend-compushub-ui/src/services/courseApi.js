import axios from "axios";

// Backend URL lives here so components only deal with displaying data.
const API_URL = "http://localhost:8080/api/v1/courses";

export const getCourses = () => {
  return axios.get(API_URL);
};

export const updateCourse = (id, course) => {
  return axios.put(`${API_URL}/${id}`, course);
};

export const deleteCourse = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};
