<script setup lang="ts">
const steps = [
  {
    step: '01',
    title: 'Create Project & Structure Scenes',
    description: 'Set up your project details (Feature, Short, TV Series, Genre) and organize scenes chronologically with sluglines, setting, and page counts.',
    highlight: 'Instant Project Setup',
  },
  {
    step: '02',
    title: 'Decompose Shots with Gemini AI',
    description: 'Use Gemini to suggest shot lists, framing styles, camera angles, and creative visual prompts for concept art or storyboards.',
    highlight: 'AI-Enhanced Vision',
  },
  {
    step: '03',
    title: 'Track Production Elements & Shoot',
    description: 'Manage every detail—cast, props, costumes, VFX, sound, and director notes. Keep your crew prepared and in sync on set.',
    highlight: 'Production Readiness',
  },
]
</script>

<template>
  <section id="workflow" class="py-20 sm:py-28 relative z-10 border-t border-white/5 bg-[#0a0a0d]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">Cinematic Workflow</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
          How Script Breakdown Powers Your Production
        </p>
        <p class="text-neutral-400 mt-3 text-sm sm:text-base">
          From screenwriting handoff to call sheet preparation in three frictionless phases.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div 
          v-for="(item, idx) in steps" 
          :key="item.step"
          class="relative p-8 rounded-2xl bg-[#121217] border border-white/5 hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between group"
        >
          <!-- Step Number Watermark -->
          <div class="flex items-center justify-between mb-8">
            <span class="text-4xl font-black font-mono text-white/10 group-hover:text-rose-500/30 transition-colors">
              {{ item.step }}
            </span>
            <span class="badge badge-sm badge-neutral border-white/10 text-neutral-300 font-mono text-[10px]">
              {{ item.highlight }}
            </span>
          </div>

          <div>
            <h3 class="text-xl font-bold text-white tracking-tight group-hover:text-rose-200 transition-colors">
              {{ item.title }}
            </h3>
            <p class="text-neutral-400 text-sm mt-3 leading-relaxed">
              {{ item.description }}
            </p>
          </div>

          <div class="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>PHASE {{ idx + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
