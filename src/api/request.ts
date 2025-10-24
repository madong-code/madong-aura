export * from '@/utils/http';



export const getApiBaseUrl = (customValue?: string | null): string => {
    if (customValue) {
        return customValue === 'useCurrentDomain'
            ? window.location.protocol + '//' + window.location.host
            : customValue;
    }

    const envValue = import.meta.env.VITE_GLOB_API_URL;
    if (envValue) {
        return envValue === 'useCurrentDomain'
            ? window.location.protocol + '//' + window.location.host
            : envValue;
    }
    return window.location.protocol + '//' + window.location.host;
}