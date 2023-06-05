# New Employee Form Fill Workflow

This diagram represents the flow of the New Employee Form Fill Workflow.

```mermaid
graph LR
    A((Start)) --> B{Form Filled?}
    B -- Yes --> C{follow up Task Exists?}
    C -- Yes --> D[Call Actity: Complete Follow Up Task]
    D --> E((End))
    C -- No --> E
    B -- No --> F[Call Actity: Send Reminder]
    F-->G{Follow Up Task Exists?}
