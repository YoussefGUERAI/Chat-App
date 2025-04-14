<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card mt-5">
                    <div class="card-body">
                        <h1 class="card-title text-center">Login</h1>
                        <form>
                            <div class="mb-3">
                                <label for="email" class="form-label"
                                    >Email</label
                                >
                                <input
                                    type="email"
                                    class="form-control"
                                    placeholder="Email"
                                    v-model="email"
                                />
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label"
                                    >Password</label
                                >
                                <input
                                    type="password"
                                    class="form-control"
                                    placeholder="Password"
                                    v-model="password"
                                />
                            </div>
                            <button
                                class="btn btn-primary"
                                @click.prevent="login"
                            >
                                Login
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../firebase/config";

const email = ref("");
const password = ref("");
const router = useRouter();

const login = async () => {
    try {
        const res = await auth.signInWithEmailAndPassword(
            email.value,
            password.value
        );
        console.log(res);
        router.push("/home");
    } catch (err) {
        console.log(err.message);
    }
};
</script>
