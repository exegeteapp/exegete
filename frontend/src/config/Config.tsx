
import React from 'react';
import axios from 'axios';


interface Config {
    recaptcha_site_key: string,
}

interface ConfigState {
    valid: boolean;
    error: string | undefined;
    config: Config | undefined;
}

const initialConfigState = {
    valid: false,
    error: undefined,
    config: undefined,
};

type ConfigAction =
    | { "type": "config_start" }
    | { "type": "config_error", "error": string }
    | { "type": "config_received", "config": Config | undefined };

const config_reducer = (state: ConfigState, action: ConfigAction): ConfigState => {
    switch (action.type) {
        case 'config_start':
            return {
                ...state,
                valid: false,
            }
        case 'config_error':
            return {
                ...state,
                valid: false,
                error: action.error
            }
        case 'config_received':
            return {
                ...state,
                config: action.config,
                valid: true
            }
    }
}

export interface IConfigContext {
    state: ConfigState,
    dispatch: React.Dispatch<ConfigAction>
}

export const ConfigContext = React.createContext<IConfigContext>({
    state: initialConfigState,
    dispatch: () => null
});

const getConfig = async (dispatch: React.Dispatch<ConfigAction>) => {
    try {
        const resp = await axios.get<Config>('/api/v1/config');
        dispatch({type: 'config_received', config: resp.data});
    } catch (error: any) {
        dispatch({type: 'config_error', error: 'exegete.app is temporarily unavailable'});
        return;
    }
}

export const ConfigProvider: React.FC = ({ children }) => {
    const [state, dispatch] = React.useReducer(config_reducer, initialConfigState);

    React.useEffect(() => {
        async function bootstrap() {
            dispatch({type: 'config_start'});
            await getConfig(dispatch);
        }
        bootstrap();
    },
        [] // only run once
    );

    return (
        <ConfigContext.Provider value={{ state, dispatch }}>
            {children}
        </ConfigContext.Provider>
    );
}
