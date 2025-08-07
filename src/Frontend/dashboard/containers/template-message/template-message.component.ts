import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { newTemplateFormData, quickReplyButtons, templateMessageData,} from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { TeamboxService } from 'Frontend/dashboard/services';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ToolbarService, LinkService, ImageService, EmojiPickerService, CountService} from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
import { faSmileWink } from '@fortawesome/free-solid-svg-icons';
import { PhoneValidationService } from 'Frontend/dashboard/services/phone-validation.service';
import { environment } from 'environments/environment';
import { InteractiveButtonPayload, InteractiveMessagePayload } from 'Frontend/dashboard/models/interactiveButtons.model';
import { ToastService } from 'assets/toast/toast.service';
 import { BehaviorSubject, interval, Subscription } from 'rxjs';
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
    selectedType: string = '';
    selectedPreview: string = '';
    metaUploadedId: string = '';
    showCampaignDetail: boolean = false;
    showGalleryDetail: boolean = false;
    showInfoIcon:boolean = false;
    isHeaderAttribute:boolean = false;
    templatesData = [];
    galleryData = [];
    allVariablesList:string[] =[];
    allVariablesValueList:any[] =[];
    templateFlows:any =[];
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
    public placeholderText = 'Enter full URL for https://www.example.com/{{1}}';
    public channelDomain:string = environment?.chhanel;
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
        // { value: 3, label: 'Authentication', checked: false },
        { value: 1, label: 'Marketing', checked: false },
        { value: 2, label: 'Utility', checked: false },
    ];
    filterListChannel = [
        { value: 1, label: 'WA API', checked: false },
        { value: 2, label: 'WA Web', checked: false },
    ];
    filterListLanguage = [
        { label: 'English', code: 'en', checked: false },
        { label: 'Afrikaans', code: 'af', checked: false },
        { label: 'Albanian', code: 'sq', checked: false },
        { label: 'Arabic', code: 'ar', checked: false },
        { label: 'Azerbaijani', code: 'az', checked: false },
        { label: 'Bengali', code: 'bn', checked: false },
        { label: 'Bulgarian', code: 'bg', checked: false },
        { label: 'Catalan', code: 'ca', checked: false },
        { label: 'Chinese (CHN)', code: 'zh_CN', checked: false },
        { label: 'Chinese (HKG)', code: 'zh_HK', checked: false },
        { label: 'Chinese (TAI)', code: 'zh_TW', checked: false },
        { label: 'Croatian', code: 'hr', checked: false },
        { label: 'Czech', code: 'cs', checked: false },
        { label: 'Danish', code: 'da', checked: false },
        { label: 'Dutch', code: 'nl', checked: false },
        { label: 'English (UK)', code: 'en_GB', checked: false },
        { label: 'English (US)', code: 'en_US', checked: false },
        { label: 'Estonian', code: 'et', checked: false },
        { label: 'Filipino', code: 'fil', checked: false },
        { label: 'Finnish', code: 'fi', checked: false },
        { label: 'French', code: 'fr', checked: false },
        { label: 'Georgian', code: 'ka', checked: false },
        { label: 'German', code: 'de', checked: false },
        { label: 'Greek', code: 'el', checked: false },
        { label: 'Gujarati', code: 'gu', checked: false },
        { label: 'Hausa', code: 'ha', checked: false },
        { label: 'Hebrew', code: 'he', checked: false },
        { label: 'Hindi', code: 'hi', checked: false },
        { label: 'Hungarian', code: 'hu', checked: false },
        { label: 'Indonesian', code: 'id', checked: false },
        { label: 'Irish', code: 'ga', checked: false },
        { label: 'Italian', code: 'it', checked: false },
        { label: 'Japanese', code: 'ja', checked: false },
        { label: 'Kannada', code: 'kn', checked: false },
        { label: 'Kazakh', code: 'kk', checked: false },
        { label: 'Kinyarwanda', code: 'rw_RW', checked: false },
        { label: 'Korean', code: 'ko', checked: false },
        { label: 'Kyrgyz (Kyrgyzstan)', code: 'ky_KG', checked: false },
        { label: 'Lao', code: 'lo', checked: false },
        { label: 'Latvian', code: 'lv', checked: false },
        { label: 'Lithuanian', code: 'lt', checked: false },
        { label: 'Macedonian', code: 'mk', checked: false },
        { label: 'Malay', code: 'ms', checked: false },
        { label: 'Malayalam', code: 'ml', checked: false },
        { label: 'Marathi', code: 'mr', checked: false },
        { label: 'Norwegian', code: 'nb', checked: false },
        { label: 'Persian', code: 'fa', checked: false },
        { label: 'Polish', code: 'pl', checked: false },
        { label: 'Portuguese (BR)', code: 'pt_BR', checked: false },
        { label: 'Portuguese (POR)', code: 'pt_PT', checked: false },
        { label: 'Punjabi', code: 'pa', checked: false },
        { label: 'Romanian', code: 'ro', checked: false },
        { label: 'Russian', code: 'ru', checked: false },
        { label: 'Serbian', code: 'sr', checked: false },
        { label: 'Slovak', code: 'sk', checked: false },
        { label: 'Slovenian', code: 'sl', checked: false },
        { label: 'Spanish', code: 'es', checked: false },
        { label: 'Spanish (ARG)', code: 'es_AR', checked: false },
        { label: 'Spanish (SPA)', code: 'es_ES', checked: false },
        { label: 'Spanish (MEX)', code: 'es_MX', checked: false },
        { label: 'Swahili', code: 'sw', checked: false },
        { label: 'Swedish', code: 'sv', checked: false },
        { label: 'Tamil', code: 'ta', checked: false },
        { label: 'Telugu', code: 'te', checked: false },
        { label: 'Thai', code: 'th', checked: false },
        { label: 'Turkish', code: 'tr', checked: false },
        { label: 'Ukrainian', code: 'uk', checked: false },
        { label: 'Urdu', code: 'ur', checked: false },
        { label: 'Uzbek', code: 'uz', checked: false },
        { label: 'Vietnamese', code: 'vi', checked: false },
        { label: 'Zulu', code: 'zu', checked: false }
      ]
    filterListStatus = [
        { value: 0, label: 'draft', checked: false },
        { value: 1, label: 'APPROVED', checked: false },
        { value: 2, label: 'PENDING', checked: false },
        { value: 3, label: 'REJECTED', checked: false },
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


  @ViewChild('btnPopupContainer') btnPopupContainer!: ElementRef;
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
    buttonsArray:any[] =[];
    channel='whapi'; // todo make it dynamic
    isPopupVisible:boolean = false;
    isAllButtonPopupVisible:boolean = false;
    channelQualityTooltip:boolean = false;
    

  @ViewChild('popupContainer') popupContainer!: ElementRef;

    constructor(public apiService: SettingsService,
        private renderer: Renderer2,
        private phoneValidationService: PhoneValidationService,
        public settingsService: SettingsService, private _teamboxService: TeamboxService, public cdr : ChangeDetectorRef, public toast: ToastService) {
            this.countryCodeList = this.apiService.countryCodes;
        }

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
        }, 6000);
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
        //$('#newTemplateMessage').modal('hide');
    }


    onEditorChange(value:any) {
        this.newTemplateForm.get('BodyText')?.setValue(value);
    }
intervalSub!: Subscription;
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
        this.getFlowList();
        this.getWhatsAppDetails();
    }
   updateRenderedButton() {
     this.buttonStream.next([...this.renderedButtons]);
  }
// ngOnDestroy() {
//   this.intervalSub?.unsubscribe();
// }
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
            categoryChange: new FormControl(null, [Validators.required]),
            Language: new FormControl('English', [Validators.required]),
            media_type: new FormControl(null),
            Header: new FormControl(null,this.noEmojiValidator),
            Links: new FormControl(null),
            BodyText: new FormControl('', [Validators.required]),
            FooterText: new FormControl('',this.noEmojiValidator),
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



    setSelectedCategory(index: number) {
        this.selectedCategory = index;
    }


    showMessageType() {
        // this.selectedType = type;
                debugger;
        this.newTemplateForm.get('Links')?.setValue(null);
        this.newTemplateForm.get('Header')?.setValue('');
        this.selectedPreview = '';
        this.interactiveButtonsPayload = '';
        this.buttonStream.next([]);
        this.renderedButtons = [];
        this.selectedButtons = [];
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

			else if ((mediaType == 'image/jpg' || mediaType == 'image/jpeg' || mediaType == 'image/png') && fileSizeInMB > imageSizeInMB) {
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

    onFileChange(event: any,type:any) {
        let files: FileList = event.target.files;
        if(type=='video'){
            if(files[0]?.type == 'video/mp4')
                this.saveVideoAndDocument(files);
            else
                this.showToaster('Only MP4 files are allowed!','error')
        } else if(type=='image'){
            if(files[0]?.type == 'image/jpeg' || files[0]?.type == 'image/png'  || files[0]?.type == 'image/jpg')
                this.saveVideoAndDocument(files);
            else
                this.showToaster('Only jpeg,png,jpg files are allowed!','error')
        }
        else if(type=='doc'){
            if(files[0]?.type == 'application/pdf')
                this.saveVideoAndDocument(files);
            else
                this.showToaster('Only PDF files are allowed!','error')
        }
        
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


    toggleGalleryData(data: any) {
        this.showGalleryDetail = !this.showGalleryDetail;
        if(this.showGalleryDetail) {
            this.galleryMessageData = data;
            if (this.galleryMessageData?.buttons && typeof this.galleryMessageData.buttons === 'string') {
                const fixedJson = this.galleryMessageData?.buttons.replace(/'/g, '"'); 
                try {
                  this.galleryMessageData.buttons = JSON.parse(fixedJson);
                } catch (error) {
                  console.error("Invalid JSON format for buttons:", error);
                }
              }
            this.status= 'saved';
            this.BodyText = this.galleryMessageData.BodyText;
            this.selectedType = this.galleryMessageData.media_type;
            this.selectedPreview = this.galleryMessageData.Links;

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
            if(this.templatesMessageData?.buttons)
            this.templatesMessageData.buttons = JSON.parse(this.templatesMessageData?.buttons)
        } else {
            this.templatesMessageDataById = null;
            this.status= 'saved';
            this.BodyText='';
            this.selectedType ='text';
            this.selectedPreview='';
            this.newTemplateForm.reset();
            this.newTemplateForm.clearValidators();
        }
    }

    getTemplatesData() {
        this.apiService.getTemplateData(this.spid, 1).subscribe(response => {
            this.isLoading = false;
            this.templatesData = response.templates;
            this.filteredTemplatesData = this.templatesData;
        });

        this.apiService.getTemplateDataForGallery(0, 2, this.channelDomain).subscribe(response => {
            this.galleryData = response.templates;
            this.filteredGalleryData = this.galleryData;
        });
    }

    updateFilter(event: any, filter: any) {
        if (event.target.checked) {
            filter['checked'] = true;
            let isChecked = filter.label
        } else {
            filter['checked'] = false;
        }
    }

    onCategoryChange(event: any) {
        const selectedCategory = this.newTemplateForm.get('Category')?.value;
        this.Category = selectedCategory;
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
        this.showMessageType()
        this.templatesMessageData.media_type = "text";
        const selTextRadio = document.getElementById('sel-text') as HTMLInputElement;
        if (selTextRadio) {
          selTextRadio.checked = true;
        }
    }
    saveTemplateNextStep() {
        let val = this.newTemplateForm.get('TemplateName')?.value;
        
    let temp:any = this.templatesData.filter((item:any) => item.TemplateName == val)[0];
    if(temp && this.id != temp?.ID){
    this.showToaster('Template already exist with this name !','error');
    }else{
      this.TemplateName = this.newTemplateForm.get('TemplateName')?.value;
      const Channel =  this.newTemplateForm.get('Channel')?.value;
      const Category =  this.newTemplateForm.get('Category')?.value;
      const categoryChange =  this.newTemplateForm.get('categoryChange')?.value;
      const Language = this.newTemplateForm.get('Language')?.value;
      console.log(Language);
      console.log(this.newTemplateForm.get('categoryChange')?.value)

    if(this.TemplateName && Channel && Category && Language && categoryChange) {
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
    if(temp && this.id != temp?.ID)
    this.showToaster('Template already exist with this name !','error');
    
    }

    saveNewTemplate() {
        if (this.newTemplateForm.valid) {
            const newTemplateFormData = this.createNewTemplateFormData();
            this.isLoading = true;
            this.selectedPreview = this.selectedPreview ? this.selectedPreview : '';
            if ((this.templatesMessageDataById = null)) {
                this.apiService
                    .saveNewTemplateData(newTemplateFormData, this.selectedPreview)
                    .subscribe(response => {                        
                        this.isLoading = false;
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
                            this.showToaster('Template saved successfully','success');
                        }
                        else{
                            this.showToaster('Attention! Template submission not approved by Meta. Please follow template creation guidelines. Refer to the link given on the template creation page.','error')
                        }
                    });
            } else {
                this.apiService
                    .saveNewTemplateData(newTemplateFormData, this.selectedPreview)
                    .subscribe(response => {
                        this.isLoading = false;
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
                            this.showToaster('Template saved successfully','success');
                        }
                        else{
                            this.showToaster('Attention! Template submission not approved by Meta. Please follow template creation guidelines. Refer to the link given on the template creation page.','error')
                        }
                    });
            }
        } else {
            alert('!Please fill the required details in the form First');
        }
    }

    confirmsave() {
        if(!this.CheckVariable()){
            this.status = 'saved';
            $('#newTemplateMessage').modal('hide');
            $('#newTemplateMessagePreview').modal('hide');
            $('#confirmationModal').modal('show');
            this.showCampaignDetail =false;
        }
    }
    cancelSave(){
        $('#confirmationModal').modal('hide');
        $('#newTemplateMessagePreview').modal('show');

    }

    onInputChange(event: any) {
        console.log(event);
        let inputValue = event.target.value;
        inputValue = inputValue.replace(/\s+/g, '_')  
                               .toLowerCase()         
                               .replace(/[^a-z0-9_]/g, ''); 
        event.target.value = inputValue;
        this.newTemplateForm.get('TemplateName')?.setValue(inputValue);
      }

    saveAsDraft() {
        if(!this.CheckVariable()){
            this.status = 'draft';
            this.saveNewTemplate();
        }
    }

    copyTemplate() {
        console.log(this.templatesMessageDataById)
        let nameExist = this.filteredTemplatesData.filter((item:any)=>item.TemplateName == (this.templatesMessageDataById.TemplateName +'_copy'));
        if(nameExist.length ==0){
        const copyTemplateForm: newTemplateFormData = <newTemplateFormData>{};
        copyTemplateForm.ID = 0;
        copyTemplateForm.spid = this.templatesMessageDataById.spid;
        copyTemplateForm.created_By = this.templatesMessageDataById.created_By;
        copyTemplateForm.isTemplate = this.templatesMessageDataById.isTemplate;
        copyTemplateForm.media_type = this.templatesMessageDataById.media_type;
        copyTemplateForm.Header = this.templatesMessageDataById.Header;
        copyTemplateForm.Links = this.templatesMessageDataById.Links;
        copyTemplateForm.BodyText = this.templatesMessageDataById.BodyText;
        copyTemplateForm.FooterText = this.templatesMessageDataById.FooterText ? this.wrapWithEmTags(this.templatesMessageDataById.FooterText) :'';
        copyTemplateForm.TemplateName = this.templatesMessageDataById.TemplateName +'_copy';
        copyTemplateForm.Channel = this.templatesMessageDataById.Channel;
        copyTemplateForm.Category = this.templatesMessageDataById.Category;
        copyTemplateForm.category_id = this.templatesMessageDataById.category_id;
        copyTemplateForm.categoryChange = this.templatesMessageDataById.categoryChange;
        copyTemplateForm.Language = this.templatesMessageDataById.Language;
        copyTemplateForm.buttons = JSON.stringify(this.templatesMessageDataById.buttons);
        copyTemplateForm.status = 'draft';
        copyTemplateForm.isCopied = 1;
        copyTemplateForm.template_id = this.templatesMessageDataById.template_id;
        copyTemplateForm.interactiveButtonsPayload= typeof this.templatesMessageDataById?.interactive_buttons == 'string' ? this.templatesMessageDataById?.interactive_buttons : JSON.parse(this.templatesMessageDataById?.interactive_buttons);
        copyTemplateForm.renderedButtons = typeof this.templatesMessageDataById?.renderedButtons == 'string' ? JSON.parse(this.templatesMessageDataById?.renderedButtons) : this.templatesMessageDataById?.renderedButtons;
      //  if(this.templatesMessageDataById.Category=='WA API') {
            copyTemplateForm.template_json = this.templatesMessageDataById?.template_json;

        // }
        // else {
        //     copyTemplateForm.template_json = [];
        // }
        // let nameExist = this.filteredTemplatesData.filter((item:any)=>item.TemplateName == this.templatesMessageDataById.TemplateName +' copy');
        // if(nameExist.length >0){
        //     copyTemplateForm.TemplateName = this.templatesMessageDataById.TemplateName +' copy' + Math.random();
        // }
       
            this.apiService.saveNewTemplateData(copyTemplateForm, this.selectedPreview)
            .subscribe(response => {
               
                if (response) {
                    this.showCampaignDetail=false;
                    this.getTemplatesData();
                }
            });
         }else{            
            this.showToaster('Template name already exists.','error');
         }
        }

         replaceVariable(val:string[]){
            let replacedVariables:any[] =[];
            if(val?.length >0){
            val.forEach((item:any,idx)=>{
                replacedVariables.push(`var${idx+1}`);
            })
        }
        return replacedVariables;

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
        newTemplateForm.FooterText = this.newTemplateForm.controls.FooterText.value ? this.wrapWithEmTags(this.newTemplateForm.controls.FooterText.value):'';
        newTemplateForm.TemplateName = this.newTemplateForm.controls.TemplateName.value;
        newTemplateForm.Channel = this.newTemplateForm.controls.Channel.value;
        newTemplateForm.categoryChange = this.newTemplateForm.controls.categoryChange.value;
        newTemplateForm.Category = this.Category;
        newTemplateForm.category_id = this.category_id;
        newTemplateForm.Language = this.newTemplateForm.controls.Language.value;
        newTemplateForm.status = this.status == 'saved'? this.newTemplateForm.controls.Channel.value == 'WA API' ? 'pending':this.status: this.status;
        newTemplateForm.template_id = 0;
        newTemplateForm.isCopied = 0;
        newTemplateForm.template_json = [];
        newTemplateForm.interactiveButtonsPayload= JSON.stringify(this.interactiveButtonsPayload);
        newTemplateForm.renderedButtons = JSON.stringify(this.renderedButtons);
        
        if(this.newTemplateForm.controls.Channel.value == 'WA API') {
            let buttons:any[] =[];
            let headerAtt = this.getVariables(this.newTemplateForm.controls.Header.value, "{{", "}}", true);
             headerAtt = this.replaceVariable(headerAtt);
            let bodyAtt = this.getVariables(this.newTemplateForm.controls.BodyText.value, "{{", "}}",true);
             bodyAtt = this.replaceVariable(bodyAtt);
            let header_text;
            let body_text;
             if(this.buttonsArray.length > 0) {
            newTemplateForm.buttons =JSON.stringify(this.buttonsArray);
                for(let item of this.buttonsArray){
                    let btn ={};
                if(item?.type =='Call Phone') {
                    let formattedPhoneNumber = parsePhoneNumberFromString(`${item.code} ${item.phoneNumber}`);
                    let phoneNumber = formattedPhoneNumber ? formattedPhoneNumber.formatInternational().replace(/[\s+]/g, ''): '';
                    console.log(phoneNumber)
                    btn = {
                        type: 'PHONE_NUMBER',
                        text: item.buttonText,
                        phone_number: phoneNumber,
                    };
                }
                else if(item?.type =='Quick Reply') {
                    btn = {
                        type: 'QUICK_REPLY',
                        text: item.buttonText
                    };
                }
                else if(item?.type =='Copy offer Code') {
                    btn = {
                        type: 'COPY_CODE',
                        example: item.code
                    };
                }
                else if(item?.type =='Complete Flow') {
                    btn = {
                        type: 'FLOW',
                        text: item.buttonText,
                        flow_id: item.flowId,
                        // flow_json: "<FLOW_JSON>", 
                        // flow_action: "<FLOW_ACTION>",
                        // navigate_screen: "<NAVIGATE_SCREEN>"
                    };
                }                
                else if(item?.type =='Visit Website') {
                    if(item?.webType != 'Static'){
                    btn = {
                        type: 'URL',
                        text: item.buttonText,
                        url: item.webUrl +'{{1}}',
                        example: [item.webUrlSample]
                    };
                }
                    else{
                    btn = {
                        type: 'URL',
                        text: item.buttonText,
                        url: item.webUrl,
                    };
                }
                }
                buttons.push(btn);
            }
        }
            let headerMedia ={};
            if(this.selectedType != 'text'){
                 headerMedia = {
                        header_handle: [this.metaUploadedId]
            }            
        }
        let comp:any =  [];
         comp =  [
            {
                type: 'HEADER',
                format: this.selectedType,
                [this.selectedType =='text' ?'text' :'example' ]: this.selectedType =='text' ? this.replaceBracesWithNumbers(this.newTemplateForm.controls.Header.value) : headerMedia,
            },
            {
                type: 'BODY',
                text: this.replaceBracesWithNumbers(this.newTemplateForm.controls.BodyText.value),
            },
            {
                type: 'FOOTER',
                text: this.newTemplateForm.controls.FooterText.value,
            },
           
        ]
        if(headerAtt && headerAtt.length > 0){
            header_text ={ "header_text": headerAtt}
            comp[0]['example'] = header_text
        }
        if(bodyAtt && bodyAtt.length >0){
            body_text ={ "body_text": [bodyAtt]}
            comp[1]['example'] = body_text
        }
        if(!comp[2]['text']){
            comp.splice(2,1);
        }
        if(!(comp[0]['text'] || comp[0]['example']) || this.selectedType ==''){
            comp.splice(0,1);
        }
        if(buttons.length > 0){
            comp.push( {
                type: 'BUTTONS',                       
                buttons:buttons                
            });
        }
            newTemplateForm.template_json.push({
                name: this.newTemplateForm.controls.TemplateName.value,
                category: this.newTemplateForm.controls.Category.value,
                allow_category_change: this.newTemplateForm.controls.categoryChange.value == 'Yes' ? true : false,
                language: this.filterListLanguage.filter((item:any)=> item.label == this.newTemplateForm.controls.Language.value)[0]?.code,
                components:comp
                
            });

        }   
        return newTemplateForm;
    }

    replaceBracesWithNumbers(text: string): string {
        if(text){
        let counter = 1;
        return text.replace(/{{.*?}}/g, () => {
          return `{{${counter++}}}`; 
        });
    } else
        return '';
      }
    
    patchFormValue() {
        const data = this.templatesMessageData;
        const databyid = this.templatesMessageData;
        let ID = databyid.ID;
        for (let prop in data) {
            let value = data[prop as keyof typeof data];
            if (this.newTemplateForm.get(prop)){
                console.log(prop)
                if(prop == 'FooterText'){
                    let val = value.replace('<em>','').replace('</em>','');
                    this.newTemplateForm.get(prop)?.setValue(val);
                }else{
                this.newTemplateForm.get(prop)?.setValue(value);
                }
            }
            this.id = ID;
        }
        console.log('2')
        this.selectedType = this.templatesMessageData?.media_type;
        this.selectedPreview = this.templatesMessageData.Links;
        this.buttonsArray = this.templatesMessageData?.buttons ? this.templatesMessageData?.buttons : [];
        this.interactiveButtonsPayload = this.templatesMessageData?.interactive_buttons ? JSON.parse(this.templatesMessageData?.interactive_buttons) : [];
        this.renderedButtons = this.templatesMessageData?.renderedButtons ? JSON.parse(this.templatesMessageData?.renderedButtons) : [];
        this.updateRenderedButton();
        if(this.templatesMessageData?.Links){
            this.fileName = this.extractActualFileName(this.templatesMessageData?.Links);
        }
        this.onCategoryChange('');
    }
    // for gallery form
    patchGalleryFormValue() {
        const galleryData = this.galleryMessageData;
        this.buttonsArray =[];
        if (galleryData.buttons && galleryData.buttons.length > 0) {
            let type: string = '', buttonText: string = '', webUrl: string = '', phoneNumber: string = '', code: string = '', flowId: string = '';
            
            galleryData.buttons.forEach((button: any, index:any) => {
                buttonText = button?.buttonText;
                type = button?.type;
                code = button?.code;
                phoneNumber = button?.phoneNumber;
                if(button?.type == 'URL'){
                    buttonText = button?.text;
                    webUrl = button?.url;
                    type = 'Visit Website';
                }
                this.addButtonsPatch(type || '', buttonText || '', webUrl || '', phoneNumber || '', code || '', flowId || '');
            });
        }
        
        let ID = this.galleryMessageData.ID;
        for (let prop in galleryData) {
            let value = galleryData[prop as keyof typeof galleryData];
            if (this.newTemplateForm.get(prop)){
                if(prop == 'TemplateName')
                    this.newTemplateForm.get(prop)?.setValue((value.replaceAll(' ','')).toLowerCase());
                else
                    this.newTemplateForm.get(prop)?.setValue(value);
            }
        }
        this.id = 0;
        this.newTemplateForm.get('Channel')?.setValue(null);
        this.newTemplateForm.get('media_type')?.setValue(this.galleryMessageData?.media_type ? this.galleryMessageData?.media_type : 'text');
        this.selectedType = this.galleryMessageData?.media_type ? this.galleryMessageData?.media_type : 'text';
        this.Category = this.galleryMessageData?.Category;
        this.selectTab(0)

    }

    copyTemplatesData() {
        $('#newTemplateMessageFirst').modal('show');
        this.patchFormValue();
    }
    // copyCampaign() {
    //     this.editQuickResponse();
    //     this.ID = 0;
    //     this.usertemplateForm.controls.Header.setValue('Copied ' + this.repliestemplateData.Header);
    //     let nameExist = this.initTemplates.filter((item:any)=>item.TemplateName == ('Copied ' + this.repliestemplateData.Header));
    //           if(nameExist.length >0){
    //             this.usertemplateForm.controls.Header.setValue((`Copied_${Math.random()} ` + this.repliestemplateData.Header));
    //           }
    //     this.saveTemplate();
    //   }
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
        //$('#newTemplateMessage').modal('show');
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
            setTimeout(() => {
                this.onContentChange();
            }, 300); 
        }
        this.closeAtrrModal();
    }

    
insertAtCursor(selectedValue: any) {
  const spaceNode = document.createElement('span');
  spaceNode.innerHTML = '&nbsp;'; 
  spaceNode.setAttribute('contenteditable', 'false');
    this.lastCursorPosition?.insertNode(spaceNode);
    setTimeout(() => {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStartAfter(spaceNode);  
        range.setEndAfter(spaceNode); 

        selection?.removeAllRanges();
        selection?.addRange(range);
    }, 100);
	const newNode = document.createElement('span');
	newNode.innerHTML =  '<span contenteditable="false" class="e-mention-chip"><a _ngcontent-yyb-c67="" title="">{{'+selectedValue+'}}</a></span>';
	this.lastCursorPosition?.insertNode(newNode);
    setTimeout(()=>{
        document.execCommand('bold');
        //document.execCommand('bold');
    },200)
}

triggerRichTextEditorChange() {
    const editorElement = this.chatEditor?.element;
    if (editorElement) {
      console.log('Triggering change event');
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      editorElement.dispatchEvent(changeEvent);
    } else {
      console.error('Editor element not found');
    }
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
    

    async previewTemplate() {
        let valid = await this.validateRenderedButtons(this.renderedButtons)
        if(!valid){
           this.toast.error('Buttons text should not be empty');
           return;
        }
        if(this.renderedButtons && this.renderedButtons.length > 0){
            let rawPayload = this.generateInteractivePayload('');
            this.interactiveButtonsPayload =this.sanitizeInteractivePayload(rawPayload);
        } else this.interactiveButtonsPayload = [];
    
        this.allVariablesValueList =[];
        console.log(this.newTemplateForm.controls.BodyText.value);
        if(this.validateItems()){
        let isVariableValue:string = this.newTemplateForm.controls.Header.value + this.newTemplateForm.controls.BodyText.value ;

		if (isVariableValue) {
		  this.allVariablesList = this.getVariables(isVariableValue, "{{", "}}");
          let dynamicWeb= this.buttonsArray.filter((item:any)=> (item?.type =='Visit Website' && item?.webType !='Static'))
        //   if(dynamicWeb?.length > 0)
        //     this.allVariablesList.push('{{url}}');
          this.allVariablesList.forEach((item:any)=>{
            this.allVariablesValueList.push({var:item,val:''});
          })
          $('#newTemplateMessage').modal('hide');
          $('#newTemplateMessagePreview').modal('show');
      };
    }

    }
sanitizeInteractivePayload(payload: any): any {
  if (!payload || typeof payload !== 'object') return {};

  // Clone payload to avoid mutating original
  const cleanPayload = { ...payload };

  // Sanitize action.buttons
  if (cleanPayload.action?.buttons) {
    const buttons = cleanPayload.action.buttons;

    // Remove empty array or empty strings in array (optional)
    const validButtons = buttons.filter(
      (btn: any) => btn && typeof btn === 'object' && btn.title?.trim()
    );

    if (validButtons.length) {
      cleanPayload.action.buttons = validButtons;
    } else {
      delete cleanPayload.action.buttons;
    }
  }

  // If action becomes empty after cleaning
  if (cleanPayload.action && Object.keys(cleanPayload.action).length === 0) {
    delete cleanPayload.action;
  }

  return cleanPayload;
}
    
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

    getFlowList() {
        this.settingsService.getFlowData(this.spid).subscribe((response: any) => {
            if (response) {
                console.log(response);
                this.templateFlows =  response?.flows;
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
    const container = document.createElement('div');
    container.innerHTML = this.chatEditor?.value;
    console.log(this.chatEditor?.value);
    const text = container.innerText;
    //this.processText(text);
    this.onEditorChange(this.chatEditor?.value)
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

addButtons(type: string) {
    const button = this.createButton(type);
    if(this.buttonsArray.length>0){

    if (type === 'Quick Reply') {
        const firstNonQuickReplyIndex = this.buttonsArray.findIndex(item => item.type !== 'Quick Reply');

        if (this.buttonsArray[0].type === 'Quick Reply') {
            this.buttonsArray.splice(firstNonQuickReplyIndex, 0, button);
//            this.buttonsArray.push(button);
        } else {
            this.buttonsArray.push(button);
        }
    } else {
        const lastQuickReplyIndex = this.buttonsArray.reduce((lastIndex, item, index) =>
            item.type === 'Quick Reply' ? index : lastIndex, -1);
            const firstNonQuickReplyIndex = this.buttonsArray.findIndex(item => item.type !== 'Quick Reply');
        if (this.buttonsArray[0].type != 'Quick Reply') {
            this.buttonsArray.splice(firstNonQuickReplyIndex, 0, button);
        } else {
            this.buttonsArray.push(button);
        }
    }
}else{
    this.buttonsArray.push(button);
}
    this.isPopupVisible = false;
}

// addButtons(type:string){
//     if(type =='Quick Reply')
//         this.buttonsArray.push({type:type,buttonText:''});
//     else if(type =='Call Phone')
//         this.buttonsArray.push({type:type,buttonText:'',code:'',phoneNumber:'',displayPhoneNumber:''});
//     else if(type =='Copy offer Code')
//         this.buttonsArray.push({type:type,buttonText:'Copy Offer Code',code:''});
//     else if(type =='Complete Flow')
//         this.buttonsArray.push({type:type,buttonText:'',flowId:''});
//     else if(type =='Visit Website')
//         this.buttonsArray.push({type:type,buttonText:'',webUrl:'',webType:'Static',webUrlSample:''});

//     this.isPopupVisible = false;
// }

createButton(type: string) {
    switch (type) {
        case 'Quick Reply':
            return { type: type, buttonText: '' };
        case 'Call Phone':
            return { type: type, buttonText: '', code: 'IN +91', phoneNumber: '', displayPhoneNumber: '' };
        case 'Copy offer Code':
            return { type: type, buttonText: 'Copy Offer Code', code: '' };
        case 'Complete Flow':
            return { type: type, buttonText: '', flowId: '' };
        case 'Visit Website':
            return { type: type, buttonText: '', webUrl: '', webType: 'Static', webUrlSample: '' };
        default:
            return {};
    }
}
// openButtonPopUp() {
//     this.isPopupVisible = !this.isPopupVisible;

//     // Close the popup if a click happens outside of it
//     // if (this.isPopupVisible) {
//     //   this.renderer.listen('window', 'click', (event: Event) => {
//     //     if (!this.popupContainer?.nativeElement?.contains(event.target)) {
//     //       //this.isPopupVisible = false;
//     //     }
//     //   });
//     // }
//   }

  isDisableButton(type:any){
    let isFlow = this.buttonsArray.filter((item:any)=>item?.type == 'Complete Flow')?.length > 0;
    if(type =='Quick Reply' ){
        if(this.buttonsArray.length == 10 || isFlow)
            return true;
        else
            return false;
    }
    else if(type =='Call Phone'){
        let isExist = this.buttonsArray.filter((item:any)=>item?.type == 'Call Phone')?.length > 0;
        if(this.buttonsArray.length == 10 || isExist || isFlow)
            return true;
        else
            return false;
    }
    else if(type =='Copy offer Code'){
        let isExist = this.buttonsArray.filter((item:any)=>item?.type == 'Copy offer Code')?.length > 0;
        if(this.buttonsArray.length == 10 || isExist || isFlow)
            return true;
        else
            return false;
    }
    else if(type =='Complete Flow'){
        if(this.buttonsArray.length > 0 || isFlow)
            return true;
        else
            return false;
    }
    else if(type =='Visit Website'){
        let isExist = this.buttonsArray.filter((item:any)=>item?.type == 'Visit Website')?.length > 1;
        if(this.buttonsArray.length == 10 || isFlow || isExist)
            return true;
        else
            return false;
    }
  }

  removeQuickReplyButtons(index: any) {
    console.log(index);
      this.buttonsArray.splice(index, 1);
  }

  noEmojiValidator(control: AbstractControl): ValidationErrors | null {
    //const emojiRegex = /[\p{Emoji}\u200D\uFE0F]/gu; // Regex for emojis
    // New Regex Category for the emoji that ejs-richtexteditor give us
    const emojiRegex = /([\u231A-\u231B]|\u23E9-\u23F3|\u23F8-\u23FA|[\u24C2\u25AA-\u25FE]|\u2600-\u27BF|[\uD83C-\uDBFF][\uDC00-\uDFFF])/g;
    if (control.value) {
      const sanitizedValue = control.value.replace(emojiRegex, '');
      if (sanitizedValue !== control.value) {
        control.setValue(sanitizedValue, { emitEvent: false }); // Set sanitized value
      }
    }
    return null; // Return no error for validator
  }

  sanitizeInput(event: string, idx:any, col: any): void {
   // const emojiRegex = /[\p{Emoji}\u200D\uFE0F]/gu; // Regex for emojis
   const emojiRegex = /([\u231A-\u231B]|\u23E9-\u23F3|\u23F8-\u23FA|[\u24C2\u25AA-\u25FE]|\u2600-\u27BF|[\uD83C-\uDBFF][\uDC00-\uDFFF])/g;
    if (event) {
      const sanitizedValue = event.replace(emojiRegex, '');
      if (sanitizedValue !== event) {
        event = sanitizedValue;
        this.showToaster('Emoji not allowed', 'error');
        setTimeout(() => {
            this.buttonsArray[idx][col] = sanitizedValue;
          });
      }
    }
  }
  
  countTagOccurrence = (str: string, tag: string) => str.split(tag).length - 1;

  validateItems():boolean {
    let validationErrors = ''; 
    const buttonTextSet = new Set<string>();
    const urlPattern = /^(https?:\/\/).*\.[a-z]{2,}$/i;
    if(this.countTagOccurrence(this.newTemplateForm.controls.BodyText.value, "<br>") > 1 && this.channelDomain == 'api'){
        validationErrors += "Body should not have empty lines.";
    }
    this.buttonsArray.forEach((item, index) => {
      if (!item.buttonText) {
        validationErrors = validationErrors + '<br>'+ `Button ${index + 1}: 'buttonText' is required.`;
      }
      if (item.type === 'Visit Website') {
        if (!item.webUrl) {
            validationErrors= validationErrors + '<br>'+ `Button ${index + 1}: 'webUrl' is required for Visit Website button.`;
          } 
        //   else if (!urlPattern.test(item.webUrl)) {
        //     validationErrors= validationErrors + '<br>'+ `Button ${index + 1}: 'webUrl' must start with http:// or https:// and end with a valid TLD.`;
        //   }
      }
      if (item.type === 'Call Phone') {
        console.log(item);
        if (!item.code) {
          validationErrors = validationErrors + '<br>'+ `Button ${index + 1}: 'code' is required for Call Phone button.`;
        }
        if (!item.phoneNumber) {
          validationErrors = validationErrors + '<br>'+ `Button ${index + 1}: 'Phone Number' is required for Call Phone button.`;
        }
        if(item.code && item.phoneNumber){
            let phoneLength = this.phoneValidationService?.getPhoneNumberLength(item?.code);
            if(phoneLength != item?.phoneNumber?.length){
                validationErrors = validationErrors + '<br>'+ `Button ${index + 1}: 'Phone Number' Length is incorrect`;
            }
        }
      }
      if (item.type === 'Copy offer Code' && !item.code) {
        validationErrors = validationErrors + '<br>'+ `Button ${index + 1}: 'code' is required for Copy offer Code button.`;
      }
      if (item.buttonText && buttonTextSet.has(item.buttonText)) {
        validationErrors = validationErrors + '<br>'+ `Button ${index + 1}: Duplicate 'buttonText' value '${item.buttonText}' detected.`;
      } else {
        buttonTextSet.add(item.buttonText);
      }
      //if()
    //   if(this.newTemplateForm.controls.BodyText.value.includes('<br>') && this.channelDomain == 'api'){
    //     validationErrors = validationErrors + '<br>'+ `Body should not have empty lines.`;
    //   }

    });
if (validationErrors){
    this.showToaster(validationErrors,'error');
return false;
}
else
return true
    
  }

  addNewTemplate(){
    this.buttonsArray =[];  
    this.renderedButtons = [];  
    this.interactiveButtonsPayload = [];
    this.newTemplateForm.get('Language')?.setValue('English');
     this.updateRenderedButtons(this.renderedButtons);
     this.cdr.detectChanges();
  }
  CheckVariable(){
    let varValue = this.allVariablesValueList.filter((item:any)=> item.val == '');
    if(varValue.length > 0)
        return true;
    else
        return false;
  }


  replaceVariablePreview(val:any){
    // {var:item,val:''}
    let repArray:any[] =[];
    this.allVariablesValueList.forEach((item:any)=>{
        repArray.push({word:item?.var,replaceWord:item?.val})
    })
    const updatedString = this.replaceWordsInSequence(val, repArray);
    return updatedString
  }

  replaceWordsInSequence(str: string, replacements: { word: string; replaceWord: string }[]): string {
    replacements.forEach(({ word, replaceWord }) => {
      if (replaceWord) {
        const regex = new RegExp(`\\b${word}\\b`);
        str = str.replace(word, replaceWord);
      }
    });
  
    return str;
  }

//   replaceWordsInSequence(str: string, replacements: { word: string; replaceWord: string }[]): string {
//     const replacementMap = new Map<string, string[]>();  
//     replacements.forEach(({ word, replaceWord }) => {
//         if (replaceWord) { // Only add non-empty replacements
//           if (!replacementMap.has(word)) {
//             replacementMap.set(word, []);
//           }
//           replacementMap.get(word)!.push(replaceWord);
//         }
//       });
    
//       replacementMap.forEach((replacementList, word) => {
//         const regex = new RegExp(`\\b${word}\\b`, 'g'); 
    
//         str = str.replace(regex, () => {
//           return replacementList.length > 0 ? replacementList.shift()! : word;
//         });
//       });
//     return str;
//   }
  get hasQuickReplyButtons(): boolean {
    console.log(this.buttonsArray);
    if(this.buttonsArray){
        return this.buttonsArray?.some(item => item.type === 'Quick Reply');
    } else{
        return false;
    }
  }
  
  get hasNonQuickReplyButtons(): boolean {
    if(this.buttonsArray){
    return this.buttonsArray?.some(item => item.type !== 'Quick Reply');
} else{
    return true;
}
  }

  showVariableValidation(){
    let varValue = this.allVariablesValueList.filter((item:any)=> item.val == '');
    if(varValue.length > 0)
        this.showToaster('Please fill all variable values','error');
  }

  extractActualFileName(url: string): string {
    if (!url) return '';
    const lastSegment = url.substring(url.lastIndexOf('/') + 1);
    const parts = lastSegment.split('-');
    return parts.slice(6).join('-');
  }

  ensureTrailingSlash(idx:number) {
    if (this.buttonsArray[idx].webUrl && !this.buttonsArray[idx].webUrl.endsWith('/')) {
        this.buttonsArray[idx].webUrl += '/';
    }
  }

  wrapWithEmTags(text:string) {
    if (!/^<em>.*<\/em>$/.test(text)) {
        return `<em>${text}</em>`;
    }
    return text;
}
addButtonsPatch(type: string, buttonText: string , webUrl: string , phoneNumber: string, code: string , flowId: string) {
    const button = this.createButtonPatch(type, buttonText, webUrl, phoneNumber, code, flowId);
    if(this.buttonsArray.length>0){

    if (type === 'Quick Reply') {
        const firstNonQuickReplyIndex = this.buttonsArray.findIndex(item => item.type !== 'Quick Reply');

        if (this.buttonsArray[0].type === 'Quick Reply') {
            this.buttonsArray.splice(firstNonQuickReplyIndex, 0, button);
//            this.buttonsArray.push(button);
        } else {
            this.buttonsArray.push(button);
        }
    } else {
        const lastQuickReplyIndex = this.buttonsArray.reduce((lastIndex, item, index) =>
            item.type === 'Quick Reply' ? index : lastIndex, -1);
            const firstNonQuickReplyIndex = this.buttonsArray.findIndex(item => item.type !== 'Quick Reply');
        if (this.buttonsArray[0].type != 'Quick Reply') {
            this.buttonsArray.splice(firstNonQuickReplyIndex, 0, button);
        } else {
            this.buttonsArray.push(button);
        }
    }
}else{
    this.buttonsArray.push(button);
}
    this.isPopupVisible = false;
}

createButtonPatch(type: string, buttonText: string, webUrl: string, phoneNumber: string, code: string, flowId: string) {
    switch (type) {
        case 'Quick Reply':
            return { type: type, buttonText: buttonText };
        case 'Call Phone':
            return { type: type, buttonText: buttonText, code: 'IN +91', phoneNumber: phoneNumber, displayPhoneNumber: '' };
        case 'Copy offer Code':
        case 'Copy Offer Code':
            return { type: 'Copy offer Code', buttonText: buttonText, code: code };
        case 'Complete Flow':
            return { type: type, buttonText: buttonText, flowId: flowId };
        case 'Visit Website':
            return { type: type, buttonText: buttonText, webUrl: webUrl, webType: 'Static', webUrlSample: '' };
        default:
            return {};
    }
}

openButtonPopUp(event: Event) {
    event.stopPropagation(); // Prevents event bubbling
    this.isPopupVisible = !this.isPopupVisible;
  }
  closeUtilityPopUp() {
    this.interactiveButtonspopup = false;
  }
  openinteractiveButtonPopUp(event: Event) {
       if (this.selectedType !== '' && this.selectedType !== 'text') {
            this.toast.warning('Attention: Buttons are allowed only when the header type is "Text" or "None"');
            return;
        }
     event.stopPropagation(); 
     this.interactiveButtonspopup = !this.interactiveButtonspopup;
  }
  openButtonPopUpWeb(event: Event){
    event.stopPropagation();
    this.isPopupVisible = !this.isPopupVisible;
  }
  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  closeAddButtonsOnOutsideClick(event: Event) {
    if (
      this.isPopupVisible && 
      this.btnPopupContainer && 
      !this.btnPopupContainer.nativeElement.contains(event.target)
    ) {
      this.isPopupVisible = false;
    }
    if(this.interactiveButtonspopup ){
       this.interactiveButtonspopup = false;
    }
  }


    selectedButtons: string[] = [];
    renderedButtons: any[] = [];
    countryCodeList: any = [];
    interactiveButtonspopup!: boolean ;
    interactiveButtonsPayload: any ;
      interactiveButtons: any[] = [
          {
            title: "",
            details: [
              {
                  id: "quick_reply",
                  name: "Quick Reply",
                  icon_path: "../../../../assets/img/settings/reply-arrow.svg",
                  maximum_buttons: 3,
                  enabledButton: [],
                  children: {
                      button_text: '',
                      button_text_length: 25,
                      button_text_placeholder: "e.g. Yes",
                  }
              },  
              {
                  id: "list_messages",
                  name: "List Messages",
                  icon_path: "../../../../assets/img/options-lines.svg",
                  maximum_buttons: 10,
                  enabledButton: [],
                  children: {
                      button_text: '',
                      button_text_length: 25,
                      button_text_placeholder: "e.g. Yes",
                      extra_field: [
                          {
                              id: "row",
                              name: "Row",
                              extra_field_text: '',
                              character_length: 25,
                              placeholder: "e.g. Red"
                          }
                      ]
                  }
              }
            ],
          },
          {
            title: "Call to actions buttons",
            details: [
              {
                  id: "url",
                  name: "URL",
                  icon_path: "../../../../assets/img/settings/open-in-new.svg",
                  maximum_buttons: 1,
                  enabledButton: ["phone"],
                  children: {
                      button_text: '',
                      button_text_length: 25,
                      button_text_placeholder: "e.g. Visit Website",
                      extra_field: [
                          {
                              id: "hyperlink",
                              name: "Website URL",
                              character_length: 2000,
                              extra_field_text: '',
                              placeholder: "e.g. https://www.example.com",
                              type: "static",
                              type_title: "URL type",
                          }
                      ]
                  }
              },
              {
                  id: "phone",
                  name: "Phone",
                  icon_path: "../../../../assets/img/settings/phone-call.svg",
                  maximum_buttons: 1,
                  enabledButton: ["url"],
                  children: {
                      button_text: '',
                      button_text_length: 25,
                      button_text_placeholder: "e.g. Call Us",
                      extra_field: [
                          {
                              id: "phone_number",
                              name: "Phone Number",
                              character_length: 20,
                              extra_field_text: '',
                              placeholder: "e.g. 8627019494",
                              default_value: "IN +91",
                              selected_country_code: "IN +91",
                              dropdown_field: true,
                              dropdown_title: "Country",
                              country_code_list: this.countryCodes,
                          }
                      ]
                  }
              },
              {
                  id: "copy_button",
                  name: "Copy Button",
                  icon_path: "../../../../assets/img/settings/copy.svg",
                  maximum_buttons: 1,
                  enabledButton: [],
                  children: {
                      button_text: '',
                      button_text_length: 25,
                      button_text_placeholder: "e.g. Copy Offer Code",
                      extra_field: [
                          {
                              id: "offer_code",
                              name: "Sample offer code",
                              character_length: 15,
                              extra_field_text: '',
                              placeholder: "e.g. Get50Off",
                          }
                      ]
                  }
              }
           ],
          },
      ];

      a(event: Event){
      }

      trackByFn(index: number, item: any) {
        return item.id || index; // Use an ID if available, otherwise index
      }
      trackByRowId(index: number, item: any) {
        return  item.id || index; // Use an ID if available, otherwise index
      }

  onInteractiveButtonClick(button: any) {
      button = JSON.parse(JSON.stringify(button));
      const isPhoneOrUrl = button.id === 'phone' || button.id === 'url';
      const hasPhone = this.selectedButtons.includes('phone');
      const hasUrl = this.selectedButtons.includes('url');
      const hasOther = this.selectedButtons.some(id => id !== 'phone' && id !== 'url');

      // Block duplicates
      if (this.selectedButtons.includes(button.id)) {
          return;
      }

      // Allow phone + url combination only
      if (isPhoneOrUrl) {
          if ((button.id === 'phone' && hasUrl) || (button.id === 'url' && hasPhone)) {
              this.selectedButtons.push(button.id);
              this.renderUIForButton(button);
              return;
          }

          if (!hasPhone && !hasUrl && !hasOther) {
              this.selectedButtons.push(button.id);
              this.renderUIForButton(button);
              return;
          }
      }

      // For non-phone/url, allow only if no button is selected yet
      if (!isPhoneOrUrl && this.selectedButtons.length === 0) {
          this.selectedButtons.push(button.id);
          this.renderUIForButton(button);
      }
       this.updateRenderedButtons(this.renderedButtons);
  }
 
    buttonStream = new BehaviorSubject<any[]>([]);
updateRenderedButtons(renderedButtons: any[]) {
  this.buttonStream.next([...renderedButtons]);
}
  isButtonDisabled(buttonId: string): boolean {
      if (this.selectedButtons.includes(buttonId)) return true;

      const isPhoneOrUrl = buttonId === 'phone' || buttonId === 'url';
      const hasPhone = this.selectedButtons.includes('phone');
      const hasUrl = this.selectedButtons.includes('url');
      const hasOther = this.selectedButtons.some(id => id !== 'phone' && id !== 'url');

      if (hasOther) {
          // No other buttons allowed with anything else
          return true;
      }

      if (hasPhone) {
          return buttonId !== 'url';
      }

      if (hasUrl) {
          return buttonId !== 'phone';
      }

      return false;
  }

  renderUIForButton(button: any): void {
      const currentCount = this.renderedButtons.filter(rb => rb.id === button.id).length;

      if (currentCount < button.maximum_buttons) {
          this.renderedButtons.push(button);
      }
  }


  canAddMoreButtons(buttonId: string, max: number): boolean {
      const count = this.renderedButtons.filter(b => b.id === buttonId).length;
      return count < max;
  }

    removeButton(id: string, index: number) {
        if (id === 'list_messages') {
            this.renderedButtons[0].children.extra_field.splice(index, 1);
            if (this.renderedButtons[0].children.extra_field.length === 0)
                this.renderedButtons = [];
        } else
            this.renderedButtons.splice(index, 1);

        if (id === 'phone' || id === 'url')
            return this.selectedButtons.splice(this.selectedButtons.indexOf(id), 1)
        
        if (this.renderedButtons.length === 0)
            this.selectedButtons.splice(this.selectedButtons.indexOf(id), 1);

         this.updateRenderedButtons(this.renderedButtons);

    }

    addButton(id: string): void {
        const isSelected = this.selectedButtons.includes(id);
        if (!isSelected) return;
      
        const buttonSchema = this.findButtonSchemaById(id);
        if (!buttonSchema) return;
      
        if (id === 'list_messages') {
            const rowField = buttonSchema.children?.extra_field?.find((field: any) => field.id === 'row');
            if (!rowField) return;
            const deepClonedrowField = JSON.parse(JSON.stringify(rowField));
            deepClonedrowField.extra_field_text = '';
            this.renderedButtons[0].children.extra_field.push(deepClonedrowField);
            return;
          }
          
          const deepClonedSchema = JSON.parse(JSON.stringify(buttonSchema));
          deepClonedSchema.children.button_text = '';
        this.renderedButtons.push(deepClonedSchema);
        this.updateRenderedButtons(this.renderedButtons);
      }

   findButtonSchemaById(id: string): any | undefined {
      for (const section of this.interactiveButtons) {
        const found = section.details.find((btn: any) => btn.id === id);
        if (found) return found;
      }
      return undefined;
    }

async validateRenderedButtons(renderedButtons: any[]): Promise<boolean> {
  let boolean = true;
  if(!renderedButtons || renderedButtons.length === 0) return boolean;
  for (const detail of renderedButtons) {
    if (!detail.children?.button_text || detail.children.button_text.trim() === '') {
      boolean = false;
      continue;
    }

    // Check extra fields
    if (Array.isArray(detail.children?.extra_field)) {
      for (const field of detail.children.extra_field) {
        if (!field.extra_field_text || field.extra_field_text.trim() === '') {
          boolean = false;
          continue;
        }

        if (field.dropdown_field && (!field.selected_country_code || field.selected_country_code.trim() === '')) {
          boolean = false;
          continue;
        }

        if (field.selected_country_code && detail.children.extra_field?.[0]?.extra_field_text) {
          const phoneLength = this.phoneValidationService?.getPhoneNumberLength(field.selected_country_code);
          const enteredPhone = detail.children.extra_field[0].extra_field_text;

          if (enteredPhone.length !== phoneLength) {
            this.toast.error('Phone Number Length is incorrect');
            await new Promise(resolve => setTimeout(resolve, 3000)); // ✅ works here
            boolean = false;
            continue;
          }
        }
      }
    }

    // Check list messages
    if (detail.id === 'list_messages' && Array.isArray(detail.children?.extra_field)) {
      for (const row of detail.children.extra_field) {
        if (!row.extra_field_text || row.extra_field_text.trim() === '') {
          boolean = false;
          continue;
        }
      }
    }
  }

  return boolean;
}

    generateInteractivePayload(to: string): InteractiveMessagePayload {
        let listPayload: any = null;
        const buttons: InteractiveButtonPayload[] = [];
        


        this.renderedButtons.forEach(group => {
            // Ignore if no text entered
                const buttonText = group.children.button_text?.trim();
                if (!buttonText) return;

            if (group.children.button_text.trim()) {
              const button: InteractiveButtonPayload = {
                type: this.getButtonType(group.id),
                title: group.children.button_text,
                id: group.id
              };
      
              // Add extra fields if required based on type
              if (group.id === 'url') {
                const extra = group.children.extra_field?.find((e:any) => e.id === 'hyperlink');
                if (extra && extra.extra_field_text) {
                  button.url = extra.extra_field_text;
                }
              }
      
              if (group.id === 'phone') {
                const extra = group.children.extra_field?.find((e: any) => e.id === 'phone_number');
                if (extra && extra.extra_field_text) {
                  button.phone_number = extra.extra_field_text;
                }
              }
      
              if (group.id === 'copy_button') {
                const extra = group.children.extra_field?.find((e: any) => e.id === 'offer_code');
                if (extra && extra.extra_field_text) {
                  button.copy_code = extra.extra_field_text;
                }
              }
                  if (group.id === 'list_messages') {
                    const rows = group.children.extra_field.map((item: any, index: number) => ({
                        title: item.extra_field_text?.trim() || `Option ${index + 1}`,
                       // description: item.placeholder?.trim() || '',
                        id: item.id?.trim() || `row${index + 1}`
                    }));

                    listPayload = {
                        label: buttonText,
                        sections: [
                        {
                            title: buttonText,
                            rows
                        }
                        ]
                    };
                  }
      
              buttons.push(button);
            }

        });
      
        const payload: InteractiveMessagePayload = {
          to,
          action: {
            buttons
          }
        };

        if (listPayload) {
            payload.type = 'list';
            payload.action.list = listPayload;
        } else if (buttons.length) {
            payload.action.buttons = buttons;
        }

        return payload;
      }
      getButtonType(id: string): string {
        switch (id) {
          case 'quick_reply':
            return 'quick_reply';
          case 'url':
            return 'url';
          case 'phone':
            return 'call';
          case 'copy_button':
            return 'copy';
          case 'list_messages':
          return 'list';
          default:
            return 'reply';
        }
      }
      countMaximumBtn(id: string): number {
        if(id == 'list_messages'){
            const countBtn = this.renderedButtons[0].children.extra_field?.filter((item:any)=> item.id.startsWith('row'))?.length;
            return countBtn;
        }
       const countBtn = this.renderedButtons.filter((item:any)=> item.id == id)?.length;
       return countBtn;
      }

      getInputCharacterCount(event : Event, id: any, idx: number): number {
        return 1;
      }

addRow(id: string): void {
  const buttonIndex = this.renderedButtons.findIndex(b => b.id === id);
  if (buttonIndex === -1) return;

  const button = this.renderedButtons[buttonIndex];
  const rowSchema = this.findButtonSchemaById(id)?.children?.extra_field?.find((field: any) => field.id === 'row');

  if (!rowSchema) return;

  const newRow = JSON.parse(JSON.stringify(rowSchema));
   const colors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'White', 'Gray', 'Pink', 'Brown', 'Black'];
   newRow.placeholder = colors[Math.floor(Math.random() * colors.length)];
  //newRow.extra_field_text = '';
  newRow.id = 'row' + (button.children.extra_field.length + 1); // Ensure unique ID
  button.children.extra_field.push(newRow);
  this.cdr.detectChanges(); // Ensure view updates immediately
}
removeRow(id: string, rowIndex: number): void {
  const buttonIndex = this.renderedButtons.findIndex(b => b.id === id);
  if (buttonIndex === -1) return;

  const button = this.renderedButtons[buttonIndex];

  button.children.extra_field.splice(rowIndex, 1);

  // If all rows are removed, you may want to clear out list_messages button entirely
  if (button.children.extra_field.length === 0) {
    this.renderedButtons.splice(buttonIndex, 1);
    const selectedIndex = this.selectedButtons.indexOf(id);
    if (selectedIndex !== -1) this.selectedButtons.splice(selectedIndex, 1);
  }
}
}
