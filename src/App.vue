<template>
    <router-view />
</template>

<style>
#app {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #353535;
    background-color: white;
    min-height: 100vh;
}

body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background-color: white;
}

/* Global link styles */
a {
    color: #284B63;
    text-decoration: none;
    transition: color 0.2s ease;
}

a:hover {
    color: #3C6E71;
    text-decoration: none;
}

/* Global button styles */
.btn {
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

/* Card overrides */
.card {
    border: none;
    border-radius: 0.75rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease;
    background-color: #FFFFFF;
}

.card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Form control overrides */
.form-control {
    border-radius: 0.5rem;
    border: 1px solid #D9D9D9;
    padding: 0.625rem 0.875rem;
    background-color: #FFFFFF;
    color: #353535;
}

.form-control:focus {
    border-color: #3C6E71;
    box-shadow: 0 0 0 0.2rem rgba(60, 110, 113, 0.25);
}

/* Input group styling */
.input-group-text {
    background-color: #FFFFFF;
    border-color: #D9D9D9;
    color: #353535;
}

/* Button primary overrides */
.btn-primary {
    background-color: #284B63;
    border-color: #284B63;
    color: #FFFFFF;
}

.btn-primary:hover,
.btn-primary:focus {
    background-color: #3C6E71;
    border-color: #3C6E71;
}

/* Button secondary overrides */
.btn-secondary {
    background-color: #3C6E71;
    border-color: #3C6E71;
    color: #FFFFFF;
}

.btn-secondary:hover,
.btn-secondary:focus {
    background-color: #284B63;
    border-color: #284B63;
}
</style>


<script setup>
import { onMounted, onUnmounted } from "vue";
import { auth, db } from "@/firebase/config";
import { useRouter } from "vue-router";

const router = useRouter();
let unsubscribeUserListener = null;

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (unsubscribeUserListener) {
      unsubscribeUserListener();
      unsubscribeUserListener = null;
    }

    if (user) {
      const userRef = db.collection("users").doc(user.uid);

      unsubscribeUserListener = userRef.onSnapshot((doc) => {
        const data = doc.data();

        if (data?.role === "banned") {
          alert("You are banned from this site");
          auth.signOut();
          router.push({ name: "login" });
        }
      });
    }
  });
});

onUnmounted(() => {
  if (unsubscribeUserListener) {
    unsubscribeUserListener();
    unsubscribeUserListener = null;
  }
});
</script>