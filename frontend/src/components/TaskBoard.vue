<script setup lang="ts">
  import { ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import draggable from 'vuedraggable';
  import { useTaskStore } from '@/stores/tasks';
  import { AnswerChoice, SaveState } from '@/types/tasks';

  const taskStore = useTaskStore(); // this is like the model from SwiftData
  const { tasks, saveStatusText, projectName } = storeToRefs(taskStore); // imported data from the store, now reactive in this component
  const statusTimer = ref<number | null>(null); // timer for how the save status text should persist before fading out
  const answerChoices = Object.values(AnswerChoice);

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

  function moveTaskUp(index: number) {
    const moved = taskStore.moveTaskUp(index);
    if (moved) {
      saveTasks();
    }
  }

  function moveTaskDown(index: number) {
    const moved = taskStore.moveTaskDown(index);
    if (moved) {
      saveTasks();
    }
  }

  function setTaskAnswer(index: number, choice: AnswerChoice) {
    const task = tasks.value[index];
    if (!task || task.answer === choice) return;

    task.answer = choice;
    saveTasks();
  }
</script>

<template>
  <section class="panel card bg-base-100 shadow-sm">
    <div class="tasks-heading">
      <h2 class="panel-title">{{ projectName }}</h2>
    </div>

    <div
      class="sr-only"
      id="task-status-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ saveStatusText }}
    </div>

    <!-- <p class="keyboard-hint">
      Tip: Use arrow keys to move tasks, or drag with your mouse.
    </p> -->

    <draggable
      v-model="tasks"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      :animation="180"
      @end="saveTasks"
      role="list"
      :aria-label="`${tasks.length} tasks to organize`"
      tabindex="0"
    >
      <template #item="{ element, index }">
        <article class="task-row" role="listitem">
          <button
            class="drag-handle btn btn-ghost btn-sm"
            type="button"
            style="cursor: grab"
            :aria-label="`Drag ${element.label} to reorder`"
            :aria-describedby="`task-${element.id}-actions`"
            tabindex="0"
            @keydown.down="moveTaskDown(index)"
            @keydown.up="moveTaskUp(index)"
          >
            <iconify-icon
              icon="lucide:grip-vertical"
              width="16"
              height="16"
              aria-hidden="true"
            ></iconify-icon>
          </button>
          <div class="task-content">
            <span class="badge badge-soft">Question {{ index + 1 }}</span>
            <!-- <span class="task-label">{{ element.label }}</span> -->
            <div
              class="join"
              role="group"
              :aria-label="`Answer choices for ${element.label}`"
            >
              <button
                v-for="choice in answerChoices"
                :key="choice"
                class="join-item btn btn"
                :class="element.answer === choice ? 'btn-neutral' : 'btn-outline'"
                type="button"
                :aria-pressed="element.answer === choice"
                :aria-label="`Set ${element.label} answer to ${choice}`"
                @click="setTaskAnswer(index, choice)"
              >
                {{ choice }}
              </button>
            </div>
            <!-- <label class="sr-only" :for="`task-${element.id}-notes`"
              >Notes for {{ element.label }}</label
            >
            <input
              :id="`task-${element.id}-notes`"
              v-model="element.notes"
              class="input input-bordered input-sm task-notes"
              type="text"
              placeholder="Add note"
              :aria-label="`Notes for ${element.label}`"
              @change="saveTasks"
            /> -->
          </div>
          <div :id="`task-${element.id}-actions`" class="task-actions">
            <button
              class="btn btn-ghost btn-xs"
              type="button"
              @click="moveTaskUp(index)"
              :disabled="index === 0"
              :aria-label="`Move ${element.label} up`"
              title="Move up (disabled if already first)"
            >
              <iconify-icon
                icon="lucide:arrow-up"
                width="14"
                height="14"
                aria-hidden="true"
              ></iconify-icon>
            </button>
            <button
              class="btn btn-ghost btn-xs"
              type="button"
              @click="moveTaskDown(index)"
              :disabled="index === tasks.length - 1"
              :aria-label="`Move ${element.label} down`"
              title="Move down (disabled if already last)"
            >
              <iconify-icon
                icon="lucide:arrow-down"
                width="14"
                height="14"
                aria-hidden="true"
              ></iconify-icon>
            </button>
          </div>
        </article>
      </template>
    </draggable>
  </section>
</template>

<style scoped>
  .panel {
    padding: 1rem;
    border-radius: 1.2rem;
  }

  .panel-title {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .tasks-heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .status {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    line-height: 1;
    white-space: nowrap;
    font-size: 0.85rem;
    color: color-mix(in oklab, var(--color-base-content) 65%, transparent);
  }

  .task-row {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    border: 1px solid color-mix(in oklab, var(--color-base-content) 16%, transparent);
    border-radius: 1.2rem;
    padding: 1rem;
    margin-bottom: 0.55rem;
    background: var(--color-base-100);
  }

  .ghost {
    opacity: 0.5;
    background-color: color-mix(in oklab, var(--color-base-content) 5%, transparent);
  }

  .task-label {
    font-weight: 600;
    word-break: break-word;
  }

  .task-content {
    flex: 1;
    display: grid;
    gap: 0.35rem;
    min-width: 12rem;
  }

  .task-notes {
    width: 100%;
  }

  .task-actions {
    display: flex;
    gap: 0.3rem;
    margin-left: auto;
  }

  .keyboard-hint {
    font-size: 0.875rem;
    color: color-mix(in oklab, var(--color-base-content) 60%, transparent);
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
    border-radius: 0.375rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  button:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .task-actions {
      gap: 0.2rem;
    }

    .task-row {
      flex-wrap: wrap;
    }
  }
</style>
