<script setup lang="ts">
import { useProjectData } from '~/composables/useProjectData'

const { fetchProjects } = useProjectData()
const {
  data: projects,
  error,
  refresh,
  status,
} = await useAsyncData('projects_list', () => fetchProjects())

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
  <main class="p-6 md:p-8 max-w-[1400px] mx-auto text-base-content">
    <!-- Section Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-4">
      <h2 class="text-3xl font-bold text-base-content tracking-tight">My Projects</h2>
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="relative flex-1 md:flex-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50 z-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects..."
            class="input input-bordered input-sm w-full md:w-72 bg-base-200 border-base-300 pl-10 text-base-content focus:border-primary"
          />
        </div>
        <NuxtLink to="/projects/new" class="btn btn-primary btn-sm flex items-center gap-2 shrink-0 shadow-lg shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </NuxtLink>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="error" role="alert" class="alert alert-error alert-soft sm:alert-horizontal">
      <div>
        <h3 class="font-semibold">Projects could not be loaded</h3>
        <p class="text-sm">Your projects are still safe. Please try the request again.</p>
      </div>
      <button class="btn btn-sm btn-error" type="button" @click="refresh()">
        Try again
      </button>
    </div>
    <div v-else-if="filteredProjects.length === 0 && searchQuery" class="card bg-base-200 rounded-box border border-base-300 text-center py-16">
      <p class="text-base-content/70 text-sm">No projects matching "{{ searchQuery }}".</p>
      <button @click="searchQuery = ''" class="btn btn-sm btn-ghost text-primary mt-3">Clear search</button>
    </div>
    <div v-else-if="projects?.length === 0" class="card bg-base-200 rounded-box border border-base-300 text-center py-16">
      <h3 class="font-semibold text-base-content">No projects yet</h3>
      <p class="text-base-content/70 text-sm mt-1">Create your first project to start breaking down a script.</p>
      <NuxtLink to="/projects/new" class="btn btn-sm btn-primary mt-4 mx-auto">Create a project</NuxtLink>
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
