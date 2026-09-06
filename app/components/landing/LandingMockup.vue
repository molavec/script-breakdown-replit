<script setup lang="ts">
const sampleShots = [
  {
    shotNumber: '1A',
    framing: 'Extreme Wide (EWS)',
    angle: 'High Angle',
    movement: 'Slow Push-in Drone',
    action: 'Elena stands on rain-soaked skyscraper ledge overlooking neon metropolis.',
    elements: ['Rain FX', 'Neon Billboards', 'Cyberdeck'],
    prompt: 'Cinematic wide angle, rain droplets, neon reflections, blade runner aesthetic, anamorphic lens flare',
  },
  {
    shotNumber: '1B',
    framing: 'Medium Close Up (MCU)',
    angle: 'Low Angle',
    movement: 'Steadicam Orbit',
    action: 'Elena pulls down her tactical goggles as holographic HUD reflects across her visor.',
    elements: ['Elena (Lead)', 'Tactical Goggles', 'Holo-HUD VFX'],
    prompt: 'Extreme detailed portrait, glowing ocular lens, dark cyberpunk atmosphere, shallow depth of field',
  },
  {
    shotNumber: '2A',
    framing: 'Over The Shoulder (OTS)',
    angle: 'Eye Level',
    movement: 'Handheld Whip-Pan',
    action: 'A silhouette emerges from the elevator shaft holding a sparking EMP baton.',
    elements: ['Operative Hunter', 'EMP Baton', 'Sparks SFX'],
    prompt: 'Ominous silhouette, electrical discharge sparks, heavy volumetric fog, dramatic rim lighting',
  }
]
</script>

<template>
  <section id="preview" class="py-16 sm:py-24 relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <h2 class="text-xs font-mono uppercase tracking-widest text-primary font-semibold">Interactive Interface Preview</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-base-content mt-2 tracking-tight">
          A Purpose-Built Workspace for Film Production
        </p>
        <p class="text-base-content/70 mt-3 text-sm sm:text-base">
          No cluttered spreadsheets or clunky software. See your shots, scenes, and visual prompts aligned in one unified dashboard.
        </p>
      </div>

      <!-- Browser Mockup -->
      <div class="mockup-browser border border-base-300 bg-base-200 shadow-2xl shadow-black/80 rounded-2xl overflow-hidden">
        <div class="mockup-browser-toolbar bg-base-300 border-b border-base-300 px-4 py-2.5 flex items-center gap-3">
          <div class="input input-sm border border-base-300 bg-base-100 text-base-content/80 font-mono text-xs w-full max-w-md rounded-md flex items-center">
            https://scriptbreakdown.app/projects/neon-protocol/scenes/1
          </div>
          <div class="ml-auto flex items-center gap-2">
            <span class="badge badge-sm badge-primary text-primary-content font-medium text-[11px]">SCENE 1 of 42</span>
            <span class="badge badge-sm badge-neutral text-base-content/80 font-mono text-[11px]">EXT. ROOFTOP - NIGHT</span>
          </div>
        </div>

        <!-- Inner Content -->
        <div class="p-4 sm:p-6 lg:p-8 bg-base-100 space-y-6">
          <!-- Mock Project Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300">
            <div>
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-bold text-base-content tracking-tight">Neon Protocol</h3>
                <span class="badge badge-sm badge-primary badge-outline">In Production</span>
              </div>
              <p class="text-xs text-base-content/60 mt-1">Feature Film • Sci-Fi Noir • Estimated: 114 pages / 380 shots</p>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" class="btn btn-xs sm:btn-sm btn-neutral border-base-300 text-base-content/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Add Column
              </button>
              <button type="button" class="btn btn-xs sm:btn-sm btn-primary shadow-md shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Gemini Breakdown
              </button>
            </div>
          </div>

          <!-- Table Container -->
          <div class="overflow-x-auto rounded-xl border border-base-300 bg-base-200">
            <table class="table table-sm w-full text-xs text-left">
              <thead class="bg-base-300/60 text-base-content/70 font-mono uppercase tracking-wider text-[11px] border-b border-base-300">
                <tr>
                  <th class="py-3 px-4 w-16">Shot</th>
                  <th class="py-3 px-4 w-44">Camera & Framing</th>
                  <th class="py-3 px-4">Action / Script Cues</th>
                  <th class="py-3 px-4 w-52">Production Elements</th>
                  <th class="py-3 px-4 w-60">AI Visual Prompt</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-base-300/40 text-base-content/80">
                <tr v-for="shot in sampleShots" :key="shot.shotNumber" class="hover:bg-base-300/30 transition-colors">
                  <!-- Shot Number -->
                  <td class="py-4 px-4 font-mono font-bold text-primary text-sm align-top">
                    {{ shot.shotNumber }}
                  </td>

                  <!-- Framing & Angle -->
                  <td class="py-4 px-4 space-y-1 align-top">
                    <div class="font-semibold text-base-content">{{ shot.framing }}</div>
                    <div class="text-[11px] text-base-content/60">{{ shot.angle }}</div>
                    <div class="text-[10px] text-secondary font-mono">{{ shot.movement }}</div>
                  </td>

                  <!-- Action -->
                  <td class="py-4 px-4 leading-relaxed align-top">
                    <p class="text-base-content/90 text-xs sm:text-sm font-sans">{{ shot.action }}</p>
                  </td>

                  <!-- Elements -->
                  <td class="py-4 px-4 space-y-1.5 align-top">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="el in shot.elements" 
                        :key="el" 
                        class="badge badge-xs badge-ghost border-base-300 text-base-content/80 font-sans"
                      >
                        {{ el }}
                      </span>
                    </div>
                  </td>

                  <!-- AI Visual Prompt -->
                  <td class="py-4 px-4 align-top">
                    <div class="p-2.5 rounded-md bg-base-300/30 border border-primary/20 text-[11px] text-base-content/80 font-mono leading-tight">
                      <div class="flex items-center gap-1 text-[10px] text-primary font-semibold uppercase mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3">
                          <path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clip-rule="evenodd" />
                        </svg>
                        Prompt
                      </div>
                      {{ shot.prompt }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Micro-Bar -->
          <div class="flex flex-wrap items-center justify-between text-xs text-base-content/60 pt-2 font-mono">
            <div>3 SHOTS PLANNED • 100% COVERAGE</div>
            <div class="flex items-center gap-4">
              <span>EST. SETUP: 45 MIN</span>
              <span class="text-success">READY FOR SHOOT DAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
