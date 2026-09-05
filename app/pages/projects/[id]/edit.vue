<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  layout: false
});

const route = useRoute();
const router = useRouter();

const projectId = computed(() => (route.params.id as string) || '1');

const { project, loadProject, editProject, isLoading: isProjectLoading } = useProjectBreakdown();

const formData = reactive({
  name: '',
  type: 'feature',
  genre: 'thriller',
  status: 'draft',
  description: '',
  coverImage: ''
});

const isSubmitting = ref(false);
const errorMessage = ref('');

const populateForm = () => {
  if (project.value) {
    formData.name = project.value.name || project.value.title || '';
    formData.type = (project.value.type as string) || 'feature';
    formData.genre = project.value.genre || 'thriller';
    formData.status = (project.value.status as string) || 'draft';
    formData.description = project.value.description || project.value.logline || '';
    formData.coverImage = project.value.coverImage || '';
  }
};

onMounted(async () => {
  if (!project.value || project.value.id !== projectId.value) {
    await loadProject(projectId.value);
  }
  populateForm();
});

// Watch in case project finishes loading after mount
watch(project, (newProj) => {
  if (newProj && !formData.name) {
    populateForm();
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
  if (!formData.name.trim()) {
    errorMessage.value = 'Project title is required.';
    return;
  }

  if (isSubmitting.value) return;
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await editProject(projectId.value, {
      name: formData.name.trim(),
      title: formData.name.trim(),
      type: formData.type,
      genre: formData.genre,
      status: formData.status as any,
      description: formData.description.trim(),
      logline: formData.description.trim(),
      coverImage: formData.coverImage.trim() || undefined
    });

    await navigateTo(`/projects/${projectId.value}`);
  } catch (err: any) {
    console.error('Failed to update project:', err);
    errorMessage.value = err?.data?.message || err?.message || 'Failed to update project. Please try again.';
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

      <!-- Edit Project Main Content -->
      <div class="flex-1 overflow-y-auto bg-[#121214] text-white p-6 md:p-10">
        <div class="max-w-3xl mx-auto space-y-8 pb-16">
          
          <!-- Top Navigation & Breadcrumbs Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div class="flex items-center gap-3">
              <button 
                type="button"
                @click="handleBack"
                class="btn btn-sm btn-outline border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white flex items-center gap-1.5 px-3"
                title="Return to project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                <span>Back</span>
              </button>

              <div class="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <NuxtLink to="/" class="hover:text-white transition-colors">Projects</NuxtLink>
                <span>/</span>
                <NuxtLink :to="`/projects/${projectId}`" class="hover:text-white transition-colors truncate max-w-[200px]">
                  {{ project?.name || 'Project' }}
                </NuxtLink>
                <span>/</span>
                <span class="text-white font-semibold">Edit</span>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="isProjectLoading && !project" class="flex justify-center items-center py-20">
            <span class="loading loading-spinner loading-lg text-rose-500"></span>
          </div>

          <!-- Form Content -->
          <form v-else @submit.prevent="handleSave" class="space-y-8">
            <!-- Header Card -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner bg-rose-500/20 border-2 border-rose-500 text-rose-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white tracking-tight">Edit Project Details</h1>
                <p class="text-xs text-neutral-400 mt-0.5">
                  Update production metadata, format, genre, and overview.
                </p>
              </div>
            </div>

            <!-- Error alert -->
            <div v-if="errorMessage" class="alert alert-error bg-red-950/60 border-red-800 text-red-200 text-sm py-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Details Section -->
            <div class="bg-[#1a1a1e] border border-neutral-800 rounded-xl p-6 space-y-6">
              <!-- Project Name / Title -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Project Title <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  v-model="formData.name" 
                  placeholder="e.g. Untitled Thriller" 
                  required
                  class="input input-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                />
              </div>

              <!-- Format, Genre & Status Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <!-- Production Type -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Production Type
                  </label>
                  <select 
                    v-model="formData.type" 
                    class="select select-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  >
                    <option value="feature">Feature Film</option>
                    <option value="series">Series</option>
                    <option value="short">Short Film</option>
                    <option value="documentary">Documentary</option>
                    <option value="commercial">Commercial</option>
                    <option value="music_video">Music Video</option>
                    <option value="animation">Animation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <!-- Genre -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Primary Genre
                  </label>
                  <select 
                    v-model="formData.genre" 
                    class="select select-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  >
                    <option value="thriller">Thriller</option>
                    <option value="scifi">Sci-Fi</option>
                    <option value="drama">Drama</option>
                    <option value="comedy">Comedy</option>
                    <option value="horror">Horror</option>
                    <option value="action">Action</option>
                    <option value="adventure">Adventure</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="documentary">Documentary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <!-- Status -->
                <div class="space-y-2">
                  <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Status
                  </label>
                  <select 
                    v-model="formData.status" 
                    class="select select-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="breakdown_review">Breakdown Review</option>
                    <option value="pre_production">Pre-Production</option>
                    <option value="production">Production</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <!-- Cover Image URL -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Cover Image URL
                </label>
                <input 
                  type="url" 
                  v-model="formData.coverImage" 
                  placeholder="https://images.unsplash.com/..." 
                  class="input input-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500"
                />
                <!-- Preview Thumbnail if url exists -->
                <div v-if="formData.coverImage" class="mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-neutral-800">
                  <img 
                    :src="formData.coverImage" 
                    alt="Cover preview" 
                    class="w-full h-full object-cover filter brightness-75"
                    @error="() => {}"
                  />
                  <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-neutral-300 font-mono">
                    Preview
                  </div>
                </div>
              </div>

              <!-- Logline / Synopsis -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Original Story / Logline
                </label>
                <textarea 
                  v-model="formData.description" 
                  rows="4" 
                  placeholder="Briefly describe the premise, logline, or project summary..."
                  class="textarea textarea-bordered w-full bg-[#121214] border-neutral-700 text-white text-sm focus:border-rose-500 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Action Buttons Footer -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button 
                type="button" 
                @click="handleBack" 
                :disabled="isSubmitting"
                class="btn btn-sm btn-ghost text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="btn btn-sm btn-error text-white font-semibold flex items-center gap-2 px-5 shadow-lg shadow-rose-950/40"
              >
                <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>Save Changes</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </main>
  </div>
</template>
