const config = {
  chains: {
    defiOracleMeta: {
      id: 138,
      name: 'Defi Oracle Meta',
      rpcUrl: process.env.DEFI_ORACLE_META_RPC_URL,
      explorer: process.env.DEFI_ORACLE_META_EXPLORER
    },
    polygon: {
      id: 137,
      name: 'Polygon PoS',
      rpcUrl: process.env.POLYGON_RPC_URL,
      explorer: process.env.POLYGON_EXPLORER
    }
  },
  monitoring: {
    interval: 60000, // 1 minute
    retries: 3,
    timeout: 30000,
    alertThresholds: {
      pendingMessages: 100,
      gasPrice: 500, // in gwei
      blockDelay: 50
    }
  },
  alerts: {
    enabled: true,
    channels: {
      discord: process.env.DISCORD_WEBHOOK_URL,
      email: process.env.ALERT_EMAIL
    },
    severity: {
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW'
    }
  }
};

module.exports = config;
