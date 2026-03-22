<script setup lang="ts">
import { useAuthStore } from '../../auth/store/authStore'
const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center pt-20">
    <h1 class="text-3xl font-bold mb-4">Welcome to VDrive</h1>
    <p>You are logged in successfully.</p>
    <button @click="auth.logout()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded">Logout</button>
  </div>
</template>
