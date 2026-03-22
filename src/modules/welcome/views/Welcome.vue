<script setup lang="ts">

import GuestLayout from '@/shared/layouts/GuestLayout.vue';
import logo from "@/assets/img/floppy.png"

</script>

<template>
    <GuestLayout>
        <div class="flex flex-row items-center justify-center h-full w-full">
            <div class="flex flex-col gap-4 sm:flex-row justify-evenly items-center w-full">
                <img :src=logo class="w-80">
                <nav class="flex flex-row gap-4 items-center justify-center">
                    <RouterLink>Dashboard</RouterLink>
                    <RouterLink>Sign Up</RouterLink>
                    <RouterLink>Register</RouterLink>
                </nav>
            </div>
        </div>
        <div class="flex flex-row justify-center items-center">
            Vincebus Riveruptum, {{ new Date().getFullYear() }}
        </div>
    </GuestLayout>
</template>