import { AxiosRequestConfig } from 'axios';

export const ApiAxiosRequestConfig = (): AxiosRequestConfig => {
    return {
        headers: {
                'Content-Type': 'application/json',
        }
    }
}