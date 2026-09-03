<script setup lang="ts">
import { reactive, ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  layout: false
});

const route = useRoute();
const router = useRouter();

const projectId = computed(() => (route.params.id as string) || '1');
const sceneId = computed(() => (route.params.sceneId as string) || '');

const { project, scenes, editScene, removeScene, loadProject } = useProjectBreakdown();
const { fetchScene } = useSceneData();

const scene = computed(() => scenes.value.find(s => s.id === sceneId.value));

onMounted(async () => {
  if (!project.value || project.value.id !== projectId.value || scenes.value.length === 0) {
    await loadProject(projectId.value);
  }
});

const formData = reactive({
  order: 1,
  synopsis: ''
});

const isSubmitting = ref(false);
const showToast = ref(false);

watchEffect(() => {
  if (scene.value) {
    formData.order = scene.value.order || 1;
    formData.synopsis = scene.value.synopsis || '';
  }
});

const handleBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back();
  } else {
    navigateTo(`/projects/${projectId.value}`);
  }
};

const handleSave = async () => {
  if (isSubmitting.value || !scene.value) return;
  isSubmitting.value = true;
  
  try {
    await editScene(sceneId.value, {
      order: formData.order,
      synopsis: formData.synopsis
    });
    
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2500);
  } catch (err: any) {
    console.error('Failed to save scene:', err);
    alert('Failed to save scene. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  if (!scene.value) return;

  if (confirm(`Are you sure you want to delete scene ${scene.value.order}? This action cannot be undone.`)) {
    try {
      await removeScene(sceneId.value);
      navigateTo(`/projects/${projectId.value}`);
    } catch (error) {
      alert('Failed to delete scene. Please try again.');
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

      <!-- Edit Scene Main Content -->
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
                <span class="text-white font-semibold">{{ scene ? `Scene ${scene.order}` : 'Not Found' }}</span>
              </div>
            </div>

            <!-- Action Buttons in Top Bar -->
            <div class="flex items-center gap-2">
              <button 
                v-if="scene"
                type="button" 
                @click="handleDelete" 
                class="btn btn-sm btn-ghost text-red-400 hover:bg-red-950/40 hover:text-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                Delete
              </button>
              
              <button 
                v-if="scene"
                type="button" 
                @click="handleSave"
                class="btn btn-sm btn-error text-white font-semibold px-5 shadow-lg shadow-rose-950/40 flex items-center gap-1.5"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Changes
              </button>
            </div>
          </div>

          <!-- Toast Notification -->
          <div v-if="showToast" class="alert alert-success bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm py-2.5 px-4 shadow-lg transition-all flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Scene updated successfully</span>
            </div>
            <button @click="showToast = false" class="text-xs text-emerald-400 hover:text-white">✕</button>
          </div>

          <!-- Not Found State -->
          <div v-if="!scene" class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-12 text-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <h2 class="text-xl font-bold text-white">Scene not found</h2>
            <p class="text-sm text-neutral-400">The scene identifier "{{ sceneId }}" does not exist in this project.</p>
            <button @click="handleBack" class="btn btn-sm btn-outline border-neutral-700 text-neutral-300">
              Return to Project
            </button>
          </div>

          <!-- Form Content -->
          <div v-else class="space-y-8">
            <!-- Title Card -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner bg-rose-500/20 border-2 border-rose-500">
                <span>🎬</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white tracking-tight">Edit Scene {{ scene.order }}</h1>
                <p class="text-xs text-neutral-400 mt-0.5">
                  Update scene information and order.
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
                Back
              </button>

              <button 
                type="button" 
                @click="handleSave"
                class="btn btn-error text-white font-semibold px-8 shadow-xl shadow-rose-950/50"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
                Save Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
