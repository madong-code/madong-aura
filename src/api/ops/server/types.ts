export interface ServerInfo {
  cpu: CpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo[];
  php: PhpInfo;
}

export interface CpuInfo {
  cpu_name: string;
  physical_cores: string;
  logical_cores: string;
  cache_size_mb: number;
  cpu_usage_percentage: number;
  free_cpu_percentage: number;
}

export interface MemoryInfo {
  total_memory: number;
  available_memory: number;
  used_memory: number;
  php_memory_usage: number;
  memory_usage_rate: string;
}

export interface DiskInfo {
  filesystem: string;
  size: string;
  available: string;
  used: string;
  use_percentage: string;
  mounted_on: string;
}

export interface PhpInfo {
  php_version: string;
  os: string;
  project_path: string;
  memory_limit: string;
  max_execution_time: string;
  error_reporting: string;
  display_errors: 'off' | 'on';
  upload_max_filesize: string;
  post_max_size: string;
  extension_dir: string;
  loaded_extensions: string;
}
