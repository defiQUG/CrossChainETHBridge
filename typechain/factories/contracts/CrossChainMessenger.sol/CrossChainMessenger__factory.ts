/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  CrossChainMessenger,
  CrossChainMessengerInterface,
} from "../../../contracts/CrossChainMessenger.sol/CrossChainMessenger";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "BridgeFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "EmergencyWithdraw",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "MessageReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "MessageSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_MESSAGES_PER_HOUR",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "POLYGON_CHAIN_SELECTOR",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "bridgeFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "messageId",
            type: "bytes32",
          },
          {
            internalType: "uint64",
            name: "sourceChainSelector",
            type: "uint64",
          },
          {
            internalType: "bytes",
            name: "sender",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct Client.EVMTokenAmount[]",
            name: "destTokenAmounts",
            type: "tuple[]",
          },
        ],
        internalType: "struct Client.Any2EVMMessage",
        name: "message",
        type: "tuple",
      },
    ],
    name: "ccipReceive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_recipient",
        type: "address",
      },
    ],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "messageCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "contract IRouterClient",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
    ],
    name: "sendToPolygon",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newFee",
        type: "uint256",
      },
    ],
    name: "updateBridgeFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b506040516110c73803806110c783398101604081905261002f916101e2565b33806000816100855760405162461bcd60e51b815260206004820152601860248201527f43616e6e6f7420736574206f776e657220746f207a65726f000000000000000060448201526064015b60405180910390fd5b600080546001600160a01b0319166001600160a01b03848116919091179091558116156100b5576100b581610139565b50506001600255506003805460ff191690556001600160a01b03811661011d5760405162461bcd60e51b815260206004820152601660248201527f496e76616c696420726f75746572206164647265737300000000000000000000604482015260640161007c565b6001600160a01b031660805266038d7ea4c68000600455610212565b336001600160a01b038216036101915760405162461bcd60e51b815260206004820152601760248201527f43616e6e6f74207472616e7366657220746f2073656c66000000000000000000604482015260640161007c565b600180546001600160a01b0319166001600160a01b0383811691821790925560008054604051929316917fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae12789190a350565b6000602082840312156101f457600080fd5b81516001600160a01b038116811461020b57600080fd5b9392505050565b608051610e8c61023b600039600081816102b50152818161047101526107b00152610e8c6000f3fe6080604052600436106100ec5760003560e01c806379ba50971161008a5780638da5cb5b116100595780638da5cb5b14610223578063a98de88814610255578063f2fde38b14610283578063f887ea40146102a357600080fd5b806379ba5097146101c357806382b12dd7146101d85780638456cb59146101ee57806385572ffb1461020357600080fd5b806354143833116100c6578063541438331461014d5780635a1c0366146101605780635c975abb146101805780636ff1c9bc146101a357600080fd5b80632366af53146100f85780633f4ba83a14610120578063529c75881461013757600080fd5b366100f357005b600080fd5b34801561010457600080fd5b5061010d606481565b6040519081526020015b60405180910390f35b34801561012c57600080fd5b506101356102d7565b005b34801561014357600080fd5b5061010d60055481565b61013561015b366004610c0f565b6102e9565b34801561016c57600080fd5b5061013561017b366004610c33565b610571565b34801561018c57600080fd5b5060035460ff166040519015158152602001610117565b3480156101af57600080fd5b506101356101be366004610c0f565b6105b4565b3480156101cf57600080fd5b506101356106e3565b3480156101e457600080fd5b5061010d60045481565b3480156101fa57600080fd5b5061013561078d565b34801561020f57600080fd5b5061013561021e366004610c4c565b61079d565b34801561022f57600080fd5b506000546001600160a01b03165b6040516001600160a01b039091168152602001610117565b34801561026157600080fd5b5061026a608981565b60405167ffffffffffffffff9091168152602001610117565b34801561028f57600080fd5b5061013561029e366004610c0f565b610978565b3480156102af57600080fd5b5061023d7f000000000000000000000000000000000000000000000000000000000000000081565b6102df610989565b6102e76109dc565b565b6102f1610a2e565b6102f9610a85565b60045434116103455760405162461bcd60e51b8152602060048201526013602482015272125b9cdd59999a58da595b9d08185b5bdd5b9d606a1b60448201526064015b60405180910390fd5b6064600554106103905760405162461bcd60e51b815260206004820152601660248201527513595cdcd859d9481b1a5b5a5d08195e18d95959195960521b604482015260640161033c565b6040805160a081019091526001600160a01b03821660c08201526000908060e081016040516020818303038152906040528152602001600454346103d49190610c9d565b6040516020016103e691815260200190565b60408051601f198184030181529190528152602001600060405190808252806020026020018201604052801561044257816020015b604080518082019091526000808252602082015281526020019060019003908161041b5790505b508152600060208083018290526040805191820181528282529283015290516396f4e9f960e01b8152919250907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906396f4e9f99034906104b3906089908790600401610cfc565b60206040518083038185885af11580156104d1573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906104f69190610dd6565b60058054919250600061050883610def565b9190505550826001600160a01b0316336001600160a01b0316827f3c20d4e8f42599eddf3cdb1184580d4ad4d4a3063dbd500a519f8fcf11ea2414600454346105519190610c9d565b60405190815260200160405180910390a4505061056e6001600255565b50565b610579610989565b60048190556040518181527f42dfb00d085d601e55327921154ae76c1b24270b026c5a0c51caee18eb4c401f9060200160405180910390a150565b6105bc610989565b6001600160a01b0381166106065760405162461bcd60e51b8152602060048201526011602482015270125b9d985b1a59081c9958da5c1a595b9d607a1b604482015260640161033c565b60405147906000906001600160a01b0384169083908381818185875af1925050503d8060008114610653576040519150601f19603f3d011682016040523d82523d6000602084013e610658565b606091505b505090508061069b5760405162461bcd60e51b815260206004820152600f60248201526e151c985b9cd9995c8819985a5b1959608a1b604482015260640161033c565b826001600160a01b03167f5fafa99d0643513820be26656b45130b01e1c03062e1266bf36f88cbd3bd9695836040516106d691815260200190565b60405180910390a2505050565b6001546001600160a01b031633146107365760405162461bcd60e51b815260206004820152601660248201527526bab9ba10313290383937b837b9b2b21037bbb732b960511b604482015260640161033c565b60008054336001600160a01b0319808316821784556001805490911690556040516001600160a01b0390921692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a350565b610795610989565b6102e7610acb565b6107a5610a85565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146108145760405162461bcd60e51b815260206004820152601460248201527313db9b1e481c9bdd5d195c8818d85b8818d85b1b60621b604482015260640161033c565b60006108236040830183610e08565b8101906108309190610c0f565b905060006108416060840184610e08565b81019061084e9190610c33565b90506001600160a01b03821661089a5760405162461bcd60e51b8152602060048201526011602482015270125b9d985b1a59081c9958da5c1a595b9d607a1b604482015260640161033c565b6000826001600160a01b03168260405160006040518083038185875af1925050503d80600081146108e7576040519150601f19603f3d011682016040523d82523d6000602084013e6108ec565b606091505b505090508061092f5760405162461bcd60e51b815260206004820152600f60248201526e151c985b9cd9995c8819985a5b1959608a1b604482015260640161033c565b6040518281526001600160a01b0384169033908635907ff70d2dfb20a334fd3c84cd702f67ad5ba48227a1c9d7d2a96b68e5c50258d7559060200160405180910390a450505050565b610980610989565b61056e81610b08565b6000546001600160a01b031633146102e75760405162461bcd60e51b815260206004820152601660248201527527b7363c9031b0b63630b1363290313c9037bbb732b960511b604482015260640161033c565b6109e4610bb1565b6003805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b6040516001600160a01b03909116815260200160405180910390a1565b6002805403610a7f5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c00604482015260640161033c565b60028055565b60035460ff16156102e75760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b604482015260640161033c565b610ad3610a85565b6003805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258610a113390565b336001600160a01b03821603610b605760405162461bcd60e51b815260206004820152601760248201527f43616e6e6f74207472616e7366657220746f2073656c66000000000000000000604482015260640161033c565b600180546001600160a01b0319166001600160a01b0383811691821790925560008054604051929316917fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae12789190a350565b60035460ff166102e75760405162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b604482015260640161033c565b6001600160a01b038116811461056e57600080fd5b600060208284031215610c2157600080fd5b8135610c2c81610bfa565b9392505050565b600060208284031215610c4557600080fd5b5035919050565b600060208284031215610c5e57600080fd5b813567ffffffffffffffff811115610c7557600080fd5b820160a08185031215610c2c57600080fd5b634e487b7160e01b600052601160045260246000fd5b81810381811115610cb057610cb0610c87565b92915050565b6000815180845260005b81811015610cdc57602081850181015186830182015201610cc0565b506000602082860101526020601f19601f83011685010191505092915050565b6000604067ffffffffffffffff8516835260208181850152845160a083860152610d2960e0860182610cb6565b905081860151603f1980878403016060880152610d468383610cb6565b88860151888203830160808a01528051808352908601945060009350908501905b80841015610d9957845180516001600160a01b0316835286015186830152938501936001939093019290860190610d67565b5060608901516001600160a01b031660a08901526080890151888203830160c08a01529550610dc88187610cb6565b9a9950505050505050505050565b600060208284031215610de857600080fd5b5051919050565b600060018201610e0157610e01610c87565b5060010190565b6000808335601e19843603018112610e1f57600080fd5b83018035915067ffffffffffffffff821115610e3a57600080fd5b602001915036819003821315610e4f57600080fd5b925092905056fea26469706673582212204283328a581edb57c9a1846f953f65f7738ba12c6a39d7bda91f065157a9027964736f6c63430008130033";

type CrossChainMessengerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CrossChainMessengerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CrossChainMessenger__factory extends ContractFactory {
  constructor(...args: CrossChainMessengerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _router: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CrossChainMessenger> {
    return super.deploy(
      _router,
      overrides || {}
    ) as Promise<CrossChainMessenger>;
  }
  override getDeployTransaction(
    _router: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_router, overrides || {});
  }
  override attach(address: string): CrossChainMessenger {
    return super.attach(address) as CrossChainMessenger;
  }
  override connect(signer: Signer): CrossChainMessenger__factory {
    return super.connect(signer) as CrossChainMessenger__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CrossChainMessengerInterface {
    return new utils.Interface(_abi) as CrossChainMessengerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CrossChainMessenger {
    return new Contract(address, _abi, signerOrProvider) as CrossChainMessenger;
  }
}
