import { MinecraftBlockTypes } from "../_lib/vanilla_data/_module/mojang-block";
export class RedstoneInput {
    constructor() {
        this.onTick = this.onTick.bind(this);
    }
    onTick(event) {
        const neighbors = [];
        neighbors.push(event.block.north());
        neighbors.push(event.block.south());
        neighbors.push(event.block.east());
        neighbors.push(event.block.west());
        neighbors.push(event.block.above());
        neighbors.push(event.block.below());
        neighbors.forEach((block) => {
            if (!block)
                return;
            let isNearSource = false;
            let signalStrengthTotal = 0;
            if (block.typeId === MinecraftBlockTypes.RedstoneWire) {
                signalStrengthTotal += RedstoneBlocks.parseRedstoneDust(block);
                isNearSource = true;
            }
            if (block.typeId === MinecraftBlockTypes.RedstoneTorch) {
                signalStrengthTotal += RedstoneBlocks.parseRedstoneTorch(block);
                isNearSource = true;
            }
            if (!isNearSource)
                return;
            console.warn(signalStrengthTotal);
        });
    }
}
class RedstoneBlocks {
    static parseRedstoneDust(redstoneDust) {
        const redstoneSignal = redstoneDust.permutation.getState(RedstoneBlocks.stateId.redstoneSignal);
        return redstoneSignal;
    }
    static parseRedstoneTorch(redstoneTorch) {
        return 15;
    }
}
RedstoneBlocks.maxSignalStrength = 15;
RedstoneBlocks.stateId = {
    redstoneSignal: "redstone_signal"
};
