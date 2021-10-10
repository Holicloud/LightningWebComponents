import { LightningElement, api, track } from 'lwc';

export default class PercentFixedDataTableCustom extends LightningElement {
    @api recordId;
    @api editable;
    @api fieldName;
    @api value;

    appearIcon() {
        if (this.editable) {
            this.template.querySelector('.edit_icon').classList.remove('hideButton');
        }
    }
    dissapearIcon() {
        this.template.querySelector('.edit_icon').classList.add('hideButton');
    }
    handleClickEdit() {
        let directions = this.template.querySelector('div').getBoundingClientRect();
        this.dispatchEvent(new CustomEvent('customfieldedit', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                recordId: this.recordId,
                value: this.value,
                fieldName: this.fieldName,
                fieldPosition: directions
            }
        }));
    }
}