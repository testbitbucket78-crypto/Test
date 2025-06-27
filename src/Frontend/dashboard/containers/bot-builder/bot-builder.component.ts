import { Component, ElementRef, HostListener, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { environment } from './../../../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import moment from 'moment';
import { Router } from '@angular/router';
import { ToolbarService, LinkService, ImageService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService, EmojiPickerService } from '@syncfusion/ej2-angular-richtexteditor';

import { Bot, AdvanceAction, FilterOption, ChannelOption } from '../../interfaces/bot.interface';
import { BotserviceService } from 'Frontend/dashboard/services/botservice.service';

declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'sb-bot-builder',
  templateUrl: './bot-builder.component.html',
  styleUrls: ['./bot-builder.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService],
})
export class BotBuilderComponent implements OnInit {
  @ViewChild('chatEditor') chatEditor!: RichTextEditorComponent;
  @ViewChild('editFlowModal') editFlowModal!: ElementRef;
  @ViewChild('createFlowModal') createFlowModal!: ElementRef;
  @ViewChild('filterBot') filterBotId!: ElementRef<any>;


  // Form Groups
  botBuilderForm!: FormGroup;
  dateRangeForm!: FormGroup;
  private bsModalInstance: any;

  // Data
  botDetailsData: any = null
  showAdvanceOption: boolean = false;
  searchKey = '';
  channelPhoneNumber: string = '';
  channelSelected: string = '';
  botsList: any = [];

  originalBotsList: any
  modalReference: any;

  showOptions = false;
  contactOwner = '{{Contact Owner}}';
  ownerName = 'Jane Cooper';
  ShowChannelOption: any = false;

  filterListChannel: FilterOption[] = [
    { value: 1, label: 'WA API', checked: false },
    { value: 2, label: 'WA Web', checked: false },
  ];

  channelOption: ChannelOption[] = [
    { value: 1, label: 'WhatsApp Official', checked: false, connected_id: '', channel_status: '' },
    { value: 2, label: 'WhatsApp Web', checked: false, connected_id: '', channel_status: '' }
  ];

  filterListStatus: FilterOption[] = [
    { value: 0, label: 'draft', checked: false },
    { value: 1, label: 'publish', checked: false },
    { value: 2, label: 'Deprecated', checked: false },
  ];

  // UI State
  showCampaignDetails = false;
  selectedCategory = 0;
  selectedTab = 0;
  filterTemplateCategory = ['Status'];
  showDatePickers = false;
  dateError: string | null = null;
  maxSelectableDate = "";
  statusColors: any

  // Advance Action State
  showAdvanceAction = false;
  showSubmenuPanel = false;
  submenuOptions: any[] = [];
  submenuTitle = '';
  searchText = '';
  selectedAdvanceAction: any = null;
  tempSelections: any = null;
  multiSelect: any[] = [];
  currentAdvanceAction: any = null;
  selectedParentAction: any = null;

  // User Data
  profilePicture = '';
  userDetails: any;
  agentList: any[] = [];
  tagList: any[] = [];


  // Notification Messages
  successMessage: string = '';
  errorMessage: string = '';
  warningMessage: string = '';
  ShowAssignOption: any = false;

  // Data arrays
  agentsList: any[] = [];
  userList: any[] = [];
  addTagList: any[] = [];
  removeTagList: any[] = [];
  assignedAgentList: any[] = [];
  assignedTagList: any[] = [];
  assignedTagListUuid: any[] = [];
  assignedRemoveTagList: any[] = [];
  assignedRemoveTagListUuid: any[] = [];
  converstatation: string[] = [];

  // State
  isAssigned = false;
  isEditAssigned = false;
  AssignedIndex = 0;
  ShowRemoveTag = false;
  ShowAddAction = false;
  ToggleAssignOption = false;
  selectedStatus = '';
  selectedExclusiveAction: any = null;
  editedText = '';

  // Constants
  converstationStatus = [
    { name: 'Resolve', value: 'resolve' },
    { name: 'Open', value: 'open' }
  ];

  assignActionList = [
    { name: 'Assign to contact owner', value: 'assign_owner', selected: false },
    { name: 'Unassign conversation', value: 'Unassign_conversation', selected: false },
    { name: 'Assign to Agent', value: 'assign_agent', children: this.agentList, selected: false },
    { name: 'Mark Conversation Status', value: 'Mark_Status', children: this.converstationStatus, selected: false },
    { name: 'Add Tag', value: 'Add_Tag', children: this.tagList, multiSelect: true, selected: false },
    { name: 'Remove Tag', value: 'Remove_Tag', children: this.removeTagList, multiSelect: true, selected: false }
  ];


  // RTE Configuration
  public tools: object = {
    items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker']
  };

  public pasteCleanupSettings: object = {
    prompt: false,
    plainText: true,
    keepFormat: false,
  };

  advanceActions: AdvanceAction[] = [
    {
      name: 'Assign to contact owner',
      value: 'assign_owner'
    },
    {
      name: 'Unassign conversation',
      value: 'Unassign_conversation'
    },
    {
      name: 'Assign to Agent',
      value: 'assign_agent',
      children: this.agentList
    },
    {
      name: 'Mark Conversation Status',
      value: 'Mark_Status',
      children: [{ name: 'Resolve', value: 'resolve' }, { name: 'Open', value: 'open' }]
    },
    {
      name: 'Add Tag',
      value: 'Add_Tag',
      children: this.tagList,
      multiSelect: true
    },
    {
      name: 'Remove Tag',
      value: 'Remove_Tag',
      children: this.tagList,
      multiSelect: true
    },
  ];

  constructor(
    public settingsService: SettingsService,
    public apiService: SettingsService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    public botService: BotserviceService,
  ) {
    this.profilePicture = JSON.parse(sessionStorage.getItem('loginDetails')!)?.profile_img;
    this.userDetails = JSON.parse(sessionStorage.getItem('loginDetails')!);


    // if (settingsService?.checkRoleExist('24')) {
    //   this.router.navigateByUrl('/login');
    // }

    this.initForms();
  }


  ngOnInit() {
    this.getWhatsAppDetails();
    this.getUserList();
    this.getTagData();
    this.getBotDetails()

    this.statusColors = this.botService.statusColors;
  }

  private initForms(): void {
    this.botBuilderForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(20)]],
      botDescription: [null, [Validators.required, Validators.maxLength(80)]],
      botChannel: [null, Validators.required],
      triggerKeywords: [null, Validators.required],
      botChannelId: [null, Validators.required],
      botTimeout: [null, Validators.required],
      dropOfMessage: [null],
      advanceAction: [null]
    });

    this.dateRangeForm = this.fb.group({
      dateOption: ['7Days', Validators.required],
      fromDate: [null],
      toDate: [null]
    });
  }



  getBotDetails() {
    localStorage.removeItem('node_FE_Json')
    localStorage.removeItem('botId')
    var SPID = this.userDetails?.SP_ID || 159
    this.botService.getBotAlldetails(SPID).subscribe((res: any) => {
      if (res.status == 200) {

        this.botsList = res.bots
        console.log(res.bots)
        this.originalBotsList = [...this.botsList];
      }


    })
  }








  // Store the original list for filtering

  searchBotBuilder(event: any): void {
    const searchValue = event?.target?.value?.trim().toLowerCase();
    this.searchKey = searchValue && searchValue.length >= 1 ? searchValue : '';

    if (!this.searchKey) {
      this.botsList = [...this.originalBotsList]; // Reset to full list
      return;
    }

    this.botsList = this.originalBotsList.filter((bot: Bot) => {
      return (
        bot.name.toLowerCase().includes(this.searchKey) ||
        bot?.id?.toString().includes(this.searchKey)
      );
    });
  }



  // Modal and Form Methods
  openModal(content: any): void {
    this.maxSelectableDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  closeModalById(modalId: string): void {
    this.botBuilderForm.reset()
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
    this.resetBotForm();
    console.log(this.botBuilderForm.value)
  }

  resetBotForm(): void {
    this.botBuilderForm.reset();
    // this.botBuilderForm.removeControl('copyBotName');
    this.showAdvanceAction = false;
    this.showSubmenuPanel = false;
    this.searchText = '';
    this.selectedAdvanceAction = null;
    this.selectedParentAction = null;
    this.tempSelections = null;
    this.multiSelect = [];
    this.showAdvanceOption = false;
    this.assignedAgentList = []

  }

  sanitizeHTML(rawHtml: string): string {
    return rawHtml?.replace(/style="[^"]*"/g, '');
  }
  // Bot Management Methods
  toggleTemplatesData(item: any | null): void {
    this.showCampaignDetails = !!item;
    this.botDetailsData = item;
    console.log(item)

    if (item) {
      this.botBuilderForm.patchValue({
        name: item.name,
        botDescription: item.description,
        botChannel: item.channel_id,
        botChannelId: item.channel_id,
        botTimeout: item.timeout_value,
        dropOfMessage: this.sanitizeHTML(item.timeout_message),
        triggerKeywords: item.keywords,
        // advanceAction: {
        //   selected: JSON.parse(item?.advanceAction) || []
        // }
      });
      this.selectedAdvanceAction = null;
    }

    let keywordArray = item?.keywords?.split(',').map((k: any) => k.trim());
    console.log(keywordArray)
    if (keywordArray == undefined) {
      this.keywords = []
    } else {
      this.keywords = keywordArray
    }


    this.assignedAgentList = JSON.parse(item?.advanceAction) || []

    const matchedActionValues: any = this.assignedAgentList
      .filter(item => this.actionIdToValue.hasOwnProperty(item.actionTypeId))
      .map(item => this.actionIdToValue[item.actionTypeId]);
    console.log(matchedActionValues)
    this.selectedExclusiveAction = matchedActionValues[0]


    this.assignedAgentList.forEach((item: any) => {
      if (item.actionTypeId == 1) {

        this.assignedTagList = item.Value
      } else if (item.actionTypeId == 3) {
        this.assignedRemoveTagList = item.Value

      } else if (item.actionTypeId == 4) {

        this.converstatation = item.Value
      }
    })


    if (this.assignedAgentList?.length > 0 || item.timeout_message != null) {
      this.showAdvanceOption = true
    }


  }


  submitBotForm(Type: any): void {

    console.log("this.botBuilderForm.value", this.botBuilderForm.value)
    Object.keys(this.botBuilderForm.controls).forEach(key => {
      const control = this.botBuilderForm.get(key);
      if (control && control.invalid) {
        console.warn(`Invalid field: ${key}`, control.errors);
      }
    });

    if (this.botBuilderForm.invalid) {
      this.botBuilderForm.markAllAsTouched();
      return;
    }

    if (this.botBuilderForm.valid) {
      const formData = this.botBuilderForm.value;
      // if (Type == 'copy') {
      //   formData.name = formData.copyBotName
      // }
      const data = {
        spid: this.userDetails.SP_ID,
        name: formData.name,
        description: formData.botDescription,
        channel_id: formData.botChannelId,
        status: 'draft',
        timeout_value: formData.botTimeout,
        timeout_message: formData.dropOfMessage,
        created_by: this.userDetails.name,
        keyword: formData.triggerKeywords,
        advanceAction: this.assignedAgentList
      };

      this.botService.saveBotDetails(data).subscribe((response: any) => {
        if (response.status === 200) {
          this.botBuilderForm.reset();
          localStorage.setItem('botId', response.botId)
          this.closeModalById('createBotModal');
          this.closeModalById('copyBot');
          this.router.navigate(['/bot-Creation']);
          this.showToaster('success', response.message)
        } else {
          this.showToaster('error', response.message);
        }
      });
    }
  }

  updateBotForm(): void {
    console.log("this.botBuilderForm.valid", this.botBuilderForm.valid)
    Object.keys(this.botBuilderForm.controls).forEach(controlName => {
      const control = this.botBuilderForm.get(controlName);
      console.log(`${controlName} -> Valid: ${control?.valid}, Value: ${control?.value}, Errors:`, control?.errors);
    });
    if (this.botBuilderForm.valid) {
      const formData = this.botBuilderForm.value;

      if (this.botBuilderForm.valid) {
        const formData = this.botBuilderForm.value;
        const data = {
          spid: this.userDetails.SP_ID,
          botId: this.botDetailsData.id,
          name: formData.name,
          description: formData.botDescription,
          channel_id: formData.botChannelId,
          status: 'draft',
          timeout_value: formData.botTimeout,
          timeout_message: formData.dropOfMessage,
          created_by: this.userDetails.name,
          keyword: formData.triggerKeywords,
          advanceAction: this.assignedAgentList
        };

        this.botService.updateBotDetails(data).subscribe((response: any) => {
          if (response.status === 200) {
            this.botBuilderForm.reset();
            if (this.botDetailsData.node_FE_Json) {
              localStorage.setItem('node_FE_Json', this.botDetailsData.node_FE_Json)
            }
            localStorage.setItem('botId', this.botDetailsData.id)
            this.closeModalById('editFlowModal');
            this.router.navigate(['/bot-Creation']);
            this.showToaster('success', response.message)
          } else {
            this.showToaster('error', response.message);
          }
        });

      }

    }
  }

  copyBot(Type: any): void {
    if (Type == 'copy') {
      this.botBuilderForm.get('name')?.setValue(null)
    } else {
      this.botBuilderForm.get('name')?.setValue(this.botDetailsData.name)
    }

  }

  // 	toggleAddActions() {
  // 	this.ShowAssignOption = false;
  // 	this.ShowAddAction = !this.ShowAddAction;
  // }


  confirmDelete(): void {
    if (!this.botDetailsData?.id) return;

    // this.botsList = this.botsList.filter((bot: any) => bot.id !== this.botDetailsData.id);

    this.botService.deleteBotDetails(this.userDetails.SP_ID, this.botDetailsData.id).subscribe((response: any) => {
      if (response.status === 200) {
        this.botBuilderForm.reset();
        this.closeModalById('deleteBotModal');
        this.closeModalById('deprecated');
        this.showToaster('success', response.message)
        this.getBotDetails()
      } else {
        this.showToaster('error', response.message);
      }
    });


    // req.params.spid, req.params.botId
    this.closeModalById('deleteBotModal');
    this.closeModalById('deprecated');
    this.showCampaignDetails = false;
    this.botDetailsData = null;
  }
















  /*  GET ATTRIBUTE LIST  */
  // getAttributeList() {
  //    this.apiService.getAttributeList(this.SPID)
  //    .subscribe((response:any) =>{
  // 	if(response){
  // 		let attributeListData = response?.result;
  // 		this.attributesList = attributeListData.map((attrList:any) => attrList.displayName);
  // 		console.log(this.attributesList);
  // 	}
  //   })
  // }

  getWhatsAppDetails(): void {
    this.apiService.getWhatsAppDetails(this.userDetails.SP_ID).subscribe((response: any) => {
      if (response?.whatsAppDetails) {
        this.channelOption = response.whatsAppDetails.map((item: any) => ({
          value: item?.id,
          label: item?.channel_id,
          connected_id: item?.connected_id,
          channel_status: item?.channel_status
        }));

        if (this.channelOption.length === 1) {
          this.channelSelected = this.channelOption[0].label;
          this.channelPhoneNumber = this.channelOption[0].connected_id;
        }
      }
    });
  }

  // UI Helper Methods



  // Notification Methods
  showToaster(type: 'success' | 'error' | 'warning', message: string): void {
    if (type === 'success') this.successMessage = message;
    else if (type === 'error') this.errorMessage = message;
    else this.warningMessage = message;

    setTimeout(() => this.hideToaster(), 5000);
  }


  filterBot(filterBotId: any) {
    this.closeAllModal()
    this.modalReference = this.modalService.open(filterBotId, { size: 'sm', windowClass: 'white-pink' });
  }

  closeAllModal() {
    if (this.modalReference) {
      this.modalReference.close();
    }
  }

  hideToaster(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.warningMessage = '';
  }

  updateDropdown(id: string) {
    const selectedChannel = this.channelOption.find((channel: any) => channel.connected_id === id);
    if (selectedChannel) {
      this.channelSelected = selectedChannel.label;
    }
    this.ShowAssignOption = false;
  }



  toggleAdvanceOption() {
    this.showAdvanceOption = !this.showAdvanceOption;
  }

  showTriggerOption: any = false
  toggleOptions(type: any = '') {
    if (type == 'bot') {
      this.showTriggerOption = !this.showTriggerOption
    } else {

      this.showOptions = !this.showOptions;
    }
  }

  // setSelectedCategory(index: number) {
  //   this.selectedCategory = index;
  // }

  // check

  updateFilter(event: any, filter: any) {
    if (event.target.checked) {
      filter['checked'] = true;
      let isChecked = filter.label
    } else {
      filter['checked'] = false;
    }
  }

  // check

  clearFilters() {
    this.filterListStatus.forEach(filter => filter.checked = false);
    this.botsList = [...this.originalBotsList];
    this.closeAllModal()

  }

  applyFilters() {
    const selectedStatus = this.filterListStatus
      .filter(f => f.checked)
      .map(f => f.label);

    console.log('Selected Status:', selectedStatus);

    if (selectedStatus.length === 0) {
      // No filters selected: show all
      this.botsList = [...this.originalBotsList];
      return;
    }

    this.botsList = this.originalBotsList.filter((bot: Bot) =>
      selectedStatus.includes(bot.status) // assuming `bot.status` is like "Draft", "Published"
    );
    this.closeAllModal()
  }


  stopPropagation(event: Event) {
    event.stopPropagation();
  }


  toggleChannelOption() {
    this.ShowChannelOption = !this.ShowChannelOption;
  }

  selectChannel(channel: any) {
    this.botBuilderForm.get('botChannel')?.setValue(`${channel.label} (${channel.connected_id})`);
    this.botBuilderForm.get('botChannelId')?.setValue(channel.connected_id);
    this.ShowChannelOption = false;
  }

  filteredSubmenuOptions() {
    console.log(this.submenuOptions)
    return this.submenuOptions.filter(opt =>
      opt.value.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  isChildSelected(child: any): boolean {
    if (this.selectedParentAction?.multiSelect) {
      return this.multiSelect.some((c: any) => c.value === child.value);
    }
    return this.tempSelections?.value === child.value;
  }

  backToMainDropdown() {
    this.showSubmenuPanel = false;
    this.tempSelections = null;
  }


  onDateOptionChange(option: string): void {
    this.showDatePickers = option === 'custom';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (option === '7Days') {
      const fromDate = new Date(yesterday);
      fromDate.setDate(yesterday.getDate() - 6); // 7 days including yesterday

      this.dateRangeForm.patchValue({
        fromDate: this.formatDate(fromDate),
        toDate: this.formatDate(yesterday)
      });
    } else if (option === '30Days') {
      const fromDate = new Date(yesterday);
      fromDate.setDate(yesterday.getDate() - 29); // 30 days including yesterday

      this.dateRangeForm.patchValue({
        fromDate: this.formatDate(fromDate),
        toDate: this.formatDate(yesterday)
      });
    } else if (option !== 'custom') {
      this.dateRangeForm.patchValue({ fromDate: null, toDate: null });
    }

    this.dateError = null;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  validateDate(): void {
    const fromDate = this.dateRangeForm.value.fromDate;
    const toDate = this.dateRangeForm.value.toDate;

    if (fromDate && toDate) {
      this.dateError = this.botService.validateDateRange(fromDate, toDate);
    } else {
      this.dateError = null;
    }
  }


  confirmAndExport(modal: any) {

    if (this.dateRangeForm.valid && !this.dateError) {
      const selectedOption = this.dateRangeForm.value.dateOption;
      let fromDate, toDate;
      console.log(this.dateRangeForm.value)

      let data = {
        spId: this.userDetails.SP_ID,
        botId: this.botDetailsData.id,
        startDate: this.dateRangeForm.value.fromDate,
        endDate: this.dateRangeForm.value.toDate,
        Channel: environment.chhanel
      }

      this.botService.exportBotDetails(data).subscribe((res: any) => {

      })

      // confirmAndExport

    }
  }
  toggleAdvanceAction() {
    this.showAdvanceAction = !this.showAdvanceAction;
    this.ShowAddAction = true;
    this.showSubmenuPanel = false;
  }


  toggleAssignOptions() {
    console.log(this.ShowAssignOption)
    this.ShowAssignOption = !this.ShowAssignOption
  }

  // Methods
  getUserList() {
    this.settingsService.getUserList(this.userDetails.SP_ID, 1).subscribe((result: any) => {
      if (result?.getUser) {
        this.userList = result.getUser.map((user: any) => ({
          ...user,
          nameInitials: user.name.split(' ').map((part: any) => part.charAt(0)).join('')
        }));
        this.agentsList = this.userList.map(user => ({
          name: user.name,
          nameInitials: user.nameInitials,
          profileImg: user.profile_img,
          RoleName: user.RoleName,
          uuid: user.uid
        }));
      }
    });
  }

  getTagData() {
    this.settingsService.getTagData(this.userDetails.SP_ID).subscribe(result => {
      if (result?.taglist) {
        this.addTagList = [...result.taglist];
        this.removeTagList = [...result.taglist];
      }
    });
  }

  checkTagStatus(val: any, id: any) {
    return (id === 0 && this.assignedTagList.includes(val)) ||
      (id === 1 && this.assignedRemoveTagList.includes(val)) ||
      (id === 2 && this.converstatation.includes(val));
  }

  assignConversation(index: number) {
    const agent = this.agentsList[index];
    if (!this.assignedAgentList.some(item => item.actionTypeId === 2 && item.Value === agent.name)) {
      this.isAssigned = true;
      const assignment = { actionTypeId: 2, Value: agent.name, ValueUuid: agent.uuid };
      this.isEditAssigned ? this.assignedAgentList[this.AssignedIndex] = assignment : this.assignedAgentList.push(assignment);
    }
  }

  onActionEdit(text: string) { this.editedText = text; }

  toggleEditable(index: number) {
    if (this.assignedAgentList[index]?.ValueUuid) {
      this.ShowAssignOption = true;
      this.isEditAssigned = true;
      this.AssignedIndex = index;
    }
  }

  removeAction(index: number) {
    const action = this.assignedAgentList[index];
    const actionMap: any = { 2: 'assign_agent', 4: 'Mark_Status', 5: 'assign_owner', 6: 'Unassign_conversation' };
    if (actionMap[action.actionTypeId]) this.removeExclusiveAction(actionMap[action.actionTypeId]);
    else this.assignedAgentList.splice(index, 1);
  }

  toggleRemoveTag(type: 'addTag' | 'RemoveTag') {
    $(`#${type}Modal`).modal('show');
    this.ShowRemoveTag = true;
  }

  toggleEditableConverstion() {
    $("#resolveAndOpen").modal('show');
    this.ShowRemoveTag = false;
  }

  removeAddTag(index: number) {
    this.assignedTagList = [];
    this.assignedAgentList.splice(index, 1);
  }

  manageTags(index: number, e: any, listType: 'add' | 'remove') {
    const list = listType === 'add' ? this.addTagList : this.removeTagList;
    const tag = list[index];
    const isChecked = e.target.checked;
    const actionTypeId = listType === 'add' ? 1 : 3;

    let existingAction = this.assignedAgentList.find(item => item.actionTypeId === actionTypeId) ||
      { actionTypeId: actionTypeId, Value: [], ValueUuid: [], actionType: actionTypeId == 1 ? 'Add_Tag' : 'Remove_Tag' };
    if (!this.assignedAgentList.some(item => item.actionTypeId === actionTypeId)) this.assignedAgentList.push(existingAction);

    const targetList = listType === 'add' ? this.assignedTagList : this.assignedRemoveTagList;
    const targetUuidList = listType === 'add' ? this.assignedTagListUuid : this.assignedRemoveTagListUuid;

    if (isChecked) {
      existingAction.Value.push(tag.TagName);
      existingAction.ValueUuid.push(tag.ID);
    } else {
      const idx = existingAction.Value.indexOf(tag.TagName);
      if (idx > -1) {
        existingAction.Value.splice(idx, 1);
        existingAction.ValueUuid.splice(idx, 1);
      }
    }
  }

  openConverstaion(index: number) {
    this.selectedStatus = this.converstationStatus[index].name;
    this.converstatation = [this.selectedStatus];
    const existingAction = this.assignedAgentList.find(item => item.actionTypeId === 4) ||
      { actionTypeId: 4, Value: [this.selectedStatus], actionType: 'Mark_Status' };
    if (!this.assignedAgentList.some(item => item.actionTypeId === 4)) this.assignedAgentList.push(existingAction);
    else existingAction.Value = [this.selectedStatus];
  }

  showTagPopup: any = false
  closeAssignOption() {
    this.ShowAssignOption = false;
    this.ToggleAssignOption = !this.ToggleAssignOption;
  }




  openAddTagModal() {
    this.bsModalInstance.show(); // open modal
  }

  toggleAssignOption(index: number) {

    console.log(this.assignActionList, index)
    const action = this.assignActionList[index];
    const modalMap: any = {
      'Mark_Status': 'resolveAndOpen',
      'Add_Tag': 'addTagModal',
      'Remove_Tag': 'RemoveTagModal'
    };

    console.log("modalMap", modalMap, modalMap[action.value])
    if (modalMap[action.value]) {


      $(`#${modalMap[action.value]}`).modal('show');
      this.ShowAddAction = false;
    } else if (action.value === "assign_agent") {
      this.ShowAssignOption = !this.ShowAssignOption;
      this.ShowAddAction = false;
    }

    action.selected = !action.selected;
    this.ShowAddAction = false;

    if (this.isOptionDisabled(action.value)) return;

    if (this.exclusiveActions.includes(action.value)) {
      this.selectedExclusiveAction = this.selectedExclusiveAction === action.value ? null : action.value;
      this.selectedExclusiveAction === action.value ? this.addExclusiveAction(action) : this.removeExclusiveAction(action.value);
    }
  }

  actionIdToValue: any = { 2: 'assign_agent', 4: 'Mark_Status', 5: 'assign_owner', 6: 'Unassign_conversation' };

  addExclusiveAction(action: any) {
    const actionMap: any = {
      'assign_owner': { actionTypeId: 5, Value: 'Assigned to contact owner', actionType: 'assign_owner' },
      'Unassign_conversation': { actionTypeId: 6, Value: 'Conversation unassigned', actionType: 'Unassign_conversation' }
    };

    if (actionMap[action.value]) {
      this.assignedAgentList = this.assignedAgentList.filter(item => !this.exclusiveActions.includes(this.actionIdToValue[item.actionTypeId]));
      this.assignedAgentList.push(actionMap[action.value]);
    }
  }

  removeExclusiveAction(actionValue: string) {
    this.assignedAgentList = this.assignedAgentList.filter(item => this.actionIdToValue[item.actionTypeId] !== actionValue);
    this.selectedExclusiveAction = null;
    if (actionValue === 'assign_agent') this.isAssigned = false;
    if (actionValue === 'Mark_Status') {
      this.selectedStatus = '';
      this.converstatation = [];
    }
  }

  exclusiveActions = ['assign_owner', 'Unassign_conversation', 'Mark_Status', 'assign_agent'];

  isOptionDisabled(optionValue: string): boolean {
    return this.exclusiveActions.includes(optionValue) &&
      this.selectedExclusiveAction !== null &&
      this.selectedExclusiveAction !== optionValue;
  }

  checkList() { return this.assignedAgentList.some(agent => agent.actionTypeId === 2); }
  closeAddAction() {
    this.ShowAddAction = false;
  }

  RemoveTags(index: number, e: any) {
    const isChecked = e.target.checked;
    const tag = this.removeTagList[index];

    let existingAction = this.assignedAgentList.find(item => item.actionTypeId == 3);
    if (!existingAction) {
      existingAction = { actionTypeId: 3, Value: [], ValueUuid: [], actionType: 'Remove_Tag' };
      this.assignedAgentList.push(existingAction);
    }

    if (isChecked) {
      existingAction.Value.push(tag.TagName);
      existingAction.ValueUuid.push(tag.ID);
    } else {
      const idx = existingAction.Value.indexOf(tag.TagName);
      if (idx > -1) {
        existingAction.Value.splice(idx, 1);
        existingAction.ValueUuid.splice(idx, 1);
      }
    }
  }



  // Add these to your component class
  keywords: string[] = [];
  newKeyword = '';
  keywordsError = '';

  addKeyword() {
    if (!this.newKeyword.trim()) return;

    var data = {
      keyword: this.newKeyword,
      spid: this.userDetails.SP_ID

    }
    if (this.keywords.includes(this.newKeyword.trim())) {
      this.keywordsError = 'This keyword already exists';
      return;
    }

    this.botService.checkKeyword(data).subscribe((res: any) => {
      if (res.status == 409) {
        this.keywordsError = res.message;
        return
      } else {
        this.keywords.push(this.newKeyword.trim());
        this.newKeyword = '';
        this.keywordsError = '';

        // Update form control if needed
        this.botBuilderForm.patchValue({
          triggerKeywords: this.keywords.join(',')
        });
      }

    })

    // Check for duplicates


  }

  removeKeyword(index: number) {
    this.keywords.splice(index, 1);
    this.keywordsError = '';

    // Update form control if needed
    this.botBuilderForm.patchValue({
      triggerKeywords: this.keywords.join(',')
    });
  }
}