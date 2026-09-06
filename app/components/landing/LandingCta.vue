<script setup lang="ts">
// Landing CTA Component
</script>

<template>
  <section class="py-20 sm:py-28 relative z-10 border-t border-base-300/40 bg-gradient-to-b from-base-100 to-base-200 overflow-hidden">
    <!-- Glowing background orb -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[600px] h-[300px] bg-primary/15 blur-[120px] rounded-full"></div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <div class="badge badge-primary badge-outline text-xs font-mono mb-6 py-3 px-4">
        <span>PRE-PRODUCTION REDEFINED</span>
      </div>

      <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black text-base-content tracking-tight leading-tight">
        Plan Your Next Shoot in Record Time
      </h2>

      <p class="mt-6 text-base sm:text-xl text-base-content/80 max-w-2xl mx-auto leading-relaxed">
        Stop wrestling with messy index cards and static spreadsheets. Organize scenes, plan shots, and direct with clarity today.
      </p>

      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/signup"
          class="btn btn-primary btn-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 group w-full sm:w-auto"
        >
          <span>Start Free with Replit</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:translate-x-1 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>

        <NuxtLink
          to="/login"
          class="btn btn-outline btn-lg border-base-300 text-base-content hover:bg-base-300 hover:border-base-300 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <span>Already have an account? Sign In</span>
        </NuxtLink>
      </div>

      <p class="mt-6 text-xs text-base-content/60">
        No credit card required. Secure authentication managed via Replit.
      </p>
    </div>
  </section>
</template>
