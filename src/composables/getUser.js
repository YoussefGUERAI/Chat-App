import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase/config";

const userData = ref(null);
const error = ref(null);

async function getUser(userID) {
  onMounted(() => {
    db.collection("users")
      .doc(userID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          userData.value = doc.data();
        } else {
          throw new Error("User not found");
        }
      })
      .catch((err) => {
        error.value = err.message;
        console.error("Error fetching user:", err);
      });
  });

  return { userData, error };
}

async function getCurrentUser() {
  onMounted(() => {
    if (!auth.currentUser) {
      error.value = "No authenticated user";
      console.error("No authenticated user");
      return;
    }

    db.collection("users")
      .doc(auth.currentUser.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          userData.value = doc.data();
        } else {
          throw new Error("Current user not found");
        }
      })
      .catch((err) => {
        error.value = err.message;
        console.error("Error fetching current user:", err);
      });
  });

  return { userData, error };
}

export { getUser, getCurrentUser };