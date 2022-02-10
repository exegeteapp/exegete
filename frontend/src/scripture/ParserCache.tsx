import { ModuleInfo } from "./ScriptureCatalog";
import { makeModuleParser, ModuleParser } from "../verseref/VerseRef";

let cache = new Map<string, ModuleParser>();

export const getModuleParser = (module: ModuleInfo, shortcode: string): ModuleParser => {
    if (!cache.has(shortcode)) {
        cache.set(shortcode, makeModuleParser(module));
    }

    return cache.get(shortcode)!;
};

export const a = () => {};
