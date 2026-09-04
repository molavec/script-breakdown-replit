<script setup lang="ts">
const features = [
  {
    title: 'Intelligent Scene Breakdown',
    description: 'Deconstruct entire scripts into clean scene cards. Categorize by Interior/Exterior, Day/Night, location, and page count automatically.',
    icon: 'film',
    badge: 'Core Workflow',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    title: 'Technical Shot Lists',
    description: 'Map out camera framing (Wide, Medium, Close-Up), angles (High, Low, Dutch), and movements (Dolly, Steadicam, Handheld) with zero friction.',
    icon: 'camera',
    badge: 'Cinematography',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Gemini AI Assistant',
    description: 'Harness Google Gemini AI directly inside your breakdown table. Generate creative shot suggestions, scene breakdowns, and visual prompts.',
    icon: 'sparkles',
    badge: 'AI Engine',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Customizable Production Columns',
    description: 'Add, reorder, and customize breakdown columns for Cast, Wardrobe, Props, SFX, Stunts, Sound, and Visual Effects.',
    icon: 'columns',
    badge: 'Customizable',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'Real-Time Shoot Metrics',
    description: 'Keep track of total page counts, estimated setups, shot counts, and production readiness so your crew stays on schedule.',
    icon: 'bar-chart',
    badge: 'Analytics',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Isolated & Secure Storage',
    description: 'Your scripts, production stills, and storyboards are scoped strictly to your account with enterprise security standards.',
    icon: 'shield',
    badge: 'Security',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
]
</script>

<template>
  <section id="features" class="py-20 sm:py-28 relative z-10 border-t border-white/5 bg-[#0d0d10]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">Features Built for Film Crews</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
          Everything You Need Before Calling "Action"
        </p>
        <p class="text-neutral-400 mt-3 text-sm sm:text-base leading-relaxed">
          From first script draft to principal photography, Script Breakdown equips every department head with clear, structured technical breakdowns.
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div 
          v-for="feat in features" 
          :key="feat.title"
          class="p-6 sm:p-8 rounded-2xl bg-[#131318] border border-white/5 hover:border-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 group flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-5">
              <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#ff0033]/20 group-hover:text-[#ff0033] transition-all">
                <!-- Film Icon -->
                <svg v-if="feat.icon === 'film'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/><line x1="7" x2="7" y1="2" y2="22"/><line x1="17" x2="17" y1="2" y2="22"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="2" x2="7" y1="7" y2="7"/><line x1="2" x2="7" y1="17" y2="17"/><line x1="17" x2="22" y1="17" y2="17"/><line x1="17" x2="22" y1="7" y2="7"/>
                </svg>
                <!-- Camera Icon -->
                <svg v-else-if="feat.icon === 'camera'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m14.5 4 2.5 3h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4l2.5-3z"/><circle cx="12" cy="13" r="3"/>
                </svg>
                <!-- Sparkles Icon -->
                <svg v-else-if="feat.icon === 'sparkles'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                <!-- Columns Icon -->
                <svg v-else-if="feat.icon === 'columns'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
                </svg>
                <!-- Bar Chart Icon -->
                <svg v-else-if="feat.icon === 'bar-chart'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
                </svg>
                <!-- Shield Icon -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                </svg>
              </div>

              <span :class="['badge badge-sm border font-mono text-[11px]', feat.badgeColor]">
                {{ feat.badge }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-white tracking-tight group-hover:text-rose-200 transition-colors">
              {{ feat.title }}
            </h3>
            <p class="text-neutral-400 text-xs sm:text-sm mt-2 leading-relaxed">
              {{ feat.description }}
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs font-medium text-neutral-400 group-hover:text-rose-400 transition-colors">
            <span>Learn more</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
