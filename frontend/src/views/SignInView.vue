<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  try {
    await authStore.signIn({ email: email.value, password: password.value });
    router.push('/');
  } catch {
    // surfaced via authStore.error
  }
};
</script>

<template>
  <main class="min-h-screen flex items-center justify-center text-white px-4">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-6 text-center">Sign in</h1>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block mb-1 text-sm text-gray-300">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full text-white px-3 py-2 rounded bg-black border border-gray-700 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label for="password" class="block mb-1 text-sm text-gray-300">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full text-white px-3 py-2 rounded bg-black border border-gray-700 focus:border-primary focus:outline-none"
          />
        </div>

        <p v-if="authStore.error" role="alert" class="text-sm text-red-400">
          {{ authStore.error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="mt-2 bg-primary hover:opacity-90 disabled:opacity-50 text-white font-semibold py-2 rounded cursor-pointer transition-opacity duration-200"
        >
          {{ authStore.loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-gray-400 text-center">
        Don't have an account?
        <router-link to="/signup" class="text-primary hover:underline">Sign up</router-link>
      </p>
    </div>
  </main>
</template>
