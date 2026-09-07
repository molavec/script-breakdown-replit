<script setup lang="ts">
import { PRICING_PLANS } from '#imports'

const invoices = [
  { date: 'Oct 01, 2023', id: 'INV-2023-10-424', amount: '$0.00', status: 'Paid' },
]

const { data: billingInfo, pending } = useFetch('/api/user/billing')

</script>

<template>
  <div class="p-8 md:p-10 max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-base-content mb-2">Billing & Plans</h1>
      <p class="text-base-content/70 text-sm font-mono tracking-tight">Manage your subscription, view token consumption and billing history.</p>
    </div>

    <div v-if="pending" class="text-base-content/50 text-sm mb-8 animate-pulse">
      Loading billing information...
    </div>
    
    <template v-else-if="billingInfo">
      <!-- Token Consumption -->
      <div class="card bg-base-200 rounded-box p-6 border border-base-300 shadow-xl mb-10 relative overflow-hidden">
        <!-- Subtle radial gradient -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <h3 class="text-[11px] font-bold text-base-content/70 tracking-wider uppercase mb-5">Current Token Consumption</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <!-- Daily -->
          <div>
            <div class="flex items-end justify-between mb-2">
              <span class="text-sm font-medium text-base-content">Daily Usage</span>
              <span class="text-xs font-mono text-base-content/60">{{ billingInfo.dailyUsage }} / {{ billingInfo.dailyLimit }}</span>
            </div>
            <progress 
              class="progress w-full"
              :class="billingInfo.dailyUsage / billingInfo.dailyLimit > 0.8 ? 'progress-error' : 'progress-success'"
              :value="billingInfo.dailyUsage"
              :max="billingInfo.dailyLimit"
            ></progress>
          </div>
          <!-- Monthly -->
          <div>
            <div class="flex items-end justify-between mb-2">
              <span class="text-sm font-medium text-base-content">Monthly Usage</span>
              <span class="text-xs font-mono text-base-content/60">{{ billingInfo.monthlyUsage }} / {{ billingInfo.monthlyLimit }}</span>
            </div>
            <progress 
              class="progress w-full"
              :class="billingInfo.monthlyUsage / billingInfo.monthlyLimit > 0.8 ? 'progress-error' : 'progress-info'"
              :value="billingInfo.monthlyUsage"
              :max="billingInfo.monthlyLimit"
            ></progress>
          </div>
        </div>
      </div>

      <!-- Plans -->
      <h3 class="text-[11px] font-bold text-base-content/70 tracking-wider uppercase mb-5">Available Plans</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <PricingPlanCard
          v-for="plan in PRICING_PLANS"
          :key="plan.id"
          :plan="plan"
          :current-plan-id="billingInfo.plan"
        />
      </div>
    </template>

    <!-- Invoicing History -->
    <div class="card bg-base-200 rounded-box border border-base-300 shadow-xl flex flex-col overflow-hidden">
      <div class="p-6 pb-5 border-b border-base-300">
        <h3 class="text-[11px] font-bold text-base-content/70 tracking-wider uppercase">Invoicing History</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-left">
          <thead class="text-[10px] font-bold text-base-content/70 tracking-wider uppercase bg-base-300">
            <tr>
              <th class="px-6 py-4 font-semibold w-1/5">Date</th>
              <th class="px-6 py-4 font-semibold w-1/4">Invoice ID</th>
              <th class="px-6 py-4 font-semibold w-1/5">Amount</th>
              <th class="px-6 py-4 font-semibold w-1/5">Status</th>
              <th class="px-6 py-4 font-semibold text-center w-1/6">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-base-300/40 transition-colors">
              <td class="px-6 py-5 font-mono text-base-content/80 text-xs">{{ invoice.date }}</td>
              <td class="px-6 py-5 font-mono text-base-content/80 text-xs">{{ invoice.id }}</td>
              <td class="px-6 py-5 font-mono text-base-content/80 text-xs">{{ invoice.amount }}</td>
              <td class="px-6 py-5">
                <span class="badge badge-sm badge-success badge-outline font-mono text-[10px]">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-5 text-center">
                <button class="btn btn-xs btn-ghost btn-circle text-base-content/70 hover:text-base-content transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 mx-auto">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
