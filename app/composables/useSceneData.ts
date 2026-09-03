import type { Scene } from '~~/shared/types/scene';

export const useSceneData = () => {

  const fetchScenes = async (projectId: string): Promise<Scene[]> => {
    return await $fetch<Scene[]>(`/api/projects/${projectId}/scenes`);
  };

  const fetchScene = async (sceneId: string): Promise<Scene | undefined> => {
    return await $fetch<Scene>(`/api/scenes/${sceneId}`);
  };

  const createScene = async (projectId: string, data: Partial<Scene>): Promise<Scene> => {
    return await $fetch<Scene>(`/api/projects/${projectId}/scenes`, {
      method: 'POST',
      body: data
    });
  };

  const updateScene = async (sceneId: string, data: Partial<Scene>): Promise<Scene> => {
    return await $fetch<Scene>(`/api/scenes/${sceneId}`, {
      method: 'PUT',
      body: data
    });
  };

  const deleteScene = async (sceneId: string): Promise<void> => {
    await $fetch(`/api/scenes/${sceneId}`, {
      method: 'DELETE'
    });
  };

  return { fetchScenes, fetchScene, createScene, updateScene, deleteScene };
};
