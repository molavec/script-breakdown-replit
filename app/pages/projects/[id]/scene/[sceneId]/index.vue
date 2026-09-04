<script setup lang="ts">
import { onMounted, watch } from 'vue';

definePageMeta({
  layout: false
});

const route = useRoute();
const projectId = computed(() => (route.params.id as string) || '1');
const sceneIdParam = computed(() => (route.params.sceneId || route.params['scene-id']) as string);

const { activeSceneId, scenes, loadProject } = useProjectBreakdown();
const { loadTableData } = useSceneTable();

onMounted(async () => {
  await loadProject(projectId.value);
  await loadTableData(projectId.value, sceneIdParam.value);
  
  if (sceneIdParam.value) {
    const exists = scenes.value.some((s) => s.id === sceneIdParam.value);
    if (exists) {
      activeSceneId.value = sceneIdParam.value;
    }
  }
});

// Update data if route changes
watch(sceneIdParam, async (newSceneId) => {
  if (newSceneId) {
    await loadTableData(projectId.value, newSceneId);
    activeSceneId.value = newSceneId;
  }
});
</script>

<template>
  <div class="h-screen flex flex-col bg-[#141414] font-sans overflow-hidden">
    <!-- Header General (App) -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="flex-1 flex overflow-hidden relative">
      <!-- Sidebar -->
      <BreakdownSidebar />

      <!-- Table Section -->
      <div class="flex-1 relative overflow-hidden flex flex-col">
        <BreakdownDataView class="flex-1" />
      </div>

      <!-- Edit Cell Drawer (Absolute overlay over main) -->
      <BreakdownCellDrawer />
    </main>
  </div>
</template>
