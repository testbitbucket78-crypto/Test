const db = require("../dbhelper");
const moment = require('moment');
function mapCountryCode(phoneNumber){
  if (typeof phoneNumber === 'number') {
    phoneNumber = String(phoneNumber);
  }
  // Map the country code to the respective country pass number in this function eg: '919000000000'
    const expectedLengths = {
        '376': 6, '971': 9, '93': 9, '1268': 7, '1264': 7, '355': 9, '374': 8, '244': 9, '54': 10, '1684': 10,
        '43': 10, '61': 9, '297': 7, '358': 10, '994': 9, '387': 8, '1246': 7, '880': 10, '32': 9, '226': 8,
        '359': 9, '973': 8, '257': 8, '229': 8, '590': 9, '1441': 7, '673': 7, '591': 8, '599': 9, '55': 11,
        '1242': 10, '975': 8, '267': 8, '375': 9, '501': 7, '1': 10, '61': 9, '243': 9, '236': 8, '242': 9,
        '41': 9, '225': 8, '682': 5, '56': 9, '237': 9, '86': 11, '57': 10, '506': 8, '53': 8, '238': 7,
        '357': 8, '420': 9, '49': 10, '253': 8, '45': 8, '1767': 10, '1809': 10, '213': 9, '593': 9, '372': 7,
        '20': 10, '212': 9, '291': 7, '34': 9, '251': 9, '358': 9, '679': 7, '500': 7, '691': 7, '298': 6,
        '33': 9, '241': 7, '44': 10, '1473': 10, '995': 9, '594': 9, '44': 10, '233': 9, '350': 8, '299': 6,
        '220': 7, '224': 9, '240': 9, '30': 10, '1671': 10, '245': 7, '592': 7, '852': 8, '504': 8, '385': 9,
        '509': 8, '36': 9, '62': 10, '353': 9, '972': 9, '44': 10, '91': 10, '246': 7, '964': 10, '98': 10,
        '354': 7, '39': 10, '44': 10, '1876': 10, '962': 9, '81': 10, '254': 9, '996': 9, '855': 9, '686': 5,
        '269': 7, '1869': 10, '850': 10, '82': 10, '965': 8, '1345': 10, '7': 10, '856': 9, '961': 8, '1758': 10,
        '423': 7, '94': 9, '231': 7, '266': 8, '370': 8, '352': 9, '371': 8, '218': 10, '212': 9, '377': 8,
        '373': 8, '382': 9, '261': 9, '692': 7, '389': 8, '223': 8, '95': 9, '976': 8, '853': 8, '1670': 10,
        '596': 9, '222': 9, '356': 8, '230': 7, '960': 7, '265': 7, '52': 10, '60': 9, '258': 9, '264': 9,
        '687': 6, '227': 8, '672': 6, '234': 10, '505': 8, '31': 9, '47': 8, '977': 10, '674': 6, '683': 4,
        '64': 9, '968': 8, '507': 8, '51': 9, '689': 6, '675': 8, '63': 10, '92': 10, '48': 9, '508': 6,
        '787': 10, '970': 9, '351': 9, '680': 7, '595': 9, '974': 8, '262': 9, '40': 9, '381': 8, '7': 10,
        '250': 9, '966': 9, '677': 7, '248': 7, '249': 9, '46': 9, '65': 8, '290': 5, '386': 9, '421': 9,
        '232': 8, '378': 9, '221': 9, '252': 7, '597': 7, '211': 9, '239': 7, '503': 8, '1721': 10, '963': 9,
        '268': 7, '1649': 10, '235': 9, '262': 9, '228': 8, '66': 9, '992': 9, '690': 5, '670': 8, '993': 8,
        '216': 8, '676': 5, '90': 10, '1868': 10, '688': 5, '886': 9, '255': 9, '380': 9, '256': 9, '598': 8,
        '998': 9, '39': 9, '1784': 10, '58': 10, '1284': 10, '1340': 10, '84': 9, '678': 5, '681': 6, '685': 7,
        '967': 9, '262': 9, '27': 9, '260': 9, '263': 9
      };
      const countryCodes = [
        'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
        'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
        'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
        'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
        'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
        'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1767', 'DO +1809', 'DZ +213',
        'EC +593', 'EE +372', 'EG +20', 'EH +212', 'ER +291', 'ES +34', 'ET +251', 'FI +358', 'FJ +679', 'FK +500',
        'FM +691', 'FO +298', 'FR +33', 'GA +241', 'GB +44', 'GD +1473', 'GE +995', 'GF +594', 'GG +44', 'GH +233',
        'GI +350', 'GL +299', 'GM +220', 'GN +224', 'GP +590', 'GQ +240', 'GR +30', 'GS +500', 'GT +502', 'GU +1671',
        'GW +245', 'GY +592', 'HK +852', 'HN +504', 'HR +385', 'HT +509', 'HU +36', 'ID +62', 'IE +353', 'IL +972',
        'IM +44', 'IN +91', 'IO +246', 'IQ +964', 'IR +98', 'IS +354', 'IT +39', 'JE +44', 'JM +1876', 'JO +962',
        'JP +81', 'KE +254', 'KG +996', 'KH +855', 'KI +686', 'KM +269', 'KN +1869', 'KP +850', 'KR +82', 'KW +965',
        'KY +1345', 'KZ +7', 'LA +856', 'LB +961', 'LC +1758', 'LI +423', 'LK +94', 'LR +231', 'LS +266', 'LT +370',
        'LU +352', 'LV +371', 'LY +218', 'MA +212', 'MC +377', 'MD +373', 'ME +382', 'MF +590', 'MG +261', 'MH +692',
        'MK +389', 'ML +223', 'MM +95', 'MN +976', 'MO +853', 'MP +1 670', 'MQ +596', 'MR +222', 'MS +1 664', 'MT +356',
        'MU +230', 'MV +960', 'MW +265', 'MX +52', 'MY +60', 'MZ +258', 'NA +264', 'NC +687', 'NE +227', 'NF +672',
        'NG +234', 'NI +505', 'NL +31', 'NO +47', 'NP +977', 'NR +674', 'NU +683', 'NZ +64', 'OM +968', 'PA +507',
        'PE +51', 'PF +689', 'PG +675', 'PH +63', 'PK +92', 'PL +48', 'PM +508', 'PN +872', 'PR +1 787', 'PS +970',
        'PT +351', 'PW +680', 'PY +595', 'QA +974', 'RE +262', 'RO +40', 'RS +381', 'RU +7', 'RW +250', 'SA +966',
        'SB +677', 'SC +248', 'SD +249', 'SE +46', 'SG +65', 'SH +290', 'SI +386', 'SJ +47', 'SK +421', 'SL +232',
        'SM +378', 'SN +221', 'SO +252', 'SR +597', 'SS +211', 'ST +239', 'SV +503', 'SX +1721', 'SY +963', 'SZ +268',
        'TC +1649', 'TD +235', 'TF +262', 'TG +228', 'TH +66', 'TJ +992', 'TK +690', 'TL +670', 'TM +993', 'TN +216',
        'TO +676', 'TR +90', 'TT +1868', 'TV +688', 'TW +886', 'TZ +255', 'UA +380', 'UG +256', 'US +1', 'UY +598',
        'UZ +998', 'VA +39', 'VC +1784', 'VE +58', 'VG +1284', 'VI +1340', 'VN +84', 'VU +678', 'WF +681', 'WS +685',
        'YE +967', 'YT +262', 'ZA +27', 'ZM +260', 'ZW +263'
      ];
      const countryCodeMap = parseCountryCodes(countryCodes);
      let matchedCode = '';
      for (const code in countryCodeMap) {
          if (phoneNumber.startsWith(code)) {
              matchedCode = code;
              break;
          }
      }

      if (!matchedCode) return 'Invalid country code';
  
      const expectedLength = expectedLengths[matchedCode];
      const numberWithoutCode = phoneNumber.slice(matchedCode.length);
  
      if (numberWithoutCode.length === expectedLength) {
          return {
              countryCode: matchedCode,
              country: countryCodeMap[matchedCode],
              localNumber: numberWithoutCode
          };
      } else {
          return 'Phone number length is incorrect';
      }
}
function parseCountryCodes(countryCodes) {
  const countryCodeMap = {};
  countryCodes.forEach(code => {
      const [country, dialCode] = code.split(' +');
      countryCodeMap[dialCode] = country;
  });
  return countryCodeMap;
}



async function formatterDateTime(data, sp_id) {
  const select = 'SELECT * FROM localDetails WHERE SP_ID = ?';
  const formatSettings = await db.excuteQuery(select, [sp_id]);

  if (!formatSettings || formatSettings.length === 0) {
     return data;
  }

  let { Date_Format, Time_Format } = formatSettings[0];
  for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const { Date: originalDate, Time: originalTime } = record;

      try {
          const date = moment(originalDate);
          const time = moment(originalTime, 'HH:mm'); 
          if(Date_Format) Date_Format = convertToUppercaseFormat(Date_Format)
          let formattedDate = date.format(Date_Format || 'MM/DD/YYYY');
          if(formattedDate == 'Invalid date'){formattedDate = originalDate};
          let formattedTime = time.format(Time_Format === '12' ? 'h:mm A' : 'HH:mm');
          if(formattedTime == 'Invalid date') {formattedTime = originalTime};
          
          data[i] = {
              ...record,
              Date: formattedDate,
              Time: formattedTime
          };
      } catch (error) {
          console.error('Error formatting record:', error);
      }
  }

  return data;
}
function convertToUppercaseFormat(format) {
  const formatMapping = {
      'd': 'D', 
      'dd': 'DD', 
      'm': 'M', 
      'mm': 'MM',
      'yy': 'YY', 
      'yyyy': 'YYYY'
  };

  return format.replace(/d{1,2}|m{1,2}|y{2,4}/gi, match => formatMapping[match.toLowerCase()] || match);
}


async function formatterDate(Date, FormatSettings) {
  const formatSettings = FormatSettings

  if (!formatSettings || formatSettings.length === 0) {
    return Date;
  }

  let { Date_Format } = formatSettings[0];

  try {
    const date = moment(Date);
    if(Date_Format) Date_Format = convertToUppercaseFormat(Date_Format)
    let formattedDate = date.format(Date_Format || 'MM/DD/YYYY');
    if(formattedDate == 'Invalid date'){formattedDate = Date};
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
}


async function formatterTime(Time, FormatSettings){
  const formatSettings = FormatSettings

  if (!formatSettings || formatSettings.length === 0) {
    return Time; 
  }
  let { Time_Format } = formatSettings[0];
  try {
    if (!Time_Format) {
      return Time; 
    }
    const time = moment(Time, 'HH:mm:ss'); 
    let formattedTime = time.format(Time_Format === '12' ? 'h:mm A' : 'HH:mm');
    if (formattedTime === 'Invalid date') {
      formattedTime = Time; 
    }

    return formattedTime;
  } catch (error) {
    console.error('Error formatting time:', error);
    return Time; 
  }

}
function getCountryDetails(countryCode) {
  const countryMap = {
      AD: { name: 'Andorra', currency: 'EUR', timezone: 'UTC+1:00' },
      AE: { name: 'United Arab Emirates', currency: 'AED', timezone: 'UTC+4:00' },
      AF: { name: 'Afghanistan', currency: 'AFN', timezone: 'UTC+4:30' },
      AG: { name: 'Antigua and Barbuda', currency: 'XCD', timezone: 'UTC-4:00' },
      AI: { name: 'Anguilla', currency: 'XCD', timezone: 'UTC-4:00' },
      AL: { name: 'Albania', currency: 'ALL', timezone: 'UTC+1:00' },
      AM: { name: 'Armenia', currency: 'AMD', timezone: 'UTC+4:00' },
      AO: { name: 'Angola', currency: 'AOA', timezone: 'UTC+1:00' },
      AR: { name: 'Argentina', currency: 'ARS', timezone: 'UTC-3:00' },
      AT: { name: 'Austria', currency: 'EUR', timezone: 'UTC+1:00' },
      AU: { name: 'Australia', currency: 'AUD', timezone: 'UTC+10:00' },
      AZ: { name: 'Azerbaijan', currency: 'AZN', timezone: 'UTC+4:00' },
      BD: { name: 'Bangladesh', currency: 'BDT', timezone: 'UTC+6:00' },
      BE: { name: 'Belgium', currency: 'EUR', timezone: 'UTC+1:00' },
      BF: { name: 'Burkina Faso', currency: 'XOF', timezone: 'UTC+0:00' },
      BG: { name: 'Bulgaria', currency: 'BGN', timezone: 'UTC+2:00' },
      BH: { name: 'Bahrain', currency: 'BHD', timezone: 'UTC+3:00' },
      BI: { name: 'Burundi', currency: 'BIF', timezone: 'UTC+2:00' },
      BJ: { name: 'Benin', currency: 'XOF', timezone: 'UTC+1:00' },
      BR: { name: 'Brazil', currency: 'BRL', timezone: 'UTC-3:00' },
      BT: { name: 'Bhutan', currency: 'BTN', timezone: 'UTC+6:00' },
      BW: { name: 'Botswana', currency: 'BWP', timezone: 'UTC+2:00' },
      BY: { name: 'Belarus', currency: 'BYN', timezone: 'UTC+3:00' },
      CA: { name: 'Canada', currency: 'CAD', timezone: 'UTC-5:00 to UTC-8:00' },
      CH: { name: 'Switzerland', currency: 'CHF', timezone: 'UTC+1:00' },
      CL: { name: 'Chile', currency: 'CLP', timezone: 'UTC-4:00' },
      CN: { name: 'China', currency: 'CNY', timezone: 'UTC+8:00' },
      CO: { name: 'Colombia', currency: 'COP', timezone: 'UTC-5:00' },
      CR: { name: 'Costa Rica', currency: 'CRC', timezone: 'UTC-6:00' },
      CU: { name: 'Cuba', currency: 'CUP', timezone: 'UTC-5:00' },
      CZ: { name: 'Czech Republic', currency: 'CZK', timezone: 'UTC+1:00' },
      DE: { name: 'Germany', currency: 'EUR', timezone: 'UTC+1:00' },
      DK: { name: 'Denmark', currency: 'DKK', timezone: 'UTC+1:00' },
      DO: { name: 'Dominican Republic', currency: 'DOP', timezone: 'UTC-4:00' },
      DZ: { name: 'Algeria', currency: 'DZD', timezone: 'UTC+1:00' },
      EG: { name: 'Egypt', currency: 'EGP', timezone: 'UTC+2:00' },
      ES: { name: 'Spain', currency: 'EUR', timezone: 'UTC+1:00' },
      ET: { name: 'Ethiopia', currency: 'ETB', timezone: 'UTC+3:00' },
      FI: { name: 'Finland', currency: 'EUR', timezone: 'UTC+2:00' },
      FR: { name: 'France', currency: 'EUR', timezone: 'UTC+1:00' },
      GA: { name: 'Gabon', currency: 'XAF', timezone: 'UTC+1:00' },
      GB: { name: 'United Kingdom', currency: 'GBP', timezone: 'UTC+0:00' },
      GH: { name: 'Ghana', currency: 'GHS', timezone: 'UTC+0:00' },
      GM: { name: 'Gambia', currency: 'GMD', timezone: 'UTC+0:00' },
      GR: { name: 'Greece', currency: 'EUR', timezone: 'UTC+2:00' },
      GT: { name: 'Guatemala', currency: 'GTQ', timezone: 'UTC-6:00' },
      HK: { name: 'Hong Kong', currency: 'HKD', timezone: 'UTC+8:00' },
      HN: { name: 'Honduras', currency: 'HNL', timezone: 'UTC-6:00' },
      HR: { name: 'Croatia', currency: 'EUR', timezone: 'UTC+1:00' },
      HU: { name: 'Hungary', currency: 'HUF', timezone: 'UTC+1:00' },
      ID: { name: 'Indonesia', currency: 'IDR', timezone: 'UTC+7:00' },
      IE: { name: 'Ireland', currency: 'EUR', timezone: 'UTC+0:00' },
      IL: { name: 'Israel', currency: 'ILS', timezone: 'UTC+2:00' },
      IN: { name: 'India', currency: 'INR', timezone: 'UTC+5:30' },
      IT: { name: 'Italy', currency: 'EUR', timezone: 'UTC+1:00' },
      JP: { name: 'Japan', currency: 'JPY', timezone: 'UTC+9:00' },
      KE: { name: 'Kenya', currency: 'KES', timezone: 'UTC+3:00' },
      KR: { name: 'South Korea', currency: 'KRW', timezone: 'UTC+9:00' },
      MX: { name: 'Mexico', currency: 'MXN', timezone: 'UTC-6:00' },
      NG: { name: 'Nigeria', currency: 'NGN', timezone: 'UTC+1:00' },
      NO: { name: 'Norway', currency: 'NOK', timezone: 'UTC+1:00' },
      NZ: { name: 'New Zealand', currency: 'NZD', timezone: 'UTC+12:00' },
      PH: { name: 'Philippines', currency: 'PHP', timezone: 'UTC+8:00' },
      PK: { name: 'Pakistan', currency: 'PKR', timezone: 'UTC+5:00' },
      RU: { name: 'Russia', currency: 'RUB', timezone: 'UTC+3:00 to UTC+12:00' },
      SA: { name: 'Saudi Arabia', currency: 'SAR', timezone: 'UTC+3:00' },
      SE: { name: 'Sweden', currency: 'SEK', timezone: 'UTC+1:00' },
      SG: { name: 'Singapore', currency: 'SGD', timezone: 'UTC+8:00' },
      TH: { name: 'Thailand', currency: 'THB', timezone: 'UTC+7:00' },
      TR: { name: 'Turkey', currency: 'TRY', timezone: 'UTC+3:00' },
      US: { name: 'United States', currency: 'USD', timezone: 'UTC-5:00 to UTC-10:00' },
      ZA: { name: 'South Africa', currency: 'ZAR', timezone: 'UTC+2:00' },
      ZW: { name: 'Zimbabwe', currency: 'ZWL', timezone: 'UTC+2:00' },
      NP: { name: 'Nepal', currency: 'NPR', timezone: 'UTC+5:45' },
      KM: { name: 'Comoros', currency: 'KMF', timezone: 'UTC+3:00' },
      LR: { name: 'Liberia', currency: 'LRD', timezone: 'UTC-5:00' },
      MQ: { name: 'Martinique', currency: 'EUR', timezone: 'UTC-4:00' },
      MZ: { name: 'Mozambique', currency: 'MZN', timezone: 'UTC+2:00' },
      RW: { name: 'Rwanda', currency: 'RWF', timezone: 'UTC+2:00' },
      SL: { name: 'Sierra Leone', currency: 'SLL', timezone: 'UTC+0:00' },
      TN: { name: 'Tunisia', currency: 'TND', timezone: 'UTC+1:00' },
      VI: { name: 'U.S. Virgin Islands', currency: 'USD', timezone: 'UTC-4:00' },
      AS: { name: 'American Samoa', currency: 'USD', timezone: 'UTC-11:00' },
      AW: { name: 'Aruba', currency: 'AWG', timezone: 'UTC-4:00' },
      AX: { name: 'Åland Islands', currency: 'SEK', timezone: 'UTC+2:00' },
      BA: { name: 'Bosnia and Herzegovina', currency: 'BAM', timezone: 'UTC+1:00' },
      BB: { name: 'Barbados', currency: 'BBD', timezone: 'UTC-4:00' },
      BL: { name: 'Saint Barthélemy', currency: 'EUR', timezone: 'UTC-4:00' },
      BM: { name: 'Bermuda', currency: 'BMD', timezone: 'UTC-4:00' },
      BN: { name: 'Brunei', currency: 'BND', timezone: 'UTC+8:00' },
      BO: { name: 'Bolivia', currency: 'BOB', timezone: 'UTC-4:00' },
      BQ: { name: 'Caribbean Netherlands', currency: 'USD', timezone: 'UTC-4:00' },
      BS: { name: 'Bahamas', currency: 'BSD', timezone: 'UTC-5:00' },
      BZ: { name: 'Belize', currency: 'BZD', timezone: 'UTC-6:00' },
      CC: { name: 'Cocos Islands', currency: 'AUD', timezone: 'UTC+6:30' },
      CD: { name: 'Democratic Republic of the Congo', currency: 'CDF', timezone: 'UTC+1:00' },
      CF: { name: 'Central African Republic', currency: 'CAF', timezone: 'UTC+1:00' },
      CG: { name: 'Republic of the Congo', currency: 'CDF', timezone: 'UTC+1:00' },
      CI: { name: 'Côte d\'Ivoire', currency: 'XOF', timezone: 'UTC+0:00' },
      CK: { name: 'Cook Islands', currency: 'NZD', timezone: 'UTC-10:00' },
      CM: { name: 'Cameroon', currency: 'XAF', timezone: 'UTC+1:00' },
      CV: { name: 'Cape Verde', currency: 'CVE', timezone: 'UTC-1:00' },
      CW: { name: 'Curacao', currency: 'ANG', timezone: 'UTC-4:00' },
      CX: { name: 'Christmas Island', currency: 'AUD', timezone: 'UTC+7:00' },
      CY: { name: 'Cyprus', currency: 'CYP', timezone: 'UTC+2:00' },
      DJ: { name: 'Djibouti', currency: 'DJF', timezone: 'UTC+3:00' },
      DM: { name: 'Dominica', currency: 'XCD', timezone: 'UTC-4:00' },
      EC: { name: 'Ecuador', currency: 'USD', timezone: 'UTC-5:00' },
      EE: { name: 'Estonia', currency: 'EEK', timezone: 'UTC+2:00' },
      EH: { name: 'Western Sahara', currency: 'MAD', timezone: 'UTC+0:00' },
      FM: { name: 'Micronesia', currency: 'USD', timezone: 'UTC+10:00' },
      FO: { name: 'Faroe Islands', currency: 'DKK', timezone: 'UTC+0:00' },
      FJ: { name: 'Fiji', currency: 'FJD', timezone: 'UTC+12:00' },
      ER: { name: 'Eritrea', currency: 'ERN', timezone: 'UTC+3:00' },
      FK: { name: 'Falkland Islands', currency: 'FKP', timezone: 'UTC-3:00' },
      GD: { name: 'Grenada', currency: 'XCD', timezone: 'UTC-4:00' },
      GE: { name: 'Georgia', currency: 'GEL', timezone: 'UTC+4:00' },
      GF: { name: 'French Guiana', currency: 'EUR', timezone: 'UTC-3:00' },
      GG: { name: 'Guernsey', currency: 'GBP', timezone: 'UTC+0:00' },
      GI: { name: 'Gibraltar', currency: 'GIP', timezone: 'UTC+1:00' },
      GL: { name: 'Greenland', currency: 'DKK', timezone: 'UTC-3:00' },
      GN: { name: 'Guinea', currency: 'GNF', timezone: 'UTC+0:00' },
      GP: { name: 'Guadeloupe', currency: 'EUR', timezone: 'UTC-4:00' },
      GQ: { name: 'Equatorial Guinea', currency: 'GNF', timezone: 'UTC+1:00' },
      GS: { name: 'South Georgia and the South Sandwich Islands', currency: 'GBP', timezone: 'UTC-2:00' },
      GU: { name: 'Guam', currency: 'USD', timezone: 'UTC+10:00' },
      GW: { name: 'Guinea-Bissau', currency: 'GNF', timezone: 'UTC+0:00' },
      GY: { name: 'Guyana', currency: 'GYD', timezone: 'UTC-4:00' },
      HT: { name: 'Haiti', currency: 'HTG', timezone: 'UTC-5:00' },
      IM: { name: 'Isle of Man', currency: 'GBP', timezone: 'UTC+0:00' },
      IO: { name: 'British Indian Ocean Territory', currency: 'USD', timezone: 'UTC+6:00' },
      IQ: { name: 'Iraq', currency: 'IQD', timezone: 'UTC+3:00' },
      IR: { name: 'Iran', currency: 'IRR', timezone: 'UTC+3:30' },
      IS: { name: 'Iceland', currency: 'ISK', timezone: 'UTC+0:00' },
      JE: { name: 'Jersey', currency: 'GBP', timezone: 'UTC+0:00' },
      JM: { name: 'Jamaica', currency: 'JMD', timezone: 'UTC-5:00' },
      JO: { name: 'Jordan', currency: 'JOD', timezone: 'UTC+2:00' },
      KG: { name: 'Kyrgyzstan', currency: 'KGS', timezone: 'UTC+6:00' },
      KH: { name: 'Cambodia', currency: 'KHR', timezone: 'UTC+7:00' },
      KI: { name: 'Kiribati', currency: 'AUD', timezone: 'UTC+12:00' },
      KN: { name: 'Saint Kitts and Nevis', currency: 'XCD', timezone: 'UTC-4:00' },
      KP: { name: 'North Korea', currency: 'KPW', timezone: 'UTC+9:00' },
      KW: { name: 'Kuwait', currency: 'KWD', timezone: 'UTC+3:00' },
      KY: { name: 'Cayman Islands', currency: 'KYD', timezone: 'UTC-5:00' },
      KZ: { name: 'Kazakhstan', currency: 'KZT', timezone: 'UTC+6:00' },
      LA: { name: 'Laos', currency: 'LAK', timezone: 'UTC+7:00' },
      LB: { name: 'Lebanon', currency: 'LBP', timezone: 'UTC+2:00' },
      LC: { name: 'Saint Lucia', currency: 'XCD', timezone: 'UTC-4:00' },
      LI: { name: 'Liechtenstein', currency: 'CHF', timezone: 'UTC+1:00' },
      LK: { name: 'Sri Lanka', currency: 'LKR', timezone: 'UTC+5:30' },
      LS: { name: 'Lesotho', currency: 'LSL', timezone: 'UTC+2:00' },
      LT: { name: 'Lithuania', currency: 'EUR', timezone: 'UTC+2:00' },
      LU: { name: 'Luxembourg', currency: 'EUR', timezone: 'UTC+1:00' },
      LV: { name: 'Latvia', currency: 'EUR', timezone: 'UTC+2:00' },
      LY: { name: 'Libya', currency: 'LYD', timezone: 'UTC+2:00' },
      MA: { name: 'Morocco', currency: 'MAD', timezone: 'UTC+1:00' },
      MC: { name: 'Monaco', currency: 'EUR', timezone: 'UTC+1:00' },
      MD: { name: 'Moldova', currency: 'MDL', timezone: 'UTC+2:00' },
      ME: { name: 'Montenegro', currency: 'EUR', timezone: 'UTC+1:00' },
      MF: { name: 'Saint Martin', currency: 'EUR', timezone: 'UTC-3:00' },
      MG: { name: 'Madagascar', currency: 'MGA', timezone: 'UTC+3:00' },
      MH: { name: 'Marshall Islands', currency: 'USD', timezone: 'UTC+12:00' },
      MK: { name: 'North Macedonia', currency: 'MKD', timezone: 'UTC+1:00' },
      ML: { name: 'Mali', currency: 'CDF', timezone: 'UTC+0:00' },
      MM: { name: 'Myanmar', currency: 'MMK', timezone: 'UTC+6:30' },
      MN: { name: 'Mongolia', currency: 'MNT', timezone: 'UTC+8:00' },
      MO: { name: 'Macau', currency: 'MOP', timezone: 'UTC+8:00' },
      MP: { name: 'Northern Mariana Islands', currency: 'USD', timezone: 'UTC+10:00' },
      MR: { name: 'Mauritania', currency: 'MRU', timezone: 'UTC+0:00' },
      MS: { name: 'Montserrat', currency: 'EC$', timezone: 'UTC-4:00' },
      MT: { name: 'Malta', currency: 'EUR', timezone: 'UTC+1:00' },
      MU: { name: 'Mauritius', currency: 'MUR', timezone: 'UTC+4:00' },
      MV: { name: 'Maldives', currency: 'MVR', timezone: 'UTC+5:00' },
      MW: { name: 'Malawi', currency: 'MWK', timezone: 'UTC+2:00' },
      MY: { name: 'Malaysia', currency: 'MYR', timezone: 'UTC+8:00' },
      NA: { name: 'Namibia', currency: 'NAD', timezone: 'UTC+2:00' },
      NC: { name: 'New Caledonia', currency: 'XPF', timezone: 'UTC+11:00' },
      NE: { name: 'Niger', currency: 'NGN', timezone: 'UTC+1:00' },
      NF: { name: 'Norfolk Island', currency: 'AUD', timezone: 'UTC+11:00' },
      NI: { name: 'Nicaragua', currency: 'NIO', timezone: 'UTC-6:00' },
      NL: { name: 'Netherlands', currency: 'EUR', timezone: 'UTC+1:00' },
      NR: { name: 'Nauru', currency: 'AUD', timezone: 'UTC+12:00' },
      NU: { name: 'Niue', currency: 'NZD', timezone: 'UTC-11:00' },
      OM: { name: 'Oman', currency: 'OMR', timezone: 'UTC+4:00' },
      PA: { name: 'Panama', currency: 'PAB', timezone: 'UTC-5:00' },
      PE: { name: 'Peru', currency: 'PEN', timezone: 'UTC-5:00' },
      PF: { name: 'French Polynesia', currency: 'XPF', timezone: 'UTC-10:00' },
      PG: { name: 'Papua New Guinea', currency: 'PGK', timezone: 'UTC+10:00' },
      PL: { name: 'Poland', currency: 'PLN', timezone: 'UTC+1:00' },
      PM: { name: 'Saint Pierre and Miquelon', currency: 'EUR', timezone: 'UTC-3:00' },
      PN: { name: 'Pitcairn Islands', currency: 'NZD', timezone: 'UTC-8:00' },
      PR: { name: 'Puerto Rico', currency: 'USD', timezone: 'UTC-4:00' },
      PS: { name: 'Palestine', currency: 'ILS', timezone: 'UTC+2:00' },
      PT: { name: 'Portugal', currency: 'EUR', timezone: 'UTC+0:00' },
      PW: { name: 'Palau', currency: 'USD', timezone: 'UTC+9:00' },
      PY: { name: 'Paraguay', currency: 'PYG', timezone: 'UTC-4:00' },
      QA: { name: 'Qatar', currency: 'QAR', timezone: 'UTC+3:00' },
      RE: { name: 'Réunion', currency: 'EUR', timezone: 'UTC+4:00' },
      RO: { name: 'Romania', currency: 'RON', timezone: 'UTC+2:00' },
      RS: { name: 'Serbia', currency: 'RSD', timezone: 'UTC+1:00' },
      SI: { name: 'Solomon Islands', currency: 'SBD', timezone: 'UTC+11:00' },
      SC: { name: 'Seychelles', currency: 'SCR', timezone: 'UTC+4:00' },
      SD: { name: 'Sudan', currency: 'SDG', timezone: 'UTC+2:00' },
      SH: { name: 'Saint Helena', currency: 'SHP', timezone: 'UTC+0:00' },
      SL: { name: 'Slovenia', currency: 'EUR', timezone: 'UTC+1:00' },
      SJ: { name: 'Svalbard and Jan Mayen', currency: 'NOK', timezone: 'UTC+1:00' },
      SK: { name: 'Slovakia', currency: 'SKK', timezone: 'UTC+1:00' },
      SM: { name: 'San Marino', currency: 'EUR', timezone: 'UTC+1:00' },
      SN: { name: 'Senegal', currency: 'XOF', timezone: 'UTC+0:00' },
      SO: { name: 'Somalia', currency: 'SOS', timezone: 'UTC+3:00' },
      SR: { name: 'Suriname', currency: 'SRD', timezone: 'UTC-3:00' },
      SS: { name: 'South Sudan', currency: 'SSP', timezone: 'UTC+3:00' },
      ST: { name: 'Sao Tome and Principe', currency: 'STN', timezone: 'UTC+0:00' },
      SV: { name: 'El Salvador', currency: 'SVC', timezone: 'UTC-6:00' },
      SX: { name: 'Sint Maarten', currency: 'ANG', timezone: 'UTC-4:00' },
      SY: { name: 'Syria', currency: 'SYP', timezone: 'UTC+2:00' },
      SZ: { name: 'Eswatini (Swaziland)', currency: 'SZL', timezone: 'UTC+2:00' },
      TC: { name: 'Turks and Caicos Islands', currency: 'KYD', timezone: 'UTC-5:00' },
      TD: { name: 'Chad', currency: 'CDF', timezone: 'UTC+1:00' },
      TF: { name: 'French Southern Territories', currency: 'EUR', timezone: 'UTC+5:00' },
      TG: { name: 'Togo', currency: 'XOF', timezone: 'UTC+0:00' },
      TJ: { name: 'Tajikistan', currency: 'TJS', timezone: 'UTC+5:00' },
      TK: { name: 'Tokelau', currency: 'NZD', timezone: 'UTC+13:00' },
      TL: { name: 'Timor-Leste', currency: 'USD', timezone: 'UTC+9:00' },
      TM: { name: 'Turkmenistan', currency: 'TMT', timezone: 'UTC+5:00' },
      TO: { name: 'Tonga', currency: 'TOP', timezone: 'UTC+13:00' },
      TR: { name: 'Trinidad and Tobago', currency: 'TTD', timezone: 'UTC-4:00' },
      TV: { name: 'Tuvalu', currency: 'AUD', timezone: 'UTC+12:00' },
      TW: { name: 'Taiwan', currency: 'TWD', timezone: 'UTC+8:00' },
      TZ: { name: 'Tanzania', currency: 'TZS', timezone: 'UTC+3:00' },
      UA: { name: 'Ukraine', currency: 'UAH', timezone: 'UTC+2:00' },
      UG: { name: 'Uganda', currency: 'UGX', timezone: 'UTC+3:00' },
      UY: { name: 'Uruguay', currency: 'UYU', timezone: 'UTC-3:00' },
      UZ: { name: 'Uzbekistan', currency: 'UZS', timezone: 'UTC+5:00' },
      VA: { name: 'Vatican City', currency: 'EUR', timezone: 'UTC+1:00' },
      VC: { name: 'Saint Vincent and the Grenadines', currency: 'XCD', timezone: 'UTC-4:00' },
      VE: { name: 'Venezuela', currency: 'VES', timezone: 'UTC-4:00' },
      VG: { name: 'British Virgin Islands', currency: 'USD', timezone: 'UTC-4:00' },
      VN: { name: 'Vietnam', currency: 'VND', timezone: 'UTC+7:00' },
      VU: { name: 'Vanuatu', currency: 'VUV', timezone: 'UTC+11:00' },
      WF: { name: 'Wallis and Futuna', currency: 'XPF', timezone: 'UTC+12:00' },
      WS: { name: 'Samoa', currency: 'WST', timezone: 'UTC+13:00' },
      YE: { name: 'Yemen', currency: 'YER', timezone: 'UTC+3:00' },
      YT: { name: 'Mayotte', currency: 'EUR', timezone: 'UTC+3:00' },
      ZM: { name: 'Zambia', currency: 'ZMW', timezone: 'UTC+2:00' },

  };

  const countryDetails = countryMap[countryCode.toUpperCase()];
  if (countryDetails) {
      return {
          country: countryDetails.name,
          currency: countryDetails.currency,
          timezone: countryDetails.timezone,
      };
  } else {
      return {
          country:  'N/A',
          currency: 'N/A',
          timezone: 'N/A',
      };
  }
}

function formatDateTimeAccToTimeZone(dateString, gmtOffset){
  if (!dateString || !gmtOffset) {
    console.error("Invalid date or GMT offset provided.");
    return "Invalid time";
}

try {
    const offset = gmtOffset.replace("GMT", "").trim(); 
    const inputTime = moment(dateString, "YYYY-MM-DD HH:mm:ss");
    const [hours, minutes] = offset.split(":");
    const totalMinutesOffset = parseInt(hours) * 60 + parseInt(minutes);
    const localTime = inputTime.utcOffset(totalMinutesOffset);
    const formattedDate = moment(localTime._d, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)').format('YYYY-MM-DD HH:mm:ss');

    return formattedDate;
} catch (error) {
    console.error("Error converting date:", error);
    return "Invalid time";
}
}

const XLSX = require('xlsx');

const makeXLSXFileOfData = (data, spid, fromDate, toDate) => {
  const sheetData = [];

  const title = `Exported Webhook Logs Data -  Date Range: ${fromDate} to ${toDate}`;
  sheetData.push([title]);
  sheetData.push([]);
  sheetData.push(['Webhook Log ID', 'Event', 'Timestamp', 'Status', 'Return Count', 'Payload']);

  data.forEach(log => {
    sheetData.push([
      log.webhookLogId,
      log.event,
      log.timestamp,
      log.status,
      log.retry_count,
      typeof log.payload === 'string' ? JSON.parse(log.payload) : log.payload
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Webhook Logs');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
};
const makeXLSXForSmartReplies = (data, spid, fromDate, toDate) => {
  const sheetData = [];

  const title = `Smart Reply Usage Report, Date Range: ${fromDate} to ${toDate}`;
  sheetData.push([title]);
  sheetData.push([]);
  sheetData.push(['Customer Number', 'Date and Time of Trigger', 'Keyword Sent']);

data.forEach(log => {
  sheetData.push([
    log.CustomerNumber,    
    formatDateTime(log.TriggerTime),
    log.KeywordSent
  ]);
});

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Smart Reply Logs');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
};
const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// function convertTimeByTimezone(time, timezone) {
//   try {
//     if (!time || !timezone) return time;
//     const now = new Date();
//     const currentDate = moment(now).format('YYYY-MM-DD');
//     const dateTimeString = `${currentDate}T${time}:00`;
//     return moment(dateTimeString).utc().format();
//   } catch (err) {
//     console.error("Error converting time:", err);
//     return time;
//   }
// }
// function convertTimeByTimezone(time, timezone) {
//  try {
//     if (!time || !timezone) return time;

//     const currentDate = new Date().toISOString().split("T")[0]; 
//     const dateString = `${currentDate}T${time}:00`;

//     // Build time in the selected timezone
//     const localStringInTZ = new Date(dateString).toLocaleString("en-US", {
//       timeZone: timezone
//     });

//     // Parse that as local (which effectively becomes UTC conversion)
//     const dateInTZ = new Date(localStringInTZ);

//     return dateInTZ.toISOString() ;
//   } catch (err) {
//     console.error("UTC conversion error:", err);
//     return time;
//   }
// }
function convertTimeByTimezone(time, timezone) {
  try {
    if (!time || !timezone) return time;

    const today = new Date();
    const [hh, mm] = time.split(":").map(Number);

    // Create date parts in target timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });

    const parts = formatter.formatToParts(today);
    const dateParts = Object.fromEntries(parts.map(p => [p.type, p.value]));

    // Build ISO string explicitly
    const iso = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${hh
      .toString()
      .padStart(2, "0")}:${mm
      .toString()
      .padStart(2, "0")}:00`;

    // Convert once to UTC
    return new Date(`${iso}`).toISOString();
  } catch (err) {
    console.error("UTC conversion error:", err);
    return time;
  }
}


module.exports = {formatterDate, formatterTime, mapCountryCode, formatterDateTime,getCountryDetails, formatDateTimeAccToTimeZone, makeXLSXFileOfData, makeXLSXForSmartReplies, convertTimeByTimezone};