<script setup lang="ts">
import { ref, computed, reactive, watchEffect, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { CellContentType } from '~~/shared/types/column';

definePageMeta({
  layout: false
});

const route = useRoute();
const router = useRouter();

const { project, activeSceneId, loadProject } = useProjectBreakdown();
const { getColumn, updateColumn, deleteColumn, columns } = useSceneTable();
const { cellTypes, presetColors, fetchColumns } = useColumnData();

const projectId = computed(() => (route.params.id as string) || project.value?.id || '1');
const columnId = computed(() => (route.params.columnId as string) || '');

const column = computed(() => getColumn(columnId.value));

onMounted(async () => {
  if (!project.value || project.value.id !== projectId.value) {
    await loadProject(projectId.value);
  }
  
  if (columns.value.length === 0) {
    columns.value = await fetchColumns(projectId.value);
  }
});

// Form state
const formData = reactive({
  name: '',
  cellType: 'text' as CellContentType,
  description: '',
  color: '#3b82f6',
  width: '200',
  placeholder: '',
  defaultPrompt: '',
  currencyCode: 'USD'
});

const showToast = ref(false);
const toastMessage = ref('');

// Sync form with current column
watchEffect(() => {
  if (column.value) {
    formData.name = column.value.name;
    formData.cellType = column.value.cellType || 'text';
    formData.description = column.value.description || '';
    formData.color = column.value.color || '#3b82f6';
    formData.width = String(column.value.options?.width || '200');
    formData.placeholder = column.value.options?.placeholder || '';
    formData.defaultPrompt = column.value.options?.defaultPrompt || '';
    formData.currencyCode = column.value.options?.currencyCode || 'USD';
  }
});



// Back navigation with robust fallback
const handleBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back();
  } else {
    // Fallback to active scene breakdown or project overview
    const sceneId = activeSceneId.value || 's4';
    navigateTo(`/projects/${projectId.value}/scene/${sceneId}`);
  }
};

const handleSave = async () => {
  if (!column.value) return;

  const parsedWidth = parseInt(formData.width, 10);

  try {
    await updateColumn(columnId.value, {
      name: formData.name.trim() || 'Untitled Column',
      cellType: formData.cellType,
      description: formData.description,
      color: formData.color,
      options: {
        width: isNaN(parsedWidth) ? undefined : parsedWidth,
        placeholder: formData.placeholder,
        defaultPrompt: formData.defaultPrompt,
        currencyCode: formData.currencyCode
      }
    });

    toastMessage.value = 'Column configuration saved successfully';
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2500);
  } catch (error) {
    alert('Failed to save column configuration. Please try again.');
  }
};

const handleDelete = async () => {
  if (!column.value) return;
  if (column.value.isSystem) {
    alert('System columns cannot be deleted.');
    return;
  }

  if (confirm(`Are you sure you want to delete the column "${column.value.name}"? This action will remove all cell contents in this column.`)) {
    try {
      await deleteColumn(columnId.value);
      handleBack();
    } catch (error) {
      alert('Failed to delete column. Please try again.');
    }
  }
};
</script>

<template>
  <div class="h-screen flex flex-col bg-[#141414] font-sans overflow-hidden">
    <!-- Header General (App) -->
    <AppHeader />

    <!-- Main Content Area with Sidebar -->
    <main class="flex-1 flex overflow-hidden relative">
      <!-- Sidebar -->
      <BreakdownSidebar />

      <!-- Column Settings Main Content -->
      <div class="flex-1 overflow-y-auto bg-[#121214] text-white p-6 md:p-10">
        <div class="max-w-4xl mx-auto space-y-8 pb-16">
          
          <!-- Top Navigation & Breadcrumbs Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div class="flex items-center gap-3">
              <button 
                type="button"
                @click="handleBack"
                class="btn btn-sm btn-outline border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white flex items-center gap-1.5 px-3"
                title="Return to previous view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                <span>Back</span>
              </button>

              <div class="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <NuxtLink to="/" class="hover:text-white transition-colors">Projects</NuxtLink>
                <span>/</span>
                <NuxtLink :to="`/projects/${projectId}`" class="hover:text-white transition-colors">{{ project?.name }}</NuxtLink>
                <span>/</span>
                <span class="text-neutral-500">Columns</span>
                <span>/</span>
                <span class="text-white font-semibold">{{ column ? column.name : 'Not Found' }}</span>
              </div>
            </div>

            <!-- Action Buttons in Top Bar -->
            <div class="flex items-center gap-2">
              <button 
                v-if="column && !column.isSystem"
                type="button" 
                @click="handleDelete" 
                class="btn btn-sm btn-ghost text-red-400 hover:bg-red-950/40 hover:text-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                Delete
              </button>
              
              <button 
                type="button" 
                @click="handleSave"
                class="btn btn-sm btn-error text-white font-semibold px-5 shadow-lg shadow-rose-950/40 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Changes
              </button>
            </div>
          </div>

          <!-- Toast Notification -->
          <div v-if="showToast" class="alert alert-success bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm py-2.5 px-4 shadow-lg transition-all flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>{{ toastMessage }}</span>
            </div>
            <button @click="showToast = false" class="text-xs text-emerald-400 hover:text-white">✕</button>
          </div>

          <!-- Not Found State -->
          <div v-if="!column" class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-12 text-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <h2 class="text-xl font-bold text-white">Column not found</h2>
            <p class="text-sm text-neutral-400">The column identifier "{{ columnId }}" does not exist in this project.</p>
            <button @click="handleBack" class="btn btn-sm btn-outline border-neutral-700 text-neutral-300">
              Return to Project
            </button>
          </div>

          <!-- Form Content -->
          <div v-else class="space-y-8">

            <!-- Title & Hero Status Card -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div 
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                  :style="{ backgroundColor: `${formData.color}22`, border: `2px solid ${formData.color}` }"
                >
                  <span>⚙️</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold text-white tracking-tight">{{ formData.name || 'Untitled Column' }}</h1>
                    <span v-if="column.isSystem" class="badge badge-neutral border-neutral-700 text-[10px] uppercase font-mono py-1">
                      System
                    </span>
                  </div>
                  <p class="text-xs text-neutral-400 font-mono mt-0.5">
                    ID: <span class="text-neutral-300">{{ column.id }}</span>
                  </p>
                </div>
              </div>

              <!-- Quick Live Preview Strip -->
              <div class="bg-[#121214] border border-neutral-800 rounded-lg p-3 shrink-0 flex flex-col gap-1.5 w-full md:w-64">
                <span class="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Table Header Preview</span>
                <div class="bg-[#242427] border border-neutral-700 rounded px-2.5 py-1.5 flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: formData.color }"></span>
                    <span class="text-xs font-mono font-bold truncate text-neutral-200">{{ formData.name || 'Column' }}</span>
                  </div>
                  <div class="text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 1: General Information -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 space-y-6">
              <div class="border-b border-neutral-800 pb-3">
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  General Information
                </h2>
                <p class="text-xs text-neutral-400">Define the column name, placeholder, and cell content behavior.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Column Name -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Column Display Name
                  </label>
                  <input 
                    type="text" 
                    v-model="formData.name" 
                    placeholder="e.g. Literary Script, Sound, VFX" 
                    class="input input-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  />
                </div>

                <!-- Cell Empty Placeholder -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Cell Empty Placeholder
                  </label>
                  <input 
                    type="text" 
                    v-model="formData.placeholder" 
                    placeholder="e.g. Write script action or ask AI assistant..." 
                    class="input input-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  />
                </div>

                <!-- Cell Content Type -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Cell Content Type
                  </label>
                  <select 
                    v-model="formData.cellType" 
                    class="select select-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  >
                    <option v-for="t in cellTypes" :key="t.id" :value="t.id">
                      {{ t.label }} ({{ t.desc }})
                    </option>
                  </select>
                </div>

                <!-- Currency Code (if currency type) -->
                <div v-if="formData.cellType === 'number'" class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Currency Code
                  </label>
                  <select 
                    v-model="formData.currencyCode" 
                    class="select select-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="MXN">MXN ($)</option>
                  </select>
                </div>

                <!-- Column Width -->
                <div v-else class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Column Width (px)
                  </label>
                  <input 
                    type="text" 
                    v-model="formData.width" 
                    placeholder="e.g. 220px" 
                    class="input input-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Description & Department Notes
                </label>
                <textarea 
                  v-model="formData.description" 
                  rows="3" 
                  placeholder="Describe what information this department/column tracks during the breakdown..." 
                  class="textarea textarea-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500 leading-relaxed"
                ></textarea>
              </div>

              <!-- Color & Identification (Moved) -->
              <div class="space-y-4 pt-4 border-t border-neutral-800">
                <div class="pb-1">
                  <h3 class="text-sm font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                    Color & Identification
                  </h3>
                  <p class="text-xs text-neutral-400">Choose a distinct color marker to easily spot this column in the breakdown table.</p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <button
                    v-for="c in presetColors"
                    :key="c"
                    type="button"
                    @click="formData.color = c"
                    class="w-9 h-9 rounded-lg transition-transform flex items-center justify-center shadow-md relative"
                    :style="{ backgroundColor: c }"
                    :class="formData.color === c ? 'scale-110 ring-2 ring-white' : 'opacity-80 hover:opacity-100 hover:scale-105'"
                  >
                    <svg v-if="formData.color === c" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-black drop-shadow"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>

                  <!-- Custom Hex Input -->
                  <div class="flex items-center gap-2 ml-auto">
                    <span class="text-xs font-mono text-neutral-400">Custom:</span>
                    <input 
                      type="text" 
                      v-model="formData.color" 
                      class="input input-sm input-bordered w-28 bg-[#121214] border-neutral-700 font-mono text-xs text-white" 
                      placeholder="#3b82f6"
                    />
                    <input 
                      type="color" 
                      v-model="formData.color" 
                      class="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: AI Assistant & Automation -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 space-y-6">
              <div class="border-b border-neutral-800 pb-3">
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  AI Assistant & Automation
                </h2>
                <p class="text-xs text-neutral-400">Configure default instructions used by the AI assistant when generating content for this column.</p>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Default Prompt / System Context for Generation
                  </label>
                  <textarea 
                    v-model="formData.defaultPrompt" 
                    rows="3" 
                    placeholder="e.g. Generate realistic lighting setups with key, fill, and rim light values for cinema production." 
                    class="textarea textarea-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-purple-500 font-mono leading-relaxed"
                  ></textarea>
                </div>
              </div>
            </div>



            <!-- Bottom Actions -->
            <div class="flex items-center justify-between pt-4">
              <button 
                type="button" 
                @click="handleBack"
                class="btn btn-outline border-neutral-700 text-neutral-300 hover:text-white"
              >
                Back to Previous View
              </button>

              <button 
                type="button" 
                @click="handleSave"
                class="btn btn-error text-white font-semibold px-8 shadow-xl shadow-rose-950/50"
              >
                Save Column Settings
              </button>
            </div>

          </div>

        </div>
      </div>
    </main>
  </div>
</template>
