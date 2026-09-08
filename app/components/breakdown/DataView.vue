<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';

const { activeScene, project } = useProjectBreakdown();
const { columns, rows, addRow, addColumn } = useSceneTable();

const viewContainer = ref<HTMLElement | null>(null);

const handleAddRow = async () => {
  await addRow();
  setTimeout(() => {
    if (viewContainer.value && viewContainer.value.firstElementChild) {
      const el = viewContainer.value.firstElementChild as HTMLElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, 100);
};

const handleAddColumn = async () => {
  await addColumn();
  setTimeout(() => {
    if (viewContainer.value && viewContainer.value.firstElementChild) {
      const el = viewContainer.value.firstElementChild as HTMLElement;
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }
  }, 100);
};

const isSceneInfoExpanded = ref(false);
const view = ref<'table' | 'card'>('card');

onMounted(() => {
  if (window.innerWidth >= 1024) { // Tailwind 'lg' breakpoint
    view.value = 'table';
    isSceneInfoExpanded.value = true;
  }
});

const sceneShotsCount = computed(() => rows.value.length);

const budgetColumn = computed(() => columns.value.find((c: any) => c.name === 'Budget' || c.name === 'Presupuesto'));

const getCurrencySymbol = (code?: string): string => {
  if (!code) return '';
  const trimmed = String(code).trim();
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', MXN: '$', CAD: '$', AUD: '$',
    JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', ARS: '$', CLP: '$',
    COP: '$', PEN: 'S/'
  };
  return symbols[trimmed.toUpperCase()] || trimmed;
};

const sceneBudget = computed(() => {
  if (!budgetColumn.value) return 0;
  return rows.value.reduce((sum: number, row: any) => {
    const cell = row.cells[budgetColumn.value!.id];
    return sum + (Number(cell?.numericValue) || 0);
  }, 0);
});

const budgetCurrencySymbol = computed(() => {
  if (!budgetColumn.value) return '';
  return getCurrencySymbol(budgetColumn.value.options?.currencyCode);
});
</script>

<template>
  <div class="flex flex-col h-full bg-base-100 text-base-content">
    <!-- Scene Header -->
    <div class="p-4 flex flex-col gap-2 shrink-0 border-b border-base-300 bg-base-100">
      <div class="flex flex-wrap items-center justify-between w-full">
        <div v-if="activeScene" class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-base-content">Scene {{ activeScene?.order }}</h1>
          <NuxtLink 
            :to="`/projects/${project?.id}/scenes/${activeScene.id}`"
            class="btn btn-xs btn-ghost btn-square text-base-content/60 hover:text-primary hover:bg-base-300 transition-colors"
            title="Configure Scene"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </NuxtLink>
        </div>
        <div v-else>
          <h1 class="text-2xl font-bold text-base-content/40">No scene selected</h1>
        </div>
        
        <div class="flex items-center gap-1">
          <!-- View Toggle -->
          <label class="swap swap-rotate btn btn-sm btn-ghost btn-square text-base-content/60 hover:text-base-content" title="Toggle View">
            <input type="checkbox" :checked="view === 'card'" @change="view = view === 'table' ? 'card' : 'table'" />
            
            <!-- Table Icon -->
            <svg class="swap-off fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v4h6V6H4zm8 0v4h8V6h-8zm8 6h-8v6h8v-6zm-10 6v-6H4v6h6z"/></svg>
  
            <!-- Card Icon -->
            <svg class="swap-on fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zm2 0h14v5H5V5zm0 14v-7h14v7H5z"/></svg>
          </label>
  
          <button 
            class="btn btn-sm btn-primary font-semibold shadow-sm"
            @click="handleAddRow" 
          >
            Add Shot
          </button>
          <button
            class="btn btn-sm btn-outline border-base-300 text-base-content   hover:bg-base-300" 
            @click="handleAddColumn"
          >
            Add Column
          </button>

          <button 
            v-if="activeScene"
            class="btn btn-sm btn-ghost btn-square text-base-content/60 hover:text-base-content" 
            @click="isSceneInfoExpanded = !isSceneInfoExpanded"
          >
            <svg v-if="!isSceneInfoExpanded" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="activeScene" :class="['transition-all duration-300 w-full', isSceneInfoExpanded ? 'block' : 'hidden']">
        <p class="text-xs font-bold text-base-content/80 font-mono tracking-wider">
          Shots: {{ sceneShotsCount }} - Budget: {{ budgetCurrencySymbol }}{{ sceneBudget }}
        </p>
        <p v-if="activeScene.synopsis" class="text-xs text-base-content/60 font-mono tracking-wider mt-1">{{ activeScene.synopsis }}</p>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto relative" ref="viewContainer">
      <BreakdownTable v-if="view === 'table'" />
      <BreakdownCards v-else />
    </div>
  </div>
</template>

