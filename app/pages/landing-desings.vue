<script setup lang="ts">
definePageMeta({
  layout: false,
  alias: ['/landing-designs'],
})

useSeoMeta({
  title: 'Script Breakdown — AI-Powered Film Pre-Production & Shot Lists',
  description: 'Deconstruct screenplays into structured scenes, shot lists, camera setups, and production elements with Gemini AI.',
})
</script>

<template>
  <div class="min-h-screen bg-base-100 text-base-content font-sans selection:bg-primary/30 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden antialiased">
    <!-- Ambient Background Lighting -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl opacity-70"></div>
      <div class="absolute top-1/2 -left-48 w-96 h-96 bg-primary/10 blur-3xl rounded-full"></div>
      <div class="absolute top-1/2 -right-48 w-96 h-96 bg-secondary/10 blur-3xl rounded-full"></div>
    </div>

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-7xl mx-auto py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <!-- Brand Logo -->
        <div class="group flex items-center gap-6 mb-2">
          <img 
            src="/landing/logo_transparent_bg.png" 
            alt="Script Breakdown Logo" 
            class="h-14 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform" 
          />
          <div class="flex">
            <span class="text-3xl font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">Script Breakdown</span>
            <span class="text-[15px] uppercase font-mono tracking-widest text-base-content/60 -mt-1.5 ml-1">AI</span>
          </div>
        </div>

        <!-- Right Side: Images -->
        <div class="relative w-full h-[300px] sm:h-[450px] lg:h-[500px] mt-12 lg:mt-0 perspective-1000">

          <div class="group flex items-center gap-6 mb-2">
            <img 
              src="/landing/logo_transparent_bg.png" 
              alt="Script Breakdown Logo" 
              class="h-14 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform" 
            />
            <div class="flex">
              <span class="text-3xl font-bold tracking-tight text-base-content group-hover:text-primary transition-colors">Script Breakdown</span>
              <span class="text-[15px] uppercase font-mono tracking-widest text-base-content/60 -mt-1.5 ml-1">AI</span>
            </div>
          </div>         

          <div class="relative w-full">
            <!-- Main Dashboard Image -->
            <img 
              src="/landing/demo_project.png" 
              alt="Project Dashboard" 
              class="absolute bottom-[0] w-5/6 rounded-2xl shadow-2xl border border-base-300 transform transition-transform duration-500 ease-out z-10 object-cover"
            />
  
            <!-- Mobile App Mockup Overlay -->
            <img 
              src="/landing/demo_scene_mobile_1.png" 
              alt="Mobile Scene View" 
              class="absolute bottom-[320px] right-0 w-1/3 max-w-[200px] rounded-3xl shadow-2xl border-4 border-base-100 transform transition-all duration-500 ease-out z-20 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
