import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
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

  // Data
  botDetailsData: any = null
  showAdvanceOption: boolean = false;
  searchKey = '';
  channelPhoneNumber: string = '';
  channelSelected: string = '';
  // botsList:any = [
  //   {
  //     id: 'BOT-001',
  //     name: 'Customer Support Bot',
  //     status: 'Published',
  //     createdOn: '2025-04-25T14:35:00Z',
  //     created_By: 'John Doe',
  //     invoked: 120,
  //     completed: 85,
  //     dropped: 35,
  //     Channel: 'WA API',
  //     advanceAction: {
  //       selected: [
  //         { name: 'Assign Agent', value: 'assign_agent' },
  //         { name: 'Update Status', value: 'update_status' }
  //       ]
  //     }
  //   },

  // ];


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
    { value: 1, label: 'Published', checked: false },
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
    this.profilePicture = JSON.parse(sessionStorage.getItem('loginDetails')!).profile_img;
    this.userDetails = JSON.parse(sessionStorage.getItem('loginDetails')!);

    this.initForms();
  }

  ngOnInit() {
    this.getWhatsAppDetails();
    this.getUserList();
    this.getTagData();
    this.getBotDetails()

    this.statusColors = this.botService.statusColors;


    // this.originalBotsList = [...this.botsList];
  }

  private initForms(): void {
    this.botBuilderForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(20)]],
      botDescription: [null, [Validators.required, Validators.maxLength(80)]],
      botChannel: [null, Validators.required],
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
    var SPID = this.userDetails.SP_ID
    this.botService.getBotAlldetails(SPID).subscribe((res: any) => {
      if (res.status == 200) {

        this.botsList = res.bots
        console.log(res.bots)
        this.originalBotsList = [...this.botsList];
      }


    })
    // this.botService.getBotAlldetails(SPID).subscribe((res:any)=>{

    //   console.log(res)

    // })
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


  // applyFilterOnBotBuilder(): void {
  //   // Implement your filtering logic here
  // }

  // Modal and Form Methods
  openModal(content: any): void {
    this.maxSelectableDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  closeModalById(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
    this.resetBotForm();
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
  }

  // Bot Management Methods
  toggleTemplatesData(item: Bot | null): void {
    this.showCampaignDetails = !!item;
    this.botDetailsData = item;

    if (item) {
      this.botBuilderForm.patchValue({
        name: item.name,
        botDescription: item.botDescription,
        botChannel: item.Channel,
        botTimeout: item.botTimeout,
        dropOfMessage: item.dropOfMessage,
        advanceAction: {
          selected: item?.advanceAction?.selected || []
        }
      });
      this.selectedAdvanceAction = null;
    }
  }

  submitBotForm(): void {
    if (this.botBuilderForm.invalid) {
      this.botBuilderForm.markAllAsTouched();
      return;
    }

    if (this.botBuilderForm.valid) {
      const formData = this.botBuilderForm.value;
      const data = {
        spid: this.userDetails.SP_ID,
        name: formData.name,
        description: formData.botDescription,
        channel_id: formData.botChannelId,
        status: 'draft',
        timeout_value: formData.botTimeout,
        timeout_message: formData.dropOfMessage,
        created_by: this.userDetails.uid,
      };

      this.settingsService.saveBotDetails(data).subscribe((response: any) => {
        if (response.status === 200) {
          this.botBuilderForm.reset();
        } else {
          this.showToaster('error', response.message);
        }
      });
    }
  }

  updateBotForm(): void {
    if (this.botBuilderForm.valid) {
      const formData = this.botBuilderForm.value;
      console.log('Updated bot data:', formData);
      this.closeModalById('editFlowModal');
      this.router.navigate(['/bot-Creation']);
    }
  }

  copyBot(): void {
    this.botBuilderForm.addControl(
      'copyBotName',
      this.fb.control(null, [Validators.required, Validators.maxLength(20)])
    );
  }

  // 	toggleAddActions() {
  // 	this.ShowAssignOption = false;
  // 	this.ShowAddAction = !this.ShowAddAction;
  // }

  copyBotForm(): void {
    if (this.botBuilderForm.valid) {
      const formData = this.botBuilderForm.value;
      this.closeModalById('copyBot');
      this.router.navigate(['/bot-Creation']);
      // this.botBuilderForm.removeControl('copyBotName');
    }
  }

  confirmDelete(): void {
    if (!this.botDetailsData?.id) return;

    this.botsList = this.botsList.filter((bot: any) => bot.id !== this.botDetailsData.id);

    // req.params.spid, req.params.botId
    this.closeModalById('deleteBotModal');
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
  onDateOptionChange(option: string): void {
    this.showDatePickers = option === 'custom';
    if (option !== 'custom') {
      this.dateRangeForm.patchValue({ fromDate: null, toDate: null });
      this.dateError = null;
    }
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

  // Advance Action Methods
  handleActionClick(action: any): void {
    this.selectedParentAction = action;

    if (!action.children || action.children.length === 0) {
      this.botBuilderForm.patchValue({ advanceAction: action });
      this.showAdvanceAction = false;
      return;
    }

    this.submenuTitle = action.name;
    this.submenuOptions = action.children || [];
    this.showSubmenuPanel = true;

    const prev = this.botBuilderForm.value.advanceAction;
    if (action.multiSelect) {
      this.multiSelect = prev?.selectedChildren || [];
    } else {
      this.tempSelections = prev?.selectedChild || null;
    }
  }

  selectAdvanceAction(child: any): void {
    if (this.selectedParentAction?.multiSelect) {
      const index = this.multiSelect.findIndex((c: any) => c.value === child.value);
      index > -1 ? this.multiSelect.splice(index, 1) : this.multiSelect.push(child);
    } else {
      this.tempSelections = child;
    }
  }

  confirmSelection(): void {
    const actionValue = this.selectedParentAction?.multiSelect
      ? { ...this.selectedParentAction, selectedChildren: [...this.multiSelect] }
      : { ...this.selectedParentAction, selectedChild: this.tempSelections };

    this.botBuilderForm.patchValue({ advanceAction: actionValue });
    this.showAdvanceAction = false;
    this.showSubmenuPanel = false;
    this.searchText = '';
  }

  getAdvanceActionDisplayValue(): string {
    const action = this.botBuilderForm.value.advanceAction;
    if (!action) return '';

    if (action.multiSelect && action.selectedChildren?.length) {
      const childNames = action.selectedChildren.map((c: any) => c.name).join(', ');
      return `${action.name} (${childNames})`;
    }

    if (action.selectedChild) {
      return `${action.name} (${action.selectedChild.name})`;
    }

    return action.name;
  }

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
  // toggleAssignOption() {
  //   this.ShowAssignOption = !this.ShowAssignOption
  // }
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


  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  setSelectedCategory(index: number) {
    this.selectedCategory = index;
  }

  updateFilter(event: any, filter: any) {
    if (event.target.checked) {
      filter['checked'] = true;
      let isChecked = filter.label
    } else {
      filter['checked'] = false;
    }
  }

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

  toggleAdvanceAction() {
    this.showAdvanceAction = !this.showAdvanceAction;
    // this.ShowAssignOption = true
    this.ShowAddAction = true
    this.showSubmenuPanel = false;
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


  confirmAndExport(modal: any) {
    var downloadIcon = document.querySelector(".btn-circle-download");
    if (downloadIcon) {
      downloadIcon.classList.add("load");
    }
    if (this.dateRangeForm.valid && !this.dateError) {
      const selectedOption = this.dateRangeForm.value.dateOption;
      let fromDate, toDate;

    }
  }







  agentsList: any[] = [];
  userList: any[] = [];
  addTagList: any[] = [];
  isAssigned: any = false;

  getUserList() {
    this.settingsService.getUserList(this.userDetails.SP_ID, 1)
      .subscribe((result: any) => {
        if (result) {
          this.userList = result?.getUser;
          this.userList.forEach((item: { name: string; nameInitials: string; }) => {
            const nameParts = item.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts[1] || '';
            const nameInitials = firstName.charAt(0) + ' ' + lastName.charAt(0);

            item.nameInitials = nameInitials;
          });
          this.agentsList = []
          for (let i = 0; i < this.userList.length; i++) {
            this.agentsList.push({
              name: this.userList[i].name,
              nameInitials: this.userList[i].nameInitials,
              profileImg: this.userList[i].profile_img,
              RoleName: this.userList[i].RoleName,
              uuid: this.userList[i].uid
            });
          }
        }

      });
  }
  /*  GET TAG LIST  */
  ShowRemoveTag = false;
  removeTagList: any = []
  getTagData() {
    this.settingsService.getTagData(this.userDetails.SP_ID)
      .subscribe(result => {
        if (result) {
          let tagListData = result.taglist;
          this.addTagList = [...tagListData];
          this.removeTagList = tagListData;
        }

      })
  }

  checkTagStatus(val: any, id: any) {
    if (this.assignedTagList.includes(val) && id == 0) {
      return true;
    } if (this.assignedRemoveTagList.includes(val) && id == 1) {
      return true;
    } if (this.converstatation.includes(val) && id == 1) {
      return true;
    } else {
      return false;
    }
  }

  assignedAgentList: any[] = [];
  isEditAssigned: boolean = false;
  AssignedIndex: number = 0;
  assignConversation(index: number) {
    var isExist = false;
    this.assignedAgentList.forEach(item => {
      if (item.ActionID == 2) {
        if (item.Value == this.agentsList[index].name)
          isExist = true;
      }
    })
    if (!isExist) {
      this.isAssigned = true;
      if (this.isEditAssigned) {
        this.assignedAgentList[this.AssignedIndex] = { ActionID: 2, Value: this.agentsList[index].name, ValueUuid: this.agentsList[index].uuid }
      } else {
        this.assignedAgentList.push({ ActionID: 2, Value: this.agentsList[index].name, ValueUuid: this.agentsList[index].uuid })
      }
    }

  }

  editedText:string ='';
  	onActionEdit(Text: string) {
		this.editedText = Text;

	}

  toggleEditable(index: number) {
  		// this.editableMessageIndex = index ;
		if(this.assignedAgentList[index]?.ValueUuid){
			this.ShowAssignOption = true;
			this.isEditAssigned =true;
			this.AssignedIndex = index;
		}
  }

  	removeAction(index: number) {

		this.assignedAgentList.forEach(item => {
			if (!item.Message) {
				this.assignedAgentList.splice(index, 1);
					
			}
		})
		
	}


  
	toggleRemoveTag(type:any) {

    if (type == 'addTag') {
      $("#addTagModal").modal('show'); 
    }else{
      $("#RemoveTagModal").modal('show'); 
      
    }
		this.ShowRemoveTag = true;

	}

  	removeAddTag(index: number) {
		this.assignedTagList = [];
		this.assignedAgentList.splice(index, 1);

	}


  assignedTagList: any = []
  assignedTagListUuid: any = []
  addTags(index: number, e: any) {
    console.log(e, index);
    var isExist = false;
    console.log(this.assignedTagList, ' tags list');
    this.assignedAgentList.forEach(item => {
      console.log(item)
      if (item.ActionID == 1) {
        isExist = true;
        if (e.target.checked) {
          if (!item.Value.includes(this.addTagList[index])) {
            console.log(this.addTagList[index]);
            // item.Value.push(this.addTagList[index]);
            this.assignedTagList.push(this.addTagList[index].TagName);
            this.assignedTagListUuid.push(this.addTagList[index].ID);
          }
        }
        else {
          var idx = this.assignedTagList.findIndex((item: any) => item == this.addTagList[index]?.TagName)
          console.log(idx);
          console.log(this.assignedTagList[idx]);
          this.assignedTagList.splice(idx, 1);
          this.assignedTagListUuid.splice(idx, 1);
        }

      }
    })
    if (!isExist) {
      this.assignedTagList = [];
      this.assignedTagList.push(this.addTagList[index].TagName);
      this.assignedTagListUuid.push(this.addTagList[index].ID);
      this.assignedAgentList.push({ ActionID: 1, Value: this.assignedTagList, ValueUuid: this.assignedTagListUuid, });
    }

  }

  assignedRemoveTagList: any = []
  assignedRemoveTagListUuid: any = []
  RemoveTags(index: number, e: any) {
    console.log(e, index);
    var isExist = false;
    this.assignedAgentList.forEach(item => {
      if (item.ActionID == 3) {
        isExist = true;
        if (e.target.checked) {
          if (!item.Value.includes(this.removeTagList[index])) {
            this.assignedRemoveTagList.push(this.removeTagList[index].TagName);
            this.assignedRemoveTagListUuid.push(this.removeTagList[index].ID);
          }
        }
        else {
          var idx = this.assignedRemoveTagList.findIndex((item: any) => item == this.removeTagList[index]?.TagName)
          this.assignedRemoveTagList.splice(idx, 1);
          this.assignedRemoveTagListUuid.splice(idx, 1);
        }

      }
    })
    if (!isExist) {
      this.assignedRemoveTagList = [];
      this.assignedRemoveTagList.push(this.removeTagList[index].TagName);
      this.assignedRemoveTagListUuid.push(this.removeTagList[index].ID);
      this.assignedAgentList.push({ ActionID: 3, Value: this.assignedRemoveTagList, ValueUuid: this.assignedRemoveTagListUuid });
    }

  }


  converstatation: any = []
  openConverstaion(index: number, e: any) {
    console.log(e, index);
    var isExist = false;
    this.assignedAgentList.forEach(item => {
      console.log(item)
      if (item.ActionID == 4) {
        isExist = true;
        if (e.target.checked) {
          if (!item.Value.includes(this.converstationStatus[index])) {
            this.converstatation.push(this.converstationStatus[index].name);
          }
        }
        else {
          var idx = this.converstatation.findIndex((item: any) => item == this.converstationStatus[index]?.name)
          console.log(idx);
          console.log(this.assignedRemoveTagList[idx]);
          this.converstatation.splice(idx, 1);
        }

      }
    })
    if (!isExist) {
      this.converstatation = [];
      this.converstatation.push(this.converstationStatus[index].name);
      this.assignedAgentList.push({ ActionID: 4, Value: this.converstatation });
    }

  }



  ToggleAssignOption: boolean = false
  closeAssignOption() {
    this.ShowAssignOption = false;
    this.ToggleAssignOption = !this.ToggleAssignOption;
  }





























  converstationStatus = [{ name: 'Resolve', value: 'resolve' }, { name: 'Open', value: 'open' }]
  assignActionList = [{
    name: 'Assign to contact owner',
    value: 'assign_owner', selected: false
  },
  {
    name: 'Unassign conversation',
    value: 'Unassign_conversation', selected: false
  },
  {
    name: 'Assign to Agent',
    value: 'assign_agent',
    children: this.agentList, selected: false
  },
  {
    name: 'Mark Conversation Status',
    value: 'Mark_Status',
    children: [{ name: 'Resolve', value: 'resolve' }, { name: 'Open', value: 'open' }], selected: false
  },
  {
    name: 'Add Tag',
    value: 'Add_Tag',
    children: this.tagList,
    multiSelect: true, selected: false
  },
  {
    name: 'Remove Tag',
    value: 'Remove_Tag',
    children: this.removeTagList,
    multiSelect: true, selected: false
  }];

  ShowAddAction: any = false
  toggleAssignOption(index: number) {
    const selectedValue = this.assignActionList[index].value;
    const exclusiveActions = ['assign_owner', 'Unassign_conversation', 'Mark_Status', 'assign_agent'];

    if (exclusiveActions.includes(selectedValue)) {
      // Toggle selection - select if not selected, deselect if already selected
      this.selectedExclusiveAction = this.selectedExclusiveAction === selectedValue ? '' : selectedValue;
    }

    // Handle the specific actions
    if (selectedValue === "assign_agent") {
      this.ShowAssignOption = !this.ShowAssignOption;
      this.ShowAddAction = false;
    }
    if (selectedValue === "Mark_Status") {
      this.ShowRemoveTag = false;
      $("#resolveAndOpen").modal('show');
      this.ShowAddAction = false;
    }
    else if (selectedValue === "Add_Tag") {
      this.ShowRemoveTag = false;
      $("#addTagModal").modal('show');
      this.ShowAddAction = false;
    }
    else if (selectedValue === "Remove_Tag") {
      this.ShowRemoveTag = false;
      $("#RemoveTagModal").modal('show');
      this.ShowAddAction = false;

    }

    if (!this.assignActionList[index].selected) {

      this.assignActionList[index].selected = true
    } else {
      this.assignActionList[index].selected = false
    }
    this.ShowAddAction = false;
  }


  selectedExclusiveAction: string = '';

  isOptionDisabled(optionValue: string): boolean {
    const exclusiveActions = ['assign_owner', 'Unassign_conversation', 'Mark_Status', 'assign_agent'];

    // Only disable if this is an exclusive action and another exclusive action is selected
    if (exclusiveActions.includes(optionValue)) {
      return this.selectedExclusiveAction !== '' && this.selectedExclusiveAction !== optionValue;
    }

    // Never disable non-exclusive actions (Add_Tag, Remove_Tag)
    return false;
  }

  checkList() {
    return this.assignedAgentList.some(agent => agent.ActionID === 2);
  }
  closeAddAction() {
    // Close the dialog when clicking outside
    this.ShowAddAction = false;
  }
}