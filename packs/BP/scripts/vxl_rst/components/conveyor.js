import { BlockInventoryComponent, EntityItemComponent, system } from "@minecraft/server";
import { Vector3 } from "../_lib/vector";
import { MinecraftBlockTypes } from "../_lib/vanilla_data/_module/mojang-block";
export var ConveyorStateDirection;
(function (ConveyorStateDirection) {
    ConveyorStateDirection["Default"] = "default";
    ConveyorStateDirection["Up"] = "up";
    ConveyorStateDirection["Down"] = "down";
})(ConveyorStateDirection || (ConveyorStateDirection = {}));
export class ConveyorBlock {
    static interpolatePositions(startLocation, endLocation, entity, speed = 0.1) {
        const interpolate = system.runInterval(() => {
            const direction = Vector3.normalize(Vector3.subtract(endLocation, startLocation));
            const distance = Vector3.distance(startLocation, endLocation);
            if (distance > 0) {
                const moveStep = Vector3.scale(direction, speed);
                startLocation = Vector3.add(startLocation, moveStep);
                if (Vector3.distance(startLocation, endLocation) <= speed) {
                    try {
                        entity.teleport(endLocation);
                    }
                    catch (error) { }
                    system.clearRun(interpolate);
                }
                else {
                    try {
                        entity.teleport(startLocation);
                    }
                    catch (error) { }
                }
            }
            else {
                system.clearRun(interpolate);
            }
        });
    }
    static getDirectionalVector(horizontalDirection, speed = 1) {
        let direction = Vector3.ZERO;
        if (horizontalDirection === 'north')
            direction = new Vector3(0, 0, -1);
        else if (horizontalDirection === 'south')
            direction = new Vector3(0, 0, 1);
        else if (horizontalDirection === 'east')
            direction = new Vector3(1, 0, 0);
        else if (horizontalDirection === 'west')
            direction = new Vector3(-1, 0, 0);
        return direction;
    }
    static getNextLocation(block) {
        const horizontalDirection = block.permutation.getState(ConveyorBlock.cardinalDirectionStateId);
        const verticalDirection = block.permutation.getState(ConveyorBlock.directionStateId);
        let direction = ConveyorBlock.getDirectionalVector(horizontalDirection);
        if (verticalDirection === 'up')
            direction.y = 1;
        let nextBlock = block.dimension.getBlock(Vector3.add(block.location, direction));
        if (!nextBlock && verticalDirection !== 'up' ||
            nextBlock && !nextBlock.hasTag('vxl_rst_conveyor'))
            direction.y = -1;
        nextBlock = block.dimension.getBlock(Vector3.add(block.location, direction));
        if (nextBlock && nextBlock.hasTag('vxl_rst_conveyor')) {
            return nextBlock.location;
        }
        else {
            return undefined;
        }
    }
    static getNeighbors(block) {
        const blockDirection = block.permutation.getState(ConveyorBlock.cardinalDirectionStateId);
        const dimension = block.dimension;
        if (blockDirection === 'north') {
            // Check for an upward match
            let adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, -1)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            }
            else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, 1)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId);
                    if (currentState === ConveyorStateDirection.Default)
                        return ConveyorStateDirection.Down;
                }
            }
        }
        else if (blockDirection === 'east') {
            // Check for an upward match
            let adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(1, 1, 0)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            }
            else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(-1, 1, 0)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId);
                    if (currentState === ConveyorStateDirection.Default)
                        return ConveyorStateDirection.Down;
                }
            }
        }
        else if (blockDirection === 'south') {
            // Check for an upward match
            let adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, 1)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            }
            else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(0, 1, -1)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId);
                    if (currentState === ConveyorStateDirection.Default)
                        return ConveyorStateDirection.Down;
                }
            }
        }
        else if (blockDirection === 'west') {
            // Check for an upward match
            let adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(-1, 1, 0)));
            if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                return ConveyorStateDirection.Up;
            }
            else {
                // Check for a downward match
                adjacentBlock = dimension.getBlock(Vector3.add(block.location, new Vector3(1, 1, 0)));
                if (adjacentBlock?.hasTag('vxl_rst_conveyor')) {
                    const currentState = adjacentBlock.permutation.getState(ConveyorBlock.directionStateId);
                    if (currentState === ConveyorStateDirection.Default)
                        return ConveyorStateDirection.Down;
                }
            }
        }
        return ConveyorStateDirection.Default;
    }
}
ConveyorBlock.typeId = 'vxl_rst:conveyor';
ConveyorBlock.cardinalDirectionStateId = 'minecraft:cardinal_direction';
ConveyorBlock.directionStateId = 'vxl:direction';
ConveyorBlock.speed = 0.15;
export class ConveyorMovement {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
    }
    onStepOn(event) {
        const location = ConveyorBlock.getNextLocation(event.block);
        if (event.entity && event.entity.typeId !== 'minecraft:player') {
            if (location) {
                const startLocation = new Vector3(event.block.x + 0.5, event.block.y + 0.5, event.block.z + 0.5);
                const endLocation = new Vector3(location.x + 0.5, location.y + 0.5, location.z + 0.5);
                ConveyorBlock.interpolatePositions(startLocation, endLocation, event.entity, ConveyorBlock.speed);
            }
            else {
                const horizontalDirection = event.block.permutation.getState(ConveyorBlock.cardinalDirectionStateId);
                const velocity = Vector3.divide(ConveyorBlock.getDirectionalVector(horizontalDirection, ConveyorBlock.speed), 2);
                event.entity.applyImpulse(velocity);
            }
        }
    }
}
export class ConveyorAlignment {
    constructor() {
        this.onTick = this.onTick.bind(this);
    }
    onTick(event) {
        const permutation = event.block.permutation;
        const currentState = permutation.getState(ConveyorBlock.directionStateId);
        const newPermutation = permutation.withState(ConveyorBlock.directionStateId, ConveyorBlock.getNeighbors(event.block));
        const newState = newPermutation.getState(ConveyorBlock.directionStateId);
        if (newState !== currentState) {
            event.block.setPermutation(newPermutation);
        }
    }
}
export class ConveyorDevider {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
    }
    onStepOn(event) {
        if (!event.entity || event.entity && event.entity.typeId === 'minecraft:player')
            return;
        const horizontalDirection = event.block.permutation.getState(ConveyorBlock.cardinalDirectionStateId);
        const blocked = event.block.permutation.getState("vxl:blocked_direction");
        const lastUsedDirection = event.block.permutation.getState('vxl:last_used_direction');
        const directions = [];
        let blockedDirection = 'none';
        const directionMap = {
            north: { front: 'north', left: 'east', right: 'west' },
            south: { front: 'south', left: 'west', right: 'east' },
            east: { front: 'east', left: 'south', right: 'north' },
            west: { front: 'west', left: 'north', right: 'south' }
        };
        const relativeDirections = directionMap[horizontalDirection];
        directions.push(relativeDirections.front, relativeDirections.left, relativeDirections.right);
        if (blocked === 'front')
            blockedDirection = relativeDirections.front;
        else if (blocked === 'left')
            blockedDirection = relativeDirections.left;
        else if (blocked === 'right')
            blockedDirection = relativeDirections.right;
        const filteredDirections = directions.filter(direction => direction !== blockedDirection);
        let nextDirectionIndex = 0;
        if (lastUsedDirection) {
            const lastIndex = filteredDirections.indexOf(lastUsedDirection);
            nextDirectionIndex = (lastIndex + 1) % filteredDirections.length;
        }
        const selectedDirection = filteredDirections[nextDirectionIndex];
        const direction = ConveyorBlock.getDirectionalVector(selectedDirection, ConveyorBlock.speed);
        const velocity = Vector3.divide(direction, 2);
        event.entity.applyImpulse(velocity);
        event.block.setPermutation(event.block.permutation.withState('vxl:last_used_direction', selectedDirection)); // Update the block with its last used direction
    }
    onPlayerInteract(event) {
        const i = event.block.permutation.getState('vxl:blocked_direction');
        let newStateValue = 'none';
        if (i === 'none')
            newStateValue = 'front';
        if (i === 'front')
            newStateValue = 'left';
        if (i === 'left')
            newStateValue = 'right';
        if (i === 'right')
            newStateValue = 'none';
        const permutation = event.block.permutation.withState('vxl:blocked_direction', newStateValue).withState('vxl:last_used_direction', 'undefined');
        event.block.setPermutation(permutation);
    }
}
export class ConveyorDamage {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
    }
    onStepOn(event) {
        if (event.entity?.typeId !== 'minecraft:player' && event.entity?.typeId !== 'minecraft:item') {
            event.entity?.applyDamage(5);
        }
    }
}
export class ConveyorFilter {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
    }
    onStepOn(event) {
        if (event.entity?.typeId !== 'minecraft:item')
            return;
        const entityItem = event.entity.getComponent(EntityItemComponent.componentId);
        const block = event.block.above();
        const validTypeIds = getTypeIdsFromBlockInventory(block);
        const horizontalDirection = event.block.permutation.getState(ConveyorBlock.cardinalDirectionStateId);
        let direction;
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
        }
        else {
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
function getTypeIdsFromBlockInventory(block) {
    if (!block || block &&
        (block.typeId !== MinecraftBlockTypes.Chest &&
            block.typeId !== MinecraftBlockTypes.Barrel))
        return [];
    const inventoryComponent = block.getComponent(BlockInventoryComponent.componentId);
    const container = inventoryComponent.container;
    if (!container)
        throw Error(`Error reading container of ${block.typeId}`);
    const typeIds = [];
    for (let i = 0; i < container.size; i++) {
        const itemStack = container.getItem(i);
        if (itemStack)
            typeIds.push(itemStack.typeId);
    }
    return typeIds;
}
