<script setup lang="ts">
interface Props {
  showSidebarToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSidebarToggle: undefined,
})

const route = useRoute()

const isSidebarToggleVisible = computed(() => {
  if (props.showSidebarToggle !== undefined) {
    return props.showSidebarToggle
  }
  if (route.path === '/') {
    return false
  }
  return true
})
</script>

<template>
  <div class="min-h-screen bg-base-100 text-base-content font-sans selection:bg-primary/30">
    <AppHeader :show-sidebar-toggle="isSidebarToggleVisible" />
    <slot />
  </div>
</template>
