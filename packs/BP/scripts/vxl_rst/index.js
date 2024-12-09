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
    ]
};
AcmApi.generateAddonProfile(spawnManager);
AcmApi.subscribe((event) => {
    if (event.type === AcmEventType.DataChanged) {
        world.setDynamicProperty('vxl_auto:allow_teleport', event.data?.get('allow_entities'));
    }
});
