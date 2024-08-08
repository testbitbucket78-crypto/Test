import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PhoneValidationService {

  constructor() { }

  countryCodes = [
    { countryCode: 'AD +376', length: 9 }, { countryCode: 'AE +971', length: 9 }, { countryCode: 'AF +93', length: 9 },
    { countryCode: 'AG +1268', length: 10 }, { countryCode: 'AI +1264', length: 10 }, { countryCode: 'AL +355', length: 9 },
    { countryCode: 'AM +374', length: 8 }, { countryCode: 'AO +244', length: 9 }, { countryCode: 'AR +54', length: 10 },
    { countryCode: 'AS +1684', length: 10 }, { countryCode: 'AT +43', length: 10 }, { countryCode: 'AU +61', length: 9 },
    { countryCode: 'AW +297', length: 7 }, { countryCode: 'AX +358', length: 10 }, { countryCode: 'AZ +994', length: 9 },
    { countryCode: 'BA +387', length: 8 }, { countryCode: 'BB +1 246', length: 10 }, { countryCode: 'BD +880', length: 10 },
    { countryCode: 'BE +32', length: 9 }, { countryCode: 'BF +226', length: 8 }, { countryCode: 'BG +359', length: 9 },
    { countryCode: 'BH +973', length: 8 }, { countryCode: 'BI +257', length: 8 }, { countryCode: 'BJ +229', length: 8 },
    { countryCode: 'BL +590', length: 9 }, { countryCode: 'BM +1 441', length: 10 }, { countryCode: 'BN +673', length: 7 },
    { countryCode: 'BO +591', length: 8 }, { countryCode: 'BQ +599', length: 7 }, { countryCode: 'BR +55', length: 11 },
    { countryCode: 'BS +1242', length: 10 }, { countryCode: 'BT +975', length: 8 }, { countryCode: 'BW +267', length: 7 },
    { countryCode: 'BY +375', length: 9 }, { countryCode: 'BZ +501', length: 7 }, { countryCode: 'CA +1', length: 10 },
    { countryCode: 'CC +61', length: 9 }, { countryCode: 'CD +243', length: 9 }, { countryCode: 'CF +236', length: 8 },
    { countryCode: 'CG +242', length: 9 }, { countryCode: 'CH +41', length: 9 }, { countryCode: 'CI +225', length: 8 },
    { countryCode: 'CK +682', length: 5 }, { countryCode: 'CL +56', length: 9 }, { countryCode: 'CM +237', length: 9 },
    { countryCode: 'CN +86', length: 11 }, { countryCode: 'CO +57', length: 10 }, { countryCode: 'CR +506', length: 8 },
    { countryCode: 'CU +53', length: 8 }, { countryCode: 'CV +238', length: 7 }, { countryCode: 'CW +599', length: 7 },
    { countryCode: 'CX +61', length: 9 }, { countryCode: 'CY +357', length: 8 }, { countryCode: 'CZ +420', length: 9 },
    { countryCode: 'DE +49', length: 11 }, { countryCode: 'DJ +253', length: 6 }, { countryCode: 'DK +45', length: 8 },
    { countryCode: 'DM +1767', length: 10 }, { countryCode: 'DO +1809', length: 10 }, { countryCode: 'DZ +213', length: 9 },
    { countryCode: 'EC +593', length: 9 }, { countryCode: 'EE +372', length: 8 }, { countryCode: 'EG +20', length: 10 },
    { countryCode: 'EH +212', length: 9 }, { countryCode: 'ER +291', length: 7 }, { countryCode: 'ES +34', length: 9 },
    { countryCode: 'ET +251', length: 9 }, { countryCode: 'FI +358', length: 9 }, { countryCode: 'FJ +679', length: 7 },
    { countryCode: 'FK +500', length: 5 }, { countryCode: 'FM +691', length: 7 }, { countryCode: 'FO +298', length: 6 },
    { countryCode: 'FR +33', length: 9 }, { countryCode: 'GA +241', length: 7 }, { countryCode: 'GB +44', length: 10 },
    { countryCode: 'GD +1473', length: 10 }, { countryCode: 'GE +995', length: 9 }, { countryCode: 'GF +594', length: 9 },
    { countryCode: 'GG +44', length: 10 }, { countryCode: 'GH +233', length: 9 }, { countryCode: 'GI +350', length: 8 },
    { countryCode: 'GL +299', length: 6 }, { countryCode: 'GM +220', length: 7 }, { countryCode: 'GN +224', length: 9 },
    { countryCode: 'GP +590', length: 9 }, { countryCode: 'GQ +240', length: 9 }, { countryCode: 'GR +30', length: 10 },
    { countryCode: 'GT +502', length: 8 }, { countryCode: 'GU +1671', length: 10 }, { countryCode: 'GW +245', length: 9 },
    { countryCode: 'GY +592', length: 7 }, { countryCode: 'HK +852', length: 8 }, { countryCode: 'HN +504', length: 8 },
    { countryCode: 'HR +385', length: 9 }, { countryCode: 'HT +509', length: 8 }, { countryCode: 'HU +36', length: 9 },
    { countryCode: 'ID +62', length: 10 }, { countryCode: 'IE +353', length: 9 }, { countryCode: 'IL +972', length: 9 },
    { countryCode: 'IM +44', length: 10 }, { countryCode: 'IN +91', length: 10 }, { countryCode: 'IO +246', length: 7 },
    { countryCode: 'IQ +964', length: 10 }, { countryCode: 'IR +98', length: 10 }, { countryCode: 'IS +354', length: 7 },
    { countryCode: 'IT +39', length: 10 }, { countryCode: 'JE +44', length: 10 }, { countryCode: 'JM +1876', length: 10 },
    { countryCode: 'JO +962', length: 9 }, { countryCode: 'JP +81', length: 10 }, { countryCode: 'KE +254', length: 10 },
    { countryCode: 'KG +996', length: 9 }, { countryCode: 'KH +855', length: 9 }, { countryCode: 'KI +686', length: 8 },
    { countryCode: 'KM +269', length: 7 }, { countryCode: 'KN +1869', length: 10 }, { countryCode: 'KP +850', length: 9 },
    { countryCode: 'KR +82', length: 10 }, { countryCode: 'KW +965', length: 8 }, { countryCode: 'KY +1345', length: 10 },
    { countryCode: 'KZ +7', length: 10 }, { countryCode: 'LA +856', length: 9 }, { countryCode: 'LB +961', length: 8 },
    { countryCode: 'LC +1758', length: 10 }, { countryCode: 'LI +423', length: 9 }, { countryCode: 'LK +94', length: 9 },
    { countryCode: 'LR +231', length: 7 }, { countryCode: 'LS +266', length: 8 }, { countryCode: 'LT +370', length: 8 },
    { countryCode: 'LU +352', length: 9 }, { countryCode: 'LV +371', length: 8 }, { countryCode: 'LY +218', length: 9 },
    { countryCode: 'MA +212', length: 9 }, { countryCode: 'MC +377', length: 8 }, { countryCode: 'MD +373', length: 8 },
    { countryCode: 'ME +382', length: 8 }, { countryCode: 'MF +590', length: 9 }, { countryCode: 'MG +261', length: 9 },
    { countryCode: 'MH +692', length: 7 }, { countryCode: 'MK +389', length: 8 }, { countryCode: 'ML +223', length: 8 },
    { countryCode: 'MM +95', length: 8 }, { countryCode: 'MN +976', length: 8 }, { countryCode: 'MO +853', length: 8 },
    { countryCode: 'MP +1 670', length: 10 }, { countryCode: 'MQ +596', length: 9 }, { countryCode: 'MR +222', length: 8 },
    { countryCode: 'MS +1 664', length: 10 }, { countryCode: 'MT +356', length: 8 }, { countryCode: 'MU +230', length: 8 },
    { countryCode: 'MV +960', length: 7 }, { countryCode: 'MW +265', length: 9 }, { countryCode: 'MX +52', length: 10 },
    { countryCode: 'MY +60', length: 9 }, { countryCode: 'MZ +258', length: 9 }, { countryCode: 'NA +264', length: 9 },
    { countryCode: 'NC +687', length: 6 }, { countryCode: 'NE +227', length: 8 }, { countryCode: 'NF +672', length: 6 },
    { countryCode: 'NG +234', length: 10 }, { countryCode: 'NI +505', length: 8 }, { countryCode: 'NL +31', length: 9 },
    { countryCode: 'NO +47', length: 8 }, { countryCode: 'NP +977', length: 10 }, { countryCode: 'NR +674', length: 7 },
    { countryCode: 'NU +683', length: 4 }, { countryCode: 'NZ +64', length: 8 }, { countryCode: 'OM +968', length: 8 },
    { countryCode: 'PA +507', length: 8 }, { countryCode: 'PE +51', length: 9 }, { countryCode: 'PF +689', length: 6 },
    { countryCode: 'PG +675', length: 8 }, { countryCode: 'PH +63', length: 10 }, { countryCode: 'PK +92', length: 10 },
    { countryCode: 'PL +48', length: 9 }, { countryCode: 'PM +508', length: 6 }, { countryCode: 'PN +872', length: 6 },
    { countryCode: 'PR +1 787', length: 10 }, { countryCode: 'PS +970', length: 9 }, { countryCode: 'PT +351', length: 9 },
    { countryCode: 'PW +680', length: 7 }, { countryCode: 'PY +595', length: 9 }, { countryCode: 'QA +974', length: 8 },
    { countryCode: 'RE +262', length: 9 }, { countryCode: 'RO +40', length: 10 }, { countryCode: 'RS +381', length: 9 },
    { countryCode: 'RU +7', length: 10 }, { countryCode: 'RW +250', length: 9 }, { countryCode: 'SA +966', length: 9 },
    { countryCode: 'SB +677', length: 7 }, { countryCode: 'SC +248', length: 7 }, { countryCode: 'SD +249', length: 9 },
    { countryCode: 'SE +46', length: 9 }, { countryCode: 'SG +65', length: 8 }, { countryCode: 'SH +290', length: 4 },
    { countryCode: 'SI +386', length: 9 }, { countryCode: 'SJ +47', length: 8 }, { countryCode: 'SK +421', length: 9 },
    { countryCode: 'SL +232', length: 8 }, { countryCode: 'SM +378', length: 9 }, { countryCode: 'SN +221', length: 9 },
    { countryCode: 'SO +252', length: 8 }, { countryCode: 'SR +597', length: 7 }, { countryCode: 'SS +211', length: 9 },
    { countryCode: 'ST +239', length: 7 }, { countryCode: 'SV +503', length: 8 }, { countryCode: 'SX +1721', length: 10 },
    { countryCode: 'SY +963', length: 9 }, { countryCode: 'SZ +268', length: 8 }, { countryCode: 'TC +1649', length: 10 },
    { countryCode: 'TD +235', length: 8 }, { countryCode: 'TF +262', length: 9 }, { countryCode: 'TG +228', length: 8 },
    { countryCode: 'TH +66', length: 9 }, { countryCode: 'TJ +992', length: 9 }, { countryCode: 'TK +690', length: 4 },
    { countryCode: 'TL +670', length: 7 }, { countryCode: 'TM +993', length: 8 }, { countryCode: 'TN +216', length: 8 },
    { countryCode: 'TO +676', length: 5 }, { countryCode: 'TR +90', length: 10 }, { countryCode: 'TT +1868', length: 10 },
    { countryCode: 'TV +688', length: 5 }, { countryCode: 'TW +886', length: 9 }, { countryCode: 'TZ +255', length: 9 },
    { countryCode: 'UA +380', length: 9 }, { countryCode: 'UG +256', length: 9 }, { countryCode: 'US +1', length: 10 },
    { countryCode: 'UY +598', length: 8 }, { countryCode: 'UZ +998', length: 9 }, { countryCode: 'VA +39', length: 10 },
    { countryCode: 'VC +1784', length: 10 }, { countryCode: 'VE +58', length: 10 }, { countryCode: 'VG +1284', length: 10 },
    { countryCode: 'VI +1340', length: 10 }, { countryCode: 'VN +84', length: 9 }, { countryCode: 'VU +678', length: 7 },
    { countryCode: 'WF +681', length: 6 }, { countryCode: 'WS +685', length: 7 }, { countryCode: 'YE +967', length: 9 },
    { countryCode: 'YT +262', length: 9 }, { countryCode: 'ZA +27', length: 9 }, { countryCode: 'ZM +260', length: 9 },
    { countryCode: 'ZW +263', length: 9 }
  ];


phoneNumberValidator(countryControl: AbstractControl | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const countryCode = countryControl?.value;
    const expectedLength = this.countryCodes.filter((item)=> item.countryCode == countryCode)[0]?.length;

    if (!expectedLength) {
      return { invalidCountryCode: true };
    }

    const phoneNumber = control.value;
    if (phoneNumber && phoneNumber.length !== expectedLength) {
      return { invalidPhoneNumberLength: true };
    }

    return null;
  };
}

}
