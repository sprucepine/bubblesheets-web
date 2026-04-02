<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '@/stores/tasks'
import { SaveState } from '@/types/tasks'

const logo = '/logo.svg'
const taskStore = useTaskStore()
const { saveState, saveStatusText } = storeToRefs(taskStore)

const statusLabel = computed(() => saveStatusText.value)
const statusIcon = computed(() => {
  if (saveState.value === SaveState.Saved) return 'lucide:cloud-check'
  if (saveState.value === SaveState.Saving) return 'lucide:loader-circle'
  if (saveState.value === SaveState.Error) return 'lucide:cloud-off'
  return 'lucide:cloud'
})
</script>
<template>
  <div class="navbar bg-base-100 nav-wrap sticky top-0 z-30">
    <div class="navbar-start">
    <a class="btn btn-ghost normal-case nav-brand gap-2" href="#" aria-label="Bubblesheets on the Web home">
      <img :src="logo" aria-hidden="true" class="logo" />
      <span>Bubblesheets on the Web</span>
    </a>
      <ul class="menu menu-horizontal px-1">
        <li>
          <details>
            <summary>
              Project Name
            </summary>
            <ul class="bg-base-100 rounded-box right-0 w-56 p-2 shadow">
              <li>
                <a href="https://github.com/sprucepine/bubblesheets" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between gap-2" aria-label="Swift app repository (opens in new tab)" >
                  <span>Change Project Name</span>
                  <iconify-icon icon="lucide:pencil" width="14" height="14" aria-hidden="true"></iconify-icon>
                </a>
              </li>
            </ul>
          </details>
        </li>
      </ul>
      <div class="tooltip tooltip-bottom" :data-tip="statusLabel">
        <button class="btn btn-ghost normal-case gap-2" >
          <iconify-icon
            :icon="statusIcon"
            width="14"
            height="14"
            :class="{ 'animate-spin': saveState === SaveState.Saving }"
            aria-hidden="true"
          ></iconify-icon>
          {{ statusLabel }}
        </button>
      </div>
  </div>
    <div class="navbar-end">
      <ul class="menu menu-horizontal px-1">
        <li>
          <details>
            <summary>
              <iconify-icon icon="lucide:github" width="18" height="18"></iconify-icon>
            </summary>
            <ul class="bg-base-100 rounded-box right-0 w-56 p-2 shadow">
              <li>
                <a href="https://github.com/sprucepine/bubblesheets" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between gap-2" aria-label="Swift app repository (opens in new tab)" >
                  <span>Swift App Repository</span>
                  <iconify-icon icon="lucide:external-link" width="14" height="14" aria-hidden="true" title="Opens in a new tab"></iconify-icon>
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between gap-2" aria-label="Web app repository (opens in new tab)">
                  <span>Web App Repository</span>
                  <iconify-icon icon="lucide:external-link" width="14" height="14" aria-label="Opens in new tab" title="Opens in a new tab"></iconify-icon>
                </a>
              </li>
            </ul>
          </details>
        </li>
      </ul>
 
  </div>
  </div>

</template>

<style scoped>
.nav-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 0.55rem 1rem;
  background: var(--color-base-100);
  border-bottom: 1px solid color-mix(in oklab, var(--color-base-content) 10%, transparent);
}

.logo {
  width: 1.4rem;
  height: 1.4rem;
}

.nav-brand {
  padding-inline: 0.6rem;
  font-size: 1.16rem;
  font-weight: 600;
  transition: background-color 150ms ease, transform 150ms ease;
}

.nav-brand:hover,
.nav-brand:focus-visible {
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .nav-wrap {
    padding: 0.5rem 0.7rem;
  }

  .nav-brand {
    padding-inline: 0.35rem;
    font-size: 1.04rem;
  }
}
</style>    