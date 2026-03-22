import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuth = () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<any>(null)
  const router = useRouter()

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  function setUser(newUser: any) {
    user.value = newUser
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    router.push({ name: 'login' })
  }

  return { token, user, setToken, setUser, logout }
}
