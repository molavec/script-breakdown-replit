<script setup lang="ts">
const faqs = [
  {
    q: 'What is Script Breakdown?',
    a: 'Script Breakdown is a pre-production web platform that lets filmmakers, producers, directors, and ADs deconstruct screenplays into structured scenes, shot lists, camera setups, and production element categories like cast, wardrobe, props, and VFX.',
  },
  {
    q: 'How does Gemini AI assist in pre-production?',
    a: 'Gemini AI analyzes your scene actions and locations to suggest camera angles, shot varieties, and technical notes. It also generates cinematic visual prompts that can be fed into AI storyboard generators to visualize lighting, lenses, and mood.',
  },
  {
    q: 'Can I customize the columns and breakdown elements?',
    a: 'Yes! You can add, reorder, and delete columns for any scene or project. Whether you need specialized categories for Stunts, Pyrotechnics, Animals, or Drone Operations, the table adapts to your production needs.',
  },
  {
    q: 'How do I authenticate or create an account?',
    a: 'Script Breakdown is securely integrated with Replit authentication. You can sign in with your Replit credentials in one click—no separate passwords or unverified emails required.',
  },
  {
    q: 'Are my scripts and production media private?',
    a: 'Absolutely. All projects, scenes, shots, and uploaded stills are strictly scoped to your authenticated account with isolated data access and non-leaking security controls.',
  },
]
</script>

<template>
  <section id="faq" class="py-20 sm:py-28 relative z-10 border-t border-white/5 bg-[#0e0e12]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">Answers & Clarity</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
          Frequently Asked Questions
        </p>
        <p class="text-neutral-400 mt-3 text-sm sm:text-base">
          Everything you need to know about our script breakdown workflow.
        </p>
      </div>

      <!-- FAQ Accordion using DaisyUI collapse -->
      <div class="space-y-4">
        <div 
          v-for="(faq, i) in faqs" 
          :key="faq.q"
          class="collapse collapse-plus bg-[#14141a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
        >
          <input type="radio" name="landing-faq" :checked="i === 0" />
          <div class="collapse-title text-base sm:text-lg font-semibold text-white">
            {{ faq.q }}
          </div>
          <div class="collapse-content text-neutral-300 text-xs sm:text-sm leading-relaxed pb-4">
            <p>{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
