import { useProjectData } from './useProjectData';
import { useSceneData } from './useSceneData';
import type { Project } from '~~/shared/types/project';
import type { Scene } from '~~/shared/types/scene';

export const useProjectBreakdown = () => {
  const { fetchProject, updateProject, deleteProject } = useProjectData();
  const { fetchScenes, createScene, updateScene, deleteScene } = useSceneData();

  // Shared state using useState for SSR safety
  const project = useState<Project | null>('active_project', () => null);
  const error = useState<string | null>('active_project_error', () => null);
  const isLoading = useState<boolean>('active_project_loading', () => false);

  const scenes = useState<Scene[]>('project_scenes', () => []);
  const activeSceneId = useState<string>('active_scene_id', () => '');

  // Computed state
  const activeScene = computed(() => scenes.value.find(s => s.id === activeSceneId.value));

  // Actions
  const loadProject = async (id: string) => {
    error.value = null;
    isLoading.value = true;
    try {
      const fetchedProject = await fetchProject(id);
      if (fetchedProject) {
        project.value = fetchedProject;
        
        // Load scenes for this project
        const fetchedScenes = await fetchScenes(id);
        scenes.value = fetchedScenes;
        
        // Set initial active scene if not set
        if (!activeSceneId.value && fetchedScenes.length > 0) {
          activeSceneId.value = fetchedScenes[0]?.id || '';
        }
      }
    } catch (err: any) {
      console.error('Failed to load project:', err);
      error.value = err.data?.message || err.message || 'Project not found.';
    } finally {
      isLoading.value = false;
    }
  };

  const updateScenesOrder = (newScenes: Scene[]) => {
    scenes.value = newScenes;
  };

  const addScene = async (projectId: string, data: Partial<Scene>) => {
    const newScene = await createScene(projectId, data);
    scenes.value = [...scenes.value, newScene];
    return newScene;
  };

  const editScene = async (sceneId: string, data: Partial<Scene>) => {
    const updatedScene = await updateScene(sceneId, data);
    scenes.value = scenes.value.map(s => s.id === sceneId ? updatedScene : s);
    return updatedScene;
  };

  const removeScene = async (sceneId: string) => {
    await deleteScene(sceneId);
    scenes.value = scenes.value.filter(s => s.id !== sceneId);
    if (activeSceneId.value === sceneId) {
      activeSceneId.value = scenes.value[0]?.id || '';
    }
  };

  const recalculateStats = async (projectId: string) => {
    isLoading.value = true;
    try {
      const updatedProject = await $fetch<Project>(`/api/projects/${projectId}/stats`, {
        method: 'PUT'
      });
      if (updatedProject && project.value) {
        project.value.stats = updatedProject.stats;
      }
      return updatedProject;
    } catch (err: any) {
      console.error('Failed to recalculate stats:', err);
      // Optional: Handle error presentation
    } finally {
      isLoading.value = false;
    }
  };

  const editProject = async (projectId: string, data: Partial<Project>) => {
    isLoading.value = true;
    try {
      const updated = await updateProject(projectId, data);
      if (project.value && project.value.id === projectId) {
        project.value = { ...project.value, ...updated };
      }
      return updated;
    } finally {
      isLoading.value = false;
    }
  };

  const removeProject = async (projectId: string) => {
    isLoading.value = true;
    try {
      await deleteProject(projectId);
      if (project.value?.id === projectId) {
        project.value = null;
        scenes.value = [];
        activeSceneId.value = '';
      }
    } finally {
      isLoading.value = false;
    }
  };

  return {
    project,
    scenes,
    activeSceneId,
    activeScene,
    error,
    isLoading,
    loadProject,
    updateScenesOrder,
    addScene,
    editScene,
    removeScene,
    recalculateStats,
    editProject,
    updateProject: editProject,
    removeProject,
    deleteProject: removeProject
  };
};

