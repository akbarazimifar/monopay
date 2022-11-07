import axios from 'axios';
import { Driver } from '../../driver';
import { PaymentException, RequestException, VerificationException } from '../../exceptions';
import * as API from './api';

export class NextPay extends Driver<API.Config> {
  constructor(config: API.Config) {
    super(config, API.tConfig);
  }

  protected links = API.links;

  requestPayment = async (options: API.RequestOptions) => {
    options = this.getParsedData(options, API.tRequestOptions);

    const { amount, callbackUrl, mobile, customFields } = options;

    const response = await axios.post<API.RequestPaymentReq, { data: API.RequestPaymentRes }>(this.getLinks().REQUEST, {
      api_key: this.config.apiKey,
      amount: amount * 10,
      callback_uri: callbackUrl,
      customer_phone: mobile ? +mobile : undefined,
      order_id: this.generateUuid(),
      custom_json_fields: customFields,
    });

    const { code, trans_id } = response.data;

    if (code.toString() !== '0') {
      throw new RequestException(API.errors[code.toString()]);
    }

    return this.makeRequestInfo(trans_id, 'GET', this.getLinks().PAYMENT + trans_id);
  };

  verifyPayment = async (_options: API.VerifyOptions, params: API.CallbackParams): Promise<API.Receipt> => {
    const { amount, trans_id } = params;

    if (!trans_id) {
      throw new PaymentException('تراکنش توسط کاربر لغو شد.');
    }

    const response = await axios.post<API.VerifyPaymentReq, { data: API.VerifyPaymentRes }>(
      this.getLinks().VERIFICATION,
      {
        amount: +amount * 10,
        trans_id,
        api_key: this.config.apiKey,
      },
    );

    const { Shaparak_Ref_Id, code, card_holder } = response.data;

    if (code.toString() !== '0') {
      throw new VerificationException(API.errors[code.toString()]);
    }

    return {
      raw: response.data,
      transactionId: Shaparak_Ref_Id,
      cardPan: card_holder,
    };
  };
}
