export interface RedisMonitorData {
  [key: string]: any;
}

export interface RedisVariableInfo {
  redis_version: string;
  redis_git_sha1: number | string;
  redis_git_dirty: number;
  redis_build_id: string;
  redis_mode: 'cluster' | 'standalone';
  os: string;
  arch_bits: 32 | 64;
  multiplexing_api: string;
  process_id: number;
  run_id: string;
  tcp_port: number;
  uptime_in_seconds: number;
  uptime_in_days: number;
  hz: number;
  lru_clock: number;
  config_file: string;
  client_longest_output_list: number;
  client_biggest_input_buf: number;
  blocked_clients: number;
  used_memory: number;
  used_memory_human: string;
  used_memory_rss: number;
  used_memory_peak: number;
  used_memory_peak_human: string;
  used_memory_lua: number;
  mem_fragmentation_ratio: number;
  mem_allocator: string;
  connected_clients: number;
  total_connections_received: number;
  total_commands_processed: number;
  instantaneous_ops_per_sec: number;
  instantaneous_input_kbps: number;
  instantaneous_output_kbps: number;
  keyspace_hits: number;
  keyspace_misses: number;
  expired_keys: number;
  evicted_keys: number;
  rdb_changes_since_last_save: number;
  aof_enabled: number;
  role: string;
}
