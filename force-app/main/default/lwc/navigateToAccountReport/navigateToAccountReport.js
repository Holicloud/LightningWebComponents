import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class NavigateToAccountReport extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectName = 'Account';
    navigateNext() {
        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__YearlyPlanWithBricksAuraContainer"
            },
            state: {
                c__yearlyPlanId: this.recordId,
                c__objectName: this.objectName
            }
        });
    }
}