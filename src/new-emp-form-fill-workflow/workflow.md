# Create diagras using
https://mermaid.live/edit#pako:eNpVkMtOwzAQRX9lNKtEan_AC1CbBxvEooEFwiyseEqt-hHZjqCy8u-YukipVyPPuWdGk3B0kpDhlxfTCZ4P3EJ-u6oaovCxrmG7fYB96p030CutST4uhdnnFrxTuBJNOjqt3TfME7yKcIbuR4UY_tlmzbYfjdAadmNU8cKgcWbSFAn6Yngrhs-SbK-Rrqo6K-t6ZXtxpbNa5vbV3_sHshIOZJSV5G_WPnNP6X7gamXcoCFvhJL5MukvwjGeyBBHlksp_Jkjt0vmxBzdcLEjsuhn2uA8SRGpVSIf1CA7Ch1o-QUSV20I

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
