<script setup lang="ts">
const form = ref({
  title: '',
  type: '',
  genre: '',
  description: ''
})

const productionTypes = [
  { value: 'feature', label: 'Feature Film' },
  { value: 'series', label: 'Series' },
  { value: 'short', label: 'Short Film' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'music_video', label: 'Music Video' },
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'social_reel', label: 'Social Media Reel / TikTok' },
  { value: 'podcast', label: 'Podcast / Vodcast' },
  { value: 'vlog', label: 'Vlog' },
  { value: 'other', label: 'Other' }
]

const genres = [
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'horror', label: 'Horror' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'scifi', label: 'Sci-Fi' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'western', label: 'Western' },
  { value: 'educational', label: 'Educational / Tutorial' },
  { value: 'review', label: 'Review / Unboxing' },
  { value: 'gaming', label: 'Gaming / Stream' },
  { value: 'variety', label: 'Entertainment / Variety' },
  { value: 'other', label: 'Other' }
]

const isLoading = ref(false)

const createProject = async () => {
  if (isLoading.value) return
  isLoading.value = true
  
  try {
    const project = await $fetch('/api/projects', {
      method: 'POST',
      body: form.value
    })
    
    if (project && project.id) {
      navigateTo(`/projects/${project.id}`)
    } else {
      console.error('Failed to get project ID back')
    }
  } catch (error) {
    console.error('Failed to create project:', error)
    // Handle error UI if needed
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="p-6 md:p-8 max-w-3xl mx-auto">
    <div class="card bg-base-200 border border-base-300 rounded-box shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="p-8 pb-6 border-b border-base-300">
        <h2 class="text-3xl font-bold text-base-content tracking-tight mb-2">New Project</h2>
        <p class="text-base-content/70 text-sm">Initialize a new production workspace.</p>
      </div>

      <!-- Form Body -->
      <div class="p-8 space-y-8">
        <!-- Project Title -->
        <div>
          <label class="block text-xs font-bold text-base-content/70 uppercase tracking-widest mb-2">Project Title</label>
          <input 
            v-model="form.title"
            type="text" 
            placeholder="e.g. Untitled Thriller" 
            class="input input-bordered w-full bg-base-100 text-base-content focus:border-primary" 
          />
        </div>

        <!-- Type & Genre -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-base-content/70 uppercase tracking-widest mb-2">Production Type</label>
            <select v-model="form.type" class="select select-bordered w-full bg-base-100 text-base-content focus:border-primary">
              <option value="" disabled selected>Select format...</option>
              <option v-for="type in productionTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-base-content/70 uppercase tracking-widest mb-2">Primary Genre</label>
            <select v-model="form.genre" class="select select-bordered w-full bg-base-100 text-base-content focus:border-primary">
              <option value="" disabled selected>Select genre...</option>
              <option v-for="genre in genres" :key="genre.value" :value="genre.value">
                {{ genre.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Logline -->
        <div>
          <label class="block text-xs font-bold text-base-content/70 uppercase tracking-widest mb-2">Original Story / Logline</label>
          <textarea 
            v-model="form.description"
            rows="4" 
            placeholder="Briefly describe the premise or paste initial scene ideas..." 
            class="textarea textarea-bordered w-full bg-base-100 text-base-content focus:border-primary resize-none placeholder:text-base-content/40"
          ></textarea>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 border-t border-base-300 flex justify-end items-center gap-4 bg-base-300/40">
        <NuxtLink to="/" class="btn btn-ghost text-base-content/70 hover:text-base-content uppercase tracking-wider">
          Cancel
        </NuxtLink>
        <button 
          @click="createProject" 
          :disabled="isLoading"
          class="btn btn-primary px-6 flex items-center gap-2 uppercase tracking-wider"
        >
          <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
          <span v-if="isLoading">Creating...</span>
          <template v-else>
            Create Project
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
          </template>
        </button>
      </div>
    </div>
  </main>
</template>

