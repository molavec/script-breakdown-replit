<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  layout: false
});

const route = useRoute();
const router = useRouter();

const projectId = computed(() => (route.params.id as string) || '1');

const { project, addScene } = useProjectBreakdown();

const formData = reactive({
  order: 1,
  synopsis: ''
});

const isSubmitting = ref(false);

const handleBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back();
  } else {
    navigateTo(`/projects/${projectId.value}`);
  }
};

const handleCreate = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  
  try {
    const newScene = await addScene(projectId.value, {
      order: formData.order,
      synopsis: formData.synopsis
    });
    
    // Redirect to the newly created scene
    navigateTo(`/projects/${projectId.value}/scene/${newScene.id}`);
  } catch (err: any) {
    console.error('Failed to create scene:', err);
    alert('Failed to create scene. Please try again.');
  } finally {
    isSubmitting.value = false;
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

      <!-- Create Scene Main Content -->
      <div class="flex-1 overflow-y-auto bg-[#121214] text-white p-6 md:p-10">
        <div class="max-w-3xl mx-auto space-y-8 pb-16">
          
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
                <NuxtLink :to="`/projects/${projectId}`" class="hover:text-white transition-colors">{{ project?.name || 'Project' }}</NuxtLink>
                <span>/</span>
                <span class="text-neutral-500">Scenes</span>
                <span>/</span>
                <span class="text-white font-semibold">Create</span>
              </div>
            </div>
          </div>

          <!-- Form Content -->
          <div class="space-y-8">
            <!-- Title Card -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner bg-rose-500/20 border-2 border-rose-500">
                <span>🎬</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white tracking-tight">Create New Scene</h1>
                <p class="text-xs text-neutral-400 mt-0.5">
                  Add a new scene to your project breakdown.
                </p>
              </div>
            </div>

            <!-- Details Section -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Scene Order -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Scene Order
                  </label>
                  <input 
                    type="number" 
                    v-model="formData.order" 
                    placeholder="e.g. 1" 
                    class="input input-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  />
                  <span class="text-[10px] text-neutral-500 font-mono">Determines the order of the scene in the breakdown.</span>
                </div>
              </div>

              <!-- Synopsis -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Synopsis
                </label>
                <textarea 
                  v-model="formData.synopsis" 
                  rows="4" 
                  placeholder="Describe the action taking place in the scene..." 
                  class="textarea textarea-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500 leading-relaxed"
                ></textarea>
              </div>
            </div>

            <!-- Bottom Actions -->
            <div class="flex items-center justify-between pt-4">
              <button 
                type="button" 
                @click="handleBack"
                class="btn btn-outline border-neutral-700 text-neutral-300 hover:text-white"
                :disabled="isSubmitting"
              >
                Cancel
              </button>

              <button 
                type="button" 
                @click="handleCreate"
                class="btn btn-error text-white font-semibold px-8 shadow-xl shadow-rose-950/50"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
                Create Scene
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
