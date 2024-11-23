require('dotenv').config();

module.exports = {
    networks: {
        polygon: {
            chainId: 137,
            name: 'Polygon PoS',
            rpc: process.env.POLYGON_RPC || 'https://polygon-rpc.com'
        },
        defiOracle: {
            chainId: 138,
            name: 'Defi Oracle Meta',
            rpc: process.env.DEFI_ORACLE_RPC
        }
    },
    contracts: {
        CrossChainMessenger: process.env.CROSS_CHAIN_MESSENGER_ADDRESS
    },
    monitoring: {
        interval: 60000,
        retries: 3,
        timeout: 30000
    },
    alerts: {
        maxMessagesPer1h: 100,
        minBalance: '1000000000000000000'
    }
};
