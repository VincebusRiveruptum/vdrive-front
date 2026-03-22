<script setup lang="ts">

const props = defineProps<{
  x: number
  y: number
  show: boolean
  isFolder: boolean
}>()

const emit = defineEmits(['close', 'action'])

const handleAction = (actionName: string) => {
  emit('action', actionName)
  emit('close')
}
</script>

<template>
  <div 
    v-show="show" 
    class="fixed z-50 bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700 rounded py-1 min-w-[160px]"
    :style="{ top: y + 'px', left: x + 'px' }"
    @click.stop
  >
    <button @click="handleAction('details')" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Ver Detalles</button>
    <button @click="handleAction('rename')" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Renombrar</button>
    <button @click="handleAction('copy')" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">Copiar</button>
    <button @click="handleAction('delete')" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
  </div>
</template>
