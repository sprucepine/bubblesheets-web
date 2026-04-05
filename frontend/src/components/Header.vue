<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useTaskStore } from '@/stores/tasks';
  import { SaveState } from '@/types/tasks';
  import ChangeTestName from '@/components/ChangeTestName.vue';
  import {
    // bubblesheet file extension
    makeBubblesheetFilename,
    parseBubblesheetFile,
    serializeProjectToBubblesheet,
  } from '@/utils/bubblesheet';

  const logo = '/logo.svg';
  const taskStore = useTaskStore();
  const { projectName, tasks, saveState, saveStatusText } = storeToRefs(taskStore);

  const statusTimer = ref<number | null>(null); // timer for how the save status text should persist before fading out

  type ChangeNameModalExposed = {
    open: () => void;
  };

  async function saveTasks() {
    taskStore.setSaveState(SaveState.Saving);

    // Persisted Pinia state writes to localStorage automatically.
    await Promise.resolve();
    taskStore.setSaveState(SaveState.Saved);

    if (statusTimer.value !== null) {
      window.clearTimeout(statusTimer.value);
    }
    statusTimer.value = window.setTimeout(() => {
      taskStore.setSaveState(SaveState.OldSaved);
      statusTimer.value = null;
    }, 5000);
  }

  function addTask() {
    taskStore.addTask();
    saveTasks();
  }

  const changeNameModalRef = ref<ChangeNameModalExposed | null>(null);
  const importInputRef = ref<HTMLInputElement | null>(null);

  function openChangeNameModal() {
    changeNameModalRef.value?.open();
  }

  function openImportPicker() {
    importInputRef.value?.click();
  }

  async function onImportSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const importedData = parseBubblesheetFile(fileContent);
      taskStore.applyProjectData(importedData);
      taskStore.setSaveState(SaveState.Saved);
    } catch (error) {
      taskStore.setSaveState(SaveState.Error);
      const reason =
        error instanceof Error ? error.message : 'Could not import the selected file.';
      window.alert(`Import failed: ${reason}`);
    } finally {
      input.value = '';
    }
  }

  function exportBubblesheet() {
    try {
      const fileContent = serializeProjectToBubblesheet({
        projectName: projectName.value,
        tasks: tasks.value,
      });

      const blob = new Blob([fileContent], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');

      downloadLink.href = downloadUrl;
      downloadLink.download = makeBubblesheetFilename(projectName.value);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);

      taskStore.setSaveState(SaveState.Saved);
    } catch {
      taskStore.setSaveState(SaveState.Error);
      window.alert('Export failed. Please try again.');
    }
  }

  const statusLabel = computed(() => saveStatusText.value);
  const statusIcon = computed(() => {
    if (saveState.value === SaveState.Saved) return 'lucide:cloud-check';
    if (saveState.value === SaveState.Saving) return 'lucide:loader-circle';
    if (saveState.value === SaveState.Error) return 'lucide:cloud-off';
    if (saveState.value === SaveState.OldSaved) return 'lucide:cloud-check';
    return 'lucide:cloud';
  });
  const statusTooltip = computed(() => {
    if (saveState.value === SaveState.Saved) return 'All changes saved';
    if (saveState.value === SaveState.Saving) return 'Saving changes...';
    if (saveState.value === SaveState.Error) return 'Error saving changes';
    if (saveState.value === SaveState.OldSaved) return 'All changes saved';
    return 'No changes yet';
  });
</script>
<template>
  <div class="navbar bg-base-100 nav-wrap sticky top-0 z-30">
    <div class="navbar-start">
      <a
        class="btn btn-ghost normal-case nav-brand gap-2"
        href="#"
        aria-label="Bubblesheets on the Web home"
      >
        <img :src="logo" aria-hidden="true" class="logo" />
        <span>Bubblesheets on the Web</span>
      </a>
      <ul class="menu menu-horizontal px-1">
        <li>
          <details>
            <summary>
              {{ projectName }}
            </summary>
            <ul class="bg-base-100 rounded-box right-0 w-56 p-2 shadow">
              <li>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2"
                  @click="openChangeNameModal"
                >
                  <span>Change Project Name</span>
                  <iconify-icon
                    icon="lucide:pencil"
                    width="14"
                    height="14"
                    aria-hidden="true"
                  ></iconify-icon>
                </button>
              </li>
            </ul>
          </details>
        </li>
      </ul>
      <button
        type="button"
        class="tooltip tooltip-bottom btn btn-ghost normal-case gap-2"
        :data-tip="statusTooltip"
      >
        <iconify-icon
          :icon="statusIcon"
          width="14"
          height="14"
          :class="{ 'animate-spin': saveState === SaveState.Saving }"
          aria-hidden="true"
        ></iconify-icon>
        {{ statusLabel }}
      </button>
      <button type="button" class="btn" @click="addTask">
        <iconify-icon icon="lucide:plus" width="18" height="18"></iconify-icon>
        Add Task
      </button>
    </div>
    <div class="navbar-end">
      <button type="button" class="btn" @click="openImportPicker">
        <iconify-icon
          icon="lucide:arrow-up-from-line"
          width="18"
          height="18"
        ></iconify-icon>
        Import
      </button>
      <input
        ref="importInputRef"
        type="file"
        class="hidden"
        accept=".bubblesheet,application/json"
        @change="onImportSelected"
      />
      <button type="button" class="btn" @click="exportBubblesheet">
        <iconify-icon
          icon="lucide:arrow-down-from-line"
          width="18"
          height="18"
        ></iconify-icon>
        Export
      </button>
      <ul class="menu menu-horizontal px-1">
        <li>
          <details>
            <summary>
              <iconify-icon icon="lucide:github" width="18" height="18"></iconify-icon>
            </summary>
            <ul class="bg-base-100 rounded-box right-0 w-56 p-2 shadow">
              <li>
                <a
                  href="https://github.com/sprucepine/bubblesheets"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-between gap-2"
                  aria-label="Swift app repository (opens in new tab)"
                >
                  <span>Swift App Repository</span>
                  <iconify-icon
                    icon="lucide:external-link"
                    width="14"
                    height="14"
                    aria-hidden="true"
                    title="Opens in a new tab"
                  ></iconify-icon>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/sprucepine/bubblesheets-web"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-between gap-2"
                  aria-label="Web app repository (opens in new tab)"
                >
                  <span>Web App Repository</span>
                  <iconify-icon
                    icon="lucide:external-link"
                    width="14"
                    height="14"
                    aria-label="Opens in new tab"
                    title="Opens in a new tab"
                  ></iconify-icon>
                </a>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  </div>
  <ChangeTestName ref="changeNameModalRef" />
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
    border-bottom: 1px solid
      color-mix(in oklab, var(--color-base-content) 10%, transparent);
  }

  .logo {
    width: 1.4rem;
    height: 1.4rem;
  }

  .nav-brand {
    padding-inline: 0.6rem;
    font-size: 1.16rem;
    font-weight: 600;
    transition:
      background-color 150ms ease,
      transform 150ms ease;
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
