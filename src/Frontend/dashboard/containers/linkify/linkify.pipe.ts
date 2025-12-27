import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return value;
    }
    
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const newValue = value.replace(urlPattern, (url) => {
      return `<a href="${url}" target="_blank" class="isLink">${url}</a>`;
    });
    
    return newValue;
  }
}