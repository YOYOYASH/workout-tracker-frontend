import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet,Button } from "react-native";
import { workoutService } from "../api/apiService";

export default function ExercisesListScreen({ route,navigation }) {
  const { dayId,workoutId } = route.params; // Get selected day ID
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercisesForDay();
  }, []);

  const fetchExercisesForDay = async () => {
    try {
      const response = await workoutService.getExercisesForDay(dayId);
      setExercises(response.data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercises for This Day</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : exercises.length === 0 ? (
        <Text style={styles.noExercisesText}>No exercises found for this day.</Text>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => `exercise-${item.id}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.exerciseTitle}>Exercise ID: {item.exercise_id}</Text>
              <Text>Sets: {item.sets}</Text>
              <Text>Reps: {item.reps}</Text>
              <Text>Order: {item.order}</Text>
            </View>
          )}
        />
      )}
      <Button
  title="Log This Workout"
  onPress={() => navigation.navigate("LogWorkout", {
    dayId,
    workoutPlanId: workoutId // Make sure to pass it down to this screen
  })}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10 },
  exerciseTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  noExercisesText: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
});
