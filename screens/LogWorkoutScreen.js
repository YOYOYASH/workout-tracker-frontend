import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from "react-native";
import { workoutService, workoutLogService } from "../api/apiService";

export default function LogWorkoutScreen({ route, navigation }) {
  const { dayId, workoutPlanId } = route.params;
  const [exercises, setExercises] = useState([]);
  const [logInputs, setLogInputs] = useState({});
  const [duration, setDuration] = useState(""); // ✅ Required
  const [notes, setNotes] = useState(""); // ✅ Optional

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await workoutService.getExercisesForDay(dayId);
      setExercises(response.data);

      const initialInputs = {};
      response.data.forEach((ex) => {
        initialInputs[ex.id] = { sets: "", reps: "", weight: "" };
      });
      setLogInputs(initialInputs);
    } catch (error) {
      Alert.alert("Error", "Failed to load exercises");
    }
  };

  const handleInputChange = (id, field, value) => {
    setLogInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!duration) {
      Alert.alert("Missing info", "Please enter the duration.");
      return;
    }

    try {
      // ✅ Step 1: Create workout log with optional note
      const logResponse = await workoutLogService.createWorkoutLog({
        workout_plan_id: workoutPlanId,
        duration: parseInt(duration),
        notes: notes,
      });

      const logId = logResponse.data.id;

      // ✅ Step 2: Add all exercises
      for (let ex of exercises) {
        const input = logInputs[ex.id];
        await workoutLogService.addExerciseToLog(logId, {
          exercise_id: ex.exercise_id,
          sets_completed: parseInt(input.sets),
          reps_completed: parseInt(input.reps),
          weight_used: input.weight ? parseFloat(input.weight) : null,
        });
      }

      Alert.alert("Success", "Workout logged successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to log workout");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Your Workout</Text>

      <TextInput
        placeholder="Duration in minutes"
        style={styles.input}
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      <TextInput
        placeholder="Any notes? (optional)"
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
      />

      <FlatList
        data={exercises}
        keyExtractor={(item) => `log-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.exercise}>{`Exercise ID: ${item.exercise_id}`}</Text>
            <TextInput
              placeholder="Sets completed"
              style={styles.input}
              keyboardType="numeric"
              value={logInputs[item.id]?.sets}
              onChangeText={(val) => handleInputChange(item.id, "sets", val)}
            />
            <TextInput
              placeholder="Reps completed"
              style={styles.input}
              keyboardType="numeric"
              value={logInputs[item.id]?.reps}
              onChangeText={(val) => handleInputChange(item.id, "reps", val)}
            />
            <TextInput
              placeholder="Weight used (optional)"
              style={styles.input}
              keyboardType="numeric"
              value={logInputs[item.id]?.weight}
              onChangeText={(val) => handleInputChange(item.id, "weight", val)}
            />
          </View>
        )}
      />

      <Button title="Submit Log" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, marginBottom: 10 },
  card: { padding: 15, backgroundColor: "#fff", marginBottom: 10, borderRadius: 8 },
  exercise: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
});
