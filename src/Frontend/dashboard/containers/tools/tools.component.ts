import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';

declare var $: any;

@Component({
    selector: 'sb-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss'],
})
export class ToolsComponent implements OnInit {
    activeTab: string = 'link';
    tabs = [
        { label: 'Link', id: 'link' },
        { label: 'QR Code', id: 'qr' },
        { label: 'Chat Widget', id: 'chat' },
    ];
    SPID: any = sessionStorage.getItem('SP_ID');
    channelOption: any = [];
    channelSelected: string = '';
    channelPhoneNumber: string = '';
    ShowAssignOption: boolean = false;

    constructor(private _settingsService: SettingsService) {}

    ngOnInit(): void {
        this.getWhatsAppDetails();
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
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

                    if (this.channelOption.length == 1) {
                        this.channelSelected = this.channelOption[0].label;
                        this.channelPhoneNumber = this.channelOption[0].connected_id;
                    }
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
            this.channelPhoneNumber = selectedChannel.connected_id
        }
        this.ShowAssignOption = false;
    }
}
