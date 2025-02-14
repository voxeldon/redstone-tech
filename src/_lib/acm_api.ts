/*  
 Author: Donthedev <https://github.com/voxeldon> 
**************************************************
 Copyright (c) Voxel Media Co - Voxel Lab Studios
**************************************************
*/
import { Player, ScoreboardObjective, ScriptEventCommandMessageAfterEvent, system, world } from "@minecraft/server";

/**
 * Represents the event type for an ACM event.
 */
export enum AcmEventType {
    DataChanged = 'data_changed',
    ExtensionTriggered = 'extension_triggerd'
}

/**
 * Represents the data structure for an ACM event.
 * 
 * @property {string} type - The type of the event.
 * @property {Map<string, any>} [data] - Optional additional data associated with the event.
 */
export type AcmEventData = { type: string, data?: Map<string, any>, player?: Player };

/**
 * A type representing a callback function that is invoked after an ACM event occurs.
 * 
 * @callback AcmAfterEvent
 * @param {AcmEventData} event - The data associated with the ACM event.
 */
export type AcmAfterEvent = (event: AcmEventData) => void;

/**
 * Represents the type of an addon setting.
 */
export type AddonSettingTypeId = 'toggle' | 'slider' | 'dropdown' | 'text_field';

/**
 * Represents a setting that can be one of several types.
 */
export type AddonSetting = ToggleSetting | SliderSetting | DropdownSetting | TextFieldSetting;

/**
 * Represents a log entry for ACM (Addon Configuration Manager).
 * 
 * @property {AddonConfiguration} profileId - The configuration profile id associated with the log entry.
 * @property {string} log - The log message or content.
 */
export interface AcmLog { profileId: String; logText: string; };

/**
 * Represents the settings for a text field.
 * 
 * @interface TextFieldSetting
 * @property {string} label - The label for the text field.
 * @property {string} placeholder - The placeholder text for the text field.
 * @property {string} [defaultValue] - The default value for the text field (optional).
 */
export interface TextFieldSetting {
    label: string,
    placeholder: string,
    defaultValue?: string
}

/**
 * Represents the settings for a dropdown component.
 * 
 * @interface DropdownSetting
 * @property {string} label - The label for the dropdown.
 * @property {string[]} options - The list of options available in the dropdown.
 * @property {number} [defaultValueIndex] - The index of the default selected option. Optional.
 */
export interface DropdownSetting {
    label: string,
    options: string[],
    defaultValueIndex?: number
}

/**
 * Represents the settings for a slider component.
 * 
 * @interface SliderSetting
 * @property {string} label - The label for the slider.
 * @property {number} min - The minimum value of the slider.
 * @property {number} max - The maximum value of the slider.
 * @property {number} step - The step increment of the slider.
 * @property {number} [defaultValue] - The default value of the slider (optional).
 */
export interface SliderSetting {
    label: string,
    min: number,
    max: number,
    step: number,
    defaultValue?: number
}

/**
 * Represents a toggle setting with a label and an optional default value.
 * 
 * @interface ToggleSetting
 * @property {string} label - The label for the toggle setting.
 * @property {boolean} [defaultValue] - The default value for the toggle setting. Defaults to `false` if not provided.
 */
export interface ToggleSetting {
    label: string,
    defaultValue?: boolean
}

/**
 * Represents an extension for an addon.
 * 
 * @interface AddonExtension
 * 
 * @property {string} eventId - The unique identifier for the event associated with the addon.
 * @property {string} [langKey] - An optional language key for localization purposes.
 * @property {string} [iconPath] - An optional path to the icon representing the addon.
 */
export interface AddonExtension {
    eventId: string;
    langKey?: string;
    iconPath?: string;
}

/**
 * Represents the configuration for an addon.
 * 
 * @interface AddonConfiguration
 * 
 * @property {string} authorId - The unique identifier of the author.
 * @property {string} packId - The unique identifier of the pack.
 * @property {string} iconPath - Optional icon path for the addon, Don't include 'textures/' in the path.
 * @property {AddonSetting[]} [addonSettings] - Optional settings for the addon.
 * @property {string[]} [guideKeys] - Optional guide keys associated with the addon.
 * @property {AddonExtension} [extension] - Optional extension details for the addon.
 */
export interface AddonConfiguration {
    authorId: string;
    packId: string;
    iconPath?: string;
    addonSettings?: AddonSetting[];
    guideKeys?: string[];
    extension?: AddonExtension | AddonExtension[];
}


/**
 * The AcmApi class provides methods to manage addon profiles and handle events related to addon data changes.
 */
export class AcmApi {
    private static initialized: boolean = false;
    private static eventSignal: AcmAfterEvent[] = [];

    private static initializeListener(profile: AddonConfiguration) {
        if (AcmApi.initialized) return;
        AcmApi.initialized = true;
        system.afterEvents.scriptEventReceive.subscribe((event: ScriptEventCommandMessageAfterEvent) => {
            if (event.id === `acm:${profile.authorId}_${profile.packId}`) {
                for (const handler of AcmApi.eventSignal) {
                    handler({ type: 'data_changed', data: AcmApi.loadAddonData(profile) });
                }
            } else {
                const extensions = Array.isArray(profile.extension) ? profile.extension : [profile.extension];
                for (const ext of extensions) {
                    if (event.id === `acm:${profile.authorId}_${profile.packId}.${ext?.eventId}`) {
                        for (const handler of AcmApi.eventSignal) {
                            handler({ type: 'extension_triggerd', player: event.sourceEntity as Player });
                        }
                    }
                }
            }
        })
    }

    /**
     * Subscribes a callback function to the AcmApi event signal.
     * 
     * @param callback - The function to be called when the event signal is triggered.
     * @returns The same callback function that was passed in.
     */
    public static subscribe(callback: AcmAfterEvent): AcmAfterEvent {
        AcmApi.eventSignal.push(callback);
        return callback;
    }

    /**
     * Unsubscribes a callback function from the AcmApi event signal.
     *
     * @param callback - The callback function to be removed from the event signal.
     */
    public static unsubscribe(callback: AcmAfterEvent): void {
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
    public static generateAddonProfile(profile: AddonConfiguration) {
        const dataProfileId: string = `ACM:${profile.authorId}_${profile.packId}`;
        //world.setDynamicProperty(dataProfileId, JSON.stringify(profile));
        let db: ScoreboardObjective | undefined = world.scoreboard.getObjective(dataProfileId);
        if (!db) db = world.scoreboard.addObjective(dataProfileId);
        db!.getParticipants().forEach((i) => { if (db!.getScore(i) === 0) db!.removeParticipant(i) })
        db!.addScore(JSON.stringify(profile), 0);
        AcmApi.initializeListener(profile);
    }

    /**
     * Loads addon data for a given profile.
     *
     * @param profile - The configuration of the addon, including authorId and packId.
     * @returns A Map containing the addon data, or undefined if no data is found.
     */
    public static loadAddonData(profile: AddonConfiguration): Map<string, any> | undefined {
        const dataProfileId: string = `ACM:${profile.authorId}_${profile.packId}`;
        const db: ScoreboardObjective | undefined = world.scoreboard.getObjective(dataProfileId);
        let rawData: string | undefined = undefined;
        db?.getParticipants().forEach((i)=>{if (db.getScore(i) === 1) rawData = i.displayName});
        let saveState: Map<string, any> | undefined = undefined;
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
    public static pushLog(profile: AddonConfiguration, logText: string) {
        const dataProfileId: string = `ACM:${profile.authorId}_${profile.packId}`;
        let db: ScoreboardObjective | undefined = world.scoreboard.getObjective('acm:logs');
        if (!db) db = world.scoreboard.addObjective('acm:logs') as ScoreboardObjective;
        const id: number = db.getParticipants().length;
        const log: AcmLog = { profileId: dataProfileId, logText: logText };
        db.addScore(JSON.stringify(log), id);
    }
}