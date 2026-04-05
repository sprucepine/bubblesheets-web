import { AnswerChoice, type TaskItem } from '@/types/tasks';

const FORMAT_NAME = 'bubblesheet';
const FORMAT_VERSION = 1;
export const BUBBLESHEET_FILE_EXTENSION = '.bubblesheet';

type BubblesheetFileV1 = {
  format: typeof FORMAT_NAME;
  version: typeof FORMAT_VERSION;
  exportedAt: string;
  project: {
    name: string;
    tasks: TaskItem[];
  };
};

export type ProjectData = {
  projectName: string;
  tasks: TaskItem[];
};

function isAnswerChoice(value: unknown): value is AnswerChoice {
  return (
    typeof value === 'string' &&
    Object.values(AnswerChoice).includes(value as AnswerChoice)
  );
}

function sanitizeTask(input: unknown, index: number): TaskItem {
  if (!input || typeof input !== 'object') {
    throw new Error(`Task ${index + 1} is not a valid object.`);
  }

  const record = input as Record<string, unknown>;
  const id = Number(record.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Task ${index + 1} has an invalid id.`);
  }

  if (typeof record.label !== 'string' || record.label.trim() === '') {
    throw new Error(`Task ${index + 1} has an invalid label.`);
  }

  if (!isAnswerChoice(record.answer)) {
    throw new Error(`Task ${index + 1} has an invalid answer choice.`);
  }

  if (typeof record.notes !== 'string') {
    throw new Error(`Task ${index + 1} has invalid notes.`);
  }

  return {
    id,
    label: record.label,
    answer: record.answer,
    notes: record.notes,
  };
}

export function makeBubblesheetFilename(projectName: string): string {
  const trimmedName = projectName.trim();
  const baseName = trimmedName === '' ? 'project' : trimmedName;
  const safeName = baseName
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

  const normalized = safeName === '' ? 'project' : safeName;
  return `${normalized}${BUBBLESHEET_FILE_EXTENSION}`;
}

export function serializeProjectToBubblesheet(data: ProjectData): string {
  const fileData: BubblesheetFileV1 = {
    format: FORMAT_NAME,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    project: {
      name: data.projectName,
      tasks: data.tasks,
    },
  };

  return `${JSON.stringify(fileData, null, 2)}\n`;
}

export function parseBubblesheetFile(content: string): ProjectData {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Could not parse file. This is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid bubblesheet file format.');
  }

  const record = parsed as Record<string, unknown>;
  if (record.format !== FORMAT_NAME || record.version !== FORMAT_VERSION) {
    throw new Error('Unsupported bubblesheet file version.');
  }

  if (!record.project || typeof record.project !== 'object') {
    throw new Error('File is missing project data.');
  }

  const project = record.project as Record<string, unknown>;
  if (typeof project.name !== 'string' || project.name.trim() === '') {
    throw new Error('Project name is missing or invalid.');
  }

  if (!Array.isArray(project.tasks)) {
    throw new Error('Project tasks are missing or invalid.');
  }

  return {
    projectName: project.name,
    tasks: project.tasks.map((task, index) => sanitizeTask(task, index)),
  };
}
