<script setup lang="ts">
// Landing Hero Component
</script>

<template>
  <section class="relative pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-24 lg:pb-32 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <!-- Left Side: Copy & CTAs -->
        <div class="text-left">
          <!-- Announcement Pill -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-8 backdrop-blur-md hover:bg-primary/20 transition-all">
            <span class="text-base-content/80">Agentic Cinema Hackathon</span>
            <span class="opacity-40">•</span>
            <span class="text-base-content/80">Replit Track</span>
          </div>


          <!-- Brand Logo -->
          <div class="flex items-center gap-6 mb-2">
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

          <!-- Main Headline -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-base-content leading-[1.1]">
            AI-powered Film Pre-production & Shot List 
          </h1>

          <!-- Subtitle Description -->
          <p class="mt-6 sm:mt-8 text-lg sm:text-xl text-base-content/80 max-w-2xl font-normal leading-relaxed">
            Integrate your script, storyboards, camera, props, and cast into a single AI-powered workspace. Visualize every shot before arriving on set and save weeks of pre-production.
          </p>

          <!-- Primary CTA Buttons -->
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-start gap-4">
            <NuxtLink
              to="/signup"
              class="btn btn-primary btn-lg rounded-box font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-3 group px-8 w-full sm:w-auto"
            >
              <span>Start Breaking Down Free</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </NuxtLink>

            <a
              href="#how-it-works"
              class="btn btn-outline border-base-300 bg-base-200/50 hover:bg-base-200 text-base-content btn-lg rounded-box font-medium transition-all flex items-center justify-center gap-2 px-7 w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-base-content/60">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>Explore Product Tour</span>
            </a>
          </div>
        </div>

        <!-- Right Side: Images -->
        <div class="relative w-full h-[300px] sm:h-[450px] lg:h-[500px] mt-12 lg:mt-0 perspective-1000">
          <div class="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/10 to-transparent rounded-3xl blur-3xl"></div>
          
          <!-- Main Dashboard Image -->
          <img 
            src="/landing/demo_project.png" 
            alt="Project Dashboard" 
            class="absolute top-0 right-0 w-5/6 rounded-2xl shadow-2xl border border-base-300 transform hover:-translate-y-2 transition-transform duration-500 ease-out z-10 object-cover"
          />

          <!-- Mobile App Mockup Overlay -->
          <img 
            src="/landing/demo_scene_mobile_1.png" 
            alt="Mobile Scene View" 
            class="absolute bottom-[-20px] left-[5%] w-1/3 max-w-[200px] rounded-3xl shadow-2xl border-4 border-base-100 transform hover:-translate-y-4 hover:scale-105 transition-all duration-500 ease-out z-20 object-cover"
          />
        </div>
      </div>

      <!-- Proof Badges / User Benefits -->
      <div class="mt-20 pt-8 border-t border-base-300/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div class="card p-4 rounded-box bg-base-200/60 border border-base-300 backdrop-blur-sm shadow-sm hover:border-primary/50 transition-colors">
          <div class="text-xs font-bold uppercase tracking-wider text-primary">Indie Directors</div>
          <div class="text-sm font-semibold text-base-content mt-1">Visualize before set</div>
          <div class="text-xs text-base-content/60 mt-1">AI storyboards with no extra budget.</div>
        </div>

        <div class="card p-4 rounded-box bg-base-200/60 border border-base-300 backdrop-blur-sm shadow-sm hover:border-secondary/50 transition-colors">
          <div class="text-xs font-bold uppercase tracking-wider text-secondary">ADs & Producers</div>
          <div class="text-sm font-semibold text-base-content mt-1">Zero surprises</div>
          <div class="text-xs text-base-content/60 mt-1">Every department knows what they need.</div>
        </div>

        <div class="card p-4 rounded-box bg-base-200/60 border border-base-300 backdrop-blur-sm shadow-sm hover:border-success/50 transition-colors">
          <div class="text-xs font-bold uppercase tracking-wider text-success">Film Students</div>
          <div class="text-sm font-semibold text-base-content mt-1">Pro Pre-production</div>
          <div class="text-xs text-base-content/60 mt-1">Learn with professional tools.</div>
        </div>

        <div class="card p-4 rounded-box bg-base-200/60 border border-base-300 backdrop-blur-sm shadow-sm hover:border-info/50 transition-colors">
          <div class="text-xs font-bold uppercase tracking-wider text-info">Content Creators</div>
          <div class="text-sm font-semibold text-base-content mt-1">Elevate your narrative</div>
          <div class="text-xs text-base-content/60 mt-1">Take your videos to the next level.</div>
        </div>
      </div>
    </div>
  </section>
</template>
