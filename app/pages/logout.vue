<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { logout } = useAuth()

onMounted(() => {
  void logout()
})
</script>

<template>
  <div class="card bg-base-200/95 backdrop-blur-xl border border-base-300 shadow-2xl">
    <div class="card-body items-center p-12 text-center">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="mt-4 text-xs font-bold text-base-content/80 tracking-widest uppercase">Signing out securely…</p>
      <p class="text-xs text-base-content/50">Your Replit session is being cleared.</p>
    </div>
  </div>
</template>