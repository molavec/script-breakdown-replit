<script setup lang="ts">
const invoices = [
  { date: 'Oct 01, 2023', id: 'INV-2023-10-424', amount: '$499.00', status: 'Paid' },
  { date: 'Sep 01, 2023', id: 'INV-2023-09-382', amount: '$499.00', status: 'Paid' },
  { date: 'Aug 01, 2023', id: 'INV-2023-08-319', amount: '$499.00', status: 'Paid' },
  { date: 'Jul 01, 2023', id: 'INV-2023-07-251', amount: '$499.00', status: 'Paid' },
]

const features = [
  'Unlimited Scripts',
  'Up to 50 Team Members',
  'Advanced Analytics',
  'Priority Support'
]
</script>

<template>
  <div class="p-8 md:p-10 max-w-6xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-50 mb-2">Settings Billing</h1>
      <p class="text-gray-400 text-sm font-mono tracking-tight">Manage your account preferences and billing details.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column -->
      <div class="flex flex-col gap-6 lg:col-span-1">
        
        <!-- Current Plan -->
        <div class="bg-[#2a2b31] rounded-lg p-6 border border-white/5 shadow-xl relative overflow-hidden">
          <!-- Subtle radial gradient in top right corner to match design -->
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h3 class="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-5">Current Plan</h3>
          
          <h2 class="text-xl font-semibold text-gray-100 mb-1">Pro Production Suite</h2>
          <div class="flex items-baseline gap-1 mb-6">
            <span class="text-[32px] font-bold text-white">$499</span>
            <span class="text-xs font-mono text-gray-400">/month</span>
          </div>

          <ul class="space-y-4 mb-8">
            <li v-for="feature in features" :key="feature" class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-[#df9a9a]">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
              </svg>
              <span class="text-[13px] font-medium text-gray-200">{{ feature }}</span>
            </li>
          </ul>

          <div class="flex flex-col gap-3">
            <button class="bg-[#ff0033] hover:bg-[#e6002e] text-white py-2.5 rounded-md text-sm font-semibold transition-colors shadow-lg shadow-red-500/20 w-full">
              Upgrade Plan
            </button>
            <button class="border border-white/10 hover:bg-white/5 text-gray-300 py-2.5 rounded-md text-sm font-semibold transition-colors w-full">
              Cancel Subscription
            </button>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="bg-[#2a2b31] rounded-lg p-6 border border-white/5 shadow-xl">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Payment Method</h3>
            <button class="text-[11px] font-bold text-[#ffcc00] hover:text-yellow-400 transition-colors tracking-wide">Edit</button>
          </div>
          
          <div class="bg-[#1e1f24] border border-white/5 rounded-md p-4 flex items-center gap-4">
            <div class="w-12 h-8 bg-[#2a2b31] rounded flex items-center justify-center shrink-0 border border-white/5">
              <!-- Simple credit card icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
            </div>
            <div>
              <div class="text-[13px] font-semibold text-gray-200">VISA ending in 4242</div>
              <div class="text-[11px] font-mono text-gray-500 mt-1">Expires 12/2025</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column -->
      <div class="lg:col-span-2">
        <div class="bg-[#2a2b31] rounded-lg border border-white/5 shadow-xl flex flex-col h-full">
          <div class="p-6 pb-5 border-b border-white/5">
            <h3 class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Invoicing History</h3>
          </div>
          
          <div class="overflow-x-auto flex-1">
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
                    <button class="text-gray-400 hover:text-[#ff9f9f] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 mx-auto">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="mt-auto p-5 border-t border-white/5 text-center">
            <button class="text-[11px] font-bold text-gray-400 hover:text-gray-200 uppercase tracking-wider transition-colors inline-flex items-center gap-1.5">
              Load More
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
