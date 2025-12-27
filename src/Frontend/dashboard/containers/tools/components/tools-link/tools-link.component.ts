import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ToastService } from 'assets/toast/toast.service';
@Component({
    selector: 'sb-tools-link ',
    templateUrl: './tools-link.component.html',
    styleUrls: ['./tools-link.component.scss'],
})
export class ToolsLinkComponent implements OnInit {
    linkToolForm!: FormGroup;
    SPID: any = sessionStorage.getItem('SP_ID');
    channelOption: any = [];
    channelSelected: string = 'Select Channel';
    channelPhoneNumber: string = '';
    ShowAssignOption: boolean = false;
    isTooltipVisible: boolean = false;
    generatedLink: string | null = null;

    constructor(private _settingsService: SettingsService, private _toastService: ToastService) {}
    ngOnInit() {
        this.getWhatsAppDetails();
        this.initForm();
    }
    initForm() {
        this.linkToolForm = new FormGroup({
            channel: new FormControl('', Validators.required),
            phoneNumber: new FormControl(''),
            customMessage: new FormControl('', Validators.required),
        });
    }

    handleTooltipChange(visible: boolean) {
        this.isTooltipVisible = visible;
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
            this.linkToolForm.patchValue({
                channel: this.channelSelected,
                phoneNumber: channelPhoneNumber,
            });
        }
        this.ShowAssignOption = false;
    }
    generateLink() {
        if (this.linkToolForm.get('channel')?.value) {
          const phoneNumber = this.linkToolForm.get('phoneNumber')?.value;
          const customMessage = encodeURIComponent(this.linkToolForm.get('customMessage')?.value || '');
          
          this.generatedLink = `https://wa.me/${phoneNumber}?text=${customMessage}`;
          this._toastService.success('Link generated successfully!');
      }
    }
    copyToClipboard() {
      if (this.generatedLink) {
        this._toastService.success('Copied!');
          navigator.clipboard.writeText(this.generatedLink).then(() => {
          });
      }
  }
}
