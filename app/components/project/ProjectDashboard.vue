<script setup lang="ts">
import { useProjectData } from '~/composables/useProjectData'

const { fetchProjects } = useProjectData()
const { data: projects, status } = useAsyncData('projects_list', () => fetchProjects())

const searchQuery = ref('')

const filteredProjects = computed(() => {
  if (!projects.value) return []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return projects.value
  return projects.value.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.genre && p.genre.toLowerCase().includes(query)) ||
    (p.type && p.type.toLowerCase().includes(query)) ||
    (p.status && p.status.toLowerCase().includes(query))
  )
})
</script>

<template>
  <main class="p-6 md:p-8 max-w-[1400px] mx-auto">
    <!-- Section Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-4">
      <h2 class="text-3xl font-bold text-gray-50 tracking-tight">My Projects</h2>
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="relative flex-1 md:flex-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects..."
            class="w-full md:w-72 bg-[#0a0a0a] border border-white/10 rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all placeholder:text-gray-600"
          />
        </div>
        <NuxtLink to="/projects/new" class="bg-[#e51d3b] hover:bg-[#c91932] text-white px-5 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-rose-950/40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </NuxtLink>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-error"></span>
    </div>
    <div v-else-if="filteredProjects.length === 0 && searchQuery" class="text-center py-16 bg-[#16161a]/60 rounded-xl border border-white/5">
      <p class="text-neutral-400 text-sm">No projects matching "{{ searchQuery }}".</p>
      <button @click="searchQuery = ''" class="btn btn-sm btn-ghost text-rose-400 mt-3">Clear search</button>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :to="`/projects/${project.id}`"
        :title="project.name"
        :type="`${project.type || 'Project'} ${project.genre ? '- ' + project.genre : ''}`"
        :status="project.status"
        :image="project.coverImage || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop'"
        modifiedAt="Recently"
        :users="true"
      />

      <ProjectCardNew />
    </div>
  </main>
</template>
