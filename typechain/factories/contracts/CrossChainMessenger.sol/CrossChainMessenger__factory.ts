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
      {
        internalType: "address",
        name: "_weth",
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
    name: "getBridgeFee",
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
    name: "getRouter",
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
    inputs: [],
    name: "weth",
    outputs: [
      {
        internalType: "contract IWETH",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60c06040523480156200001157600080fd5b5060405162002a0738038062002a0783398181016040528101906200003791906200055d565b338060008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603620000ac576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620000a39062000595565b60405180910390fd5b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614620001335762000132816200040b60201b60201c565b5b50505060016002819055506000600360006101000a81548160ff0219169083151502179055506200017567483733007b51650160c01b6200053a60201b60201c565b62000191670bb652cd737227d160c01b6200053a60201b60201c565b620001ad67ba569e4a65fbcc9d60c01b6200053a60201b60201c565b620001c967bc61c872ca4d2e5060c01b6200053a60201b60201c565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036200023b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200023290620005d3565b60405180910390fd5b62000256668ff1e76e853d7160c01b6200053a60201b60201c565b62000272676e024726fb4f886b60c01b6200053a60201b60201c565b6200028e67b0639150c513d59f60c01b6200053a60201b60201c565b620002aa67bd31afac1f96a59660c01b6200053a60201b60201c565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036200031c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620003139062000611565b60405180910390fd5b62000338675ce4bd57da754f3660c01b6200053a60201b60201c565b62000354679bb6e61d0da89cdd60c01b6200053a60201b60201c565b8173ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1681525050620003a4677b04acb23897fa5960c01b6200053a60201b60201c565b8073ffffffffffffffffffffffffffffffffffffffff1660a08173ffffffffffffffffffffffffffffffffffffffff1681525050620003f4670120df5ca59ed5eb60c01b6200053a60201b60201c565b67016345785d8a000060048190555050506200068d565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036200047c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040162000473906200064f565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b50565b60008151905060018060a01b03811681146200055857600080fd5b919050565b600080604083850312156200057157600080fd5b6200057c836200053d565b91506200058c602084016200053d565b90509250929050565b60208152601860208201527f43616e6e6f7420736574206f776e657220746f207a65726f000000000000000060408201526000606082019050919050565b60208152601660208201527f496e76616c696420726f7574657220616464726573730000000000000000000060408201526000606082019050919050565b60208152601460208201527f496e76616c69642057455448206164647265737300000000000000000000000060408201526000606082019050919050565b60208152601760208201527f43616e6e6f74207472616e7366657220746f2073656c6600000000000000000060408201526000606082019050919050565b60805160a051612331620006d6600039600081816104490152818161140401526114c101526000818161086d01528181611010015281816116fc015261173601526123316000f3fe60806040526004361061010d5760003560e01c806382b12dd7116100955780638da5cb5b116100645780638da5cb5b146102f7578063a98de88814610322578063b0f479a11461034d578063f2fde38b14610378578063f887ea40146103a157610114565b806382b12dd7146102615780638456cb591461028c57806385572ffb146102a357806385659de1146102cc57610114565b806354143833116100dc57806354143833146101b15780635a1c0366146101cd5780635c975abb146101f65780636ff1c9bc1461022157806379ba50971461024a57610114565b80632366af53146101195780633f4ba83a146101445780633fc8cef31461015b578063529c75881461018657610114565b3661011457005b600080fd5b34801561012557600080fd5b5061012e6103cc565b60405161013b9190611aff565b60405180910390f35b34801561015057600080fd5b506101596103d1565b005b34801561016757600080fd5b50610170610447565b60405161017d9190611b10565b60405180910390f35b34801561019257600080fd5b5061019b61046b565b6040516101a89190611aff565b60405180910390f35b6101cb60048036038101906101c69190611b40565b610471565b005b3480156101d957600080fd5b506101f460048036038101906101ef9190611b67565b6109d6565b005b34801561020257600080fd5b5061020b610a97565b6040516102189190611b83565b60405180910390f35b34801561022d57600080fd5b5061024860048036038101906102439190611b96565b610aae565b005b34801561025657600080fd5b5061025f610d7d565b005b34801561026d57600080fd5b50610276610f12565b6040516102839190611aff565b60405180910390f35b34801561029857600080fd5b506102a1610f18565b005b3480156102af57600080fd5b506102ca60048036038101906102c59190611bbd565b610f8e565b005b3480156102d857600080fd5b506102e1611648565b6040516102ee9190611aff565b60405180910390f35b34801561030357600080fd5b5061030c61168e565b6040516103199190611c14565b60405180910390f35b34801561032e57600080fd5b506103376116b7565b6040516103449190611c2d565b60405180910390f35b34801561035957600080fd5b506103626116bc565b60405161036f9190611c14565b60405180910390f35b34801561038457600080fd5b5061039f600480360381019061039a9190611b40565b611720565b005b3480156103ad57600080fd5b506103b6611734565b6040516103c39190611c48565b60405180910390f35b606481565b6103e567317134edff75770660c01b611758565b6103ed61175b565b610401673e464e008e3037ac60c01b611758565b610415675b5c75ed4174ee5f60c01b611758565b61042967ffb69390a3c1201360c01b611758565b61043d6777f8062d1af77df660c01b611758565b6104456117eb565b565b7f000000000000000000000000000000000000000000000000000000000000000081565b60055481565b61048567ca8f0ac2e1b0d93060c01b611758565b61048d61184e565b6104a167942a65bc2f1a2c2c60c01b611758565b6104b5677ef937acfb2afbd060c01b611758565b6104bd61189b565b6104d167d83a369f001c25e260c01b611758565b6104e567be39444a7b0e6d3360c01b611758565b6104f9672f2693e8647d564d60c01b611758565b61050d67d790e3624bc0140d60c01b611758565b61052167108d3e23148a599260c01b611758565b6004543411610565576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161055c90611c61565b60405180910390fd5b6105796786381a34bee8bf2960c01b611758565b61058d6738ade48744d4f19e60c01b611758565b6105a167e31cde6d0cc9cd0560c01b611758565b6105b567e2360f7410f836bd60c01b611758565b6064600554106105fa576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f190611c9f565b60405180910390fd5b61060e67381c6def88311b8d60c01b611758565b61062267ac30444dae65d43d60c01b611758565b610636674aec59e7b5737a9860c01b611758565b61064a6798ad738bb4e5c14260c01b611758565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036106b9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106b090611cdd565b60405180910390fd5b6106cd67523fdb28d5d2a11360c01b611758565b6106e1673855e5909f291cd860c01b611758565b6106f56718ba5e470cc60ef460c01b611758565b6000600454346107059190611d31565b905061071b6738625f2b14ec2bfd60c01b611758565b61072f678be581386f7b847960c01b611758565b60008282604051602001610744929190611d4f565b604051602081830303815290604052905061076967ad2520f421b78f9b60c01b611758565b61077d67b071ac0303f98b6760c01b611758565b60006040518060a001604052808560405160200161079b9190611c14565b6040516020818303038152906040528152602001838152602001600067ffffffffffffffff8111156107d0576107cf611d6f565b5b60405190808252806020026020018201604052801561080957816020015b6107f6611acf565b8152602001906001900390816107ee5790505b508152602001600073ffffffffffffffffffffffffffffffffffffffff16815260200160405180602001604052806000815250815250905061085567ae66e7eaa1062c7360c01b611758565b6108696726a8e7ea48be2c7e60c01b611758565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166396f4e9f9346089856040518463ffffffff1660e01b81526004016108c8929190611dd1565b60206040518083038185885af11580156108e6573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019061090b9190611eb5565b9050610921675ba1778a65e30c8260c01b611758565b6005600081548092919061093490611ed1565b919050555061094d674decdea7c33fe46960c01b611758565b610961679deafb9f08b05ce060c01b611758565b8473ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16827f3c20d4e8f42599eddf3cdb1184580d4ad4d4a3063dbd500a519f8fcf11ea2414876040516109bf9190611aff565b60405180910390a4505050506109d36118e5565b50565b6109ea6730d979daf037f46660c01b611758565b6109f261175b565b610a0667047619bbfc30811660c01b611758565b610a1a67370787762170e35560c01b611758565b610a2e67cfada262c54dbbe160c01b611758565b80600481905550610a496786b73edded1377b860c01b611758565b610a5d6769d8cb93b8133a4d60c01b611758565b7f42dfb00d085d601e55327921154ae76c1b24270b026c5a0c51caee18eb4c401f81604051610a8c9190611aff565b60405180910390a150565b6000600360009054906101000a900460ff16905090565b610ac267ed78b9b4e8a4dc9e60c01b611758565b610aca61175b565b610ade67e9a0ca3e03f3c10f60c01b611758565b610af267406bc5fca4d6466e60c01b611758565b610b06671eb66e8cec7314ce60c01b611758565b610b1a67ec0ce495edd639d860c01b611758565b610b2e675caa80fefb6d949760c01b611758565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610b9d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b9490611cdd565b60405180910390fd5b610bb167569a0b0296d60d1160c01b611758565b610bc5676640f66f9c859e2560c01b611758565b610bd967f098f561f7124a1e60c01b611758565b6000479050610bf26716ebae3422df1da560c01b611758565b610c0667900d6608bb7bc78760c01b611758565b60008273ffffffffffffffffffffffffffffffffffffffff1682604051610c2c90611eef565b60006040518083038185875af1925050503d8060008114610c69576040519150601f19603f3d011682016040523d82523d6000602084013e610c6e565b606091505b50509050610c86673540be2febd0b31e60c01b611758565b610c9a67d473b1bc3c3dc10b60c01b611758565b610cae67699db1f3e42e66bd60c01b611758565b80610cee576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ce590611ef9565b60405180910390fd5b610d02671a0df8e66fbec86460c01b611758565b610d16676275826f0ad28c4360c01b611758565b610d2a67717d0aede648941060c01b611758565b8273ffffffffffffffffffffffffffffffffffffffff167f5fafa99d0643513820be26656b45130b01e1c03062e1266bf36f88cbd3bd969583604051610d709190611aff565b60405180910390a2505050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610e0d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e0490611f37565b60405180910390fd5b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a350565b60045481565b610f2c678aa6e898f0467b0360c01b611758565b610f3461175b565b610f48670c1994928a910ea060c01b611758565b610f5c67e480bae594fbcef160c01b611758565b610f7067b8f098e6bca68fa060c01b611758565b610f8467d042281a608259d760c01b611758565b610f8c6118ef565b565b610fa267b12e3291491d1c0a60c01b611758565b610faa61189b565b610fbe67e23b938e1aafb58060c01b611758565b610fd267ecabf6acd03b5e5b60c01b611758565b610fe667ae2966b3e28f49df60c01b611758565b610ffa67919393bda31d1c5360c01b611758565b61100e67c453fbd9b911e1b860c01b611758565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461109c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161109390611f75565b60405180910390fd5b6110b067e7b6c8db9ea653dd60c01b611758565b6110c467a34b08efe7ad0d3660c01b611758565b6110d867b1227e995299d4db60c01b611758565b6110ec67b2fe1417003e303660c01b611758565b608a8160200160208101906111019190611fb3565b67ffffffffffffffff161461114b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161114290611fe7565b60405180910390fd5b61115f67bd858fe612a7c53b60c01b611758565b61117367b404e85bd252991560c01b611758565b611187677412e169533561cf60c01b611758565b60008180604001906111999190612025565b906111a49190612077565b60601c90506111bd675967210aa8f2d1c360c01b611758565b6111d167dd5a1f6fb98be4fd60c01b611758565b6000808380606001906111e49190612025565b8101906111f191906120af565b91509150611209671812443adbd60dc260c01b611758565b61121d677c2914583116c3b060c01b611758565b611231679ee77455348b84ad60c01b611758565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036112a0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161129790611cdd565b60405180910390fd5b6112b46750cea80432a4ee8560c01b611758565b6112c86705f40b5a000948d060c01b611758565b6112dc67b019f8f9ecb4393660c01b611758565b6112f0676da62c4b26fa79c060c01b611758565b60008111611333576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161132a906120df565b60405180910390fd5b611347671f09043d7c56de8760c01b611758565b61135b676064ced7d804dae860c01b611758565b61136f6706b6a34b4a8cd98360c01b611758565b61138367dc18f358ac62e50260c01b611758565b804710156113c6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113bd9061211d565b60405180910390fd5b6113da67bbe408ccc6f6606160c01b611758565b6113ee67f62b6d10d7eca61960c01b611758565b6114026701bf7034ae46992e60c01b611758565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0826040518263ffffffff1660e01b81526004016000604051808303818588803b15801561146a57600080fd5b505af115801561147e573d6000803e3d6000fd5b5050505050611497673da3dd7e0be0441460c01b611758565b6114ab67feefadc3dcda3f6660c01b611758565b6114bf6751d4235c32c5cc1960c01b611758565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663a9059cbb83836040518363ffffffff1660e01b815260040161151a929190611d4f565b6020604051808303816000875af1158015611539573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061155d919061215b565b61159c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161159390612187565b60405180910390fd5b6115b0670d3e5493b88e1ac960c01b611758565b6115c4679c642a05e6fbbdcf60c01b611758565b6115d867b049f61b325d767f60c01b611758565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1685600001357ff70d2dfb20a334fd3c84cd702f67ad5ba48227a1c9d7d2a96b68e5c50258d7558460405161163a9190611aff565b60405180910390a450505050565b600061165e6759b31102dfe45ebd60c01b611758565b61167267605a91703b106ab360c01b611758565b611686671c23da8d38e383a460c01b611758565b600454905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b608981565b60006116d267fc9f1a8f2391fc5360c01b611758565b6116e66722f11e3cfeb5b2a960c01b611758565b6116fa6791307b0592be213860c01b611758565b7f0000000000000000000000000000000000000000000000000000000000000000905090565b61172861175b565b61173181611952565b50565b7f000000000000000000000000000000000000000000000000000000000000000081565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146117e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016117e0906121c5565b60405180910390fd5b565b6117f3611a7e565b6000600360006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa611837611ac7565b6040516118449190611c14565b60405180910390a1565b6002805403611892576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161188990612203565b60405180910390fd5b60028081905550565b6118a3610a97565b156118e3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016118da90612241565b60405180910390fd5b565b6001600281905550565b6118f761189b565b6001600360006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25861193b611ac7565b6040516119489190611c14565b60405180910390a1565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036119c0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119b79061227f565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b611a86610a97565b611ac5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611abc906122bd565b60405180910390fd5b565b600033905090565b6040518060400160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600081525090565b600060208201905082825292915050565b600060208201905060018060a01b038316825292915050565b60018060a01b0381168114611b3d57600080fd5b50565b600060208284031215611b5257600080fd5b8135611b5d81611b29565b8091505092915050565b600060208284031215611b7957600080fd5b8135905092915050565b6000602082019050821515825292915050565b600060208284031215611ba857600080fd5b8135611bb381611b29565b8091505092915050565b600060208284031215611bcf57600080fd5b813567ffffffffffffffff811115611be657600080fd5b808301905060a08185031215611bfb57600080fd5b8091505092915050565b60018060a01b03811682525050565b600060208201905060018060a01b038316825292915050565b600060208201905067ffffffffffffffff8316825292915050565b600060208201905060018060a01b038316825292915050565b60208152601360208201527f496e73756666696369656e7420616d6f756e740000000000000000000000000060408201526000606082019050919050565b60208152601660208201527f4d657373616765206c696d69742065786365656465640000000000000000000060408201526000606082019050919050565b60208152601160208201527f496e76616c696420726563697069656e7400000000000000000000000000000060408201526000606082019050919050565b634e487b7160e01b600052601160045260246000fd5b6000828203905081811115611d4957611d48611d1b565b5b92915050565b600060408201905060018060a01b03841682528260208301529392505050565b634e487b7160e01b600052604160045260246000fd5b6000815180845260005b81811015611db157602080828601015181838801015250602081019050611d8f565b506000602082860101526020601f19601f83011685010191505092915050565b6000604067ffffffffffffffff8516835260208181850152845160a083860152611dfe60e0860182611d85565b905081860151603f1980878403016060880152611e1b8383611d85565b92508488015191508087840301608088015282825180855285850191508584019450600093505b80841015611e7657845160018060a01b03815116835286810151878401525086820191508585019450600184019350611e42565b5060608901519550611e8b60a0890187611c05565b60808901519550818882030160c0890152611ea68187611d85565b96505050505050509392505050565b600060208284031215611ec757600080fd5b8151905092915050565b600080198203611ee457611ee3611d1b565b5b600182019050919050565b6000819050919050565b60208152600f60208201527f5472616e73666572206661696c6564000000000000000000000000000000000060408201526000606082019050919050565b60208152601660208201527f4d7573742062652070726f706f736564206f776e65720000000000000000000060408201526000606082019050919050565b60208152601360208201527f556e617574686f72697a65642073656e6465720000000000000000000000000060408201526000606082019050919050565b600060208284031215611fc557600080fd5b813567ffffffffffffffff81168114611fdd57600080fd5b8091505092915050565b60208152601460208201527f496e76616c696420736f7572636520636861696e00000000000000000000000060408201526000606082019050919050565b6000808335601e1984360301811261203c57600080fd5b80840190508035915067ffffffffffffffff82111561205a57600080fd5b6020810192505080360382131561207057600080fd5b9250929050565b600081356bffffffffffffffffffffffff19808216925060148510156120a75780818660140360031b1b83161692505b505092915050565b600080604083850312156120c257600080fd5b82356120cd81611b29565b80925050602083013590509250929050565b60208152601d60208201527f416d6f756e74206d7573742062652067726561746572207468616e203000000060408201526000606082019050919050565b60208152601460208201527f496e73756666696369656e742062616c616e636500000000000000000000000060408201526000606082019050919050565b60006020828403121561216d57600080fd5b8151801515811461217d57600080fd5b8091505092915050565b60208152601460208201527f57455448207472616e73666572206661696c656400000000000000000000000060408201526000606082019050919050565b60208152601660208201527f4f6e6c792063616c6c61626c65206279206f776e65720000000000000000000060408201526000606082019050919050565b60208152601f60208201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060408201526000606082019050919050565b60208152601060208201527f5061757361626c653a207061757365640000000000000000000000000000000060408201526000606082019050919050565b60208152601760208201527f43616e6e6f74207472616e7366657220746f2073656c6600000000000000000060408201526000606082019050919050565b60208152601460208201527f5061757361626c653a206e6f74207061757365640000000000000000000000006040820152600060608201905091905056fea26469706673582212208f1f3f4240bf7d327945cb64e076a0c8c175ecbb68a21f8ccc74303d545d334c64736f6c63430008130033";

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
    _weth: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CrossChainMessenger> {
    return super.deploy(
      _router,
      _weth,
      overrides || {}
    ) as Promise<CrossChainMessenger>;
  }
  override getDeployTransaction(
    _router: PromiseOrValue<string>,
    _weth: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_router, _weth, overrides || {});
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
