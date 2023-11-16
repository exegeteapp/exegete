import { ModuleInfo } from "./ScriptureCatalog";
import { makeParser, ModuleParser } from "verseref";

let cache = new Map<string, ModuleParser>();

export const getModuleParser = (module: ModuleInfo, shortcode: string): ModuleParser => {
    if (!cache.has(shortcode)) {
        cache.set(shortcode, makeParser(module.books));
    }

    return cache.get(shortcode)!;
};

export const a = () => {};
