import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'sb-billinghistory',
    templateUrl: './billinghistory.component.html',
    styleUrls: ['./billinghistory.component.scss'],
})
export class BillinghistoryComponent implements OnInit {
    spId!:number;
    pageSize: number = 10;
    currentPage: number = 1;
    paging: number[] = [];
    searchText = '';
    billingHistoryData:[] = [];
    pdfDetails:any = [];
    invoiceDetails:any = [];
    email!:string;
    state!:string;
    gstin!:string;
    plantype!:string;
    subTotal!:string;
    totalAmount!:number;
    tax!:number;
    statecode!:number;


    @Output() selectab = new EventEmitter<string> () ;


    constructor(private apiService: ProfileService) {}

    ngOnInit(): void {
        this.spId = Number(sessionStorage.getItem('SP_ID'));
        this.getBillingHistoryData();
        this.getInvoiceDetails();
        
        
    }

    getBillingHistoryData() { 
       this.apiService.billingDetails(this.spId).subscribe(
        response => {
            this.billingHistoryData = response.getbillingDetails;
            this.getPaging();
        });
    }


    getPaging() {
        this.paging = [];
        this.currentPage = 1;
        let totalPages = Math.ceil(this.billingHistoryData.length / this.pageSize);
        for (let i = 1; i <= totalPages; i++) {
            this.paging.push(i);
        }
    }

    getInvoiceDetails() {
      this.apiService.getPDFInvoiceDetails(this.spId).subscribe(response => {
            this.pdfDetails = response.invoiceData[0];
            this.invoiceDetails = response.planqueryData[0];

            this.email = this.pdfDetails.billing_email;
            this.state = this.pdfDetails.State;
            this.gstin = this.pdfDetails.GSTId;
            this.statecode = this.pdfDetails.zip_code;
            this.plantype = this.invoiceDetails.planType;
            this.subTotal = this.invoiceDetails.subtotalAmount;
            this.tax = this.invoiceDetails.tax
            this.totalAmount = this.invoiceDetails.totalAmount;
      
      });
    }

    previousPage() {
        this.selectab.emit('0');
    }


  

    generatePDF() {

      // this.

        const docDefinition: TDocumentDefinitions = {
            content: [
                {
                  text: 'Invoice',
                  style: 'header',
                },
              
                {
                  columns: [
                    {
                      width: '50%',
                      // image: '../../../../assets/img/profile/Richie_3.png',
                      text:'',
                      // fit: [100, 100],
                      style: 'sectionHeader',
                    },
                    
                    { 
                      width: '50%',
                      text: 'Engagekart Private Limited',
                      style: 'sectionHeader',
                    },
                  ],
                  margin: [12, 0, 0, 10],
                },

                
                {
                  margin: [8, 0, 10, 0],
                  columns: [
                    
                    {
                    width: '50%',
                    text: [
                      { text: '' },
            
                    ],
                    style: 'billedTo'
                  },
                  { 
                    width: '50%',
                  text: [
                    { text: 'SCO No. 53-54, Sector 8,' },
               
                  ],
                  style:'addressInfo'
                }
    
                  ],
                 
                },
                {
                  margin: [8, 0, 10, 0],
                  columns: [
                    {
                    width: '50%',
                    text: [
                      { text: '' },
            
                    ],
                    style: 'billedTo'
                  },
                  { 
                    width: '50%',
                  text: [
                    { text: 'Chandigarh 160009' },
               
                  ],
                  style:'addressInfo'
                }
    
                  ],
                 
                },
                {
                  margin: [8, 0, 10, 0],
                  columns: [
                    {
                    width: '50%',
                    text: [
                      { text: '' },
            
                    ],
                    style: 'billedTo'
                  },
                  { 
                    width: '50%',
                    text: [
                      { text: 'Email: ', style: 'invoiceInfo' },
                      { text: this.email, style: 'values' },
                    ],
                    style:'addressInfo'
                }
    
                  ],
                 
                },
                {
                  margin: [8, 0, 10, 0],
                  columns: [
                    {
                    width: '50%',
                    text: [
                      { text: '' },
            
                    ],
                    style: 'billedTo'
                  },
                  { 
                    width: '50%',
                    text: [
                      { text: 'Contact NO.: ', style: 'invoiceInfo' },
                      { text: '', style: 'values' },
                    ],
                    style:'addressInfo'
                }
    
                  ],
                 
                },
                {
                  margin: [8, 0, 10, 0],
                  columns: [
                    {
                    width: '50%',
                    text: [
                      { text: '' },
            
                    ],
                    style: 'billedTo'
                  },
                  { 
                    width: '50%',
                    text: [
                      { text: 'State: ', style:'invoiceInfo' },
                      { text: this.state, style: 'values' },
                    ],
                    style:'addressInfo'
                }
    
                  ],
                 
                },
                {
                  margin: [8, 0, 10, 0],
                  columns: [
                    {
                    width: '50%',
                    text: [
                      { text: '' },
            
                    ],
                    style: 'billedTo'
                  },
                  { 
                    width: '50%',
                    text: [
                      { text: 'GSTIN: ', style:'invoiceInfo' },
                      { text: this.gstin, style: 'values' },
                    ],
                    style:'addressInfo'
                }
    
                  ],
                 
                },
                
                {
                margin: [0, 15, 0, 0],
                columns: [
                  {
                    width: '50%',
                    text:[
                   {  text: 'Billed To', fontSize: 14, },
                  ],
                  margin:[30, 0, 0, 0],
                  bold:true,
                    
                  },
                  {
                    width: '50%',
                    text: [
                      { text: 'Invoice Number: ', style: 'invoiceInfo' },
                      { text: '', style: 'values' },
                    ],
                    style: 'invoiceInfo'
                  }
                ],
               
              },
              {
                columns: [
                  {
                  width: '50%',
                  text: [
                    { text: 'Contact Name: ', style: 'invoiceInfo' },
                    { text: '', style: 'values' },
                  ],
                  style: 'billedTo'
                },
                { 
                  width: '50%',
                text: [
                  { text: 'Invoice Date: ', style: 'invoiceInfo' },
                  { text: '', style: 'values' },
                ],
                style:'invoiceInfo'
              }
  
                ],
               
              },
              {
                columns: [
                  {
                width: '50%',
                text: [
                  { text: 'Bussiness Name: ', style: 'invoiceInfo' },
                  { text: '', style: 'values' },
                ],
                style: 'billedTo'
              },
                { 
                  width: '50%',
                text: [
                  { text: 'Invoice Amount: ', style: 'invoiceInfo' },
                  { text: '', style: 'values' },
                ],
                style:'invoiceInfo'
              }
  
                ],
               
              },
              {
                columns: [
                  {width: '50%',
                  text:'(Company Address)',
                  style: 'billedTo'
                },
                { 
                 width: '50%',
                text:'',
                style:'invoiceInfo'
              }
  
                ],
               
              },
              {
                columns: [
                  {width: '50%',
                  text:'(Company Address)',
                  style: 'billedTo'
                },
                { 
                 width: '50%',
               
                text: [
                  { text: 'Payment Type: ', style: 'invoiceInfo' },
                  { text: '', style: 'values' },
                ],
                style:'invoiceInfo'
              }
  
                ],
               
              },
              {
                columns: [
            {
              width: '50%',
              text: [
                { text: 'State: ', style: 'invoiceInfo' },
                { text: '', style: 'values' },
              ],
              
              style: 'billedTo'
            },
                { 
                 width: '50%',
                 text: [
                  { text: 'Billing Period: ', style: 'invoiceInfo' },
                  { text: '', style: 'values' },
                ],
                style:'invoiceInfo'
              }
  
                ],
               
              },

              {
                columns: [
          
                {  width: '50%',
                 
                  text: [
                    { text: 'GSTIN: ', style: 'invoiceInfo' },
                    { text: '', style: 'values' },
                  ],
                  style: 'billedTo'
                },

                { 
                 width: '50%',

                text: [
                  { text: 'Next Due Date: ', style: 'invoiceInfo' },
                  { text: '', style: 'values' },
                ],
                style:'invoiceInfo'
              }
  
                ],
               
              },
              // table for main content
              {
                margin: [0, 25, 0, 0],
                table: {
                  widths: ['auto', '*', 'auto'], // Adjust the widths
                  body: [
                    [  
                      { text: 'S No.', style: 'tableHeader', margin:[10, 3, 0, 3] },
                      { text: 'Description', style: 'tableHeader', margin:[60, 3, 0, 3] },
                      { text: 'Amount', style: 'tableHeader', margin:[15, 3, 0, 3] },
                    ],
                    [
                      { text: '1', bold: true ,margin:[20, 5, 0, 0] },
                      { text: this.plantype, bold: true, margin:[60, 5, 0, 0] },
                      { text: this.subTotal, alignment: 'right', bold: true,margin:[0, 6, 0, 0] },
                    ],
                    [
                      { text: '' },
                      { text: 'VAT@18%', bold: true, margin:[60, 40, 0, 0] },
                      { text: this.tax, alignment: 'right', bold: true,margin:[0, 40, 5, 20] },
                    ],
                    [
                      { text: '' },
                      { text: 'Total', bold: true, alignment: 'right', fontSize: 16 },
                      { text: this.totalAmount, alignment: 'right', bold: true, margin:[0, 2, 0, 0] },
                    ],
                    
                  ],
             
                },
                layout: {
                  hLineWidth: function () {
                    return 0;
                  },
                  vLineWidth: function () {
                    return 0;
                  },
              },

            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 10,
                  x2: 510,
                  y2: 10,
                  lineWidth: 0.1,
                  lineColor: 'black',
                },
              ],
            },

              {
                columns: [ {  text:'Amount In Words', margin:[12 ,8 ,0, 8] } ],
               
              },
              {
                columns: [ {  text:'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', bold:true, fontSize: 12, margin:[12 ,0 ,0, 0]  }, ],
               
              },
              {
                columns: [ {  text:'This is computer generated invoice hence no signature required', bold:true, fontSize:11, margin:[0 ,140 ,0, 0], alignment:'center' } ],
               
              },

              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 10,
                    x2: 510,
                    y2: 10,
                    lineWidth: 1.5,
                    lineColor: 'black',
                  },
                ],
              },

              {
                columns: [ {  text:'Registered Address', fontSize:11, margin:[0 ,8 ,0, 0], alignment:'center' } ],
               
              },

              
              {
                columns: [ {  text:'SCO No. 53-54, Sector 8, Chandigarh 160009', fontSize:12, margin:[0 ,6 ,0, 0], alignment:'center' } ],
               
              },
            ],
      
              styles: {
                header: {
                  fontSize: 25,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 0, 0, 30]
                },
                sectionHeader: {
                  fontSize: 16,
                  bold: true,
                  margin: [30, 0, 0, 0]
                },
                tableHeader: {
                  bold: true,
                  fillColor: '#4845D9',
                  color:'#ffffff',
                },
                billedTo: {
                  fontSize: 11,
                  alignment:'left',
                  margin: [30, 5, 0, 0]
                },
                invoiceInfo: {
                  fontSize: 11,
                  alignment:'left',
                  margin: [38, 0, 0, 0]
                },
                addressInfo: {
                  fontSize: 12,
                  alignment:'left',
                  margin: [38, 2, 0, 0]
                },
                values: {
                  fontSize: 12,
                  bold:true
                }
                
              }
             
            };
      
        pdfMake.createPdf(docDefinition).open();
        
      }
      
}
