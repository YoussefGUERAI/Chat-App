import { ref } from "vue";
import { auth } from "@/firebase/config";
import { useRouter } from "vue-router";

// Create a single reactive state for Auth across the app
const user = ref(null);
const isAuthenticated = ref(false);
const isLoading = ref(true);
const error = ref(null);
let unsubscribe = null;

// Initialize authentication state outside of component lifecycle
if (!unsubscribe) {
    unsubscribe = auth.onAuthStateChanged(
        (firebaseUser) => {
            isLoading.value = false;
            if (firebaseUser) {
                user.value = firebaseUser;
                isAuthenticated.value = true;
            } else {
                user.value = null;
                isAuthenticated.value = false;
            }
        },
        (err) => {
            error.value = err.message;
            isLoading.value = false;
            console.error("Auth state error:", err);
        }
    );
}

export function useAuth() {
    const router = useRouter();

    // Redirect to login if not authenticated
    const requireAuth = (to) => {
        if (!isAuthenticated.value && !isLoading.value) {
            router.push({
                name: "login",
                query: { redirect: to.fullPath },
            });
            return false;
        }
        return true;
    };

    // Redirect to home if already authenticated
    const requireNoAuth = () => {
        if (isAuthenticated.value && !isLoading.value) {
            router.push({ name: "home" });
            return false;
        }
        return true;
    };

    // Logout function
    const logout = async () => {
        try {
            await auth.signOut();
            // After logout, redirect to login
            router.push({ name: "login" });
        } catch (err) {
            error.value = err.message;
            console.error("Logout error:", err);
        }
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        requireAuth,
        requireNoAuth,
        logout,
    };
}
