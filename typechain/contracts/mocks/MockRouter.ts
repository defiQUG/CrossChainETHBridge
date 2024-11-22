/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export declare namespace Client {
  export type EVMTokenAmountStruct = {
    token: PromiseOrValue<string>;
    amount: PromiseOrValue<BigNumberish>;
  };

  export type EVMTokenAmountStructOutput = [string, BigNumber] & {
    token: string;
    amount: BigNumber;
  };

  export type Any2EVMMessageStruct = {
    messageId: PromiseOrValue<BytesLike>;
    sourceChainSelector: PromiseOrValue<BigNumberish>;
    sender: PromiseOrValue<BytesLike>;
    data: PromiseOrValue<BytesLike>;
    destTokenAmounts: Client.EVMTokenAmountStruct[];
  };

  export type Any2EVMMessageStructOutput = [
    string,
    BigNumber,
    string,
    string,
    Client.EVMTokenAmountStructOutput[]
  ] & {
    messageId: string;
    sourceChainSelector: BigNumber;
    sender: string;
    data: string;
    destTokenAmounts: Client.EVMTokenAmountStructOutput[];
  };

  export type EVM2AnyMessageStruct = {
    receiver: PromiseOrValue<BytesLike>;
    data: PromiseOrValue<BytesLike>;
    tokenAmounts: Client.EVMTokenAmountStruct[];
    feeToken: PromiseOrValue<string>;
    extraArgs: PromiseOrValue<BytesLike>;
  };

  export type EVM2AnyMessageStructOutput = [
    string,
    string,
    Client.EVMTokenAmountStructOutput[],
    string,
    string
  ] & {
    receiver: string;
    data: string;
    tokenAmounts: Client.EVMTokenAmountStructOutput[];
    feeToken: string;
    extraArgs: string;
  };
}

export interface MockRouterInterface extends utils.Interface {
  functions: {
    "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))": FunctionFragment;
    "ccipSend(uint64,(bytes,bytes,(address,uint256)[],address,bytes))": FunctionFragment;
    "getFee(uint64,(bytes,bytes,(address,uint256)[],address,bytes))": FunctionFragment;
    "getSupportedTokens(uint64)": FunctionFragment;
    "isChainSupported(uint64)": FunctionFragment;
    "simulateMessageReceived(address,bytes32,address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "ccipReceive"
      | "ccipSend"
      | "getFee"
      | "getSupportedTokens"
      | "isChainSupported"
      | "simulateMessageReceived"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "ccipReceive",
    values: [Client.Any2EVMMessageStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "ccipSend",
    values: [PromiseOrValue<BigNumberish>, Client.EVM2AnyMessageStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getFee",
    values: [PromiseOrValue<BigNumberish>, Client.EVM2AnyMessageStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getSupportedTokens",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "isChainSupported",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "simulateMessageReceived",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "ccipReceive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "ccipSend", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getSupportedTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isChainSupported",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "simulateMessageReceived",
    data: BytesLike
  ): Result;

  events: {
    "MessageSent(uint64,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "MessageSent"): EventFragment;
}

export interface MessageSentEventObject {
  destinationChainSelector: BigNumber;
  receiver: string;
  amount: BigNumber;
}
export type MessageSentEvent = TypedEvent<
  [BigNumber, string, BigNumber],
  MessageSentEventObject
>;

export type MessageSentEventFilter = TypedEventFilter<MessageSentEvent>;

export interface MockRouter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MockRouterInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    ccipReceive(
      message: Client.Any2EVMMessageStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    ccipSend(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getFee(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { fee: BigNumber }>;

    getSupportedTokens(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string[]] & { tokens: string[] }>;

    isChainSupported(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean] & { supported: boolean }>;

    simulateMessageReceived(
      target: PromiseOrValue<string>,
      messageId: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  ccipReceive(
    message: Client.Any2EVMMessageStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  ccipSend(
    destinationChainSelector: PromiseOrValue<BigNumberish>,
    message: Client.EVM2AnyMessageStruct,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getFee(
    destinationChainSelector: PromiseOrValue<BigNumberish>,
    message: Client.EVM2AnyMessageStruct,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getSupportedTokens(
    chainSelector: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  isChainSupported(
    chainSelector: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  simulateMessageReceived(
    target: PromiseOrValue<string>,
    messageId: PromiseOrValue<BytesLike>,
    sender: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    ccipReceive(
      message: Client.Any2EVMMessageStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    ccipSend(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: CallOverrides
    ): Promise<string>;

    getFee(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSupportedTokens(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    isChainSupported(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    simulateMessageReceived(
      target: PromiseOrValue<string>,
      messageId: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "MessageSent(uint64,address,uint256)"(
      destinationChainSelector?: null,
      receiver?: null,
      amount?: null
    ): MessageSentEventFilter;
    MessageSent(
      destinationChainSelector?: null,
      receiver?: null,
      amount?: null
    ): MessageSentEventFilter;
  };

  estimateGas: {
    ccipReceive(
      message: Client.Any2EVMMessageStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    ccipSend(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getFee(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSupportedTokens(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isChainSupported(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    simulateMessageReceived(
      target: PromiseOrValue<string>,
      messageId: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ccipReceive(
      message: Client.Any2EVMMessageStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    ccipSend(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getFee(
      destinationChainSelector: PromiseOrValue<BigNumberish>,
      message: Client.EVM2AnyMessageStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSupportedTokens(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isChainSupported(
      chainSelector: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    simulateMessageReceived(
      target: PromiseOrValue<string>,
      messageId: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
