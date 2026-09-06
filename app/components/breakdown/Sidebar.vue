<script setup lang="ts">
import draggable from 'vuedraggable';
import type { Scene } from '~~/shared/types/scene';

const route = useRoute();
const { project, scenes, activeSceneId, updateScenesOrder } = useProjectBreakdown();
const { addRow } = useSceneTable();
const { isOpen, close, isTabletOrMobile } = useSidebar();
const searchQuery = ref('');

const isProjectOverview = computed(() => {
  return !route.params.sceneId && !route.params['scene-id'];
});

const filteredScenes = computed({
  get: () => {
    if (!searchQuery.value) return scenes.value;
    const lowerQ = searchQuery.value.toLowerCase();
    return scenes.value.filter((s: Scene) => 
      s.synopsis?.toLowerCase().includes(lowerQ) || 
      s.id.toLowerCase().includes(lowerQ)
    );
  },
  set: (newScenes) => {
    if (!searchQuery.value) {
      updateScenesOrder(newScenes);
    }
  }
});

const handleSelectScene = (sceneId: string) => {
  activeSceneId.value = sceneId;
  if (isTabletOrMobile()) {
    close();
  }
  if (project.value) {
    navigateTo(`/projects/${project.value.id}/scene/${sceneId}`);
  }
};

const handleNavigateOverview = () => {
  if (isTabletOrMobile()) {
    close();
  }
};
</script>

<template>
  <div>
    <!-- Backdrop Overlay for Mobile / Tablet (< 1024px) -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        @click="close"
        aria-hidden="true"
      />
    </Transition>

    <!-- Sidebar Aside -->
    <aside 
      class="fixed inset-y-0 left-0 z-40 bg-base-200 text-base-content flex flex-col h-full transition-all duration-300 ease-in-out lg:static lg:z-auto shrink-0 overflow-hidden"
      :class="[
        // Mobile / Tablet: slide in/out overlay
        isOpen 
          ? 'translate-x-0 shadow-2xl lg:shadow-none' 
          : '-translate-x-full lg:translate-x-0',
        // Desktop: in-flow collapsible width
        isOpen 
          ? 'lg:w-64 lg:border-r border-base-300 lg:opacity-100' 
          : 'lg:w-0 lg:border-r-0 lg:opacity-0'
      ]"
    >
      <!-- Inner fixed-width container prevents contents squishing during transition -->
      <div class="w-64 h-full flex flex-col p-4 shrink-0 overflow-hidden">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <NuxtLink 
              to="/" 
              class="text-xs text-base-content/60 hover:text-base-content flex items-center gap-2 transition-colors"
              @click="handleNavigateOverview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Projects
            </NuxtLink>

            <!-- Close button for Mobile / Tablet screens -->
            <button 
              type="button" 
              class="lg:hidden text-base-content/60 hover:text-base-content p-1 rounded-md hover:bg-base-300 transition-colors"
              @click="close"
              aria-label="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="space-y-1.5" v-if="project">
            <h2 class="text-xl font-bold truncate px-1 text-base-content">{{ project.name }}</h2>
            <NuxtLink 
              :to="`/projects/${project.id}`" 
              class="text-xs flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors group"
              :class="isProjectOverview 
                ? 'bg-primary/10 text-primary font-semibold border border-primary/30' 
                : 'text-base-content/60 hover:text-primary hover:bg-base-300/50'"
              @click="handleNavigateOverview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Project Details</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-auto transition-transform group-hover:translate-x-0.5"><path d="m9 18 6-6-6-6"/></svg>
            </NuxtLink>
          </div>
          <div v-else class="h-10 flex items-center px-1">
             <span class="loading loading-spinner loading-sm text-base-content/50"></span>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-4">
          <label class="input input-sm input-bordered flex items-center gap-2 bg-base-100 border-base-300 text-sm focus-within:border-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
            <input type="text" class="grow bg-transparent text-base-content" placeholder="Search scenes..." v-model="searchQuery" />
          </label>
        </div>

        <!-- Add Scene -->
        <NuxtLink 
          v-if="project"
          :to="`/projects/${project.id}/scenes/create`" 
          class="btn btn-sm btn-primary w-full mb-6 shadow-sm"
          @click="isTabletOrMobile() ? close() : null"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Scene
        </NuxtLink>
        <button v-else class="btn btn-sm btn-primary w-full mb-6" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Scene
        </button>

        <!-- Scene List -->
        <div class="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
          <draggable 
            v-model="filteredScenes" 
            item-key="id" 
            handle=".drag-handle"
            ghost-class="opacity-50"
          >
            <template #item="{ element }">
              <BreakdownSceneItem 
                :scene="element" 
                :active="!isProjectOverview && activeSceneId === element.id"
                @select="handleSelectScene(element.id)"
                class="mb-1"
              />
            </template>
          </draggable>
        </div>
      </div>
    </aside>
  </div>
</template>
