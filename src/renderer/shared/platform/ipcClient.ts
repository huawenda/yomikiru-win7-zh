import type { IPCChannels } from "@common/types/ipc";

export const ipcClient = {
    on: <T extends keyof IPCChannels>(
        channel: T,
        callback: (data: IPCChannels[T]["request"]) => void,
    ): (() => void) => window.electron.on(channel, callback),
    invoke: <T extends keyof IPCChannels>(
        channel: T,
        ...data: IPCChannels[T]["request"] extends void ? [] : [IPCChannels[T]["request"]]
    ): Promise<IPCChannels[T]["response"]> => window.electron.invoke(channel, ...data),
    send: <T extends keyof IPCChannels>(
        channel: T,
        ...data: IPCChannels[T]["request"] extends void ? [] : [IPCChannels[T]["request"]]
    ): void => window.electron.send(channel, ...data),
};
