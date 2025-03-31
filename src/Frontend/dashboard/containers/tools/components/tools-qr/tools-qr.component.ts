import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ToastService } from 'assets/toast/toast.service';

@Component({
    selector: 'sb-tools-qr',
    templateUrl: './tools-qr.component.html',
    styleUrls: ['./tools-qr.component.scss'],
})
export class ToolsQRComponent implements OnInit, OnDestroy {
    qrToolForm!: FormGroup;
    SPID: any = sessionStorage.getItem('SP_ID');
    channelOption: any = [];
    channelSelected: string = 'Select Channel';
    channelPhoneNumber: string = '';
    ShowAssignOption: boolean = false;
    isTooltipVisible: boolean = false;
    qrCodeImageURL: string | null = null;
    generatedLink: string | null = null;
    
    @ViewChild('qrCodeRef', { static: false }) qrCodeRef!: any;

    constructor(
        private _settingsService: SettingsService,
        private _toastService: ToastService
    ) {}

    ngOnInit() {
        this.getWhatsAppDetails();
        this.initForm();
    }

    ngOnDestroy() {
        // currently not needed but for future use
    }

    initForm() {
        this.qrToolForm = new FormGroup({
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
            this.qrToolForm.patchValue({
                channel: this.channelSelected,
                phoneNumber: channelPhoneNumber,
            });
        }
        this.ShowAssignOption = false;
    }

    generateLink() {
        if (this.qrToolForm.get('channel')?.value) {
            const phoneNumber = this.qrToolForm.get('phoneNumber')?.value;
            const customMessage = encodeURIComponent(
                this.qrToolForm.get('customMessage')?.value || ''
            );

            this.generatedLink = `https://wa.me/${phoneNumber}?text=${customMessage}`;
            this._toastService.success('Link generated successfully!');
        }
    }
    copyToClipboard() {
        if (this.generatedLink) {
            navigator.clipboard.writeText(this.generatedLink).then(() => {
                this._toastService.success('Link copied to clipboard!');
            });
        }
    }

    downloadQRCode() {
        setTimeout(() => {
            if (!this.qrCodeRef || !this.qrCodeRef) {
                this._toastService.error('QR Code component is not available.');
                return;
            }
            const container: HTMLElement = this.qrCodeRef.qrcElement.nativeElement;
            const canvas: HTMLCanvasElement | null = container.querySelector('canvas');
        
            if (canvas) {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'qr-code.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        this._toastService.success('QR Code downloaded successfully!');
                    } else {
                        this._toastService.error('Failed to generate QR code image.');
                    }
                }, 'image/png');
            } else {
                this._toastService.error('Canvas not found in the QR code container.');
            }
        }, 500);
    }
}
