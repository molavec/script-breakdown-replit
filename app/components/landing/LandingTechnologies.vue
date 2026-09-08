<script setup lang="ts">
interface Tech {
  name: string
  logo: string
  alt: string
}

const technologies: Tech[] = [
  {
    name: 'Nuxt',
    logo: '/landing/tech/nuxt.png',
    alt: 'Nuxt logo'
  },
  {
    name: 'Drizzle',
    logo: '/landing/tech/drizzle.png',
    alt: 'Drizzle ORM logo'
  },
  {
    name: 'Replit',
    logo: '/landing/tech/replit.png',
    alt: 'Replit logo'
  },
  {
    name: 'Google Enterprise Agent Platform',
    logo: '/landing/tech/google-cloud.png',
    alt: 'Google Enterprise Agent Platform logo'
  },
  {
    name: 'daisyUI',
    logo: '/landing/tech/daisyui.png',
    alt: 'daisyUI logo'
  }
]
</script>

<template>
  <section class="relative py-14 sm:py-18 border-y border-base-content/10 bg-base-200/30 overflow-hidden">
    <!-- Subtle Ambient Glow -->
    <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div class="w-96 h-36 bg-primary/5 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-xl mx-auto mb-10">
        <p class="text-xs uppercase tracking-widest font-semibold text-primary mb-2">
          Technologies
        </p>
        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-base-content">
          Built with modern and reliable technology
        </h2>
      </div>

      <!-- Tech Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <div
          v-for="tech in technologies"
          :key="tech.name"
          class="group flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl bg-base-100/70 border border-base-content/10 hover:border-primary/40 hover:bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 text-center"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-base-200/60 p-2.5 group-hover:scale-110 transition-transform duration-200">
            <img
              :src="tech.logo"
              :alt="tech.alt"
              class="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <span class="text-sm font-semibold text-base-content/90 group-hover:text-primary transition-colors duration-200">
            {{ tech.name }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
