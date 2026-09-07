<script setup lang="ts">
import { onMounted } from 'vue';
import draggable from 'vuedraggable';
const route = useRoute();

definePageMeta({
  layout: false
});

const projectId = computed(() => (route.params.id as string) || '1');

const { project, scenes, activeSceneId, loadProject, error, isLoading, recalculateStats, removeProject } = useProjectBreakdown();
const { columns, addRow, addColumn, loadTableData, updateColumnsOrder } = useSceneTable();

// Ensure project data is loaded
onMounted(async () => {
  if (!project.value || project.value.id !== projectId.value || scenes.value.length === 0) {
    await loadProject(projectId.value);
  }
  
  if (columns.value.length === 0) {
    await loadTableData(projectId.value, currentActiveSceneId.value);
  }

  // Recalcular stats al cargar la vista
  await handleRecalculateStats();
});

// Escena inicial para el botón de desglose
const firstSceneId = computed(() => scenes.value[0]?.id || 's1');
const currentActiveSceneId = computed({
  get: () => {
    if (activeSceneId.value && scenes.value.some(s => s.id === activeSceneId.value)) {
      return activeSceneId.value;
    }
    return firstSceneId.value;
  },
  set: (val) => { activeSceneId.value = val; }
});
const activeSceneName = computed(() => scenes.value.find((s) => s.id === currentActiveSceneId.value)?.order || 1);

const isRecalculating = ref(false);
const handleRecalculateStats = async () => {
  if (projectId.value && !isRecalculating.value) {
    isRecalculating.value = true;
    await recalculateStats(projectId.value);
    isRecalculating.value = false;
  }
};

const formatType = (type?: string) => {
  if (!type) return 'Feature Film';
  const types: Record<string, string> = {
    feature: 'Feature Film',
    feature_film: 'Feature Film',
    series: 'Series',
    short: 'Short Film',
    short_film: 'Short Film',
    documentary: 'Documentary',
    commercial: 'Commercial',
    music_video: 'Music Video',
    animation: 'Animation',
    other: 'Other'
  };
  return types[type] || type.replace(/_/g, ' ');
};

const formatStatus = (status?: string) => {
  if (!status) return 'Draft';
  const statuses: Record<string, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    breakdown_review: 'Breakdown Review',
    pre_production: 'Pre-Production',
    production: 'Production',
    completed: 'Completed',
    archived: 'Archived'
  };
  return statuses[status] || status.replace(/_/g, ' ');
};

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case 'in_progress':
    case 'production':
      return 'badge-info';
    case 'completed':
      return 'badge-success';
    case 'breakdown_review':
    case 'pre_production':
      return 'badge-secondary';
    case 'archived':
      return 'badge-neutral';
    case 'draft':
    default:
      return 'badge-warning';
  }
};

// Project deletion logic
const deleteModalRef = ref<HTMLDialogElement | null>(null);
const isDeleting = ref(false);

const openDeleteModal = () => {
  deleteModalRef.value?.showModal();
};

const closeDeleteModal = () => {
  deleteModalRef.value?.close();
};

const handleDeleteProject = async () => {
  if (!projectId.value || isDeleting.value) return;
  isDeleting.value = true;
  try {
    await removeProject(projectId.value);
    closeDeleteModal();
    await navigateTo('/');
  } catch (err: any) {
    console.error('Failed to delete project:', err);
    alert(err?.data?.message || err?.message || 'Failed to delete project. Please try again.');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div class="h-screen flex flex-col bg-base-100 text-base-content font-sans overflow-hidden">
    <!-- Header General (App) -->
    <AppHeader />

    <!-- Main Content Area with Sidebar -->
    <main v-if="project" class="flex-1 flex overflow-hidden relative">
      <!-- Sidebar -->
      <BreakdownSidebar />

      <!-- Project Details Content -->
      <div class="flex-1 overflow-y-auto bg-base-100 text-base-content p-6 md:p-10">
        <div class="max-w-6xl mx-auto space-y-8 pb-12">
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 text-xs font-mono text-base-content/60 truncate">
            <NuxtLink to="/" class="hover:text-primary transition-colors">Projects</NuxtLink>
            <span>/</span>
            <span class="text-base-content font-medium truncate">{{ project.name }}</span>
          </div>

          <!-- Hero Banner / Project Overview Card -->
          <div class="card bg-base-200 border border-base-300 rounded-box overflow-hidden shadow-2xl relative">
            <div class="h-60 md:h-72 w-full relative overflow-hidden">
              <img 
                :src="project.coverImage || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200&auto=format&fit=crop'" 
                alt="Project Cover" 
                class="w-full h-full object-cover object-center filter brightness-60"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-base-200 via-base-200/60 to-transparent"></div>
              
              <!-- Badges on top -->
              <div class="absolute top-6 left-6 flex items-center gap-3">
                <span class="badge badge-warning font-semibold text-xs py-2 px-3">
                  {{ formatStatus(project.status) }}
                </span>
                <span class="badge badge-neutral border-base-300 bg-base-100/70 backdrop-blur-md text-xs py-2 px-3 text-base-content/80 font-mono">
                  {{ formatType(project.type) }} • {{ project.genre }}
                </span>
              </div>
            </div>

            <!-- Project Hero Body -->
            <div class="p-8 -mt-20 relative z-10 space-y-6">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div class="space-y-4 max-w-3xl">
                  <h1 class="text-4xl md:text-5xl font-black tracking-tight text-base-content">
                    {{ project.name }}
                  </h1>

                  <!-- Metadata Strip: Production Type, Primary Genre, Status -->
                  <div class="flex flex-wrap items-center gap-2.5 text-xs">
                    <!-- Production Type -->
                    <div class="inline-flex items-center gap-2 bg-base-100/90 border border-base-300 px-3 py-1.5 rounded-box shadow-sm">
                      <span class="text-base-content/60 font-medium uppercase tracking-wider text-[10px]">Production Type</span>
                      <span class="text-base-content font-semibold capitalize">{{ formatType(project.type) }}</span>
                    </div>

                    <!-- Primary Genre -->
                    <div class="inline-flex items-center gap-2 bg-base-100/90 border border-base-300 px-3 py-1.5 rounded-box shadow-sm">
                      <span class="text-base-content/60 font-medium uppercase tracking-wider text-[10px]">Primary Genre</span>
                      <span class="text-base-content font-semibold capitalize">{{ project.genre || 'Unspecified' }}</span>
                    </div>

                    <!-- Status -->
                    <div class="inline-flex items-center gap-2 bg-base-100/90 border border-base-300 px-3 py-1.5 rounded-box shadow-sm">
                      <span class="text-base-content/60 font-medium uppercase tracking-wider text-[10px]">Status</span>
                      <span class="badge badge-sm font-semibold capitalize" :class="statusBadgeClass(project.status)">
                        {{ formatStatus(project.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Original Story / Logline -->
                  <div class="pt-1">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-base-content/60 block mb-1">
                      Original Story / Logline
                    </span>
                    <p v-if="project.logline || project.description" class="text-base-content/80 text-sm md:text-base leading-relaxed">
                      {{ project.logline || project.description }}
                    </p>
                    <p v-else class="text-base-content/50 text-xs italic">
                      No logline or synopsis added yet.
                    </p>
                  </div>
                </div>

                <!-- Quick Action Breakdown Link -->
                <div class="flex items-center gap-3 shrink-0 pt-1">
                  <NuxtLink 
                    :to="`/projects/${projectId}/edit`"
                    class="btn btn-outline border-base-300 bg-base-100 hover:bg-base-300 text-base-content font-medium px-4 shadow-sm flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    <span>Edit Project</span>
                  </NuxtLink>

                  <NuxtLink 
                    :to="`/projects/${projectId}/scene/${currentActiveSceneId}`"
                    class="btn btn-primary text-primary-content font-semibold px-6 shadow-md"
                  >
                    Go to Scene {{ activeSceneName }}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </NuxtLink>
                </div>
              </div>

              <!-- KPI Stats Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-base-300">
                <div class="bg-base-100 p-4 rounded-box border border-base-300">
                  <span class="text-xs text-base-content/60 font-mono uppercase tracking-wider block mb-1">Total Scenes</span>
                  <span class="text-2xl font-bold text-base-content">{{ scenes.length }}</span>
                </div>
                <div class="bg-base-100 p-4 rounded-box border border-base-300 relative group">
                  <span class="text-xs text-base-content/60 font-mono uppercase tracking-wider block mb-1">Total Shots</span>
                  <span class="text-2xl font-bold text-base-content">{{ project.stats?.totalShots || '0' }}</span>
                  <button 
                    @click="handleRecalculateStats" 
                    :disabled="isRecalculating"
                    class="group/btn absolute top-2 right-2 btn btn-xs btn-ghost btn-square text-base-content/60 hover:text-base-content hover:bg-base-300 opacity-0 group-hover:opacity-100 transition-all" 
                    title="Recalculate Stats"
                  >
                    <svg v-if="!isRecalculating" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover/btn:rotate-180">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    <span v-else class="loading loading-spinner loading-xs text-primary"></span>
                  </button>
                </div>
                <div class="bg-base-100 p-4 rounded-box border border-base-300 relative group">
                  <span class="text-xs text-base-content/60 font-mono uppercase tracking-wider block mb-1">Estimated Budget</span>
                  <span class="text-2xl font-bold text-success">${{ project.stats?.totalEstimatedBudget?.toLocaleString() || '0' }}</span>
                  <button 
                    @click="handleRecalculateStats" 
                    :disabled="isRecalculating"
                    class="group/btn absolute top-2 right-2 btn btn-xs btn-ghost btn-square text-base-content/60 hover:text-base-content hover:bg-base-300 opacity-0 group-hover:opacity-100 transition-all" 
                    title="Recalculate Stats"
                  >
                    <svg v-if="!isRecalculating" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover/btn:rotate-180">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    <span v-else class="loading loading-spinner loading-xs text-success"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Scenes Breakdown Grid Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-base-content">Project Scenes</h2>
                <p class="text-xs text-base-content/60">Select any scene to view and edit its technical breakdown table.</p>
              </div>
              <NuxtLink :to="`/projects/${projectId}/scenes/create`" class="btn btn-sm btn-outline border-base-300 text-base-content hover:bg-base-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Scene
              </NuxtLink>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="scene in scenes" 
                :key="scene.id"
                class="card bg-base-200 border border-base-300 hover:border-primary/40 rounded-box p-5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="font-mono text-xs text-base-content/70 bg-base-300 px-2 py-1 rounded">
                      SCENE {{ scene.order || scene.id }}
                    </span>
                    <div class="flex items-center gap-2">
                      <span v-if="scene.id === currentActiveSceneId" class="badge badge-xs badge-primary text-[10px]">
                        Active
                      </span>
                      <NuxtLink 
                        :to="`/projects/${projectId}/scenes/${scene.id}`"
                        class="btn btn-xs btn-ghost btn-square text-base-content/60 hover:text-base-content hover:bg-base-300 transition-colors"
                        title="Configure Scene"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </NuxtLink>
                    </div>
                  </div>
                  <p class="text-xs text-base-content/70 font-mono tracking-wider mb-4 line-clamp-2">
                    {{ scene.synopsis || 'No synopsis available.' }}
                  </p>
                </div>

                <div class="pt-4 border-t border-base-300 flex items-center justify-between mt-auto">
                  <span class="text-xs text-base-content/50 font-mono">
                    {{ scene.id === 's4' ? '3 Shots Breakdown' : 'Breakdown Ready' }}
                  </span>
                  <NuxtLink 
                    :to="`/projects/${projectId}/scene/${scene.id}`"
                    class="btn btn-xs btn-outline border-base-300 text-base-content/80 hover:text-base-content hover:bg-base-300"
                    @click="currentActiveSceneId = scene.id"
                  >
                    Open Table
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Breakdown Columns Configuration Section -->
          <div class="space-y-4 pt-4 border-t border-base-300">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-base-content">Breakdown Columns</h2>
                <p class="text-xs text-base-content/60">Configure columns for this project.</p>
              </div>
              <button class="btn btn-sm btn-outline border-base-300 text-base-content hover:bg-base-300" @click="addColumn()">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Column
              </button>
            </div>

            <draggable 
              v-model="columns" 
              tag="div"
              class="flex flex-col gap-2.5"
              item-key="id"
              handle=".card-drag-handle"
              ghost-class="opacity-40"
              @end="updateColumnsOrder(projectId, columns)"
            >
              <template #item="{ element: col }">
                <div 
                  class="card bg-base-200 border border-base-300 hover:border-primary/40 rounded-box px-4 py-3 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <!-- Left: Drag Handle, Color Indicator, Name & Description -->
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      class="card-drag-handle cursor-grab active:cursor-grabbing text-base-content/50 hover:text-base-content p-1 -ml-1 rounded transition-colors shrink-0" 
                      title="Drag to reorder"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="12" r="1"></circle>
                        <circle cx="9" cy="5" r="1"></circle>
                        <circle cx="9" cy="19" r="1"></circle>
                        <circle cx="15" cy="12" r="1"></circle>
                        <circle cx="15" cy="5" r="1"></circle>
                        <circle cx="15" cy="19" r="1"></circle>
                      </svg>
                    </div>

                    <span 
                      class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                      :style="{ backgroundColor: col.color || '#3b82f6' }"
                    ></span>

                    <div class="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
                      <h3 class="text-sm font-semibold text-base-content group-hover:text-primary transition-colors shrink-0">
                        {{ col.name }}
                      </h3>
                      <span class="hidden md:inline text-base-content/30 text-xs">•</span>
                      <p class="text-xs text-base-content/60 truncate flex-1" :title="col.description">
                        {{ col.description || 'No description configured.' }}
                      </p>
                    </div>
                  </div>

                  <!-- Right: Badges & Settings Action -->
                  <div class="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-8 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-base-300">
                    <div class="flex items-center gap-1.5">
                      <span class="badge badge-sm badge-neutral border-base-300 text-[10px] uppercase font-mono text-base-content/80">
                        {{ col.cellType || 'text' }}
                      </span>
                      <span v-if="col.isSystem" class="badge badge-sm font-mono text-[10px] uppercase text-base-content/70 bg-base-300 border-base-300">
                        System
                      </span>
                      <span v-else class="badge badge-sm font-mono text-[10px] uppercase text-base-content/50 bg-base-100 border-base-300">
                        Custom
                      </span>
                    </div>

                    <NuxtLink 
                      :to="`/projects/${projectId}/columns/${col.id}`"
                      class="btn btn-xs btn-outline border-base-300 text-base-content/80 hover:text-base-content hover:bg-base-300 flex items-center gap-1 shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Settings
                    </NuxtLink>
                  </div>
                </div>
              </template>
            </draggable>
          </div>

          <!-- Danger Zone Section -->
          <div class="pt-6 border-t border-base-300">
            <div class="card bg-error/10 border border-error/30 rounded-box p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base font-bold text-error flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Danger Zone
                </h3>
                <p class="text-xs text-base-content/70 mt-1">
                  Permanently delete this project and all of its scenes, shots, and breakdown columns. This action cannot be undone.
                </p>
              </div>
              <button 
                type="button"
                @click="openDeleteModal" 
                class="btn btn-sm btn-outline btn-error shrink-0 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    <main v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-6 bg-base-100 text-center p-6 text-base-content">
      <div class="text-error opacity-80">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h2 class="text-3xl font-bold text-base-content mb-2">Project Not Found</h2>
      </div>
      <NuxtLink to="/" class="btn btn-outline border-base-300 mt-4 text-base-content">
        Return to Dashboard
      </NuxtLink>
    </main>
    <main v-else class="flex-1 flex items-center justify-center bg-base-100">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </main>

    <!-- Delete Project Confirmation Modal -->
    <dialog ref="deleteModalRef" class="modal">
      <div class="modal-box bg-base-200 border border-base-300 text-base-content max-w-md">
        <div class="flex items-center gap-3 text-error mb-4">
          <div class="w-10 h-10 rounded-full bg-error/10 border border-error/20 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-base-content">Delete Project</h3>
            <p class="text-xs text-base-content/60">This action cannot be undone.</p>
          </div>
        </div>

        <p class="text-sm text-base-content/80 mb-6 leading-relaxed">
          Are you sure you want to delete <strong class="text-base-content">"{{ project?.name }}"</strong>? 
          All associated scenes, shots, and breakdown columns will be permanently removed.
        </p>

        <div class="modal-action flex items-center justify-end gap-3 mt-6">
          <button 
            type="button" 
            class="btn btn-sm btn-ghost text-base-content/70 hover:text-base-content" 
            :disabled="isDeleting"
            @click="closeDeleteModal"
          >
            Cancel
          </button>
          <button 
            type="button" 
            @click="handleDeleteProject" 
            :disabled="isDeleting"
            class="btn btn-sm btn-error text-error-content font-semibold flex items-center gap-2 px-4 shadow-lg shadow-error/20"
          >
            <span v-if="isDeleting" class="loading loading-spinner loading-xs"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            <span>Delete Project</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button :disabled="isDeleting">close</button>
      </form>
    </dialog>
  </div>
</template>

