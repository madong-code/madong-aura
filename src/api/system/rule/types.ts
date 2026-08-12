export type HttpMethod = 'delete' | 'get' | 'patch' | 'post' | 'put';

export interface RouteRow {
  name: string;
  method: Uppercase<HttpMethod>;
  path: string;
  title?: string;
  type?: number;
  code?: string;
}
