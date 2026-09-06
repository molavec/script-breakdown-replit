<script setup lang="ts">
const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Mockup', href: '#preview' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'AI Studio', href: '#ai' },
  { label: 'FAQ', href: '#faq' },
]

const isScrolled = ref(false)

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
</script>

<template>
  <div class="min-h-screen bg-base-100 text-base-content font-sans selection:bg-primary/30 flex flex-col antialiased">
    <!-- Ambient Background Lighting -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl opacity-70"></div>
      <div class="absolute top-[800px] -left-48 w-96 h-96 bg-primary/10 blur-3xl rounded-full"></div>
      <div class="absolute top-[1400px] -right-48 w-96 h-96 bg-secondary/10 blur-3xl rounded-full"></div>
    </div>

    <!-- Public Landing Navbar -->
    <header 
      class="sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md border-b"
      :class="isScrolled ? 'bg-base-100/90 border-base-300 shadow-xl shadow-black/40 py-3' : 'bg-transparent border-transparent py-4 sm:py-5'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <!-- Brand Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-content shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
              <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">Script Breakdown</span>
            <span class="text-[10px] uppercase font-mono tracking-widest text-base-content/60 -mt-1">Production AI</span>
          </div>
        </NuxtLink>

        <!-- Center Links (Desktop) -->
        <nav class="hidden md:flex items-center gap-7 text-sm font-medium text-base-content/80">
          <a 
            v-for="link in navLinks" 
            :key="link.href" 
            :href="link.href" 
            class="hover:text-primary transition-colors py-1"
          >
            {{ link.label }}
          </a>
        </nav>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-3">
          <NuxtLink 
            to="/login" 
            class="btn btn-sm btn-ghost text-base-content/80 hover:text-base-content font-medium px-4"
          >
            Sign In
          </NuxtLink>
          <NuxtLink 
            to="/signup" 
            class="btn btn-sm btn-primary font-medium px-4 shadow-lg shadow-primary/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>Get Started</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content Slot -->
    <div class="flex-1 z-10 relative">
      <slot />
    </div>

    <!-- Public Landing Footer -->
    <footer class="border-t border-base-300 bg-base-200 z-10 relative text-base-content/70 text-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <!-- Column 1: Info -->
          <div class="md:col-span-2 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                  <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
                  <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-base font-bold text-base-content tracking-tight">Script Breakdown</span>
            </div>
            <p class="text-xs sm:text-sm text-base-content/70 max-w-sm leading-relaxed">
              Intelligent pre-production and script breakdown workspace for directors, producers, assistant directors, and creative film crews.
            </p>
            <div class="flex items-center gap-2 pt-2">
              <span class="badge badge-sm badge-neutral border-base-300 text-base-content/80 font-mono text-[11px]">
                Powered by Gemini AI
              </span>
              <span class="badge badge-sm badge-neutral border-base-300 text-base-content/80 font-mono text-[11px]">
                Nuxt 4 & Tailwind
              </span>
            </div>
          </div>

          <!-- Column 2: Product -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-base-content mb-4">Platform</h4>
            <ul class="space-y-2.5 text-xs sm:text-sm">
              <li><a href="#features" class="hover:text-primary transition-colors">Scene Breakdown</a></li>
              <li><a href="#features" class="hover:text-primary transition-colors">Shot Lists & Storyboard</a></li>
              <li><a href="#ai" class="hover:text-primary transition-colors">Gemini AI Assistant</a></li>
              <li><a href="#workflow" class="hover:text-primary transition-colors">Production Columns</a></li>
            </ul>
          </div>

          <!-- Column 3: Access -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-base-content mb-4">Account</h4>
            <ul class="space-y-2.5 text-xs sm:text-sm">
              <li><NuxtLink to="/login" class="hover:text-primary transition-colors">Sign In</NuxtLink></li>
              <li><NuxtLink to="/signup" class="hover:text-primary transition-colors">Join Free</NuxtLink></li>
              <li><a href="#faq" class="hover:text-primary transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/50">
          <p>© {{ new Date().getFullYear() }} Script Breakdown. Designed for cinematic workflows.</p>
          <div class="flex items-center gap-6">
            <span>Enterprise-grade isolation</span>
            <span>Cloud media storage</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
