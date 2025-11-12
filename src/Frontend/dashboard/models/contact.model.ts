export interface ContactQueryPayload {
SP_ID: any;               // service provider ID
  action: 'search' | 'list';      // defines the operation
  search: string;                 // search text (can be empty)
  isSearched: boolean;          // indicates if a search term is provided
  page: number;                   // current page number
  pageSize: number;               // number of records per page
  filerationQuerry: any;          // always sent, even if empty
  isFilterApplied: boolean;       // indicates if filters are applied

  isAllSelected: boolean;     // true if all contacts are selected

  isDeletedContact: boolean; // true if searching in deleted contacts
  isExportContact: boolean; // true if exporting contacts
}


export interface ContactResponse {
  status: number;                 // 200 = success, 500 = error
  totalContacts: number;          // total count of contacts
  result?: any[];                 // optional: list of contacts if needed later
  IsFilteredList?: boolean;       // true if filters applied
  msg?: string;                   // optional error message
  actionFlag: boolean;            // indicates if action was successful
}