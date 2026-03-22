<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../store/authStore'
import { useMutation } from '@tanstack/vue-query'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMsg = ref('')

const authStore = useAuthStore()
const router = useRouter()

const loginMutation = useMutation({
  mutationFn: async () => {
    const res = await axios.post('http://localhost:8001/api/login', {
      email: email.value,
      password: password.value
    })
    return res.data
  },
  onSuccess: (data) => {
    authStore.setToken(data.token)
    authStore.setUser(data.user)
    router.push('/dashboard')
  },
  onError: (err: any) => {
    errorMsg.value = err.response?.data?.message || 'Login failed'
  }
})

const onLogin = () => {
    loginMutation.mutate()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm">
      <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">VDrive</h2>
      <form @submit.prevent="onLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            class="w-full px-3 py-2 border rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            class="w-full px-3 py-2 border rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
          />
        </div>
        <div v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</div>
        <button 
          type="submit" 
          :disabled="!!loginMutation.isPending.value"
          class="w-full bg-blue-600 text-white font-bold py-2 rounded shadow-md hover:bg-blue-700"
        >
          {{ loginMutation.isPending.value ? 'Signing in...' : 'Log in' }}
        </button>
      </form>
    </div>
  </div>
</template>
