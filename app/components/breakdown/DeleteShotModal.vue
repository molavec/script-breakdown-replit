<script setup lang="ts">
const { executeDeleteRow, cancelDeleteRow, isDeletingRow } = useSceneTable();
</script>

<template>
  <dialog id="delete_shot_modal" class="modal">
    <div class="modal-box bg-[#1a1a1e] border border-neutral-800 text-white max-w-md">
      <div class="flex items-center gap-3 text-red-500 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-white">Eliminar Shot</h3>
          <p class="text-xs text-neutral-400">Esta acción no se puede deshacer.</p>
        </div>
      </div>

      <p class="text-sm text-neutral-300 mb-6 leading-relaxed">
        ¿Estás seguro de que deseas eliminar este shot? 
        Se borrará toda la información contenida en sus celdas de forma permanente.
      </p>

      <div class="modal-action flex items-center justify-end gap-3 mt-6">
        <button 
          type="button" 
          class="btn btn-sm btn-ghost text-neutral-400 hover:text-white" 
          :disabled="isDeletingRow"
          @click="cancelDeleteRow"
        >
          Cancelar
        </button>
        <button 
          type="button"
          @click="executeDeleteRow" 
          :disabled="isDeletingRow"
          class="btn btn-sm btn-error text-white font-semibold flex items-center gap-2 px-4 shadow-lg shadow-rose-950/50"
        >
          <span v-if="isDeletingRow" class="loading loading-spinner loading-xs"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
          <span>Eliminar Shot</span>
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button :disabled="isDeletingRow" @click="cancelDeleteRow">close</button>
    </form>
  </dialog>
</template>
