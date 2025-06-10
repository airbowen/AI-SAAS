export interface NetworkConfig {
  endpoints: string[];
  optimization: {
    batchSize: number;
    batchEnabled: boolean;
  };
}

export class BatchProcessor {
  constructor(private batchSize: number) {}

  async add<T>(request: () => Promise<T>): Promise<T> {
    // 批处理逻辑实现
    return request();
  }
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface MetricsService {
  recordSuccess(): void;
  recordError(error: Error): void;
  recordLatency(latencyMs: number): void;
}