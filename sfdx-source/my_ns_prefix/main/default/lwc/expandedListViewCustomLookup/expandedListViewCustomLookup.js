/* eslint-disable no-console */
import { LightningElement, api,track } from 'lwc';
const CSS_CLASS = 'modal-hidden';
export default class ExpandedListViewCustomLookup extends LightningElement {

    @api additionalSearchByFields;
    @api columns;
    @api iconName;
    @api limitOfRecords = '20';
    @api objectApiName;
    @api objectLabel;
    @api searchByApiName;
    @api searchKey = '';
    @api whereClause;

    /** * api method that hides the expanded lookup */
    @api display() {
        const outerDivEl = this.template.querySelector('div');
        outerDivEl.classList.remove(CSS_CLASS);
    }
    get everythingIsOk() {
        return Boolean(this.columns && this.limitOfRecords && this.objectApiName
            && this.searchByApiName && this.whereClause);
    }
    // }
    /** * api method that hides the expanded lookup */
    @api hide() {
        const outerDivEl = this.template.querySelector('div');
        outerDivEl.classList.add(CSS_CLASS);
    }
    cancel() {
        this.hide();
        const dataTable = this.template.querySelector('[data-id="theDataTable"]');
        const theEvent = new CustomEvent('cancel', {
            detail: dataTable.searchKey
        });
        this.dispatchEvent(theEvent);
    }
    /** * hides lookup when escape key is pressed */
    handleKeyPress({ code }) {
        if ('Escape' === code) {
            this.hide();
        }
    }
    /**
     * handles row action and since the only action there is is the button name therefore throw the select customEvent
     * @param  {any} event row action event
     */
    handleRowAction(event) {
        const theEvent = new CustomEvent('rowaction', {
            detail: event
        });
        this.dispatchEvent(theEvent);
    }
}