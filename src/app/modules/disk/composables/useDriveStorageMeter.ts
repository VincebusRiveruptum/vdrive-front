import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../auth/store/authStore'

export const useDriveStorageMeter = (currentFolderId: Ref<number | null>) => {
    const auth = useAuthStore()
    const api = axios.create({
        baseURL: 'http://localhost:8001/api',
        headers: { Authorization: `Bearer ${auth.token}` }
    })

    const { data, isLoading } = useQuery({
        queryKey: ['disk', currentFolderId],
        queryFn: async () => {
            const res = await api.get('/disk', { params: { folder: currentFolderId.value } })
            return res.data
        }
    })

    const storageUsed = computed(() => data.value?.storage?.used || 0)
    const storageLimit = computed(() => data.value?.storage?.limit || 1)
    const storagePercentage = computed(() => Math.min((storageUsed.value / storageLimit.value) * 100, 100))

    return {
        data,
        isLoading,
        storageUsed,
        storageLimit,
        storagePercentage
    }
}