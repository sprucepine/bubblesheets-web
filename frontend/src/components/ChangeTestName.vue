<script setup lang="ts">
  import { onBeforeUnmount, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useTaskStore } from '@/stores/tasks';
  import { SaveState } from '@/types/tasks';

  const taskStore = useTaskStore();
  const { projectName } = storeToRefs(taskStore);

  const dialogRef = ref<HTMLDialogElement | null>(null);
  const draftName = ref('');
  const inputRef = ref<HTMLInputElement | null>(null);
  const maxNameLength = 80;
  let statusTimer: ReturnType<typeof window.setTimeout> | null = null;

  function open() {
    draftName.value = projectName.value;
    dialogRef.value?.showModal();

    window.setTimeout(() => {
      inputRef.value?.focus();
      inputRef.value?.select();
    }, 0);
  }

  function close() {
    dialogRef.value?.close();
  }

  function persistProjectName() {
    const normalizedName = draftName.value.trim() || 'Project Name';
    projectName.value = normalizedName;

    taskStore.setSaveState(SaveState.Saving);

    window.setTimeout(() => {
      taskStore.setSaveState(SaveState.Saved);

      if (statusTimer !== null) {
        window.clearTimeout(statusTimer);
      }

      statusTimer = window.setTimeout(() => {
        taskStore.setSaveState(SaveState.OldSaved);
        statusTimer = null;
      }, 5000);
    }, 0);

    close();
  }

  onBeforeUnmount(() => {
    if (statusTimer !== null) {
      window.clearTimeout(statusTimer);
    }
  });

  defineExpose({
    open,
  });
</script>

<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box max-w-md">
      <h3 class="text-lg font-bold">Change Project Name</h3>
      <p class="mt-1 text-sm opacity-80">Update the title shown across the app.</p>

      <label class="form-control mt-4 w-full" for="project-name-input">
        <span class="label-text mb-1 text-sm font-medium">Project name</span>
        <input
          id="project-name-input"
          ref="inputRef"
          v-model="draftName"
          class="input input-bordered w-full"
          type="text"
          maxlength="80"
          placeholder="Enter a project name"
          @keydown.enter.prevent="persistProjectName"
        />
      </label>

      <p class="mt-2 text-xs opacity-70">
        {{ draftName.length }}/{{ maxNameLength }} characters
      </p>

      <div class="modal-action">
        <button class="btn" type="button" @click="close">Cancel</button>
        <button class="btn btn-primary" type="button" @click="persistProjectName">
          Save
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button aria-label="Close modal">close</button>
    </form>
  </dialog>
</template>
