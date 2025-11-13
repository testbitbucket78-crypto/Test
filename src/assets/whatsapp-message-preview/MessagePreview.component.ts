import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-whatsapp-message-preview',
  templateUrl: './MessagePreview.component.html',
  styleUrls: ['./MessagePreview.component.scss'],
})
export class WhatsappMessagePreviewComponent implements OnChanges {
  @Input() header = '';
  @Input() body = '';
  @Input() footer = '';

  @Input() type: 'whatsapp' | 'teambox' = 'whatsapp';
  @Input() messageText = ''; 

  formattedBody = '';

  ngOnChanges(): void {
    // this.formattedBody = this.formatWhatsAppText(this.body || '');
    if (this.type === 'whatsapp') {
      this.formattedBody = this.formatWhatsAppText(this.body || '');
    } else if (this.type === 'teambox') {
      this.formattedBody = this.formatWhatsAppText(this.messageText || '');
    }
  }

  private formatWhatsAppText(text: string): string {
    if (!text) return '';

    // 1️⃣ Handle line breaks like WhatsApp
    let formatted = text.replace(/\n/g, '<br>');

    // 2️⃣ WhatsApp-like bold ( *text* )
    // - no space just inside markers
    // - allow punctuation after closing
    formatted = formatted.replace(
      /(^|[^\w*])\*(?!\s)([^*\n]+?[^\s])\*(?=[^\w*]|$)/g,
      (_, pre, content) => `${pre}<b>${content}</b>`
    );

    // 3️⃣ WhatsApp-like italic ( _text_ )
    formatted = formatted.replace(
      /(^|[^\w_])_(?!\s)([^_\n]+?[^\s])_(?=[^\w_]|$)/g,
      (_, pre, content) => `${pre}<i>${content}</i>`
    );

    // 4️⃣ WhatsApp-like strikethrough ( ~text~ )
    formatted = formatted.replace(
      /(^|[^\w~])~(?!\s)([^~\n]+?[^\s])~(?=[^\w~]|$)/g,
      (_, pre, content) => `${pre}<s>${content}</s>`
    );

    // 5️⃣ Monospace (```text```)
    formatted = formatted.replace(/```([\s\S]*?)```/g, (_, content) => `<code>${content}</code>`);

    // 6️⃣ Single backtick monospace
    formatted = formatted.replace(
      /(^|[^\w`])`([^`\n]+?)`(?=[^\w`]|$)/g,
      (_, pre, content) => `${pre}<code>${content}</code>`
    );

    // 7️⃣ Auto-link detection
    formatted = formatted.replace(
      /((https?:\/\/|www\.)[^\s<]+)/g,
      '<a href="$1" target="_blank">$1</a>'
    );

    return formatted;
  }
}