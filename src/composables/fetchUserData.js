import { Firestore } from "firebase/firestore";

async function fetchUserData(userId) {
  try {
    const userDoc = await Firestore.collection("users").doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
export default fetchUserData;