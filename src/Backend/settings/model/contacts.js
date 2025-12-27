const db = require("../../dbhelper");

class ContactFilteration {
  constructor({SP_ID, action, search, page, pageSize, filerationQuerry, isSearched, isFilterApplied, isAllSelected, isDeletedContact, isExportContact, selectedIds }) {
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

    this.selectedIds = selectedIds || [];
  }
}

class ContactResponse {
  constructor({ totalCount = 0, actionFlag = false, isDeleted, contactList = [] }) {
    this.status = 200;

    this.totalContacts = totalCount;
    this.actionFlag = actionFlag || false;
     this.isDeleted = Boolean(isDeleted);
    this.contactList = contactList || [];
  }

}


module.exports = {
  ContactFilteration,
  ContactResponse
};