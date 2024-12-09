import { Block, BlockComponentPlayerInteractEvent, BlockComponentStepOnEvent, BlockComponentTickEvent, BlockCustomComponent, BlockInventoryComponent, BlockPermutation, Container, Dimension, Entity, EntityItemComponent, ItemStack, system } from "@minecraft/server";
import { Vector3 } from "../_lib/vector";
import { MinecraftBlockTypes } from "../_lib/vanilla_data/_module/mojang-block";
export enum ConveyorStateDirection {
    Default = "default",
    Up = "up",
    Down = "down"
}
export class ConveyorBlock {
    public static readonly typeId: string = 'vxl_rst:conveyor';
    public static readonly cardinalDirectionStateId: string = 'minecraft:cardinal_direction';
    public static readonly directionStateId: string = 'vxl:direction';
    public static readonly speed: number = 0.15;

    public static interpolatePositions(startLocation: Vector3, endLocation: Vector3, entity: Entity, speed: number = 0.1) {
        const interpolate: number = system.runInterval(() => {
            const direction = Vector3.normalize(Vector3.subtract(endLocation, startLocation));
            const distance = Vector3.distance(startLocation, endLocation);
            
            if (distance > 0) {
                const moveStep = Vector3.scale(direction, speed);
                startLocation = Vector3.add(startLocation, moveStep);
                
                if (Vector3.distance(startLocation, endLocation) <= speed) {
                    try {
                        entity.teleport(endLocation);
                    } catch (error) {}
                    system.clearRun(interpolate);
                } else {
                    try {
                        entity.teleport(startLocation);
                    } catch (error) {}
                }
            } else {
                system.clearRun(interpolate);
            }
        });
    }

    public static getDirectionalVector(horizontalDirection: string, speed: number = 1): Vector3 {
        let direction: Vector3 = Vector3.ZERO;
        if (horizontalDirection === 'north') direction = new Vector3(0, 0, -1);
        else if (horizontalDirection === 'south') direction = new Vector3(0, 0, 1);
        else if (horizontalDirection === 'east') direction = new Vector3(1, 0, 0);
        else if (horizontalDirection === 'west') direction = new Vector3(-1, 0, 0);
        return direction;
    }
    
    public static getNextLocation(block: Block): Vector3 | undefined {
        const horizontalDirection = block.permutation.getState(ConveyorBlock.cardinalDirectionStateId) as string;
        const verticalDirection = block.permutation.getState(ConveyorBlock.directionStateId) as string;
        let direction: Vector3 = ConveyorBlock.getDirectionalVector(horizontalDirection);
        if (verticalDirection === 'up') direction.y = 1;
    
        let nextBlock: Block | undefined = block.dimension.getBlock(Vector3.add(block.location, direction));
        if (
            !nextBlock && verticalDirection !== 'up' || 
            nextBlock && !nextBlock.hasTag('vxl_rst_conveyor')
        ) direction.y = -1;
        nextBlock = block.dimension.getBlock(Vector3.add(block.location, direction));
        if (nextBlock && nextBlock.hasTag('vxl_rst_conveyor')) {
            return nextBlock.location;
        } else {
            return undefined;
        }
    }
    
    public static getNeighbors(block: Block): ConveyorStateDirection {
        const blockDirection = block.permutation.getState(ConveyorBlock.cardinalDirectionStateId) as string;
        const dimension: Dimension = block.dimension;
    
        if (blockDirection === 'north') {
            // Check for an upward match
            let adjacentBlock: Block | undefined = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, -1)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            } else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, 1)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId) as string;
                    if (currentState === ConveyorStateDirection.Default) return ConveyorStateDirection.Down;
                }
            }
        } else if (blockDirection === 'east') {
            // Check for an upward match
            let adjacentBlock: Block | undefined = dimension.getBlock(Vector3.add(block.location, new Vector3(1, 1, 0)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            } else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(-1, 1, 0)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId) as string;
                    if (currentState === ConveyorStateDirection.Default) return ConveyorStateDirection.Down;
                }
            }
        } else if (blockDirection === 'south') {
            // Check for an upward match
            let adjacentBlock: Block | undefined = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, 1)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            } else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, -1)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId) as string;
                    if (currentState === ConveyorStateDirection.Default) return ConveyorStateDirection.Down;
                }
            }
        } else if (blockDirection === 'west') {
            // Check for an upward match
            let adjacentBlock: Block | undefined = dimension.getBlock(Vector3.add(block.location, new Vector3(-1, 1, 0)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            } else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(1, 1, 0)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId) as string;
                    if (currentState === ConveyorStateDirection.Default) return ConveyorStateDirection.Down;
                }
            }
        }
    
        return ConveyorStateDirection.Default;
    }
}

export class ConveyorMovement implements BlockCustomComponent {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
    }
    onStepOn(event: BlockComponentStepOnEvent): void {
        const location: Vector3 | undefined = ConveyorBlock.getNextLocation(event.block);
        if (event.entity && event.entity.typeId !== 'minecraft:player') {
            
            if (location) {
                const startLocation: Vector3 = new Vector3(event.block.x + 0.5, event.block.y + 0.5, event.block.z + 0.5);
                const endLocation: Vector3 = new Vector3(location.x + 0.5, location.y + 0.5, location.z + 0.5);
                ConveyorBlock.interpolatePositions(startLocation, endLocation, event.entity, ConveyorBlock.speed);
            } else {
                const horizontalDirection = event.block.permutation.getState(ConveyorBlock.cardinalDirectionStateId) as string;
                const velocity: Vector3 = Vector3.divide(ConveyorBlock.getDirectionalVector(horizontalDirection, ConveyorBlock.speed), 2);
                event.entity.applyImpulse(velocity);
            }
        }
    }
}

export class ConveyorAlignment implements BlockCustomComponent {
    constructor() {
        this.onTick = this.onTick.bind(this);
    }
    onTick(event: BlockComponentTickEvent): void {
        const permutation: BlockPermutation = event.block.permutation;
        const currentState = permutation.getState(ConveyorBlock.directionStateId) as string;
        const newPermutation: BlockPermutation = permutation.withState(ConveyorBlock.directionStateId, ConveyorBlock.getNeighbors(event.block));
        const newState = newPermutation.getState(ConveyorBlock.directionStateId) as string;
        if (newState !== currentState) {
            event.block.setPermutation(newPermutation);
        }
    }
    
}

export class ConveyorDevider implements BlockCustomComponent {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
    }
    onStepOn(event: BlockComponentStepOnEvent): void {
        if (!event.entity || event.entity && event.entity.typeId === 'minecraft:player') return;
        const horizontalDirection = event.block.permutation.getState(ConveyorBlock.cardinalDirectionStateId) as 'north' | 'south' | 'east' | 'west';
        const blocked = event.block.permutation.getState("vxl:blocked_direction") as string;
        const lastUsedDirection = event.block.permutation.getState('vxl:last_used_direction') as string;
        const directions: string[] = [];
        let blockedDirection: string = 'none';
    
        const directionMap: { [key: string]: { front: string; left: string; right: string } } = {
            north: { front: 'north', left: 'east', right: 'west' },
            south: { front: 'south', left: 'west', right: 'east' },
            east: { front: 'east', left: 'south', right: 'north' },
            west: { front: 'west', left: 'north', right: 'south' }
        };
    
        const relativeDirections = directionMap[horizontalDirection];
        directions.push(relativeDirections.front, relativeDirections.left, relativeDirections.right);
    
        if (blocked === 'front')      blockedDirection = relativeDirections.front;
        else if (blocked === 'left')  blockedDirection = relativeDirections.left;
        else if (blocked === 'right') blockedDirection = relativeDirections.right;
    
        const filteredDirections = directions.filter(direction => direction !== blockedDirection);
    
        let nextDirectionIndex = 0;
        if (lastUsedDirection) {
            const lastIndex = filteredDirections.indexOf(lastUsedDirection);
            nextDirectionIndex = (lastIndex + 1) % filteredDirections.length;
        }
    
        const selectedDirection: string = filteredDirections[nextDirectionIndex];
        
        const direction: Vector3 = ConveyorBlock.getDirectionalVector(selectedDirection, ConveyorBlock.speed);
        const velocity: Vector3 = Vector3.divide(direction, 2);
        event.entity.applyImpulse(velocity);
        event.block.setPermutation(
            event.block.permutation.withState('vxl:last_used_direction', selectedDirection)
        ); // Update the block with its last used direction
    }
    onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
        const i = event.block.permutation.getState('vxl:blocked_direction') as string;
        let newStateValue: string = 'none';
        if (i === 'none')  newStateValue = 'front';
        if (i === 'front') newStateValue = 'left';
        if (i === 'left')  newStateValue = 'right';
        if (i === 'right')  newStateValue = 'none';
        const permutation: BlockPermutation = event.block.permutation.withState('vxl:blocked_direction', newStateValue).withState('vxl:last_used_direction', 'undefined');
        event.block.setPermutation(permutation);
    }
    
}

export class ConveyorDamage implements BlockCustomComponent {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
    }
    onStepOn(event: BlockComponentStepOnEvent): void {
        if (event.entity?.typeId !== 'minecraft:player' && event.entity?.typeId !== 'minecraft:item') {
            event.entity?.applyDamage(5)
        }
    }
    
}

export class ConveyorFilter implements BlockCustomComponent {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
    }
    onStepOn(event: BlockComponentStepOnEvent): void {
        if (event.entity?.typeId !== 'minecraft:item') return;
        const entityItem = event.entity.getComponent(EntityItemComponent.componentId) as EntityItemComponent;
        const block: Block | undefined = event.block.above();
        const validTypeIds: string[] = getTypeIdsFromBlockInventory(block);
        const horizontalDirection = event.block.permutation.getState(ConveyorBlock.cardinalDirectionStateId) as 'north' | 'south' | 'east' | 'west'; 
        
        let direction: Vector3;
        if (validTypeIds.includes(entityItem.itemStack.typeId)) {
            // Throw left
            switch (horizontalDirection) {
                case 'north':
                    direction = new Vector3(ConveyorBlock.speed, 0, 0); // right relative to north
                    break;
                case 'south':
                    direction = new Vector3(-ConveyorBlock.speed, 0, 0); // right relative to south
                    break;
                case 'east':
                    direction = new Vector3(0, 0, -ConveyorBlock.speed); // right relative to east
                    break;
                case 'west':
                    direction = new Vector3(0, 0, ConveyorBlock.speed); // right relative to west
                    break;
            }
        } else {
            // Throw right
            switch (horizontalDirection) {
                case 'north':
                    direction = new Vector3(-ConveyorBlock.speed, 0, 0); // left relative to north
                    break;
                case 'south':
                    direction = new Vector3(ConveyorBlock.speed, 0, 0); // left relative to south
                    break;
                case 'east':
                    direction = new Vector3(0, 0, ConveyorBlock.speed); // left relative to east
                    break;
                case 'west':
                    direction = new Vector3(0, 0, -ConveyorBlock.speed); // left relative to west
                    break;
            }
        }
    
        event.entity.applyImpulse(Vector3.multiply(direction, 2));
    }
}

function getTypeIdsFromBlockInventory(block: Block | undefined): string[] {
    if (!block || block &&
        (
            block.typeId !== MinecraftBlockTypes.Chest &&
            block.typeId !== MinecraftBlockTypes.Barrel
        )
    ) return [];
    const inventoryComponent = block.getComponent(BlockInventoryComponent.componentId) as BlockInventoryComponent;
    const container: Container | undefined = inventoryComponent.container;
    if (!container) throw Error(`Error reading container of ${block.typeId}`)
    const typeIds: string[] = [];
    for (let i = 0; i < container.size; i++) {
        const itemStack: ItemStack | undefined = container.getItem(i);
        if (itemStack) typeIds.push(itemStack.typeId);
    }
    return typeIds;
}