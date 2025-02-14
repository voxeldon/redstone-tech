/*
 Author: Donthedev <https://github.com/voxeldon>
**************************************************
 Copyright (c) Voxel Media Co - Voxel Lab Studios
**************************************************
*/
import { system, world } from "@minecraft/server";
/**
 * Represents the event type for an ACM event.
 */
export var AcmEventType;
(function (AcmEventType) {
    AcmEventType["DataChanged"] = "data_changed";
    AcmEventType["ExtensionTriggered"] = "extension_triggerd";
})(AcmEventType || (AcmEventType = {}));
;
/**
 * The AcmApi class provides methods to manage addon profiles and handle events related to addon data changes.
 */
export class AcmApi {
    static initializeListener(profile) {
        if (AcmApi.initialized)
            return;
        AcmApi.initialized = true;
        system.afterEvents.scriptEventReceive.subscribe((event) => {
            if (event.id === `acm:${profile.authorId}_${profile.packId}`) {
                for (const handler of AcmApi.eventSignal) {
                    handler({ type: 'data_changed', data: AcmApi.loadAddonData(profile) });
                }
            }
            else {
                const extensions = Array.isArray(profile.extension) ? profile.extension : [profile.extension];
                for (const ext of extensions) {
                    if (event.id === `acm:${profile.authorId}_${profile.packId}.${ext?.eventId}`) {
                        for (const handler of AcmApi.eventSignal) {
                            handler({ type: 'extension_triggerd', player: event.sourceEntity });
                        }
                    }
                }
            }
        });
    }
    /**
     * Subscribes a callback function to the AcmApi event signal.
     *
     * @param callback - The function to be called when the event signal is triggered.
     * @returns The same callback function that was passed in.
     */
    static subscribe(callback) {
        AcmApi.eventSignal.push(callback);
        return callback;
    }
    /**
     * Unsubscribes a callback function from the AcmApi event signal.
     *
     * @param callback - The callback function to be removed from the event signal.
     */
    static unsubscribe(callback) {
        const index = AcmApi.eventSignal.indexOf(callback);
        if (index !== -1) {
            AcmApi.eventSignal.splice(index, 1);
        }
    }
    /**
     * Generates an addon profile.
     *
     * @param profile - The configuration object for the addon profile, containing authorId and packId.
     */
    static generateAddonProfile(profile) {
        const dataProfileId = `ACM:${profile.authorId}_${profile.packId}`;
        //world.setDynamicProperty(dataProfileId, JSON.stringify(profile));
        let db = world.scoreboard.getObjective(dataProfileId);
        if (!db)
            db = world.scoreboard.addObjective(dataProfileId);
        db.getParticipants().forEach((i) => { if (db.getScore(i) === 0)
            db.removeParticipant(i); });
        db.addScore(JSON.stringify(profile), 0);
        AcmApi.initializeListener(profile);
    }
    /**
     * Loads addon data for a given profile.
     *
     * @param profile - The configuration of the addon, including authorId and packId.
     * @returns A Map containing the addon data, or undefined if no data is found.
     */
    static loadAddonData(profile) {
        const dataProfileId = `ACM:${profile.authorId}_${profile.packId}`;
        const db = world.scoreboard.getObjective(dataProfileId);
        let rawData = undefined;
        db?.getParticipants().forEach((i) => { if (db.getScore(i) === 1)
            rawData = i.displayName; });
        let saveState = undefined;
        if (rawData) {
            const parsedData = JSON.parse(rawData);
            saveState = new Map(Object.entries(parsedData));
        }
        return saveState;
    }
    /**
     * Pushes a log entry to the scoreboard for the given profile.
     *
     * @param profile - The profile configuration.
     * @param logText - The text of the log entry to be pushed.
     */
    static pushLog(profile, logText) {
        const dataProfileId = `ACM:${profile.authorId}_${profile.packId}`;
        let db = world.scoreboard.getObjective('acm:logs');
        if (!db)
            db = world.scoreboard.addObjective('acm:logs');
        const id = db.getParticipants().length;
        const log = { profileId: dataProfileId, logText: logText };
        db.addScore(JSON.stringify(log), id);
    }
}
AcmApi.initialized = false;
AcmApi.eventSignal = [];
