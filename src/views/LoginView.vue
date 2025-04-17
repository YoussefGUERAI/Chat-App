<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <div class="card shadow-lg rounded-xl">
                    <div class="card-body p-4 p-md-5">
                        <h1 class="card-title text-center mb-4 fw-bold">
                            Login
                        </h1>

                        <!-- ALERTS -->
                        <div
                            v-if="alert.message"
                            class="alert d-flex align-items-center"
                            :class="alert.type"
                            role="alert"
                        >
                            <i
                                class="fas"
                                :class="
                                    alert.type === 'alert-success'
                                        ? 'fa-check-circle'
                                        : 'fa-exclamation-circle'
                                "
                            ></i>
                            <div class="ms-2">{{ alert.message }}</div>
                        </div>

                        <form @submit.prevent="login">
                            <div class="mb-4">
                                <label for="email" class="form-label"
                                    >Email</label
                                >
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i
                                            class="fas fa-envelope text-muted"
                                        ></i>
                                    </span>
                                    <input
                                        type="email"
                                        class="form-control"
                                        placeholder="Enter your email"
                                        v-model="email"
                                        :class="{ 'is-invalid': emailError }"
                                    />
                                    <div class="invalid-feedback">
                                        {{ emailError }}
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="password" class="form-label"
                                    >Password</label
                                >
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i class="fas fa-lock text-muted"></i>
                                    </span>
                                    <input
                                        type="password"
                                        class="form-control"
                                        placeholder="Enter your password"
                                        v-model="password"
                                        :class="{ 'is-invalid': passwordError }"
                                    />
                                    <div class="invalid-feedback">
                                        {{ passwordError }}
                                    </div>
                                </div>
                            </div>

                            <button
                                class="btn btn-primary w-100 py-2 rounded-md shadow-sm"
                                type="submit"
                                :disabled="isLoading"
                            >
                                <span
                                    v-if="isLoading"
                                    class="spinner-border spinner-border-sm me-2"
                                    role="status"
                                ></span>
                                {{ isLoading ? "Logging in..." : "Login" }}
                            </button>
                        </form>

                        <div class="mt-4 text-center">
                            <p class="mb-0">
                                New to this website?
                                <router-link to="/signup" class="fw-medium"
                                    >Create an account</router-link
                                >
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../firebase/config";

// Form data
const email = ref("");
const password = ref("");

// UI states
const isLoading = ref(false);
const emailError = ref("");
const passwordError = ref("");
const alert = ref({
    message: "",
    type: "", // 'alert-success' | 'alert-danger'
});

const router = useRouter();

// Utility: show a styled alert
const showAlert = (message, type = "alert-danger") => {
    alert.value = { message, type };
    setTimeout(() => {
        alert.value.message = "";
    }, 5000);
};

// Utility: translate Firebase errors to friendly messages
const translateError = (code) => {
    switch (code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-disabled":
            return "This account has been disabled.";
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
            return "Incorrect password. Please try again.";
        case "auth/too-many-requests":
            return "Too many login attempts. Try again later.";
        default:
            return "Login failed. Please check your credentials and try again.";
    }
};

const login = async () => {
    // Reset states
    emailError.value = "";
    passwordError.value = "";
    alert.value.message = "";

    // Validation
    if (!email.value) {
        emailError.value = "Email is required.";
    }
    if (!password.value) {
        passwordError.value = "Password is required.";
    }
    if (emailError.value || passwordError.value) return;

    isLoading.value = true;

    try {
        const res = await auth.signInWithEmailAndPassword(
            email.value,
            password.value
        );
        console.log("Login successful:", res.user);
        showAlert("Welcome back!", "alert-success");
        router.push("/home");
    } catch (err) {
        console.error("Firebase error:", err.message);
        const friendlyMessage = translateError(err.code);
        showAlert(friendlyMessage, "alert-danger");
        password.value = "";
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.card {
    border: none;
}

.alert {
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
}

.alert-success {
    background-color: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.alert-danger {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.form-label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--gray-700);
}

.form-control,
.input-group-text {
    height: 48px;
}

.input-group-text {
    width: 50px;
    display: flex;
    justify-content: center;
}

.input-group-text i {
    font-size: 1rem;
}
</style>
