<script setup lang="ts">
import { useLogin } from "@/modules/auth/composables/useLogin";

const { isPending, form, onLogin } = useLogin();
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden"
  >
    <!-- Retro Background Accent -->
    <div
      class="absolute inset-0 z-0 opacity-20 pointer-events-none"
      style="
        background-image: radial-gradient(
          circle at 1px 1px,
          gray 1px,
          transparent 0
        );
        background-size: 20px 20px;
      "
    ></div>

    <div
      class="z-10 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-750"
    >
      <!-- Brand Logo -->
      <div class="flex flex-col items-center justify-center mb-8 space-y-3">
        <img
          src="/img/floppy.png"
          alt="VDRIVE Floppy"
          class="w-20 object-contain drop-shadow-md transition-transform hover:scale-110"
        />
        <h2
          class="text-4xl font-datatype tracking-wider text-gray-800 dark:text-gray-200"
        >
          VDRIVE
        </h2>
      </div>

      <form @submit.prevent="onLogin" class="space-y-6">
        <div>
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="vincebus@example.com"
          />
        </div>
        <div>
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1"
            >Contraseña</label
          >
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>

        <div
          v-if="form.errorMsg"
          class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 mt-4 rounded text-red-700 dark:text-red-400 text-sm font-medium"
        >
          {{ form.errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="!!isPending"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <svg
            v-if="isPending"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isPending ? "Autenticando..." : "Entrar" }}
        </button>
      </form>
    </div>
  </div>
</template>
