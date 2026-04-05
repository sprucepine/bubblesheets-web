import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { AnswerChoice, SaveState, type TaskItem } from '@/types/tasks';

const DEFAULT_TASKS: TaskItem[] = [
  { id: 1, label: 'Review source data', answer: AnswerChoice.D, notes: '' },
  { id: 2, label: 'Clean malformed rows', answer: AnswerChoice.C, notes: '' },
  { id: 3, label: 'Run transformation', answer: AnswerChoice.B, notes: '' },
  { id: 4, label: 'Publish report', answer: AnswerChoice.A, notes: '' },
];

export const useTaskStore = defineStore(
  'tasks',
  () => {
    const projectName = ref('Project Name');
    const tasks = ref<TaskItem[]>([...DEFAULT_TASKS]);
    const saveState = ref<SaveState>(SaveState.Idle);

    const saveStatusText = computed(() => {
      if (saveState.value === SaveState.Saving) return 'Saving...';
      if (saveState.value === SaveState.Saved) return 'Saved to browser data';
      if (saveState.value === SaveState.Error) return 'Save failed';
      return '';
    });

    function setTasks(items: TaskItem[]) {
      tasks.value = items;
    }

    function setProjectName(name: string) {
      projectName.value = name;
    }

    function applyProjectData(payload: { projectName: string; tasks: TaskItem[] }) {
      projectName.value = payload.projectName;
      tasks.value = payload.tasks;
    }

    function setSaveState(state: SaveState) {
      saveState.value = state;
    }

    function moveTaskUp(index: number) {
      if (index <= 0) return false;

      const current = tasks.value[index];
      const previous = tasks.value[index - 1];
      if (!current || !previous) return false;

      tasks.value[index] = previous;
      tasks.value[index - 1] = current;
      return true;
    }

    function moveTaskDown(index: number) {
      if (index >= tasks.value.length - 1) return false;

      const current = tasks.value[index];
      const next = tasks.value[index + 1];
      if (!current || !next) return false;

      tasks.value[index] = next;
      tasks.value[index + 1] = current;
      return true;
    }

    return {
      tasks,
      projectName,
      saveState,
      saveStatusText,
      setTasks,
      setProjectName,
      applyProjectData,
      setSaveState,
      moveTaskUp,
      moveTaskDown,
    };
  },
  {
    persist: {
      key: 'honors.tasks',
      storage: localStorage,
      pick: ['tasks', 'projectName'],
    },
  },
);
