<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import axios from 'axios'
import { useAuthStore } from '../../auth/store/authStore'
import { useClipboardStore } from '../store/clipboardStore'
import ContextMenu from '../components/ContextMenu.vue'

const auth = useAuthStore()
const clipboard = useClipboardStore()
const queryClient = useQueryClient()

const currentFolderId = ref<number | null>(null)

// Axios instance helper
const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: {
    Authorization: `Bearer ${auth.token}`
  }
})

// Query
const { data, isLoading } = useQuery({
  queryKey: ['disk', currentFolderId],
  queryFn: async () => {
    const res = await api.get('/disk', { params: { folder: currentFolderId.value } })
    return res.data
  }
})

// Context Menu State
const ctxMenu = ref({ show: false, x: 0, y: 0, isFolder: false, item: null as any })

const openContext = (e: MouseEvent, item: any, isFolder: boolean) => {
  ctxMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    isFolder,
    item
  }
}

const closeContext = () => {
  ctxMenu.value.show = false
}

onMounted(() => window.addEventListener('click', closeContext))
onUnmounted(() => window.removeEventListener('click', closeContext))

// Mutations
const deleteMutation = useMutation({
  mutationFn: async (payload: { id: number, isFolder: boolean }) => {
    const url = payload.isFolder ? `/disk/folder/${payload.id}` : `/disk/file/${payload.id}`
    await api.delete(url)
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disk'] })
})

const renameMutation = useMutation({
  mutationFn: async (payload: { id: number, isFolder: boolean, newName: string }) => {
    const url = payload.isFolder ? `/disk/folder/${payload.id}/rename` : `/disk/file/${payload.id}/rename`
    await api.put(url, { name: payload.newName })
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disk'] })
})

const pasteMutation = useMutation({
  mutationFn: async () => {
    if (!clipboard.isCopied) return
    await api.post('/disk/copy', {
      item_id: clipboard.itemId,
      type: clipboard.itemType,
      destination_folder_id: currentFolderId.value
    })
  },
  onSuccess: () => {
    clipboard.clear()
    queryClient.invalidateQueries({ queryKey: ['disk'] })
  }
})

// Actions handler
const onContextAction = (action: string) => {
  const { item, isFolder } = ctxMenu.value
  if (!item) return

  if (action === 'delete') {
    if(confirm('¿Seguro que deseas eliminar este elemento?')) {
      deleteMutation.mutate({ id: item.id, isFolder })
    }
  } else if (action === 'rename') {
    const newName = prompt('Nuevo nombre:', item.name)
    if (newName) {
      renameMutation.mutate({ id: item.id, isFolder, newName })
    }
  } else if (action === 'copy') {
    clipboard.setCopiedItem(item.id, isFolder ? 'folder' : 'file', item.name)
  } else if (action === 'details') {
    alert(`Detalles:\nNombre: ${item.name}\nModificado: ${item.updated}`)
  }
}

const enterFolder = (id: number | null) => {
  currentFolderId.value = id
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6" @contextmenu.prevent>
    <div class="max-w-6xl mx-auto">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">VDrive</h1>
        <div class="flex gap-4">
          <button v-if="clipboard.isCopied" @click="pasteMutation.mutate()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow">
            Pegar ({{ clipboard.itemName }})
          </button>
          <button @click="auth.logout()" class="text-sm font-semibold text-red-500 hover:text-red-700">Logout</button>
        </div>
      </div>

      <!-- Breadcrumbs -->
      <div class="flex gap-2 items-center text-sm mb-4">
        <button @click="enterFolder(null)" class="text-blue-600 hover:underline">Inicio</button>
        <template v-for="crumb in data?.breadcrumbs" :key="crumb.id">
          <span>/</span>
          <button @click="enterFolder(crumb.id)" class="text-blue-600 hover:underline">{{ crumb.name }}</button>
        </template>
      </div>

      <!-- Table List -->
      <div class="bg-white dark:bg-gray-800 shadow rounded overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
              <th class="p-4 font-semibold">Nombre</th>
              <th class="p-4 font-semibold text-right">Tamaño</th>
              <th class="p-4 font-semibold text-right">Modificado</th>
            </tr>
          </thead>
          <tbody v-if="isLoading">
            <tr><td colspan="3" class="p-4 text-center">Cargando...</td></tr>
          </tbody>
          <tbody v-else>
            <!-- Folders -->
            <tr 
              v-for="folder in data?.folders" 
              :key="'folder-'+folder.id"
              @contextmenu.prevent="openContext($event, folder, true)"
              @dblclick="enterFolder(folder.id)"
              class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer select-none"
            >
              <td class="p-4 flex items-center gap-3">
                <span class="text-yellow-500">📁</span>
                {{ folder.name }}
              </td>
              <td class="p-4 text-right text-sm text-gray-500">-</td>
              <td class="p-4 text-right text-sm text-gray-500">{{ folder.updated }}</td>
            </tr>
            <!-- Files -->
            <tr 
              v-for="file in data?.files" 
              :key="'file-'+file.id"
              @contextmenu.prevent="openContext($event, file, false)"
              class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer select-none"
            >
              <td class="p-4 flex items-center gap-3">
                <span class="text-blue-500">📄</span>
                {{ file.name }}
              </td>
              <td class="p-4 text-right text-sm text-gray-500">{{ file.size }}</td>
              <td class="p-4 text-right text-sm text-gray-500">{{ file.updated }}</td>
            </tr>
            <tr v-if="!data?.folders?.length && !data?.files?.length">
              <td colspan="3" class="p-8 text-center text-gray-500">Esta carpeta está vacía.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <ContextMenu 
      :x="ctxMenu.x" 
      :y="ctxMenu.y" 
      :show="ctxMenu.show"
      :isFolder="ctxMenu.isFolder"
      @close="closeContext"
      @action="onContextAction"
    />
  </div>
</template>
