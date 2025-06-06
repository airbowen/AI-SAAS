interface NetworkConfig {
  globalAccelerator: {
    enabled: boolean;
    endpoints: string[];
    region: string;
  };
  cache: {
    local: {
      enabled: boolean;
      maxSize: number;
      ttl: number;
    };
    redis: {
      enabled: boolean;
      url: string;
    };
  };
  optimization: {
    batchSize: number;
    preloadEnabled: boolean;
    requestMergeWindow: number;
  };
}

const defaultConfig: NetworkConfig = {
  globalAccelerator: {
    enabled: true,
    endpoints: [
      "openai-hk.tencentcloudapi.com",
      "openai-sg.tencentcloudapi.com",
      "openai-jp.tencentcloudapi.com"
    ],
    region: "ap-hongkong"
  },
  cache: {
    local: {
      enabled: true,
      maxSize: 1000,
      ttl: 3600
    },
    redis: {
      enabled: true,
      url: process.env.REDIS_URL || ""
    }
  },
  optimization: {
    batchSize: 10,
    preloadEnabled: true,
    requestMergeWindow: 100
  }
};