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
  "0x608060405234801561001057600080fd5b50610f0d806100206000396000f3fe6080604052600436106100595760003560e01c806320487ded146100655780638a8a8f68146100a25780638da040d5146100cb57806396f4e9f9146100f4578063a48a905814610124578063fbca3b741461016157610060565b3661006057005b600080fd5b34801561007157600080fd5b5061008c600480360381019061008791906109c6565b61019e565b6040516100999190610ac4565b60405180910390f35b3480156100ae57600080fd5b506100c960048036038101906100c49190610ad5565b6101ed565b005b3480156100d757600080fd5b506100f260048036038101906100ed9190610bb9565b610298565b005b61010e600480360381019061010991906109c6565b610491565b60405161011b9190610bff565b60405180910390f35b34801561013057600080fd5b5061014b60048036038101906101469190610c10565b610687565b6040516101589190610c33565b60405180910390f35b34801561016d57600080fd5b5061018860048036038101906101839190610c10565b6106da565b6040516101959190610c46565b60405180910390f35b60006101b467c97f13ede8a3a64360c01b61077d565b6101c867c4b7b53f5ebd1a5c60c01b61077d565b6101dc67a791e253db6bf3c860c01b61077d565b67016345785d8a0000905092915050565b61020167299dff4af414185860c01b61077d565b6102156765630ce69f20059860c01b61077d565b610229677f6f426029a8359260c01b61077d565b8173ffffffffffffffffffffffffffffffffffffffff166385572ffb826040518263ffffffff1660e01b81526004016102629190610ce7565b600060405180830381600087803b15801561027c57600080fd5b505af1158015610290573d6000803e3d6000fd5b505050505050565b6102ac678f0aaceb9dbc91b260c01b61077d565b6102c06758b67ade4723bc9f60c01b61077d565b6102d4679136b1a74610191660c01b61077d565b6000826040516020016102e79190610dad565b604051602081830303815290604052905061030c67706ed8da2528392a60c01b61077d565b61032067decb403104d0b0b560c01b61077d565b60008067ffffffffffffffff81111561033c5761033b6107d1565b5b60405190808252806020026020018201604052801561037557816020015b610362610780565b81526020019060019003908161035a5790505b50905061038c6780fd51e48ead033960c01b61077d565b6103a0673331dd6303fbf6ef60c01b61077d565b6000836040516020016103b39190610ac4565b60405160208183030381529060405290506103d8677af640e5eee5e5cf60c01b61077d565b6103ec670e43634d8d7c99d360c01b61077d565b8673ffffffffffffffffffffffffffffffffffffffff166385572ffb6040518060a00160405280898152602001608a67ffffffffffffffff168152602001868152602001848152602001858152506040518263ffffffff1660e01b81526004016104569190610ce7565b600060405180830381600087803b15801561047057600080fd5b505af1158015610484573d6000803e3d6000fd5b5050505050505050505050565b60006104a7675ef6624230af410c60c01b61077d565b6104bb67a88a9cb2473e08b460c01b61077d565b6104cf6737cdcfcc7d8e400160c01b61077d565b6104e3673b8bd778e4e50bb960c01b61077d565b60898367ffffffffffffffff1614610530576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161052790610dd0565b60405180910390fd5b610544671d51aa1cb8b4cd9860c01b61077d565b610558674cf5912eead04cd560c01b61077d565b61056c67397ba2a9b843b6a360c01b61077d565b6000826000015161057c90610e0e565b60601c905061059567e0a9cad2c4ad0f9360c01b61077d565b6105a967c7341cae44ec60c260c01b61077d565b600083602001518060200190518101906105c39190610e4b565b90506105d967207cea731875ff4e60c01b61077d565b6105ed67b01ca0a33f8edbfd60c01b61077d565b7f523796049da261d38b2e661d0b53c1e3c1968d1a58be557f76cbe47d7fc6f69685838360405161062093929190610e67565b60405180910390a161063c6702bb37263916bef660c01b61077d565b61065067dbc287ebaa72e2b560c01b61077d565b423383836040516020016106679493929190610e98565b604051602081830303815290604052805190602001209250505092915050565b600061069d67c523f73f44fd36ca60c01b61077d565b6106b1676e55133f58320b8660c01b61077d565b6106c5674854b16d502c035b60c01b61077d565b60898267ffffffffffffffff16149050919050565b60606106f067f65d5504356507c660c01b61077d565b6107046710c745e4e5e3a0f160c01b61077d565b600067ffffffffffffffff81111561071f5761071e6107d1565b5b60405190808252806020026020018201604052801561074d5781602001602082028036833780820191505090505b5090506107646751e4459bcfdffa4c60c01b61077d565b610778670d558edcbcf39d9360c01b61077d565b919050565b50565b6040518060400160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600081525090565b60008135905067ffffffffffffffff811681146107cc57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600060405190506040810181811067ffffffffffffffff8211171561080f5761080e6107d1565b5b806040525090565b6000604051905060a0810181811067ffffffffffffffff8211171561083f5761083e6107d1565b5b806040525090565b60006040519050601f19601f830116810181811067ffffffffffffffff82111715610875576108746107d1565b5b8060405250919050565b600082601f83011261089057600080fd5b813567ffffffffffffffff8111156108ab576108aa6107d1565b5b6108be6020601f19601f84011601610847565b8181528460208386010111156108d357600080fd5b81602085016020830137600060208383010152809250505092915050565b60008135905060018060a01b038116811461090b57600080fd5b919050565b600082601f83011261092157600080fd5b8135602067ffffffffffffffff82111561093e5761093d6107d1565b5b61094c818360051b01610847565b808382528282019150828460061b87010193508684111561096c57600080fd5b8286015b848110156109b857604081890312156109895760008081fd5b6109916107e7565b61099a826108f1565b81528482013585820152808452508383019250604081019050610970565b508094505050505092915050565b600080604083850312156109d957600080fd5b6109e2836107b0565b9150602083013567ffffffffffffffff808211156109ff57600080fd5b818501915060a08287031215610a1457600080fd5b610a1c610817565b823582811115610a2b57600080fd5b610a378882860161087f565b825250602083013582811115610a4c57600080fd5b610a588882860161087f565b602083015250604083013582811115610a7057600080fd5b610a7c88828601610910565b604083015250610a8e606084016108f1565b6060820152608083013582811115610aa557600080fd5b610ab18882860161087f565b6080830152508093505050509250929050565b600060208201905082825292915050565b60008060408385031215610ae857600080fd5b610af1836108f1565b9150602083013567ffffffffffffffff80821115610b0e57600080fd5b818501915060a08287031215610b2357600080fd5b610b2b610817565b82358152610b3b602084016107b0565b6020820152604083013582811115610b5257600080fd5b610b5e8882860161087f565b604083015250606083013582811115610b7657600080fd5b610b828882860161087f565b606083015250608083013582811115610b9a57600080fd5b610ba688828601610910565b6080830152508093505050509250929050565b60008060008060808587031215610bcf57600080fd5b610bd8856108f1565b935060208501359250610bed604086016108f1565b91506060850135905092959194509250565b600060208201905082825292915050565b600060208284031215610c2257600080fd5b610c2b826107b0565b905092915050565b6000602082019050821515825292915050565b60006020808301818452808551808352604086019150838701925060005b81811015610c8d5760018060a01b03845116835284830192508484019350600181019050610c64565b505080935050505092915050565b6000815180845260005b81811015610cc757602080828601015181838801015250602081019050610ca5565b506000602082860101526020601f19601f83011685010191505092915050565b6000602080835283518184015280840151604067ffffffffffffffff82168186015280860151915060a06060860152610d2360c0860183610c9b565b91506060860151601f1980878503016080880152610d418483610c9b565b935060808801519150808785030160a08801525082815180855285850191508583019450600092505b80831015610d9e57845160018060a01b03815116835286810151878401525083820191508585019450600183019250610d6a565b50809550505050505092915050565b6bffffffffffffffffffffffff198260601b168152600060148201905092915050565b60208152601660208201527f496e76616c696420636861696e2073656c6563746f720000000000000000000060408201526000606082019050919050565b6000815160208301516bffffffffffffffffffffffff1980821693506014831015610e435780818460140360031b1b83161693505b505050919050565b600060208284031215610e5d57600080fd5b8151905092915050565b600060608201905067ffffffffffffffff8516825260018060a01b0384166020830152826040830152949350505050565b84815260006bffffffffffffffffffffffff19808660601b166020840152808560601b166034840152508260488301526068820190509594505050505056fea264697066735822122002cc9d63860fee323ff291125025c0a29825fa9bb99d77b2c69fc5b271315cdb64736f6c63430008130033";

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
