export interface GatewayLimiterRow {
  id: string;
  name: string;
  match_type: string;
  ip: string;
  priority: number;
  methods: string;
  path: string;
  limit_type: string;
  limit_value: number;
  period: number;
  enabled: number;
  message: string;
  created_date: string;
}

export interface GatewayBlacklistRow {
  id: string;
  ip: string;
  name: string;
  enabled: number;
  priority: number;
  methods: string;
  path: string;
  message: string;
  start_date: string;
  end_date: string;
  created_date: string;
  remark: string;
}
