export interface TaskItem {
  uuid: string;
  date: string;
  status: number;
  command: string;
  message: string[];
  showMessage: boolean;
  blockOnFailure: boolean;
  extend: string;
  callback: (...args: any[]) => any;
}

export interface CommandItem {
  key: string;
  name: string;
  description: string;
}

export interface CommandGroup {
  id: string;
  name: string;
  icon: string;
  commands: CommandItem[];
}

export interface Terminal {
  show: boolean;
  showDot: boolean;
  taskList: TaskItem[];
  packageManager: string;
  showPackageManagerDialog: boolean;
  showConfig: boolean;
  developmentServer: boolean;
  automaticCleanupTask: string;
  npmRegistry: string;
  composerRegistry: string;
  commandGroups: CommandGroup[];
}
