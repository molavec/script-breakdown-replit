<script setup lang="ts">
const invoices = [
  { date: 'Oct 01, 2023', id: 'INV-2023-10-424', amount: '$0.00', status: 'Paid' },
]

const { data: billingInfo, pending } = useFetch('/api/user/billing')

const plans = [
  {
    id: 'FREE',
    name: 'Free Plan',
    price: '$0',
    interval: '/month',
    features: ['Up to 750 tokens/month', 'Basic Script Editor', 'Community Support'],
    available: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$15',
    interval: '/month',
    features: ['Up to 7,500 tokens/month', 'Advanced Analytics', 'Priority Support', 'Export to PDF'],
    available: false, // Coming soon
  },
  {
    id: 'TEAM',
    name: 'Team',
    price: '$49',
    interval: '/month',
    features: ['Up to 30,000 tokens/month', 'Collaborative Editing', 'Custom Templates', 'Dedicated Manager'],
    available: false, // Coming soon
  }
]
</script>

<template>
  <div class="p-8 md:p-10 max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-50 mb-2">Billing & Plans</h1>
      <p class="text-gray-400 text-sm font-mono tracking-tight">Manage your subscription, view token consumption and billing history.</p>
    </div>

    <div v-if="pending" class="text-gray-400 text-sm mb-8 animate-pulse">
      Loading billing information...
    </div>
    
    <template v-else-if="billingInfo">
      <!-- Token Consumption -->
      <div class="bg-[#2a2b31] rounded-lg p-6 border border-white/5 shadow-xl mb-10 relative overflow-hidden">
        <!-- Subtle radial gradient -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h3 class="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-5">Current Token Consumption</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <!-- Daily -->
          <div>
            <div class="flex items-end justify-between mb-2">
              <span class="text-sm font-medium text-gray-200">Daily Usage</span>
              <span class="text-xs font-mono text-gray-400">{{ billingInfo.dailyUsage }} / {{ billingInfo.dailyLimit }}</span>
            </div>
            <div class="w-full h-2.5 bg-[#1e1f24] rounded-full overflow-hidden border border-white/5">
              <div 
                class="h-full rounded-full transition-all duration-500 ease-out"
                :class="billingInfo.dailyUsage / billingInfo.dailyLimit > 0.8 ? 'bg-red-500' : 'bg-emerald-500'"
                :style="`width: ${Math.min((billingInfo.dailyUsage / billingInfo.dailyLimit) * 100, 100)}%`"
              ></div>
            </div>
          </div>
          <!-- Monthly -->
          <div>
            <div class="flex items-end justify-between mb-2">
              <span class="text-sm font-medium text-gray-200">Monthly Usage</span>
              <span class="text-xs font-mono text-gray-400">{{ billingInfo.monthlyUsage }} / {{ billingInfo.monthlyLimit }}</span>
            </div>
            <div class="w-full h-2.5 bg-[#1e1f24] rounded-full overflow-hidden border border-white/5">
              <div 
                class="h-full rounded-full transition-all duration-500 ease-out"
                :class="billingInfo.monthlyUsage / billingInfo.monthlyLimit > 0.8 ? 'bg-red-500' : 'bg-blue-500'"
                :style="`width: ${Math.min((billingInfo.monthlyUsage / billingInfo.monthlyLimit) * 100, 100)}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plans -->
      <h3 class="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-5">Available Plans</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div 
          v-for="plan in plans" 
          :key="plan.id" 
          class="rounded-lg p-6 border shadow-xl relative overflow-hidden transition-all flex flex-col"
          :class="[
            billingInfo.plan === plan.id 
              ? 'bg-[#323339] border-blue-500/30 ring-1 ring-blue-500/20 shadow-blue-900/10' 
              : 'bg-[#2a2b31] border-white/5 hover:border-white/10'
          ]"
        >
          <div v-if="billingInfo.plan === plan.id" class="absolute top-0 right-0 px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded-bl-lg tracking-wider">
            Current
          </div>
          
          <div v-if="!plan.available" class="absolute top-4 right-4 px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase rounded shadow-sm tracking-wider">
            Coming Soon
          </div>

          <h2 class="text-xl font-semibold text-gray-100 mb-1 mt-2">{{ plan.name }}</h2>
          <div class="flex items-baseline gap-1 mb-6">
            <span class="text-[32px] font-bold text-white">{{ plan.price }}</span>
            <span class="text-xs font-mono text-gray-400">{{ plan.interval }}</span>
          </div>

          <ul class="space-y-4 mb-8 flex-1">
            <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-emerald-500/70 shrink-0">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
              </svg>
              <span class="text-[13px] font-medium text-gray-200">{{ feature }}</span>
            </li>
          </ul>

          <button 
            :disabled="!plan.available || billingInfo.plan === plan.id"
            class="w-full py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="[
              billingInfo.plan === plan.id 
                ? 'bg-white/10 text-white cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            ]"
          >
            {{ billingInfo.plan === plan.id ? 'Active' : (plan.available ? 'Upgrade' : 'Not Available') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Invoicing History -->
    <div class="bg-[#2a2b31] rounded-lg border border-white/5 shadow-xl flex flex-col">
      <div class="p-6 pb-5 border-b border-white/5">
        <h3 class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Invoicing History</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="text-[10px] font-bold text-gray-400 tracking-wider uppercase bg-[#2a2b31]">
            <tr class="border-b border-white/5">
              <th class="px-6 py-4 font-semibold w-1/5">Date</th>
              <th class="px-6 py-4 font-semibold w-1/4">Invoice ID</th>
              <th class="px-6 py-4 font-semibold w-1/5">Amount</th>
              <th class="px-6 py-4 font-semibold w-1/5">Status</th>
              <th class="px-6 py-4 font-semibold text-center w-1/6">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-white/[0.02] transition-colors">
              <td class="px-6 py-5 font-mono text-gray-300 text-xs">{{ invoice.date }}</td>
              <td class="px-6 py-5 font-mono text-gray-300 text-xs">{{ invoice.id }}</td>
              <td class="px-6 py-5 font-mono text-gray-300 text-xs">{{ invoice.amount }}</td>
              <td class="px-6 py-5">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-bold tracking-wide uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-5 text-center">
                <button class="text-gray-400 hover:text-white transition-colors">
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
