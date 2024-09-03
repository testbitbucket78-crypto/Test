const db = require("../dbhelper");
const moment = require('moment');
function mapCountryCode(phoneNumber){
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
module.exports = {formatterDate, formatterTime, mapCountryCode, formatterDateTime};