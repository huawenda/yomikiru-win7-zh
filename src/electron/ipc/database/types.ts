import type { DatabaseChannels } from "@common/types/ipc";
import type { DatabaseService } from "../../db";

export type DatabaseHandlers<K extends keyof DatabaseChannels = keyof DatabaseChannels> = {
    [P in K]: (
        db: DatabaseService,
        request: DatabaseChannels[P]["request"],
    ) => Promise<DatabaseChannels[P]["response"]>;
};
