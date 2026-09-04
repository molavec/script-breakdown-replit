<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { user } = useAuth()

useSeoMeta({
  title: computed(() => user.value ? 'My Projects — Script Breakdown' : 'Script Breakdown — AI-Powered Film Pre-Production & Shot Lists'),
  description: 'Deconstruct screenplays into structured scenes, shot lists, camera setups, and production elements with Gemini AI.',
})
</script>

<template>
  <NuxtLayout v-if="user" name="default">
    <ProjectDashboard />
  </NuxtLayout>
  <NuxtLayout v-else name="landing">
    <LandingView />
  </NuxtLayout>
</template>
