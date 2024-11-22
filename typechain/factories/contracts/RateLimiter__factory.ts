/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  RateLimiter,
  RateLimiterInterface,
} from "../../contracts/RateLimiter";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_maxMessagesPerPeriod",
        type: "uint256",
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
        name: "period",
        type: "uint256",
      },
    ],
    name: "MessageProcessed",
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
        internalType: "uint256",
        name: "newLimit",
        type: "uint256",
      },
    ],
    name: "RateLimitUpdated",
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
    name: "RATE_PERIOD",
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
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyPause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyUnpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPeriod",
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
    name: "maxMessagesPerPeriod",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "messageCountByPeriod",
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
    name: "processMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_maxMessagesPerPeriod",
        type: "uint256",
      },
    ],
    name: "setMaxMessagesPerPeriod",
    outputs: [],
    stateMutability: "nonpayable",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051620010d5380380620010d5833981810160405281019061003491906102b8565b338060008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036100a6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161009d906102d4565b60405180910390fd5b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161461012a576101298161018960201b60201c565b5b5050506000600160146101000a81548160ff02191690831515021790555061016267f372bc435ce75fc060c01b6102b560201b60201c565b61017c670e29282fed8ed9be60c01b6102b560201b60201c565b8060028190555050610350565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036101f7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101ee90610312565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b50565b6000602082840312156102ca57600080fd5b8151905092915050565b60208152601860208201527f43616e6e6f7420736574206f776e657220746f207a65726f000000000000000060408201526000606082019050919050565b60208152601760208201527f43616e6e6f74207472616e7366657220746f2073656c6600000000000000000060408201526000606082019050919050565b610d7580620003606000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80635cb69e65116100715780635cb69e651461014357806379ba5097146101735780638da5cb5b1461017d578063befe2cb51461019b578063c325dd4c146101a5578063f2fde38b146101c3576100b4565b8063086146d2146100b95780632fbc4558146100d75780633697a3ae146100f35780634a4e3bd51461011157806351858e271461011b5780635c975abb14610125575b600080fd5b6100c16101df565b6040516100ce9190610ac7565b60405180910390f35b6100f160048036038101906100ec9190610ad8565b610230565b005b6100fb6102f1565b6040516101089190610ac7565b60405180910390f35b6101196102f7565b005b61012361036d565b005b61012d6103e3565b60405161013a9190610af4565b60405180910390f35b61015d60048036038101906101589190610ad8565b6103fa565b60405161016a9190610ac7565b60405180910390f35b61017b610412565b005b6101856105a7565b6040516101929190610b07565b60405180910390f35b6101a36105d0565b005b6101ad61078e565b6040516101ba9190610ac7565b60405180910390f35b6101dd60048036038101906101d89190610b20565b610794565b005b60006101f567281f22327b9bd7aa60c01b6107a8565b61020967fd518ca23c476cbc60c01b6107a8565b61021d678e3dd61dab0e626560c01b6107a8565b610e104261022b9190610b52565b905090565b61024467fcac6a651fc60b4a60c01b6107a8565b61024c6107ab565b61026067d65f57738532aa4b60c01b6107a8565b61027467aa10ea64202c43d060c01b6107a8565b61028867a0acb552b48e604b60c01b6107a8565b806002819055506102a3673e828ff142836dc260c01b6107a8565b6102b767219956edeb4deb2660c01b6107a8565b7f1939de75d13c836ba62103f23c7a2622e9cbc2113aa33a8c74eb28e409313db2816040516102e69190610ac7565b60405180910390a150565b60025481565b61030b674ab9e204873fe88060c01b6107a8565b6103136107ab565b610327675361adab7879275760c01b6107a8565b61033b670889b6cd4d83e27b60c01b6107a8565b61034f672e6caf6ace937eb560c01b6107a8565b61036367fbc9834937f4f0f260c01b6107a8565b61036b61083b565b565b610381672bc2e2677a6df70460c01b6107a8565b6103896107ab565b61039d67e2933530d69b9ff560c01b6107a8565b6103b1674352cba3204e20fc60c01b6107a8565b6103c567212bc766bd55b8b360c01b6107a8565b6103d967ad1648b582bac18e60c01b6107a8565b6103e161089e565b565b6000600160149054906101000a900460ff16905090565b60036020528060005260406000206000915090505481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146104a2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161049990610b7a565b60405180910390fd5b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a350565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6105e467b7d15f3f3995922160c01b6107a8565b6105ec610900565b61060067703fda4381aa216a60c01b6107a8565b6106146781cafae36206241960c01b6107a8565b610628671eb30454185d85a460c01b6107a8565b61063c67b7479874da03bf7660c01b6107a8565b60006106466101df565b905061065c67d4e9a4909eee2c8f60c01b6107a8565b61067067aaa3b34c0b58ea3460c01b6107a8565b6106846722312067c990a34460c01b6107a8565b6002546003600083815260200190815260200160002054106106db576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106d290610bb8565b60405180910390fd5b6106ef67a08de02555e5b47f60c01b6107a8565b61070367aa012563fe9cafef60c01b6107a8565b60036000828152602001908152602001600020600081548092919061072790610c1c565b9190505550610740676bbd4e18b0faf3ad60c01b6107a8565b61075467652fb0e66ca847f260c01b6107a8565b7f18d40bf3aed310fecb4c4b5f29e3d33783bbeef10318fd51c9e9fdea872d6add816040516107839190610ac7565b60405180910390a150565b610e1081565b61079c6107ab565b6107a58161094a565b50565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610839576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161083090610c47565b60405180910390fd5b565b610843610a76565b6000600160146101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa610887610abf565b6040516108949190610b07565b60405180910390a1565b6108a6610900565b60018060146101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586108e9610abf565b6040516108f69190610b07565b60405180910390a1565b6109086103e3565b15610948576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161093f90610c85565b60405180910390fd5b565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036109b8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109af90610cc3565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b610a7e6103e3565b610abd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ab490610d01565b60405180910390fd5b565b600033905090565b600060208201905082825292915050565b600060208284031215610aea57600080fd5b8135905092915050565b6000602082019050821515825292915050565b600060208201905060018060a01b038316825292915050565b600060208284031215610b3257600080fd5b813560018060a01b0381168114610b4857600080fd5b8091505092915050565b600082610b6f57634e487b7160e01b600052601260045260246000fd5b828204905092915050565b60208152601660208201527f4d7573742062652070726f706f736564206f776e65720000000000000000000060408201526000606082019050919050565b60208152602660208201527f52617465206c696d697420657863656564656420666f722063757272656e742060408201527f706572696f64000000000000000000000000000000000000000000000000000060608201526000608082019050919050565b600080198203610c3c57634e487b7160e01b600052601160045260246000fd5b600182019050919050565b60208152601660208201527f4f6e6c792063616c6c61626c65206279206f776e65720000000000000000000060408201526000606082019050919050565b60208152601060208201527f5061757361626c653a207061757365640000000000000000000000000000000060408201526000606082019050919050565b60208152601760208201527f43616e6e6f74207472616e7366657220746f2073656c6600000000000000000060408201526000606082019050919050565b60208152601460208201527f5061757361626c653a206e6f74207061757365640000000000000000000000006040820152600060608201905091905056fea2646970667358221220df0bf0d093d0f5c261903a2b8562404d9091f284bcd36604535e0578bf7cd3a564736f6c63430008130033";

type RateLimiterConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RateLimiterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RateLimiter__factory extends ContractFactory {
  constructor(...args: RateLimiterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _maxMessagesPerPeriod: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<RateLimiter> {
    return super.deploy(
      _maxMessagesPerPeriod,
      overrides || {}
    ) as Promise<RateLimiter>;
  }
  override getDeployTransaction(
    _maxMessagesPerPeriod: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_maxMessagesPerPeriod, overrides || {});
  }
  override attach(address: string): RateLimiter {
    return super.attach(address) as RateLimiter;
  }
  override connect(signer: Signer): RateLimiter__factory {
    return super.connect(signer) as RateLimiter__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RateLimiterInterface {
    return new utils.Interface(_abi) as RateLimiterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RateLimiter {
    return new Contract(address, _abi, signerOrProvider) as RateLimiter;
  }
}
