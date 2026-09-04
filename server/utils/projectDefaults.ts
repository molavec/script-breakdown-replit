import { db } from './db';
import {
  breakdownColumns,
  scenes,
  shots,
  breakdownCells
} from './schema';

export async function createDefaultProjectData(projectId: string) {
  // 1. Create Default Columns
  const columnsToInsert = [
    {
      id: `col_script_${projectId}`,
      projectId,
      name: 'Script',
      cellType: 'text' as const,
      description: 'Literary Script',
      order: 1,
      isSystem: true,
      color: '#f3f4f6',
      options: {
        defaultPrompt: 'Write concise screenplay action lines and narrative descriptions for this shot.',
        width: 300,
      },
    },
    {
      id: `col_storyboard_${projectId}`,
      projectId,
      name: 'Storyboard',
      cellType: 'media' as const,
      description: 'Visual storyboard frame, framing reference, and composition.',
      order: 2,
      isSystem: true,
      color: '#06b6d4',
      options: {
        defaultPrompt: 'Purely visual storytelling. Absolutely no text, no words, no speech bubbles, no comic dialogs, no typography. Textless image.',
        width: 250,
      },
    },
    {
      id: `col_camera_${projectId}`,
      projectId,
      name: 'Camera',
      cellType: 'text' as const,
      description: 'Camera angle, shot size, lens, and camera movement specifications.',
      order: 3,
      isSystem: true,
      color: '#9ca3af',
      options: {
        defaultPrompt: 'Generate shot description',
        width: 200,
      },
    },
    {
      id: `col_cast_${projectId}`,
      projectId,
      name: 'Cast',
      cellType: 'tags' as const,
      description: 'Characters, actors, and background extras featured in the shot.',
      order: 4,
      isSystem: true,
      color: '#ef4444', // Red
      options: {
        defaultPrompt: 'Identify and list characters or actors required for this shot as entity tags.',
        width: 200,
      },
    },
    {
      id: `col_props_${projectId}`,
      projectId,
      name: 'Props',
      cellType: 'text' as const,
      description: 'Key physical props, items, and set dressing handled or featured.',
      order: 5,
      isSystem: true,
      color: '#a855f7', // Purple
      options: {
        defaultPrompt: 'Identify and list physical props, handheld items, and essential set dressings needed for this shot.',
        width: 200,
      },
    },
    {
      id: `col_makeup_${projectId}`,
      projectId,
      name: 'Make-up & Hair',
      cellType: 'text' as const,
      description: 'Special make-up, hair styling, prosthetics, and character appearance notes.',
      order: 6,
      isSystem: true,
      color: '#ec4899', // Pink
      options: {
        defaultPrompt: 'List hair, makeup, special effects makeup, wounds, or styling requirements for the characters in this shot.',
        width: 200,
      },
    },
    {
      id: `col_sound_${projectId}`,
      projectId,
      name: 'Sound',
      cellType: 'text' as const,
      description: 'Sound effects, ambient audio, foley, and atmospheric sound cues.',
      order: 7,
      isSystem: true,
      color: '#92400e', // Brown
      options: {
        defaultPrompt: 'Suggest sound effects (SFX), ambient audio layers, foley, and sonic atmosphere for this shot.',
        width: 200,
      },
    },
    {
      id: `col_vfx_${projectId}`,
      projectId,
      name: 'VFX',
      cellType: 'text' as const,
      description: 'Visual effects, CGI elements, screen replacements, and post-production digital work.',
      order: 8,
      isSystem: true,
      color: '#3b82f6', // Blue
      options: {
        defaultPrompt: 'Identify visual effects (VFX), CGI elements, compositing, green screen, or digital cleanup needed for this shot.',
        width: 200,
      },
    },
    {
      id: `col_budget_${projectId}`,
      projectId,
      name: 'Budget',
      cellType: 'number' as const,
      description: 'Estimated production cost and financial allocation for this shot.',
      order: 9,
      isSystem: true,
      color: '#22c55e', // Green
      options: {
        currencyCode: "USD",
        defaultPrompt: 'Estimate the production cost and budget allocation for this shot based on the required elements.',
        width: 150,
      },
    },
    {
      id: `col_notes_${projectId}`,
      projectId,
      name: 'Notes',
      cellType: 'text' as const,
      description: 'Director, production, logistics, and technical execution notes.',
      order: 10,
      isSystem: true,
      color: '#eab308', // Yellow
      options: {
        defaultPrompt: 'Generate production advice, safety considerations, and creative reminders for filming this shot.',
        width: 200,
      },
    },
  ];
  await db.insert(breakdownColumns).values(columnsToInsert);

  // 2. Create Sample Scene 1
  const newScene = await db.insert(scenes).values({
    projectId,
    order: 1,
    synopsis: 'Introduction to the main characters and the primary conflict.',
  }).returning();

  const sceneId = newScene[0]?.id;
  if (!sceneId) throw new Error('Failed to create scene');

  // 3. Create Sample Shots
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

  // 4. Create Sample Cells for the shots
  const cellsToInsert = [
    // Shot 1.1 Cells
    {
      id: `cell_${shot1Id}_script`,
      shotId: shot1Id,
      columnId: `col_script_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'The rain pours heavily on the neon-lit street. A figure stands under a flickering streetlight.',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_storyboard`,
      shotId: shot1Id,
      columnId: `col_storyboard_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'image' as const,
          content: '/uploads/storyboard_shot_1_1.jpg',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_camera`,
      shotId: shot1Id,
      columnId: `col_camera_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Wide Shot, 35mm lens, Crane down',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_cast`,
      shotId: shot1Id,
      columnId: `col_cast_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'entity_tag' as const,
          content: 'UNKNOWN FIGURE',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_props`,
      shotId: shot1Id,
      columnId: `col_props_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Streetlight, Puddles',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_makeup`,
      shotId: shot1Id,
      columnId: `col_makeup_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Wet look, Rain drops',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_sound`,
      shotId: shot1Id,
      columnId: `col_sound_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Heavy rain, Distant thunder, Neon hum',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_vfx`,
      shotId: shot1Id,
      columnId: `col_vfx_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'CG rain enhancement, Neon glow',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_budget`,
      shotId: shot1Id,
      columnId: `col_budget_${projectId}`,
      numericValue: 1500,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: '1500',
        },
      ],
    },
    {
      id: `cell_${shot1Id}_notes`,
      shotId: shot1Id,
      columnId: `col_notes_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Need rain machines and extra lighting for the puddles.',
        },
      ],
    },

    // Shot 1.2 Cells
    {
      id: `cell_${shot2Id}_script`,
      shotId: shot2Id,
      columnId: `col_script_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'The figure turns suddenly. It\'s SARAH, looking terrified. She breathes heavily, clutching a small box.',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_storyboard`,
      shotId: shot2Id,
      columnId: `col_storyboard_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'image' as const,
          content: '/uploads/storyboard_shot_1_2.jpg',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_camera`,
      shotId: shot2Id,
      columnId: `col_camera_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Close Up, 50mm lens, Handheld',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_cast`,
      shotId: shot2Id,
      columnId: `col_cast_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'entity_tag' as const,
          content: 'SARAH',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_props`,
      shotId: shot2Id,
      columnId: `col_props_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Small wooden box',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_makeup`,
      shotId: shot2Id,
      columnId: `col_makeup_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Smudged eyeliner, Pale skin, Sweat',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_sound`,
      shotId: shot2Id,
      columnId: `col_sound_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Heavy breathing, Heartbeat (SFX)',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_vfx`,
      shotId: shot2Id,
      columnId: `col_vfx_${projectId}`,
      blocks: [],
    },
    {
      id: `cell_${shot2Id}_budget`,
      shotId: shot2Id,
      columnId: `col_budget_${projectId}`,
      numericValue: 500,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: '500',
        },
      ],
    },
    {
      id: `cell_${shot2Id}_notes`,
      shotId: shot2Id,
      columnId: `col_notes_${projectId}`,
      blocks: [
        {
          id: 'b1',
          type: 'text' as const,
          content: 'Make sure the box is visible but its contents remain hidden.',
        },
      ],
    },
  ];

  await db.insert(breakdownCells).values(cellsToInsert);
}
