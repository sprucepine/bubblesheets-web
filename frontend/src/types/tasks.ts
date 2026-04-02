export type TaskItem = {
  id: number
  label: string
  answer: AnswerChoice
  notes: string
}

// String enums are easy to persist and debug in localStorage.
export enum AnswerChoice {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
}

export enum SaveState {
  Idle = 'idle',
  Saving = 'saving',
  Saved = 'saved',
  Error = 'error',
}
