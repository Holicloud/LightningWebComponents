import { LightningElement } from "lwc";
const RECORDS = [
  {
    id: "0",
    title: "Home Dashboard",
    icon: { iconName: "utility:home", variant: "error" },
    subtitles: [
      {
        label: "Status",
        type: "lightning-icon",
        props: {
          title: "Not Connected",
          iconName: "utility:info",
          variant: "warning"
        }
      }
    ]
  },
  {
    id: "1",
    title: "System Alerts",
    icon: { iconName: "utility:warning", variant: "success" },
    subtitles: [
      {
        label: "High Priority",
        value: "5 Alerts",
        type: "custom-type",
        props: { key1: "value1" }
      },
      {
        label: "Low Priority",
        type: "lightning-icon",
        props: { title: "2 Alerts", variant: "warning" }
      }
    ]
  },
  {
    id: "2",
    title: "User Info",
    icon: { iconName: "utility:info", variant: "warning" }
  },
  {
    id: "3",
    title: "Settings Panel",
    icon: { iconName: "utility:home", variant: "success" }
  },
  { id: "4", title: "Support Center" },
  {
    id: "5",
    title: "Notifications",
    subtitles: [
      {
        label: "Unread Messages",
        value: "3 New Messages",
        type: "lightning-icon",
        props: { iconName: "utility:info", variant: "warning" }
      }
    ]
  },
  {
    id: "6",
    title: "Activity Logs",
    subtitles: [
      { label: "Last Login", value: "2 Hours Ago", type: "lightning-icon" }
    ]
  },
  { id: "7", title: "Billing Information" },
  { id: "8", title: "Reports Center" },
  {
    id: "9",
    title: "System Health",
    icon: { iconName: "utility:warning", variant: "success" }
  },
  {
    id: "10",
    title: "Admin Dashboard",
    icon: { iconName: "utility:info", variant: "success" },
    subtitles: [
      {
        label: "Admin Tools",
        value: "Enabled",
        type: "custom-type",
        props: { key2: "value1" },
        icon: { iconName: "utility:warning", variant: "warning" }
      }
    ]
  },
  {
    id: "11",
    title: "Network Status",
    icon: { iconName: "utility:info", variant: "inverse" }
  },
  {
    id: "12",
    title: "Email Settings",
    icon: { iconName: "utility:info", variant: "error" }
  },
  {
    id: "13",
    title: "Security Dashboard",
    icon: { iconName: "utility:info", variant: "warning" }
  },
  {
    id: "14",
    title: "Email Notifications",
    icon: { iconName: "utility:email", variant: "error" },
    subtitles: [{ label: "Unread Emails", value: "10", type: "lightning-icon" }]
  },
  {
    id: "15",
    title: "Risk Analysis",
    icon: { iconName: "utility:warning", variant: "inverse" }
  },
  { id: "16", title: "Backup Settings" },
  { id: "17", title: "Error Logs" },
  {
    id: "18",
    title: "Data Sync",
    icon: { iconName: "utility:info", variant: "success" }
  },
  {
    id: "19",
    title: "File Manager",
    subtitles: [
      { label: "Total Files", value: "120 Files", type: "lightning-icon" },
      { label: "Free Space", value: "10 GB", type: "custom-type" }
    ]
  },
  {
    id: "20",
    title: "Help Center",
    icon: { iconName: "utility:home", variant: "error" }
  },
  {
    id: "21",
    title: "Integration Tools",
    icon: { iconName: "utility:info", variant: "warning" }
  },
  {
    id: "22",
    title: "Performance Reports",
    icon: { iconName: "utility:info", variant: "error" }
  },
  { id: "23", title: "Usage Metrics" },
  {
    id: "24",
    title: "Audit Logs",
    icon: { iconName: "utility:info", variant: "success" }
  },
  {
    id: "25",
    title: "System Summary",
    subtitles: [
      {
        label: "Users Online",
        value: "25",
        type: "lightning-icon"
      }
    ]
  }
];

export default class LookupWithResults extends LightningElement {
  // initial multiselect selection
  value = ["6", "7"];

  // a small subset of your data typically first x elements or recently viewed records
  defaultRecords = RECORDS.slice(0, 5);

  getMatching({ rawSearchTerm, searchTerm }) {
    // fetch your records using rawSearchTerm or searchTerm
    return RECORDS.filter((record) => {
      if (
        record.title.includes(rawSearchTerm) ||
        record.title.includes(searchTerm)
      ) {
        return true;
      }

      const firstSubtitle = record.subtitles?.at(0)?.value;

      if (firstSubtitle) {
        return (
          firstSubtitle.includes(rawSearchTerm) ||
          firstSubtitle.includes(searchTerm)
        );
      }

      return false;
    });
  }

  getSelection({ selectedIds }) {
    // fetch your data using the selectedIds
    return RECORDS.filter((record) => selectedIds.includes(record.id));
  }
}
