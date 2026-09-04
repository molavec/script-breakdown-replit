<script setup lang="ts">
// Landing Hero Component
</script>

<template>
  <section class="relative pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-24 lg:pb-32 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <!-- Announcement Pill -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md hover:bg-rose-500/15 transition-all">
        <span class="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        <span>AI-Powered Pre-Production Suite</span>
        <span class="text-rose-400/60">•</span>
        <span class="text-neutral-300">Gemini 2.5 & 3.0 Integrated</span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
        From Script to Production in Minutes,
        <span class="bg-gradient-to-r from-rose-400 via-red-500 to-amber-300 bg-clip-text text-transparent block mt-2">
          Powered by Gemini AI
        </span>
      </h1>

      <!-- Subtitle Description -->
      <p class="mt-6 sm:mt-8 text-lg sm:text-xl text-neutral-300 max-w-3xl mx-auto font-normal leading-relaxed">
        Break down scenes, plan shots, manage cast & props, and generate visual storyboard prompts. The modern workspace built for directors, producers, ADs, and filmmakers who value speed and creative clarity.
      </p>

      <!-- Primary CTA Buttons -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/signup"
          class="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#ff0033] hover:bg-[#e6002e] text-white text-base font-semibold shadow-2xl shadow-rose-950/60 hover:shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
        >
          <span>Start Breaking Down Free</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:translate-x-1 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>

        <a
          href="#preview"
          class="w-full sm:w-auto px-7 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-base font-medium backdrop-blur-sm transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-neutral-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span>Explore Product Tour</span>
        </a>
      </div>

      <!-- Proof Badges -->
      <div class="mt-14 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
        <div class="p-3.5 rounded-lg bg-[#141418]/60 border border-white/5 backdrop-blur-sm">
          <div class="text-xs font-mono uppercase tracking-wider text-rose-400">Scene Breakdown</div>
          <div class="text-sm font-semibold text-white mt-1">Automated Detection</div>
          <div class="text-xs text-neutral-400 mt-0.5">INT/EXT, DAY/NIGHT & Pages</div>
        </div>

        <div class="p-3.5 rounded-lg bg-[#141418]/60 border border-white/5 backdrop-blur-sm">
          <div class="text-xs font-mono uppercase tracking-wider text-amber-400">Camera & Shots</div>
          <div class="text-sm font-semibold text-white mt-1">Granular Shot Lists</div>
          <div class="text-xs text-neutral-400 mt-0.5">Framing, Angles & Movements</div>
        </div>

        <div class="p-3.5 rounded-lg bg-[#141418]/60 border border-white/5 backdrop-blur-sm">
          <div class="text-xs font-mono uppercase tracking-wider text-emerald-400">Production AI</div>
          <div class="text-sm font-semibold text-white mt-1">Gemini Intelligence</div>
          <div class="text-xs text-neutral-400 mt-0.5">Visual prompts & technical advice</div>
        </div>

        <div class="p-3.5 rounded-lg bg-[#141418]/60 border border-white/5 backdrop-blur-sm">
          <div class="text-xs font-mono uppercase tracking-wider text-blue-400">Element Columns</div>
          <div class="text-sm font-semibold text-white mt-1">Fully Customizable</div>
          <div class="text-xs text-neutral-400 mt-0.5">Props, Wardrobe, VFX, Cast</div>
        </div>
      </div>
    </div>
  </section>
</template>
