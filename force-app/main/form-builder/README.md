# Form Builder

The **Form Builder** is a powerful, metadata-driven LWC framework designed to create, manage, and render complex dynamic forms within Salesforce. Unlike static forms, this system allows administrators to define form structures and behavioral logic entirely through configuration, without writing new code for every form.

### 🌟 Core Philosophy

The project is built on the concept of **"Form as Data."** Every question, section, and validation rule is stored as a record, allowing the form to adapt in real-time based on user input.

---

### 🛠️ Key Capabilities

#### 1. Dynamic Rendering (`questionCatalog`)

The engine reads from the `Question_Catalog__c` object to render a wide variety of input types (Text, Picklist, Multi-Select Checkbox, Currency, etc.). It supports:

- **Sectional Layouts**: Organizing questions into logical groups.
- **Auto-Calculations**: Automatically summing numeric values within groups (e.g., "Total Budget").
- **Smart Inputs**: Using a dynamic component resolver (`questionInput`) to load the right UI component for the data type.

#### 2. Advanced Rule Engine (`RuleEngine`)

This is the "brain" of the Form Builder. It evaluates user answers in real-time to trigger four main behavior types:

- **Visibility**: Hiding or showing questions based on previous answers (e.g., "Show 'Spouse Name' only if 'Married' is checked").
- **Requirements**: Dynamically making fields mandatory.
- **State Management**: Setting fields to Read-Only based on context.
- **Data Injection**: **Autopopulating** values from the system context or specific formulas.

#### 3. Complex Boolean Logic

The system includes a custom `booleanExpressionEngine` that allows for highly sophisticated rule conditions. Administrators can write logic like:

> `(1 AND 2) OR (3 AND NOT 4)`

This ensures that the form can handle even the most intricate business requirements.

#### 4. Rule Management Workspace (`selectQuestionRule`)

A dedicated administrative interface for managing the form's lifecycle:

- **Auditing**: View all rules associated with a specific question or the entire form.
- **Versioning**: Easily activate, deactivate, or delete rules to iterate on form logic.
- **Live Preview**: Real-time evaluation of rule changes without needing to reload the entire Salesforce page.

---

### 💻 Technical Stack

- **LWC & Apex**: A seamless bridge between custom UI and Salesforce data.
- **Metadata-First**: Built on custom objects (`Form_Definition__c`, `Question_Rule__c`) to ensure portability and ease of setup.
- **Jest Testing**: A robust test suite ensuring that complex logic changes don't break existing forms.

---

In short, the **Form Builder** transforms Salesforce from a simple data entry tool into an interactive, intelligent guidance system for users.
