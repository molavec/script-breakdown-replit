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
  <section id="workflow" class="py-20 sm:py-28 relative z-10 border-t border-base-300/40 bg-base-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-mono uppercase tracking-widest text-primary font-semibold">Cinematic Workflow</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-base-content mt-2 tracking-tight">
          How Script Breakdown Powers Your Production
        </p>
        <p class="text-base-content/70 mt-3 text-sm sm:text-base">
          From screenwriting handoff to call sheet preparation in three frictionless phases.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div 
          v-for="(item, idx) in steps" 
          :key="item.step"
          class="card relative p-8 bg-base-200 border border-base-300 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
        >
          <!-- Step Number Watermark -->
          <div class="flex items-center justify-between mb-8">
            <span class="text-4xl font-black font-mono text-base-content/10 group-hover:text-primary/30 transition-colors">
              {{ item.step }}
            </span>
            <span class="badge badge-sm badge-outline border-base-300 text-base-content/80 font-mono text-[10px]">
              {{ item.highlight }}
            </span>
          </div>

          <div>
            <h3 class="text-xl font-bold text-base-content tracking-tight group-hover:text-primary transition-colors">
              {{ item.title }}
            </h3>
            <p class="text-base-content/70 text-sm mt-3 leading-relaxed">
              {{ item.description }}
            </p>
          </div>

          <div class="mt-8 pt-4 border-t border-base-300 flex items-center gap-2 text-xs font-mono text-base-content/60">
            <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>PHASE {{ idx + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
