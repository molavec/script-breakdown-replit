<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { error, pending, signIn } = useAuth()
const authError = computed(() => route.query.error === 'authentication_failed'
  ? 'Replit sign-in could not be completed. Please try again.'
  : error.value)

function handleSignIn() {
  signIn(route.query.returnTo)
}
</script>

<template>
  <div class="card bg-[#1e1e1e]/95 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl shadow-black/50">
    <div class="card-body p-8">
      <div class="flex items-center justify-center gap-2.5 mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-[#ff0033]">
          <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
          <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0-3-3h-15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
        </svg>
        <h1 class="text-xl font-bold text-gray-50 tracking-wide">Script Breakdown</h1>
      </div>

      <p class="text-center text-sm leading-6 text-gray-400">Continue securely with your Replit account to access your projects.</p>

      <div v-if="authError" role="alert" class="alert alert-error alert-soft mt-6 text-sm">
        <span>{{ authError }}</span>
      </div>

      <button data-testid="login-button" type="button" class="btn btn-block mt-8 border-0 bg-[#ff0033] text-white hover:bg-[#e6002e] shadow-lg shadow-red-500/20" :disabled="pending" @click="handleSignIn">
        <span v-if="pending" class="loading loading-spinner loading-sm"></span>
        <span>{{ pending ? 'Checking session…' : 'Continue with Replit' }}</span>
        <svg v-if="!pending" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>

      <p class="mt-6 text-center text-xs leading-5 text-gray-500">Replit manages account creation, sign-in, and account security.</p>
      <div class="mt-5 text-center text-sm text-gray-400">
        New here?
        <NuxtLink to="/signup" class="link text-rose-300 hover:text-rose-200 font-medium">Learn about signing up</NuxtLink>
      </div>
    </div>
  </div>
</template>
