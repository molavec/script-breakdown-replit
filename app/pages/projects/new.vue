<script setup lang="ts">
const form = ref({
  title: '',
  type: '',
  genre: '',
  description: ''
})

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
    <div class="bg-[#1c1c1c] border border-white/10 rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="p-8 pb-6 border-b border-white/10">
        <h2 class="text-3xl font-bold text-gray-50 tracking-tight mb-2">New Project</h2>
        <p class="text-gray-400 text-sm">Initialize a new production workspace.</p>
      </div>

      <!-- Form Body -->
      <div class="p-8 space-y-8">
        <!-- Project Title -->
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Title</label>
          <input 
            v-model="form.title"
            type="text" 
            placeholder="e.g. Untitled Thriller" 
            class="w-full bg-white text-black rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e51d3b] transition-all" 
          />
        </div>

        <!-- Type & Genre -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Production Type</label>
            <div class="relative">
              <select v-model="form.type" class="w-full bg-[#0a0a0a] border border-white/10 rounded-md px-4 py-3 text-white appearance-none focus:outline-none focus:border-white/30 transition-all">
                <option value="" disabled selected>Select format...</option>
                <option value="feature">Feature Film</option>
                <option value="series">Series</option>
                <option value="short">Short Film</option>
              </select>
              <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Genre</label>
            <div class="relative">
              <select v-model="form.genre" class="w-full bg-[#0a0a0a] border border-white/10 rounded-md px-4 py-3 text-white appearance-none focus:outline-none focus:border-white/30 transition-all">
                <option value="" disabled selected>Select genre...</option>
                <option value="thriller">Thriller</option>
                <option value="scifi">Sci-Fi</option>
                <option value="drama">Drama</option>
                <option value="comedy">Comedy</option>
              </select>
              <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Logline -->
        <div>
          <div class="flex justify-between items-end mb-2">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Original Story / Logline</label>
              <!-- <span class="text-xs text-gray-500 font-mono">Markdown supported</span> -->
          </div>
          <textarea 
            v-model="form.description"
            rows="4" 
            placeholder="Briefly describe the premise or paste initial scene ideas..." 
            class="w-full bg-[#0a0a0a] border border-white/10 rounded-md px-4 py-3 text-gray-300 focus:outline-none focus:border-white/30 resize-none transition-all placeholder:text-gray-600"
          ></textarea>
        </div>

        <!-- Poster Upload -->
        <!-- <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Poster / Cover Concept</label>
          <div class="border-2 border-dashed border-white/10 rounded-lg p-10 bg-[#0a0a0a] flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/30 transition-colors group">
            <div class="w-12 h-12 mb-4 text-gray-600 group-hover:text-gray-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <p class="text-lg font-medium text-white mb-1">Drag & Drop visual reference</p>
            <p class="text-sm text-gray-500">or click to browse (16:9 or 2.39:1 recommended)</p>
          </div>
        </div> -->
      </div>

      <!-- Footer Actions -->
      <div class="p-6 border-t border-white/10 flex justify-end items-center gap-4 bg-[#141414]/50">
        <NuxtLink to="/" class="px-6 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 transition-all uppercase tracking-wider">
          Cancel
        </NuxtLink>
        <button 
          @click="createProject" 
          :disabled="isLoading"
          class="bg-[#e51d3b] hover:bg-[#c91932] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors uppercase tracking-wider"
        >
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

