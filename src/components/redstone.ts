import { Block, BlockComponentTickEvent, BlockCustomComponent } from "@minecraft/server";
import { MinecraftBlockTypes } from "../_lib/vanilla_data/_module/mojang-block";

export class RedstoneInput implements BlockCustomComponent {
    constructor() {
        this.onTick = this.onTick.bind(this);
    }
    onTick(event: BlockComponentTickEvent): void {
        const neighbors: (Block | undefined)[] = [];
        neighbors.push(event.block.north());
        neighbors.push(event.block.south());
        neighbors.push(event.block.east());
        neighbors.push(event.block.west());
        neighbors.push(event.block.above());
        neighbors.push(event.block.below());
        neighbors.forEach((block: Block | undefined)=>{
            if (!block) return;
            let isNearSource: boolean = false;
            let signalStrengthTotal: number = 0;
            if (block.typeId === MinecraftBlockTypes.RedstoneWire) {
                signalStrengthTotal += RedstoneBlocks.parseRedstoneDust(block);
                isNearSource = true;
            }
            if (block.typeId === MinecraftBlockTypes.RedstoneTorch) {
                signalStrengthTotal += RedstoneBlocks.parseRedstoneTorch(block);
                isNearSource = true;
            }
            if (!isNearSource) return;
            console.warn(signalStrengthTotal);
        })
    }
    
}

class RedstoneBlocks{
    private static readonly maxSignalStrength: number = 15;
    private static readonly stateId = {
        redstoneSignal: "redstone_signal"
    }
    public static parseRedstoneDust(redstoneDust: Block): number {
        const redstoneSignal = redstoneDust.permutation.getState(RedstoneBlocks.stateId.redstoneSignal) as number;
        return redstoneSignal;
    }

    public static parseRedstoneTorch(redstoneTorch: Block): number {
        return 15;
    }
}