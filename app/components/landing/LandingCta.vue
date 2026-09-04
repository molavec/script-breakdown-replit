<script setup lang="ts">
// Landing CTA Component
</script>

<template>
  <section class="py-20 sm:py-28 relative z-10 border-t border-white/5 bg-gradient-to-b from-[#0b0b0e] to-[#14141a] overflow-hidden">
    <!-- Glowing background orb -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[600px] h-[300px] bg-rose-600/15 blur-[120px] rounded-full"></div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono mb-6">
        <span>PRE-PRODUCTION REDEFINED</span>
      </div>

      <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
        Plan Your Next Shoot in Record Time
      </h2>

      <p class="mt-6 text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
        Stop wrestling with messy index cards and static spreadsheets. Organize scenes, plan shots, and direct with clarity today.
      </p>

      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/signup"
          class="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#ff0033] hover:bg-[#e6002e] text-white text-base font-bold shadow-2xl shadow-rose-950/60 active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Start Free with Replit</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:translate-x-1 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>

        <NuxtLink
          to="/login"
          class="w-full sm:w-auto px-7 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-base font-medium transition-all flex items-center justify-center gap-2"
        >
          <span>Already have an account? Sign In</span>
        </NuxtLink>
      </div>

      <p class="mt-6 text-xs text-neutral-500">
        No credit card required. Secure authentication managed via Replit.
      </p>
    </div>
  </section>
</template>
