<template>
  <NuxtLink to="/projects/new" class="border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-center hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer min-h-[360px] group">
    <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors group-hover:scale-110 duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </div>
    <h3 class="text-2xl font-semibold mb-3 text-rose-200/90 group-hover:text-rose-200 transition-colors">Untitled Project</h3>
    <p class="text-gray-400 text-sm font-mono max-w-[220px] leading-relaxed group-hover:text-gray-300 transition-colors">Create a new project to start scripting, storyboarding, and planning.</p>
  </NuxtLink>
</template>
