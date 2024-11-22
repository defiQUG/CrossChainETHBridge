/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  MockRouter,
  MockRouterInterface,
} from "../../../contracts/mocks/MockRouter";

const _abi = [
  {
    inputs: [],
    name: "InsufficientFeeTokenAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMsgValue",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destChainSelector",
        type: "uint64",
      },
    ],
    name: "UnsupportedDestinationChain",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "address",
        name: "feeToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fees",
        type: "uint256",
      },
    ],
    name: "MessageSent",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "receiver",
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
            name: "tokenAmounts",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "feeToken",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "extraArgs",
            type: "bytes",
          },
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "message",
        type: "tuple",
      },
    ],
    name: "ccipSend",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "receiver",
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
            name: "tokenAmounts",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "feeToken",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "extraArgs",
            type: "bytes",
          },
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "message",
        type: "tuple",
      },
    ],
    name: "getFee",
    outputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "chainSelector",
        type: "uint64",
      },
    ],
    name: "getSupportedTokens",
    outputs: [
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "chainSelector",
        type: "uint64",
      },
    ],
    name: "isChainSupported",
    outputs: [
      {
        internalType: "bool",
        name: "supported",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
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
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "simulateMessageReceived",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506109c9806100206000396000f3fe6080604052600436106100555760003560e01c806320487ded1461005a5780632cad5a1f146100975780638a8a8f68146100b957806396f4e9f9146100d9578063a48a9058146100ec578063fbca3b741461011d575b600080fd5b34801561006657600080fd5b5061008461007536600461052e565b67016345785d8a000092915050565b6040519081526020015b60405180910390f35b3480156100a357600080fd5b506100b76100b236600461062a565b610158565b005b3480156100c557600080fd5b506100b76100d4366004610691565b61025b565b6100846100e736600461052e565b6102bd565b3480156100f857600080fd5b5061010d610107366004610760565b50600190565b604051901515815260200161008e565b34801561012957600080fd5b5061014b610138366004610760565b5060408051600081526020810190915290565b60405161008e9190610782565b6040805160008082526020820190925281610195565b604080518082019091526000808252602082015281526020019060019003908161016e5790505b509050846001600160a01b03166385572ffb6040518060a0016040528087815260200160016001600160401b03168152602001866040516020016101e891906001600160a01b0391909116815260200190565b6040516020818303038152906040528152602001858152602001848152506040518263ffffffff1660e01b81526004016102229190610815565b600060405180830381600087803b15801561023c57600080fd5b505af1158015610250573d6000803e3d6000fd5b505050505050505050565b6040516385572ffb60e01b81526001600160a01b038316906385572ffb90610287908490600401610815565b600060405180830381600087803b1580156102a157600080fd5b505af11580156102b5573d6000803e3d6000fd5b505050505050565b60008083836000015184602001516040516020016102dd939291906108ce565b6040516020818303038152906040528051906020012090507f3d8a9f055772202d2c3c1fddbad930d3dbe588d8692b75b84cee071946282911818585600001516103269061090c565b60601c866020015160003460405161034396959493929190610948565b60405180910390a19392505050565b80356001600160401b038116811461036957600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b604080519081016001600160401b03811182821017156103a6576103a661036e565b60405290565b60405160a081016001600160401b03811182821017156103a6576103a661036e565b604051601f8201601f191681016001600160401b03811182821017156103f6576103f661036e565b604052919050565b600082601f83011261040f57600080fd5b81356001600160401b038111156104285761042861036e565b61043b601f8201601f19166020016103ce565b81815284602083860101111561045057600080fd5b816020850160208301376000918101602001919091529392505050565b80356001600160a01b038116811461036957600080fd5b600082601f83011261049557600080fd5b813560206001600160401b038211156104b0576104b061036e565b6104be818360051b016103ce565b82815260069290921b840181019181810190868411156104dd57600080fd5b8286015b8481101561052357604081890312156104fa5760008081fd5b610502610384565b61050b8261046d565b815281850135858201528352918301916040016104e1565b509695505050505050565b6000806040838503121561054157600080fd5b61054a83610352565b915060208301356001600160401b038082111561056657600080fd5b9084019060a0828703121561057a57600080fd5b6105826103ac565b82358281111561059157600080fd5b61059d888286016103fe565b8252506020830135828111156105b257600080fd5b6105be888286016103fe565b6020830152506040830135828111156105d657600080fd5b6105e288828601610484565b6040830152506105f46060840161046d565b606082015260808301358281111561060b57600080fd5b610617888286016103fe565b6080830152508093505050509250929050565b6000806000806080858703121561064057600080fd5b6106498561046d565b93506020850135925061065e6040860161046d565b915060608501356001600160401b0381111561067957600080fd5b610685878288016103fe565b91505092959194509250565b600080604083850312156106a457600080fd5b6106ad8361046d565b915060208301356001600160401b03808211156106c957600080fd5b9084019060a082870312156106dd57600080fd5b6106e56103ac565b823581526106f560208401610352565b602082015260408301358281111561070c57600080fd5b610718888286016103fe565b60408301525060608301358281111561073057600080fd5b61073c888286016103fe565b60608301525060808301358281111561075457600080fd5b61061788828601610484565b60006020828403121561077257600080fd5b61077b82610352565b9392505050565b6020808252825182820181905260009190848201906040850190845b818110156107c35783516001600160a01b03168352928401929184019160010161079e565b50909695505050505050565b6000815180845260005b818110156107f5576020818501810151868301820152016107d9565b506000602082860101526020601f19601f83011685010191505092915050565b600060208083528351818401528084015160406001600160401b0382168186015280860151915060a0606086015261085060c08601836107cf565b91506060860151601f198087850301608088015261086e84836107cf565b608089015188820390920160a089015281518082529186019450600092508501905b808310156108c257845180516001600160a01b0316835286015186830152938501936001929092019190830190610890565b50979650505050505050565b6001600160401b03841681526060602082015260006108f060608301856107cf565b828103604084015261090281856107cf565b9695505050505050565b805160208201516bffffffffffffffffffffffff1980821692919060148310156109405780818460140360031b1b83161693505b505050919050565b8681526001600160401b0386166020820152600060018060a01b03808716604084015260c0606084015261097f60c08401876107cf565b941660808301525060a0015294935050505056fea26469706673582212205e6b52d81d5b1392f1242f14a2da098b78c359f06f4131b9798817244172da5364736f6c63430008130033";

type MockRouterConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockRouterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockRouter__factory extends ContractFactory {
  constructor(...args: MockRouterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MockRouter> {
    return super.deploy(overrides || {}) as Promise<MockRouter>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MockRouter {
    return super.attach(address) as MockRouter;
  }
  override connect(signer: Signer): MockRouter__factory {
    return super.connect(signer) as MockRouter__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockRouterInterface {
    return new utils.Interface(_abi) as MockRouterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockRouter {
    return new Contract(address, _abi, signerOrProvider) as MockRouter;
  }
}
