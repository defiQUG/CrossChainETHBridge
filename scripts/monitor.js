const { ethers } = require('hardhat');

async function main() {
    console.log('Starting Cross-Chain Message Monitor...');

    try {
        // Get contract artifacts
        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        const MockRouter = await ethers.getContractFactory("MockRouter");

        // Get deployed contract addresses from environment or config
        const mockRouterAddress = process.env.MOCK_ROUTER_ADDRESS;
        const crossChainMessengerAddress = process.env.CROSS_CHAIN_MESSENGER_ADDRESS;

        // Create contract instances
        const mockRouter = MockRouter.attach(mockRouterAddress);
        const crossChainMessenger = CrossChainMessenger.attach(crossChainMessengerAddress);

        // Listen for events
        console.log('Listening for cross-chain events...');

        crossChainMessenger.on("MessageSent", (sender, recipient, amount, messageId, event) => {
            console.log('\nMessage Sent Event:');
            console.log('Sender:', sender);
            console.log('Recipient:', recipient);
            console.log('Amount:', ethers.utils.formatEther(amount), 'ETH');
            console.log('Message ID:', messageId);
            console.log('Transaction Hash:', event.transactionHash);
        });

        crossChainMessenger.on("MessageReceived", (messageId, sourceChainSelector, sender, event) => {
            console.log('\nMessage Received Event:');
            console.log('Message ID:', messageId);
            console.log('Source Chain:', sourceChainSelector);
            console.log('Sender:', sender);
            console.log('Transaction Hash:', event.transactionHash);
        });

        // Keep the process running
        process.stdin.resume();

        // Handle cleanup
        process.on('SIGINT', () => {
            console.log('Monitor shutting down...');
            process.exit();
        });
    } catch (error) {
        console.error('Error in monitor service:', error);
        process.exit(1);
    }
}

main()
    .then(() => console.log('Monitor service started successfully'))
    .catch((error) => {
        console.error('Failed to start monitor service:', error);
        process.exit(1);
    });
