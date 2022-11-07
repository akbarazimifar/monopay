import * as t from 'io-ts';
import { BaseReceipt, LinksObject, tBaseRequestOptions, tBaseVerifyOptions } from '../../types';

export const links: LinksObject = {
  default: {
    REQUEST: 'https://pep.shaparak.ir/Api/v1/Payment/GetToken',
    VERIFICATION: 'https://pep.shaparak.ir/Api/v1/Payment/VerifyPayment',
    PAYMENT: 'https://pep.shaparak.ir/payment.aspx',
  },
};

export interface RequestPaymentReq {
  /**
   * شماره فاکتور که برای هر خرید باید متفاوت باشد
   */
  InvoiceNumber: string;
  /**
   * تاریخ فاکتور خرید به فرمت دلخواه.
   * لازم به ذکر است که تاریخ باید به گونه ای باشد که با شماره فاکتور یک شناسه اختصاصی ساخته
   * تا همیشه بتوان از آن به عنوان شناسه یکتای خرید استفاده کرد
   */
  InvoiceDate: string;
  /**
   * شماره شناسایی ترمینال
   */
  TerminalCode: string;
  /**
   * شماره شناسایی پذیرنده
   */
  MerchantCode: string;
  /**
   * مبلغ فاکتور
   */
  Amount: number;
  /**
   * آدرس بازگشت
   */
  RedirectAddress: string;
  /**
   * زمان ارسال درخواست
   * @description فرمت: `YYYY/MM/DD HH:MM:SS`
   * @example 2019/01/27 17:57:06
   */
  Timestamp: string;
  /**
   * نوع عملیات که برای خرید ۱۰۰۳ میباشد
   */
  Action: 1003;
  /**
   * شماره موبایل خریدار
   * @description اختیاری
   */
  Mobile?: string;
  /**
   * ایمیل خریدار
   * @description اختیاری
   */
  Email?: string;
  /**
   * نام پذیرنده
   * @description تنها در صورت داشتن مجوز ارسال شود در غیر این صورت درخواست با خطا مواجه خواهد شد
   */
  MerchantName?: string;
  /**
   * شناسه خرید مورد نظر پذیرنده است که در صورت نیاز باید ارسال شود
   * @description جهت اطلاعات بیشتر در مورد شناسه پرداخت داکیومنت پاسارگاد را مطالعه کنید
   *
   * {@link https://www.pep.co.ir/wp-content/uploads/2019/06/1-__PEP_IPG_REST-13971020.Ver3_.00.pdf دانلود مستندات درگاه پاسارگاد}
   *
   * {@link https://github.com/pepco-api گیت هاب درگاه پاسارگاد شامل ماژول ها}
   */
  PIDN?: string;
}

export interface RequestPaymentRes {
  /**
   * نشان دهنده موفقیت آمیز بودن و یا شکست عملیات
   * @example true
   */
  IsSuccess: boolean;
  /**
   * پیام بانک
   * @example عملیات با موفقیت انجام شد
   */
  Message: string;
  /**
   * توکن
   * @example 02302dasd15a1f121fasd2asda
   */
  Token: string;
}

export interface CallbackParams {
  /**
   * Invoice Number
   */
  iN: string;
  /**
   * Invoice Date
   */
  iD: string;
  /**
   * Transaction refrence ID
   */
  tref: string;
}

export interface VerifyPaymentReq {
  /**
   * شماره فاکتور که برای هر خرید باید متفاوت باشد
   */
  InvoiceNumber: string;
  /**
   * تاریخ فاکتور خرید به فرمت دلخواه.
   * لازم به ذکر است که تاریخ باید به گونه ای باشد که با شماره فاکتور یک شناسه اختصاصی ساخته
   * تا همیشه بتوان از آن به عنوان شناسه یکتای خرید استفاده کرد
   */
  InvoiceDate: string;
  /**
   * شماره شناسایی ترمینال
   */
  TerminalCode: string;
  /**
   * شماره شناسایی پذیرنده
   */
  MerchantCode: string;
  /**
   * مبلغ فاکتور
   */
  Amount: number;
  /**
   * زمان ارسال درخواست
   * @description فرمت: `YYYY/MM/DD HH:MM:SS`
   * @example 2019/01/27 17:57:06
   */
  Timestamp: string;
}

export interface VerifyPaymentRes {
  /**
   * نشان دهنده موفقیت آمیز بودن و یا شکست عملیات
   * @example true
   */
  IsSuccess: boolean;
  /**
   * پیام بانک
   * @example عملیات با موفقیت انجام شد
   */
  Message: string;
  /**
   * شمارت کارت ماسک شده
   * @example 5022-29**-****-2328
   */
  MaskedCardNumber: string;
  /**
   * شماره کارت هش شده
   * @example 2DDB1E270C5986...
   */
  HashedCardNumber: string;
  /**
   * کد پیگیری شاپرک
   * @example 100200300400500
   */
  ShaparakRefNumber: string;
}

export const errorMessage = 'عملیات با خطا مواجه شد';

export const tRequestOptions = t.intersection([
  t.type({
    invoiceNumber: t.string,
    invoiceDate: t.string,
  }),
  t.partial({
    mobile: t.string,
    email: t.string,
  }),
  tBaseRequestOptions,
]);

export type RequestOptions = t.TypeOf<typeof tRequestOptions>;

export const tConfig = t.interface({
  /**
   * This is your **RSA private key** in `pem` format.
   *
   * You are likely to have an `xml` version of your key due to Pasargad providing a `certificate.xml` file.
   * In order to use this method you must convert it to `pem` format and provide the private key as pem for this field.
   *
   * To convert xml into pem you may use an rsa-xml to rsa-pem library or use {@link https://github.com/pepco-api pasargad sdk's code} for it
   *
   * You can turn to online convertors as well if it's not a matter of security
   *
   * - Make sure you have the correct key (by converting it to xml again and comparing the results with the actual xml version)
   */
  privateKey: t.string,
  merchantId: t.string,
  terminalId: t.string,
});

export type Config = t.TypeOf<typeof tConfig>;

export const tVerifyOptions = t.intersection([t.interface({}), tBaseVerifyOptions]);

export type VerifyOptions = t.TypeOf<typeof tVerifyOptions>;

export type Receipt = BaseReceipt<VerifyPaymentRes>;
