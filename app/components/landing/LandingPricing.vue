<script setup lang="ts">
import { PRICING_PLANS } from '#imports'
</script>

<template>
  <section class="py-24 bg-base-100 relative overflow-hidden" id="pricing">
    <!-- Background decorations -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-40 -right-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="container mx-auto px-6 max-w-6xl relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-base-content">
          Simple, Transparent Pricing
        </h2>
        <p class="text-lg text-base-content/70">
          Start for free and upgrade as your needs grow.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PricingPlanCard
          v-for="plan in PRICING_PLANS"
          :key="plan.id"
          :plan="plan"
          :is-landing="true"
        />
      </div>
    </div>
  </section>
</template>
