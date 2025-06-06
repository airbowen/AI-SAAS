interface AcceleratorConfig {
  enabled: boolean;
  // 使用腾讯云分配的加速域名
  acceleratedEndpoint: string;
  // 原始 OpenAI 域名（用作故障转移）
  originalEndpoint: string;
  // 加速配置
  settings: {
    timeout: number;
    retryCount: number;
    // 用于监控的指标
    metrics: {
      latencyThreshold: number;
      errorRateThreshold: number;
    };
  };
}

const config: AcceleratorConfig = {
  enabled: true,
  // 这里需要替换为腾讯云分配的实际加速域名
  acceleratedEndpoint: "your-ga-endpoint.gaap.tencentcs.com",
  originalEndpoint: "api.openai.com",
  settings: {
    timeout: 10000,
    retryCount: 3,
    metrics: {
      latencyThreshold: 200,
      errorRateThreshold: 0.01
    }
  }
};