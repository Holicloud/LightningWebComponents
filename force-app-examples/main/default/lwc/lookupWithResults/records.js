export default function getRecords() {
  return [
    {
      id: "0",
      title: "Sales Dashboard Overview",
      icon: {
        iconName: "custom:custom1",
        variant: "warning"
      },
      subtitles: [
        {
          subtitleLabel: "Description",
          subtitleType: "lightning/formattedRichText",
          value:
            "This <em>is</em> some simple rich text. <strong>Hello!</strong>"
        },
        {
          subtitleLabel: "Name",
          subtitleType: "lightning/formattedName",
          firstName: "John",
          lastName: "Doe",
          salutation: "Mr."
        }
      ]
    },
    {
      id: "1",
      title: "Marketing Campaign Analysis",
      icon: {
        iconName: "standard:account",
        variant: "error"
      },
      subtitles: [
        {
          subtitleLabel: "Text Example",
          subtitleType: "lightning/formattedText",
          value: "Email info@salesforce.com",
          linkify: true
        },
        {
          subtitleLabel: "Contact Phone",
          subtitleType: "lightning/formattedPhone",
          value: "18005551212"
        }
      ]
    },
    {
      id: "2",
      title: "Customer Support Metrics",
      icon: {
        iconName: "doctype:pdf",
        variant: "success"
      },
      subtitles: [
        {
          subtitleLabel: "Description",
          subtitleType: "lightning/formattedRichText",
          value:
            "This <em>is</em> some simple rich text. <strong>Hello!</strong>"
        },
        {
          subtitleLabel: "Approval Status",
          subtitleType: "lightning/icon",
          iconName: "action:approval",
          title: "Approved"
        }
      ]
    },
    {
      id: "3",
      title: "Product Performance Report",
      icon: {
        iconName: "action:approval",
        variant: "info"
      },
      subtitles: [
        {
          subtitleLabel: "Address",
          subtitleType: "lightning/formattedAddress",
          street: "121 Spear St.",
          city: "San Francisco"
        },
        {
          subtitleLabel: "Contact Email",
          subtitleType: "lightning/formattedEmail",
          value: "email@example.com"
        }
      ]
    },
    {
      id: "4",
      title: "Sales Team Goals",
      icon: {
        iconName: "utility:search",
        variant: "inverse"
      },
      subtitles: [
        {
          subtitleLabel: "URL",
          subtitleType: "lightning/formattedUrl",
          value: "www.salesforce.com",
          tooltip: "Use full domain name",
          target: "_blank"
        },
        {
          subtitleLabel: "Name",
          subtitleType: "lightning/formattedName",
          firstName: "John",
          lastName: "Doe",
          salutation: "Mr."
        }
      ]
    },
    {
      id: "5",
      title: "Marketing Strategy Plan",
      icon: {
        iconName: "custom:custom2",
        variant: "success"
      },
      subtitles: [
        {
          subtitleLabel: "URL",
          subtitleType: "lightning/formattedUrl",
          value: "www.salesforce.com",
          tooltip: "Use full domain name",
          target: "_blank"
        },
        {
          subtitleLabel: "Contact Phone",
          subtitleType: "lightning/formattedPhone",
          value: "18005551212"
        }
      ]
    },
    {
      id: "6",
      title: "Customer Feedback Summary",
      icon: {
        iconName: "standard:contact",
        variant: "warning"
      },
      subtitles: [
        {
          subtitleLabel: "Contact Phone",
          subtitleType: "lightning/formattedPhone",
          value: "18005551212"
        },
        {
          subtitleLabel: "Approval Status",
          subtitleType: "lightning/icon",
          iconName: "action:approval",
          title: "Approved"
        }
      ]
    },
    {
      id: "7",
      title: "Product Launch Details",
      icon: {
        iconName: "doctype:image",
        variant: "error"
      },
      subtitles: [
        {
          subtitleLabel: "Description",
          subtitleType: "lightning/formattedRichText",
          value:
            "This <em>is</em> some simple rich text. <strong>Hello!</strong>"
        },
        {
          subtitleLabel: "Location",
          subtitleType: "lightning/formattedLocation",
          latitude: "22",
          longitude: "122.2222"
        }
      ]
    },
    {
      id: "8",
      title: "Sales Performance Metrics",
      icon: {
        iconName: "action:call",
        variant: "info"
      },
      subtitles: [
        {
          subtitleLabel: "Name",
          subtitleType: "lightning/formattedName",
          firstName: "John",
          lastName: "Doe",
          salutation: "Mr."
        },
        {
          subtitleLabel: "Subscription Days",
          subtitleType: "lightning/formattedNumber",
          value: "1234.56",
          maximumFractionDigits: "2"
        }
      ]
    },
    {
      id: "9",
      title: "Marketing Campaign Results",
      icon: {
        iconName: "utility:clock",
        variant: "inverse"
      },
      subtitles: [
        {
          subtitleLabel: "Hour",
          subtitleType: "lightning/formattedTime",
          value: "22:12:30.999"
        },
        {
          subtitleLabel: "Name",
          subtitleType: "lightning/formattedName",
          firstName: "John",
          lastName: "Doe",
          salutation: "Mr."
        }
      ]
    },
    {
      id: "10",
      title: "Customer Support Overview",
      icon: {
        iconName: "custom:custom3",
        variant: "success"
      },
      subtitles: [
        {
          subtitleLabel: "Contact Phone",
          subtitleType: "lightning/formattedPhone",
          value: "18005551212"
        },
        {
          subtitleLabel: "Text Example",
          subtitleType: "lightning/formattedText",
          value: "Email info@salesforce.com",
          linkify: true
        }
      ]
    },
    {
      id: "11",
      title: "Product Sales Analysis",
      icon: {
        iconName: "standard:case",
        variant: "warning"
      },
      subtitles: [
        {
          subtitleLabel: "Contact Email",
          subtitleType: "lightning/formattedEmail",
          value: "email@example.com"
        },
        {
          subtitleLabel: "Description",
          subtitleType: "lightning/formattedRichText",
          value:
            "This <em>is</em> some simple rich text. <strong>Hello!</strong>"
        }
      ]
    },
    {
      id: "12",
      title: "Marketing Strategy Overview",
      icon: {
        iconName: "doctype:excel",
        variant: "error"
      },
      subtitles: [
        {
          subtitleLabel: "Description",
          subtitleType: "lightning/formattedRichText",
          value:
            "This <em>is</em> some simple rich text. <strong>Hello!</strong>"
        },
        {
          subtitleLabel: "Location",
          subtitleType: "lightning/formattedLocation",
          latitude: "22",
          longitude: "122.2222"
        }
      ]
    },
    {
      id: "13",
      title: "Customer Feedback Report",
      icon: {
        iconName: "action:email",
        variant: "info"
      },
      subtitles: [
        {
          subtitleLabel: "Location",
          subtitleType: "lightning/formattedLocation",
          latitude: "22",
          longitude: "122.2222"
        },
        {
          subtitleLabel: "Description",
          subtitleType: "lightning/formattedRichText",
          value:
            "This <em>is</em> some simple rich text. <strong>Hello!</strong>"
        }
      ]
    },
    {
      id: "14",
      title: "Sales Team Performance",
      icon: {
        iconName: "utility:notification",
        variant: "inverse"
      },
      subtitles: [
        {
          subtitleLabel: "Date of Birth",
          subtitleType: "lightning/formattedDateTime",
          value: "1547250828000",
          year: "2-digit"
        },
        {
          subtitleLabel: "Address",
          subtitleType: "lightning/formattedAddress",
          street: "121 Spear St.",
          city: "San Francisco"
        }
      ]
    },
    {
      id: "15",
      title: "Product Launch Metrics",
      icon: {
        iconName: "custom:custom4",
        variant: "success"
      },
      subtitles: [
        {
          subtitleLabel: "Date of Birth",
          subtitleType: "lightning/formattedDateTime",
          value: "1547250828000",
          year: "2-digit"
        },
        {
          subtitleLabel: "URL",
          subtitleType: "lightning/formattedUrl",
          value: "www.salesforce.com",
          tooltip: "Use full domain name",
          target: "_blank"
        }
      ]
    },
    {
      id: "16",
      title: "Marketing Campaign Goals",
      icon: {
        iconName: "standard:opportunity",
        variant: "warning"
      },
      subtitles: [
        {
          subtitleLabel: "Approval Status",
          subtitleType: "lightning/icon",
          iconName: "action:approval",
          title: "Approved"
        },
        {
          subtitleLabel: "Description",
          subtitleType: "lightning/formattedRichText",
          value:
            "This <em>is</em> some simple rich text. <strong>Hello!</strong>"
        }
      ]
    },
    {
      id: "17",
      title: "Customer Support Plan",
      icon: {
        iconName: "doctype:word",
        variant: "error"
      },
      subtitles: [
        {
          subtitleLabel: "Date of Birth",
          subtitleType: "lightning/formattedDateTime",
          value: "1547250828000",
          year: "2-digit"
        },
        {
          subtitleLabel: "Contact Phone",
          subtitleType: "lightning/formattedPhone",
          value: "18005551212"
        }
      ]
    },
    {
      id: "18",
      title: "Sales Strategy Report",
      icon: {
        iconName: "action:refresh",
        variant: "info"
      },
      subtitles: [
        {
          subtitleLabel: "URL",
          subtitleType: "lightning/formattedUrl",
          value: "www.salesforce.com",
          tooltip: "Use full domain name",
          target: "_blank"
        },
        {
          subtitleLabel: "Text Example",
          subtitleType: "lightning/formattedText",
          value: "Email info@salesforce.com",
          linkify: true
        }
      ]
    },
    {
      id: "19",
      title: "Marketing Team Overview",
      icon: {
        iconName: "utility:save",
        variant: "inverse"
      },
      subtitles: [
        {
          subtitleLabel: "Contact Email",
          subtitleType: "lightning/formattedEmail",
          value: "email@example.com"
        },
        {
          subtitleLabel: "Approval Status",
          subtitleType: "lightning/icon",
          iconName: "action:approval",
          title: "Approved"
        }
      ]
    },
    {
      id: "20",
      title: "Customer Feedback Analysis",
      icon: {
        iconName: "custom:custom5",
        variant: "success"
      },
      subtitles: [
        {
          subtitleLabel: "Address",
          subtitleType: "lightning/formattedAddress",
          street: "121 Spear St.",
          city: "San Francisco"
        },
        {
          subtitleLabel: "Text Example",
          subtitleType: "lightning/formattedText",
          value: "Email info@salesforce.com",
          linkify: true
        }
      ]
    },
    {
      id: "21",
      title: "Product Sales Goals",
      icon: {
        iconName: "standard:lead",
        variant: "warning"
      },
      subtitles: [
        {
          subtitleLabel: "Name",
          subtitleType: "lightning/formattedName",
          firstName: "John",
          lastName: "Doe",
          salutation: "Mr."
        },
        {
          subtitleLabel: "Address",
          subtitleType: "lightning/formattedAddress",
          street: "121 Spear St.",
          city: "San Francisco"
        }
      ]
    },
    {
      id: "22",
      title: "Sales Team Report",
      icon: {
        iconName: "doctype:powerpoint",
        variant: "error"
      },
      subtitles: [
        {
          subtitleLabel: "Contact Email",
          subtitleType: "lightning/formattedEmail",
          value: "email@example.com"
        },
        {
          subtitleLabel: "Approval Status",
          subtitleType: "lightning/icon",
          iconName: "action:approval",
          title: "Approved"
        }
      ]
    },
    {
      id: "23",
      title: "Marketing Strategy Plan",
      icon: {
        iconName: "action:video",
        variant: "info"
      },
      subtitles: [
        {
          subtitleLabel: "Hour",
          subtitleType: "lightning/formattedTime",
          value: "22:12:30.999"
        },
        {
          subtitleLabel: "Name",
          subtitleType: "lightning/formattedName",
          firstName: "John",
          lastName: "Doe",
          salutation: "Mr."
        }
      ]
    },
    {
      id: "24",
      title: "Customer Support Metrics",
      icon: {
        iconName: "utility:warning",
        variant: "inverse"
      },
      subtitles: [
        {
          subtitleLabel: "Approval Status",
          subtitleType: "lightning/icon",
          iconName: "action:approval",
          title: "Approved"
        },
        {
          subtitleLabel: "Hour",
          subtitleType: "lightning/formattedTime",
          value: "22:12:30.999"
        }
      ]
    }
  ];
}
