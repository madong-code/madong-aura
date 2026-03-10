export * from '@/utils/http';



export const getApiBaseUrl = (customValue?: string | null): string => {
    const getBaseUrl = (value: string): string => {
        // 如果是 useCurrentDomain，返回当前域名并添加 /adminapi
        if (value === 'useCurrentDomain') {
            const currentDomain = window.location.protocol + '//' + window.location.host;
            return currentDomain + '/adminapi';
        }

        // 如果是完整 URL，直接返回
        if (/^https?:\/\//i.test(value)) {
            return value;
        }

        // 如果是相对路径，确保以 / 开头
        const normalizedPath = value.replace(/^\/+/, '');

        // 如果是当前域名，添加 /adminapi
        if (normalizedPath === '') {
            return window.location.protocol + '//' + window.location.host + '/adminapi';
        }

        // 如果已经是 /adminapi 开头，直接返回
        if (normalizedPath.startsWith('adminapi')) {
            return window.location.protocol + '//' + window.location.host + '/' + normalizedPath;
        }

        // 其他相对路径，添加当前域名
        return window.location.protocol + '//' + window.location.host + '/' + normalizedPath;
    };

    if (customValue) {
        return getBaseUrl(customValue);
    }

    const envValue = import.meta.env.VITE_API_URL;
    if (envValue) {
        return getBaseUrl(envValue);
    }

    // 默认返回当前域名 + /adminapi
    return window.location.protocol + '//' + window.location.host + '/adminapi';
}