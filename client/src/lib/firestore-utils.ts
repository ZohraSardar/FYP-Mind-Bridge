// src/lib/firestore-utils.ts
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

// Function to save game data to Firestore
export const saveGameData = async (gameData: {
  Age: number;
  Email: string;
  Game: string;
  Level: string;
  Name: string;
  Score: number;
  TimeTaken: number;
}) => {
  try {
    // Add a new document to the "games" collection
    const docRef = await addDoc(collection(db, "games"), gameData);
    console.log("Game data saved with ID: ", docRef.id);
    return docRef.id; // Return the document ID (optional)
  } catch (error) {
    console.error("Error saving game data: ", error);
    throw error;
  }
};