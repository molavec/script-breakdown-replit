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
  <div class="card bg-[#1e1e1e]/95 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl shadow-black/50">
    <div class="card-body items-center p-12 text-center">
      <span class="loading loading-spinner loading-lg text-rose-500"></span>
      <p class="mt-4 text-xs font-bold text-gray-300 tracking-widest uppercase">Signing out securely…</p>
      <p class="text-xs text-gray-500">Your Replit session is being cleared.</p>
    </div>
  </div>
</template>