import { world } from "@minecraft/server";
import { ConveyorAlignment, ConveyorDamage, ConveyorDevider, ConveyorFilter, ConveyorMovement } from "./components/conveyor";
import { AcmApi, AcmEventType } from "./_lib/acm_api";
world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_alignment', new ConveyorAlignment());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_movement', new ConveyorMovement());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_devide', new ConveyorDevider());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_damage', new ConveyorDamage());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_filter', new ConveyorFilter());
});
const spawnManager = {
    authorId: 'vxl',
    packId: 'rst',
    iconPath: 'voxel/vxl_rst/pack_icon',
    addonSettings: [
        {
            label: 'allow_entities',
            defaultValue: true
        }
    ],
    guideKeys: [
        "guide.intro",
        "guide.conveyors_title",
        "guide.conveyors_desc",
        "guide.conveyors_durability",
        "guide.spiked_conveyors_title",
        "guide.spiked_conveyors_desc",
        "guide.spiked_conveyors_stats",
        "guide.dividers_title",
        "guide.dividers_desc",
        "guide.dividers_toggle",
        "guide.dividers_durability",
        "guide.filters_title",
        "guide.filters_desc",
        "guide.filters_control",
        "guide.filters_durability",
        "guide.tiers_title",
        "guide.tiers_desc",
        "guide.tiers_benefits",
        "guide.speed_title",
        "guide.speed_desc",
        "guide.speed_behavior"
    ]
};
AcmApi.generateAddonProfile(spawnManager);
AcmApi.subscribe((event) => {
    if (event.type === AcmEventType.DataChanged) {
        world.setDynamicProperty('vxl_auto:allow_teleport', event.data?.get('allow_entities'));
    }
});
