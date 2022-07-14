import { ModuleInfo } from "../scripture/ScriptureCatalog";
import { Database, MakeGospelParallelsDatabase } from "./GospelParallels";

let cache = new Map<string, Database>();

export const getParallelDatabase = (module: ModuleInfo, shortcode: string): Database => {
    if (!cache.has(shortcode)) {
        cache.set(shortcode, MakeGospelParallelsDatabase(module, shortcode));
    }
    return cache.get(shortcode)!;
};

export const a = () => {};
