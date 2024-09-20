import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { newTemplateFormData, quickReplyButtons, templateMessageData,} from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { TeamboxService } from 'Frontend/dashboard/services';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ToolbarService, NodeSelection, LinkService, ImageService, EmojiPickerService, CountService} from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
import { isNullOrUndefined } from 'is-what';
declare var $: any;
@Component({
    selector: 'sb-template-message',
    templateUrl: './template-message.component.html',
    styleUrls: ['./template-message.component.scss'],
    providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService,CountService]
})
export class TemplateMessageComponent implements OnInit {
    loadingVideo: boolean = false;
    selectedCountryCode: any;
    selectedTab: number = 0;
    spid!: number;
    id: number = 0;
    currentUser!: string;
    profilePicture!: string;
    searchText!: string;
    searchTextGallery!: string;
    Category: any;
    category_id!: number;
    quickreply: any;
    status: string = 'saved';
    BodyText: any;
    fileName: any; 
    TemplateName = '';
    selectedType: string = 'text';
    selectedPreview: string = '';
    metaUploadedId: string = '';
    showCampaignDetail: boolean = false;
    showGalleryDetail: boolean = false;
    showInfoIcon:boolean = false;
    isHeaderAttribute:boolean = false;
    templatesData = [];
    galleryData = [];
    allVariablesList:string[] =[];
    filteredGalleryData = [];
    filteredTemplatesData: templateMessageData[] = [];
    templatesMessageData: templateMessageData = <templateMessageData>{};
    galleryMessageData:templateMessageData= <templateMessageData>{};
    templatesMessageDataById: any;
    attributesList: any = [];
    attributesearch!: string;
    characterCounts: { [key: number]: number } = {};
    filterCategory = ['Topic', 'Industry', 'Category', 'Language'];
    filterTemplateCategory = ['Status', 'Channel','Category', 'Language'];
    ShowChannelOption! : boolean;
    channelOption: any = [];
    countValue: number = 1;
    customValue: string = "var1";
    isLoading!:boolean;
    valuesMap: Map<number, string> = new Map();
    filterListTopic = [
        { value: 0, label: 'Lead Gen', checked: false },
        { value: 1, label: 'Order Confirm', checked: false },
        { value: 2, label: 'Feedback', checked: false },
        { value: 3, label: 'Booking', checked: false },
        { value: 4, label: 'New Order', checked: false },
    ];
    filterListIndustry = [
        { value: 0, label: 'Transport', checked: false },
        { value: 1, label: 'Automobile', checked: false },
        { value: 2, label: 'Healthcare', checked: false },
        { value: 3, label: 'Education', checked: false },
        { value: 4, label: 'Ecommerce', checked: false },
        { value: 5, label: 'Agriculture', checked: false },
        { value: 6, label: 'Construction', checked: false },
        { value: 7, label: 'Health Services', checked: false },
        { value: 8, label: 'Financial', checked: false },
    ];
    filterListCategory = [
        { value: 3, label: 'Authentication', checked: false },
        { value: 1, label: 'Marketing', checked: false },
        { value: 2, label: 'Utility', checked: false },
    ];
    filterListChannel = [
        { value: 1, label: 'WA API', checked: false },
        { value: 2, label: 'WA Web', checked: false },
    ];
    filterListLanguage = [
        { value: 0, label: 'English', checked: false },
        { value: 1, label: 'Other', checked: false },
    ];
    filterListStatus = [
        { value: 0, label: 'draft', checked: false },
        { value: 1, label: 'approved', checked: false },
        { value: 2, label: 'pending', checked: false },
        { value: 3, label: 'rejected', checked: false },
        { value: 4, label: 'saved', checked: false },
    ];
    selectedCategory = 1;
    selectedCategories: string[] = [];
    quickReplyButtons: quickReplyButtons[] = [
        { quickreply1: 'Reply 1', quickreply2: 'Reply 2', quickreply3: 'Reply 3' },
    ];

    statusColors:any = {
        draft: '#FFD0D0',
        approved: '#E2F4EC',
        pending: '#EBEDF1',
        rejected: '#E4DFF5',
        saved: '#E2F4EC',
    };
    countryCodes = [
      'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
      'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
      'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
      'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
      'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
      'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1 767', 'DO +1 809', 'DZ +213',
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
    @ViewChild('chatEditor') chatEditor?: RichTextEditorComponent | any;
    lastCursorPosition: Range | null = null;

    public tools: object = {
        items: [
            'Bold',
            'Italic',
            'StrikeThrough',
            'EmojiPicker',
            {
                tooltipText: 'Attributes',
                undo: true,
                click: this.ToggleAttributesOption.bind(this),
                template:
                    '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >' +
                    '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>',
            },
        ],
    };
    public pasteCleanupSettings: object = {
        prompt: false,
        plainText: true,
        keepFormat: false,
    };
    newTemplateForm!: FormGroup;

    constructor(public apiService: SettingsService,public settingsService: SettingsService, private _teamboxService: TeamboxService) {}

    errorMessage = '';
    successMessage = '';
    warningMessage = '';

    showToaster(message: any, type: any) {
        if (type == 'success') {
            this.successMessage = message;
        } else if (type == 'error') {
            this.errorMessage = message;
        } else {
            this.warningMessage = message;
        }
        setTimeout(() => {
            this.hideToaster();
        }, 3000);
    }
    hideToaster() {
        this.successMessage = '';
        this.errorMessage = '';
        this.warningMessage = '';
    }

    ToggleAttributesOption() {   
        const selection = window.getSelection();
        this.lastCursorPosition = selection?.getRangeAt(0) || null;
        $('#atrributemodal').modal('show');
        //this.insertAtCursor();
        $('#newTemplateMessage').modal('hide');
    }


    onEditorChange(value:any) {
        this.newTemplateForm.get('BodyText')?.setValue(value);
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.spid = Number(sessionStorage.getItem('SP_ID'));
        this.profilePicture = JSON.parse(sessionStorage.getItem('loginDetails')!).profile_img;
        this.currentUser = JSON.parse(sessionStorage.getItem('loginDetails')!).name;
        this.newTemplateForm = this.prepareUserForm();
        this.filteredTemplatesData = [...this.templatesData];
        this.filteredGalleryData = [...this.galleryData];
        this.BodyText = this.newTemplateForm.get('BodyText')?.value;
        const idx = 0;
        const dynamicControlName = 'quickreply' + (idx + 1);
        this.quickreply = this.newTemplateForm.get(dynamicControlName)?.value;
        this.getTemplatesData();
        this.getAttributeList();
        this.getWhatsAppDetails();
    }
   
    getWhatsAppDetails() {
		this.apiService.getWhatsAppDetails(this.spid)
		.subscribe((response:any) =>{
		 if(response){
			 if (response && response.whatsAppDetails) {
				this.channelOption = response.whatsAppDetails.map((item : any)=> ({
				  value: item.id,
				  label: item.channel_id,
				  connected_id: item.connected_id,
                  channel_status: item.channel_status,
                  checked: false
				}));
                this.filterListChannel = this.channelOption;
			  }
		 }
	   })
	 }
     stopPropagation(event: Event) {
        event.stopPropagation();
      }
      selectChannel(channel:any){
        if(channel.channel_status == 0 && channel?.label == "WA API"){
            this.showToaster('This Channel is currently disconnected. Please Reconnect this channel from Account Settings to use it.','error');
            return;
        }
		this.newTemplateForm.get('channel_id')?.setValue(channel.value);
		this.newTemplateForm.get('Channel')?.setValue(channel.label);
		this.ShowChannelOption=false
	}
    prepareUserForm() {
        return new FormGroup({
            TemplateName: new FormControl(null, [Validators.required]),
            Channel: new FormControl(null, [Validators.required]),
            Category: new FormControl(null, [Validators.required]),
            Language: new FormControl(null, [Validators.required]),
            media_type: new FormControl(null),
            Header: new FormControl(null),
            Links: new FormControl(null),
            BodyText: new FormControl('', [Validators.required]),
            FooterText: new FormControl(''),
            buttonType: new FormControl(''),
            buttonText: new FormControl(''),
            quickreply1: new FormControl(''),
            quickreply2: new FormControl(''),
            quickreply3: new FormControl(''),
            country_code: new FormControl('IN +91'),
            phone_number: new FormControl(''),
            displayPhoneNumber: new FormControl(''),
        });
    }

    selectTab(tabNumber: number) {
        this.selectedTab = tabNumber;
        this.showGalleryDetail = false;
    }

    // selected category for filterTemplate

    setSelectedCategory(index: number) {
        this.selectedCategory = index;
    }

    // selected Message for New Template Message Form
    showMessageType(type: string) {
        this.selectedType = type;
        console.log(this.selectedType);
        this.newTemplateForm.get('Links')?.setValue(null);
        this.newTemplateForm.get('Header')?.setValue('');
        this.selectedPreview = '';
    }
 
    applyGalleryFilter() {
        this.filteredGalleryData = this.galleryData.filter((template: any) => {
            const selectedTopics = this.filterListTopic.filter(topic => topic.checked).map(topic => topic.label);
            const selectedIndustries = this.filterListIndustry.filter(industry => industry.checked).map(industry => industry.label);
            const selectedCategories = this.filterListCategory.filter(category => category.checked).map(category => category.label);
            const selectedLanguages = this.filterListLanguage.filter(language => language.checked).map(language => language.label);
    
            const isTopicMatch = selectedTopics.length === 0 || selectedTopics.includes(template.topic);
            const isIndustryMatch = selectedIndustries.length === 0 || selectedIndustries.includes(template.industry);
            const isCategoryMatch = selectedCategories.length === 0 || selectedCategories.includes(template.Category);
            const isLanguageMatch = selectedLanguages.length === 0 || selectedLanguages.includes(template.Language);
    
            const isAllCriteriaMatch = isTopicMatch && isIndustryMatch && isCategoryMatch && isLanguageMatch;
    
            $('#filterTemplateModal').modal('hide');
            return isAllCriteriaMatch;
        });
    }
    

    applyTemplateFilter() {
        this.filteredTemplatesData = this.templatesData.filter((template: any) => {
            const selectedStatus = this.filterListStatus.filter(status => status.checked).map(status => status.label);
            const selectedChannels = this.filterListChannel.filter(channel => channel.checked).map(channel => channel.label);
            const selectedCategories = this.filterListCategory.filter(category => category.checked).map(category => category.label);
            const selectedLanguages = this.filterListLanguage.filter(language => language.checked).map(language => language.label);
    
            const isStatusMatch = selectedStatus.length === 0 || selectedStatus.includes(template.status);
            const isChannelMatch = selectedChannels.length === 0 || selectedChannels.includes(template.Channel);
            const isCategoryMatch = selectedCategories.length === 0 || selectedCategories.includes(template.Category);
            const isLanguageMatch = selectedLanguages.length === 0 || selectedLanguages.includes(template.Language);
    
            const isAllCriteriaMatch = isStatusMatch && isChannelMatch && isCategoryMatch && isLanguageMatch;
    
            $('#filterTemplateModal').modal('hide');
            return isAllCriteriaMatch;
        });
    }
    
    clearFilters() {
        this.filterListTopic.forEach(topic => (topic.checked = false));
        this.filterListStatus.forEach(status => (status.checked = false));
        this.filterListChannel.forEach(channel => (channel.checked = false));
        this.filterListIndustry.forEach(industry => (industry.checked = false));
        this.filterListCategory.forEach(category => (category.checked = false));
        this.filterListLanguage.forEach(language => (language.checked = false));

        this.applyGalleryFilter();
        this.applyTemplateFilter();
        this.getTemplatesData();
        $('#filterTemplateModal').modal('hide');
    }

    isFilterApplied(filter: string): boolean {
        if (filter === 'Status') {
            return this.filterListStatus.some(status => status.checked);
        } else if (filter === 'Channel') {
            return this.filterListChannel.some(channel => channel.checked);
        }
        else if (filter === 'Topic') {
            return this.filterListTopic.some(topic => topic.checked);
        }
        else if (filter === 'Industry') {
            return this.filterListIndustry.some(industry => industry.checked);
        }
        else if (filter === 'Category') {
            return this.filterListCategory.some(category => category.checked);
        }
        else if (filter === 'Language') {
            return this.filterListLanguage.some(language => language.checked);
        }
        return false;
    }
    

    goToGallery() {
        this.selectedTab = 1;
        this.clearFilters();
    }

    // calculate the character count in input fields

    updateCharacterCount(event: Event, idx: number) {
        const inputElement = event.target as HTMLInputElement;
        let value = inputElement.value;
        const validPattern = /{{[^{}]*}}/g;
        const hasValidExpressions = validPattern.test(value);
        if(!hasValidExpressions){
        const malformedPattern = /{{[^{}]*[^{}]|[^{}]*}}[^{}]*|[^{}]*{{[^{}]*$|{{[^{}]*[^{}]}[^{}]*$/g;
        const hasMalformed = malformedPattern.test(value);
            if(hasMalformed) {
            value = value.replace(malformedPattern, '');
            value = value.replace(/[{}]+/g, ''); 
            this.newTemplateForm.controls.Header.setValue(value);
            }
        }
        inputElement.value = value;
        this.characterCounts[idx] = value.length;
       
    }

    getCharacterCount(idx: number) {
        return this.characterCounts[idx] || 0;
    }
    
    saveVideoAndDocument(files: FileList) {
        if (files[0]) {
            let File = files[0];
            this.fileName = this.truncateFileName(File.name, 25);
            let spid = this.spid
            let mediaType = files[0].type;
            let fileSize = files[0].size;

            const fileSizeInMB: number = parseFloat((fileSize / (1024 * 1024)).toFixed(2));
			const imageSizeInMB: number = parseFloat((5 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
			const docVideoSizeInMB: number = parseFloat((10 * 1024 * 1024 / (1024 * 1024)).toFixed(2));

            const data = new FormData();
            data.append('dataFile', File, File.name);
            data.append('mediaType', mediaType);

            if((mediaType == 'video/mp4' || mediaType == 'application/pdf') && fileSizeInMB > docVideoSizeInMB) {
				this.showToaster('Video / Document File size exceeds 10MB limit','error');
			}

			else if ((mediaType == 'image/jpg' || mediaType == 'image/jpeg' || mediaType == 'image/png' || mediaType == 'image/webp') && fileSizeInMB > imageSizeInMB) {
				this.showToaster('Image File size exceeds 5MB limit','error');
			}

            else {
                let name='template-message'
                this.loadingVideo = true;
    
                this._teamboxService.uploadfileToMeta(data,spid,name).subscribe
                (uploadStatus => {
                    let responseData: any = uploadStatus;
                    if (responseData.awsUploadedId) {
                        this.selectedPreview = responseData.awsUploadedId.toString();
                        this.metaUploadedId = responseData.metaUploadedId['h'];
                        this.newTemplateForm.get('Links')?.setValue(this.selectedPreview);
                        console.log(this.selectedPreview);
                    }
                    this.loadingVideo = false;
            },
                (error) => {
                        this.loadingVideo = false;
                        this.showToaster("Video File Size is Too Large, Max 10MB size is Allowed!", 'error');
                 });
            }
 
      }
    }

    onFileChange(event: any) {
        let files: FileList = event.target.files;
        this.saveVideoAndDocument(files);
    }

    uploadThroughLink() {
        let value = this.newTemplateForm.get('Links')?.value;
        this.selectedPreview = value;
      }

      truncateFileName(fileName: string, maxLength: number): string {
        if (fileName.length > maxLength) {
          return fileName.substring(0, maxLength) + '...';
        }
        return fileName;
      }

    // remove form values
    removeValue() {
        this.selectedPreview = '';
        this.fileName='';
        this.newTemplateForm.get('Links')?.setValue(null);
    }

    removeFormValues() {
        this.id = 0;
        this.selectedPreview = '';
        this.characterCounts = {};
        this.BodyText = '';
        this.newTemplateForm.reset();
        this.newTemplateForm.get('BodyText')?.setValue('');
        this.newTemplateForm.get('Header')?.setValue('');

    }

    addQuickReplyButtons() {
        if (this.quickReplyButtons.length < 3) {
            this.quickReplyButtons.push({ quickreply1: '', quickreply2: '', quickreply3: '' });
        }
    }

    removeQuickReplyButtons(index: any) {
        this.quickReplyButtons.splice(index, 1);
    }

    toggleGalleryData(data: any) {
        this.showGalleryDetail = !this.showGalleryDetail;
        if(this.showGalleryDetail) {
            this.galleryMessageData = data;
            this.status= 'saved';
            this.BodyText = this.galleryMessageData.BodyText;
            this.selectedType = this.galleryMessageData.media_type;
            this.selectedPreview = this.galleryMessageData.Links;
            // this.galleryMessageData.ID = 0;
        }
        else {
          this.galleryMessageData=<templateMessageData>{};
          this.BodyText='';
          this.selectedType ='text';
          this.selectedPreview='';
          this.newTemplateForm.reset();
          this.newTemplateForm.clearValidators();
          }
    }

    toggleTemplatesData(data: any) {
        this.showCampaignDetail = !this.showCampaignDetail;
        if (this.showCampaignDetail) {
            this.templatesMessageData = data;
            this.status = this.templatesMessageData.status;
            this.BodyText = this.templatesMessageData.BodyText;
            this.selectedType= this.templatesMessageData.media_type;
            this.selectedPreview = this.templatesMessageData.Links;
            this.templatesMessageDataById = data;
            console.log(this.templatesMessageDataById);
        } else {
            this.templatesMessageDataById = null;
            this.status= 'saved';
            this.BodyText='';
            this.selectedType ='text';
            this.selectedPreview='';
            this.newTemplateForm.reset();
            this.newTemplateForm.clearValidators();
            console.log(this.templatesMessageDataById);
        }
    }

    getTemplatesData() {
        // get templates data
        this.apiService.getTemplateData(this.spid, 1).subscribe(response => {
            this.isLoading = false;
            this.templatesData = response.templates;
            this.filteredTemplatesData = this.templatesData;
        });

        //get gallery data
        this.apiService.getTemplateData(0, 2).subscribe(response => {
            this.galleryData = response.templates;
            console.log(this.galleryData)
            this.filteredGalleryData = this.galleryData;
        });
    }

    updateFilter(event: any, filter: any) {
        if (event.target.checked) {
            filter['checked'] = true;
            let isChecked = filter.label
            console.log(isChecked,'Currently Checked!')
            console.log(filter.label + ' :: ' + event.target.value);
        } else {
            filter['checked'] = false;
            console.log(filter.label + ' :: ' + event.target.value);
        }
    }

    onCategoryChange(event: any) {
        const selectedCategory = this.newTemplateForm.get('Category')?.value;
        this.Category = selectedCategory;
        console.log(this.Category)
        if(selectedCategory=='Authentication') {
            this.category_id = 3
        }
        else if(selectedCategory=='Marketing') {
            this.category_id = 1
        }
        else if(selectedCategory=='Utility') {
            this.category_id = 2
        }
    }
    settingValue(){
        if(this.newTemplateForm.get('BodyText')?.value == null)  this.newTemplateForm.get('BodyText')?.setValue('');
        if(this.newTemplateForm.get('Header')) this.newTemplateForm.get('Header')?.setValue('');
        if(this.newTemplateForm.get('FooterText')) this.newTemplateForm.get('FooterText')?.setValue('');
        this.showMessageType("text")
        this.templatesMessageData.media_type = "text";
        const selTextRadio = document.getElementById('sel-text') as HTMLInputElement;
        if (selTextRadio) {
          selTextRadio.checked = true;
        }
    }
    saveTemplateNextStep() {
        let val = this.newTemplateForm.get('TemplateName')?.value;
        //this.settingValue()
        
    let temp:any = this.templatesData.filter((item:any) => item.TemplateName == val)[0];
    console.log(temp)
    if(temp && this.id != temp?.ID){
    this.showToaster('Template already exist with this name !','error');
    }else{
      this.TemplateName = this.newTemplateForm.get('TemplateName')?.value;
      const Channel =  this.newTemplateForm.get('Channel')?.value;
      const Category =  this.newTemplateForm.get('Category')?.value;
      const Language = this.newTemplateForm.get('Language')?.value;

    if(this.TemplateName && Channel && Category && Language) {
        $('#newTemplateMessage').modal('show');
        $('#newTemplateMessageFirst').modal('hide');
        
     }
     else {
        this.showToaster('! Please fill in all the values before proceeding','error');
     }
    }
    }

    
checkTemplateName(e:any){
    let val = e.target.value;
    let temp:any = this.templatesData.filter((item:any) => item.TemplateName == val)[0];
    console.log(temp)
    if(temp && this.id != temp?.ID)
    this.showToaster('Template already exist with this name !','error');
    
    }

    saveNewTemplate() {
        if (this.newTemplateForm.valid) {
            const newTemplateFormData = this.createNewTemplateFormData();
            if ((this.templatesMessageDataById = null)) {
                this.apiService
                    .saveNewTemplateData(newTemplateFormData, this.selectedPreview)
                    .subscribe(response => {
                        // add new template
                        if (response.status != 400) {
                            this.newTemplateForm.reset();
                            this.newTemplateForm.clearValidators();
                            this.templatesMessageDataById = null;
                            this.showCampaignDetail = false;
                            this.showGalleryDetail = false;
                            $('#newTemplateMessage').modal('hide');
                            $('#confirmationModal').modal('hide');
                            $('#newTemplateMessagePreview').modal('hide');
                            this.getTemplatesData();
                            this.removeFormValues();
                        }
                        else{
                            this.showToaster('there is something wrong in this template','error')
                        }
                    });
            } else {
                this.apiService
                    .saveNewTemplateData(newTemplateFormData, this.selectedPreview)
                    .subscribe(response => {
                        // edit existing template
                        if (response.status != 400) {
                            this.newTemplateForm.reset();
                            this.newTemplateForm.clearValidators();
                            this.showCampaignDetail = false;
                            this.templatesMessageDataById = null;
                            $('#newTemplateMessage').modal('hide');
                            $('#confirmationModal').modal('hide');
                            $('#newTemplateMessagePreview').modal('hide');
                            this.getTemplatesData();
                            this.removeFormValues();
                        }
                        else{
                            this.showToaster('there is something wrong in this template','error')
                        }
                    });
            }
        } else {
            alert('!Please fill the required details in the form First');
        }
    }

    confirmsave() {
        this.status = 'saved';
            $('#newTemplateMessage').modal('hide');
            $('#newTemplateMessagePreview').modal('hide');
            $('#confirmationModal').modal('show');
            this.showCampaignDetail =false;
    }

    saveAsDraft() {
        this.status = 'draft';
        this.saveNewTemplate();
    }

    copyTemplate() {
        const copyTemplateForm: newTemplateFormData = <newTemplateFormData>{};
        copyTemplateForm.ID = 0;
        copyTemplateForm.spid = this.templatesMessageDataById.spid;
        copyTemplateForm.created_By = this.templatesMessageDataById.created_By;
        copyTemplateForm.isTemplate = this.templatesMessageDataById.isTemplate;
        copyTemplateForm.media_type = this.templatesMessageDataById.media_type;
        copyTemplateForm.Header = this.templatesMessageDataById.Header;
        copyTemplateForm.Links = this.templatesMessageDataById.Links;
        copyTemplateForm.BodyText = this.templatesMessageDataById.BodyText;
        copyTemplateForm.FooterText = this.templatesMessageDataById.FooterText;
        copyTemplateForm.TemplateName = this.templatesMessageDataById.TemplateName +' copy';
        copyTemplateForm.Channel = this.templatesMessageDataById.Channel;
        copyTemplateForm.Category = this.templatesMessageDataById.Category;
        copyTemplateForm.category_id = this.templatesMessageDataById.category_id;
        copyTemplateForm.Language = this.templatesMessageDataById.Language;
        copyTemplateForm.status = 'draft';
        copyTemplateForm.isCopied = 1;
        copyTemplateForm.template_id = this.templatesMessageDataById.template_id;
      //  if(this.templatesMessageDataById.Category=='WA API') {
            copyTemplateForm.template_json = this.templatesMessageDataById?.template_json;

        // }
        // else {
        //     copyTemplateForm.template_json = [];
        // }
        let nameExist = this.filteredTemplatesData.filter((item:any)=>item.TemplateName == this.templatesMessageDataById.TemplateName +' copy');
        if(nameExist.length >0){
            copyTemplateForm.TemplateName = this.templatesMessageDataById.TemplateName +' copy' + Math.random();
        }
       
            this.apiService.saveNewTemplateData(copyTemplateForm, this.selectedPreview)
            .subscribe(response => {
                // copy existing template
                if (response) {
                    this.showCampaignDetail=false;
                    this.getTemplatesData();
                    console.log('Template saved successfully', response);
                }
            });
         }

      
    createNewTemplateFormData() {
        const newTemplateForm: newTemplateFormData = <newTemplateFormData>{};

        newTemplateForm.spid = this.spid;
        newTemplateForm.created_By = this.currentUser;
        newTemplateForm.ID = this.id;
        newTemplateForm.isTemplate = 1;
        newTemplateForm.media_type = this.selectedType;
        newTemplateForm.Header = this.newTemplateForm.controls.Header.value;
        newTemplateForm.Links = this.newTemplateForm.controls.Links.value;
        newTemplateForm.Links = this.selectedPreview;
        newTemplateForm.BodyText = this.newTemplateForm.controls.BodyText.value;
        newTemplateForm.FooterText = this.newTemplateForm.controls.FooterText.value;
        newTemplateForm.TemplateName = this.newTemplateForm.controls.TemplateName.value;
        newTemplateForm.Channel = this.newTemplateForm.controls.Channel.value;
        newTemplateForm.Category = this.Category;
        newTemplateForm.category_id = this.category_id;
        newTemplateForm.Language = this.newTemplateForm.controls.Language.value;
        newTemplateForm.status = this.status == 'saved'? this.newTemplateForm.controls.Channel.value == 'WA API' ? 'pending':this.status: this.status;
        newTemplateForm.template_id = 0;
        newTemplateForm.isCopied = 0;
        newTemplateForm.template_json = [];
        if(this.newTemplateForm.controls.Channel.value == 'WA API') {
            let buttons =[];
            let headerAtt = this.getVariables(this.newTemplateForm.controls.Header.value, "{{", "}}", true);
            let bodyAtt = this.getVariables(this.newTemplateForm.controls.BodyText.value, "{{", "}}",true);
            let header_text;
            let body_text;
            if(this.newTemplateForm.controls.buttonType.value == 'Quick Reply'){
               // let obj =[];
                let i = 0;
                for(let item of this.quickReplyButtons){
                    i++;
                    buttons.push({type: "QUICK_REPLY",text: this.newTemplateForm.get(`quickreply${i}`)?.value})
                }
            }else{
                console.log(this.newTemplateForm.controls.displayPhoneNumber.value)
                buttons =[{
                    type: 'PHONE_NUMBER',
                    text: this.newTemplateForm.controls.buttonText.value,
                    phone_number: this.newTemplateForm.controls.phone_number.value,
                   // countryCode: this.newTemplateForm.controls.country_code.value,
                    //displayPhoneNumber: this.newTemplateForm.controls.displayPhoneNumber.value,
                },
                // {
                //     type: 'URL',
                //     text: this.newTemplateForm.controls.url?.value,
                //     url: this.newTemplateForm.controls.url?.value,
                // }
            ]
            }
            let headerMedia ={};
            if(this.selectedType != 'text'){
                 headerMedia = {
                        header_handle: [this.metaUploadedId]
            }
            
        }
        let comp:any =  [
            {
                type: 'HEADER',
                format: this.selectedType,
                [this.selectedType =='text' ?'text' :'example' ]: this.selectedType =='text' ? this.newTemplateForm.controls.Header.value : headerMedia,
            },
            {
                type: 'BODY',
                text: this.newTemplateForm.controls.BodyText.value,
            },
            {
                type: 'FOOTER',
                text: this.newTemplateForm.controls.FooterText.value,
            },
            {
                //type: this.newTemplateForm.controls.buttonType.value,
                type: 'BUTTONS',                       
                buttons:buttons
                // button: [
                //     {
                //         name1: this.newTemplateForm.controls.quickreply1.value,
                //         name2: this.newTemplateForm.controls.quickreply2.value,
                //         name3: this.newTemplateForm.controls.quickreply3.value,
                       
                //     },
                // ],
                // button:[
                //     {type: "QUICK_REPLY",text: this.newTemplateForm.controls.quickreply1.value},
                // //     this.newTemplateForm.controls.quickreply1.value,
                // //     this.newTemplateForm.controls.quickreply2.value,
                // //    this.newTemplateForm.controls.quickreply3.value,
                // ]
            },
        ]
        if(headerAtt && headerAtt.length > 0){
            header_text ={ "header_text": headerAtt}
            comp[0]['example'] = header_text
        }
        if(bodyAtt && bodyAtt.length >0){
            body_text ={ "body_text": bodyAtt}
            comp[1]['example'] = body_text
        }

            newTemplateForm.template_json.push({
                name: this.newTemplateForm.controls.TemplateName.value,
                category: this.newTemplateForm.controls.Category.value,
                language: this.newTemplateForm.controls.Language.value == 'English' ? 'en_US' :this.newTemplateForm.controls.Language.value,
                components:comp
                
            });
        }   
        return newTemplateForm;
    }
    // for template form
    patchFormValue() {
        const data = this.templatesMessageData;
        console.log(data,'data');
        const databyid = this.templatesMessageDataById;
        let ID = databyid.ID;
        for (let prop in data) {
            let value = data[prop as keyof typeof data];
            if (this.newTemplateForm.get(prop)){
                if(prop == 'FooterText')
                    console.log(value);
             this.newTemplateForm.get(prop)?.setValue(value);
            }
            this.id = ID;
        }
        this.selectedType = this.templatesMessageData?.media_type;
        this.selectedPreview = this.templatesMessageData.Links;
        this.onCategoryChange('');
    }
    // for gallery form
    patchGalleryFormValue() {
        const galleryData = this.galleryMessageData;
        let ID = this.galleryMessageData.ID;
        for (let prop in galleryData) {
            let value = galleryData[prop as keyof typeof galleryData];
            if (this.newTemplateForm.get(prop)) this.newTemplateForm.get(prop)?.setValue(value);
            this.id = ID;
        }

    }

    copyTemplatesData() {
        $('#newTemplateMessageFirst').modal('show');
        this.patchFormValue();
    }
    copyGalleryData() {
        $('#newTemplateMessageFirst').modal('show');
        this.patchGalleryFormValue();
    }

    deleteTemplate() {
        const TemplateID = {
            ID: this.templatesMessageData?.ID,
        };
        this.selectedType = 'text';
        this.apiService.deleteTemplateData(TemplateID).subscribe(result => {
            if (result) {
                $('#deleteModal').modal('hide');
                this.showCampaignDetail = false;
                this.getTemplatesData();
            }
        });
    }

    // Function to format the phone number using libphonenumber-js
    formatPhoneNumber() {
        const phoneNumber = this.newTemplateForm.get('displayPhoneNumber')?.value;
        const countryCode = this.newTemplateForm.get('country_code')?.value;
        let formattedPhoneNumber = null;
        if (phoneNumber && countryCode) {
            const phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
            formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);
            this.newTemplateForm.patchValue({
                phone_number: formattedPhoneNumber
                    ? formattedPhoneNumber.formatInternational().replace(/[\s+]/g, '')
                    : '',
            });
        }
    }
    closeAtrrModal() {
        this.attributesearch ='';
        $('#newTemplateMessage').modal('show');
        $('#atrributemodal').modal('hide');
        this.isHeaderAttribute = false;
    }

    selectAttributes(item:any) {
        const selectedValue = item;
        let content:any ='';
        if(this.isHeaderAttribute){
            content = this.newTemplateForm.controls.Header.value || '';
        }else{
            content = this.chatEditor.value || '';
        }

        //content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
        if(this.isHeaderAttribute){
            const regex = /\{\{[^{}]+\}\}/;
            if(regex.test(content)){
                this.showToaster('! Cannot add more then 1 attribute in header ','error');
            }else{
                content = content+ '{{'+selectedValue+'}}'
                this.newTemplateForm.controls.Header.setValue(content);
            }
        }else{
            // content = content+ '<span style="color:#000">{{'+selectedValue+'}}</span>'
            // this.chatEditor.value = content;
            const container = document.createElement('div');
            container.innerHTML = this.chatEditor?.value;
            const text = container.innerText;
            const attLenght = selectedValue.length;
            if((text.length + attLenght +4) > 1024 ){
              this.showToaster("text length should not exceed 1024 limit!", 'error');
            }else{
            this.insertAtCursor(selectedValue);
            }
            // this.insertAtCursor(selectedValue);
            // setTimeout(() => {
            //     this.onContentChange();
            // }, 50); 
        }
        this.closeAtrrModal();
    }

    
    insertAtCursor(selectedValue:any) {
        const editorElement = this.chatEditor.element.querySelector('.e-content');
        const newNode = document.createElement('span');
        newNode.innerHTML =  '<span contenteditable="false" class="e-mention-chip"><a _ngcontent-yyb-c67="" title="">{{'+selectedValue+'}}</a></span>';;
        //newNode.style.color = '#000';
        this.lastCursorPosition?.insertNode(newNode);
      }
     /* GET VARIABLE VALUES */
    getVariables(sentence: string, first: string, last: string, isTempateJson:boolean =false) {
        let goodParts: string[] = [];
    
        if (!sentence || sentence.trim() === '') {
            return goodParts;
        }
    
        const allParts = sentence.split(first);
    
        allParts.forEach((part: string, index: number) => {
            if (index !== 0) {
                const closingIndex = part.indexOf(last);
                if (closingIndex !== -1) {
                    const goodOne = part.substring(0, closingIndex);
                    if(!isTempateJson)
                        goodParts.push("{{" + goodOne + "}}");
                    else
                    goodParts.push(goodOne);
                }
            }
        });
        return goodParts;
    }
    

    previewTemplate() {
        let isVariableValue:string = this.newTemplateForm.controls.BodyText.value + this.newTemplateForm.controls.Header.value;

		if (isVariableValue) {
		  this.allVariablesList = this.getVariables(isVariableValue, "{{", "}}");
		  console.log(this.allVariablesList);
          $('#newTemplateMessage').modal('hide');
          $('#newTemplateMessagePreview').modal('show');
      };

    }

    /* GET ATTRIBUTE LIST  */
    getAttributeList() {
        this._teamboxService.getAttributeList(this.spid).subscribe((response: any) => {
            if (response) {
                let attributeListData = response?.result;
                this.attributesList = attributeListData.map(
                    (attrList: any) => attrList.displayName
                );
            }
        });
    }

    toggleInfoIcon() {
        this.showInfoIcon = !this.showInfoIcon;
      }

      getLimitedMessageText(message: string) {
        let maxLength = 30;
        if(message) {
            if (message.length <= maxLength) {
                return message;
                } 
            else {
                return message.substring(0, maxLength) + '...';
                }
        }
    }

    
onContentChange() {
    //const text = this.chatEditor?.value;
    const container = document.createElement('div');
    container.innerHTML = this.chatEditor?.value;
    const text = container.innerText;
    //this.processText(text);
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g; 
    const characterCount = text?.replace(emojiRegex, '__').length || 0; 
    if (characterCount > 1024) {
      const trimmedContent = this.trimContent(text, characterCount);
      this.chatEditor.value = trimmedContent;
    } 
  }

// #region Process Text for Value Mapping
//   processText(text: string){
//     this.valuesMap.clear();
//     const headerText = document.getElementById('headerText') as HTMLInputElement;
//     if(headerText.value) text += headerText.value;
//     const customValueRegex = /{{var(\d+)}}/g;
//     let match;
    
//     while ((match = customValueRegex.exec(text)) !== null) {
//       const num = parseInt(match[1], 10);
//       this.valuesMap.set(num, `var${num}`);
//     }

//     let sortedEntries = Array.from(this.valuesMap.entries()).sort((a, b) => a[0] - b[0]);
//     this.valuesMap = new Map(sortedEntries);
//   }
// #endregion

  trimContent(text: string, characterCount: number): string {
    const emojisToAdd = 1; 
    const extraCharacters = characterCount - 1024 + emojisToAdd;
    let trimmedText = text.substr(0, text.length - extraCharacters);
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/;
    if (emojiRegex.test(trimmedText)) {
      trimmedText = trimmedText.slice(0, -2);
    }
    return trimmedText;
  }
  
addCustomAttribute(){
     this.customValue = `var${this.countValue}`
     this.countValue++;
}

//   addCustomAttribute(){
//     if (this.valuesMap.size == 0) {
//         this.valuesMap.set(1, `var${1}`);
//         return;
//     }
//     this.valuesMap.forEach((value, key) => {
//         if (key == this.countValue ) {
//             this.countValue++
//         }
//     });
//     this.valuesMap.set(this.countValue,`var${this.countValue}`);
//     this.customValue = `var${this.countValue}`
//     this.countValue = 1;
//   }
}
