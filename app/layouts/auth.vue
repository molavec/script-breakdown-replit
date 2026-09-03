<template>
  <div class="min-h-screen bg-[#141414] text-white font-sans selection:bg-rose-500/30 flex items-center justify-center relative">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000&auto=format&fit=crop" alt="Background" class="w-full h-full object-cover opacity-20 grayscale" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-black/80"></div>
    </div>
    
    <!-- Main Content -->
    <div class="relative z-10 w-full max-w-[440px] px-6 py-12">
      <slot />
    </div>
  </div>
</template>
