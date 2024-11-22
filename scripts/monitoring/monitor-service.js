const winston = require('winston');
const { ethers } = require('hardhat');
const path = require('path');

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

class MonitoringService {
    constructor(contractAddress, provider) {
        this.contractAddress = contractAddress;
        this.provider = provider;
        this.isRunning = false;
        this.messageCounter = 0;
        this.lastCheckTimestamp = Date.now();

        // Alert thresholds
        this.GAS_PRICE_THRESHOLD = ethers.utils.parseUnits('100', 'gwei');
        this.MESSAGE_LIMIT_PER_MINUTE = 100;
    }

    async initialize() {
        try {
            const CrossChainMessenger = await ethers.getContractFactory('CrossChainMessenger');
            this.contract = CrossChainMessenger.attach(this.contractAddress);

            logger.info('Monitoring service initialized', {
                contractAddress: this.contractAddress
            });
        } catch (error) {
            logger.error('Failed to initialize monitoring service', {
                error: error.message
            });
            throw error;
        }
    }

    async start() {
        if (this.isRunning) {
            logger.warn('Monitoring service is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Monitoring service started');

        // Set up event listeners
        this.contract.on('MessageSent', this.handleMessageSent.bind(this));
        this.contract.on('MessageReceived', this.handleMessageReceived.bind(this));

        // Start periodic checks
        this.checkInterval = setInterval(this.performPeriodicChecks.bind(this), 60000);
    }

    async stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        this.contract.removeAllListeners();
        clearInterval(this.checkInterval);
        logger.info('Monitoring service stopped');
    }

    async handleMessageSent(messageId, sender, recipient, amount) {
        this.messageCounter++;
        logger.info('Message sent', {
            messageId,
            sender,
            recipient,
            amount: amount.toString(),
            counter: this.messageCounter
        });

        // Check rate limiting
        const messagesPerMinute = this.messageCounter;
        if (messagesPerMinute > this.MESSAGE_LIMIT_PER_MINUTE) {
            logger.warn('High message frequency detected', {
                messagesPerMinute,
                threshold: this.MESSAGE_LIMIT_PER_MINUTE
            });
        }
    }

    async handleMessageReceived(messageId, sender, recipient, amount) {
        logger.info('Message received', {
            messageId,
            sender,
            recipient,
            amount: amount.toString()
        });

        // Validate message
        try {
            const recipientBalance = await this.provider.getBalance(recipient);
            logger.info('Recipient balance updated', {
                recipient,
                newBalance: recipientBalance.toString()
            });
        } catch (error) {
            logger.error('Failed to validate message receipt', {
                error: error.message,
                messageId
            });
        }
    }

    async performPeriodicChecks() {
        try {
            // Check contract status
            const isPaused = await this.contract.paused();
            if (isPaused) {
                logger.warn('Contract is currently paused');
            }

            // Check gas prices
            const gasPrice = await this.provider.getGasPrice();
            if (gasPrice.gt(this.GAS_PRICE_THRESHOLD)) {
                logger.warn('High gas price detected', {
                    currentPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
                    threshold: ethers.utils.formatUnits(this.GAS_PRICE_THRESHOLD, 'gwei')
                });
            }

            // Check bridge fee
            const bridgeFee = await this.contract.bridgeFee();
            logger.info('Current bridge fee', {
                fee: ethers.utils.formatEther(bridgeFee)
            });

            // Reset message counter every minute
            this.messageCounter = 0;
            this.lastCheckTimestamp = Date.now();

        } catch (error) {
            logger.error('Error in periodic checks', {
                error: error.message
            });
        }
    }
}

// Export the monitoring service
module.exports = MonitoringService;

// If running directly, start the service
if (require.main === module) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const monitor = new MonitoringService(process.env.CONTRACT_ADDRESS, provider);

    monitor.initialize()
        .then(() => monitor.start())
        .catch(error => {
            logger.error('Failed to start monitoring service', {
                error: error.message
            });
            process.exit(1);
        });
}
