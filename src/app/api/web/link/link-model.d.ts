export interface Link {
  id: number;
  name: string;
  url: string;
  logo?: string;
  sort?: number;
  status?: number;
  [key: string]: any;
}

export interface LinkQuery {
  page?: number;
  limit?: number;
  name?: string;
  status?: number;
  [key: string]: any;
}
