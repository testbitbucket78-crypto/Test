const db = require("../../dbhelper");

class ContactFilteration {
  constructor({SP_ID, action, search, page, pageSize, filerationQuerry, isSearched, isFilterApplied, isAllSelected, isDeletedContact, isExportContact }) {
    this.SP_ID = SP_ID;      

    this.action = action || 'search';      
    this.search = search || '';  
    this.isSearched = isSearched || false;    

    this.page = page || 0;                 
    this.pageSize = pageSize || 10;  

    this.filerationQuerry = filerationQuerry || ''; 
    this.isFilterApplied = isFilterApplied || false;

    this.isAllSelected = isAllSelected || false;

    this.isDeletedContact = isDeletedContact || false;
    this.isExportContact = isExportContact || false;

    this.contactFrom = 0;
    this.contactTo = 9999999;
  }
}

class ContactResponse {
  constructor({ totalCount = 0, actionFlag = false }) {
    this.status = 200;

    this.totalContacts = totalCount;
    this.actionFlag = actionFlag || false;
  }

}


module.exports = {
  ContactFilteration,
  ContactResponse
};