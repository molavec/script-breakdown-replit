<script setup lang="ts">
import { ref } from 'vue'

const passwords = ref({
  current: '********',
  new: '********',
  confirm: '********'
})
</script>

<template>
  <div class="p-8 md:p-10 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-50 mb-2">Security Settings</h1>
      <p class="text-gray-400 text-sm font-mono tracking-tight">Manage your password, two-factor authentication, and active sessions to keep your creative assets secure.</p>
    </div>

    <!-- Change Password Card -->
    <div class="bg-[#2a2b31] rounded-lg p-6 md:p-8 border border-white/5 shadow-xl">
      <div class="flex items-center gap-3 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
        </svg>
        <h2 class="text-xl font-medium text-gray-100">Change Password</h2>
      </div>
      
      <div class="h-[1px] w-full bg-white/5 mb-8"></div>
      
      <div class="flex flex-col gap-6 max-w-2xl">
        <div class="form-control">
          <label class="label px-0 pt-0 pb-2">
            <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Current Password</span>
          </label>
          <input type="password" v-model="passwords.current" class="input input-bordered w-full bg-[#141414] border-black/50 text-gray-200 focus:border-white/20 focus:outline-none rounded-md" />
        </div>
        
        <div class="form-control">
          <label class="label px-0 pt-0 pb-2">
            <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">New Password</span>
          </label>
          <input type="password" v-model="passwords.new" class="input input-bordered w-full bg-[#141414] border-black/50 text-gray-200 focus:border-white/20 focus:outline-none rounded-md" />
          <div class="text-[11px] font-mono tracking-tight text-gray-500 mt-2">
            Must be at least 12 characters long and contain a number or symbol.
          </div>
        </div>
        
        <div class="form-control">
          <label class="label px-0 pt-0 pb-2">
            <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Confirm New Password</span>
          </label>
          <input type="password" v-model="passwords.confirm" class="input input-bordered w-full bg-[#141414] border-black/50 text-gray-200 focus:border-white/20 focus:outline-none rounded-md" />
        </div>

        <div class="mt-2">
          <button class="bg-[#ff0033] hover:bg-[#e6002e] text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors shadow-lg shadow-red-500/20">
            Update Password
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
