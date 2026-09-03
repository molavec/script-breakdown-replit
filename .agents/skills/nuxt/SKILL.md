---
name: nuxt
description: Guidelines, SFC component structure conventions, best practices, and official documentation reference for Nuxt 3/4 and Vue applications. Use whenever writing, refactoring, or querying Nuxt/Vue components, composables, routing, configuration, or researching Nuxt features.
---

# Nuxt & Vue Development Guidelines

Guía y estándares de desarrollo para aplicaciones Nuxt (Nuxt 3 y Nuxt 4) y Vue 3.

---

## 1. Estructura Obligatoria de Componentes (.vue)

Todos los Single File Components (SFC) **DEBEN** seguir estrictamente el siguiente orden de bloques:

1. **`<script setup lang="ts">`**
2. **`<template>`**
3. **`<style scoped>`**

### Plantilla de Componente

```vue
<script setup lang="ts">
// 1. Tipos e Interfaces
interface Props {
  title?: string
  isActive?: boolean
}

// 2. Props y Emits
const props = withDefaults(defineProps<Props>(), {
  title: '',
  isActive: false,
})

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

// 3. Estado Reactivo y Composables (auto-importados)
const count = ref(0)
const route = useRoute()

// 4. Métodos y Handlers
function handleClick() {
  count.value++
  emit('select', String(count.value))
}

// 5. Lifecycle y Watchers
onMounted(() => {
  // Inicialización si es necesario
})
</script>

<template>
  <div class="component-container">
    <h2>{{ props.title }}</h2>
    <button @click="handleClick">
      Contador: {{ count }}
    </button>
  </div>
</template>

<style scoped>
.component-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
```

### Reglas de SFC:
- **Script primero**: Facilita la lectura de la lógica, tipos e inferencias de TypeScript antes de examinar la vista.
- **TypeScript**: Utilizar siempre `lang="ts"` en `<script setup>`.
- **Estilos Scoped**: Usar siempre `<style scoped>` para evitar fugas de estilos globales a otros componentes, a menos que se defina intencionalmente una regla global en un archivo CSS dedicado.

---

## 2. Documentación Oficial e Investigación

Cuando sea necesario investigar documentación, APIs, módulos, configuración o mejores prácticas de Nuxt, el agente **DEBE recurrir como fuente primaria al índice de documentación para LLMs**:

* **Índice Principal LLMs:** [https://nuxt.com/llms.txt](https://nuxt.com/llms.txt)
* **Documentación Completa en Markdown:** [https://nuxt.com/llms-full.txt](https://nuxt.com/llms-full.txt)
* **Acceso directo a Markdown sin procesar:** `https://nuxt.com/raw/docs/4.x/...` o `https://nuxt.com/raw/docs/3.x/...`

### Secciones Frecuentes de Consulta:

| Área | URL de Referencia |
| :--- | :--- |
| **Data Fetching** | `https://nuxt.com/raw/docs/4.x/getting-started/data-fetching.md` |
| **Auto-imports** | `https://nuxt.com/raw/docs/4.x/guide/concepts/auto-imports.md` |
| **Routing y Pages** | `https://nuxt.com/raw/docs/4.x/directory-structure/app/pages.md` |
| **Composables API** | `https://nuxt.com/raw/docs/4.x/api/composables/use-fetch.md` |
| **Componentes Built-in** | `https://nuxt.com/raw/docs/4.x/api/components/nuxt-link.md` |
| **Server / Nitro API** | `https://nuxt.com/raw/docs/4.x/directory-structure/server.md` |
| **State Management** | `https://nuxt.com/raw/docs/4.x/getting-started/state-management.md` |

---

## 3. Convenciones y Buenas Prácticas en Nuxt

### Auto-Imports
Nuxt importa automáticamente:
- **Composables de Vue**: `ref`, `computed`, `reactive`, `watch`, `watchEffect`, `onMounted`, etc.
- **Composables de Nuxt**: `useFetch`, `useAsyncData`, `useState`, `useRoute`, `useRouter`, `useCookie`, `useHead`, `useSeoMeta`, `useRuntimeConfig`, etc.
- **Utilidades**: `$fetch`, `navigateTo`, `definePageMeta`, `createError`, etc.
- **Componentes**: Todos los componentes dentro de `components/`.

> **Regla:** No importar manualmente lo que Nuxt ya importa automáticamente de forma global.

### Data Fetching
- Para llamadas durante SSR/renderizado inicial: usar `useFetch` o `useAsyncData`.
- Para llamadas disparadas por interacción de usuario (POST, PUT, DELETE o clicks): usar `$fetch`.

### Estado Compartido
- Usar `useState('key', () => initialValue)` para estado reactivo persistente y seguro en SSR.

### SEO y Metadatos
- Usar `useSeoMeta({ title: '...', description: '...' })` o `useHead({ ... })` para configurar metadatos en páginas y layouts.
