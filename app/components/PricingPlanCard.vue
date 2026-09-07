<script setup lang="ts">
import { PRICING_PLANS } from '#imports'

defineProps<{
  plan: typeof PRICING_PLANS[0];
  currentPlanId?: string;
  isLanding?: boolean;
}>()
</script>

<template>
  <div 
    class="card bg-base-200 rounded-box p-6 border shadow-xl relative overflow-hidden transition-all flex flex-col"
    :class="[
      currentPlanId === plan.id 
        ? 'border-primary ring-1 ring-primary/30 shadow-primary/10' 
        : 'border-base-300 hover:border-base-content/20'
    ]"
  >
    <div v-if="currentPlanId === plan.id" class="badge badge-sm badge-primary absolute top-4 right-4 uppercase tracking-wider font-mono text-[10px]">
      Current
    </div>
    
    <div v-if="!plan.available" class="badge badge-sm badge-warning badge-outline absolute top-4 right-4 uppercase tracking-wider font-mono text-[10px]">
      Coming Soon
    </div>

    <h2 class="text-xl font-semibold text-base-content mb-1 mt-2">{{ plan.name }}</h2>
    <div class="flex items-baseline gap-1 mb-6">
      <span class="text-3xl font-bold text-base-content">{{ plan.price }}</span>
      <span class="text-xs font-mono text-base-content/60">{{ plan.interval }}</span>
    </div>

    <ul class="space-y-4 mb-8 flex-1">
      <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-success shrink-0">
          <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
        </svg>
        <span class="text-[13px] font-medium text-base-content/80">{{ feature }}</span>
      </li>
    </ul>

    <template v-if="isLanding">
      <NuxtLink
        :to="plan.available ? '/settings/billing' : ''"
        class="btn btn-sm w-full font-semibold transition-colors"
        :class="[
          plan.available
            ? 'btn-primary shadow-lg shadow-primary/20'
            : 'btn-neutral cursor-not-allowed opacity-50'
        ]"
        :tabindex="plan.available ? 0 : -1"
        :style="!plan.available ? 'pointer-events: none;' : ''"
      >
        {{ plan.available ? 'Get Started' : 'Coming Soon' }}
      </NuxtLink>
    </template>
    <template v-else>
      <button 
        :disabled="!plan.available || currentPlanId === plan.id"
        class="btn btn-sm w-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          currentPlanId === plan.id 
            ? 'btn-neutral cursor-default'
            : 'btn-primary shadow-lg shadow-primary/20'
        ]"
      >
        {{ currentPlanId === plan.id ? 'Active' : (plan.available ? 'Upgrade' : 'Not Available') }}
      </button>
    </template>
  </div>
</template>
