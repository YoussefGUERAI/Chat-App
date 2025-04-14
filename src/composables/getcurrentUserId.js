import { getAuth } from "firebase/auth";

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const uid = user.uid;
  console.log("User ID:", uid);
} else {
  console.log("No user is logged in.");
}

export default async function getCurrentUserId() {
  const user = auth.currentUser;
  if (user) {
    return user.uid;
  } else {
    console.log("No user is logged in.");
  }
}