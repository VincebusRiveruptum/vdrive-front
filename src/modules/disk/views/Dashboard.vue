<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from "../../auth/composables/useAuth";
import { useClipboardStore } from "../store/clipboardStore";
import ContextMenu from "../components/ContextMenu.vue";

import { useDirectoryActions } from "../composables/useDirectoryActions";
import { useDirectory } from "../composables/useDirectory";

import floppy from "@/assets/img/floppy.png"

const auth = useAuth();
const clipboard = useClipboardStore();

const currentFolderId = ref<number | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const ctxMenu = ref({
  show: false,
  x: 0,
  y: 0,
  isFolder: false,
  item: null as any,
});

const { data, isLoading, storageUsed, storageLimit, storagePercentage } =
  useDirectory(currentFolderId);

const {
  pasteMutation,
  createFolderMutation,
  uploadFileMutation,
  onContextAction,
  enterFolder,
  promptNewFolder,
  onFileSelected,
  formatSize,
} = useDirectoryActions(currentFolderId, ctxMenu);

const openContext = (e: MouseEvent, item: any, isFolder: boolean) => {
  ctxMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    isFolder,
    item,
  };
};

const closeContext = () => {
  if (ctxMenu.value.show) ctxMenu.value.show = false;
};

onMounted(() => document.addEventListener("click", closeContext));
onUnmounted(() => document.removeEventListener("click", closeContext));

const triggerFileUpload = () => {
  fileInput.value?.click();
};
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6"
    @contextmenu.prevent
  >
    <div class="max-w-6xl mx-auto">
      <!-- Top Bar / Storage Meter -->
      <div
        class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-750 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div class="flex items-center gap-4 w-full sm:w-1/2">
          <img
            :src="floppy"
            alt="VDRIVE Floppy"
            class="w-10 h-10 object-contain"
          />
          <div class="w-full">
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span>Almacenamiento: {{ formatSize(storageUsed) }}</span>
              <span class="text-gray-500"
                >{{ formatSize(storageLimit) }} max</span
              >
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                class="bg-blue-600 h-2.5 rounded-full"
                :style="{ width: storagePercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="auth.logout()"
            class="text-sm font-semibold text-red-500 hover:text-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex justify-between items-center mb-6">
        <!-- Breadcrumbs -->
        <div
          class="flex flex-wrap gap-2 items-center text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded shadow-sm border border-gray-100 dark:border-gray-750"
        >
          <button
            @click="enterFolder(null)"
            class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Inicio
          </button>
          <template v-for="crumb in data?.breadcrumbs" :key="crumb.id">
            <span class="text-gray-400">/</span>
            <button
              @click="enterFolder(crumb.id)"
              class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {{ crumb.name }}
            </button>
          </template>
        </div>

        <div class="flex gap-3">
          <button
            v-if="clipboard.isCopied"
            @click="pasteMutation.mutate()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors font-medium flex items-center gap-2"
          >
            <span>📋</span> Pegar ({{ clipboard.itemName }})
          </button>
          <button
            @click="promptNewFolder"
            :disabled="createFolderMutation.isPending.value"
            class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded shadow-sm font-medium transition-colors disabled:opacity-50"
          >
            Nueva Carpeta
          </button>
          <button
            @click="triggerFileUpload"
            :disabled="uploadFileMutation.isPending.value"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-medium transition-colors disabled:opacity-50"
          >
            {{
              uploadFileMutation.isPending.value
                ? "Subiendo..."
                : "Subir Archivo"
            }}
          </button>
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="onFileSelected"
          />
        </div>
      </div>

      <!-- Table List -->
      <div
        class="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-750"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm"
            >
              <th class="p-4 font-semibold uppercase tracking-wider">Nombre</th>
              <th class="p-4 font-semibold text-right uppercase tracking-wider">
                Tamaño
              </th>
              <th class="p-4 font-semibold text-right uppercase tracking-wider">
                Modificado
              </th>
            </tr>
          </thead>
          <tbody v-if="isLoading">
            <tr>
              <td colspan="3" class="p-8 text-center text-gray-500">
                Cargando disco...
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <!-- Folders -->
            <tr
              v-for="folder in data?.folders"
              :key="'folder-' + folder.id"
              @contextmenu.prevent="openContext($event, folder, true)"
              @click.right.prevent
              @dblclick="enterFolder(folder.id)"
              class="border-b border-gray-100 dark:border-gray-750 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer select-none group transition-colors"
            >
              <td class="p-4 flex items-center gap-3">
                <span
                  class="text-yellow-400 text-xl group-hover:scale-110 transition-transform"
                  >📁</span
                >
                <span class="font-medium">{{ folder.name }}</span>
              </td>
              <td class="p-4 text-right text-sm text-gray-400">-</td>
              <td class="p-4 text-right text-sm text-gray-500">
                {{ folder.updated }}
              </td>
            </tr>
            <!-- Files -->
            <tr
              v-for="file in data?.files"
              :key="'file-' + file.id"
              @contextmenu.prevent="openContext($event, file, false)"
              @click.right.prevent
              class="border-b border-gray-100 dark:border-gray-750 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer select-none group transition-colors"
            >
              <td class="p-4 flex items-center gap-3">
                <span
                  class="text-blue-400 text-xl group-hover:scale-110 transition-transform"
                  >📄</span
                >
                <span class="font-medium">{{ file.name }}</span>
              </td>
              <td
                class="p-4 text-right text-sm text-gray-500 dark:text-gray-400"
              >
                {{ formatSize(file.size) }}
              </td>
              <td class="p-4 text-right text-sm text-gray-500">
                {{ file.updated }}
              </td>
            </tr>
            <tr v-if="!data?.folders?.length && !data?.files?.length">
              <td colspan="3" class="p-12 text-center">
                <div
                  class="inline-flex flex-col items-center justify-center text-gray-400"
                >
                  <span class="text-4xl mb-2">📭</span>
                  <span>Esta carpeta está vacía.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Context Menu Component -->
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
