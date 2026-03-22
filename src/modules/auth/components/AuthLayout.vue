<script setup lang="ts">
import floppy from "@/assets/img/floppy.png";
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen w-full bg-main-bg text-main-text">
    <div
      class="auth-card"
    >
      <div class="flex flex-col items-center justify-center">
        <img
          :src="floppy"
          alt="VDRIVE Floppy"
          class="w-20 object-contain drop-shadow-md transition-transform hover:scale-110"
        />
        <h2
          class="text-4xl font-datatype tracking-wider text-gray-800 dark:text-gray-200"
        ></h2>
      </div>
      <slot />
    </div>
  </div>
</template>
