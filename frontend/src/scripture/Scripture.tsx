import React from "react";
import axios from "axios";
import { ScriptureCatalog } from "./ScriptureCatalog";

interface ScriptureState {
    readonly valid: boolean;
    readonly catalog: ScriptureCatalog | undefined;
    readonly shortcodes: ReadonlyArray<string>;
}

const initialScriptureState = {
    valid: false,
    catalog: undefined,
    shortcodes: [],
} as const;

type ScriptureAction = { type: "scripture_invalid" } | { type: "scripture_set_catalog"; catalog: ScriptureCatalog };

const scripture_reducer = (state: ScriptureState, action: ScriptureAction): ScriptureState => {
    switch (action.type) {
        case "scripture_invalid":
            return {
                ...state,
                valid: false,
            };
        case "scripture_set_catalog":
            return {
                ...state,
                valid: true,
                catalog: action.catalog,
                shortcodes: Object.keys(action.catalog),
            };
    }
};

export interface IScriptureContext {
    state: ScriptureState;
    dispatch: React.Dispatch<ScriptureAction>;
}

export const ScriptureContext = React.createContext<IScriptureContext>({
    state: initialScriptureState,
    dispatch: () => null,
});

export const getScriptureCatalog = async (dispatch: React.Dispatch<ScriptureAction>) => {
    try {
        const resp = await axios.get<ScriptureCatalog>("/api/v1/scripture/catalog");
        dispatch({ type: "scripture_set_catalog", catalog: resp.data });
    } catch (error: any) {
        dispatch({ type: "scripture_invalid" });
        return;
    }
};

export const ScriptureProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const [state, dispatch] = React.useReducer(scripture_reducer, initialScriptureState);

    React.useEffect(
        () => {
            async function bootstrap() {
                dispatch({ type: "scripture_invalid" });
                await getScriptureCatalog(dispatch);
            }
            bootstrap();
        },
        [] // only run once
    );

    return <ScriptureContext.Provider value={{ state, dispatch }}>{children}</ScriptureContext.Provider>;
};
