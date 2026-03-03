
export interface ModuleRow {
    name: string;
    title: string;
    version: string;
    description: string;
    author: string;
    created_at: string;
    updated_at: string;
    is_installed: boolean;
    installed_version: string;
    enable: boolean;
    logo: string;
    tags?: any;
}