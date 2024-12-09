import { world } from "@minecraft/server";
import { ConveyorAlignment, ConveyorDamage, ConveyorDevider, ConveyorFilter, ConveyorMovement } from "./components/conveyor";
import { AcmApi, AcmEventData, AcmEventType, AddonConfiguration } from "./_lib/acm_api";
import { RedstoneInput } from "./components/redstone";

world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_alignment', new ConveyorAlignment());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_movement', new ConveyorMovement());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_devide', new ConveyorDevider());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_damage', new ConveyorDamage());
    initEvent.blockComponentRegistry.registerCustomComponent('vxl_rst:conveyor_filter', new ConveyorFilter());
});

const spawnManager: AddonConfiguration = {
    authorId: 'vxl',
    packId: 'rst',
    iconPath: 'voxel/vxl_rst/pack_icon',
    addonSettings: [
        {
            label: 'allow_entities',
            defaultValue: true
        }
    ]
}
AcmApi.generateAddonProfile(spawnManager);
AcmApi.subscribe((event: AcmEventData)=>{
    if (event.type === AcmEventType.DataChanged) {
        world.setDynamicProperty('vxl_auto:allow_teleport', event.data?.get('allow_entities'));
    }
})