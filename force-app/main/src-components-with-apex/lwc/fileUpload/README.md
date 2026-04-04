# FileUpload Component

A versatile Lightning Web Component for Salesforce that manages file uploads, previews, and versioning. This component intelligently toggles between an **Upload Mode** (initial state) and a **View Mode** (after a file is linked).

## Features

- **Dynamic Modes**: Automatically switches between a `lightning-file-upload` input and a visually clean "File Tile" once a file is present.
- **Smart Icons**: Determines the correct icon based on the file extension (e.g., PDF, Excel, Word, Image).
- **Comprehensive Action Menu**: Provides context-aware actions in View Mode:
  - **View Details**: Opens the standard Salesforce file preview in a new tab.
  - **Download**: Instantly downloads the latest version of the file using `ContentVersion` streaming.
  - **Upload New Version**: Replaces the current file with a new version under the same `ContentDocument`, maintaining the same ID and history.
  - **Remove File**: Safely unlinks the file from the current record by deleting the `ContentDocumentLink`.
- **Intelligent Disabled State**:
  - In **Upload Mode**: Disables the upload button entirely.
  - In **View Mode**: Applies a "Read-Only" visual style. Mutating actions ("Remove" and "Upload New Version") are disabled in the menu, but "View Details" and "Download" remain accessible.
- **Real-time Feedback**: Uses `ShowToastEvent` to provide immediate visual alerts if an error occurs during upload, download, or unlinking.

## Configuration & Setup

Deploy the component to Record Pages via Lightning App Builder. It is designed to work seamlessly with the `recordId` provided by the page context.

### Public API Properties

| Property                | Type      | Default        | Description                                                                                                        |
| ----------------------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `recordId`              | `Id`      | null           | The ID of the record the file is/will be linked to. Required for linking and unlinking logic.                      |
| `contentDocumentLinkId` | `Id`      | null           | The ID of the `ContentDocumentLink` to display. Setting this triggers View Mode immediately.                       |
| `name`                  | `String`  | null           | Optional override for the file display name in the UI.                                                             |
| `disabled`              | `Boolean` | false          | When true, prevents modifications. Disables "Remove" and "Upload New Version" while keeping "View" actions active. |
| `accept`                | `String`  | (All basics)   | Comma-separated list of allowed file extensions (e.g., `.pdf,.png`).                                               |
| `label`                 | `String`  | "Upload Files" | Label displayed on the upload button in Upload Mode.                                                               |

## Dispatching Events

The component dispatches custom events to notify parent components of state changes:

- `onremove`: Fired after a file is successfully unlinked from the record.
- `onuploadfinished`: Fired after a file is successfully uploaded (standard `lightning-file-upload` payload).

## Apex Controller Support

The component relies on `FileUploadController.cls`, which provides secure, `USER_MODE` enabled methods for:

- Retrieving file metadata (`getFile`).
- Safely unlinking records (`unlinkFile`).
- Managing version replacement (`replaceFileVersion`).
- Generating download URLs.
