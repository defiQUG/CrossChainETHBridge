/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../../../common";
import type {
  OwnerIsCreator,
  OwnerIsCreatorInterface,
} from "../../../../../../../@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator";

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
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
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
  "0x608060405234801561001057600080fd5b50338060008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610083576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161007a9061023b565b60405180910390fd5b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610107576101068161010f60201b60201c565b5b5050506102b7565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361017d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161017490610279565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b60208152601860208201527f43616e6e6f7420736574206f776e657220746f207a65726f000000000000000060408201526000606082019050919050565b60208152601760208201527f43616e6e6f74207472616e7366657220746f2073656c6600000000000000000060408201526000606082019050919050565b610553806102c66000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806379ba5097146100465780638da5cb5b14610050578063f2fde38b1461006e575b600080fd5b61004e61008a565b005b61005861021f565b6040516100659190610418565b60405180910390f35b61008860048036038101906100839190610431565b610248565b005b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461011a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161011190610463565b60405180910390fd5b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a350565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b61025061025c565b610259816102ec565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102ea576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102e1906104a1565b60405180910390fd5b565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361035a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610351906104df565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b600060208201905060018060a01b038316825292915050565b60006020828403121561044357600080fd5b813560018060a01b038116811461045957600080fd5b8091505092915050565b60208152601660208201527f4d7573742062652070726f706f736564206f776e65720000000000000000000060408201526000606082019050919050565b60208152601660208201527f4f6e6c792063616c6c61626c65206279206f776e65720000000000000000000060408201526000606082019050919050565b60208152601760208201527f43616e6e6f74207472616e7366657220746f2073656c660000000000000000006040820152600060608201905091905056fea26469706673582212200d22dd3a77f14713c907e95c45fc3364382bb00d36ffc61c7c5f8aefd39db5ac64736f6c63430008130033";

type OwnerIsCreatorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: OwnerIsCreatorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class OwnerIsCreator__factory extends ContractFactory {
  constructor(...args: OwnerIsCreatorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<OwnerIsCreator> {
    return super.deploy(overrides || {}) as Promise<OwnerIsCreator>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): OwnerIsCreator {
    return super.attach(address) as OwnerIsCreator;
  }
  override connect(signer: Signer): OwnerIsCreator__factory {
    return super.connect(signer) as OwnerIsCreator__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OwnerIsCreatorInterface {
    return new utils.Interface(_abi) as OwnerIsCreatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OwnerIsCreator {
    return new Contract(address, _abi, signerOrProvider) as OwnerIsCreator;
  }
}
