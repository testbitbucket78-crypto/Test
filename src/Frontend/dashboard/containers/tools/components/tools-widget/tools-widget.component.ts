import { Component, OnInit, OnChanges, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'sb-tools-widget',
    templateUrl: './tools-widget.component.html',
    styleUrls: ['./tools-widget.component.scss'],
})
export class WidgetComponent implements OnInit {
    @Input() position: string = '';
    @Input() popupX: number = 0;
    @Input() popupY: number = 0;
    @Input() title: string = '';
    @Input() buttonText: string = '';
    @Input() generatedLink: string = '';
    @Input() generatedHTML!: boolean
    @Output() sendHtmlToParent = new EventEmitter<string>();
    popup: any;
    icon: any;


    ngOnInit(): void {
        this.popup = document.getElementById('popup-component');
        this.icon = document.getElementById('whatsapp-logo');
        debugger;
        if (this.icon && this.popup) {
            this.icon.addEventListener('click', () => {
                this.popup.style.display = this.popup?.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    }
    ngOnChanges(changes: SimpleChanges): void {
        let startButton = document.getElementById('start-chat-button');
        if (startButton && changes['generatedLink']) {
            startButton.setAttribute('href', this.generatedLink);
        }

        let component = document.getElementById('whatsapp-popup-component');
        let whatsappLogo = document.getElementById('whatsapp-logo');

        if (component) {
            if (changes['position']) {
                if (this.position === 'left') {
                    component.style.left = `${this.popupX}%`;
                    component.style.removeProperty('right');
                    if (whatsappLogo) whatsappLogo.style.justifyContent = 'flex-start';
                } else if (this.position === 'right') {
                    component.style.right = `${this.popupX}%`;
                    component.style.removeProperty('left');
                    if (whatsappLogo) whatsappLogo.style.justifyContent = 'flex-end';
                }
            }
            if (changes['popupX']) {
                if (this.position === 'left') {
                    component.style.left = `${this.popupX}%`;
                } else {
                    component.style.right = `${this.popupX}%`;
                }
            }
            if (changes['popupY']) {
                component.style.bottom = `${this.popupY}%`;
            }
            let script = `<script async type="text/javascript">document.addEventListener("DOMContentLoaded", function () {let popup = document.getElementById("popup-component");let icon = document.getElementById("whatsapp-logo");if (icon && popup) { icon.addEventListener("click", () => {popup.style.display = popup.style.display === "flex" ? "none" : "flex";});}});</script>`;
            let htmlContent = component.outerHTML + script;
debugger
            let codeToDisplay = '<!DOCTYPE html><html><body>' + htmlContent + '</body></html>';
            if (changes['generatedHTML']) this.sendHtmlToParent.emit(codeToDisplay);
        }
    }
}
