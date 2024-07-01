import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GridService {
    currPage: any = 10;
    totalPage: any;
    paging: any;
    lastElementOfPage: any;
    paginationPageSize: string = "10";
    rolesList: any;

    onBtFirst(gridApi: any,rolesList: any) {
        gridApi.paginationGoToFirstPage();
        this.currPage = gridApi.paginationGetCurrentPage() + 1;
        this.getPaging(rolesList)
    }

    onBtLast(gridApi: any, rolesList: any) {
        gridApi.paginationGoToLastPage();
        this.currPage = gridApi.paginationGetCurrentPage() + 1;
        this.getPaging(rolesList)
    }

    onBtNext(gridApi: any, rolesList: any) {
        gridApi.paginationGoToNextPage();
        this.currPage = gridApi.paginationGetCurrentPage() + 1;
        this.getPaging(rolesList)
    }

    onBtPrevious(gridApi: any, rolesList: any) {
        gridApi.paginationGoToPreviousPage();
        this.currPage = gridApi.paginationGetCurrentPage() + 1;
        this.getPaging(rolesList)
    }

    onChangePageSize(paginationPageSize: any, gridApi: any, rolesList: any) {
        this.rolesList = rolesList;
            this.paginationPageSize = paginationPageSize;
            this.totalPage = gridApi.paginationGetTotalPages();
            this.getPaging(rolesList);

    }
    getPaging(rolesList: any) {
        this.paging = [];
        let currValue = 1;
        if (this.totalPage <= 5) {
            for (let i = 1; i <= this.totalPage; i++) {
                this.paging.push(i);
            }
        } else {
            if (this.currPage > this.totalPage - 4) {
                currValue = this.totalPage - 4;
            } else {
                currValue = this.currPage;
            }
            for (let i = currValue; i < currValue + 5; i++) {
                this.paging.push(i);
            }
        }
        this.getLastPage(rolesList);
    }

    getLastPage(rolesList: any) {
        setTimeout(() => {
            if (this.currPage * parseInt(this.paginationPageSize) > this.rolesList?.length) {
                this.lastElementOfPage = this.rolesList?.length;
            }
            else {
                this.lastElementOfPage = this.currPage * parseInt(this.paginationPageSize);
            }
        }, 50);

    }
    gotoPage(page: any, gridApi: any, rolesList: any) {
        gridApi.paginationGoToPage(page - 1);
        this.getLastPage(rolesList);
    }
}
