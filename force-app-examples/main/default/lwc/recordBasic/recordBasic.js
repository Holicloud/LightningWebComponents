import { LightningElement, wire } from "lwc";
import getActiveUsers from "@salesforce/apex/GetUsers.getActiveUsers";
import userId from "@salesforce/user/Id";

export default class RecordBasic extends LightningElement {
  currentUserId = userId;
  @wire(getActiveUsers)
  users;

  get someUserIds() {
    let result = [];
    if (this.users?.data) {
      result = this.users.data.map((record) => record.Id).slice(0, 3);
    }

    return result;
  }
}
