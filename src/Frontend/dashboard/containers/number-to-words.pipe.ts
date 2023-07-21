import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToWords'
})
export class NumberToWordsPipe implements PipeTransform {

  transform(amount: number):string {
    function numberToWords(amount:any) {
      const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      const teens = ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      const scales = ['', 'thousand', 'million', 'billion', 'trillion'];
    
      if (isNaN(amount) || amount < 0 || amount > 999999999999) {
        return 'Invalid input';
      }
    
      if (amount === 0) {
        return 'zero dollars';
      }
    
      // Helper function to convert a number less than 1000 to words
      function convertLessThanOneThousand(num: number):any {
        if (num === 0) {
          return '';
        } else if (num < 10) {
          return units[num];
        } else if (num < 20) {
          return teens[num - 11];
        } else if (num < 100) {
          return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + units[num % 10] : '');
        } else {
          return units[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '');
        }
      }
    
      let numStr = amount.toString().split('.'); // Separate integer and decimal parts
      let integerPart = parseInt(numStr[0]);
      let decimalPart = parseInt(numStr[1]) || 0;
    
      let words = '';
      let scaleIndex = 0;
    
      while (integerPart > 0) {
        let threeDigits = integerPart % 1000;
        if (threeDigits !== 0) {
          let scaleWord = scales[scaleIndex];
          let digitsInWords = convertLessThanOneThousand(threeDigits);
          words = digitsInWords + (scaleWord ? ' ' + scaleWord : '') + ' ' + words;
        }
        integerPart = Math.floor(integerPart / 1000);
        scaleIndex++;
      }
    
      if (decimalPart > 0) {
        words += ' and ' + convertLessThanOneThousand(decimalPart) + ' cents';
      } else {
        words += ' dollars';
      }
    
      return words.trim();
    }
    return numberToWords(amount);
  }

}
