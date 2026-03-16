export const ShowToastEventName = "lightning__showtoast";

export class ShowToastEvent extends CustomEvent {
  constructor(toast) {
    super(ShowToastEventName, {
      composed: true,
      bubbles: true,
      detail: toast
    });
  }
}
