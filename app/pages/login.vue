<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="bg-[#1e1e1e]/95 backdrop-blur-xl rounded-xl p-8 border border-white/5 shadow-2xl shadow-black/50">
    <!-- Header -->
    <div class="flex items-center justify-center gap-2.5 mb-8">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-[#ff0033]">
        <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
        <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
      </svg>
      <h1 class="text-xl font-bold text-gray-50 tracking-wide">Script Breakdown</h1>
    </div>

    <!-- Form -->
    <form @submit.prevent class="flex flex-col gap-5">
      <div class="form-control">
        <label class="label px-0 pt-0 pb-1.5">
          <span class="text-[11px] font-bold text-gray-300 tracking-wider">Email Address</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <input type="email" placeholder="director@scriptvisual.com" class="w-full bg-[#0a0a0a] border border-white/10 text-gray-200 text-sm rounded-md focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 pl-10 pr-4 py-3 placeholder:text-gray-600 transition-all" />
        </div>
      </div>

      <div class="form-control">
        <div class="flex items-center justify-between pb-1.5">
          <label class="label px-0 py-0">
            <span class="text-[11px] font-bold text-gray-300 tracking-wider">Password</span>
          </label>
          <a href="#" class="text-[11px] font-bold text-rose-300 hover:text-rose-200 transition-colors">Forgot password?</a>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <input type="password" placeholder="••••••••" class="w-full bg-[#0a0a0a] border border-white/10 text-gray-200 text-sm rounded-md focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 pl-10 pr-4 py-3 placeholder:text-gray-600 transition-all" />
        </div>
      </div>

      <button type="submit" class="mt-2 w-full bg-[#ff0033] hover:bg-[#e6002e] text-white py-3 rounded-md text-sm font-semibold transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
        Sign In
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </form>

    <div class="my-6 flex items-center justify-center gap-4">
      <div class="h-px bg-white/10 flex-1"></div>
      <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Or Continue With</span>
      <div class="h-px bg-white/10 flex-1"></div>
    </div>

    <button class="w-full bg-[#141414] hover:bg-[#1a1a1a] border border-white/10 text-gray-200 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-3">
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Google
    </button>

    <div class="mt-8 text-center text-sm text-gray-400">
      Don't have an account? 
      <NuxtLink to="/signup" class="text-rose-300 hover:text-rose-200 transition-colors font-medium">Sign up</NuxtLink>
    </div>
  </div>
</template>
