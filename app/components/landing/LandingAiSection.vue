<script setup lang="ts">
const aiCapabilities = [
  {
    title: 'Visual Concept Prompts',
    desc: 'Automatically compose cinematic photography prompts tailored for storyboard generators, including lighting, lens type, and color grading.',
  },
  {
    title: 'Camera & Lighting Suggestions',
    desc: 'Receive instant technical recommendations on camera framing, lenses (anamorphic, spherical), angles, and dynamic motion based on script tone.',
  },
  {
    title: 'Automated Elements Extraction',
    desc: 'Extract props, vehicles, wardrobe notes, SFX requirements, and cast members directly from your scene descriptions in seconds.',
  },
  {
    title: 'Pacing & Setup Optimization',
    desc: 'Analyze coverage to ensure balanced setups and efficient shooting days before stepping onto the physical set.',
  },
]
</script>

<template>
  <section id="ai" class="py-20 sm:py-28 relative z-10 border-t border-white/5 bg-[#0b0b0e] overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Left Side: Copy -->
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            GEMINI PRODUCTION COPILOT
          </div>

          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Creative Intelligence in Every Shot & Scene
          </h2>

          <p class="text-neutral-300 text-base sm:text-lg leading-relaxed">
            Script Breakdown is infused with Google's advanced Gemini models. Ask the AI assistant to brainstorm shot ideas, generate cinematic visual prompts, or deconstruct complex scenes without breaking your creative flow.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div 
              v-for="cap in aiCapabilities" 
              :key="cap.title" 
              class="p-4 rounded-xl bg-[#14141a] border border-white/5 space-y-1.5"
            >
              <div class="text-sm font-bold text-white flex items-center gap-2">
                <span class="text-rose-400">✦</span>
                {{ cap.title }}
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">{{ cap.desc }}</p>
            </div>
          </div>

          <div class="pt-2">
            <NuxtLink 
              to="/signup" 
              class="btn bg-[#ff0033] hover:bg-[#d6002b] text-white border-0 shadow-lg shadow-rose-950/40 text-sm font-semibold"
            >
              Try Gemini Breakdown Free
            </NuxtLink>
          </div>
        </div>

        <!-- Right Side: Visual Card -->
        <div class="relative">
          <div class="absolute -inset-1 bg-gradient-to-r from-rose-600/30 to-purple-600/30 rounded-3xl blur-2xl opacity-50"></div>
          
          <div class="relative p-6 sm:p-8 rounded-2xl bg-[#13131a] border border-white/10 shadow-2xl space-y-5 font-mono text-xs">
            <div class="flex items-center justify-between pb-3 border-b border-white/10 text-neutral-400">
              <span class="text-rose-400 font-bold flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                  <path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clip-rule="evenodd" />
                </svg>
                GEMINI COPILOT PROMPT
              </span>
              <span>OUTPUT PREVIEW</span>
            </div>

            <div class="p-3.5 rounded-lg bg-black/40 border border-white/5 text-neutral-300">
              <span class="text-neutral-500">// User instruction:</span>
              <p class="text-neutral-200 mt-1 font-sans text-xs">
                "Suggest 3 cinematic camera setups for a high-tension dialogue between two rival detectives in a dimly lit interrogation room."
              </p>
            </div>

            <div class="space-y-3 font-sans">
              <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div class="font-bold text-white text-xs flex items-center justify-between">
                  <span>Shot 1: 50mm Dutch Angle OTS</span>
                  <span class="badge badge-xs badge-neutral text-amber-300">Tension Spike</span>
                </div>
                <p class="text-neutral-400 text-xs mt-1">Single source overhead tungsten fixture creating harsh nose shadows and high-contrast silhouettes.</p>
              </div>

              <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div class="font-bold text-white text-xs flex items-center justify-between">
                  <span>Shot 2: Extreme Macro Close-Up (Eyes)</span>
                  <span class="badge badge-xs badge-neutral text-rose-300">Psychological</span>
                </div>
                <p class="text-neutral-400 text-xs mt-1">85mm T1.5 shallow depth of field catching the sweat droplet and micro-tremor in subject's eye.</p>
              </div>

              <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div class="font-bold text-white text-xs flex items-center justify-between">
                  <span>Shot 3: Slow 360° Track Dolly</span>
                  <span class="badge badge-xs badge-neutral text-blue-300">Resolution</span>
                </div>
                <p class="text-neutral-400 text-xs mt-1">Circumnavigating table as detective drops the classified dossier, shifting power dynamic.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
