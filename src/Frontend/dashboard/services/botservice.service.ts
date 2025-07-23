import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Observable } from 'rxjs';

environment
// 3012
const Bot_API_URL = environment.botsAPI;;

@Injectable({
  providedIn: 'root'
})
export class BotserviceService {

  constructor(private http: HttpClient) {

  }
  // constants.ts


  // data.ts


  FILTERED_AGENTS: any[] = [
    { id: 1, name: 'James Watson' },
    { id: 2, name: 'David Harrison' },
    { id: 3, name: 'Jane Cooper' },
    { id: 4, name: 'Charles John' }
  ];

  AVAILABLE_AGENTS: any[] = [
    { id: '1', name: 'John Doe', status: 'active', email: 'john@example.com', phone: '+1234567890' },
    { id: '2', name: 'Jane Smith', status: 'inactive', email: 'jane@example.com', phone: '+1987654321' }
  ];

  AVAILABLE_BOTS: any[] = [
    { id: 'bot1', name: 'Customer Support Bot', published: true },
    { id: 'bot2', name: 'Order Processing Bot', published: false }
  ];

  ALL_TAGS: any[] = [
    { value: 'Search', label: 'Search', style: 'default' },
    { value: 'Paid', label: 'Paid', style: 'primary' },
    { value: 'Unpaid', label: 'Unpaid', style: 'danger' },
    { value: 'Return', label: 'Return', style: 'warning' },
    { value: 'New Customer', label: 'New Customer', style: 'success' },
    { value: 'Order Complete', label: 'Order Complete', style: 'info' },
    { value: 'New Order', label: 'New Order', style: 'purple' },
    { value: 'Unavailable', label: 'Unavailable', style: 'secondary' },
    { value: 'Buyer', label: 'Buyer', style: 'teal' },
    { value: 'Seller', label: 'Seller', style: 'pink' },
    { value: 'Hot Lead', label: 'Hot Lead', style: 'orange' }
  ];

  SAMPLE_VARIABLES: any[] = [
    { name: 'user.name', type: 'string', label: 'User Name', value: 'John Doe' },
    { name: 'user.email', type: 'string', label: 'User Email', value: 'Johan@gmail.com' },
    { name: 'user.age', type: 'number', label: 'User Age', value: 25 },
    { name: 'user.isPremium', type: 'boolean', label: 'Is Premium User', value: true },
    { name: 'user.joinDate', type: 'date', label: 'Join Date', value: '25/02/2025' },
    { name: 'bot.responseCount', type: 'number', label: 'Response Count', value: 25 },
    { name: 'bot.lastInteraction', type: 'date', label: 'Last Interaction', value: '25/02/2025' },
  ];

  ATTRIBUTE_LIST: any[] = [
    { label: 'Age', name: 'user.age', value: 'user.age', type: 'number' },
    { label: 'Name', name: 'user.name', value: 'user.name', type: 'string' },
    { label: 'Subscribed', name: 'user.subscribed', value: 'user.subscribed', type: 'boolean' },
  ];




  statusColors = {
    draft: '#FFD0D0',
    approved: '#E2F4EC',
    pending: '#EBEDF1',
    rejected: '#E4DFF5',
    publish: '#E2F4EC',
  };

  getStatusColor(status: string): string {
    return this.statusColors[status as keyof typeof this.statusColors] || '';
  }

  validateDateRange(fromDate: string, toDate: string): string | null {
    const from = moment(fromDate);
    const to = moment(toDate);
    const today = moment().startOf('day');
    const threeMonthsAgo = moment().subtract(3, 'months').startOf('day');

    if (from.isAfter(to)) {
      return "From date cannot be greater than To date.";
    } else if (from.isSame(today, 'day') || to.isSame(today, 'day')) {
      return "Today's date is not allowed as From Date and today Date";
    } else if (to.isAfter(today)) {
      return "Future dates are not allowed.";
    } else if (from.isBefore(threeMonthsAgo)) {
      return "Only dates from the last 3 months are allowed.";
    }
    return null;
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '';
  }



  getBotAlldetails(SPID: any) {
    return this.http.get(Bot_API_URL + `/getAllBots/${SPID}`);
  }

  checkKeyword(data: any) {
    return this.http.post(Bot_API_URL + `/checkExistingKeyword`, data);
  }

  
  checkExistingBot(data: any) {
    return this.http.post(Bot_API_URL + `/checkExistingBot`, data);
  }




  saveBotDetails(data: any): Observable<any> {
    return this.http.post<any>(`${Bot_API_URL}/addBot`, data);
  }

  updateBotDetails(data: any): Observable<any> {
    return this.http.post<any>(`${Bot_API_URL}/updateBotDetails`, data);
  }

  deleteBotDetails(spid: any, botId: any,type:any): Observable<any> {
    return this.http.get<any>(`${Bot_API_URL}/deleteBotbyId/${spid}/${botId}/${type}`);
  }

  exportBotDetails(data: any): Observable<any> {
    return this.http.post<any>(`${Bot_API_URL}/exportFlowData`, data);
  }

  submitBot(data: any): Observable<any> {
    return this.http.post<any>(`${Bot_API_URL}/submitBots`, data);
  }






}
