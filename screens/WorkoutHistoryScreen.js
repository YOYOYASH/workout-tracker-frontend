import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { exerciseService, workoutLogService, workoutService } from "../api/apiService";

export default function WorkoutHistoryScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [exerciseMap, setExerciseMap] = useState({});
  const [planIdToName, setPlanIdToName] = useState({}); // only cache what's fetched
  const [exerciseIdToName, setExerciseIdToName] = useState({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await workoutLogService.getAllWorkoutLogs();
      const logsData = response.data;
      setLogs(logsData);
  
      // ✅ use logsData instead of logs
      const uniquePlanIds = [...new Set(logsData.map((log) => log.workout_plan_id))];
      const localMap = { ...planIdToName };
  
      await Promise.all(
        uniquePlanIds.map(async (planId) => {
          if (!localMap[planId]) {
            try {
              const res = await workoutService.getWorkoutPlanById(planId);
              localMap[planId] = res.data.name;
            } catch (err) {
              console.log(`Failed to fetch plan ${planId}`, err);
            }
          }
        })
      );
  
      setPlanIdToName(localMap); // ✅ will now contain all plan names
    } catch (error) {
      Alert.alert("Error", "Failed to load workout logs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExercisesForLog = async (logId) => {
    try {
      const response = await workoutLogService.getExercisesForLog(logId);
      const exercises = response.data
      setExerciseMap((prev) => ({
        ...prev,
        [logId]: exercises,
      }));

      // Fetch missing names
    for (let ex of exercises) {
        if (!exerciseIdToName[ex.exercise_id]) {
          await fetchExerciseName(ex.exercise_id);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch exercises.");
    }
  };

  const fetchPlanName = async (planId) => {
    if (planIdToName[planId]) return; // already fetched

    try {
      const response = await workoutService.getWorkoutPlanById(planId);
      setPlanIdToName((prev) => ({
        ...prev,
        [planId]: response.data.name,
      }));
    } catch (error) {
      console.log(`Error fetching plan ${planId}:`, error);
    }
  };

  const fetchExerciseName = async (exerciseId) => {
    if (exerciseIdToName[exerciseId]) return;
  
    try {
      const response = await exerciseService.getExerciseById(exerciseId);
      setExerciseIdToName((prev) => ({
        ...prev,
        [exerciseId]: response.data.name,
      }));
    } catch (error) {
      console.log(`Failed to fetch exercise ${exerciseId}`, error);
    }
  };

  const toggleExpand = async (logId, planId) => {
    const isExpanded = expandedLogs[logId];
    setExpandedLogs((prev) => ({ ...prev, [logId]: !isExpanded }));

    if (!isExpanded) {
      if (!exerciseMap[logId]) await fetchExercisesForLog(logId);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const renderExercise = (exercise) => (
    <View key={exercise.exercise_id} style={styles.exerciseItem}>
       <Text>{exerciseIdToName[exercise.exercise_id] || `Exercise #${exercise.exercise_id}`}</Text>
      <Text>Sets: {exercise.sets_completed}, Reps: {exercise.reps_completed}</Text>
      {exercise.weight_used !== null && <Text>Weight: {exercise.weight_used} kg</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : logs.length === 0 ? (
        <Text style={styles.noLogs}>No workout logs yet.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => `log-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleExpand(item.id, item.workout_plan_id)} style={styles.card}>
              <Text style={styles.plan}>
                Workout Plan: {planIdToName[item.workout_plan_id] || `Loading...`}
              </Text>
              <Text>Duration: {item.duration} min</Text>
              {item.notes ? <Text>Note: {item.notes}</Text> : null}
              <Text style={styles.date}>Logged on: {formatDate(item.date)}</Text>

              {expandedLogs[item.id] && (
                <>
                  <Text style={styles.subheading}>Exercises:</Text>
                  {exerciseMap[item.id] ? (
                    exerciseMap[item.id].map(renderExercise)
                  ) : (
                    <Text style={styles.loadingText}>Loading exercises...</Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10 },
  plan: { fontWeight: "bold", fontSize: 16 },
  date: { marginTop: 5, fontSize: 12, color: "gray" },
  noLogs: { textAlign: "center", fontSize: 16, color: "gray", marginTop: 50 },
  subheading: { marginTop: 10, fontWeight: "bold" },
  exerciseItem: { marginTop: 5, paddingLeft: 10 },
  loadingText: { fontStyle: "italic", color: "gray" },
});
