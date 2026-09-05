import type { Shot } from '~~/shared/types/shot';

export const useShotData = () => {

  const fetchShots = async (sceneId: string): Promise<Shot[]> => {
    return await $fetch<Shot[]>(`/api/scenes/${sceneId}/shots`);
  };

  const createShot = async (sceneId: string, shotData: Partial<Shot>): Promise<Shot> => {
    return await $fetch<Shot>(`/api/scenes/${sceneId}/shots`, {
      method: 'POST',
      body: shotData
    });
  };

  const deleteShot = async (sceneId: string, shotId: string): Promise<void> => {
    return await $fetch<void>(`/api/scenes/${sceneId}/shots/${shotId}`, {
      method: 'DELETE'
    });
  };

  return { fetchShots, createShot, deleteShot };
};
