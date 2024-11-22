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
  "0x608060405234801561001057600080fd5b506110c1806100206000396000f3fe60806040526004361061004a5760003560e01c806320487ded1461004f5780632cad5a1f1461008c57806396f4e9f9146100b5578063a48a9058146100e5578063fbca3b7414610122575b600080fd5b34801561005b57600080fd5b50610076600480360381019061007191906109ba565b61015f565b6040516100839190610a25565b60405180910390f35b34801561009857600080fd5b506100b360048036038101906100ae9190610a76565b6101ae565b005b6100cf60048036038101906100ca91906109ba565b61032c565b6040516100dc9190610b08565b60405180910390f35b3480156100f157600080fd5b5061010c60048036038101906101079190610b23565b610451565b6040516101199190610b6b565b60405180910390f35b34801561012e57600080fd5b5061014960048036038101906101449190610b23565b610498565b6040516101569190610c44565b60405180910390f35b600061017567a1e9f997349e12d260c01b61053b565b61018967e62cff568aee11d860c01b61053b565b61019d6725f000690dc24b0a60c01b61053b565b67016345785d8a0000905092915050565b6101c26784afc806e4dd900460c01b61053b565b6101d667800f91e963b39d7460c01b61053b565b6101ea6714e69fa4df00ac1860c01b61053b565b60008067ffffffffffffffff811115610206576102056105d8565b5b60405190808252806020026020018201604052801561023f57816020015b61022c61053e565b8152602001906001900390816102245790505b50905061025667fa31bac716d6162d60c01b61053b565b61026a67487c3a364fd0c2a660c01b61053b565b8473ffffffffffffffffffffffffffffffffffffffff166385572ffb6040518060a00160405280878152602001600167ffffffffffffffff168152602001866040516020016102b99190610c75565b6040516020818303038152906040528152602001858152602001848152506040518263ffffffff1660e01b81526004016102f39190610e9e565b600060405180830381600087803b15801561030d57600080fd5b505af1158015610321573d6000803e3d6000fd5b505050505050505050565b60006103426754a8897a1373b69860c01b61053b565b610356677d51a5ccb0b2272060c01b61053b565b61036a671116e1ab8fafdbdb60c01b61053b565b6000838360000151846020015160405160200161038993929190610f19565b6040516020818303038152906040528051906020012090506103b5678c68ee163e34646f60c01b61053b565b6103c967f26670bb1016459160c01b61053b565b7f3d8a9f055772202d2c3c1fddbad930d3dbe588d8692b75b84cee071946282911818585600001516103fa90610fbc565b60601c866020015160003460405161041796959493929190611023565b60405180910390a161043367cf2c7a1541330dc760c01b61053b565b61044767c478260f3838c9d960c01b61053b565b8091505092915050565b6000610467674609e94a32b950e560c01b61053b565b61047b67eefd5e41653b35d460c01b61053b565b61048f674accff726250f5a960c01b61053b565b60019050919050565b60606104ae6743c07f92507e3b0660c01b61053b565b6104c2674c0a2e8c21f39d7a60c01b61053b565b600067ffffffffffffffff8111156104dd576104dc6105d8565b5b60405190808252806020026020018201604052801561050b5781602001602082028036833780820191505090505b509050610522672016d1cc23c37be160c01b61053b565b6105366747ea201a9114e9d260c01b61053b565b919050565b50565b6040518060400160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600081525090565b6000604051905090565b600080fd5b600080fd5b600067ffffffffffffffff82169050919050565b61059f81610582565b81146105aa57600080fd5b50565b6000813590506105bc81610596565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610610826105c7565b810181811067ffffffffffffffff8211171561062f5761062e6105d8565b5b80604052505050565b600061064261056e565b905061064e8282610607565b919050565b600080fd5b600080fd5b600080fd5b600067ffffffffffffffff82111561067d5761067c6105d8565b5b610686826105c7565b9050602081019050919050565b82818337600083830152505050565b60006106b56106b084610662565b610638565b9050828152602081018484840111156106d1576106d061065d565b5b6106dc848285610693565b509392505050565b600082601f8301126106f9576106f8610658565b5b81356107098482602086016106a2565b91505092915050565b600067ffffffffffffffff82111561072d5761072c6105d8565b5b602082029050602081019050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061076e82610743565b9050919050565b61077e81610763565b811461078957600080fd5b50565b60008135905061079b81610775565b92915050565b6000819050919050565b6107b4816107a1565b81146107bf57600080fd5b50565b6000813590506107d1816107ab565b92915050565b6000604082840312156107ed576107ec6105c2565b5b6107f76040610638565b905060006108078482850161078c565b600083015250602061081b848285016107c2565b60208301525092915050565b600061083a61083584610712565b610638565b9050808382526020820190506040840283018581111561085d5761085c61073e565b5b835b81811015610886578061087288826107d7565b84526020840193505060408101905061085f565b5050509392505050565b600082601f8301126108a5576108a4610658565b5b81356108b5848260208601610827565b91505092915050565b600060a082840312156108d4576108d36105c2565b5b6108de60a0610638565b9050600082013567ffffffffffffffff8111156108fe576108fd610653565b5b61090a848285016106e4565b600083015250602082013567ffffffffffffffff81111561092e5761092d610653565b5b61093a848285016106e4565b602083015250604082013567ffffffffffffffff81111561095e5761095d610653565b5b61096a84828501610890565b604083015250606061097e8482850161078c565b606083015250608082013567ffffffffffffffff8111156109a2576109a1610653565b5b6109ae848285016106e4565b60808301525092915050565b600080604083850312156109d1576109d0610578565b5b60006109df858286016105ad565b925050602083013567ffffffffffffffff811115610a00576109ff61057d565b5b610a0c858286016108be565b9150509250929050565b610a1f816107a1565b82525050565b6000602082019050610a3a6000830184610a16565b92915050565b6000819050919050565b610a5381610a40565b8114610a5e57600080fd5b50565b600081359050610a7081610a4a565b92915050565b60008060008060808587031215610a9057610a8f610578565b5b6000610a9e8782880161078c565b9450506020610aaf87828801610a61565b9350506040610ac08782880161078c565b925050606085013567ffffffffffffffff811115610ae157610ae061057d565b5b610aed878288016106e4565b91505092959194509250565b610b0281610a40565b82525050565b6000602082019050610b1d6000830184610af9565b92915050565b600060208284031215610b3957610b38610578565b5b6000610b47848285016105ad565b91505092915050565b60008115159050919050565b610b6581610b50565b82525050565b6000602082019050610b806000830184610b5c565b92915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610bbb81610763565b82525050565b6000610bcd8383610bb2565b60208301905092915050565b6000602082019050919050565b6000610bf182610b86565b610bfb8185610b91565b9350610c0683610ba2565b8060005b83811015610c37578151610c1e8882610bc1565b9750610c2983610bd9565b925050600181019050610c0a565b5085935050505092915050565b60006020820190508181036000830152610c5e8184610be6565b905092915050565b610c6f81610763565b82525050565b6000602082019050610c8a6000830184610c66565b92915050565b610c9981610a40565b82525050565b610ca881610582565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610ce8578082015181840152602081019050610ccd565b60008484015250505050565b6000610cff82610cae565b610d098185610cb9565b9350610d19818560208601610cca565b610d22816105c7565b840191505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610d62816107a1565b82525050565b604082016000820151610d7e6000850182610bb2565b506020820151610d916020850182610d59565b50505050565b6000610da38383610d68565b60408301905092915050565b6000602082019050919050565b6000610dc782610d2d565b610dd18185610d38565b9350610ddc83610d49565b8060005b83811015610e0d578151610df48882610d97565b9750610dff83610daf565b925050600181019050610de0565b5085935050505092915050565b600060a083016000830151610e326000860182610c90565b506020830151610e456020860182610c9f565b5060408301518482036040860152610e5d8282610cf4565b91505060608301518482036060860152610e778282610cf4565b91505060808301518482036080860152610e918282610dbc565b9150508091505092915050565b60006020820190508181036000830152610eb88184610e1a565b905092915050565b610ec981610582565b82525050565b600082825260208201905092915050565b6000610eeb82610cae565b610ef58185610ecf565b9350610f05818560208601610cca565b610f0e816105c7565b840191505092915050565b6000606082019050610f2e6000830186610ec0565b8181036020830152610f408185610ee0565b90508181036040830152610f548184610ee0565b9050949350505050565b6000819050602082019050919050565b60007fffffffffffffffffffffffffffffffffffffffff00000000000000000000000082169050919050565b6000610fa68251610f6e565b80915050919050565b600082821b905092915050565b6000610fc782610cae565b82610fd184610f5e565b9050610fdc81610f9a565b9250601482101561101c576110177fffffffffffffffffffffffffffffffffffffffff00000000000000000000000083601403600802610faf565b831692505b5050919050565b600060c0820190506110386000830189610af9565b6110456020830188610ec0565b6110526040830187610c66565b81810360608301526110648186610ee0565b90506110736080830185610c66565b61108060a0830184610a16565b97965050505050505056fea2646970667358221220138c38ec0aa29e43bcf4579c6d0ec97cfce20028e67fedeabc7f2fcbbba5431564736f6c63430008130033";

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
