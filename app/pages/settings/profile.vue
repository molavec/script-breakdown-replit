<script setup lang="ts">
const { user } = useAuth()

const avatarInitial = computed(() => user.value?.name.charAt(0).toUpperCase() || 'R')
</script>

<template>
  <div class="p-8 md:p-10 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-50 mb-2">Profile Settings</h1>
      <p class="text-gray-400 text-sm font-mono tracking-tight">Your identity is securely provided by your Replit account.</p>
    </div>

    <div class="card bg-[#2a2b31] border border-white/5 shadow-xl">
      <div class="card-body p-6">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div class="avatar placeholder shrink-0">
            <div class="w-20 rounded-xl bg-gray-800 shadow-inner">
              <img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="`${user.name}'s Replit avatar`" class="object-cover" />
              <span v-else class="text-2xl text-gray-300">{{ avatarInitial }}</span>
            </div>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-100">Replit-managed identity</h2>
            <p class="mt-1 text-sm leading-6 text-gray-400">Your name, email address, and profile photo are synced from Replit and cannot be changed here.</p>
            <a href="https://replit.com/account" target="_blank" rel="noopener noreferrer" class="btn btn-sm mt-4 border-white/10 bg-[#383941] text-gray-200 hover:bg-[#464750]">Manage your Replit account</a>
          </div>
        </div>

        <div class="divider my-2 border-white/10"></div>

        <dl class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <dt class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Full name</dt>
            <dd data-testid="user-name-display" class="mt-2 rounded-md border border-black/50 bg-[#141414] px-4 py-3 text-sm text-gray-200">{{ user?.name }}</dd>
          </div>
          <div>
            <dt class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Email address</dt>
            <dd data-testid="user-email-display" class="mt-2 rounded-md border border-black/50 bg-[#141414] px-4 py-3 text-sm text-gray-200">{{ user?.email || 'No email shared by Replit' }}</dd>
          </div>
          <div v-if="user?.username">
            <dt class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Replit username</dt>
            <dd class="mt-2 rounded-md border border-black/50 bg-[#141414] px-4 py-3 text-sm text-gray-200">{{ user.username }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>