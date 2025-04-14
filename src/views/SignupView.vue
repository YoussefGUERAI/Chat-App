<template>
    <div class="container">
        <h1 class="mb-4">Signup</h1>
        <div class="form-group center mt-3">
            <label for="email">Email</label>
            <input
                v-model="email"
                type="email"
                class="form-control"
                placeholder="Email"
            />
        </div>
        <div class="form-group center mt-4">
            <label for="password">Password</label>
            <input
                v-model="password"
                type="password"
                class="form-control"
                placeholder="Password"
            />
        </div>

        <div class="form-group center mt-4">
            <label for="password">Confirm Password</label>
            <input
                v-model="confirmPassword"
                type="password"
                class="form-control"
                placeholder="Confirm Password"
            />
        </div>

        <div class="form-group center mt-4">
            <label for="password">Username</label>
            <input
                v-model="username"
                type="text"
                class="form-control"
                placeholder="Username"
            />
        </div>

        <div class="form-group center mt-4">
            <label for="password">Bio</label>
            <input
                v-model="bio"
                type="text"
                class="form-control"
                placeholder="Bio"
            />
        </div>

        <button @click="signup" class="btn btn-primary mt-3">Signup</button>
        <div class="mt-3">Already have an account?</div>
        <router-link to="/">
            <button class="btn btn-secondary mt-3">Login</button>
        </router-link>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { db, auth } from "../firebase/config";
const email = ref("");
const password = ref("");
const username = ref("");
const bio = ref("");
const confirmPassword = ref("");
const router = useRouter();

const signup = async () => {
    try {
        if (password.value !== confirmPassword.value) {
            alert("Passwords do not match.");
            return;
        }
        const res = await auth.createUserWithEmailAndPassword(
            email.value,
            password.value
        );
        await addUser();
        await res.user.updateProfile({
            displayName: username.value,
        });
        console.log(res);
        router.push("/home");
    } catch (err) {
        console.log(err.message);
    }
};
// add data to database

const addUser = async () => {
    const user = auth.currentUser;
    const uid = user.uid;
    const userData = {
        username: username.value,
        bio: bio.value,
        email: email.value,
        role: "user",
        status: true,
        pfp: "@/assets/pfp_default.jpg",
        lastOnline: new Date(),
    };
    const docRef = await db.collection("users").doc(uid).set(userData);
    console.log("User added to database:", docRef);
};
</script>

<style lang="scss" scoped></style>
