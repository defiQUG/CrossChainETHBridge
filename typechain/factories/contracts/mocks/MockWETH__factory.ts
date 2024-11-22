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
  "0x60806040523480156200001157600080fd5b506040518060400160405280600d81526020017f57726170706564204574686572000000000000000000000000000000000000008152506040518060400160405280600481526020017f574554480000000000000000000000000000000000000000000000000000000081525081600390816200008f919062000343565b508060049081620000a1919062000343565b505050620000c067abf866d456deeaa360c01b620000c660201b60201c565b6200042a565b50565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200014b57607f821691505b60208210810362000161576200016062000103565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620001cb7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200018c565b620001d786836200018c565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b6000620002246200021e6200021884620001ef565b620001f9565b620001ef565b9050919050565b6000819050919050565b620002408362000203565b620002586200024f826200022b565b84845462000199565b825550505050565b600090565b6200026f62000260565b6200027c81848462000235565b505050565b5b81811015620002a4576200029860008262000265565b60018101905062000282565b5050565b601f821115620002f357620002bd8162000167565b620002c8846200017c565b81016020851015620002d8578190505b620002f0620002e7856200017c565b83018262000281565b50505b505050565b600082821c905092915050565b60006200031860001984600802620002f8565b1980831691505092915050565b600062000333838362000305565b9150826002028217905092915050565b6200034e82620000c9565b67ffffffffffffffff8111156200036a5762000369620000d4565b5b62000376825462000132565b62000383828285620002a8565b600060209050601f831160018114620003bb5760008415620003a6578287015190505b620003b2858262000325565b86555062000422565b601f198416620003cb8662000167565b60005b82811015620003f557848901518255600182019150602085019450602081019050620003ce565b8683101562000415578489015162000411601f89168262000305565b8355505b6001600288020188555050505b505050505050565b611b82806200043a6000396000f3fe6080604052600436106100c65760003560e01c8063395093511161007f578063a457c2d711610059578063a457c2d7146102b7578063a9059cbb146102f4578063d0e30db014610331578063dd62ed3e1461033b576100e9565b8063395093511461021257806370a082311461024f57806395d89b411461028c576100e9565b806306fdde03146100ee578063095ea7b31461011957806318160ddd1461015657806323b872dd146101815780632e1a7d4d146101be578063313ce567146101e7576100e9565b366100e9576100df67aa3d76c159ce4f4660c01b610378565b6100e761037b565b005b600080fd5b3480156100fa57600080fd5b506101036103c3565b6040516101109190611184565b60405180910390f35b34801561012557600080fd5b50610140600480360381019061013b919061123f565b610455565b60405161014d919061129a565b60405180910390f35b34801561016257600080fd5b5061016b610478565b60405161017891906112c4565b60405180910390f35b34801561018d57600080fd5b506101a860048036038101906101a391906112df565b610482565b6040516101b5919061129a565b60405180910390f35b3480156101ca57600080fd5b506101e560048036038101906101e09190611332565b6104b1565b005b3480156101f357600080fd5b506101fc6106b9565b604051610209919061137b565b60405180910390f35b34801561021e57600080fd5b506102396004803603810190610234919061123f565b6106c2565b604051610246919061129a565b60405180910390f35b34801561025b57600080fd5b5061027660048036038101906102719190611396565b6106f9565b60405161028391906112c4565b60405180910390f35b34801561029857600080fd5b506102a1610741565b6040516102ae9190611184565b60405180910390f35b3480156102c357600080fd5b506102de60048036038101906102d9919061123f565b6107d3565b6040516102eb919061129a565b60405180910390f35b34801561030057600080fd5b5061031b6004803603810190610316919061123f565b61084a565b604051610328919061129a565b60405180910390f35b61033961037b565b005b34801561034757600080fd5b50610362600480360381019061035d91906113c3565b61086d565b60405161036f91906112c4565b60405180910390f35b50565b61038f678694ac81866c764760c01b610378565b6103a3675cb1edc41df5afd760c01b610378565b6103b767aab57988ddaa54e660c01b610378565b6103c133346108f4565b565b6060600380546103d290611432565b80601f01602080910402602001604051908101604052809291908181526020018280546103fe90611432565b801561044b5780601f106104205761010080835404028352916020019161044b565b820191906000526020600020905b81548152906001019060200180831161042e57829003601f168201915b5050505050905090565b600080610460610a4a565b905061046d818585610a52565b600191505092915050565b6000600254905090565b60008061048d610a4a565b905061049a858285610c1b565b6104a5858585610ca7565b60019150509392505050565b6104c567e3e234bb8dc2010b60c01b610378565b6104d967357d2b0d0ea5f33360c01b610378565b6104ed676c3ec07526d216a160c01b610378565b6105016752787bca4f64185060c01b610378565b8061050b336106f9565b101561054c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610543906114af565b60405180910390fd5b61056067bcfe271c2dd6840660c01b610378565b61057467bc9b0c509b48321060c01b610378565b6105886708ce6d790e82a97e60c01b610378565b6105923382610f1d565b6105a667b2b7ca754583280b60c01b610378565b6105ba675e3bd3ad4c96a4d160c01b610378565b60003373ffffffffffffffffffffffffffffffffffffffff16826040516105e090611500565b60006040518083038185875af1925050503d806000811461061d576040519150601f19603f3d011682016040523d82523d6000602084013e610622565b606091505b505090506106396642b1d20865ac5460c01b610378565b61064d6708f6ff5bfb10301960c01b610378565b610661673f9c32a8e8996b5560c01b610378565b806106a1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161069890611561565b60405180910390fd5b6106b567893d5c6e50589dad60c01b610378565b5050565b60006012905090565b6000806106cd610a4a565b90506106ee8185856106df858961086d565b6106e991906115b0565b610a52565b600191505092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461075090611432565b80601f016020809104026020016040519081016040528092919081815260200182805461077c90611432565b80156107c95780601f1061079e576101008083540402835291602001916107c9565b820191906000526020600020905b8154815290600101906020018083116107ac57829003601f168201915b5050505050905090565b6000806107de610a4a565b905060006107ec828661086d565b905083811015610831576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082890611656565b60405180910390fd5b61083e8286868403610a52565b60019250505092915050565b600080610855610a4a565b9050610862818585610ca7565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610963576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161095a906116c2565b60405180910390fd5b61096f600083836110ea565b806002600082825461098191906115b0565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a3291906112c4565b60405180910390a3610a46600083836110ef565b5050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610ac1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ab890611754565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610b30576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b27906117e6565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92583604051610c0e91906112c4565b60405180910390a3505050565b6000610c27848461086d565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114610ca15781811015610c93576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c8a90611852565b60405180910390fd5b610ca08484848403610a52565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610d16576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0d906118e4565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610d85576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d7c90611976565b60405180910390fd5b610d908383836110ea565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610e16576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e0d90611a08565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610f0491906112c4565b60405180910390a3610f178484846110ef565b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610f8c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f8390611a9a565b60405180910390fd5b610f98826000836110ea565b60008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490508181101561101e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161101590611b2c565b60405180910390fd5b8181036000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600260008282540392505081905550600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516110d191906112c4565b60405180910390a36110e5836000846110ef565b505050565b505050565b505050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561112e578082015181840152602081019050611113565b60008484015250505050565b6000601f19601f8301169050919050565b6000611156826110f4565b61116081856110ff565b9350611170818560208601611110565b6111798161113a565b840191505092915050565b6000602082019050818103600083015261119e818461114b565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006111d6826111ab565b9050919050565b6111e6816111cb565b81146111f157600080fd5b50565b600081359050611203816111dd565b92915050565b6000819050919050565b61121c81611209565b811461122757600080fd5b50565b60008135905061123981611213565b92915050565b60008060408385031215611256576112556111a6565b5b6000611264858286016111f4565b92505060206112758582860161122a565b9150509250929050565b60008115159050919050565b6112948161127f565b82525050565b60006020820190506112af600083018461128b565b92915050565b6112be81611209565b82525050565b60006020820190506112d960008301846112b5565b92915050565b6000806000606084860312156112f8576112f76111a6565b5b6000611306868287016111f4565b9350506020611317868287016111f4565b92505060406113288682870161122a565b9150509250925092565b600060208284031215611348576113476111a6565b5b60006113568482850161122a565b91505092915050565b600060ff82169050919050565b6113758161135f565b82525050565b6000602082019050611390600083018461136c565b92915050565b6000602082840312156113ac576113ab6111a6565b5b60006113ba848285016111f4565b91505092915050565b600080604083850312156113da576113d96111a6565b5b60006113e8858286016111f4565b92505060206113f9858286016111f4565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061144a57607f821691505b60208210810361145d5761145c611403565b5b50919050565b7f4d6f636b574554483a20696e73756666696369656e742062616c616e63650000600082015250565b6000611499601e836110ff565b91506114a482611463565b602082019050919050565b600060208201905081810360008301526114c88161148c565b9050919050565b600081905092915050565b50565b60006114ea6000836114cf565b91506114f5826114da565b600082019050919050565b600061150b826114dd565b9150819050919050565b7f4d6f636b574554483a20455448207472616e73666572206661696c6564000000600082015250565b600061154b601d836110ff565b915061155682611515565b602082019050919050565b6000602082019050818103600083015261157a8161153e565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006115bb82611209565b91506115c683611209565b92508282019050808211156115de576115dd611581565b5b92915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b60006116406025836110ff565b915061164b826115e4565b604082019050919050565b6000602082019050818103600083015261166f81611633565b9050919050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b60006116ac601f836110ff565b91506116b782611676565b602082019050919050565b600060208201905081810360008301526116db8161169f565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b600061173e6024836110ff565b9150611749826116e2565b604082019050919050565b6000602082019050818103600083015261176d81611731565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b60006117d06022836110ff565b91506117db82611774565b604082019050919050565b600060208201905081810360008301526117ff816117c3565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000600082015250565b600061183c601d836110ff565b915061184782611806565b602082019050919050565b6000602082019050818103600083015261186b8161182f565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b60006118ce6025836110ff565b91506118d982611872565b604082019050919050565b600060208201905081810360008301526118fd816118c1565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b60006119606023836110ff565b915061196b82611904565b604082019050919050565b6000602082019050818103600083015261198f81611953565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b60006119f26026836110ff565b91506119fd82611996565b604082019050919050565b60006020820190508181036000830152611a21816119e5565b9050919050565b7f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360008201527f7300000000000000000000000000000000000000000000000000000000000000602082015250565b6000611a846021836110ff565b9150611a8f82611a28565b604082019050919050565b60006020820190508181036000830152611ab381611a77565b9050919050565b7f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60008201527f6365000000000000000000000000000000000000000000000000000000000000602082015250565b6000611b166022836110ff565b9150611b2182611aba565b604082019050919050565b60006020820190508181036000830152611b4581611b09565b905091905056fea264697066735822122079e81e0d993f68af2f85eba52af155f2bf6089a89f51087e579e14bced24cf3264736f6c63430008130033";

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
