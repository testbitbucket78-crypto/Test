import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastService } from 'assets/toast/toast.service';
@Component({
    selector: 'sb-tools-chat-widget',
    templateUrl: './tools-chat-widget.component.html',
    styleUrls: ['./tools-chat-widget.component.scss'],
})
export class ToolsChatWidgetComponent implements OnInit {
    SPID: any = sessionStorage.getItem('SP_ID');
    channelOption: any = [];
    channelSelected: string = 'Select Channel';
    channelPhoneNumber: string = '';
    ShowAssignOption: boolean = false;
    isTooltipVisible!: boolean;
    generatedLink: string = '';
    generatedHTML!: boolean;
    codeToDisplay: any;
    remainingCharacters: { [key: string]: number } = {
        widgetTitle: 40,
        startButtonText: 20,
    };
    widgetToolForm!: FormGroup;

    constructor(private _settingsService: SettingsService, private _toastService: ToastService) {}
    ngOnInit() {
        this.getWhatsAppDetails();
        this.initForm();
    }
    initForm() {
        this.widgetToolForm = new FormGroup({
            channel: new FormControl('', Validators.required),
            phoneNumber: new FormControl(''),
            customMessage: new FormControl('', Validators.required),
            position: new FormControl('right'),
            topBottomOffset: new FormControl(2),
            leftRightOffset: new FormControl(2),
            widgetTitle: new FormControl('Hey there, chat with us', [
                Validators.required,
                Validators.maxLength(40),
            ]),
            startButtonText: new FormControl('Start Chat', [
                Validators.required,
                Validators.maxLength(20),
            ]),
        });
        this.updateCharacterCount('widgetTitle', 40);
        this.updateCharacterCount('startButtonText', 20);
    }

    getWhatsAppDetails() {
        this._settingsService.getWhatsAppDetails(this.SPID).subscribe((response: any) => {
            if (response) {
                if (response && response?.whatsAppDetails) {
                    this.channelOption = response?.whatsAppDetails.map((item: any) => ({
                        value: item?.id,
                        label: item?.channel_id,
                        connected_id: item?.connected_id,
                        channel_status: item?.channel_status,
                    }));
                }
            }
        });
    }
    updateDropdown(id: string) {
        const selectedChannel = this.channelOption.find(
            (channel: any) => channel.connected_id === id
        );
        if (selectedChannel) {
            this.channelSelected = selectedChannel.label;
            let channelPhoneNumber = selectedChannel.connected_id;
            this.widgetToolForm.patchValue({
                channel: this.channelSelected,
                phoneNumber: channelPhoneNumber,
            });
        }
        this.ShowAssignOption = false;
    }
    generateCode() {
        if (this.widgetToolForm.get('channel')?.value) {
            const phoneNumber = this.widgetToolForm.get('phoneNumber')?.value;
            const customMessage = encodeURIComponent(
                this.widgetToolForm.get('customMessage')?.value || ''
            );
            this.generatedHTML = true;
            this.generatedLink = `https://wa.me/${phoneNumber}?text=${customMessage}`;
            this._toastService.success('Code generated successfully!');
        }
    }

    updateCharacterCount(field: string, maxLength: number) {
        const currentLength = this.widgetToolForm.get(field)?.value.length || 0;
        this.remainingCharacters[field] = maxLength - currentLength;
    }
    handleTooltipChange(visible: boolean) {
        this.isTooltipVisible = visible;
    }
    handleHtmlReceived(html: string) {
        this.codeToDisplay = html;
    }
    copyCode() {
        if (this.codeToDisplay) {
            navigator.clipboard.writeText(this.codeToDisplay).then(() => {});
            this._toastService.success('Code Copied Successfully!');
        }
    }
}
