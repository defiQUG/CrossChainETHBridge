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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "MessageSent",
    type: "event",
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
        name: "",
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
        name: "",
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
        name: "",
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
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "sendMessage",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "simulateMessageReceived",
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
  "0x608060405234801561001057600080fd5b50610cdb806100206000396000f3fe6080604052600436106100745760003560e01c806396f4e9f91161004e57806396f4e9f9146100f5578063a48a905814610108578063f9d53aeb14610142578063fbca3b741461015557600080fd5b806320487ded1461008057806385572ffb146100b35780638da040d5146100d557600080fd5b3661007b57005b600080fd5b34801561008c57600080fd5b506100a061009b3660046107f9565b610182565b6040519081526020015b60405180910390f35b3480156100bf57600080fd5b506100d36100ce3660046108f5565b6101e6565b005b3480156100e157600080fd5b506100d36100f03660046109c4565b61023e565b6100a06101033660046107f9565b610358565b34801561011457600080fd5b50610132610123366004610a08565b6001600160401b031660891490565b60405190151581526020016100aa565b6100a0610150366004610a2a565b610481565b34801561016157600080fd5b50610175610170366004610a08565b6105ba565b6040516100aa9190610a54565b6000826001600160401b03166089146101d65760405162461bcd60e51b81526020600482015260116024820152702ab739bab83837b93a32b21031b430b4b760791b60448201526064015b60405180910390fd5b5067016345785d8a000092915050565b6040516385572ffb60e01b815233906385572ffb90610209908490600401610b36565b600060405180830381600087803b15801561022357600080fd5b505af1158015610237573d6000803e3d6000fd5b5050505050565b604080516000808252602082019092528161027b565b60408051808201909152600080825260208201528152602001906001900390816102545790505b50905060008260405160200161029391815260200190565b60408051808303601f19018152828252606087901b6001600160601b03191660208401528151601481850301815260d48401835260348401898152608a6054860152607485018290526094850183905260b490940186905291516385572ffb60e01b81529093509091906001600160a01b038916906385572ffb9061031c908490600401610b36565b600060405180830381600087803b15801561033657600080fd5b505af115801561034a573d6000803e3d6000fd5b505050505050505050505050565b6000826001600160401b03166089146103ac5760405162461bcd60e51b815260206004820152601660248201527524b73b30b634b21031b430b4b71039b2b632b1ba37b960511b60448201526064016101cd565b81516000906103ba90610bb4565b60601c9050600083602001518060200190518101906103d99190610beb565b604080516001600160401b03881681526001600160a01b03851660208201529081018290529091507f523796049da261d38b2e661d0b53c1e3c1968d1a58be557f76cbe47d7fc6f6969060600160405180910390a1604080514260208083019190915233606090811b6001600160601b03199081168486015295901b909416605482015260688082019390935281518082039093018352608801905280519101209392505050565b6040805160a081019091526001600160a01b03831660c082015260009081908060e081016040516020818303038152906040528152602001846040516020016104cc91815260200190565b60408051601f198184030181529190528152602001600060405190808252806020026020018201604052801561052857816020015b60408051808201909152600080825260208201528152602001906001900390816105015790505b5081526000602080830182905260408051918201815291815291810191909152516396f4e9f960e01b815290915030906396f4e9f99061056f906089908590600401610c04565b6020604051808303816000875af115801561058e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105b29190610beb565b949350505050565b6060816001600160401b03166089146106095760405162461bcd60e51b81526020600482015260116024820152702ab739bab83837b93a32b21031b430b4b760791b60448201526064016101cd565b505060408051600081526020810190915290565b80356001600160401b038116811461063457600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b604080519081016001600160401b038111828210171561067157610671610639565b60405290565b60405160a081016001600160401b038111828210171561067157610671610639565b604051601f8201601f191681016001600160401b03811182821017156106c1576106c1610639565b604052919050565b600082601f8301126106da57600080fd5b81356001600160401b038111156106f3576106f3610639565b610706601f8201601f1916602001610699565b81815284602083860101111561071b57600080fd5b816020850160208301376000918101602001919091529392505050565b80356001600160a01b038116811461063457600080fd5b600082601f83011261076057600080fd5b813560206001600160401b0382111561077b5761077b610639565b610789818360051b01610699565b82815260069290921b840181019181810190868411156107a857600080fd5b8286015b848110156107ee57604081890312156107c55760008081fd5b6107cd61064f565b6107d682610738565b815281850135858201528352918301916040016107ac565b509695505050505050565b6000806040838503121561080c57600080fd5b6108158361061d565b915060208301356001600160401b038082111561083157600080fd5b9084019060a0828703121561084557600080fd5b61084d610677565b82358281111561085c57600080fd5b610868888286016106c9565b82525060208301358281111561087d57600080fd5b610889888286016106c9565b6020830152506040830135828111156108a157600080fd5b6108ad8882860161074f565b6040830152506108bf60608401610738565b60608201526080830135828111156108d657600080fd5b6108e2888286016106c9565b6080830152508093505050509250929050565b60006020828403121561090757600080fd5b81356001600160401b038082111561091e57600080fd5b9083019060a0828603121561093257600080fd5b61093a610677565b8235815261094a6020840161061d565b602082015260408301358281111561096157600080fd5b61096d878286016106c9565b60408301525060608301358281111561098557600080fd5b610991878286016106c9565b6060830152506080830135828111156109a957600080fd5b6109b58782860161074f565b60808301525095945050505050565b600080600080608085870312156109da57600080fd5b6109e385610738565b9350602085013592506109f860408601610738565b9396929550929360600135925050565b600060208284031215610a1a57600080fd5b610a238261061d565b9392505050565b60008060408385031215610a3d57600080fd5b610a4683610738565b946020939093013593505050565b6020808252825182820181905260009190848201906040850190845b81811015610a955783516001600160a01b031683529284019291840191600101610a70565b50909695505050505050565b6000815180845260005b81811015610ac757602081850181015186830182015201610aab565b506000602082860101526020601f19601f83011685010191505092915050565b600081518084526020808501945080840160005b83811015610b2b57815180516001600160a01b031688528301518388015260409096019590820190600101610afb565b509495945050505050565b60208152815160208201526001600160401b0360208301511660408201526000604083015160a06060840152610b6f60c0840182610aa1565b90506060840151601f1980858403016080860152610b8d8383610aa1565b925060808601519150808584030160a086015250610bab8282610ae7565b95945050505050565b805160208201516001600160601b03198082169291906014831015610be35780818460140360031b1b83161693505b505050919050565b600060208284031215610bfd57600080fd5b5051919050565b6001600160401b0383168152604060208201526000825160a06040840152610c2f60e0840182610aa1565b90506020840151603f1980858403016060860152610c4d8383610aa1565b92506040860151915080858403016080860152610c6a8383610ae7565b60608701516001600160a01b031660a0870152608087015186820390920160c087015292509050610c9b8282610aa1565b969550505050505056fea26469706673582212208867e4408e5860864d4b66c31c9667b43307add2c8448e79371e6f85407044c964736f6c63430008130033";

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
