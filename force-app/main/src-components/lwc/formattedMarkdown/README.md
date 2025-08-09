# <c-formatted-markdown> Specification

## Description

The `formattedMarkdown` Lightning Web Component (LWC) renders Markdown content as formatted HTML within your Salesforce Lightning application. It is useful for displaying rich text, documentation, or user-generated content in a visually appealing and safe way.

## Properties

| **Property**  | **Type** | **Description**                                |
| ------------- | -------- | ---------------------------------------------- |
| `@api string` | `String` | The Markdown string to render. Required.       |
| `@api url`    | `String` | (Optional) URL to fetch Markdown content from. |

## Usage

### Basic Usage

```html
<c-formatted-markdown
  string="## Hello World\nThis is **Markdown**!"
></c-formatted-markdown>
```

### Using URL

```html
<c-formatted-markdown
  url="https://example.com/content.md"
></c-formatted-markdown>
```

## Notes

- The component sanitizes the rendered HTML to prevent XSS attacks.
- Only standard Markdown syntax is supported.
- Styling may be customized via CSS in the component's style file.

---

For more details, see the component source code and documentation comments.
