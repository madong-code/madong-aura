import type { CommandGroup } from '#/api/devtools/terminal/types';

import { requestClient, sse } from '#/api/request';

const baseUrl = '/terminal';

export const TerminalService = {
  getConfig: () => {
    return requestClient.get<any>(`${baseUrl}/config`);
  },

  getCommands: () => {
    return requestClient.get<CommandGroup[]>(`${baseUrl}/commands`);
  },

  command: (
    commandKey: string,
    uuid: string,
    extend: string,
    eventHandlers: Record<string, any> = {},
  ) => {
    return sse(baseUrl, eventHandlers, {
      command: commandKey,
      uuid,
      extend,
    });
  },

  updateConfig: (data: Record<string, any>) => {
    return requestClient.put(`${baseUrl}/config`, data);
  },
};

export type { CommandGroup };
