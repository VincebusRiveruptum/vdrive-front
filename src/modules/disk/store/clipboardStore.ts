import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useClipboardStore = defineStore('clipboard', () => {
  const isCopied = ref(false)
  const itemType = ref<'file'|'folder'|null>(null)
  const itemId = ref<number|null>(null)
  const itemName = ref<string>('')

  function setCopiedItem(id: number, type: 'file'|'folder', name: string) {
    isCopied.value = true
    itemType.value = type
    itemId.value = id
    itemName.value = name
  }

  function clear() {
    isCopied.value = false
    itemType.value = null
    itemId.value = null
    itemName.value = ''
  }

  return { isCopied, itemType, itemId, itemName, setCopiedItem, clear }
})
