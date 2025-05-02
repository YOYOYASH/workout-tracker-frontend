import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "./context/authcontext";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import WorkoutDetailsScreen from "./screens/WorkoutDetailsScreen"; 
import ExercisesListScreen from "./screens/ExercisesListScreen";
import LogWorkoutScreen  from "./screens/LogWorkoutScreen";
import WorkoutHistoryScreen from "./screens/WorkoutHistoryScreen";



const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
            <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
            <Stack.Screen name="ExercisesList" component={ExercisesListScreen} />
            <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} />
            <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
            </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
