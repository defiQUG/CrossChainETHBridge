/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  CrossChainMessenger,
  CrossChainMessengerInterface,
} from "../../contracts/CrossChainMessenger";

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
  "0x60a06040523480156200001157600080fd5b506040516200286438038062002864833981810160405281019062000037919062000474565b338060008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603620000ac576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620000a39062000507565b60405180910390fd5b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161462000133576200013281620002d860201b60201c565b5b50505060016002819055506000600360006101000a81548160ff0219169083151502179055506200017567ac30444dae65d43d60c01b6200040760201b60201c565b62000191674aec59e7b5737a9860c01b6200040760201b60201c565b620001ad6798ad738bb4e5c14260c01b6200040760201b60201c565b620001c967523fdb28d5d2a11360c01b6200040760201b60201c565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036200023b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620002329062000579565b60405180910390fd5b62000257673855e5909f291cd860c01b6200040760201b60201c565b620002736718ba5e470cc60ef460c01b6200040760201b60201c565b8073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1681525050620002c36738625f2b14ec2bfd60c01b6200040760201b60201c565b66038d7ea4c68000600481905550506200060d565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160362000349576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200034090620005eb565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b50565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200043c826200040f565b9050919050565b6200044e816200042f565b81146200045a57600080fd5b50565b6000815190506200046e8162000443565b92915050565b6000602082840312156200048d576200048c6200040a565b5b60006200049d848285016200045d565b91505092915050565b600082825260208201905092915050565b7f43616e6e6f7420736574206f776e657220746f207a65726f0000000000000000600082015250565b6000620004ef601883620004a6565b9150620004fc82620004b7565b602082019050919050565b600060208201905081810360008301526200052281620004e0565b9050919050565b7f496e76616c696420726f75746572206164647265737300000000000000000000600082015250565b600062000561601683620004a6565b91506200056e8262000529565b602082019050919050565b60006020820190508181036000830152620005948162000552565b9050919050565b7f43616e6e6f74207472616e7366657220746f2073656c66000000000000000000600082015250565b6000620005d3601783620004a6565b9150620005e0826200059b565b602082019050919050565b600060208201905081810360008301526200060681620005c4565b9050919050565b60805161222d620006376000396000818161068c01528181610e3a015261122b015261222d6000f3fe6080604052600436106100ec5760003560e01c806379ba50971161008a5780638da5cb5b116100595780638da5cb5b14610280578063a98de888146102ab578063f2fde38b146102d6578063f887ea40146102ff576100f3565b806379ba5097146101fe57806382b12dd7146102155780638456cb591461024057806385572ffb14610257576100f3565b806354143833116100c657806354143833146101655780635a1c0366146101815780635c975abb146101aa5780636ff1c9bc146101d5576100f3565b80632366af53146100f85780633f4ba83a14610123578063529c75881461013a576100f3565b366100f357005b600080fd5b34801561010457600080fd5b5061010d61032a565b60405161011a919061160d565b60405180910390f35b34801561012f57600080fd5b5061013861032f565b005b34801561014657600080fd5b5061014f6103a5565b60405161015c919061160d565b60405180910390f35b61017f600480360381019061017a9190611690565b6103ab565b005b34801561018d57600080fd5b506101a860048036038101906101a391906116e9565b610800565b005b3480156101b657600080fd5b506101bf6108c1565b6040516101cc9190611731565b60405180910390f35b3480156101e157600080fd5b506101fc60048036038101906101f7919061178a565b6108d8565b005b34801561020a57600080fd5b50610213610ba7565b005b34801561022157600080fd5b5061022a610d3c565b604051610237919061160d565b60405180910390f35b34801561024c57600080fd5b50610255610d42565b005b34801561026357600080fd5b5061027e600480360381019061027991906117db565b610db8565b005b34801561028c57600080fd5b506102956111e7565b6040516102a29190611833565b60405180910390f35b3480156102b757600080fd5b506102c0611210565b6040516102cd9190611871565b60405180910390f35b3480156102e257600080fd5b506102fd60048036038101906102f89190611690565b611215565b005b34801561030b57600080fd5b50610314611229565b60405161032191906118eb565b60405180910390f35b606481565b61034367fbe95abde1ebfe3d60c01b61124d565b61034b611250565b61035f67f6de8b9790baa84d60c01b61124d565b610373675b5c75ed4174ee5f60c01b61124d565b61038767ffb69390a3c1201360c01b61124d565b61039b6777f8062d1af77df660c01b61124d565b6103a36112e0565b565b60055481565b6103bf67d2e696b9f8f30ccd60c01b61124d565b6103c7611343565b6103db673c164d985977ffb460c01b61124d565b6103ef677ae2e79c3312277f60c01b61124d565b6103f7611390565b61040b6797a5fa941415a94060c01b61124d565b61041f6726a8e7ea48be2c7e60c01b61124d565b610433675ba1778a65e30c8260c01b61124d565b610447674decdea7c33fe46960c01b61124d565b61045b679deafb9f08b05ce060c01b61124d565b600454341161049f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161049690611963565b60405180910390fd5b6104b367c9de36c533ae2b2160c01b61124d565b6104c767f72d5da2abc6c9dd60c01b61124d565b6104db67ecabf6acd03b5e5b60c01b61124d565b6104ef67ae2966b3e28f49df60c01b61124d565b606460055410610534576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161052b906119cf565b60405180910390fd5b61054867919393bda31d1c5360c01b61124d565b61055c67c453fbd9b911e1b860c01b61124d565b61057067e7b6c8db9ea653dd60c01b61124d565b60006040518060a001604052808360405160200161058e9190611833565b6040516020818303038152906040528152602001600454346105b09190611a1e565b6040516020016105c0919061160d565b6040516020818303038152906040528152602001600067ffffffffffffffff8111156105ef576105ee611a52565b5b60405190808252806020026020018201604052801561062857816020015b6106156115c4565b81526020019060019003908161060d5790505b508152602001600073ffffffffffffffffffffffffffffffffffffffff16815260200160405180602001604052806000815250815250905061067467a34b08efe7ad0d3660c01b61124d565b61068867b1227e995299d4db60c01b61124d565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166396f4e9f9346089856040518463ffffffff1660e01b81526004016106e7929190611c98565b60206040518083038185885af1158015610705573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019061072a9190611cfe565b905061074067b2fe1417003e303660c01b61124d565b6005600081548092919061075390611d2b565b919050555061076c67bd858fe612a7c53b60c01b61124d565b61078067b404e85bd252991560c01b61124d565b8273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16827f3c20d4e8f42599eddf3cdb1184580d4ad4d4a3063dbd500a519f8fcf11ea2414600454346107de9190611a1e565b6040516107eb919061160d565b60405180910390a450506107fd6113da565b50565b61081467fed55e60686d0d9360c01b61124d565b61081c611250565b61083067098171476f91edfc60c01b61124d565b61084467370787762170e35560c01b61124d565b61085867cfada262c54dbbe160c01b61124d565b806004819055506108736786b73edded1377b860c01b61124d565b6108876769d8cb93b8133a4d60c01b61124d565b7f42dfb00d085d601e55327921154ae76c1b24270b026c5a0c51caee18eb4c401f816040516108b6919061160d565b60405180910390a150565b6000600360009054906101000a900460ff16905090565b6108ec679c0bcba719874b5960c01b61124d565b6108f4611250565b61090867127a1e6cb1b5715760c01b61124d565b61091c67406bc5fca4d6466e60c01b61124d565b610930671eb66e8cec7314ce60c01b61124d565b61094467ec0ce495edd639d860c01b61124d565b610958675caa80fefb6d949760c01b61124d565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036109c7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109be90611dbf565b60405180910390fd5b6109db67569a0b0296d60d1160c01b61124d565b6109ef676640f66f9c859e2560c01b61124d565b610a0367f098f561f7124a1e60c01b61124d565b6000479050610a1c6716ebae3422df1da560c01b61124d565b610a3067900d6608bb7bc78760c01b61124d565b60008273ffffffffffffffffffffffffffffffffffffffff1682604051610a5690611e10565b60006040518083038185875af1925050503d8060008114610a93576040519150601f19603f3d011682016040523d82523d6000602084013e610a98565b606091505b50509050610ab0673540be2febd0b31e60c01b61124d565b610ac467d473b1bc3c3dc10b60c01b61124d565b610ad867699db1f3e42e66bd60c01b61124d565b80610b18576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b0f90611e71565b60405180910390fd5b610b2c671a0df8e66fbec86460c01b61124d565b610b40676275826f0ad28c4360c01b61124d565b610b5467717d0aede648941060c01b61124d565b8273ffffffffffffffffffffffffffffffffffffffff167f5fafa99d0643513820be26656b45130b01e1c03062e1266bf36f88cbd3bd969583604051610b9a919061160d565b60405180910390a2505050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610c37576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c2e90611edd565b60405180910390fd5b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a350565b60045481565b610d5667c0515df7bed4bcf760c01b61124d565b610d5e611250565b610d7267279c15069515bded60c01b61124d565b610d8667e480bae594fbcef160c01b61124d565b610d9a67b8f098e6bca68fa060c01b61124d565b610dae67d042281a608259d760c01b61124d565b610db66113e4565b565b610dcc67b87de951e25cb03a60c01b61124d565b610dd4611390565b610de867b38df0e0fc39af2760c01b61124d565b610dfc67dd5a1f6fb98be4fd60c01b61124d565b610e10671812443adbd60dc260c01b61124d565b610e24677c2914583116c3b060c01b61124d565b610e38679ee77455348b84ad60c01b61124d565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610ec6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ebd90611f49565b60405180910390fd5b610eda6750cea80432a4ee8560c01b61124d565b610eee6705f40b5a000948d060c01b61124d565b610f0267b019f8f9ecb4393660c01b61124d565b6000818060400190610f149190611f78565b810190610f21919061178a565b9050610f37676da62c4b26fa79c060c01b61124d565b610f4b671f09043d7c56de8760c01b61124d565b6000828060600190610f5d9190611f78565b810190610f6a91906116e9565b9050610f80676064ced7d804dae860c01b61124d565b610f946706b6a34b4a8cd98360c01b61124d565b610fa867dc18f358ac62e50260c01b61124d565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611017576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161100e90611dbf565b60405180910390fd5b61102b67bbe408ccc6f6606160c01b61124d565b61103f67f62b6d10d7eca61960c01b61124d565b6110536701bf7034ae46992e60c01b61124d565b60008273ffffffffffffffffffffffffffffffffffffffff168260405161107990611e10565b60006040518083038185875af1925050503d80600081146110b6576040519150601f19603f3d011682016040523d82523d6000602084013e6110bb565b606091505b505090506110d3673da3dd7e0be0441460c01b61124d565b6110e767feefadc3dcda3f6660c01b61124d565b6110fb6751d4235c32c5cc1960c01b61124d565b8061113b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161113290611e71565b60405180910390fd5b61114f670d3e5493b88e1ac960c01b61124d565b611163679c642a05e6fbbdcf60c01b61124d565b61117767b049f61b325d767f60c01b61124d565b8273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1685600001357ff70d2dfb20a334fd3c84cd702f67ad5ba48227a1c9d7d2a96b68e5c50258d755856040516111d9919061160d565b60405180910390a450505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b608981565b61121d611250565b61122681611447565b50565b7f000000000000000000000000000000000000000000000000000000000000000081565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146112de576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016112d590612027565b60405180910390fd5b565b6112e8611573565b6000600360006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa61132c6115bc565b6040516113399190611833565b60405180910390a1565b6002805403611387576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161137e90612093565b60405180910390fd5b60028081905550565b6113986108c1565b156113d8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113cf906120ff565b60405180910390fd5b565b6001600281905550565b6113ec611390565b6001600360006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586114306115bc565b60405161143d9190611833565b60405180910390a1565b3373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036114b5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114ac9061216b565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae127860405160405180910390a350565b61157b6108c1565b6115ba576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115b1906121d7565b60405180910390fd5b565b600033905090565b6040518060400160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600081525090565b6000819050919050565b611607816115f4565b82525050565b600060208201905061162260008301846115fe565b92915050565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061165d82611632565b9050919050565b61166d81611652565b811461167857600080fd5b50565b60008135905061168a81611664565b92915050565b6000602082840312156116a6576116a5611628565b5b60006116b48482850161167b565b91505092915050565b6116c6816115f4565b81146116d157600080fd5b50565b6000813590506116e3816116bd565b92915050565b6000602082840312156116ff576116fe611628565b5b600061170d848285016116d4565b91505092915050565b60008115159050919050565b61172b81611716565b82525050565b60006020820190506117466000830184611722565b92915050565b600061175782611632565b9050919050565b6117678161174c565b811461177257600080fd5b50565b6000813590506117848161175e565b92915050565b6000602082840312156117a05761179f611628565b5b60006117ae84828501611775565b91505092915050565b600080fd5b600060a082840312156117d2576117d16117b7565b5b81905092915050565b6000602082840312156117f1576117f0611628565b5b600082013567ffffffffffffffff81111561180f5761180e61162d565b5b61181b848285016117bc565b91505092915050565b61182d81611652565b82525050565b60006020820190506118486000830184611824565b92915050565b600067ffffffffffffffff82169050919050565b61186b8161184e565b82525050565b60006020820190506118866000830184611862565b92915050565b6000819050919050565b60006118b16118ac6118a784611632565b61188c565b611632565b9050919050565b60006118c382611896565b9050919050565b60006118d5826118b8565b9050919050565b6118e5816118ca565b82525050565b600060208201905061190060008301846118dc565b92915050565b600082825260208201905092915050565b7f496e73756666696369656e7420616d6f756e7400000000000000000000000000600082015250565b600061194d601383611906565b915061195882611917565b602082019050919050565b6000602082019050818103600083015261197c81611940565b9050919050565b7f4d657373616765206c696d697420657863656564656400000000000000000000600082015250565b60006119b9601683611906565b91506119c482611983565b602082019050919050565b600060208201905081810360008301526119e8816119ac565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611a29826115f4565b9150611a34836115f4565b9250828203905081811115611a4c57611a4b6119ef565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600081519050919050565b600082825260208201905092915050565b60005b83811015611abb578082015181840152602081019050611aa0565b60008484015250505050565b6000601f19601f8301169050919050565b6000611ae382611a81565b611aed8185611a8c565b9350611afd818560208601611a9d565b611b0681611ac7565b840191505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b611b4681611652565b82525050565b611b55816115f4565b82525050565b604082016000820151611b716000850182611b3d565b506020820151611b846020850182611b4c565b50505050565b6000611b968383611b5b565b60408301905092915050565b6000602082019050919050565b6000611bba82611b11565b611bc48185611b1c565b9350611bcf83611b2d565b8060005b83811015611c00578151611be78882611b8a565b9750611bf283611ba2565b925050600181019050611bd3565b5085935050505092915050565b600060a0830160008301518482036000860152611c2a8282611ad8565b91505060208301518482036020860152611c448282611ad8565b91505060408301518482036040860152611c5e8282611baf565b9150506060830151611c736060860182611b3d565b5060808301518482036080860152611c8b8282611ad8565b9150508091505092915050565b6000604082019050611cad6000830185611862565b8181036020830152611cbf8184611c0d565b90509392505050565b6000819050919050565b611cdb81611cc8565b8114611ce657600080fd5b50565b600081519050611cf881611cd2565b92915050565b600060208284031215611d1457611d13611628565b5b6000611d2284828501611ce9565b91505092915050565b6000611d36826115f4565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611d6857611d676119ef565b5b600182019050919050565b7f496e76616c696420726563697069656e74000000000000000000000000000000600082015250565b6000611da9601183611906565b9150611db482611d73565b602082019050919050565b60006020820190508181036000830152611dd881611d9c565b9050919050565b600081905092915050565b50565b6000611dfa600083611ddf565b9150611e0582611dea565b600082019050919050565b6000611e1b82611ded565b9150819050919050565b7f5472616e73666572206661696c65640000000000000000000000000000000000600082015250565b6000611e5b600f83611906565b9150611e6682611e25565b602082019050919050565b60006020820190508181036000830152611e8a81611e4e565b9050919050565b7f4d7573742062652070726f706f736564206f776e657200000000000000000000600082015250565b6000611ec7601683611906565b9150611ed282611e91565b602082019050919050565b60006020820190508181036000830152611ef681611eba565b9050919050565b7f4f6e6c7920726f757465722063616e2063616c6c000000000000000000000000600082015250565b6000611f33601483611906565b9150611f3e82611efd565b602082019050919050565b60006020820190508181036000830152611f6281611f26565b9050919050565b600080fd5b600080fd5b600080fd5b60008083356001602003843603038112611f9557611f94611f69565b5b80840192508235915067ffffffffffffffff821115611fb757611fb6611f6e565b5b602083019250600182023603831315611fd357611fd2611f73565b5b509250929050565b7f4f6e6c792063616c6c61626c65206279206f776e657200000000000000000000600082015250565b6000612011601683611906565b915061201c82611fdb565b602082019050919050565b6000602082019050818103600083015261204081612004565b9050919050565b7f5265656e7472616e637947756172643a207265656e7472616e742063616c6c00600082015250565b600061207d601f83611906565b915061208882612047565b602082019050919050565b600060208201905081810360008301526120ac81612070565b9050919050565b7f5061757361626c653a2070617573656400000000000000000000000000000000600082015250565b60006120e9601083611906565b91506120f4826120b3565b602082019050919050565b60006020820190508181036000830152612118816120dc565b9050919050565b7f43616e6e6f74207472616e7366657220746f2073656c66000000000000000000600082015250565b6000612155601783611906565b91506121608261211f565b602082019050919050565b6000602082019050818103600083015261218481612148565b9050919050565b7f5061757361626c653a206e6f7420706175736564000000000000000000000000600082015250565b60006121c1601483611906565b91506121cc8261218b565b602082019050919050565b600060208201905081810360008301526121f0816121b4565b905091905056fea264697066735822122007d908d9677ac6703e8d263fda3a80f9d0ebf919d6dc00e5126949977a2da71a64736f6c63430008130033";

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
