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
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../../../../common";

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
}

export interface IRouterInterface extends utils.Interface {
  functions: {
    "routeMessage((bytes32,uint64,bytes,bytes,(address,uint256)[]),uint16,uint256,address)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "routeMessage"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "routeMessage",
    values: [
      Client.Any2EVMMessageStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "routeMessage",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IRouter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IRouterInterface;

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
    routeMessage(
      message: Client.Any2EVMMessageStruct,
      gasForCallExactCheck: PromiseOrValue<BigNumberish>,
      gasLimit: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  routeMessage(
    message: Client.Any2EVMMessageStruct,
    gasForCallExactCheck: PromiseOrValue<BigNumberish>,
    gasLimit: PromiseOrValue<BigNumberish>,
    receiver: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    routeMessage(
      message: Client.Any2EVMMessageStruct,
      gasForCallExactCheck: PromiseOrValue<BigNumberish>,
      gasLimit: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [boolean, string, BigNumber] & {
        success: boolean;
        retBytes: string;
        gasUsed: BigNumber;
      }
    >;
  };

  filters: {};

  estimateGas: {
    routeMessage(
      message: Client.Any2EVMMessageStruct,
      gasForCallExactCheck: PromiseOrValue<BigNumberish>,
      gasLimit: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    routeMessage(
      message: Client.Any2EVMMessageStruct,
      gasForCallExactCheck: PromiseOrValue<BigNumberish>,
      gasLimit: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
