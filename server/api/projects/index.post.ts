import { db } from '../../utils/db';
import { 
  projects, 
  breakdownColumns, 
  scenes, 
  shots, 
  breakdownCells 
} from '../../utils/schema';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);
  const { title, type, genre, description } = body;

  try {
    // 1. Create Project
    const newProject = await db.insert(projects).values({
      ownerUserId: user.id,
      name: title || 'Untitled Project',
      title: title || 'Untitled Project',
      type: type || 'feature',
      genre: genre || 'thriller',
      description: description || '',
      status: 'draft'
    }).returning();
    const projectId = newProject[0]?.id;
    if (!projectId) throw new Error('Failed to create project');

    // 2. Create Default Columns
    const columnsToInsert = [
      { id: `col_script_${projectId}`, projectId, name: 'Script', cellType: 'text' as const, order: 1, isSystem: true, color: '#f3f4f6', options: { width: 300 } },
      { id: `col_storyboard_${projectId}`, projectId, name: 'Storyboard', cellType: 'media' as const, order: 2, isSystem: true, color: '#06b6d4', options: { width: 250 } },
      { id: `col_camera_${projectId}`, projectId, name: 'Camera', cellType: 'text' as const, order: 3, isSystem: true, color: '#9ca3af', options: { width: 200 } },
      { id: `col_cast_${projectId}`, projectId, name: 'Cast', cellType: 'tags' as const, order: 4, isSystem: true, color: '#ef4444', options: { width: 200 } }, // Red
      { id: `col_props_${projectId}`, projectId, name: 'Props', cellType: 'tags' as const, order: 5, isSystem: true, color: '#a855f7', options: { width: 200 } }, // Purple
      { id: `col_makeup_${projectId}`, projectId, name: 'Make-up & Hair', cellType: 'tags' as const, order: 6, isSystem: true, color: '#ec4899', options: { width: 200 } }, // Pink
      { id: `col_sound_${projectId}`, projectId, name: 'Sound', cellType: 'text' as const, order: 7, isSystem: true, color: '#92400e', options: { width: 200 } }, // Brown
      { id: `col_vfx_${projectId}`, projectId, name: 'VFX', cellType: 'tags' as const, order: 8, isSystem: true, color: '#3b82f6', options: { width: 200 } }, // Blue
      { id: `col_budget_${projectId}`, projectId, name: 'Budget', cellType: 'number' as const, order: 9, isSystem: true, color: '#22c55e', options: { width: 150 } }, // Green
      { id: `col_notes_${projectId}`, projectId, name: 'Notes', cellType: 'text' as const, order: 10, isSystem: true, color: '#eab308', options: { width: 200 } }, // Yellow
    ];
    await db.insert(breakdownColumns).values(columnsToInsert);

    // 3. Create Sample Scene 1
    const newScene = await db.insert(scenes).values({
      projectId,
      order: 1,
      synopsis: 'Introduction to the main characters and the primary conflict.',
    }).returning();
    
    const sceneId = newScene[0]?.id;
    if (!sceneId) throw new Error('Failed to create scene');

    // 4. Create Sample Shots
    const newShots = await db.insert(shots).values([
      {
        sceneId,
        order: 1,
      },
      {
        sceneId,
        order: 2,
      }
    ]).returning();
    
    
    const shot1Id = newShots[0]?.id;
    const shot2Id = newShots[1]?.id;
    if (!shot1Id || !shot2Id) throw new Error('Failed to create shots');

    // 5. Create Sample Cells for the shots
    const cellsToInsert = [
      // Shot 1.1 Cells
      { id: `cell_${shot1Id}_script`, shotId: shot1Id, columnId: `col_script_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'The rain pours heavily on the neon-lit street. A figure stands under a flickering streetlight.' }] },
      { id: `cell_${shot1Id}_storyboard`, shotId: shot1Id, columnId: `col_storyboard_${projectId}`, blocks: [{ id: 'b1', type: 'image' as const, content: '/uploads/storyboard_shot_1_1.jpg' }] },
      { id: `cell_${shot1Id}_camera`, shotId: shot1Id, columnId: `col_camera_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'Wide Shot, 35mm lens, Crane down' }] },
      { id: `cell_${shot1Id}_cast`, shotId: shot1Id, columnId: `col_cast_${projectId}`, blocks: [{ id: 'b1', type: 'entity_tag' as const, content: 'UNKNOWN FIGURE' }] },
      { id: `cell_${shot1Id}_props`, shotId: shot1Id, columnId: `col_props_${projectId}`, blocks: [{ id: 'b1', type: 'entity_tag' as const, content: 'Streetlight, Puddles' }] },
      { id: `cell_${shot1Id}_makeup`, shotId: shot1Id, columnId: `col_makeup_${projectId}`, blocks: [{ id: 'b1', type: 'entity_tag' as const, content: 'Wet look, Rain drops' }] },
      { id: `cell_${shot1Id}_sound`, shotId: shot1Id, columnId: `col_sound_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'Heavy rain, Distant thunder, Neon hum' }] },
      { id: `cell_${shot1Id}_vfx`, shotId: shot1Id, columnId: `col_vfx_${projectId}`, blocks: [{ id: 'b1', type: 'entity_tag' as const, content: 'CG rain enhancement, Neon glow' }] },
      { id: `cell_${shot1Id}_budget`, shotId: shot1Id, columnId: `col_budget_${projectId}`, numericValue: 1500, blocks: [{ id: 'b1', type: 'text' as const, content: '1500' }] },
      { id: `cell_${shot1Id}_notes`, shotId: shot1Id, columnId: `col_notes_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'Need rain machines and extra lighting for the puddles.' }] },

      // Shot 1.2 Cells
      { id: `cell_${shot2Id}_script`, shotId: shot2Id, columnId: `col_script_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'The figure turns suddenly. It\'s SARAH, looking terrified. She breathes heavily, clutching a small box.' }] },
      { id: `cell_${shot2Id}_storyboard`, shotId: shot2Id, columnId: `col_storyboard_${projectId}`, blocks: [{ id: 'b1', type: 'image' as const, content: '/uploads/storyboard_shot_1_2.jpg' }] },
      { id: `cell_${shot2Id}_camera`, shotId: shot2Id, columnId: `col_camera_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'Close Up, 50mm lens, Handheld' }] },
      { id: `cell_${shot2Id}_cast`, shotId: shot2Id, columnId: `col_cast_${projectId}`, blocks: [{ id: 'b1', type: 'entity_tag' as const, content: 'SARAH' }] },
      { id: `cell_${shot2Id}_props`, shotId: shot2Id, columnId: `col_props_${projectId}`, blocks: [{ id: 'b1', type: 'entity_tag' as const, content: 'Small wooden box' }] },
      { id: `cell_${shot2Id}_makeup`, shotId: shot2Id, columnId: `col_makeup_${projectId}`, blocks: [{ id: 'b1', type: 'entity_tag' as const, content: 'Smudged eyeliner, Pale skin, Sweat' }] },
      { id: `cell_${shot2Id}_sound`, shotId: shot2Id, columnId: `col_sound_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'Heavy breathing, Heartbeat (SFX)' }] },
      { id: `cell_${shot2Id}_vfx`, shotId: shot2Id, columnId: `col_vfx_${projectId}`, blocks: [] },
      { id: `cell_${shot2Id}_budget`, shotId: shot2Id, columnId: `col_budget_${projectId}`, numericValue: 500, blocks: [{ id: 'b1', type: 'text' as const, content: '500' }] },
      { id: `cell_${shot2Id}_notes`, shotId: shot2Id, columnId: `col_notes_${projectId}`, blocks: [{ id: 'b1', type: 'text' as const, content: 'Make sure the box is visible but its contents remain hidden.' }] },
    ];

    
    await db.insert(breakdownCells).values(cellsToInsert);

    return newProject[0];
  } catch (error: any) {
    console.error('Error creating project:', error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create project',
      cause: error.message
    });
  }
});
