import { environment } from './../../../../environments/environment';

import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ContentRender, RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { DatePickerComponent } from '@syncfusion/ej2-angular-calendars';
import Drawflow from 'drawflow';
import { RichTextEditor } from '@syncfusion/ej2-angular-richtexteditor';
import { PhoneValidationService } from 'Frontend/dashboard/services/phone-validation.service';
import { TeamboxService } from 'Frontend/dashboard/services';
import { BotserviceService } from 'Frontend/dashboard/services/botservice.service';
import Swal from 'sweetalert2';
import {
  MAX_OPTIONS,
  MAX_BUTTONS,
  MAX_SECTIONS,
  MAX_ROWS_PER_SECTION,
  MAX_CHARACTERS,
  STRING_OPERATORS,
  NUMBER_OPERATORS,
  BOOLEAN_OPERATORS,
  DEFAULT_ACTIONS,
  DEFAULT_TOOLS,
  PASTE_CLEANUP_SETTINGS, attributes, SELECT_OPERATORS, MULTI_SELECT_OPERATORS, DATE_OPERATORS, TIME_OPERATORS
} from './constants';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { Router } from '@angular/router';

declare var bootstrap: any;
declare var $: any;

interface Attribute {
  name: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'switch' | 'number' | 'date';
  options?: { value: string, label: string }[];
  dataTypeValues?: string;
}

interface Bot {
  id: string;
  name: string;
  published: boolean;
}

interface Agent {
  uid: string | number;
  name: string;
  status?: string;
  email?: string;
  phone?: string;
}

interface Tag {
  value: string;
  label: string;
  style: string;
}

interface BotVariable {
  name: string;
  dataType: 'text' | 'number' | 'boolean' | 'array' | 'object';
  value: any;
}

@Component({
  selector: 'sb-card-creation',
  templateUrl: './card-creation.component.html',
  styleUrls: ['./card-creation.component.scss']
})
export class CardCreationComponent {
  // Constants
  private readonly MAX_OPTIONS = MAX_OPTIONS;
  private readonly MAX_BUTTONS = MAX_BUTTONS;
  private readonly MAX_SECTIONS = MAX_SECTIONS;
  private readonly MAX_ROWS_PER_SECTION = MAX_ROWS_PER_SECTION;
  private readonly MAX_CHARACTERS = MAX_CHARACTERS;

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = [];
  openingTime = '09:00';
  closingTime = '17:00';
  useCustomHolidays = false;
  holidays: { date: string }[] = [];



  isAttachmentMedia: boolean = false;
  // Component state
  showLock = true;
  nodeCounter = 1;
  isLoading:any=false
  confirmMessage:any
modalReference:any
  selectedNodeId: number | null = null;
  deletNodeId:any
  cardType = '';
  filePreview: string | ArrayBuffer | null = null;
  fileError: string | null = null;
  orignalData: any = {};
  selectedType = 'Text';
  selectedImageUrl: any = '';
  isEditMode = false;
  dragAreaClass: string = '';
  currentModalRef: NgbModalRef | null = null;
  existingVariableNames: string[] = [];
  isFocused = false;
  messageMeidaFile: any = '';
  messageMediaFile: string = '';
  botVariables: any[] = [];
  showAttachmenOption: any = false;
  errorMessage = '';
  successMessage = '';
  warningMessage = '';
  attributesearch!: string;
  attributesList: any = []
  isTooltipVisible:any
  // Form related properties
  showValidationSettings = false;
  newOptionError = '';
  errorMessageLength = 0;
  questionTextLength = 0;
  bodyTextLength = 0;
  footerTextLength = 0;
  headerTextLength = 0;
  listHeaderLength = 0;
  delayTime = 10;
  delayUnit = 'minute';
  Tags: string[] = [];
  searchQuery = '';
  selectedAgentDetails: Agent | null = null;
  isUploadingLoader!: boolean;
viewMode:any=false

  // File handling
  uploadedFile: File | null = null;
  selectedFileUrl: string | null = null;
  selectedFileType: string | null = null;

  // View children
  @ViewChild('chatEditor') chatEditor!: RichTextEditorComponent;
  @ViewChild('chatEditors') chatEditors!: RichTextEditorComponent;
  @ViewChild('chatEditorElement') chatEditorElement!: RichTextEditorComponent;
  @ViewChild('questionEditor') questionEditor!: RichTextEditorComponent;
  @ViewChild('errorEditor') errorEditor!: RichTextEditorComponent;
  @ViewChild('minDatePicker') minDatePicker!: DatePickerComponent;
  @ViewChild('maxDatePicker') maxDatePicker!: DatePickerComponent;
  @ViewChild('bodyEditor') bodyEditor!: RichTextEditor;

  // Forms
  notificationForm!: FormGroup;
  sendTextForm!: FormGroup;
  questionOption!: FormGroup;
  openQuestion!: FormGroup;
  listOptions!: FormGroup;
  conditionsForm!: FormGroup;
  buttonOptions!: FormGroup;
  contactAttributeForm!: FormGroup;
  conditionForm!: FormGroup;
  notesmentionForm!: FormGroup
  whatsAppFlowForm!: FormGroup


  // Data collections
  filteredAgents: Agent[] = [];

  availableAgents: Agent[] = [];

  botsList: Bot[] = [];
  allTags: Tag[] = [];
  sampleVariables: any = [];
  attributeList: any = [];



  // Operators and actions
  stringOperators = STRING_OPERATORS
  numberOperators = NUMBER_OPERATORS;
  booleanOperators = BOOLEAN_OPERATORS;
  logicalOperator = 'and';

  actions = DEFAULT_ACTIONS

  // Input/Output properties
  @Input() conditions: any[] = [];
  @Input() agents: Agent[] = this.filteredAgents;
  @Input() availableAttributes: any = attributes
  @Input() availableVariables = ['bot.name', 'contact.city', 'session.date'];
  @Input() selectedTags: { TagId: number; TagName: string }[] = [];
  @Input() selectedTagsRemoveTag: { TagId: number; TagName: string }[] = [];

  @Output() conditionsChange = new EventEmitter<any[]>();
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() tagsSelected = new EventEmitter<{ tags: string[], options: any }>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() timeDelaySet = new EventEmitter<{ time: number, unit: string }>();

  // Other properties
  channelName: any = environment.chhanel
  maxCharacters = 4056;
  characterCount = 0;
  ParentNodeType = '';
  currentModal: any = null;
  editor: any;
  userDetails: any;
  activeSidebar: 'main' | 'advance' = 'main';
  selectedAdvanceAction: any = null;
  invalidTime = false;
  selectedBotId = '';
  selectedBot: Bot | null = null;
  searchTerm = '';
  operationOptions = 'addIfEmpty';
  conversationActions = { status: 'Resolved' };
  openDropdown = { status: '' };
  filteredTags: Tag[] = [];
  showVarMenuFor: { index: number, field: 'comparator' | 'value' } | null = null;
  showAttribute: { index: number, field: 'comparator' | 'value' } | null = null;
  showAttributeCondition:any =false;
  attributeDetails?: Attribute;
  // Tools and settings
  tools: any = DEFAULT_TOOLS;
  basicTools = DEFAULT_TOOLS;
  semiAdvanceTool: any = DEFAULT_TOOLS
  attachementTool: any = DEFAULT_TOOLS
  pasteCleanupSettings = PASTE_CLEANUP_SETTINGS
  botTimeout:any=''

  public insertImageSettings: object = {
    width: '50px',
    height: '50px'
  };
@ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;
  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  if (!this.dropdownWrapper?.nativeElement.contains(event.target)) {
    this.openDropdown.status = ''; // Close if clicked outside
  }
}


  
  constructor(
    private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef,
    public validation: PhoneValidationService,private modalService: NgbModal,
    private apiService: TeamboxService, private botService: BotserviceService, public settingService: SettingsService, public router: Router
  ) {
    this.botTimeout = localStorage.getItem('botTimeOut');
    this.userDetails = JSON.parse(sessionStorage.getItem('loginDetails') || '{}');
    var viewMode:any = localStorage.getItem('viewMode') == undefined?false:localStorage.getItem('viewMode')
    if (viewMode) {
       this.viewMode =  JSON.parse(viewMode)
    }
    
    //     if (!settingService?.checkRoleExist('24')) {
    //   this.router.navigateByUrl('/login');
    // }
    this.initForms();
  }

  ngOnInit(): void {
    this.initEditor();
    this.getStaticData()
    this.getAdditionalAttributes()
    this.getUserList()
    this.getTagData();
    this.getBotDetails()
    this.getWhatsAppDetails()
    this.getChannelWhatsAppOrWeb()
    if (environment.chhanel == 'api') {
      this.getWhatsAppFormList()
    }

  }




  getStaticData() {

    this.filteredAgents = this.botService.FILTERED_AGENTS
    this.botsList = this.botService.AVAILABLE_BOTS;



  }
  // ==================== INITIALIZATION METHODS ====================


  isOpen = {
    send: false,
    ask: false,
    condition: false
  };

  toggle(section: 'send' | 'ask' | 'condition') {
    this.isOpen[section] = !this.isOpen[section];
  }

  openSidebar(type: 'main' | 'advance') {
    this.activeSidebar = type;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  drop(event: DragEvent): void {
    event.preventDefault();
    const nodeType = event.dataTransfer?.getData('nodeType');
    if (nodeType) {
      // this.createNewNode(nodeType);
    }
  }

  initEditor(): void {
    const drawflowElement = document.getElementById('drawflow');
    if (!drawflowElement) return;

    this.editor = new Drawflow(drawflowElement);
    this.editor.start();

    // Zoom out initially
    Array.from({ length: 3 }).forEach(() => this.editor.zoom_out());

    this.editor.on('nodeSelected', (id: any) => {
      this.selectedNodeId = id;
    });

    this.editor.on('nodeRemoved', (id: any) => {
      this.selectedNodeId = null;
      const drawflowData = this.editor.export();
      const nodes: any = Object.values(drawflowData.drawflow.Home.data);
      if (nodes.length > 0) {
        this.editor.removeNodeInput(nodes[0]?.id, "input_1");
      }
    });


    this.editor.on('connectionCreated', (connection: any) => {
      const drawflowData = this.editor.export().drawflow.Home.data;

      const source = connection.output_id;
      const target = connection.input_id;




      const homeCardId: any = Object.keys(drawflowData).find(key =>
        drawflowData[key].name === 'home'
      );
      var count = 0
      // 2. If this is a connection FROM the home card
      if (source === homeCardId) {
        const homeNode = drawflowData[homeCardId];
        const existingConnections = homeNode.outputs?.output_1?.connections || [];
        existingConnections.forEach((element: any) => {
          if (element.output == 'input_1') {
            count = count + 1
          }
        });

        // If home already has a connection, block new ones
        if (count > 1) {
          setTimeout(() => {
            this.editor.removeSingleConnection(
              connection.output_id,
              connection.input_id,
              connection.output_class,
              connection.input_class
            );
            // alert('The home card can only connect to one card!');
            this.showToaster('The home card can only connect to one card!','error')

          }, 10);
          return;
        }
      }





      // Function to detect circular references
      const isCircular = (startId: string, targetId: string, visited = new Set()) => {
        if (startId === targetId) return true;
        if (visited.has(startId)) return false;

        visited.add(startId);

        const node = drawflowData[startId];
        if (!node || !node.outputs) return false;

        for (const output of Object.values(node.outputs)) {
          const outputObj = output as { connections: any[] };
          for (const conn of outputObj.connections) {
            if (isCircular(conn.node.toString(), targetId, visited)) {
              return true;
            }
          }
        }

        return false;
      };

      if (isCircular(target.toString(), source.toString())) {
        setTimeout(() => {
          this.editor.removeSingleConnection(
            connection.output_id,
            connection.input_id,
            connection.output_class,
            connection.input_class
          );

          // Optional: Show a notification to the user
          alert('Circular connections are not allowed!');
        }, 10);

      }
    });

    if (localStorage.getItem('node_FE_Json')) {
      this.botVariables = JSON.parse(localStorage.getItem('botVarList') || '[]');

      var data: any = localStorage.getItem('node_FE_Json')
      this.loadFlow(JSON.parse(data))
      // this.loadFlow(data)
    }





    const drawflowCanvas = drawflowElement.querySelector('.drawflow') as HTMLElement;
let isRightClickDragging = false;
// Prevent right-click default menu
drawflowCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Right-click down
drawflowCanvas.addEventListener('mousedown', (e) => {
  
  if (e.button === 2 || e.button == 0) { // Right click
    isRightClickDragging = true;
    drawflowCanvas.classList.add('dragging');
  }
});



// Release
document.addEventListener('mouseup', (e) => {
  if ((e.button === 2 || e.button == 0 )&& isRightClickDragging) {
    isRightClickDragging = false;
    drawflowCanvas.classList.remove('dragging');
  }
});


  }



  loadFlow(exportedData: any): void {
    if (this.editor) {
      this.editor.clear(); // Optional: clear existing data
      this.editor.import(exportedData);
      setTimeout(() => {
        Object.values(this.editor.drawflow.drawflow.Home.data).forEach((node: any) => {
          if (node?.data?.formData) {
            this.cardType = node.data.text;
            this.ParentNodeType = node.data.category;
            this.setOutputPositionsBasedOnType(node.id, node.data.formData);
            // this.refreshEditor()
            if (!this.viewMode) {
              this.addNodeEvent(node.id);
            }
            this.editor.updateConnectionNodes('node-' + node.id);
          }
        });
      }, 100)
    }

    if (this.viewMode) {
      this.editor.editor_mode = 'view';  
      
    }
  }




  updateOutputStylesInHtml(nodeId: number): void {
    const nodeData = this.editor.drawflow?.drawflow.Home?.data?.[nodeId];

    if (!nodeData || !nodeData.html) return;

    // Create temp container to modify HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = nodeData.html;

    const outputs = tempDiv.querySelectorAll('.output');
    if (outputs.length === 0) return;

    // Set the first output's style (from top)
    outputs[0].setAttribute('style', 'position:absolute;top:20px;');

    // Optional: Second output special case
    if (outputs.length > 1) {
      outputs[1].setAttribute('style', 'position:absolute;top:41px;border-color:red;');
    }

    // Remaining outputs from bottom
    let offset = 30;
    outputs.forEach((output, index) => {
      if (index > 1) {
        output.setAttribute('style', `position:absolute;bottom:${offset}px;top:unset;`);
        offset += 45;
      }
    });

    // Save updated inner HTML
    nodeData.html = tempDiv.innerHTML;
  }



  /**
 * Get all input connections for a specific node
 * @param nodeId - The ID of the node (card)
 * @returns Array of input connections
 */
  getInputConnections(nodeId: string) {
    const drawflowData = this.editor.export().drawflow.Home.data;
    const node = drawflowData[nodeId];

    if (!node || !node.inputs) return [];

    const inputConnections: Array<{
      inputClass: string,  // e.g., "input_1"
      sourceNode: string,  // ID of the connected node
      sourceOutput: string // e.g., "output_1"
    }> = [];

    // Loop through all inputs of the node
    Object.entries(node.inputs).forEach(([inputKey, inputData]) => {
      const connections = (inputData as any).connections;
      if (connections && connections.length > 0) {
        connections.forEach((conn: any) => {
          inputConnections.push({
            inputClass: inputKey,       // e.g., "input_1"
            sourceNode: conn.node,      // ID of the source node
            sourceOutput: conn.output   // e.g., "output_1"
          });
        });
      }
    });

    return inputConnections;
  }



  private initForms(): void {
    this.initSendTextForm();
    this.initQuestionOptionForm();
    this.initButtonOptionsForm();
    this.initListOptionsForm();
    this.initOpenQuestionForm();
    this.initConditionForm();
    this.initContactAttributeForm();
    this.initNotificationForm();
    this.noteAndMentionForm()
    this.initwhatsAppFlowForm()
  }

  private initSendTextForm(): void {
    this.sendTextForm = this.fb.group({
      textMessage: [''],
      file: [null]
    });

    // this.sendTextForm.get('textMessage')?.valueChanges.subscribe(val => {
    //   this.characterCount = val?.length || 0;
    // });
  }

  private initQuestionOptionForm(): void {
    this.questionOption = this.fb.group({
      questionText: ['', [Validators.required]],
      questionTextMessage: [''],
      options: this.fb.array([this.createOptionControl()], [this.atLeastOneOptionRequired(),this.atLeastOneAndUniqueOptions()]),
      saveAnswerVariable: [''],
      promptMessage: [this.getPromptMessage()],
      reattemptsAllowed: [false],
      reattemptsCount: [1],
      errorMessage: ['', [Validators.maxLength(this.MAX_CHARACTERS)]],
      invalidAction: ['skip'],
      enableTimeElapse: [false],
      timeElapseMinutes: [''],
      timeElapseAction: ['skip'],
      saveAsVariable: [false],
      variableName: [''],
      variableDataType: ['text'],
      enableValidation: [false]
    }, { validators: this.timeElapseValidator(this.botTimeout) });


      this.questionOption.get('enableTimeElapse')?.valueChanges.subscribe(enabled => {
      const timeControl = this.questionOption.get('timeElapseMinutes');
      if (enabled) {
        timeControl?.setValidators([Validators.required]);
      } else {
        timeControl?.clearValidators();
      }
      timeControl?.updateValueAndValidity();
      this.questionOption.updateValueAndValidity();
    });

    // ✅ Trigger validator on timeElapseMinutes changes
    this.questionOption.get('timeElapseMinutes')?.valueChanges.subscribe(() => {
      this.questionOption.updateValueAndValidity();
    });


    this.setupFormListeners(this.questionOption);

      this.options.valueChanges.subscribe((vals: string[]) => {
    const defaultPrompt = this.getPromptMessage();
    const currentPrompt = this.questionOption.get('promptMessage')?.value;

    if (!currentPrompt || currentPrompt.startsWith('Please type a number from')) {
      this.questionOption.get('promptMessage')?.setValue(defaultPrompt);
    }
  });

    this.questionOption.get('options')?.valueChanges.subscribe(value => {
            this.changeDetectorRef.detectChanges();
            this.atLeastOneAndUniqueOptions();
          });
  }

  createOptionControl(): FormControl {
  return this.fb.control('', Validators.required);
}


atLeastOneOptionRequired(): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    const controls = (formArray as FormArray).controls;
    const hasAtLeastOne = controls.some(control => !!control.value?.trim());
    return hasAtLeastOne ? null : { atLeastOneOption: true };
  };
}

atLeastOneAndUniqueOptions() {
  return (formArray: AbstractControl): ValidationErrors | null => {
    const controls = (formArray as FormArray).controls;

    // Normalize: trim + lowercase for comparison
    const normalizedValues = controls
      .map(ctrl => ctrl.value?.trim().toLowerCase())
      .filter(val => val); // remove empty or null

    const hasAtLeastOne = normalizedValues.length > 0;
    const hasDuplicates = new Set(normalizedValues).size !== normalizedValues.length;

    if (!hasAtLeastOne) {
      return { atLeastOneRequired: true };
    }

    if (hasDuplicates) {
      return { duplicateOptions: true };
    }

    return null; // valid
  };
}



  getPromptMessage(): string {
  const count = this.options.length;
  return `Please type a number from 1 to ${count} for your reply`;
}

    private initButtonOptionsForm(): void {
      this.buttonOptions = this.fb.group({
        headerType: ['none'],
        headerText: ['', [Validators.maxLength(60)]],
        bodyText: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]],
        footerText: ['', [Validators.maxLength(60)]],
        buttons: this.fb.array([this.fb.control('', [Validators.required, Validators.maxLength(20)])],[this.atLeastOneAndUniqueButtons()]),
        fileLink: [''],
        saveAsVariable: [false],
        variableName: [''],
        variableDataType: ['text'],
        reattemptsAllowed: [false],
        reattemptsCount: [1],
        errorMessage: ['', [Validators.maxLength(this.MAX_CHARACTERS)]],
        invalidAction: ['skip'],
        enableTimeElapse: [false],
        timeElapseMinutes: [''],
        timeElapseAction: ['skip'],
        enableValidation: [false]
      }, { validators: this.timeElapseValidator(this.botTimeout) });


  this.buttonOptions.get('enableTimeElapse')?.valueChanges.subscribe(enabled => {
      const timeControl = this.buttonOptions.get('timeElapseMinutes');
      if (enabled) {
        timeControl?.setValidators([Validators.required]);
      } else {
        timeControl?.clearValidators();
      }
      timeControl?.updateValueAndValidity();
      this.buttonOptions.updateValueAndValidity();
    });

    // ✅ Trigger validator on timeElapseMinutes changes
    this.buttonOptions.get('timeElapseMinutes')?.valueChanges.subscribe(() => {
      this.buttonOptions.updateValueAndValidity();
    });

          this.buttonOptions.get('buttons')?.valueChanges.subscribe(value => {
            this.changeDetectorRef.detectChanges();
            this.atLeastOneAndUniqueButtons();
          });

      this.buttonOptions.get('headerType')?.valueChanges.subscribe(value => {
    const headerControl = this.buttonOptions.get('fileLink'); // or 'headerText' depending on your control name

    if (['image', 'video', 'document'].includes(value)) {
      headerControl?.setValidators([Validators.required]);
    } else {
      headerControl?.clearValidators();
    }

    headerControl?.updateValueAndValidity();
  });


      this.setupFormListeners(this.buttonOptions);
    }

private timeElapseValidator(bottimeout: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const enableTimeElapse = control.get('enableTimeElapse')?.value;
    const timeElapseMinutes = control.get('timeElapseMinutes')?.value;
   
    if (enableTimeElapse && timeElapseMinutes && Number(timeElapseMinutes) >= bottimeout) {
      return { timeElapseExceeded: true };
    }
    return null;
  };
}



atLeastOneAndUniqueButtons() {
  return (formArray: AbstractControl): ValidationErrors | null => {
    const controls = (formArray as FormArray).controls;

    // Normalize: trim + lowercase
    const normalizedValues = controls
      .map(ctrl => ctrl.value?.trim().toLowerCase())
      .filter(val => val); // exclude empty/null

    const hasAtLeastOne = normalizedValues.length > 0;
    const hasDuplicates = new Set(normalizedValues).size !== normalizedValues.length;

    if (!hasAtLeastOne) {
      return { atLeastOneRequired: true };
    }

    if (hasDuplicates) {
      return { duplicateButtons: true };
    }

    return null; // valid
  };
}


  private initListOptionsForm(): void {
    this.listOptions = this.fb.group({
      headerText: ['', [Validators.maxLength(60)]],
      bodyText: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]],
      footerText: ['', [Validators.maxLength(60)]],
      listHeader: ['', [Validators.maxLength(20),Validators.required]],
      sections: this.fb.array([this.createSection()],[this.uniqueRowNamesValidator(),this.sectionHeadingValidator()]),
      saveAsVariable: [false],
      variableName: [''],
      variableDataType: ['text'],
      reattemptsAllowed: [false],
      reattemptsCount: [1],
      errorMessage: ['', [Validators.maxLength(this.MAX_CHARACTERS)]],
      invalidAction: ['skip'],
      enableTimeElapse: [false],
      timeElapseMinutes: [''],
      timeElapseAction: ['skip'],
      enableValidation: [false]
    }, { validators: this.timeElapseValidator(this.botTimeout) });


      this.listOptions.get('enableTimeElapse')?.valueChanges.subscribe(enabled => {
      const timeControl = this.listOptions.get('timeElapseMinutes');
      if (enabled) {
        timeControl?.setValidators([Validators.required]);
      } else {
        timeControl?.clearValidators();
      }
      timeControl?.updateValueAndValidity();
      this.listOptions.updateValueAndValidity();
    });

    // ✅ Trigger validator on timeElapseMinutes changes
    this.listOptions.get('timeElapseMinutes')?.valueChanges.subscribe(() => {
      this.listOptions.updateValueAndValidity();
    });

      this.listOptions.valueChanges.subscribe(() => {
    this.changeDetectorRef.detectChanges();
  });

     this.listOptions.get('sections')?.valueChanges.subscribe(value => {
           this.changeDetectorRef.detectChanges();
          this.uniqueRowNamesValidator();
          this.sectionHeadingValidator();
        });
    this.setupFormListeners(this.listOptions);
  }


uniqueRowNamesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sectionsArray = control as FormArray;
    const allRowNames: string[] = [];
    let duplicateFound = false;

    // Collect all row names from all sections
    sectionsArray.controls.forEach((section: AbstractControl) => {
      const rows = (section as FormGroup).get('rows') as FormArray;
      rows.controls.forEach((row: AbstractControl) => {
        // const rowName = row.get('rowName')?.value?.trim();
        const rawValue = row.get('rowName')?.value;
        const normalizedValue = rawValue?.trim().toLowerCase();
        if (normalizedValue) {
          if (allRowNames.includes(normalizedValue)) {
            duplicateFound = true;
            // Mark the control as invalid
            row.get('rowName')?.setErrors({ notUnique: true });
          } else {
            allRowNames.push(normalizedValue);
          }
        }
      });
    });

    // Clear errors from controls that are now unique
    if (!duplicateFound) {
      sectionsArray.controls.forEach((section: AbstractControl) => {
        const rows = (section as FormGroup).get('rows') as FormArray;
        rows.controls.forEach((row: AbstractControl) => {
          if (row.get('rowName')?.hasError('notUnique')) {
            const errors = { ...row.get('rowName')?.errors };
            delete errors['notUnique'];
            row.get('rowName')?.setErrors(Object.keys(errors).length ? errors : null);
          }
        });
      });
    }

    return null; // We're setting errors on individual controls, not the whole array
  };
}


 sectionHeadingValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sectionsArray = control as FormArray;
    
    // If there's only one section, no validation needed
    if (sectionsArray.length <= 1) {
      // Clear any existing errors on all sections
      sectionsArray.controls.forEach(section => {
        const headingControl = section.get('sectionHeading');
        if (headingControl?.hasError('requiredForMultiple')) {
          const errors = { ...headingControl.errors };
          delete errors['requiredForMultiple'];
          headingControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      });
      return null;
    }

    // For multiple sections, check each section heading
    let hasErrors = false;
    sectionsArray.controls.forEach((section: AbstractControl, index: number) => {
      const headingControl = section.get('sectionHeading');
      const headingValue = headingControl?.value?.trim();
      
      if (!headingValue) {
        hasErrors = true;
        headingControl?.setErrors({ requiredForMultiple: true });
      } else if (headingControl?.hasError('requiredForMultiple')) {
        const errors = { ...headingControl.errors };
        delete errors['requiredForMultiple'];
        headingControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    });

    return hasErrors ? { sectionHeadingsRequired: true } : null;
  };
}

  private initwhatsAppFlowForm(): void {
    this.whatsAppFlowForm = this.fb.group({
      headerText: ['', [Validators.maxLength(60)]],
      bodyText: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]],
      footerText: ['', [Validators.maxLength(60)]],
      whatsAppFormName: ['', [Validators.required,Validators.maxLength(20)]],
      selectedForm: ['', Validators.required],
      reattemptsAllowed: [false],
      reattemptsCount: [1],
      errorMessage: ['', [Validators.maxLength(this.MAX_CHARACTERS)]],
      invalidAction: ['skip'],
      enableTimeElapse: [false],
      timeElapseMinutes: [''],
      timeElapseAction: ['skip'],
      enableValidation: [false]
    }, { validators: this.timeElapseValidator(this.botTimeout) });


      this.whatsAppFlowForm.get('enableTimeElapse')?.valueChanges.subscribe(enabled => {
      const timeControl = this.whatsAppFlowForm.get('timeElapseMinutes');
      if (enabled) {
        timeControl?.setValidators([Validators.required]);
      } else {
        timeControl?.clearValidators();
      }
      timeControl?.updateValueAndValidity();
      this.whatsAppFlowForm.updateValueAndValidity();
    });

    // ✅ Trigger validator on timeElapseMinutes changes
    this.whatsAppFlowForm.get('timeElapseMinutes')?.valueChanges.subscribe(() => {
      this.whatsAppFlowForm.updateValueAndValidity();
    });
    this.setupFormListeners(this.whatsAppFlowForm);
  }

  private initOpenQuestionForm(): void {
    this.openQuestion = this.fb.group({
      questionText: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]],
      saveAsVariable: [false],
      variableName: ['', [this.validateVariableName.bind(this)]],
      variableDataType: ['text'],
      enableValidation: [false],
      answerType: ['text'],
      minChars: [0, Validators.min(0)],
      maxChars: [null, Validators.min(1)],
      textRegex: [''],
      minNumber: [null],
      maxNumber: [null],
      numberRegex: [''],
      minDate: [null],
      maxDate: [null],
      customRegex: [''],
      reattemptsAllowed: [false],
      reattemptsCount: [1, [Validators.min(1)]],
      errorMessage: [''],
      invalidAction: ['skip'],
      enableTimeElapse: [false],
      timeElapseMinutes: ['', [Validators.min(1)]],
      timeElapseAction: ['skip']
    }, { validators: this.timeElapseValidator(this.botTimeout) });

  this.openQuestion.get('enableTimeElapse')?.valueChanges.subscribe(enabled => {
      const timeControl = this.openQuestion.get('timeElapseMinutes');
      if (enabled) {
        timeControl?.setValidators([Validators.required]);
      } else {
        timeControl?.clearValidators();
      }
      timeControl?.updateValueAndValidity();
      this.openQuestion.updateValueAndValidity();
    });

    // ✅ Trigger validator on timeElapseMinutes changes
    this.openQuestion.get('timeElapseMinutes')?.valueChanges.subscribe(() => {
      this.openQuestion.updateValueAndValidity();
    });


    this.setupFormListeners(this.openQuestion);
  }

  private initConditionForm(): void {
    this.conditionForm = this.fb.group({
      conditions: this.fb.array([])
    });
    this.addCondition();
  }

  private noteAndMentionForm(): void {
    this.notesmentionForm = this.fb.group({
      message: [''],
      file: [''],
      mediaType: [''],
      UIIdMention: [this.syncMentionArray() || []]
    });

  }

  private initContactAttributeForm(): void {
    this.contactAttributeForm = this.fb.group({
      selectedAttribute: [null, Validators.required],
      selectedValue: [''],
      inputValue: [''],
      selectedVariable: [''],
      operation: ['replace', Validators.required],
      askQuestion: [false]
    });
  }

  private initNotificationForm(): void {
    this.notificationForm = this.fb.group({
      selectedAgentIds: ['0', Validators.required],
      selectedAgentName: ['',Validators.required],
      textMessage: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]],
      file: [''],
      mediaType: ['']
    });

    this.notificationForm.get('textMessage')?.valueChanges.subscribe(val => {
      this.characterCount = val?.length || 0;
    });
  }

  // ==================== FORM UTILITY METHODS ====================

  createSection() {
    return this.fb.group({
      sectionHeading: ['', [Validators.maxLength(24)]],
      rows: this.fb.array([this.createRow()])
    });
  }
  createRow() {
    return this.fb.group({
      rowName: ['', [Validators.required, Validators.maxLength(24)]],
      rowDescription: ['', [Validators.maxLength(72)]]
    });
  }

  private setupFormListeners(form: FormGroup): void {
    this.setupReattemptsListener(form);
    this.setupTimeElapseListener(form);
    this.setupVariableListener(form);
  }

  private setupReattemptsListener(form: FormGroup): void {
    form.get('reattemptsAllowed')?.valueChanges.subscribe(value => {
      const errorMessageControl = form.get('errorMessage');
      const validators = value
        ? [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]
        : [Validators.maxLength(this.MAX_CHARACTERS)];
      errorMessageControl?.setValidators(validators);
      errorMessageControl?.updateValueAndValidity();
    });
  }

  private setupTimeElapseListener(form: FormGroup): void {
    form.get('enableTimeElapse')?.valueChanges.subscribe(value => {
      const minutesControl = form.get('timeElapseMinutes');
      if (value) {
        minutesControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        minutesControl?.clearValidators();
      }
      minutesControl?.updateValueAndValidity();
    });
  }

  private setupVariableListener(form: FormGroup): void {
    form.get('saveAsVariable')?.valueChanges.subscribe(value => {
      const variableNameControl = form.get('variableName');
      if (value) {
        variableNameControl?.setValidators([Validators.required, this.validateVariableName.bind(this)]);
      } else {
        variableNameControl?.clearValidators();
      }
      variableNameControl?.updateValueAndValidity();
    });
  }

  validateVariableName(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (!/^[a-zA-Z]/.test(value)) {
      errors.invalidStart = true;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      errors.invalidChars = true;
    }

    return Object.keys(errors).length ? errors : null;
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }



createCombinedVariable() {
  // Get the form values
  const formValue = this.questionOption.value;
  
  // Get question text (remove HTML tags if needed)
  const questionText = formValue.questionText || '';
  const plainQuestionText = questionText.replace(/<[^>]*>/g, '').trim();
  
  // Get prompt message (if you have this field)
  const promptMessage = formValue.promptMessage || '';
  
  // Get all options
  const options = formValue.options || [];
  const formattedOptions = options.map((opt:any) => `* ${opt}`).join('\n');
  
  // Combine everything
  const combinedVariable = `${plainQuestionText}\n\n${promptMessage}\n\n${formattedOptions}`;
  
  // Now you can use this combinedVariable as needed
  return combinedVariable;
}

  // ==================== NODE HANDLING METHODS ====================

  onSubmit(formType: string = ''): void {
    
    setTimeout(() => {
      this.isLoading = false
    }, 1000);
    if (['questionOption', 'openQuestion', 'buttonOptions', 'listOptions', 'whatsAppFlow'].includes(this.ParentNodeType)) {
      this.handleQuestionSubmit(formType);
    } else if ([
      'assignAgentModal', 'assigntoContactOwner', 'UnassignConversation',
      'UpdateConversationStatus', 'UpdateContactAttribute', 'AddTags',
      'RemoveTag', 'TimeDelayModal', 'BotTriggerModal', 'MessageOptin',
      'NotificationModal', 'WorkingHoursModal', 'NotesMentionModal'
    ].includes(formType)) {
        
          this.advanceOptionsSubmit(formType);

    } else if (formType == 'setCondition') {
      this.handleConditionSubmit(formType)
    } else {
       this.isLoading = true
      this.handleContentSubmit();
    }
  }

  private handleContentSubmit(): void {
    if (this.sendTextForm.invalid) {
      this.sendTextForm.markAllAsTouched();
      return;
    }

    
    const formData = this.sendTextForm.value;

    if (this.isEditMode && this.selectedNodeId !== null) {
      this.updateExistingNode(formData);
    } else {
      this.createNewNodeWithData(formData);
    }
    this.closeModal();
  }


  handleConditionSubmit(formType: any) {
    if (this.conditionForm.invalid) {
      this.conditionForm.markAllAsTouched();
      return;
    }

    const formData = this.conditionForm.value;
formData.options = ["True", "False"];

    if (this.isEditMode && this.selectedNodeId !== null) {
      this.updateExistingNode(formData);
    } else {
      this.createNewNodeWithData(formData);
    }
    this.closeModal();
  }

  getDefaultValueForType(type: string): any {
    switch (type) {
      case 'text': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'array': return [];
      case 'object': return {};
      default: return null;
    }
  }

  private handleQuestionSubmit(formType: string): void {
    let form: FormGroup;
    let formData: any;



    switch (formType) {
      case 'questionOption':
        this.questionOption.patchValue({
  questionTextMessage: this.createCombinedVariable(),
});
        form = this.questionOption;
        break;
      case 'openQuestion':
        form = this.openQuestion;
        break;
      case 'buttonOptions':
        form = this.buttonOptions;
        break;
      case 'listOptions':
        form = this.listOptions;
        break;
      case 'whatsAppFlow':
        form = this.whatsAppFlowForm;
        break;
      default:
        return;
    }

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    formData = form.value;
    





    if (formData.saveAsVariable && formData.variableName) {
      const newVariable: BotVariable = {
        name: formData.variableName,
        dataType: formData.variableDataType,
        value: this.getDefaultValueForType(formData.variableDataType)
      };

      // Check if variable with same name AND type already exists
  const variableExists = this.botVariables.some(
  v =>
    v.name.trim().toLowerCase() === newVariable.name.trim().toLowerCase());


      if (!variableExists) {
        this.botVariables.push(newVariable);
      } else {
        // Optionally show a message that variable wasn't added because it already exists
        if(!(this.isEditMode && this.selectedNodeId !== null)){
          this.showToaster("Bot variable is already exists Please add another bot variable",'error')
          return;
        }
      }
    }
    this.closeModal();

    if (this.isEditMode && this.selectedNodeId !== null) {
      this.updateExistingNode(formData);
    } else {
      this.createNewNodeWithData(formData);
    }
  }




  dynamiceEditor: any = ''
  private advanceOptionsSubmit(formType: string): void {
  
    this.dynamiceEditor = ''

    const advanceOption = { type: formType, data: {} as any };
    switch (formType) {
      case 'assignAgentModal':
        advanceOption.data = this.selectedAgentDetails;
        break;
      case 'UpdateConversationStatus':
      case 'MessageOptin':
        advanceOption.data = this.conversationActions;
        break;
      case 'UpdateContactAttribute':
        advanceOption.data = this.contactAttributeForm.value;
        break;
      case 'NotificationModal':
        this.dynamiceEditor = this.chatEditorElement
        advanceOption.data = this.notificationForm.value;
        break;
      case 'TimeDelayModal':
  const maxTime = this.delayUnit === 'hour' ? 24 : 60;

  if (!this.delayTime || this.delayTime < 1) {
    this.showToaster('Time must be greater than 0.','error');
    return;
  }

  if (this.delayTime > maxTime) {
    this.showToaster(`Maximum allowed time is ${maxTime} ${this.delayUnit === 'hour' ? 'hours' : 'minutes'}.`,'error');
    return;
  }
        advanceOption.data = { time: this.delayTime, unit: this.delayUnit };
        break;
      case "WorkingHoursModal":
        advanceOption.data = { options:["open",'close'] };
        break;
      case 'BotTriggerModal':
        advanceOption.data = this.selectedBot;
        break;
      case 'NotesMentionModal':
        var editorInstance = this.chatEditors
        this.dynamiceEditor = this.chatEditors
             let data = this.getOnlyUserTypedText(editorInstance)
  
          if(!data){
         this.showToaster('Please add  some Notes and Mention','error');
          return
        }


        this.notesmentionForm.patchValue({
          message: data,
          UIIdMention: this.syncMentionArray() || []
        })
        advanceOption.data = this.notesmentionForm.value;
        break;
      case 'AddTags':
  if (this.selectedTags.length <= 0) {
          this.showToaster('Please select Tag and Operation','error')
          return
        }
        advanceOption.data = {
          tags: this.selectedTags.map(tag => tag.TagName),
          tag: this.selectedTags.map(tag => tag.TagId),
          selectedTags: this.selectedTags,
          operation: this.operationOptions
        };
    break;
      case 'RemoveTag':
        if (this.selectedTagsRemoveTag.length <= 0) {
          this.showToaster('Please select Tag and Operation','error')
          return
        }
        advanceOption.data = {
          tags: this.selectedTagsRemoveTag.map(tag => tag.TagName),
          tag: this.selectedTagsRemoveTag.map(tag => tag.TagId),
          selectedTags: this.selectedTagsRemoveTag,
          operation: this.operationOptions
        };
        break;
    }

      this.closeModal();
    if (this.isEditMode && this.selectedNodeId !== null) {
      // Update existing node logic
      this.updateAdvanceNode(advanceOption)
    } else {
      this.createNewNodeWithData(advanceOption);
    }
  }

  private addHomeIconNode(): void {
    const homeNode = {
      id: 'home',
      name: 'home',
      data: {},
      class: 'home-node',
      html: `
      <div class="">
         <img src="assets/img/home-f.svg" class="ViewNode">
      </div>
    `,
      inputs: {},
      outputs: {
        output_1: {
          connections: []
        }
      },
      pos_x: 100,
      pos_y: 100
    };

    this.editor.addNode('home', 0, 1, 150, 100, 'home', {}, homeNode.html, false);
  }



  getOnlyUserTypedText(editorInstance: any): string {
  const html = editorInstance.value || ''; // Get full HTML

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // ❌ Remove only media blocks with specific class
  const mediaBlocks = tempDiv.querySelectorAll('.custom-class-attachmentType');
  mediaBlocks.forEach(el => el.remove());

  // ✅ Return updated HTML with mentions and user content intact
  return tempDiv.innerHTML.trim();
}


  private createNewNodeWithData(formData: any): void {
    this.isLoading = true
    const nodeName = this.getNodeName();
    const exportData = this.editor.export();
    var hasNodes = Object.keys(exportData.drawflow?.Home?.data).length > 0;



    // Special handling for first card
    if (!hasNodes) {
      // Add home icon to the first card's data
      this.addHomeIconNode()
    }

    hasNodes = Object.keys(exportData.drawflow?.Home?.data).length > 0;
    let outputs = this.calculateOutputCount(formData);

    if (this.cardType == 'assignAgentModal' || this.cardType == 'assigntoContactOwner' || this.cardType == 'UnassignConversation' || this.cardType == 'UpdateConversationStatus' || this.cardType == 'BotTriggerModal') {
      outputs = 0;
    }

    if (this.cardType == 'setCondition' || this.cardType == 'WorkingHoursModal') {
      outputs = 2
    }




    const postData = {
      name: nodeName,
      inputs: 1,
      outputs,
      data: {
        text: this.cardType,
        inputsCount: 1,
        maxButtonLimit: 3,
        category: this.ParentNodeType,
        uniqueId: this.getUniqueId(),
        formData,
        file: formData.file,
        fileName: formData.file?.name || this.uploadedFile?.name || null,
        fileType: formData.file?.type || null,
      },
      html: '<div class="temp-placeholder">Loading...</div>',
      pos_x: Math.floor(Math.random() * 900) + 100,
      pos_y: Math.floor(Math.random() * 400) + 100,
    };

    const nodeId = this.addNode(postData);
    const newHTML = this.createNodeHtml(nodeId, postData.data);
    this.updateNodeHTML(Number(nodeId), newHTML);

    this.setOutputPositionsBasedOnType(nodeId, formData);

    if (!hasNodes) {
      setTimeout(() => {
        const nodeElement = document.getElementById(`node-${nodeId}`);
        if (nodeElement) {
          const deleteButton = nodeElement.querySelector('.drawflow-delete');
          if (deleteButton) {
            deleteButton.remove();
          }
        }
      }, 100);
    }
    if (!hasNodes) {
      setTimeout(() => {
        this.editor.addConnection(nodeId - 1, nodeId, 'output_1', 'input_1');
        this.isLoading = false
      }, 100);
    }


    setTimeout(() => {
      this.editor.drawflow.drawflow.Home.data[nodeId].html = newHTML;
      this.isLoading = false
    }, 100);
    this.nodeCounter++;
  }

  private calculateOutputCount(formData: any): number {
    let outputs = 1;

    if (this.ParentNodeType === 'listOptions') {
      const sectionRows = formData?.sections?.reduce((acc: any, section: any) =>
        acc + (section.rows?.length || 0), 0) || 0;
      outputs = sectionRows + 1;
    } else if (this.ParentNodeType === 'questionOption') {
      outputs = (formData?.options?.length + 1) || 1;
    } else if (this.ParentNodeType === 'buttonOptions') {
      outputs = (formData?.buttons?.length + 1) || 1;
    } else if (this.ParentNodeType === 'whatsAppFlow') {
      outputs = 2
    }

    if (formData?.invalidAction === "fallback" || formData?.timeElapseAction === "fallback") {
      outputs += 1;
    }

    return outputs;
  }

  private setOutputPositionsBasedOnType(nodeId: any, formData: any): void {
    if (this.ParentNodeType === 'listOptions') {
      this.setOutputPositionsForList(nodeId, formData);
    } else {
      const actionValue =  (formData?.invalidAction === 'fallback' || formData?.timeElapseAction === 'fallback')? 'fallback': formData?.invalidAction
      this.setOutputPositions(Number(nodeId), actionValue);
    }
  }

  private setOutputPositions(nodeId: number, fallbackAction: string = ''): void {
    const node = document.getElementById(`node-${nodeId}`);
    if (!node) return;

    const outputs = node.querySelectorAll('.outputs .output');
    if (outputs.length === 0) return;

    // Position first output
     if (this.cardType == 'setCondition' || this.cardType == 'WorkingHoursModal') {
     
       const output1 = outputs[0] as HTMLElement;
       output1.style.position = 'absolute';
       output1.style.bottom = `75px`;
       output1.style.top = 'unset';
    }else{
             const output1 = outputs[0] as HTMLElement;
       output1.style.position = 'absolute';
       output1.style.top = '20px';
    }
    

    let remainingOutputs = Array.from(outputs).slice(1);

    if (fallbackAction === "fallback") {
      const output2 = outputs[1] as HTMLElement;
      if(output2 != undefined){
        output2.style.position = 'absolute';
        output2.style.top = '41px';
        output2.style.borderColor = 'red'; // ✅ use camelCase
      }
      remainingOutputs = remainingOutputs.slice(1);
    }
    let size = 30;
    remainingOutputs.forEach((output: any) => {
      if (output?.style) {
        output.style.position = 'absolute';
        output.style.bottom = `${size}px`;
        size += 45;
        output.style.top = 'unset';
      }
    });
  }

  private setOutputPositionsForList(nodeId: any, formData: any): void {
    const node = document.getElementById(`node-${nodeId}`);
    if (!node) return;

    const outputs = node.querySelectorAll('.outputs .output');
    if (outputs.length === 0) return;

    // Position first output
    const output1 = outputs[0] as HTMLElement;
    output1.style.position = 'absolute';
    output1.style.top = '20px';

    let remainingOutputs = Array.from(outputs).slice(1);
    if (formData?.invalidAction === "fallback" || formData?.timeElapseAction === "fallback") {
      const output2 = outputs[1] as HTMLElement;
      output2.style.position = 'absolute';
      output2.style.top = '41px';
      output2.style.borderColor = 'red'; // ✅ use camelCase
      remainingOutputs = remainingOutputs.slice(1);
    }



    const bottomOffsets = this.generateBottomOffsetsReversed(formData?.sections);
    remainingOutputs.forEach((output: any, index: number) => {
      const bottom = bottomOffsets[index] ?? (60 + index * 45);
      if (output?.style) {
        output.style.position = 'absolute';
        output.style.bottom = `${bottom}px`;
        output.style.top = 'unset';
      }
    });
  }

   getTrimmedText = (text: string | undefined) =>{
    
    const maxLength = 132;
  return text && text.length > maxLength ? text.slice(0, maxLength) + ' ...' : text || 'Sample Text';
  }

  private generateBottomOffsetsReversed(sections: any[]): number[] {
    const offsets: number[] = [];
    let bottom = 60;

    for (let i = sections?.length - 1 || 0; i >= 0; i--) {
      const section = sections[i];
      const rows = section?.rows || [];

      for (let j = 0; j < rows.length; j++) {
        offsets.push(bottom);
        bottom += 50;
      }

      if (i > 0) {
        bottom += 60;
      }
    }
    return offsets;
  }

  private createNodeHtml(nodeId: any, nodeData: any): string {
    const formData = nodeData.formData || {};
    const templateHead = this.getTemplateHeader();
    const temHeaderStyle = this.getTemplateHeaderStyle(nodeData);

    let newHTML = `<div class="box_111 break-text" style="${temHeaderStyle}">
      <span class="temName">${this.getDisplayName(nodeData)}</span>
    </div>`;



    if (this.ParentNodeType !== 'Advance_Action') {
      newHTML += this.createStandardNodeContent(nodeId, nodeData, formData);
    } else {
      newHTML += this.createAdvanceActionContent(nodeData, formData);
    }
    newHTML += `
      <div class="viewSection">
        <img src="assets/img/edit.png" style="cursor:pointer" class="ViewNode editNode">
      </div>
      <div class="viewSectioncopy">
        <img src="assets/img/teambox/copy.svg" style="cursor:pointer" class="ViewNode copyNode">
      </div>
      <div class="viewSectionDelete">
        <img src="assets/img/delete.svg" style="cursor:pointer" class="ViewNode deleteNode">
      </div>
    `;

    return newHTML;
  }

  private getTemplateHeader(): string {
    const typeMap: Record<string, string> = {
      'sendMessage': 'Send',
      'questionOption': 'Question',
      'whatsAppFlow': 'WhatsApp',
      'openQuestion': 'Open',
      'buttonOptions': 'Button',
      'listOptions': 'List',
      'setConditionsModal': 'Set'
    };
    return typeMap[this.ParentNodeType] || 'Ask';
  }

  private getTemplateHeaderStyle(nodeData: any): string {
    const styleMap: Record<string, string> = {
      'sendMessage': 'background:#dadee2',
      'questionOption': 'background:#fce4e4',
      'openQuestion': 'background:#fce4e4',
      'buttonOptions': 'background:#fce4e4',
      'listOptions': 'background:#fce4e4',
      'whatsAppFlow': 'background:#fce4e4',
      'List': 'background:#f93',
      'Advance_Action': 'background:#BEDBF5',
      'setCondition': 'background:#fff9dc'
    };
    return styleMap[nodeData.text] || styleMap[this.ParentNodeType] || 'background:#4bc25a';
  }

  private getDisplayName(nodeData: any): string {
    if (this.ParentNodeType === 'Advance_Action') {
      return this.getAdvanceNodeName(this.cardType);
    }
    return `${this.getTemplateHeader()} ${this.getNodeName()}`;
  }

  private createStandardNodeContent(nodeId: any, nodeData: any, formData: any): string {
    let content = '';



   if (['sendImage', 'sendVideo', 'sendDocument'].includes(this.cardType)) {
  content += this.createMediaContent(nodeData);
  if (formData.textMessage) {
    content += `<div class="textCont">${this.getTrimmedText(formData.textMessage)}</div>`;
  }
} else if (nodeData.text === 'sendText') {
  content += `<div class="textCont">${this.getTrimmedText(formData.textMessage)}</div>`;
} else if (nodeData.text === 'openQuestion') {
  content += `<div class="textCont">${this.getTrimmedText(formData.questionText)}</div>`;
}else if (nodeData.text === 'questionOption') {
      content += this.createQuestionOptionContent(nodeId, formData);
    } else if (nodeData.text === 'buttonOptions') {
      content += this.createButtonOptionsContent(nodeId, nodeData, formData);
    } else if (nodeData.text === 'listOptions') {
      content += this.createListOptionsContent(nodeId, formData);

    } else if (nodeData.text === 'whatsAppFlow') {
      content += this.createwhatsAppFlowContent(nodeId, formData);
    }

    else if (nodeData.text === 'setCondition') {
      content += this.createsetConditionContent(nodeId, formData);

    }
    return content;
  }

  private createMediaContent(nodeData: any): string {
    let mediaContent = '<div class="textContImage">';
    var mediaSrc = nodeData.file ? this.filePreview || this.selectedImageUrl : 'assets/img/not_found.jpg';
    if (mediaSrc == null || mediaSrc == undefined || mediaSrc == '') {
      mediaSrc = nodeData.file
    }

    if (this.cardType === 'sendImage' || nodeData.mediaType == "image/png") {
      mediaContent += `<img alt="Image Preview" src="${mediaSrc}" class="Preview" style="max-width: 100%;" class="mb-2" />`;
    } else if (this.cardType === 'sendVideo' || nodeData.mediaType == "video/mp4") {
      mediaContent += `<video src="${mediaSrc}" class="Preview mb-2" controls style="max-width: 100%;"></video>`;
    } else if (this.cardType === 'sendDocument' || nodeData.mediaType == "document") {
      mediaContent += `<img alt="Document Preview" src="assets/img/document.png" class="Preview" style="max-width: 100%;" class="mb-2" />`;
    }

    mediaContent += '</div>';
    return mediaContent;
  }

  private createQuestionOptionContent(nodeId: any, formData: any): string {
    let content = '<div class="textQuestion">';
    if (formData.questionText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.questionText)}</h6>`;
    }
    content += '</div>';

    let buttonHTML = '';
    if (formData?.options?.length) {
      buttonHTML = formData.options.map((buttonElement: any) => {
        const uniqueId = this.generateRandom6DigitNumber();
        return `<button style="display:block;" class="btn btn_theme3 btn-block customButton mt-2 nodeButton-${nodeId} button_id-${uniqueId}">${buttonElement}</button>`;
      }).join('');
    }

    content += `<div class="buttons">${buttonHTML}</div>`;
    return content;
  }

  private createButtonOptionsContent(nodeId: any, nodeData: any, formData: any): string {
    
    let content = '<div class="textQuestion">';

    if (formData.headerText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.headerText)}</h6>`;
    }

    if (['image', 'video', 'document'].includes(formData?.headerType)) {
      content += this.createHeaderMediaContent(nodeData, formData.headerType);
    }

    if (formData?.bodyText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.bodyText) || 'Sample Body Text'}</h6>`;
    }

    if (formData?.footerText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.footerText)}</h6>`;
    }

    content += '</div>';

    let buttonHTML = '';
    if (formData?.buttons?.length) {
      buttonHTML = formData.buttons.map((buttonElement: any) => {
        const uniqueId = this.generateRandom6DigitNumber();
        return `<button style="display:block;" class="btn btn_theme3 btn-block customButton mt-2 nodeButton-${nodeId} button_id-${uniqueId}">${buttonElement}</button>`;
      }).join('');
    }

    content += `<div class="buttons">${buttonHTML}</div>`;
    return content;
  }

  private createHeaderMediaContent(nodeData: any, headerType: string): string {
    let mediaContent = '<div class="textContImage">';
    
    if(nodeData.file == null){
      nodeData.file = nodeData.formData.fileLink
    }
    const mediaSrc = nodeData.file ? this.filePreview || this.selectedImageUrl : 'assets/img/not_found.jpg';

    switch (headerType) {
      case 'image':
        mediaContent += `<img alt="Image Preview" src="${mediaSrc}" class="Preview" style="max-width: 100%;" class="mb-2" />`;
        break;
      case 'video':
        mediaContent += `<video src="${mediaSrc}" class="Preview mb-2" controls style="max-width: 100%;"></video>`;
        break;
      case 'document':
        mediaContent += `<img alt="Document Preview" src="assets/img/document.png" class="Preview" style="max-width: 100%;" class="mb-2" />`;
        break;
    }

    mediaContent += '</div>';
    return mediaContent;
  }

  private createListOptionsContent(nodeId: any, formData: any): string {
    let content = '<div class="textQuestion">';

    if (formData.headerText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.headerText)}</h6>`;
    }

    if (formData.bodyText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.bodyText)}</h6>`;
    }

    if (formData.footerText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.footerText)}</h6>`;
    }

    content += '</div>';

    if (formData.listHeader) {
      content += `<h6 class="listHeader text-center text-primary font-semibold underline my-2">${formData.listHeader}</h6>`;
    }

    if (formData?.sections?.length > 0) {
      formData.sections.forEach((section: any) => {
        content += `<div class="section-card" style="background:#FFF4F2; padding: 10px; margin-bottom: 12px; border-radius: 12px;">`;

        if (section.sectionHeading) {
          content += `<h6 class="section-heading font-semibold text-center mb-2">${section.sectionHeading}</h6>`;
        }

        if (section.rows?.length > 0) {
          section.rows.forEach((row: any) => {
            const uniqueId = this.generateRandom6DigitNumber();
            content += `
              <div class="option-row flex justify-between items-center bg-white p-2 rounded-md shadow-sm mb-2 nodeButton-${nodeId} button_id-${uniqueId}" style="background: #F7F7F7 !important;border: 1px solid #d7bcbc;border-radius: 13px;">
                <span>${row.rowName}</span>
                <span class="dot bg-green-500 w-3 h-3 rounded-full"></span>
              </div>
            `;
          });
        }

        content += `</div>`;
      });
    }

    return content;
  }

  private createwhatsAppFlowContent(nodeId: any, formData: any): string {
    let content = '<div class="textQuestion">';

    if (formData.whatsAppFormName) {
      content += `<h6 class="section-heading font-semibold text-center mb-2">${this.getTrimmedText(formData.whatsAppFormName)}</h6>`;
    }

    if (formData.headerText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.headerText)}</h6>`;
    }

    if (formData.bodyText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.bodyText)}</h6>`;
    }

    if (formData.footerText) {
      content += `<h6 class="body_text">${this.getTrimmedText(formData.footerText)}</h6>`;
    }

    content += '</div>';


    let buttonHTML = '';

    // buttonHTML = formData.options.map((buttonElement: any) => {
    const uniqueId = this.generateRandom6DigitNumber();
    buttonHTML = buttonHTML + `<button style="display:block;" class="btn btn_theme3 btn-block customButton mt-2 nodeButton-${nodeId} button_id-${uniqueId}">Submitted</button>`;
    content += `<div class="buttons">${buttonHTML}</div>`;


    


    return content;


  }

  private createAdvanceActionContent(nodeData: any, formData: any): string {
    let content = '';

    switch (nodeData.text) {
      case 'assignAgentModal':
        content = `<div class="textCont"><p>Assign conversation to agent <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;"> ${formData.data.name}<span></p></div>`;
        break;
      case 'assigntoContactOwner':
        content = `<div class="textCont"><p>Conversation Assign to contact owner <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">contact owner<span></p></div>`;
        break;
      case 'UnassignConversation':
        content = `<div class="textCont"><p>conversation will be moved to <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">Unassigned Tab<span></p></div>`;
        break;
      case 'UpdateConversationStatus':
        content = `<div class="textCont"><p>Update Conversation Status <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.status}<span></p></div>`;
        break;
      case 'UpdateContactAttribute':
        content = `<div class="textCont"><p>Update Contact Attribute <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.selectedValue}<span></p></div>`;
        break;
      case 'AddTags':
        content = `<div class="textCont"><p>Add Tag <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData?.data?.tags?.join(',')}<span></p></div>`;
        break;
      case 'RemoveTag':
        content = `<div class="textCont"><p>Add Tag <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;"> ${formData?.data?.tags?.join(',')}<span></p></div>`;
        break;
      case 'TimeDelayModal':
        content = `<div class="textCont"><p>Time Delay <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.time} ${formData.data.unit}<span></p></div>`;
        break;
      case 'BotTriggerModal':
        content = `<div class="textCont"><p>Trigger Bot <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.name}<span></p></div>`;
        break;
      case 'MessageOptin':
        content = `<div class="textCont"><p>Message Opt-in <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.status}<span></p></div>`;
        break;
      case 'NotificationModal':
        content = `<div class="textCont"><p>Notify <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.selectedAgentName}<span></p></div>`;
        break;

      case 'NotesMentionModal':


        if (formData.data.file != null) {
          content += this.createMediaContent(formData.data);
        }
        if (formData.data.message) {
          
          content += `<div class="textCont">${this.getTrimmedText(formData.data.message)} </a></span></p></div>`;
        }
        break;
      case 'WorkingHoursModal':
        let buttonHTML = '';

        // buttonHTML = formData.options.map((buttonElement: any) => {
        const uniqueId = this.generateRandom6DigitNumber();
        buttonHTML = buttonHTML + `<button style="display:block;" class="btn btn_theme3 btn-block customButton mt-2 nodeButton-${nodeData.id} button_id-${uniqueId}">Open</button>`;
        buttonHTML = buttonHTML + `<button style="display:block;" class="btn btn_theme3 btn-block customButton mt-2 nodeButton-${nodeData.id} button_id-${uniqueId}">Close</button>`;
        content += `<div class="buttons">${buttonHTML}</div>`;
        return content;
        break;
    }

    return content;
  }



syncMentionArray() {
  const htmlContent = this.chatEditors?.value;
  if (!htmlContent) return [];

  // Parse the string as HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Query all mention elements
  const mentionElements = doc.querySelectorAll('.e-mention-chip');

  // Extract all data-uid values
  const ids: string[] = Array.from(mentionElements)
    .map((el: Element) => el.getAttribute('data-uid') || '');

  return ids || [];
}

  private createsetConditionContent(nodeId: any, formData: any): string {
    let content = ''

    let buttonHTML = '';

    // buttonHTML = formData.options.map((buttonElement: any) => {
    const uniqueId = this.generateRandom6DigitNumber();
    buttonHTML = buttonHTML + `<button style="display:block;" class="btn btn_theme3 btn-block customButton mt-2 nodeButton-${nodeId} button_id-${uniqueId}">Condition Met</button>`;
    buttonHTML = buttonHTML + `<button style="display:block;" class="btn btn_theme3 btn-block customButton mt-2 nodeButton-${nodeId} button_id-${uniqueId}">Condition Not Met</button>`;
    content += `<div class="buttons">${buttonHTML}</div>`;
    return content;
  }


  private getNodeName(): string {
    const nodeNames: Record<string, string> = {
      'sendText': 'Message',
      'sendImage': 'Image',
      'sendVideo': 'Video',
      'sendDocument': 'Document',
      'questionOption': 'Options',
      'openQuestion': 'Question',
      'buttonOptions': 'Options',
      'listOptions': 'Options',
      'whatsAppFlow': 'Flow',
      'setCondition': 'Condition'
    };
    return nodeNames[this.cardType] || 'Node';
  }

  private getAdvanceNodeName(cardType: string): string {
    const action = this.actions.find(a => a.modal === cardType);
    return action?.label || 'Advance Action';
  }

  private getUniqueId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRandom6DigitNumber(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private addNode(postData: any): number {
    return this.editor.addNode(
      postData.name,
      postData.inputs,
      postData.outputs,
      postData.pos_x,
      postData.pos_y,
      postData.name,
      postData.data,
      postData.html
    );
  }

  private updateNodeHTML(nodeId: number, newHTML: string): void {
    const node = this.editor.getNodeFromId(nodeId);
    if (!node) return;

    node.html = newHTML;
    const nodeElement = document.querySelector(`#node-${nodeId} .drawflow_content_node`);
    if (!nodeElement) return;

    const scrollTop = nodeElement.scrollTop;
    const scrollLeft = nodeElement.scrollLeft;

    nodeElement.innerHTML = newHTML;
    this.addNodeEvent(nodeId);

    nodeElement.scrollTop = scrollTop;
    nodeElement.scrollLeft = scrollLeft;

    this.isLoading = false
  }

  private addNodeEvent(nodeId: number): void {
    setTimeout(() => {
      const nodeElement = document.querySelector(`#node-${nodeId}`);
      if (!nodeElement) return;

      const editNodeIconClick = nodeElement.querySelector('.editNode');
      if (editNodeIconClick) {
        editNodeIconClick.removeEventListener('click', this.handleEditClick);
        this.handleEditClick = (event: Event) => {
          event.stopPropagation();
          this.openEditModal(nodeId);
        };
        editNodeIconClick.addEventListener('click', this.handleEditClick);
      }

      const copyNodeIconClick = nodeElement.querySelector('.copyNode');
      if (copyNodeIconClick) {
        copyNodeIconClick.removeEventListener('click', this.handleCopyClick);
        this.handleCopyClick = (event: Event) => {
          event.stopPropagation();
          this.copyNode(nodeId);
        };
        copyNodeIconClick.addEventListener('click', this.handleCopyClick);
      }
      const deleteNodeIconClick = nodeElement.querySelector('.deleteNode');
      if (deleteNodeIconClick) {
        deleteNodeIconClick.removeEventListener('click', this.handleDeleteClick);
        this.handleDeleteClick = (event: Event) => {
          event.stopPropagation();
          
          this.deletNodeId = nodeId
          $('#deletBotCard').modal('show')
        };
        deleteNodeIconClick.addEventListener('click', this.handleDeleteClick);
      }
    }, 0);
  }

  private updateExistingNode(formData: any): void {
    if (this.selectedNodeId === null) return;
    this.isLoading = true

    const node = this.editor.getNodeFromId(this.selectedNodeId);
    node.data.formData = formData;

    if (['sendImage', 'sendVideo', 'sendDocument'].includes(this.cardType)) {
      node.data.file = formData.file;
    }

    const currentOutputsCount = Object.keys(node.outputs).length;
    let newOutputsCount = currentOutputsCount;

    if (this.ParentNodeType === 'listOptions') {
      const sectionRows = formData?.sections?.reduce((acc: any, section: any) =>
        acc + (section.rows?.length || 0), 0) || 0;
      newOutputsCount = sectionRows + 1;
    } else if (this.ParentNodeType === 'questionOption') {
      newOutputsCount = (formData?.options?.length + 1) || 1;
    } else if (this.ParentNodeType === 'buttonOptions') {
      newOutputsCount = (formData?.buttons?.length + 1) || 1;
    } else if (this.ParentNodeType === 'whatsAppFlow') {
      newOutputsCount = 2;
    }

    if (formData.invalidAction == "fallback" || formData.timeElapseAction == "fallback") {
      newOutputsCount = newOutputsCount + 1
    }

    if ((this.ParentNodeType === 'questionOption' || this.ParentNodeType === 'listOptions' ||
      this.ParentNodeType === 'buttonOptions') && newOutputsCount !== currentOutputsCount) {
      this.updateNodeOutputs(node, currentOutputsCount, newOutputsCount, formData);
    }

    this.editor.updateNodeDataFromId(this.selectedNodeId, node.data);
    const newHTML = this.createNodeHtml(this.selectedNodeId, node.data);
    this.updateNodeHTML(this.selectedNodeId, newHTML);
      var nodeId = this.selectedNodeId;

       setTimeout(() => {
      this.editor.drawflow.drawflow.Home.data[nodeId].html = newHTML;
      this.isLoading = false
    }, 100);
  }


  private updateAdvanceNode(formData: any): void {
    if (this.selectedNodeId === null) return;

    const node = this.editor.getNodeFromId(this.selectedNodeId);
    node.data.formData = formData;



    this.editor.updateNodeDataFromId(this.selectedNodeId, node.data);
    const newHTML = this.createNodeHtml(this.selectedNodeId, node.data);


    this.updateNodeHTML(this.selectedNodeId, newHTML);
  }





  private updateNodeOutputs(node: any, currentOutputsCount: number, newOutputsCount: number, formData: any): void {
    while (currentOutputsCount > 1) {
      currentOutputsCount--;
      this.editor.removeNodeOutput(Number(node.id), 'output_' + currentOutputsCount);
    }

    for (let i = 1; i < newOutputsCount; i++) {
      this.editor.addNodeOutput(node.id);
    }

    node.outputs = newOutputsCount;
    if (this.ParentNodeType === 'listOptions') {
      this.setOutputPositionsForList(node.id, formData);
    } else {
       const actionValue =  (formData?.invalidAction === 'fallback' || formData?.timeElapseAction === 'fallback')? 'fallback': formData?.invalidAction
      this.setOutputPositions(node.id, actionValue);
    }
  }

  // ==================== MODAL HANDLING METHODS ====================

  openModal(modalId: string): void {
    if (this.currentModal) {
      this.currentModal.hide();
    }

    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
      console.warn(`Modal with ID '${modalId}' not found.`);
      return;
    }

    if (!modalElement.classList.contains('show')) {
      this.currentModal = new bootstrap.Modal(modalElement, {
    backdrop: 'static',
    keyboard: false
  });
    }

    this.currentModal.show();
    modalElement.addEventListener('hidden.bs.modal', () => {
      this.currentModal = null;
    });
  }

  closeModal(): void {

  if (this.currentModal) {
    this.currentModal.hide();

    // Optional: Also remove the static options if you want to allow normal behavior next time
    const modalElement = document.querySelector('.modal.show');
    if (modalElement) {
      // Remove the "static" backdrop setting by re-enabling default dismiss behavior if needed
      modalElement.removeEventListener('hidden.bs.modal', () => {
        this.currentModal = null;
      });
    }

    this.currentModal = null;

    this.isLoading = false
  }
  }

  // ==================== FORM ARRAY HANDLING ====================

  addOption(options: FormArray): void {
    const lastOption = options.at(options.length - 1).value;

    if ((!lastOption || lastOption.trim() === '') && options.length >= 1) {
      this.newOptionError = 'Please fill the previous option before adding a new one.';
      return;
    }

    if (options.length >= this.MAX_OPTIONS) {
      this.newOptionError = `Maximum of ${this.MAX_OPTIONS} options allowed.`;
      return;
    }

    options.push(this.fb.control(''));
    this.newOptionError = '';
  }

  removeOption(options: FormArray, index: number): void {
    if (options.length > 1) {
      options.removeAt(index);
    }
  }

  addButton(buttons: FormArray): void {
    if (buttons.length < this.MAX_BUTTONS) {
      buttons.push(this.fb.control('', [Validators.required, Validators.maxLength(20)]));
    }
  }

  removeButton(buttons: FormArray, index: number): void {
    if (buttons.length > 1) {
      buttons.removeAt(index);
    }
  }


  MAX_TOTAL_ROWS = 10;
  hideAddAction: any = false
  addSection(sections: FormArray): void {
     if (!this.canAddSection()) return;
  
  const newSection = this.createSection();
  sections.push(newSection);
  
  // Trigger validation updates
  sections.updateValueAndValidity({ emitEvent: true });
  this.changeDetectorRef.detectChanges(); // Ensure UI updates
  }


  addRow(sections: FormArray, sectionIndex: number): void {
    this.hideAddAction = false
    const section = sections.at(sectionIndex) as FormGroup;
    const rows = section.get('rows') as FormArray;

      const lastRow = rows.at(rows.length - 1) as FormGroup;

  // ✅ Check if last row is empty
  if (lastRow) {
    const { rowName, rowDescription } = lastRow.value;

    if (!rowName?.trim()) {
      console.warn('Cannot add new row: Last row is empty');
      return; // Stop adding new row
    }
  }


    const totalRows = this.getTotalRowCount(sections);
    const remainingRows = this.MAX_TOTAL_ROWS - totalRows;

    if (rows.length < this.MAX_ROWS_PER_SECTION && remainingRows > 0) {
      rows.push(this.createRow());
      sections.updateValueAndValidity({ emitEvent: true });
        this.changeDetectorRef.detectChanges(); // Ensure UI update
    } else {
      this.hideAddAction = true
    }
  }

  removeSection(sections: FormArray, index: number): void {
    if (sections.length > 1) {
      this.hideAddAction = false
      sections.removeAt(index);

      sections.updateValueAndValidity({ emitEvent: true });
       this.changeDetectorRef.detectChanges();
    }
  }

  removeRow(sections: FormArray, sectionIndex: number, rowIndex: number): void {
    const section = sections.at(sectionIndex) as FormGroup;
    const rows = section.get('rows') as FormArray;

    if (rows.length > 1) {
      this.hideAddAction = false
      rows.removeAt(rowIndex);
      sections.updateValueAndValidity({ emitEvent: true });
       this.changeDetectorRef.detectChanges();
    }
  }

  getTotalRowCount(sections: FormArray): number {
    return sections.controls.reduce((total, section) => {
      const rows = (section as FormGroup).get('rows') as FormArray;
      return total + rows.length;
    }, 0);
  }


  canAddSection(): boolean {
    
    
    
  if (!this.listOptions || !this.listOptionSections) return false;
  
  // Check if maximum sections reached
  if (this.listOptionSections.length >= this.MAX_SECTIONS) return false;
  
  // Check if maximum total rows reached
  if (this.getTotalRowCount(this.listOptionSections) >= this.MAX_TOTAL_ROWS) return false;
  
  // Check if any existing sections have invalid headings (when multiple sections exist)
  if (this.listOptionSections.length > 0) {
    const hasInvalidHeadings = this.listOptionSections.controls.some(section => {

      return !section.get('sectionHeading')?.value?.trim();
    });
    

    if (hasInvalidHeadings){
      this.showToaster(`Please provide section heading for new sections`,'error');
      return false;
    }
  }
  
  return true;
}





  // ==================== EDITOR EVENT HANDLERS ====================

  updateQuestionTextLength(editor: RichTextEditor): void {
    this.updateEditorLength(editor, 'questionTextLength');
  }

  updateBodyTextLength(editor: RichTextEditor): void {
    this.updateEditorLength(editor, 'bodyTextLength');
  }

  updateErrorMessageLength(editor: RichTextEditor): void {
    this.updateEditorLength(editor, 'errorMessageLength');
  }

  // First, define a type for the length properties


  // Then update the method like this:
  private updateEditorLength(editor: RichTextEditor, property: 'questionTextLength' | 'bodyTextLength' | 'errorMessageLength' |
    'headerTextLength' | 'footerTextLength' | 'listHeaderLength'): void {
    const text = editor.getHtml();
    (this as any)[property] = text ? text.length : 0;
  }





  updateHeaderTextLength(control: AbstractControl): void {
    this.updateControlLength(control, 'headerTextLength');
  }

  updateFooterTextLength(control: AbstractControl): void {
    this.updateControlLength(control, 'footerTextLength');
  }

  updateListHeaderLength(control: AbstractControl): void {
    this.updateControlLength(control, 'listHeaderLength');
  }

  private updateControlLength(control: AbstractControl, property: 'questionTextLength' | 'bodyTextLength' | 'errorMessageLength' |
    'headerTextLength' | 'footerTextLength' | 'listHeaderLength'): void {
    this[property] = control.value?.length || 0;
  }

  // ==================== FILE HANDLING ====================

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    this.uploadedFile = file;
    this.sendTextForm.patchValue({ file });
    this.selectedFileType = this.buttonOptions.get('headerType')?.value as 'image' | 'video' | 'document';

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedFileUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  getFileAccept(): string {
    const acceptTypes: Record<string, string> = {
      'sendImage': 'image/*',
      'sendVideo': 'video/mp4',
      'sendDocument': '.pdf,.doc,.docx,.xls,.xlsx'
    };
    return acceptTypes[this.cardType] || '*';
  }

  removeFile(): void {
    this.selectedFileUrl = null;
    this.uploadedFile = null;
    this.selectedFileType = null;
    this.selectedImageUrl = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    const fileControl = this.buttonOptions.get('fileLink');
if (fileControl) {
  fileControl.setValue(null);  // Clear value
  fileControl.markAsTouched(); // Optional: force error display if required
  fileControl.updateValueAndValidity(); // Recalculate validations
}
  }

  // ==================== EDIT NODE HANDLING ====================

  openEditModal(nodeId: number): void {

    
    this.closeModal();
    this.isEditMode = true;
    this.selectedNodeId = nodeId;

    const nodeData = this.editor.getNodeFromId(nodeId);
    this.cardType = nodeData.data.text;
    this.ParentNodeType = nodeData.data.category;
    this.fillExistingData(nodeData);
    if (nodeData.data.category == "Advance_Action") {
      this.openModal(this.cardType);
    } else {
      this.openModal(this.ParentNodeType);
    }

  }

  private fillExistingData(nodeData: any): void {
    
    if (this.selectedNodeId === null) return;
    const nodeElement = document.getElementById(`node-${this.selectedNodeId}`);
    this.selectedImageUrl = null;
    

    switch (this.cardType) {
      case 'sendText':
        this.fillSendTextData(nodeData);
        break;
      case 'sendImage':
      case 'sendVideo':
      case 'sendDocument':
        this.fillMediaData(nodeElement, nodeData);
        break;
      case 'questionOption':
        this.fillQuestionOptionData(nodeData);
        break;
      case 'openQuestion':
        this.fillOpenQuestionData(nodeData);
        break;
      case 'buttonOptions':
        this.fillButtonOptionsData(nodeData);
        break;
      case 'listOptions':
        this.fillListOptionsData(nodeData);
        break;
      case 'NotificationModal':
        this.fillNotificationData(nodeData);
        break;
      case 'NotesMentionModal':
        this.fillNotesMentionModalData(nodeData);
        break;
      case 'setCondition':
        this.fillNotesSetConditionData(nodeData);
        break;
      case 'whatsAppFlow':
        this.fillWhatsAppFlowsData(nodeData);
        break;
      case 'assignAgentModal':
        this.fillassignAgentModal(nodeData);
        break;
      case 'TimeDelayModal':
        this.fillTimeDelayModal(nodeData);
        break;
      case 'AddTags':
      case 'RemoveTag':
        this.fillTheTag(nodeData);
        break;
    }
  }

  fileName: string = '';
  private fillSendTextData(nodeData: any): void {
    this.sendTextForm.patchValue({
      textMessage: nodeData.data.formData.textMessage === 'Sample Text'
        ? ''
        : nodeData.data.formData.textMessage,
      file: null
    });
  }

  private fillMediaData(nodeElement: HTMLElement | null, nodeData: any): void {
    this.selectedFileType = this.cardType === 'sendDocument' ? 'image' :
      this.cardType === 'sendVideo' ? 'video' : 'image';

      if (this.cardType == 'sendDocument' || this.selectedFileType == "image") {
        this.fileName = nodeData?.data?.fileName;
      }

    if (nodeElement) {
      const mediaElement = nodeElement.querySelector('.textContImage img, .textContImage video');
      if (mediaElement) {
        this.selectedImageUrl = (mediaElement as HTMLImageElement).src;
      }
    }

    this.sendTextForm.patchValue({
      textMessage: nodeData.data.formData.textMessage || '',
      file: nodeData.data.file
    });
  }

  private fillQuestionOptionData(nodeData: any): void {
    const updateForm = nodeData?.data?.formData;
    const optionsArray = this.fb.array([], [
    this.atLeastOneOptionRequired(),
    this.atLeastOneAndUniqueOptions()
  ]);

    if (Array.isArray(updateForm?.options)) {
      updateForm.options.forEach((opt: any) => {
        optionsArray.push(this.fb.control(opt));
      });
    }else {
    // ✅ Ensure at least one empty control if no options provided
    optionsArray.push(this.createOptionControl());
  }


    this.questionOption.patchValue({
      questionText: updateForm?.questionText,
      promptMessage:updateForm?.promptMessage,
      saveAnswerVariable: updateForm?.saveAnswerVariable,
       questionTextMessage: this.createCombinedVariable(),
      reattemptsAllowed: updateForm?.reattemptsAllowed,
      reattemptsCount: updateForm?.reattemptsCount,
      errorMessage: updateForm?.errorMessage,
      invalidAction: updateForm?.invalidAction,
      enableTimeElapse: updateForm?.enableTimeElapse,
      timeElapseMinutes: updateForm?.timeElapseMinutes,
      timeElapseAction: updateForm?.timeElapseAction,
      saveAsVariable: updateForm?.saveAsVariable,
      variableName: updateForm?.variableName,
      variableDataType: updateForm?.variableDataType,
      enableValidation: updateForm?.enableValidation
    });



    this.questionOption.setControl('options', optionsArray);

  // ✅ Restore dynamic validators for timeElapseMinutes
  const timeControl = this.questionOption.get('timeElapseMinutes');
  if (updateForm?.enableTimeElapse) {
    timeControl?.setValidators([Validators.required]);
  } else {
    timeControl?.clearValidators();
  }
  timeControl?.updateValueAndValidity();

  // ✅ Ensure promptMessage updates dynamically if options change
  this.options.valueChanges.subscribe((vals: string[]) => {
    const defaultPrompt = this.getPromptMessage();
    const currentPrompt = this.questionOption.get('promptMessage')?.value;
    if (!currentPrompt || currentPrompt.startsWith('Please type a number from')) {
      this.questionOption.get('promptMessage')?.setValue(defaultPrompt);
    }
  });

  // ✅ Re-subscribe to options changes for uniqueness validation
  this.questionOption.get('options')?.valueChanges.subscribe(() => {
    this.changeDetectorRef.detectChanges();
    this.atLeastOneAndUniqueOptions();
  });

  // ✅ Trigger validation after update
  this.questionOption.updateValueAndValidity();
  }

  private fillOpenQuestionData(nodeData: any): void {
    const updateForm = nodeData?.data?.formData;

    this.openQuestion.patchValue({
      questionText: updateForm?.questionText,
      saveAsVariable: updateForm?.saveAsVariable,
      variableName: updateForm?.variableName,
      variableDataType: updateForm?.variableDataType,
      enableValidation: updateForm?.enableValidation,
      answerType: updateForm?.answerType,
      minChars: updateForm?.minChars ?? 0,
      maxChars: updateForm?.maxChars ?? null,
      textRegex: updateForm?.textRegex ?? '',
      minNumber: updateForm?.minNumber ?? null,
      maxNumber: updateForm?.maxNumber ?? null,
      numberRegex: updateForm?.numberRegex ?? '',
      minDate: updateForm?.minDate ?? null,
      maxDate: updateForm?.maxDate ?? null,
      customRegex: updateForm?.customRegex ?? '',
      reattemptsAllowed: updateForm?.reattemptsAllowed,
      reattemptsCount: updateForm?.reattemptsCount ?? 1,
      errorMessage: updateForm?.errorMessage,
      invalidAction: updateForm?.invalidAction,
      enableTimeElapse: updateForm?.enableTimeElapse,
      timeElapseMinutes: updateForm?.timeElapseMinutes,
      timeElapseAction: updateForm?.timeElapseAction
    });
  }

private fillButtonOptionsData(nodeData: any): void {
  const updateForm = nodeData?.data?.formData;

  // ✅ Build buttons FormArray with validators
  const buttonsArray = this.fb.array([], [this.atLeastOneAndUniqueButtons()]);

  if (Array.isArray(updateForm?.buttons) && updateForm.buttons.length > 0) {
    updateForm.buttons.forEach((btn: string) => {
      buttonsArray.push(this.fb.control(btn, [Validators.required, Validators.maxLength(20)]));
    });
  } else {
    // ✅ Ensure at least one empty button if no buttons provided
    buttonsArray.push(this.fb.control('', [Validators.required, Validators.maxLength(20)]));
  }

  // ✅ Patch the main form values
  this.buttonOptions.patchValue({
    headerType: updateForm?.headerType || 'none',
    headerText: updateForm?.headerText,
    bodyText: updateForm?.bodyText,
    footerText: updateForm?.footerText,
    fileLink: updateForm?.fileLink,
    saveAsVariable: updateForm?.saveAsVariable,
    variableName: updateForm?.variableName,
    variableDataType: updateForm?.variableDataType,
    reattemptsAllowed: updateForm?.reattemptsAllowed,
    reattemptsCount: updateForm?.reattemptsCount ?? 1,
    errorMessage: updateForm?.errorMessage,
    invalidAction: updateForm?.invalidAction,
    enableTimeElapse: updateForm?.enableTimeElapse,
    timeElapseMinutes: updateForm?.timeElapseMinutes,
    timeElapseAction: updateForm?.timeElapseAction,
    enableValidation: updateForm?.enableValidation
  });

  // ✅ Replace buttons control in the form
  this.buttonOptions.setControl('buttons', buttonsArray);

  // ✅ Restore dynamic validator for timeElapseMinutes
  const timeControl = this.buttonOptions.get('timeElapseMinutes');
  if (updateForm?.enableTimeElapse) {
    timeControl?.setValidators([Validators.required]);
  } else {
    timeControl?.clearValidators();
  }
  timeControl?.updateValueAndValidity();

  // ✅ Restore dynamic validator for headerType → fileLink requirement
  const headerControl = this.buttonOptions.get('fileLink');
  if (['image', 'video', 'document'].includes(updateForm?.headerType)) {
    headerControl?.setValidators([Validators.required]);
  } else {
    headerControl?.clearValidators();
  }
  headerControl?.updateValueAndValidity();

  // ✅ Subscribe to buttons changes for uniqueness validation
  this.buttonOptions.get('buttons')?.valueChanges.subscribe(() => {
    this.changeDetectorRef.detectChanges();
    this.atLeastOneAndUniqueButtons();
  });

  // ✅ Subscribe to headerType changes for fileLink validator
  this.buttonOptions.get('headerType')?.valueChanges.subscribe(value => {
    const headerCtrl = this.buttonOptions.get('fileLink');
    if (['image', 'video', 'document'].includes(value)) {
      headerCtrl?.setValidators([Validators.required]);
    } else {
      headerCtrl?.clearValidators();
    }
    headerCtrl?.updateValueAndValidity();
  });

  // ✅ Trigger validation after update
  this.buttonOptions.updateValueAndValidity();
}


  private fillNotesSetConditionData(nodeData: any): void {

  const savedConditions = nodeData?.data?.formData?.conditions || [];

  // Optional: clear the array first if it's not already empty
  this.conditionsArray.clear();

  // Add each condition using your reusable function
  savedConditions.forEach((condition: any) => {
    this.addCondition(condition);
  });
  }

  private fillListOptionsData(nodeData: any): void {
    const updateForm = nodeData?.data?.formData;

    this.listOptions.patchValue({
      headerText: updateForm?.headerText,
      bodyText: updateForm?.bodyText,
      footerText: updateForm?.footerText,
      listHeader: updateForm?.listHeader,
      saveAsVariable: updateForm?.saveAsVariable,
      variableName: updateForm?.variableName,
      variableDataType: updateForm?.variableDataType,
      reattemptsAllowed: updateForm?.reattemptsAllowed,
      reattemptsCount: updateForm?.reattemptsCount ?? 1,
      errorMessage: updateForm?.errorMessage,
      invalidAction: updateForm?.invalidAction,
      enableTimeElapse: updateForm?.enableTimeElapse,
      timeElapseMinutes: updateForm?.timeElapseMinutes,
      timeElapseAction: updateForm?.timeElapseAction,
      enableValidation: updateForm?.enableValidation
    });

    const sectionsArray = this.fb.array([],[
    this.uniqueRowNamesValidator(),
    this.sectionHeadingValidator()
  ]);
    (updateForm?.sections || []).forEach((section: any) => {
      const sectionGroup: any = this.fb.group({
        sectionHeading: [section.sectionHeading],
        rows: this.fb.array([])
      });

      const rowsArray = (sectionGroup.get('rows') as FormArray);
      (section.rows || []).forEach((row: any) => {
        rowsArray.push(this.fb.group({
          rowName: [row.rowName, [Validators.required, Validators.maxLength(24)]],
          rowDescription: [row.rowDescription, [Validators.maxLength(72)]]
        }));
      });

      sectionsArray.push(sectionGroup);
       this.listOptions.get('sections')?.valueChanges.subscribe(value => {
    this.changeDetectorRef.detectChanges();
    this.uniqueRowNamesValidator();
    this.sectionHeadingValidator();
  });
    });


  
    this.listOptions.setControl('sections', sectionsArray);
  }

  private fillWhatsAppFlowsData(nodeData: any): void {
    const updateForm = nodeData?.data?.formData;
    this.whatsAppFlowForm.patchValue({
      headerText: updateForm?.headerText,
      bodyText: updateForm?.bodyText,
      footerText: updateForm?.footerText,
      whatsAppFormName: updateForm?.whatsAppFormName,
      selectedForm: updateForm?.selectedForm,
      reattemptsAllowed: updateForm?.reattemptsAllowed,
      reattemptsCount: updateForm?.reattemptsCount,
      errorMessage: updateForm?.errorMessage,
      invalidAction: updateForm?.invalidAction,
      enableTimeElapse: updateForm?.enableTimeElapse,
      timeElapseMinutes: updateForm?.timeElapseMinutes,
      timeElapseAction: updateForm?.timeElapseAction,
      enableValidation: updateForm?.enableValidation
    });

  }

  private fillassignAgentModal(nodeData: any): void {
    const updateForm = nodeData?.data?.formData?.data
    ;
    
    
this.selectedAgentDetails = updateForm
  }

  private fillTimeDelayModal (nodeData: any): void {
    const updateForm = nodeData?.data?.formData?.data
    ;
    this.delayTime = updateForm.time
    this.delayUnit = updateForm.unit
  }

  private fillTheTag(nodeData: any): void {
    const updateForm = nodeData?.data?.formData?.data
    this.selectedTags = updateForm.selectedTags;
    this.operationOptions = updateForm.operation;
  }




  fillNotificationData(nodeData: any) {
    const updateForm = nodeData?.data?.formData;
    
    this.dynamiceEditor = this.chatEditorElement

    this.notificationForm.patchValue({
      selectedAgentIds: updateForm.data.selectedAgentIds,
      selectedAgentName: updateForm.data.selectedAgentName,
      textMessage: updateForm.data.textMessage,
      file: updateForm.data.file,
      mediaType: updateForm.data.mediaType
    })
    
    if (updateForm.data.file != null) {
      setTimeout(() => {
        this.attachMedia(updateForm.data.file, updateForm.data.mediaType)
      }, 100);
    }

  }
  fillNotesMentionModalData(nodeData: any) {
    const updateForm = nodeData?.data?.formData;
    this.dynamiceEditor = this.chatEditors
    

    
    this.notesmentionForm.patchValue({
      message: updateForm.data.message,
      file: updateForm.data.file,
      mediaType: updateForm.data.mediaType,
      UIIdMention: this.syncMentionArray() || []

    })

    setTimeout(() => {
      this.attachMedia(updateForm.data.file, updateForm.data.mediaType)
    }, 100);
  }


  copyNode(nodeId: number): void {
  const originalNode = this.editor.getNodeFromId(nodeId);
  if (!originalNode) return;

  const nodeCopy = JSON.parse(JSON.stringify(originalNode));
  nodeCopy.id = this.getUniqueId();
  nodeCopy.data.uniqueId = this.getUniqueId();
  nodeCopy.pos_x += 100;
  nodeCopy.pos_y += 50;

  // Recreate inputs/outputs
  nodeCopy.inputs = {};
  nodeCopy.outputs = {};
  Object.keys(originalNode.inputs).forEach(inputKey => {
    nodeCopy.inputs[inputKey] = { connections: [] };
  });
  Object.keys(originalNode.outputs).forEach(outputKey => {
    nodeCopy.outputs[outputKey] = { connections: [] };
  });

  this.cardType = nodeCopy?.data?.text;
  this.ParentNodeType = nodeCopy?.data?.category;

  const postData = {
    name: nodeCopy.name,
    inputs: 1,
    outputs: Object.keys(nodeCopy.outputs).length,
    data: {
      text: nodeCopy?.data.text,
      inputsCount: 1,
      maxButtonLimit: 3,
      category: nodeCopy?.data.category,
      uniqueId: this.getUniqueId(),
      formData: nodeCopy?.data?.formData,
      file: nodeCopy?.data?.formData.file || nodeCopy?.data?.file,
      fileName: nodeCopy?.data?.formData.file?.name || nodeCopy?.data?.fileName ||  null,
      fileType: nodeCopy?.data?.formData.file?.type ||  nodeCopy?.data?.fileType || null,
    },
    html: '<div class="temp-placeholder">Loading...</div>',
    pos_x: Math.floor(Math.random() * 900) + 100,
    pos_y: Math.floor(Math.random() * 400) + 100,
  };

  const newNodeId = this.addNode(postData);

  // Create the actual HTML
  const newHTML = this.createNodeHtml(newNodeId, nodeCopy.data);

  this.updateNodeHTML(Number(newNodeId), newHTML);
  // Update in memory
  this.editor.drawflow.drawflow.Home.data[newNodeId].html = newHTML;

  // Update in DOM
  const nodeElement = document.querySelector(`#node-${newNodeId} .drawflow_content_node`);
  if (nodeElement) {
    nodeElement.innerHTML = newHTML;
  }

  if (nodeCopy?.data?.text === 'listOptions') {
    this.setOutputPositionsForList(newNodeId, nodeCopy?.data?.formData);
  } else {
    const actionValue = (nodeCopy?.data?.formData?.invalidAction === 'fallback' || nodeCopy?.data?.formData?.timeElapseAction === 'fallback') ? 'fallback' : nodeCopy?.data?.formData?.invalidAction;
    this.setOutputPositions(Number(newNodeId), actionValue);
  }
  this.nodeCounter++;
}


  // ==================== CONDITION FORM HANDLING ====================

  get conditionsArray(): FormArray {
    return this.conditionForm.get('conditions') as FormArray;
  }

  getConditionGroup(index: number): FormGroup {
    return this.conditionsArray.at(index) as FormGroup;
  }

  addCondition(condition?: any): void {
    
    const conditionGroup = this.fb.group({
      comparator: [condition?.comparator || '', Validators.required],
      comparatorType: [condition?.comparatorType ?? ''],
      operator: [condition?.operator ?? '', Validators.required],
      value: [condition?.value || '', Validators.required],
      valueType: [condition?.valueType || ''],
      nextJoinType: [condition?.nextJoinType ?? 'AND']
    });

this.conditionsArray.push(conditionGroup);

  }

  removeCondition(index: number): void {
    if (this.conditionsArray.length > 1) {
      this.conditionsArray.removeAt(index);
    }
  }

  onComparatorChange(index: number): void {
    const comparatorControl = this.getConditionGroup(index).get('comparator');
    
    const comparatorValue = comparatorControl?.value;

    const detectedType = this.detectVariableType(comparatorValue);
    this.getConditionGroup(index).get('comparatorType')?.setValue(detectedType);
    this.getConditionGroup(index).get('operator')?.reset();
  }

  private detectVariableType(comparator: string): string {
    const attribute = this.attributeList.find((attr: any) =>
      attr.value === comparator || attr.label === comparator
    );
    if (attribute) return attribute.type;

    const botVar = this.sampleVariables.find((v: any) =>
      v.value === comparator || v.label === comparator
    );
    if (botVar) return botVar.type;

    return 'string';
  }

  // ==================== AGENT & TAG HANDLING ====================

  filterAgents(): void {
    if (!this.searchQuery) {
      this.agentsList = [...this.agents];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.agentsList = this.agents.filter(agent =>
      agent.name.toLowerCase().includes(query)
    );
  }

  selectAgent(agent: Agent): void {
    this.selectedAgentDetails = agent;
  }

  getInitials(name: string): string {
    return name.split(' ').map(part => part[0]).join('');
  }

  filterTags(type: any): void {
    if (type == 'removeTag') {
      if (!this.searchTerm) {
        this.removeTagList = [...this.allTags];
        return;
      }


      const term = this.searchTerm.toLowerCase();
      this.removeTagList = this.allTags.filter((tag: any) =>
        tag.TagName.toLowerCase().includes(term)
      );

    } else {

      if (!this.searchTerm) {
        this.addTagList = [...this.allTags];
        return;
      }

      const term = this.searchTerm.toLowerCase();
      this.addTagList = this.allTags.filter((tag: any) =>
        tag.TagName.toLowerCase().includes(term)
      );
    }
  }

  // isTagSelected(tagValue: string): boolean {
  //   return this.selectedTags.includes(tagValue);
  // }

  // toggleTagSelection(tagValue: string): void {
  //   this.selectedTags = this.isTagSelected(tagValue)
  //     ? this.selectedTags.filter(t => t !== tagValue)
  //     : [...this.selectedTags, tagValue];
  // }

  // selectedTags: { TagId: number; TagName: string }[] = [];

toggleTagSelection(tag: { ID: number; TagName: string }): void {
  const index = this.selectedTags?.findIndex((t:any) => t.TagId === tag.ID);

  if (index > -1) {
    this.selectedTags.splice(index, 1);
  } else {
    this.selectedTags.push({ TagId: tag.ID, TagName: tag.TagName });
  }
}

isTagSelected(tagId: number): boolean {
  return this.selectedTags?.some((t:any) => t?.TagId === tagId);
}

toggleTagSelectionRemove(tag: { ID: number; TagName: string }): void {
  const index = this.selectedTagsRemoveTag?.findIndex((t:any) => t.TagId === tag.ID);

  if (index > -1) {
    this.selectedTagsRemoveTag.splice(index, 1);
  } else {
    this.selectedTagsRemoveTag.push({ TagId: tag.ID, TagName: tag.TagName });
  }
}

isTagSelectedRemove(tagId: number): boolean {
  return this.selectedTagsRemoveTag?.some((t:any) => t?.TagId === tagId);
}


  // ==================== TIME DELAY HANDLING ====================

  validateTime(): void {
    const max = this.delayUnit === 'hour' ? 24 : 60;
    this.invalidTime = this.delayTime < 1 || this.delayTime > max;
  }

preventInvalidKeys(event: KeyboardEvent): void {
  const invalidKeys = ['-', 'e', '+', '.'];
  if (invalidKeys.includes(event.key) || (event.key === '0' && !this.delayTime)) {
    event.preventDefault();
  }
}

  onUnitChange(): void {
    const max = this.delayUnit === 'hour' ? 24 : 60;
    if (this.delayTime > max) {
      this.delayTime = max;
    }
    this.validateTime();
  }

  // ==================== BOT SELECTION ====================

  getSelectedBot(botId: string): void {
    this.selectedBot = this.botsList.find(bot => bot.id === botId) || null;
  }

  // ==================== ATTRIBUTE HANDLING ====================


  currentAttributeList: any = []
  getAdditionalAttributes(): void {
    if (!this.userDetails?.SP_ID) return;

    this.settingService.getNewCustomField(this.userDetails.SP_ID).subscribe((allAttributes: any) => {
      
      if (allAttributes.status == 200) {
this.currentAttributeList = allAttributes?.getfields?.filter((attr:any) =>
  attr.ActuallName !== 'Phone_number' &&
  attr.ActuallName !== 'tag' &&
  attr.ActuallName !== 'OptInStatus'
);
        
        const attributes = allAttributes?.getfields?.map((attr: any) => `${attr.displayName}`);
        this.attributeList = attributes;
      }

    });
  }

  agentsList: any = []
  getUserList() {

    this.settingService.getUserList(this.userDetails.SP_ID, 1).subscribe(async (result: any) => {
      if (result) {

        this.agentsList = result?.getUser

        this.agentsList.forEach((item: { name: string; nameInitials: string; }) => {
          const nameParts = item.name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts[1] || '';
          const nameInitials = firstName.charAt(0) + ' ' + lastName.charAt(0);

          item.nameInitials = nameInitials;
        });
        this.agents = [...this.agentsList]
        // this.mentionAgentsList = this.agentsList.filter((item:any)=>item.uid != this.uid);
        // this.assigineeList = this.agentsList.filter((item:any)=>item.IsActive == 1);
      }
    });
  }


  originalBotsList: any = []
  getBotDetails() {
    var SPID = this.userDetails?.SP_ID || 159
    this.botService.getBotAlldetails(SPID).subscribe((res: any) => {
      if (res.status == 200) {

        this.botsList = res.bots
        
        this.originalBotsList = [...this.botsList];
      }


    })
  }


  addTagList: any = []
  removeTagList: any = []

  getTagData() {
    this.settingService.getTagData(this.userDetails.SP_ID).subscribe((result: any) => {
      if (result?.taglist) {
        this.addTagList = [...result.taglist];
        this.removeTagList = [...result.taglist];
        this.allTags = [...result.taglist]
      }
    });
  }



  whatsAppFormList: any = []
  getWhatsAppFormList() {
    this.settingService.getFlowData(this.userDetails.SP_ID).subscribe(async (result: any) => {
      if (result) {

        
        this.whatsAppFormList = result?.flows;

      }
    });
  }



  openAttributeOption(index: number, field: 'comparator' | 'value'): void {
    if (this.showAttribute?.index === index && this.showAttribute?.field === field) {
      this.showAttribute = null;
    } else {
      this.showAttribute = { index, field };
    }
  }

  // ==================== VARIABLE HANDLING ====================

  toggleVarMenu(index: number, field: 'comparator' | 'value'): void {
    if (this.showVarMenuFor?.index === index && this.showVarMenuFor?.field === field) {
      this.showVarMenuFor = null;
    } else {
      this.showVarMenuFor = { index, field };
    }
  }


  allowOnlyBackspaces(event: KeyboardEvent, index: number, field: 'comparator' | 'value') {
    const isLocked = this.selectedFields?.[index]?.[field];
    if (!isLocked) return; // Allow normal typing if no variable is selected

    // Only allow backspace
    if (event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  selectedFields: any = {}; // to track per condition input field lock
  selectVariable(index: number, field: 'comparator' | 'value', variable: any): void {

    
    const group = this.getConditionGroup(index);
    group.get(field)?.setValue(`{{${variable.displayName || variable.name}}}`);
    group.get(`${field}Type`)?.setValue(variable.type || variable.dataType);
    this.showVarMenuFor = null;
    this.showAttribute = null



    if (!this.selectedFields[index]) this.selectedFields[index] = {};
    this.selectedFields[index][field] = true;

    if (field === 'comparator') {
      group.get('operator')?.setValue('');
    }
  }


  onComparatorInput(i: number) {
    if (this.selectedFields[i]?.comparator) {
      delete this.selectedFields[i].comparator;
    }
  }

  onValueInput(i: number) {
    if (this.selectedFields[i]?.value) {
      delete this.selectedFields[i].value;
    }
  }


  // ==================== SAVE & EXPORT HANDLING ====================

  // ==================== UTILITY METHODS ====================

  zoomEditor(option: 'zoom_out' | 'zoom_in' | 'zoom_reset'): void {
    if (!this.editor) return;

    switch (option) {
      case 'zoom_out':
        this.editor.zoom_out();
        break;
      case 'zoom_in':
        this.editor.zoom_in();
        break;
      default:
        this.editor.zoom_reset();
    }
  }

  changeMode(option: 'lock' | 'unlock'): void {
    if (!this.editor) return;

    if (option === 'lock') {
      this.editor.editor_mode = 'edit';
      this.showLock = true;
    } else {
      this.editor.editor_mode = 'fixed';
      this.showLock = false;
    }
  }


  toggleChatNotes(type: any) {
    if (type == 'advanceTool') {
      this.tools = {
        items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker',
          {
            tooltipText: 'Attachment',
            undo: true,
            click: this.ToggleAttachmentBox.bind(this),
            template: '<button type="button" style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
              + '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attachment-icon.svg"></div></button>'
          },
          {
            tooltipText: 'Attributes',
            undo: true,
            click: this.ToggleAttributesOption.bind(this),
            template: '<button type="button" style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
              + '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
          },
          {
            tooltipText: '@mentions',
            undo: true,
            click: this.ToggleShowMentionOption.bind(this),
            template: '<button type="button" style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
              + '<div class="e-tbar-btn-text">@</div></button>'
          }],
          enableFloating: true 
      }
    } else if (type == 'semiTool') {
      this.semiAdvanceTool = {
        items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker', {
          tooltipText: 'Attributes',
          undo: true,
          click: this.ToggleAttributesOption.bind(this),
          template: '<button type="button" style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
            + '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
        },],enableFloating: true 
      }

    } else if (type == 'attachementTool') {

      this.attachementTool = {
        items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker', {
          tooltipText: 'Attachment',
          undo: true,
          click: this.ToggleAttachmentBox.bind(this),
          template: '<button type="button" style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
            + '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attachment-icon.svg"></div></button>'
        },{
          tooltipText: 'Attributes',
          undo: true,
          click: this.ToggleAttributesOption.bind(this),
          template: '<button type="button" style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
            + '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
        }
        ,],enableFloating: true 
      }

    } else {
      this.tools = DEFAULT_TOOLS
    }


  }


  ToggleAttachmentBox() {
    this.closeAllModal()
    $("#attachfle").modal('show');
    document.getElementById('attachfle')!.style.display = 'inherit';
    // this.dragAreaClass = "dragarea";
  }

  lastCursorPosition: Range | null = null;
  showMention: any = false;
  ToggleAttributesOption() {
    const selection = window.getSelection();
    this.lastCursorPosition = selection?.getRangeAt(0) || null;
    this.closeAllModal()
    $("#atrributemodal").modal('show');

  }

  ToggleShowMentionOption() {
    this.closeAllModal()
    setTimeout(() => { this.showMention = !this.showMention }, 50)
  }


  closeEditMedia() {
    $("#editTemplate").modal('show');
    $("#attachfle").modal('hide');
    $("#editTemplateMedia").modal('hide');
    this.isAttachmentMedia = false;
  }

  closeAllModal() {

    this.showMention = false


    $("#editTemplateMedia").modal('hide');
    $("#botVariable").modal('hide');
    $("#atrributemodal").modal('hide');
    $("#attachfle").modal('hide');
    $("#sendfile").modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

  }

  selectVariables(variableName: string) {
    let editor: any;

    if (this.ParentNodeType === 'sendMessage' && this.chatEditor) {
      editor = this.chatEditor;
    } else if ((this.ParentNodeType === 'questionOption' || this.ParentNodeType === 'openQuestion') && this.questionEditor) {
      editor = this.questionEditor;
    } else if ((this.ParentNodeType === 'buttonOptions' || this.ParentNodeType == 'listOptions' || this.ParentNodeType == 'whatsAppFlow') && this.bodyEditor) {
      editor = this.bodyEditor;
    } else if (this.cardType == 'NotesMentionModal') {
      editor = this.chatEditors;
    }else if(this.cardType == 'NotificationModal') {
      editor = this.chatEditorElement;
    }


    if (editor) {
      const editPanel = (editor?.contentModule as ContentRender).getEditPanel() as HTMLElement;
      editPanel?.focus();

      setTimeout(() => {
        const range = document.createRange();
        range.selectNodeContents(editPanel);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, 0);

       
       
      this.insertBotVariableCommon(editor, variableName);
    }

    this.closeAllModal();
  }



  insertBotVariableCommon(editorInstance: any, variable: string) {

    const rtePanel = (editorInstance?.contentModule as ContentRender).getEditPanel() as HTMLElement;
    rtePanel.focus();

    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || !this.lastCursorPosition) return;

      // Restore cursor
      selection.removeAllRanges();
      selection.addRange(this.lastCursorPosition);

      // Create variable chip
      const variableNode = document.createElement('span');
      variableNode.setAttribute('contenteditable', 'false');
      variableNode.classList.add('e-mention-chip');
      variableNode.innerHTML = `<a title="{{${variable}}}">{{${variable}}}</a>`;

      const space = document.createTextNode('\u00A0');
      const range = selection.getRangeAt(0);

      range.deleteContents();
      range.insertNode(variableNode);
      range.collapse(false);
      range.insertNode(space);

      // Reset cursor after space
      const newRange = document.createRange();
      newRange.setStartAfter(space);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }, 0);
  }


  openCreateModal(modalId: string, nodeType: string): void {
    this.isEditMode = false;
    this.cardType = nodeType;
    this.ParentNodeType = modalId;
    
    if (nodeType == 'NotesMentionModal') {
      this.dynamiceEditor = this.chatEditors
      this.toggleChatNotes('advanceTool')
    } else if (modalId == 'sendMessage' || modalId == 'questionOption' || modalId == 'openQuestion' || modalId == 'buttonOptions' || modalId == 'listOptions' || modalId == 'whatsAppFlow') {
      this.toggleChatNotes('semiTool')
    } else if (nodeType == 'NotificationModal') {
      this.dynamiceEditor = this.chatEditorElement
      this.toggleChatNotes('attachementTool')
    } else if(nodeType == 'MessageOptin'){
      this.conversationActions.status = 'Yes'
    } else if(nodeType == 'UpdateConversationStatus'){
      this.conversationActions.status = 'Resolved'
    } else{
      this.toggleChatNotes('')
    }

    this.resetFormValidators();
    this.resetForms();

    if (modalId === 'Advance_Action') {
      this.openModal(this.cardType);
    } else {
      this.openModal(modalId);
    }
  }

  private resetFormValidators(): void {
    Object.keys(this.sendTextForm.controls).forEach(key => {
      const control = this.sendTextForm.get(key);
      control?.clearValidators();
    });

    if (this.cardType === 'sendText') {
      const textControl = this.sendTextForm.get('textMessage');
      textControl?.setValidators([
        this.validation.richTextRequiredValidator(),
        Validators.maxLength(this.MAX_CHARACTERS)
      ]);
      textControl?.updateValueAndValidity();
    } else if (['sendImage', 'sendVideo', 'sendDocument'].includes(this.cardType)) {
      const fileControl = this.sendTextForm.get('file');
      const textControl = this.sendTextForm.get('textMessage');
      textControl?.setValidators([Validators.maxLength(this.MAX_CHARACTERS)]);
      fileControl?.setValidators([Validators.required]);
      fileControl?.updateValueAndValidity();
    }
  }

  private resetForms(): void {
    this.sendTextForm.get('file')?.reset();
    this.sendTextForm.reset();
    this.questionOption.reset();
    this.openQuestion.reset();
    this.notificationForm.reset();
    this.notesmentionForm.reset()
    this.whatsAppFlowForm.reset()


this.listOptions.reset();

// Step 2: Clear existing FormArray (sections)
// this.listOptions.setControl('sections', this.fb.array([]));


    this.conditionForm.reset()
     this.conditionForm.get('operator')?.setValue('');
     (this.conditionForm.get('conditions') as FormArray).clear();  
     this.initConditionForm()

     


     

    this.openQuestion.get('answerType')?.setValue('text');
    const optionsArray = this.questionOption.get('options') as FormArray;
    optionsArray.clear();
    optionsArray.push(this.fb.control(''));

    this.buttonOptions.reset();
    this.contactAttributeForm.reset();

    const buttonsArray = this.buttonOptions.get('buttons') as FormArray;
    buttonsArray.clear();
    buttonsArray.push(this.fb.control(''));

    this.buttonOptions.get('headerType')?.setValue('none');
    this.filePreview = null;
    this.selectedImageUrl = null;
    this.selectedTags = [];
    this.selectedBotId = '';
    this.selectedBot = null;
    this.fileName = '';
    this.uploadedFile = null;
  }

  // ==================== EVENT HANDLERS ====================

  private handleEditClick: (event: Event) => void = () => { };
  private handleCopyClick: (event: Event) => void = () => { };
  private handleDeleteClick: (event: Event) => void = () => { };

  // onTextChange(): void {
  //   this.sendTextForm.get('textMessage')?.updateValueAndValidity({ emitEvent: true });
  // }



  onTextChange(): void {
    
    const text = this.sendTextForm.get('textMessage')?.value || ''; // Or get from chatEditor if not reactive
    const plainText = this.stripHtmlTags(text);
    this.characterCount = plainText.length;
  }

  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }



  onReattemptsChange(event: any, form: FormGroup): void {
    if (event.target.checked) {
      form.get('reattemptsCount')?.setValue(event.target.value ? event.target.value : 1);
    }
  }

  onTimeElapseChange(event: any, form: FormGroup): void {
    if (event.target.checked) {
      form.get('timeElapseAction')?.setValue('skip');
    }
  }

  onSaveAsVariableChange(event: any, form: FormGroup): void {
    if (event.target.checked) {
      form.get('variableName')?.setValue('');
      form.get('variableDataType')?.setValue('text');
    }
  }

  onValidationToggle(form: FormGroup): void {

    if (form.get('enableValidation')?.value) {
      form.patchValue({
        reattemptsAllowed: false,
        enableTimeElapse: false,
        invalidAction: 'skip'
      });
    }
  }

  onHeaderTypeChange(form: FormGroup, type: any): void {
    this.removeFile();

    this.buttonOptions.reset();
    const buttonsArray = this.buttonOptions.get('buttons') as FormArray;
    buttonsArray.clear();
    buttonsArray.push(this.fb.control(''));

    this.buttonOptions.get('headerType')?.setValue(`${type}`);
  }

  onAnswerTypeChange(): void {
    const answerType = this.openQuestion.get('answerType')?.value;
    const resetValues = {
      minChars: 0,
      maxChars: null,
      textRegex: '',
      minNumber: null,
      maxNumber: null,
      numberRegex: '',
      minDate: null,
      maxDate: null,
      customRegex: ''
    };
    this.openQuestion.patchValue(resetValues);
  }



  onAgentChange(event: any): void {
    const agentId = event.target.value;
    const selectedAgent = this.agentsList.find((agent: any) => agent.uid == agentId);
    this.notificationForm.patchValue({
      selectedAgentName: selectedAgent?.name || ''
    });
  }


  selectedAttributeType: string = '';
  isUserTyping: boolean = false;
  selectedFromVariable: boolean = false;
  selectedOptions: any[] = [];
  onAttributeChange(value: string): void {
    
    const selectedAttr = this.contactAttributeForm.get('selectedAttribute')?.value;
    this.attributeDetails = this.currentAttributeList.find((attr: any) => attr.ActuallName === selectedAttr);
    this.selectedAttributeType = this.attributeDetails?.type || '';
    this.selectedFromVariable = false;
    this.isUserTyping = false;

    if (this.selectedAttributeType === 'Multi Select' || this.selectedAttributeType == 'Select' || this.selectedAttributeType == 'Switch') {
      try {
        this.selectedOptions = JSON.parse(this.attributeDetails?.dataTypeValues || '[]');
        if(this.selectedAttributeType == 'Switch'){
          this.selectedOptions = [{"optionName": "yes"},{"optionName": "no"}];
        }
      } catch {
        this.selectedOptions = [];
      }
    }

    this.selectedValuesList = [];
    this.contactAttributeForm.get('selectedValue')?.reset();
    


  }

  selectedValues(variable: any): void {
    
    this.contactAttributeForm.patchValue({
      selectedValue: `{{${variable?.displayName || variable?.name || variable?.optionName}}} ` || '',
      inputValue: '',
      selectedVariable: '',
      operation: 'replace'
    });
    this.openDropdown.status = '';
    this.selectedFromVariable = true;
    this.isUserTyping = false;
    this.contactAttributeForm.get('selectedValue')?.updateValueAndValidity();
    this.showAttributeCondition = true

  }

selectedValuesList: any[] = []; // Holds multiple selected options

toggleSelection(variable: any) {
  const index = this.selectedValuesList.findIndex(v => v.optionName === variable.optionName);

  if (index > -1) {
    this.selectedValuesList.splice(index, 1);
  } else {
    this.selectedValuesList.push(variable);
  }

  const combinedValues = this.selectedValuesList
    .map(v => `{{${v.displayName || v.name || v.optionName}}}`)
    .join(' ');

  this.contactAttributeForm.patchValue({
    selectedValue: combinedValues || '',
    inputValue: '',
    selectedVariable: '',
    operation: 'replace'
  });

  // Remove this line so dropdown stays open:
  // this.openDropdown.status = '';

  this.selectedFromVariable = true;
  this.isUserTyping = false;
  this.contactAttributeForm.get('selectedValue')?.updateValueAndValidity();
  this.showAttributeCondition = true;
}


isSelected(variable: any): boolean {
  return this.selectedValuesList.some(v => v.optionName === variable.optionName);
}






  onSelectedValueKeydown(event: KeyboardEvent) {
  if (this.selectedFromVariable && event.key === 'Backspace') {
    event.preventDefault(); // prevent deleting 1 character at a time
    this.contactAttributeForm.patchValue({
      selectedValue: '',
      selectedVariable: '',
      inputValue: ''
    });
    this.selectedFromVariable = false; // allow typing again
    this.showAttributeCondition = false; // hide attribute condition if needed
    this.selectedValuesList = []; // clear selected options
  }
}


  onTextInputChange(event: any): void {
    const inputValue = event.target.value;
    this.isUserTyping = !!inputValue;
    if (this.isUserTyping) {
      this.selectedFromVariable = false;
    }
  }



  selectAttribute(status: string,event: MouseEvent): void {
    this.openDropdown.status = status;
   event.stopPropagation();

  }

  updateCharacterCount(): void {
    const message = this.notificationForm.get('textMessage')?.value || '';
    this.characterCount = message.replace(/<[^>]*>/g, '').length;
  }

  // ==================== GETTERS ====================

  get options(): FormArray {
 return (this.questionOption?.get('options') as FormArray) || this.fb.array([]);
  }

  get buttons(): FormArray {
    return this.buttonOptions.get('buttons') as FormArray;
  }

  get sections(): FormArray {
    return this.listOptions.get('sections') as FormArray;
  }

  get listOptionSections(): FormArray {
    return this.listOptions.get('sections') as FormArray || this.fb.array([]);
  }


  getFileAcceptType(headerType: string): string {
    switch (headerType) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'document': return '.pdf,.doc,.docx,.txt';
      default: return '';
    }
  }

  getSectionRows(sections: FormArray, sectionIndex: number): FormArray {
    const section = sections.at(sectionIndex) as FormGroup;
    return section.get('rows') as FormArray;
  }

  saveConditions(): void {

  }





  getOperators(type: string): string[] {
    if (!type) return [];
    const normalizedType = type?.toLowerCase();

    switch (normalizedType) {
      case 'text':
      case 'string':
        return STRING_OPERATORS;

      case 'number':
        return NUMBER_OPERATORS;

      case 'boolean':
      case 'switch':
        return BOOLEAN_OPERATORS;

      case 'select':
        return SELECT_OPERATORS;

      case 'multi select':
        return MULTI_SELECT_OPERATORS;

      case 'date':
        return DATE_OPERATORS;

      case 'time':
        return TIME_OPERATORS;

      case 'user': // if needed, treat User as Select-like
        return SELECT_OPERATORS;

      default:
        return [];
    }
  }

  onCancel() {
    // this.cancel.emit();
    this.closeModal()
  }



onFileSelectedData(event: any, type: any = '') {
  const file = event.target.files[0];
  const input = event.target as HTMLInputElement;

  if (!file) return;

  const mimeType = file.type;
  let detectedType: 'image' | 'video' | 'document' | 'unknown' = 'unknown';

  if (mimeType.startsWith('image/')) {
    detectedType = 'image';
  } else if (mimeType.startsWith('video/')) {
    detectedType = 'video';
  } else if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/msword' ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('document')
  ) {
    detectedType = 'document';
  }

  
  // Get selected header type from form
  const selectedHeaderType = this.buttonOptions.get('headerType')?.value;

  // Restrict uploads based on selected header type
  if (
    selectedHeaderType === 'image' && detectedType !== 'image' ||
    selectedHeaderType === 'video' && detectedType !== 'video' ||
    selectedHeaderType === 'document' && detectedType !== 'document'
  ) {
    this.showToaster(`Invalid file type. Please upload a valid file.`,'error');
    input.value = '';
    return;
  }

   if (
    this.cardType === 'sendImage' && detectedType !== 'image' ||
    this.cardType === 'sendVideo' && detectedType !== 'video' ||
    this.cardType === 'sendDocument' && detectedType !== 'document'
  ) {
    this.showToaster(`Invalid file type. Please upload a valid file.`,'error');
    input.value = '';
    return;
  }


  // File size check
  const maxSize = detectedType === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    this.showToaster(`File size exceeds maximum allowed (${detectedType === 'image' ? '5MB' : '10MB'})`,'error');
    input.value = '';
    return;
  }


  this.uploadedFile = file;
  this.selectedFileType = detectedType;
  this.selectedFileUrl = URL.createObjectURL(file);
  this.sendTextForm.patchValue({ file });

  // Preview
  if (detectedType === 'image' || detectedType === 'video') {
    this.selectedImageUrl = this.selectedFileUrl;
  } else if (detectedType === 'document') {
    this.selectedImageUrl = 'assets/img/document.png';
  }

  this.saveFilesUpload(file, type);
  input.value = '';
}




  saveFilesUpload(file: File,type:any) {
    
  if (!file) return;

  const spid = this.userDetails.SPID || this.userDetails.SP_ID;
  this.mediaType = file.type;
  const fileSizeInMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
  const imageSizeLimitMB = 5;
  const docVideoLimitMB = 10;

  const formData = new FormData();
  formData.append('dataFile', file, file.name);

  if ((this.mediaType === 'video/mp4' || this.mediaType === 'application/pdf') && fileSizeInMB > docVideoLimitMB) {
    this.showToaster('Video / Document File size exceeds 10MB limit', 'error');
    return;
  }

  if (
    ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'].includes(this.mediaType) &&
    fileSizeInMB > imageSizeLimitMB
  ) {
    this.showToaster('Image File size exceeds 5MB limit', 'error');
    return;
  }

  const uploadPath = 'BotBuilder';
  
  this.apiService.uploadfile(formData, spid, uploadPath).subscribe({
    next: (res: any) => {
      if (res.filename) {
        this.messageMediaFile = res.filename;
        this.messageMeidaFile = res.filename;
        this.selectedImageUrl =  res.filename
  
   this.selectedFileUrl = res.filename
       if(type == 'buttonOption'){
      this.buttonOptions.patchValue({fileLink:res.filename})
    }else{
      this.sendTextForm.patchValue({
      file: res.filename  // or use `res.filename` if saving just name
    });
    }
        this.showAttachmenOption = false;
        this.isUploadingLoader = false;
      }
    },
    error: () => {
      this.showToaster('File upload failed', 'error');
    }
  });
}


  onFileChange(event: any) {
    this.isUploadingLoader = true;
    let files: FileList = event.target.files;
    this.saveFiles(files);

  }

  allowOnlyBackspace(event: KeyboardEvent): void {
    if (event.key !== 'Backspace') {
      event.preventDefault();
    }
  }



  mediaType: any = '';
  saveFiles(files: FileList) {
    if (files[0]) {
      let imageFile = files[0]
      let spid = this.userDetails.SPID || this.userDetails.SP_ID
      if ((files[0].type == 'video/mp4' || files[0].type == 'application/pdf' || files[0].type == 'image/jpg' || files[0].type == 'image/jpeg' || files[0].type == 'image/png' || files[0].type == 'image/webp')) {
        this.mediaType = files[0].type
        let fileSize = files[0].size;

        const fileSizeInMB: number = parseFloat((fileSize / (1024 * 1024)).toFixed(2));
        const imageSizeInMB: number = parseFloat((5 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
        const docVideoSizeInMB: number = parseFloat((10 * 1024 * 1024 / (1024 * 1024)).toFixed(2));

        const data = new FormData();
        data.append('dataFile', imageFile, imageFile.name);

        if ((this.mediaType == 'video/mp4' || this.mediaType == 'application/pdf') && fileSizeInMB > docVideoSizeInMB) {
          this.showToaster('Video / Document File size exceeds 10MB limit', 'error');
        }

        else if ((this.mediaType == 'image/jpg' || this.mediaType == 'image/jpeg' || this.mediaType == 'image/png' || this.mediaType == 'image/webp') && fileSizeInMB > imageSizeInMB) {
          this.showToaster('Image File size exceeds 5MB limit', 'error');
        }

        else {
          let name = 'teambox'
          this.apiService.uploadfile(data, spid, name).subscribe(uploadStatus => {
            let responseData: any = uploadStatus
            if (responseData.filename) {
              
              

              this.messageMediaFile = responseData.filename;
              this.messageMeidaFile = responseData.filename;
              
              // this.attachmentMedia = responseData.filename;
              // this.mediaSize=responseData.fileSize

              this.sendattachfile();
              
              this.showAttachmenOption = false;
              this.isUploadingLoader = false;
            }

          });
        }
      } else {
        this.showToaster('Please select valid file type', 'error')
      }

    };
  }

  sendattachfile() {
    
    if (this.isAttachmentMedia === false) {
      if (this.messageMediaFile !== '') {
        $("#sendfile").modal('show');
      } else {
        $("#sendfile").modal('hide');
      }
    } else {
      let mediaCategory;
      if (this.mediaType.startsWith('image/')) {
        mediaCategory = 'image';
      } else if (this.mediaType.startsWith('video/')) {
        mediaCategory = 'video';
      } else if (this.mediaType === 'application/') {
        mediaCategory = 'document';
      }
    }
  }

  showToaster(message: any, type: any) {
    if (type == 'success') {
      this.successMessage = message;
    } else if (type == 'error') {
      this.errorMessage = message;
    } else {
      this.warningMessage = message;
    }
    setTimeout(() => {
      this.hideToaster()
    }, 5000);

  }

  hideToaster() {
    this.successMessage = '';
    this.errorMessage = '';
    this.warningMessage = '';
  }


  attachMedia(Link: string, media_type: string) {
    
    
    this.closeAllModal()
    let mediaName
    const fileNameWithPrefix = Link?.substring(Link?.lastIndexOf('/') + 1);
    let originalName;
    let getMimeTypePrefix = this.getMimeTypePrefix(media_type);
    if (getMimeTypePrefix === 'video/') {
      originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
      originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
    } else {
      originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
    }
    
    if (getMimeTypePrefix === 'image') {
      mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> ' + originalName + '</p>'
    }
    else if (getMimeTypePrefix === 'video') {
      mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> ' + originalName + '</p>'
    }
    else {
      media_type = 'document';
      getMimeTypePrefix = 'document';
      mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" alt="icon"/>' + originalName + '</p><br>'
    }
    
    const editorElement = this.dynamiceEditor?.contentModule?.getEditPanel?.();
    

    if (editorElement) {
      const existingMediaElement = editorElement.querySelector('.custom-class-attachmentType');

      if (existingMediaElement) {
        const newElement = document.createElement('div');
        newElement.innerHTML = mediaName + '<br>';
        editorElement.replaceChild(newElement.firstElementChild!, existingMediaElement);
        
      } else {
        const editorValue = this.dynamiceEditor.value ?? '<br>';
        this.dynamiceEditor.value = mediaName + editorValue;
        
      }
    }
    this.mediaType = media_type
    this.messageMediaFile = Link;
    let item = {
      media_type: getMimeTypePrefix,
    }

    if (this.cardType == "NotesMentionModal") {


      this.notesmentionForm.patchValue({
        file: Link,
        mediaType: media_type,
        UIIdMention: this.syncMentionArray() || []
      })
    }
    if (this.cardType == "NotificationModal") {
      this.notificationForm.patchValue({
        file: Link,
        mediaType: media_type
      })
    }
    this.addingStylingToMedia(item);
  }


  getMimeTypePrefix(mimeType: string): string {
    return mimeType?.split('/')[0];
  }


  addingStylingToMedia(item: any) {
    if (item?.media_type === 'image' || item?.media_type === 'video' || item?.media_type === 'document') {
      setTimeout(() => {
        
        const editorContent = this.dynamiceEditor.element.querySelector('.e-content');
        const mediaElements = editorContent?.querySelectorAll('img, video');
        
        

        mediaElements?.forEach((element: any) => {
          const media = element as HTMLElement;

          media.style.width = '18px';
          media.style.height = '10%';
          media.style.position = 'inherit';
          media.style.zIndex = '99';

          const crossButton = document.createElement('button');
          crossButton.textContent = '✖';
          crossButton.style.position = 'absolute';
          crossButton.style.right = '5px';
          crossButton.style.zIndex = '100';
          crossButton.style.background = '#ffffff';
          crossButton.style.color = 'red';
          crossButton.style.width = '24px';
          crossButton.style.border = 'none';
          crossButton.style.outline = 'none';
          crossButton.style.borderRadius = '50%';
          crossButton.style.cursor = 'pointer';
          crossButton.style.pointerEvents = 'auto';

          const parentElement = media.parentElement as HTMLElement;
          parentElement.style.position = 'relative';
          parentElement.style.width = '34%';
          parentElement.style.overflow = 'hidden';
          parentElement.style.textOverflow = 'ellipsis';
          parentElement.style.whiteSpace = 'nowrap';
          parentElement.style.paddingRight = '30px';
          parentElement.style.border = '0.5px solid';
          parentElement.style.padding = '4px';

          parentElement.style.pointerEvents = 'none';
          parentElement.setAttribute('contenteditable', 'false');
          parentElement.appendChild(crossButton);

          crossButton.addEventListener('click', () => {
            const mediaNameElement = editorContent?.querySelector('.custom-class-attachmentType');
            if (mediaNameElement) {
              mediaNameElement.remove();
            }
            if (this.mediaType) {
              this.mediaType = ''
              this.messageMediaFile = ''
            }
            media.remove();
            crossButton.remove();
          });
        });
      }, 0);
    }
  }



openBotVariableModal(editorId:any = '') {
  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    this.lastCursorPosition = selection.getRangeAt(0);
  } else {

    const editor = this.getEditorById(editorId);
    if (editor) {
      this.lastCursorPosition = editor.getRange(); // Save cursor for this editor
    }else{
      this.lastCursorPosition = null; // or create a default Range if needed
    }
  }

  $('#botVariable').modal('show');
}


  getEditorById(editorId: string): RichTextEditorComponent | null {
    switch (editorId) {
      case 'chatEditor': return this.chatEditor;
      case 'chatEditors': return this.chatEditors;
      case 'chatEditorElement': return this.chatEditorElement;
      case 'questionEditor': return this.questionEditor;
      case 'errorEditor': return this.errorEditor;
      case 'errorEditor': return this.errorEditor;
      case 'errorEditor': return this.errorEditor;
      default: return null;
    }
  }


  fallbackValue: any = ''
  applyAttribute() {

    this.closeAllModal();
  }


  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  UIIdMention:any=[]
  InsertMentionOption(user: any) {
    let content: any = this.chatEditors.value || '';
    content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
    content = content + `<span contenteditable="false" class="e-mention-chip" data-uid="${user?.uid}"><a _ngcontent-yyb-c67="" href="mailto:" title="">@${user?.name}</a></span>`;
    this.chatEditors.value = content;
    // content = content+'<span> </span>'
    // this.chatEditor.value = content;
    setTimeout(() => {
      this.attachMentionHandlers();
    }, 10);
    this.showMention = false;
    //this.selectInteraction(this.selectedInteraction)
  }

  attachMentionHandlers() {
    const mentions = document.getElementById('defaultRTE')?.querySelectorAll('.mention');
    mentions?.forEach((mention: HTMLElement | any) => {
      mention.addEventListener('click', this.moveCursorToEndOfMention);
    });
  }

  moveCursorToEndOfMention(event: MouseEvent) {
    const mention = event.target as HTMLElement;
    if (mention && mention.nextSibling) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStartAfter(mention);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  get shouldShowNoData(): boolean {
    return this.agentsList.length === 0 || !this.agentsList.some((user: any) => user.uid !== this.userDetails.uid);
  }




  isSidebarCollapsed = false;

  // Add this method to your component class
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }





  async saveChatbot(type: any,exitType=''): Promise<void> {
    this.isLoading = true
    this.orignalData = {};
    const exportData: any = this.editor.export();
    const exportNodesData: any = Object.values(exportData?.drawflow?.Home?.data);


    var data = {
      status: '',
      node_FE_Json: JSON.stringify(exportData),
      botId: localStorage.getItem('botId'),
      SPID: this.userDetails.SP_ID,
      nodes: [],
      botVarList:this.botVariables
    }

    if (type == 'submit') {
      data.status = 'draft'
    } else {
      let isStructureValid = true;

      

      if (exportNodesData.length == 0 ) {
        this.isLoading = false
         this.showToaster('Please add some cards before publish the bot','error')
         return
      }
      // Check each node's inputs/outputs are connected
      exportNodesData.forEach((node: any) => {
        const isFullyConnected = this.checkAllInputsAndOutputsConnected(node);
        if (!isFullyConnected) {
          isStructureValid = false;
          this.isLoading = false
           this.showToaster('Node ${node.id} is not fully connected.','error')
           return
        }
      });

      // Check every input/output is used only once (1-to-1)
      const isOneToOneValid = this.checkOnlyOneToOneConnections(exportData);
      if (!isOneToOneValid) {
        isStructureValid = false;
        this.isLoading = false
        this.showToaster(' Some inputs/outputs are connected more than once','error')
        return
      }

      if (!isStructureValid) {
        this.isLoading = false
        this.showToaster('Some nodes are either not fully connected or have multiple connections per node.','error')
        return;
      }
      const flowData: any = this.getFullFlowJson();

      data.status = 'publish'
      data.nodes = flowData
    }
     localStorage.setItem('node_FE_Json',data.node_FE_Json)
     
    this.botService.submitBot(data).subscribe((res: any) => {
      this.isLoading = false
      
      if (data.status == 'publish') {
        
        this.showToaster('Bot published successfully', 'success')
        setTimeout(() => {
          this.router.navigate(['/bot-builder']);
        }, 500);
      }else{
        
        this.showToaster('Changes saved successfully', 'success')
        if (exitType == 'exit') {
            setTimeout(() => {
          this.router.navigate(['/bot-builder']);
        }, 500);
        }
      }
      


    })
  }


  checkOnlyOneToOneConnections(drawflowData: any): boolean {
    const nodes = drawflowData?.drawflow?.Home?.data;
    if (!nodes) return false;

    const inputMap = new Map();  // Tracks each input's connections
    const outputMap = new Map(); // Tracks each output's connections

    for (const nodeId in nodes) {
      const node = nodes[nodeId];

      // Check outputs
      for (const outputKey in node.outputs) {
        const connections = node.outputs[outputKey].connections;

        for (const conn of connections) {
          const outputId = `${node.id}-${outputKey}`;
          const inputId = `${conn.node}-${conn.output}`;

          // Count output usage
          if (outputMap.has(outputId)) {
            return false; // ❌ More than one connection from a single output
          }
          outputMap.set(outputId, true);

          // Count input usage
          // if (inputMap.has(inputId)) {
          //   return false; // ❌ More than one connection to a single input
          // }
          inputMap.set(inputId, true);
        }
      }
    }

    return true; // ✅ All connections are 1-to-1
  }


  checkAllInputsAndOutputsConnected(node: any): boolean {
    if (!node || !node.inputs || !node.outputs) {
      return false; // or handle differently based on your use case
    }

    const allInputsConnected = Object.keys(node.inputs).every(
      key => node.inputs[key]?.connections?.length > 0
    );

    const allOutputsConnected = Object.keys(node.outputs).every(
      key => node.outputs[key]?.connections?.length > 0
    );

    return allInputsConnected && allOutputsConnected;
  }


  private getFullFlowJson(): any {
    const exportData = this.editor.export();
    const allNodes = exportData.drawflow.Home.data;

    const connections: any[] = [];
    const finalNodes: any[] = [];

    // Collect all connections
    Object.entries(allNodes).forEach(([id, node]: [string, any]) => {
      Object.entries(node.outputs).forEach(([outputKey, output]: [string, any]) => {
        output.connections.forEach((connection: any) => {
          connections.push({
            sourceNode: node.id,
            sourceOutput: outputKey,
            targetNode: connection.node,
            targetInput: connection.output
          });
        });
      });
    });


    // console.log("connections",connections)
    // Process each node
    Object.entries(allNodes).forEach(([id, node]: [string, any]) => {
      // console.log('Processing node:', node);
      const formData = node.data.formData || {};
      const isQuestionOption = node.data.text === 'questionOption' || node.data.text === "buttonOptions" ||  node.data.text ==="WorkingHoursModal" || node.data.text === "setCondition" || node.data.text === "listOptions";
      if(node.data.text === "listOptions"){
        var sectionListArray:any = []
  node?.data?.formData?.sections.forEach((element:any) => {
element?.rows.forEach((row:any) => {
  sectionListArray.push(row?.rowName);
});

  });
  node.data.sectionListArray = sectionListArray;
}


      
      // Filter and sort connections by targetNode (ascending order)
      const nodeConnections = connections
        .filter(conn => conn.sourceNode === node.id)

      const nodeObj: any = {
        nodeId: node.id,
        nodeType: node.data.text,
        connectedId: null,
        FallbackId: null,
        option: [],
        data: formData
      };
      if (nodeConnections.length > 0) {
        nodeObj.connectedId = nodeConnections[0]?.targetNode ?? null;

        // If fallback is enabled and there's a second connection
        if ((formData.invalidAction === 'fallback' || formData.timeElapseAction === 'fallback') && nodeConnections.length > 1) {
          nodeObj.FallbackId = nodeConnections[1]?.targetNode ?? null;
        }

        // console.log(isQuestionOption, formData)
   

        if (isQuestionOption) {
          var optionNames = formData?.options || formData?.buttons || formData?.data?.options || formData?.data?.sections || node?.data?.sectionListArray  || [];

          var skipIndexes = [0]; // Skip connectedId
          if ((formData.invalidAction === 'fallback' || formData.timeElapseAction === 'fallback') && nodeConnections.length > 1) {
            skipIndexes.push(1); // Skip fallback
          }
          if (nodeObj?.nodeType === "WorkingHoursModal" || nodeObj?.nodeType === "setCondition") {
            nodeConnections.forEach((conn, idx) => {
              nodeObj.option.push({
                optionConnectedId: conn.targetNode,
                name: optionNames[idx]
              });
            });
          }else{
            optionNames = optionNames.reverse();
            nodeConnections.forEach((conn, idx) => {
              if (!skipIndexes.includes(idx)) {
                const labelIndex = idx - skipIndexes.length;
                nodeObj.option.push({
                  optionConnectedId: conn.targetNode,
                  name: optionNames[labelIndex] || optionNames[labelIndex]?.rowName || `Option ${labelIndex + 1}`
                });
              }
            });
            nodeObj.option = nodeObj.option.reverse();
          }

        }
      }

      
   if (nodeObj?.nodeType === "buttonOptions") {
  const reverseButton: any = nodeObj?.data?.buttons?.reverse() || [];
  if (nodeObj && nodeObj.data && nodeObj.data.buttons) {
    nodeObj.data.buttons = reverseButton; // ✅ Removed ?. here
  }
}
      finalNodes.push(nodeObj);
    });

    return finalNodes;
  }


  closeBotCreateion(type: any) {

    if (type == 'Publish') {
      $('#Publish').modal('show')
    } else {
      $('#draft').modal('show')

    }

  }


isTooltipVisible2:any
    handleTooltipChange(visible: boolean,type:any='') {
if (type == 2){
        this.isTooltipVisible2 = visible
      }else{

        this.isTooltipVisible = visible;
      }
    }


  ConfirmdeleteBot(){
    this.editor.removeNodeId(`node-${this.deletNodeId}`);
  }




  closeUtility(){
// this.showAttributeCondition = true
this.openDropdown.status = ''

}

channelOption:any
channelSelected:any
  getWhatsAppDetails(): void {
    this.settingService.getWhatsAppDetails(this.userDetails.SP_ID).subscribe((response: any) => {
      if (response?.whatsAppDetails) {
        this.channelOption = response.whatsAppDetails.map((item: any) => ({
          value: item?.id,
          label: item?.channel_id,
          connected_id: item?.connected_id,
          channel_status: item?.channel_status
        }));

        if (this.channelOption.length === 1) {
          this.channelSelected = this.channelOption[0].label;

        }
      }
    });
  }


  ChannelWhatsAppOrWeb: any[] = [];
ChannelWhatsAppOrWebSelection:any=''
  getChannelWhatsAppOrWeb(): void {
    this.settingService.getChennelWhapiorWeb(this.userDetails.SP_ID).subscribe((response: any) => {
	 if(response){
			 this.ChannelWhatsAppOrWebSelection = response?.provider
		 }
    });
  }

 
}