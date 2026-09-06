<script setup lang="ts">
const steps = [
  {
    id: 1,
    title: 'Estructura tu escena',
    description: 'Visualiza todo tu desglose en una tabla técnica personalizable. Selecciona cualquier celda vacía para comenzar a añadir detalles creativos o técnicos.',
    image: '/landing/demo_scene_1c.png',
  },
  {
    id: 2,
    title: 'Co-crea con Gemini AI',
    description: 'Abre el asistente inteligente. Usa un prompt sencillo para generar storyboards, encuadres precisos o redacciones técnicas. La IA entiende el contexto de tu toma automáticamente.',
    image: '/landing/edit_cell_1b.png',
  },
  {
    id: 3,
    title: 'Resultados en tu shot',
    description: 'El contenido generado se inserta directamente en tu celda. Listo para ser guardado, compartido con el equipo o iterado de nuevo si lo necesitas.',
    image: '/landing/edit_result.png',
  }
]
</script>

<template>
  <section id="how-it-works" class="py-20 sm:py-28 relative z-10 border-t border-base-300/40 bg-base-100 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-xs font-mono uppercase tracking-widest text-primary font-semibold">Workflow Inteligente</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-base-content mt-2 tracking-tight">
          Preproducción a la velocidad de tu imaginación
        </p>
        <p class="text-base-content/70 mt-3 text-sm sm:text-base leading-relaxed">
          Descubre cómo el asistente de IA se integra fluidamente en tu proceso de desglose. Sin fricción, sin salir de tu espacio de trabajo.
        </p>
      </div>

      <div class="space-y-24 lg:space-y-32">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          <!-- Text Content -->
          <div 
            class="space-y-6"
            :class="index % 2 === 1 ? 'lg:order-2' : ''"
          >
            <div class="flex gap-4 items-center">
              <div class="w-12 h-12 rounded-full bg-primary/30 text-primary flex items-center justify-center font-bold font-mono text-xl">
                {{ step.id }}
              </div>
              <h3 class="text-3xl font-bold text-base-content tracking-tight">{{ step.title }}</h3>
            </div>
            <p class="text-lg text-base-content/70 leading-relaxed">
              {{ step.description }}
            </p>
          </div>

          <!-- Image -->
          <div 
            class="relative rounded-3xl bg-base-200 border border-base-300 p-2 sm:p-4 shadow-2xl overflow-hidden group"
            :class="index % 2 === 1 ? 'lg:order-1' : ''"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img 
              :src="step.image" 
              :alt="step.title"
              class="relative z-10 w-full h-auto rounded-xl shadow-xl transform group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
