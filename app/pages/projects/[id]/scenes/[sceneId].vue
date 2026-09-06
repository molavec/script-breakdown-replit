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
  <div class="h-screen flex flex-col bg-base-100 text-base-content font-sans overflow-hidden">
    <!-- Header General (App) -->
    <AppHeader />

    <!-- Main Content Area with Sidebar -->
    <main class="flex-1 flex overflow-hidden relative">
      <!-- Sidebar -->
      <BreakdownSidebar />

      <!-- Edit Scene Main Content -->
      <div class="flex-1 overflow-y-auto bg-base-100 text-base-content p-6 md:p-10">
        <div class="max-w-3xl mx-auto space-y-8 pb-16">
          
          <!-- Top Navigation & Breadcrumbs Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
            <div class="flex items-center gap-3">
              <button 
                type="button"
                @click="handleBack"
                class="btn btn-sm btn-outline border-base-300 hover:bg-base-300 text-base-content flex items-center gap-1.5 px-3"
                title="Return to previous view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                <span>Back</span>
              </button>

              <div class="breadcrumbs text-xs font-mono text-base-content/60 p-0">
                <ul>
                  <li><NuxtLink to="/" class="hover:text-primary transition-colors">Projects</NuxtLink></li>
                  <li><NuxtLink :to="`/projects/${projectId}`" class="hover:text-primary transition-colors">{{ project?.name || 'Project' }}</NuxtLink></li>
                  <li class="text-base-content/50">Scenes</li>
                  <li class="text-base-content font-semibold">{{ scene ? `Scene ${scene.order}` : 'Not Found' }}</li>
                </ul>
              </div>
            </div>

            <!-- Action Buttons in Top Bar -->
            <div class="flex items-center gap-2">
              <button 
                v-if="scene"
                type="button" 
                @click="handleDelete" 
                class="btn btn-sm btn-ghost text-error hover:bg-error/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                Delete
              </button>
              
              <button 
                v-if="scene"
                type="button" 
                @click="handleSave"
                class="btn btn-sm btn-primary font-semibold px-5 shadow-lg shadow-primary/20 flex items-center gap-1.5"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Changes
              </button>
            </div>
          </div>

          <!-- Toast Notification -->
          <div v-if="showToast" class="alert alert-success text-sm py-2.5 px-4 shadow-lg flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Scene updated successfully</span>
            </div>
            <button @click="showToast = false" class="btn btn-ghost btn-xs">✕</button>
          </div>

          <!-- Not Found State -->
          <div v-if="!scene" class="card bg-base-200 border border-base-300 rounded-box p-12 text-center space-y-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center mx-auto text-base-content/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <h2 class="text-xl font-bold text-base-content">Scene not found</h2>
            <p class="text-sm text-base-content/60">The scene identifier "{{ sceneId }}" does not exist in this project.</p>
            <button @click="handleBack" class="btn btn-sm btn-outline border-base-300 text-base-content hover:bg-base-300">
              Return to Project
            </button>
          </div>

          <!-- Form Content -->
          <div v-else class="space-y-8">
            <!-- Title Card -->
            <div class="card bg-base-200 border border-base-300 rounded-box p-6 flex flex-row items-center gap-4 shadow-sm">
              <div class="w-12 h-12 rounded-box flex items-center justify-center text-xl shrink-0 bg-primary/10 border border-primary/20 text-primary">
                <span>🎬</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-base-content tracking-tight">Edit Scene {{ scene.order }}</h1>
                <p class="text-xs text-base-content/60 mt-0.5">
                  Update scene information and order.
                </p>
              </div>
            </div>

            <!-- Details Section -->
            <div class="card bg-base-200 border border-base-300 rounded-box p-6 space-y-6 shadow-sm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Scene Order -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-base-content/70 uppercase tracking-wider block">
                    Scene Order
                  </label>
                  <input 
                    type="number" 
                    v-model="formData.order" 
                    placeholder="e.g. 1" 
                    class="input input-bordered w-full bg-base-100 border-base-300 text-base-content text-sm focus:border-primary"
                  />
                  <span class="text-[10px] text-base-content/50 font-mono">Determines the order of the scene in the breakdown.</span>
                </div>
              </div>

              <!-- Synopsis -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-base-content/70 uppercase tracking-wider block">
                  Synopsis
                </label>
                <textarea 
                  v-model="formData.synopsis" 
                  rows="4" 
                  placeholder="Describe the action taking place in the scene..." 
                  class="textarea textarea-bordered w-full bg-base-100 border-base-300 text-base-content text-sm focus:border-primary leading-relaxed"
                ></textarea>
              </div>
            </div>

            <!-- Bottom Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-base-300">
              <button 
                type="button" 
                @click="handleBack"
                class="btn btn-outline border-base-300 text-base-content hover:bg-base-300"
                :disabled="isSubmitting"
              >
                Back
              </button>

              <button 
                type="button" 
                @click="handleSave"
                class="btn btn-primary font-semibold px-8 shadow-lg shadow-primary/20"
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
