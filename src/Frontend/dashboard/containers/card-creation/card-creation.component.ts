import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { DatePickerComponent } from '@syncfusion/ej2-angular-calendars';
import Drawflow from 'drawflow';
import { RichTextEditor } from '@syncfusion/ej2-angular-richtexteditor';
import { PhoneValidationService } from 'Frontend/dashboard/services/phone-validation.service';
import { TeamboxService } from 'Frontend/dashboard/services';
import { BotserviceService } from 'Frontend/dashboard/services/botservice.service';
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
  PASTE_CLEANUP_SETTINGS
} from './constants';

declare var bootstrap: any;
declare var $: any;

interface Attribute {
  name: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'switch' | 'number' | 'date';
  options?: { value: string, label: string }[];
}

interface Bot {
  id: string;
  name: string;
  published: boolean;
}

interface Agent {
  id: string | number;
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

  // Component state
  showLock = true;
  nodeCounter = 1;
  selectedNodeId: number | null = null;
  cardType = '';
  filePreview: string | ArrayBuffer | null = null;
  fileError: string | null = null;
  orignalData: any = {};
  selectedType = 'Text';
  selectedImageUrl: any = '';
  isEditMode = false;
  currentModalRef: NgbModalRef | null = null;
  existingVariableNames: string[] = [];
  isFocused = false;

  botVariables: BotVariable[] = [];
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

  // File handling
  uploadedFile: File | null = null;
  selectedFileUrl: string | null = null;
  selectedFileType: string | null = null;

  // View children
  @ViewChild('chatEditor') chatEditor!: RichTextEditorComponent;
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

  // Data collections
  filteredAgents: Agent[] = [];

  availableAgents: Agent[] = [];

  availableBots: Bot[] = [];
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
  @Input() availableAttributes: Attribute[] = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    {
      name: 'gender', label: 'Gender', type: 'select',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ]
    }
  ];
  @Input() availableVariables = ['bot.name', 'contact.city', 'session.date'];
  @Input() selectedTags: string[] = [];

  @Output() conditionsChange = new EventEmitter<any[]>();
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() tagsSelected = new EventEmitter<{ tags: string[], options: any }>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() timeDelaySet = new EventEmitter<{ time: number, unit: string }>();

  // Other properties
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
  operationOptions = { addIfEmpty: false };
  conversationActions = { status: '' };
  openDropdown = { status: '' };
  filteredTags: Tag[] = [...this.allTags];
  showVarMenuFor: { index: number, field: 'comparator' | 'value' } | null = null;
  showAttribute: { index: number, field: 'comparator' | 'value' } | null = null;
  attributeDetails?: Attribute;
  // Tools and settings
  tools = DEFAULT_TOOLS;
  basicTools = DEFAULT_TOOLS;
  pasteCleanupSettings = PASTE_CLEANUP_SETTINGS

  constructor(
    private fb: FormBuilder,
    public validation: PhoneValidationService,
    private apiService: TeamboxService, private botService: BotserviceService
  ) {
    this.userDetails = JSON.parse(sessionStorage.getItem('loginDetails') || '{}');
    this.initForms();
  }

  ngOnInit(): void {
    this.initEditor();
    this.getStaticData()

  }




  getStaticData() {

    this.filteredAgents = this.botService.FILTERED_AGENTS
    this.availableAgents = this.botService.AVAILABLE_AGENTS;
    this.attributeList = this.botService.ATTRIBUTE_LIST;
    this.sampleVariables = this.botService.SAMPLE_VARIABLES;
    this.allTags = this.botService.ALL_TAGS;
    this.availableBots = this.botService.AVAILABLE_BOTS;



    // this.botService.getBots().subscribe((bots: Bot[]) => {
    //   this.availableBots = bots.filter(bot => bot.published);
    // });

    // this.apiService.getAgents().subscribe((agents: Agent[]) => {
    //   this.availableAgents = agents;
    //   this.filteredAgents = agents;
    // });

    // this.apiService.getTags().subscribe((tags: Tag[]) => {
    //   this.allTags = tags;
    //   this.filteredTags = [...tags];
    // });

    // this.apiService.getAttributes().subscribe((attributes: Attribute[]) => {
    //   this.availableAttributes = attributes;
    // });
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
      console.log(target)



      const homeCardId: any = Object.keys(drawflowData).find(key =>
        drawflowData[key].name === 'home'
      );
      console.log("source", source, homeCardId)
      var count = 0
      // 2. If this is a connection FROM the home card
      if (source === homeCardId) {
        console.log("source", source)
        const homeNode = drawflowData[homeCardId];
        console.log("homeNode", homeNode)
        const existingConnections = homeNode.outputs?.output_1?.connections || [];
        console.log("existingConnections", existingConnections)


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
            alert('The home card can only connect to one card!');
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
      questionText: ['', [Validators.required, Validators.maxLength(4056)]],
      options: this.fb.array(['']),
      saveAnswerVariable: [''],

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
    });

    this.setupFormListeners(this.questionOption);
  }

  private initButtonOptionsForm(): void {
    this.buttonOptions = this.fb.group({
      headerType: ['none'],
      headerText: ['', [Validators.maxLength(60)]],
      bodyText: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]],
      footerText: ['', [Validators.maxLength(60)]],
      buttons: this.fb.array([this.fb.control('', [Validators.required, Validators.maxLength(20)])]),
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
    });

    this.setupFormListeners(this.buttonOptions);
  }

  private initListOptionsForm(): void {
    this.listOptions = this.fb.group({
      headerText: ['', [Validators.maxLength(60)]],
      bodyText: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]],
      footerText: ['', [Validators.maxLength(60)]],
      listHeader: ['', [Validators.maxLength(20)]],
      sections: this.fb.array([this.createSection()]),
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
    });

    this.setupFormListeners(this.listOptions);
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
    });

    this.setupFormListeners(this.openQuestion);
  }

  private initConditionForm(): void {
    this.conditionForm = this.fb.group({
      conditions: this.fb.array([])
    });
    this.addCondition();
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
      selectedAgentIds: ['1', Validators.required],
      selectedAgentName: [''],
      textMessage: ['', [Validators.required, Validators.maxLength(this.MAX_CHARACTERS)]]
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

  // ==================== NODE HANDLING METHODS ====================

  onSubmit(formType: string = ''): void {
    if (['questionOption', 'openQuestion', 'buttonOptions', 'listOptions'].includes(this.ParentNodeType)) {
      this.handleQuestionSubmit(formType);
    } else if ([
      'assignAgentModal', 'assigntoContactOwner', 'UnassignConversation',
      'UpdateConversationStatus', 'UpdateContactAttribute', 'AddTags',
      'RemoveTag', 'TimeDelayModal', 'BotTriggerModal', 'MessageOptin',
      'NotificationModal'
    ].includes(formType)) {
      this.advanceOptionsSubmit(formType);
    } else {
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
      default:
        return;
    }

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    formData = form.value;
    this.closeModal();





    if (formData.saveAsVariable && formData.variableName) {
      const newVariable: BotVariable = {
        name: formData.variableName,
        dataType: formData.variableDataType,
        value: this.getDefaultValueForType(formData.variableDataType)
      };

      // Check if variable with same name AND type already exists
      const variableExists = this.botVariables.some(
        v => v.name === newVariable.name && v.dataType === newVariable.dataType
      );

      if (!variableExists) {
        this.botVariables.push(newVariable);
      } else {
        // Optionally show a message that variable wasn't added because it already exists
        return;
      }
    }


    if (this.isEditMode && this.selectedNodeId !== null) {
      this.updateExistingNode(formData);
    } else {
      this.createNewNodeWithData(formData);
    }
  }





  private advanceOptionsSubmit(formType: string): void {
    this.closeModal();

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
        advanceOption.data = this.notificationForm.value;
        break;
      case 'TimeDelayModal':
        advanceOption.data = { time: this.delayTime, unit: this.delayUnit };
        break;
      case 'BotTriggerModal':
        advanceOption.data = this.selectedBot;
        break;
      case 'AddTags':
      case 'RemoveTag':
        advanceOption.data = {
          tags: this.selectedTags,
          operation: this.operationOptions
        };
        break;
    }

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




  private createNewNodeWithData(formData: any): void {
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

    if (this.cardType == 'Assign_Agent' || this.cardType == 'Assign_to_Contact_Owner' || this.cardType == 'Unassign_Conversation' || this.cardType == 'Update_Status' || this.cardType == 'Trigger_Bot') {
      outputs = 0;
    }


    console.log('Creating new node with data:', outputs);


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
        fileName: formData.file?.name || null,
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
        console.log("'home', nodeId, 'output_1', 'input_1'", nodeId - 1, nodeId, 'output_1', 'input_1')
        this.editor.addConnection(nodeId - 1, nodeId, 'output_1', 'input_1');
      }, 100);
    }
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
    }

    if (formData?.invalidAction === "fallback") {
      outputs += 1;
    }

    return outputs;
  }

  private setOutputPositionsBasedOnType(nodeId: any, formData: any): void {
    if (this.ParentNodeType === 'listOptions') {
      this.setOutputPositionsForList(nodeId, formData);
    } else {
      this.setOutputPositions(Number(nodeId), formData?.invalidAction);
    }
  }

  private setOutputPositions(nodeId: number, fallbackAction: string = ''): void {
    const node = document.getElementById(`node-${nodeId}`);
    if (!node) return;

    const outputs = node.querySelectorAll('.outputs .output');
    if (outputs.length === 0) return;

    // Position first output
    const output1 = outputs[0] as HTMLElement;
    output1.style.position = 'absolute';
    output1.style.top = '20px';

    let remainingOutputs = Array.from(outputs).slice(1);

    if (fallbackAction === "fallback") {
      const output2 = outputs[1] as HTMLElement;
      output2.style.position = 'absolute';
      output2.style.top = '41px';
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
    if (formData?.invalidAction === "fallback") {
      const output2 = outputs[1] as HTMLElement;
      output2.style.position = 'absolute';
      output2.style.top = '41px';
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

    if (formData.homeIcon) {
      newHTML += `
      <div class="home-icon-container" style="text-align: center; margin: 15px 0;">
        <div style="font-size: 24px;">🏠</div>
        <div style="font-size: 14px; color: #666;">Build your flow</div>
      </div>
    `;
    }

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
      'openQuestion': 'Open',
      'buttonOptions': 'Button',
      'listOptions': 'List'
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
      'List': 'background:#f93',
      'Advance_Action': 'background:#BEDBF5'
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
        content += `<div class="textCont"><p>${formData.textMessage}</p></div>`;
      }
    } else if (nodeData.text === 'sendText') {
      content += `<div class="textCont">${formData.textMessage || 'Sample Text'}</div>`;
    } else if (nodeData.text === 'openQuestion') {
      content += `<div class="textCont">${formData.questionText || 'Sample Text'}</div>`;
    } else if (nodeData.text === 'questionOption') {
      content += this.createQuestionOptionContent(nodeId, formData);
    } else if (nodeData.text === 'buttonOptions') {
      content += this.createButtonOptionsContent(nodeId, nodeData, formData);
    } else if (nodeData.text === 'listOptions') {
      content += this.createListOptionsContent(nodeId, formData);
    }

    return content;
  }

  private createMediaContent(nodeData: any): string {
    let mediaContent = '<div class="textContImage">';
    const mediaSrc = nodeData.file ? this.filePreview || this.selectedImageUrl : 'assets/img/not_found.jpg';

    if (this.cardType === 'sendImage') {
      mediaContent += `<img alt="Image Preview" src="${mediaSrc}" class="Preview" style="max-width: 100%;" class="mb-2" />`;
    } else if (this.cardType === 'sendVideo') {
      mediaContent += `<video src="${mediaSrc}" class="Preview mb-2" controls style="max-width: 100%;"></video>`;
    } else if (this.cardType === 'sendDocument') {
      mediaContent += `<img alt="Document Preview" src="assets/img/document.png" class="Preview" style="max-width: 100%;" class="mb-2" />`;
    }

    mediaContent += '</div>';
    return mediaContent;
  }

  private createQuestionOptionContent(nodeId: any, formData: any): string {
    let content = '<div class="textQuestion">';
    if (formData.questionText) {
      content += `<h6 class="body_text">${formData.questionText}</h6>`;
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
      content += `<h6 class="body_text">${formData.headerText}</h6>`;
    }

    if (['image', 'video', 'document'].includes(formData?.headerType)) {
      content += this.createHeaderMediaContent(nodeData, formData.headerType);
    }

    if (formData?.bodyText) {
      content += `<h6 class="body_text">${formData.bodyText || 'Sample Body Text'}</h6>`;
    }

    if (formData?.footerText) {
      content += `<h6 class="body_text">${formData.footerText}</h6>`;
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
      content += `<h6 class="body_text">${formData.headerText}</h6>`;
    }

    if (formData.bodyText) {
      content += `<h6 class="body_text">${formData.bodyText}</h6>`;
    }

    if (formData.footerText) {
      content += `<h6 class="body_text">${formData.footerText}</h6>`;
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
        content = `<div class="textCont"><p>Trigger Bot <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.name} ${!formData.data.published ? '(Unpublished)' : ''}<span></p></div>`;
        break;
      case 'MessageOptin':
        content = `<div class="textCont"><p>Message Opt-in <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.status}<span></p></div>`;
        break;
      case 'NotificationModal':
        content = `<div class="textCont"><p>Notify <span style="font-size: 13px;color: #0a0a0a;font-weight: bold;">${formData.data.selectedAgentName}<span></p></div>`;
        break;
    }

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
      'listOptions': 'Options'
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
          console.log(nodeId)
          this.editor.removeNodeId(`node-${nodeId}`)
        };
        deleteNodeIconClick.addEventListener('click', this.handleDeleteClick);
      }
    }, 0);
  }

  private updateExistingNode(formData: any): void {
    if (this.selectedNodeId === null) return;

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
    }

    if ((this.ParentNodeType === 'questionOption' || this.ParentNodeType === 'listOptions' ||
      this.ParentNodeType === 'buttonOptions') && newOutputsCount !== currentOutputsCount) {
      this.updateNodeOutputs(node, currentOutputsCount, newOutputsCount, formData);
    }

    this.editor.updateNodeDataFromId(this.selectedNodeId, node.data);
    const newHTML = this.createNodeHtml(this.selectedNodeId, node.data);
    this.updateNodeHTML(this.selectedNodeId, newHTML);
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
      this.setOutputPositions(node.id);
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
      this.currentModal = new bootstrap.Modal(modalElement);
    }

    this.currentModal.show();
    modalElement.addEventListener('hidden.bs.modal', () => {
      this.currentModal = null;
    });
  }

  closeModal(): void {
    if (this.currentModal) {
      this.currentModal.hide();
      this.currentModal = null;
    }
  }

  // ==================== FORM ARRAY HANDLING ====================

  addOption(options: FormArray): void {
    const lastOption = options.at(options.length - 1).value;

    if ((!lastOption || lastOption.trim() === '') && options.length > 1) {
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
  addSection(sections: FormArray): void {
    const totalRows = this.getTotalRowCount(sections);

    if (sections.length >= this.MAX_SECTIONS || totalRows >= this.MAX_TOTAL_ROWS) {
      return;
    }

    const remainingRows = this.MAX_TOTAL_ROWS - totalRows;

    if (remainingRows <= 0) return;

    const newSection = this.createSection();

    // Optional: trim rows in new section if needed
    const rowsArray = newSection.get('rows') as FormArray;
    if (rowsArray.length > remainingRows) {
      while (rowsArray.length > remainingRows) {
        rowsArray.removeAt(rowsArray.length - 1);
      }
    }

    sections.push(newSection);
  }


  addRow(sections: FormArray, sectionIndex: number): void {
    const section = sections.at(sectionIndex) as FormGroup;
    const rows = section.get('rows') as FormArray;

    const totalRows = this.getTotalRowCount(sections);
    const remainingRows = this.MAX_TOTAL_ROWS - totalRows;

    if (rows.length < this.MAX_ROWS_PER_SECTION && remainingRows > 0) {
      rows.push(this.createRow());
    }
  }

  removeSection(sections: FormArray, index: number): void {
    if (sections.length > 1) {
      sections.removeAt(index);
    }
  }

  removeRow(sections: FormArray, sectionIndex: number, rowIndex: number): void {
    const section = sections.at(sectionIndex) as FormGroup;
    const rows = section.get('rows') as FormArray;

    if (rows.length > 1) {
      rows.removeAt(rowIndex);
    }
  }

  getTotalRowCount(sections: FormArray): number {
    return sections.controls.reduce((total, section) => {
      const rows = (section as FormGroup).get('rows') as FormArray;
      return total + rows.length;
    }, 0);
  }



  // addSection(sections: FormArray): void {
  //   if (sections.length < this.MAX_SECTIONS) {
  //     sections.push(this.createSection());
  //   }
  // }

  // removeSection(sections: FormArray, index: number): void {
  //   if (sections.length > 1) {
  //     sections.removeAt(index);
  //   }
  // }

  // addRow(sections: FormArray, sectionIndex: number): void {
  //   const section = sections.at(sectionIndex) as FormGroup;
  //   const rows = section.get('rows') as FormArray;

  //   if (this.getTotalRowCount(sections) < (this.MAX_SECTIONS * this.MAX_ROWS_PER_SECTION)) {
  //     rows.push(this.createRow());
  //   }
  // }

  // removeRow(sections: FormArray, sectionIndex: number, rowIndex: number): void {
  //   const section = sections.at(sectionIndex) as FormGroup;
  //   const rows = section.get('rows') as FormArray;

  //   if (rows.length > 1) {
  //     rows.removeAt(rowIndex);
  //   }
  // }

  // getTotalRowCount(sections: FormArray): number {
  //   return sections.controls.reduce((total, section) => {
  //     const rows = (section as FormGroup).get('rows') as FormArray;
  //     return total + rows.length;
  //   }, 0);
  // }

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
    }
  }

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
    const optionsArray = this.fb.array([]);

    if (Array.isArray(updateForm?.options)) {
      updateForm.options.forEach((opt: any) => {
        optionsArray.push(this.fb.control(opt));
      });
    }

    this.questionOption.patchValue({
      questionText: updateForm?.questionText,
      saveAnswerVariable: updateForm?.saveAnswerVariable,
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

    this.buttonOptions.patchValue({
      headerType: updateForm?.headerType,
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

    const buttonsArray = this.fb.array([]);
    (updateForm?.buttons || []).forEach((btn: string) => {
      buttonsArray.push(this.fb.control(btn, [Validators.required, Validators.maxLength(20)]));
    });

    this.buttonOptions.setControl('buttons', buttonsArray);
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

    const sectionsArray = this.fb.array([]);
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
    });

    this.listOptions.setControl('sections', sectionsArray);
  }


  fillNotificationData(nodeData: any) {
    const updateForm = nodeData?.data?.formData;
    console.log("updateForm======", updateForm)

    this.notificationForm.patchValue({
      selectedAgentIds: updateForm.data.selectedAgentIds,
      selectedAgentName: updateForm.data.selectedAgentName,
      textMessage: updateForm.data.textMessage
    })

  }
  // ==================== COPY NODE HANDLING ====================

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
        file: nodeCopy?.data?.formData.file,
        fileName: nodeCopy?.data?.formData.file?.name || null,
        fileType: nodeCopy?.data?.formData.file?.type || null,
      },
      html: '<div class="temp-placeholder">Loading...</div>',
      pos_x: Math.floor(Math.random() * 900) + 100,
      pos_y: Math.floor(Math.random() * 400) + 100,
    };

    const newNodeId = this.addNode(postData);
    const newHTML = this.createNodeHtml(newNodeId, nodeCopy.data);
    this.updateNodeHTML(newNodeId, newHTML);

    if (nodeCopy?.data?.text === 'listOptions') {
      this.setOutputPositionsForList(newNodeId, nodeCopy?.data?.formData);
    } else {
      this.setOutputPositions(Number(newNodeId), nodeCopy?.data?.formData?.invalidAction);
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
      comparatorType: [condition?.comparatorType || ''],
      operator: [condition?.operator || '', Validators.required],
      value: [condition?.value || '', Validators.required],
      valueType: [condition?.valueType || ''],
      nextJoinType: [condition?.nextJoinType || '']
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
      this.filteredAgents = [...this.agents];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredAgents = this.agents.filter(agent =>
      agent.name.toLowerCase().includes(query)
    );
  }

  selectAgent(agent: Agent): void {
    this.selectedAgentDetails = agent;
  }

  getInitials(name: string): string {
    return name.split(' ').map(part => part[0]).join('');
  }

  filterTags(): void {
    if (!this.searchTerm) {
      this.filteredTags = [...this.allTags];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredTags = this.allTags.filter(tag =>
      tag.label.toLowerCase().includes(term)
    );
  }

  isTagSelected(tagValue: string): boolean {
    return this.selectedTags.includes(tagValue);
  }

  toggleTagSelection(tagValue: string): void {
    this.selectedTags = this.isTagSelected(tagValue)
      ? this.selectedTags.filter(t => t !== tagValue)
      : [...this.selectedTags, tagValue];
  }

  // ==================== TIME DELAY HANDLING ====================

  validateTime(): void {
    const max = this.delayUnit === 'hour' ? 24 : 60;
    this.invalidTime = this.delayTime < 1 || this.delayTime > max;
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
    this.selectedBot = this.availableBots.find(bot => bot.id === botId) || null;
  }

  // ==================== ATTRIBUTE HANDLING ====================

  getAdditionalAttributes(): void {
    if (!this.userDetails?.SP_ID) return;

    this.apiService.getAttributeList(this.userDetails.SP_ID).subscribe((allAttributes: any) => {
      const attributes = allAttributes.map((attr: any) => `{{${attr.attribute_name}}}`);
      this.showAttribute = attributes;
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

  selectVariable(index: number, field: 'comparator' | 'value', variable: any): void {
    const group = this.getConditionGroup(index);
    group.get(field)?.setValue(`{{${variable.name}}}`);
    group.get(`${field}Type`)?.setValue(variable.type);
    this.showVarMenuFor = null;
    this.showAttribute = null

    if (field === 'comparator') {
      group.get('operator')?.setValue('');
    }
  }

  // ==================== SAVE & EXPORT HANDLING ====================

  async saveChatbot(): Promise<void> {
    this.orignalData = {};
    const exportData: any = this.editor.export();
    const exportNodesData: any = Object.values(exportData?.drawflow?.Home?.data);
    const nodes = document.querySelectorAll('.drawflow-node');

    nodes.forEach((node) => {
      const nodeId = node.getAttribute('id');
      const nodeContent = node.querySelector('.drawflow_content_node');
      const nodeData = { id: Number(nodeId?.split('-')[1]) };
      const findNode = exportNodesData.find((x: any) => x.id == nodeData.id);

      this.checkNodeHaveConnection(findNode);
    });

    const flowData = this.getFullFlowJson();
    console.log("Flow Data:", flowData);
  }


  inputArray: any = [];
  outputArray: any = [];

  checkNodeHaveConnection(node: any) {


    Object.keys(node.inputs).forEach((inputKey) => {
      if (node.inputs[inputKey].connections.length == 0) { this.inputArray.push(true) } else { this.inputArray.push(false) }
    });

    Object.keys(node.outputs).forEach((inputKey) => {
      if (node.outputs[inputKey].connections.length == 0) { this.outputArray.push(true) } else { this.outputArray.push(false) }
    });

    let isInputConnected = this.inputArray.some((item: any) => item == true)
    let isOutputConnected = this.outputArray.some((item: any) => item == true)
    if (isInputConnected && isOutputConnected) {
      return false;
    }
    return true;
  }

  private getFullFlowJson(): any {
    const exportData = this.editor.export();
    const flowData: any = {
      nodes: [],
      connections: []
    };

    Object.entries(exportData.drawflow.Home.data).forEach(([id, node]: [string, any]) => {
      flowData.nodes.push({
        id: node.id,
        name: node.name,
        type: node.data.text,
        category: node.data.category,
        data: node.data.formData,
        position: { x: node.pos_x, y: node.pos_y }
      });

      Object.entries(node.outputs).forEach(([outputKey, output]: [string, any]) => {
        output.connections.forEach((connection: any) => {
          flowData.connections.push({
            sourceNode: node.id,
            sourceOutput: outputKey,
            targetNode: connection.node,
            targetInput: connection.output
          });
        });
      });
    });

    return flowData;
  }

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

  openCreateModal(modalId: string, nodeType: string): void {
    this.isEditMode = false;
    this.cardType = nodeType;
    this.ParentNodeType = modalId;

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
  }

  // ==================== EVENT HANDLERS ====================

  private handleEditClick: (event: Event) => void = () => { };
  private handleCopyClick: (event: Event) => void = () => { };
  private handleDeleteClick: (event: Event) => void = () => { };

  // onTextChange(): void {
  //   this.sendTextForm.get('textMessage')?.updateValueAndValidity({ emitEvent: true });
  // }



  onTextChange(): void {
    console.log('daata')
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
      form.get('reattemptsCount')?.setValue(1);
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
    if (!form.get('enableValidation')?.value) {
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

  onSubmits(form: FormGroup): boolean {
    if (form.valid) {
      console.log('Form submitted:', form.value);
      this.closeModal();
      return true;
    } else {
      this.markFormGroupTouched(form);
      return false;
    }
  }

  onAgentChange(event: any): void {
    const agentId = event.target.value;
    const selectedAgent = this.availableAgents.find(agent => agent.id == agentId);
    this.notificationForm.patchValue({
      selectedAgentName: selectedAgent?.name || ''
    });
  }

  onAttributeChange(value: string): void {
    const selectedAttr = this.contactAttributeForm.get('selectedAttribute')?.value;
    this.attributeDetails = this.availableAttributes.find(attr => attr.name === selectedAttr);
  }

  selectedValues(variable: any): void {
    this.contactAttributeForm.patchValue({
      selectedValue: `{{${variable?.name}}} ` || '',
      inputValue: '',
      selectedVariable: '',
      operation: 'replace'
    });
    this.openDropdown.status = '';
    this.contactAttributeForm.get('selectedValue')?.updateValueAndValidity();
  }

  selectAttribute(status: string): void {
    this.openDropdown.status = status;
  }

  updateCharacterCount(): void {
    const message = this.notificationForm.get('textMessage')?.value || '';
    this.characterCount = message.replace(/<[^>]*>/g, '').length;
  }

  // ==================== GETTERS ====================

  get options(): FormArray {
    return this.questionOption.get('options') as FormArray;
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
    if (type === 'string') return this.stringOperators;
    if (type === 'number') return this.numberOperators;
    if (type === 'boolean') return this.booleanOperators;
    return [];
  }

  onCancel() {
    // this.cancel.emit();
    this.closeModal()
  }

  onFileSelectedData(event: any) {

    const file = event.target.files[0];
    const input = event.target as HTMLInputElement;
    if (file) {
      const mimeType = file.type;

      let headerType: 'image' | 'video' | 'document' | 'unknown' = 'unknown';

      if (mimeType.startsWith('image/')) {
        headerType = 'image';
      } else if (mimeType.startsWith('video/')) {
        headerType = 'video';
      } else if (
        mimeType === 'application/pdf' ||
        mimeType === 'application/msword' ||
        mimeType.includes('spreadsheet') || // for Excel
        mimeType.includes('document')
      ) {
        headerType = 'document';
      }
      const maxSize = headerType === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

      if (file.size > maxSize) {
        alert(`File size exceeds maximum allowed (${headerType === 'image' ? '5MB' : '10MB'})`);
        return;
      }

      this.sendTextForm.patchValue({ file: file });
      console.log('Selected file:', file);
      this.uploadedFile = file;
      this.selectedFileType = headerType;
      this.selectedFileUrl = URL.createObjectURL(file);

      console.log('Selected file URL:', this.selectedFileType);
      if (headerType === 'image') {
        this.selectedImageUrl = this.selectedFileUrl;
      } else if (headerType === 'document') {
        this.selectedImageUrl = 'assets/img/document.png'; // Placeholder for document preview
      } else if (headerType === 'video') {
        this.selectedImageUrl = this.selectedFileUrl; // Placeholder for video preview
      }
    }
    input.value = '';

    console.log('File selected:', this.selectedImageUrl);
  }

}