import axios from "axios";
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure Axios with base URL
const api = axios.create({
  baseURL: config.API_BASE_URL,
});

// Add a request interceptor to include token in headers
api.interceptors.request.use(
    async (requestConfig) => {
      const token = await AsyncStorage.getItem("userToken"); // Retrieve token
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );


// Authentication Service
export const authService = {
  login: (username, password) =>
    api.post(config.ENDPOINTS.LOGIN, `username=${username}&password=${password}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
};

// Exercise Services
export const exerciseService = {
  getAllExercises: () => api.get(config.ENDPOINTS.EXERCISES),
  getExerciseById: (id) => api.get(`${config.ENDPOINTS.EXERCISES}/${id}`),
};

// Workout Services
export const workoutService = {
  getAllWorkoutPlans: () => api.get(config.ENDPOINTS.WORKOUTS),
  getWorkoutPlanById: (id) => api.get(`${config.ENDPOINTS.WORKOUTS}/${id}`),
  getExercisesForDay: (dayId) => api.get(`${config.ENDPOINTS.WORKOUTS}/days/${dayId}/exercises`),
  createWorkoutPlan: (data) => api.post(config.ENDPOINTS.WORKOUTS, data),
  updateWorkoutPlan: (id, data) => api.put(`${config.ENDPOINTS.WORKOUTS}/${id}`, data),
  deleteWorkoutPlan: (id) => api.delete(`${config.ENDPOINTS.WORKOUTS}/${id}`),
  getExercisesForDay: (dayId) => api.get(`${config.ENDPOINTS.WORKOUTS}/days/${dayId}/exercises`),
};

// Workout Log Services
export const workoutLogService = {
  getAllWorkoutLogs: () => api.get(config.ENDPOINTS.WORKOUT_LOGS),
  createWorkoutLog: (data) => api.post(config.ENDPOINTS.WORKOUT_LOGS, data),
  addExerciseToLog: (logId, data) => api.post(`${config.ENDPOINTS.WORKOUT_LOGS}/${logId}/exercises`, data),
};

// Progress Services
export const progressService = {
  getAllProgress: () => api.get(config.ENDPOINTS.PROGRESS),
  getProgressById: (id) => api.get(`${config.ENDPOINTS.PROGRESS}/${id}`),
  createProgress: (data) => api.post(config.ENDPOINTS.PROGRESS, data),
  updateProgress: (id, data) => api.put(`${config.ENDPOINTS.PROGRESS}/${id}`, data),
  deleteProgress: (id) => api.delete(`${config.ENDPOINTS.PROGRESS}/${id}`),
};

// AI-Powered Workout Generation
export const genAIService = {
  generateWorkoutPlan: (query) => api.post(config.ENDPOINTS.GENAI, { query }),
};

// Export all services
export default {
  authService,
  exerciseService,
  workoutService,
  workoutLogService,
  progressService,
  genAIService,
};
