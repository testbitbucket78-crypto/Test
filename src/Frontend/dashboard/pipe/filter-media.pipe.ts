import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterMedia'
})
export class FilterMediaPipe implements PipeTransform {
  transform(allMedia: any[]): any[] {
    return allMedia.filter(file => 
      file?.message_media != '0' && file?.message_media != 'text'
    );
  }
}
