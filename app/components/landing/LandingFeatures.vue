<script setup lang="ts">
const features = [
  {
    title: 'UX as a First-Class Citizen',
    description: "User experience was our top priority. Rather than forcing AI into every corner of the app just for the sake of it, we hyper-focused our UI/UX refinement on the most critical workflows: scene and shot management. We ensured the Google AI tools feel natural, integrated, and genuinely helpful. By prioritizing a clean, frictionless interface over unnecessary gimmicks, we avoided user fatigue while strictly fulfilling the hackathon's technical and design requirements.",
    image: '/landing/feature_1.png',
  },
  {
    title: 'Zero-Friction Onboarding',
    description: "The application currently loads with pre-populated test data so users can instantly test the AI and experience the platform's value. In future iterations, this will be dynamically populated via automated script imports (FDX/PDF) or project descriptions.",
    image: '/landing/feature_2.png',
  },
  {
    title: 'Gradual AI Context',
    description: "We prioritized intelligent, context-aware generation. The AI assistant receives gradual context by reading the previously filled columns of the exact same shot, ensuring that generated storyboards and technical text remain highly coherent and aligned with the director's vision.",
    image: '/landing/feature_3.png',
  },
  {
    title: 'Transparent Credit Management',
    description: "We built a visible token consumption system. Users can easily monitor their daily and monthly AI usage via progress bars, ensuring they always have full control over their limits without any billing surprises.",
    image: '/landing/feature_4.png',
  },
  {
    title: 'Built-in Budget & Metadata Tracking',
    description: "We implemented a project-level dashboard that automatically calculates and displays essential statistics, allowing creators to track their estimated production budget alongside their total scenes and shot counts.",
    image: '/landing/feature_5.png',
  },
]
</script>

<template>
  <section id="features" class="py-20 sm:py-28 relative z-10 border-t border-base-300/40 bg-base-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-mono uppercase tracking-widest text-primary font-semibold">A few words to judges</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-base-content mt-2 tracking-tight">
          Hackathon Prioritization
        </p>
        <p class="text-base-content/70 mt-3 text-sm sm:text-base leading-relaxed">
          To deliver a polished and highly functional product within the deadline, we fiercely prioritized.
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div 
          v-for="feat in features" 
          :key="feat.title"
          class="card bg-base-200 border border-base-300 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-base-content/5 group overflow-hidden flex flex-col"
        >
          <figure class="border-b border-base-300/50 bg-base-300/20">
            <img :src="feat.image" :alt="feat.title" class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
          </figure>
          <div class="p-6 sm:p-8 flex flex-col flex-1">
            <h3 class="text-lg font-bold text-base-content tracking-tight group-hover:text-primary transition-colors">
              {{ feat.title }}
            </h3>
            <p class="text-base-content/70 text-xs sm:text-sm mt-3 leading-relaxed">
              {{ feat.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
