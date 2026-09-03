<template>
  <div class="p-8 md:p-10 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-50 mb-2">Security Settings</h1>
      <p class="text-gray-400 text-sm font-mono tracking-tight">Security for this account is managed by Replit.</p>
    </div>

    <div class="card bg-[#2a2b31] border border-white/5 shadow-xl">
      <div class="card-body p-6 md:p-8">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 15.75h6" />
          </svg>
          <h2 class="card-title text-xl font-medium text-gray-100">Replit account security</h2>
        </div>

        <div role="alert" class="alert alert-info alert-soft mt-6 text-sm leading-6">
          <span>Passwords, multi-factor authentication, active sessions, and account recovery are handled by Replit. This keeps your credentials outside Script Breakdown.</span>
        </div>

        <div class="card-actions mt-6">
          <a href="https://replit.com/account" target="_blank" rel="noopener noreferrer" class="btn border-white/10 bg-[#383941] text-gray-200 hover:bg-[#464750]">Open Replit account settings</a>
        </div>
      </div>
    </div>
  </div>
</template>