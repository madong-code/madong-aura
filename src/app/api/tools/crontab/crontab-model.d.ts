/**
 * 定时任务接口
 */
export interface CrontabRow {
    id: string;
    biz_id: string;
    title: string;
    type: number;
    task_cycle: number;
    cycle_rule: string;
    rule: string;
    target: string;
    running_times: string | number;
    last_running_time: string | number;
    enabled: number;
}


export interface CrontabLogRow {
    id: string;
    crontab_id: string;
    target: string;
    log: string;
    return_code: string;
    running_time: string;
}