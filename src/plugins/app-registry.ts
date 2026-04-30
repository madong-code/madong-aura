import type { App } from 'vue';

export interface AppPlugin {
    name: string;
    install: (app: App) => void;
    dependencies?: string[];
}

const registeredApps: Set<string> = new Set();

export function defineAppPlugin(plugin: AppPlugin): AppPlugin {
    return plugin;
}

/**
 * Register all app plugins
 */
export function registerAllApps(app: App): void {
    console.info('=== [AppRegistry] Starting plugin registration ===');

    // @ts-ignore
    const modules = import.meta.glob('../apps/*/index.ts', { eager: true });
    const paths = Object.keys(modules);

    console.info(`[AppRegistry] Found ${paths.length} app modules`);
    console.info(`[AppRegistry] Paths:`, paths);

    if (paths.length === 0) {
        console.info('[AppRegistry] No apps found to register');
        return;
    }

    let registeredCount = 0;

    for (const path of paths) {
        // @ts-ignore
        const module = modules[path];
        const appPlugin = module.default || module;

        if (!appPlugin) {
            console.warn(`[AppRegistry] Skipping: ${path} (no default export)`);
            continue;
        }

        if (!appPlugin.name) {
            console.warn(`[AppRegistry] Skipping: ${path} (missing name)`);
            continue;
        }

        if (typeof appPlugin.install !== 'function') {
            console.warn(`[AppRegistry] Skipping: ${appPlugin.name} (missing install function)`);
            continue;
        }

        if (registeredApps.has(appPlugin.name)) {
            console.info(`[AppRegistry] Skipping: ${appPlugin.name} (already registered)`);
            continue;
        }

        console.info(`[AppRegistry] Registering: ${appPlugin.name}`);

        appPlugin.install(app);
        registeredApps.add(appPlugin.name);
        registeredCount++;
    }

    console.info(`=== [AppRegistry] Registration complete. Registered ${registeredCount} plugins ===`);
}

export function collectPluginDependencies(): string[] {
    const deps: string[] = [];

    try {
        // @ts-ignore
        const modules = import.meta.glob('../apps/*/index.ts', { eager: true });

        for (const path in modules) {
            // @ts-ignore
            const module = modules[path];
            const appPlugin = module.default || module;

            if (appPlugin && appPlugin.dependencies && Array.isArray(appPlugin.dependencies)) {
                deps.push(...appPlugin.dependencies);
            }
        }
    } catch (e) {
        // Ignore error in Node.js environment
    }

    return [...new Set(deps)];
}