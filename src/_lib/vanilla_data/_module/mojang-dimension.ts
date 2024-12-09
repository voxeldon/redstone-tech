/**
 * All possible MinecraftDimensionTypes
 */
export enum MinecraftDimensionTypes {
    Nether = "minecraft:nether",
    Overworld = "minecraft:overworld",
    TheEnd = "minecraft:the_end"
}
/**
 * Union type equivalent of the MinecraftDimensionTypes enum.
 */
export type MinecraftDimensionTypesUnion = keyof typeof MinecraftDimensionTypes;
