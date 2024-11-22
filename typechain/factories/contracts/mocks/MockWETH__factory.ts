/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  MockWETH,
  MockWETHInterface,
} from "../../../contracts/mocks/MockWETH";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
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
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
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
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
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
  "0x60806040523480156200001157600080fd5b506040518060400160405280600d81526020017f57726170706564204574686572000000000000000000000000000000000000008152506040518060400160405280600481526020017f574554480000000000000000000000000000000000000000000000000000000081525081600390816200008f9190620001a1565b508060049081620000a19190620001a1565b505050620000c067bfd76b78cc085cae60c01b620000c660201b60201c565b6200027a565b50565b634e487b7160e01b600052604160045260246000fd5b60008160011c90506001821680620000f857607f821691505b6020821081036200011957634e487b7160e01b600052602260045260246000fd5b50919050565b806000525060006020600020905090565b601f8211156200018257600081815260208120601f850160051c810160208610156200015a578190505b601f850160051c820191505b818110156200017e5782815560018101905062000166565b5050505b505050565b60008260011b6000198460031b1c19831617905092915050565b815160018060401b03811115620001bd57620001bc620000c9565b5b620001d581620001ce8454620000df565b8462000130565b60006020809150601f8311600181146200020e5760008415620001f9578387015190505b62000205858262000187565b86555062000272565b601f1984166200021e866200011f565b60005b8281101562000246578589015182556001820191508486019550848101905062000221565b508582101562000266578488015160001960f88860031b161c1981168255505b505060018460011b0185555b505050505050565b611738806200028a6000396000f3fe6080604052600436106100c65760003560e01c8063395093511161007f578063a457c2d711610059578063a457c2d7146102b7578063a9059cbb146102f4578063d0e30db014610331578063dd62ed3e1461033b576100e9565b8063395093511461021257806370a082311461024f57806395d89b411461028c576100e9565b806306fdde03146100ee578063095ea7b31461011957806318160ddd1461015657806323b872dd146101815780632e1a7d4d146101be578063313ce567146101e7576100e9565b366100e9576100df671106c2ceae76e15860c01b610378565b6100e761037b565b005b600080fd5b3480156100fa57600080fd5b506101036103c3565b60405161011091906110f5565b60405180910390f35b34801561012557600080fd5b50610140600480360381019061013b9190611165565b610455565b60405161014d9190611191565b60405180910390f35b34801561016257600080fd5b5061016b610478565b60405161017891906111a4565b60405180910390f35b34801561018d57600080fd5b506101a860048036038101906101a391906111b5565b610482565b6040516101b59190611191565b60405180910390f35b3480156101ca57600080fd5b506101e560048036038101906101e091906111f1565b6104b1565b005b3480156101f357600080fd5b506101fc6106ba565b604051610209919061120d565b60405180910390f35b34801561021e57600080fd5b5061023960048036038101906102349190611165565b6106c3565b6040516102469190611191565b60405180910390f35b34801561025b57600080fd5b5061027660048036038101906102719190611221565b6106fa565b60405161028391906111a4565b60405180910390f35b34801561029857600080fd5b506102a1610742565b6040516102ae91906110f5565b60405180910390f35b3480156102c357600080fd5b506102de60048036038101906102d99190611165565b6107d4565b6040516102eb9190611191565b60405180910390f35b34801561030057600080fd5b5061031b60048036038101906103169190611165565b61084b565b6040516103289190611191565b60405180910390f35b61033961037b565b005b34801561034757600080fd5b50610362600480360381019061035d9190611244565b61086e565b60405161036f91906111a4565b60405180910390f35b50565b61038f67266d83ffb134c34b60c01b610378565b6103a3670c39e2cd877fb4eb60c01b610378565b6103b767eafded08de76099a60c01b610378565b6103c133346108f5565b565b6060600380546103d290611277565b80601f01602080910402602001604051908101604052809291908181526020018280546103fe90611277565b801561044b5780601f106104205761010080835404028352916020019161044b565b820191906000526020600020905b81548152906001019060200180831161042e57829003601f168201915b5050505050905090565b600080610460610a4b565b905061046d818585610a53565b600191505092915050565b6000600254905090565b60008061048d610a4b565b905061049a858285610c1c565b6104a5858585610ca8565b60019150509392505050565b6104c5675a26a4977edd78ac60c01b610378565b6104d967cff6330d6b8872f060c01b610378565b6104ed6732215142c69dfdb260c01b610378565b61050167d00344c0bfe2cdad60c01b610378565b8061050b336106fa565b101561054c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610543906112b5565b60405180910390fd5b6105606786fad61c18ca12de60c01b610378565b61057467fab4e09801b881e960c01b610378565b61058867f18236f672956a8760c01b610378565b6105923382610f1e565b6105a667bbb1092407929d2b60c01b610378565b6105ba67a1af7d3dc9557cde60c01b610378565b60003373ffffffffffffffffffffffffffffffffffffffff16826040516105e0906112f3565b60006040518083038185875af1925050503d806000811461061d576040519150601f19603f3d011682016040523d82523d6000602084013e610622565b606091505b5050905061063a67ee0486163c890d4160c01b610378565b61064e67613d1ef3d22d7e9260c01b610378565b61066267093de30aefae0c3d60c01b610378565b806106a2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610699906112fd565b60405180910390fd5b6106b66754beebed7328ca6960c01b610378565b5050565b60006012905090565b6000806106ce610a4b565b90506106ef8185856106e0858961086e565b6106ea919061133b565b610a53565b600191505092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461075190611277565b80601f016020809104026020016040519081016040528092919081815260200182805461077d90611277565b80156107ca5780601f1061079f576101008083540402835291602001916107ca565b820191906000526020600020905b8154815290600101906020018083116107ad57829003601f168201915b5050505050905090565b6000806107df610a4b565b905060006107ed828661086e565b905083811015610832576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082990611366565b60405180910390fd5b61083f8286868403610a53565b60019250505092915050565b600080610856610a4b565b9050610863818585610ca8565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610964576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161095b906113ca565b60405180910390fd5b610970600083836110eb565b8060026000828254610982919061133b565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a3391906111a4565b60405180910390a3610a47600083836110f0565b5050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610ac2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ab990611408565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610b31576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b289061146c565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92583604051610c0f91906111a4565b60405180910390a3505050565b6000610c28848461086e565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114610ca25781811015610c94576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c8b906114d0565b60405180910390fd5b610ca18484848403610a53565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610d17576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0e9061150e565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610d86576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d7d90611572565b60405180910390fd5b610d918383836110eb565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610e17576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e0e906115d6565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610f0591906111a4565b60405180910390a3610f188484846110f0565b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610f8d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f849061163a565b60405180910390fd5b610f99826000836110eb565b60008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490508181101561101f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110169061169e565b60405180910390fd5b8181036000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600260008282540392505081905550600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516110d291906111a4565b60405180910390a36110e6836000846110f0565b505050565b505050565b505050565b600060208083528351808285015260005b8181101561112557828187010151604082870101528281019050611106565b506000604082860101526040601f19601f8301168501019250505092915050565b60008135905060018060a01b038116811461116057600080fd5b919050565b6000806040838503121561117857600080fd5b61118183611146565b9150602083013590509250929050565b6000602082019050821515825292915050565b600060208201905082825292915050565b6000806000606084860312156111ca57600080fd5b6111d384611146565b92506111e160208501611146565b9150604084013590509250925092565b60006020828403121561120357600080fd5b8135905092915050565b600060208201905060ff8316825292915050565b60006020828403121561123357600080fd5b61123c82611146565b905092915050565b6000806040838503121561125757600080fd5b61126083611146565b915061126e60208401611146565b90509250929050565b60008160011c9050600182168061128f57607f821691505b6020821081036112af57634e487b7160e01b600052602260045260246000fd5b50919050565b60208152601e60208201527f4d6f636b574554483a20696e73756666696369656e742062616c616e6365000060408201526000606082019050919050565b6000819050919050565b60208152601d60208201527f4d6f636b574554483a20455448207472616e73666572206661696c656400000060408201526000606082019050919050565b600082820190508082111561136057634e487b7160e01b600052601160045260246000fd5b92915050565b60208152602560208201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760408201527f207a65726f00000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b60208152601f60208201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060408201526000606082019050919050565b60208152602460208201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460408201527f726573730000000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b60208152602260208201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560408201527f737300000000000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b60208152601d60208201527f45524332303a20696e73756666696369656e7420616c6c6f77616e636500000060408201526000606082019050919050565b60208152602560208201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460408201527f647265737300000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b60208152602360208201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260408201527f657373000000000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b60208152602660208201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260408201527f616c616e6365000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b60208152602160208201527f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360408201527f730000000000000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b60208152602260208201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60408201527f63650000000000000000000000000000000000000000000000000000000000006060820152600060808201905091905056fea264697066735822122097f619006a4fd3dabb0d2b0fa4bf39cb7acd1c582363da86571d450fb78eae9464736f6c63430008130033";

type MockWETHConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockWETHConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockWETH__factory extends ContractFactory {
  constructor(...args: MockWETHConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MockWETH> {
    return super.deploy(overrides || {}) as Promise<MockWETH>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MockWETH {
    return super.attach(address) as MockWETH;
  }
  override connect(signer: Signer): MockWETH__factory {
    return super.connect(signer) as MockWETH__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockWETHInterface {
    return new utils.Interface(_abi) as MockWETHInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockWETH {
    return new Contract(address, _abi, signerOrProvider) as MockWETH;
  }
}
