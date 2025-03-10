import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { workoutService } from "../api/apiService";
import { AuthContext } from "../context/authcontext";

export default function HomeScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutsData();
  }, []);

  const fetchWorkoutsData = async () => {
    try {
      const response = await workoutService.getAllWorkoutPlans();
      setWorkouts(response.data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Plans</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("WorkoutDetails", { workoutId: item.id })}
            >
              <Text style={styles.workoutTitle}>{item.name}</Text>
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10 },
  workoutTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#FF5733",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
