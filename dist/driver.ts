import { str as crc32Encode } from 'crc-32';
import { randomUUID } from 'crypto';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import reporter from 'io-ts-reporters';
import { BadConfigException } from './exceptions';
import { PaymentInfo } from './payment-info';
import { BaseReceipt, LinksObject } from './types';

export abstract class Driver<Config = any> {
  protected config: Config;

  constructor(config: Config, protected configCodec: any) {
    this.config = this.getParsedData(config, configCodec);
  }

  setConfig(config: Config) {
    this.config = this.getParsedData(config, this.configCodec);
  }

  protected abstract links: LinksObject;

  protected linkStrategy = 'default';

  protected setLinkStrategy(strategy: string) {
    this.linkStrategy = strategy;
  }

  protected getLinks() {
    return this.links[this.linkStrategy];
  }

  abstract requestPayment: (requestOptions: any) => Promise<PaymentInfo>;

  abstract verifyPayment: (verifyOptions: any, requestParams: any) => Promise<BaseReceipt>;

  protected makeRequestInfo = (
    referenceId: ConstructorParameters<typeof PaymentInfo>[0],
    method: ConstructorParameters<typeof PaymentInfo>[1],
    url: ConstructorParameters<typeof PaymentInfo>[2],
    params: ConstructorParameters<typeof PaymentInfo>[3] = {},
  ) => new PaymentInfo(referenceId, method, url, params);

  protected generateUuid() {
    return randomUUID();
  }

  protected generateId() {
    return crc32Encode(this.generateUuid());
  }

  /**
   * Parses using the codec and throws an exception if not matching
   *
   * @throws BadConfigException
   */
  protected getParsedData = <TData = any, O = TData, I = unknown>(rawData: I, codec: t.Type<TData, O, I>): TData => {
    const result = codec.decode(rawData);
    if (isLeft(result)) {
      // Use a reporter to throw an error if validation fails
      throw new BadConfigException(reporter.report(result));
    }

    // Get the validated value and use it in your application
    return result.right;
  };
}
