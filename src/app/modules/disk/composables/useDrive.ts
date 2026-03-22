import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../auth/store/authStore'
import { useClipboardStore } from '../store/clipboardStore'

export const useDrive = (currentFolderId: Ref<number | null>, ctxMenu: Ref<any>) => {
    const queryClient = useQueryClient()
    const auth = useAuthStore()
    const clipboard = useClipboardStore()
    
    const api = axios.create({
        baseURL: 'http://localhost:8001/api',
        headers: { Authorization: `Bearer ${auth.token}` }
    })

    const formatSize = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

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
                destination_folder_id: currentFolderId.value || null
            })
        },
        onSuccess: () => {
            clipboard.clear()
            queryClient.invalidateQueries({ queryKey: ['disk'] })
        }
    })

    const createFolderMutation = useMutation({
        mutationFn: async (name: string) => {
            await api.post('/disk/folder', {
                name,
                parent_id: currentFolderId.value || null
            })
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disk'] })
    })

    const uploadFileMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)
            if (currentFolderId.value) {
                formData.append('folder_id', String(currentFolderId.value))
            }
            await api.post('/disk/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disk'] })
    })

    const onContextAction = async (action: string) => {
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
            const size = isFolder ? 'N/A' : formatSize(item.size || 0)
            alert(`Detalles:\nNombre: ${item.name}\nTamaño: ${size}\nModificado: ${item.updated}`)
        }
    }

    const enterFolder = (id: number | null) => {
        currentFolderId.value = id
    }

    const promptNewFolder = () => {
        const name = prompt('Nombre de la nueva carpeta:')
        if (name) createFolderMutation.mutate(name)
    }

    const onFileSelected = (e: Event) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
            uploadFileMutation.mutate(target.files[0])
            // clear input
            target.value = ''
        }
    }

    return {
        pasteMutation,
        createFolderMutation,
        uploadFileMutation,
        onContextAction,
        enterFolder,
        promptNewFolder,
        onFileSelected,
        formatSize
    }
}