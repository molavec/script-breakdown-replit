<template>
  <NuxtLink to="/projects/new" class="border border-dashed border-base-300 rounded-box flex flex-col items-center justify-center p-8 text-center hover:border-primary/50 hover:bg-base-200/50 transition-all duration-300 cursor-pointer min-h-[360px] group">
    <div class="w-14 h-14 rounded-box bg-base-300 flex items-center justify-center mb-6 text-base-content/60 group-hover:text-primary group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </div>
    <h3 class="text-2xl font-semibold mb-3 text-base-content group-hover:text-primary transition-colors">Untitled Project</h3>
    <p class="text-base-content/60 text-sm font-mono max-w-[220px] leading-relaxed group-hover:text-base-content/80 transition-colors">Create a new project to start scripting, storyboarding, and planning.</p>
  </NuxtLink>
</template>
