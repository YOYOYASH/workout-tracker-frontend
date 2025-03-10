import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet,TouchableOpacity } from "react-native";
import { workoutService } from "../api/apiService";

export default function WorkoutDetailsScreen({ route, navigation }) {
  const { workoutId } = route.params; // Get workout ID from navigation params
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutDetails();
  }, []);

  const fetchWorkoutDetails = async () => {
    try {
      const response = await workoutService.getWorkoutPlanById(workoutId);
      setWorkout(response.data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load workout details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout details not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.description}>{workout.description}</Text>

      {workout.weeks === null || workout.schedule.length === 0 ? (
        <Text style={styles.errorText}>No schedule available for this workout.</Text>
      ) : (
        <FlatList
          data={workout.schedule}
          keyExtractor={(item, index) => `week-${index}`}
          renderItem={({ item: week }) => (
            <View style={styles.weekContainer}>
              <Text style={styles.weekTitle}>Week {week.week_number}</Text>

              {week.days.length === 0 ? (
                <Text style={styles.noDaysText}>No days scheduled</Text>
              ) : (
                week.days.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={styles.dayButton}
                    onPress={() => navigation.navigate("ExercisesList", { dayId: day.id })}
                  >
                    <Text style={styles.dayText}>{day.day_of_week}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  description: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 20 },
  weekContainer: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginBottom: 10 },
  weekTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  dayText: { fontSize: 16, marginLeft: 10 },
  noDaysText: { fontSize: 14, color: "gray", fontStyle: "italic", marginLeft: 10 },
});
