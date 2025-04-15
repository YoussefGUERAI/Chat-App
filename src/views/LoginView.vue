<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card mt-5">
          <div class="card-body">
            <h1 class="card-title text-center">Login</h1>

            <!-- ALERTS -->
            <div v-if="alert.message" :class="['alert', alert.type]" role="alert">
              {{ alert.message }}
            </div>

            <form @submit.prevent="login">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="Email"
                  v-model="email"
                  :class="{ 'is-invalid': emailError }"
                />
                <div class="invalid-feedback">{{ emailError }}</div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="Password"
                  v-model="password"
                  :class="{ 'is-invalid': passwordError }"
                />
                <div class="invalid-feedback">{{ passwordError }}</div>
              </div>

              <button
                class="btn btn-primary w-100"
                type="submit"
                :disabled="isLoading"
              >
                {{ isLoading ? "Logging in..." : "Login" }}
              </button>
            </form>

            <div class="mt-3 text-center">
              New to this website?
              <router-link to="/signup">Signup</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'

// Form data
const email = ref('')
const password = ref('')

// UI states
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const alert = ref({
  message: '',
  type: '', // 'alert-success' | 'alert-danger'
})

const router = useRouter()

// Utility: show a styled alert
const showAlert = (message, type = 'alert-danger') => {
  alert.value = { message, type }
  setTimeout(() => {
    alert.value.message = ''
  }, 5000)
}

// Utility: translate Firebase errors to friendly messages
const translateError = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many login attempts. Try again later.'
    default:
      return 'Login failed. Please check your credentials and try again.'
  }
}

const login = async () => {
  // Reset states
  emailError.value = ''
  passwordError.value = ''
  alert.value.message = ''

  // Validation
  if (!email.value) {
    emailError.value = 'Email is required.'
  }
  if (!password.value) {
    passwordError.value = 'Password is required.'
  }
  if (emailError.value || passwordError.value) return

  isLoading.value = true

  try {
    const res = await auth.signInWithEmailAndPassword(
      email.value,
      password.value
    )
    console.log('Login successful:', res.user)
    showAlert('Welcome back!', 'alert-success')
    router.push('/home')
  } catch (err) {
    console.error('Firebase error:', err.message)
    const friendlyMessage = translateError(err.code)
    showAlert(friendlyMessage, 'alert-danger')
    password.value = ''
  } finally {
    isLoading.value = false
  }
}
</script>

