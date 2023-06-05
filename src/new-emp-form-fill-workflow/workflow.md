# Create diagras using
https://mermaid.live/edit#pako:eNpVkMtOwzAQRX9lNKtEan_AC1CbBxvEooEFwiyseEqt-hHZjqCy8u-YukipVyPPuWdGk3B0kpDhlxfTCZ4P3EJ-u6oaovCxrmG7fYB96p030CutST4uhdnnFrxTuBJNOjqt3TfME7yKcIbuR4UY_tlmzbYfjdAadmNU8cKgcWbSFAn6Yngrhs-SbK-Rrqo6K-t6ZXtxpbNa5vbV3_sHshIOZJSV5G_WPnNP6X7gamXcoCFvhJL5MukvwjGeyBBHlksp_Jkjt0vmxBzdcLEjsuhn2uA8SRGpVSIf1CA7Ch1o-QUSV20I

# New Employee Form Fill Workflow

This diagram represents the flow of the New Employee Form Fill Workflow.

```mermaid
graph LR
    A((Start)) --> B{Form Filled?}
    B -- Yes --> C{follow up Task Exists?}
    C -- Yes --> D[Call Activity: Complete Follow Up Task]
    D --> E((End))
    C -- No --> E
    B -- No --> F{has periodGivenForFormFilling expired?}
    F -- No -->B
    F -- Yes -->G{has numberOfRemindersForFormFilling sent?}
    %% Perhaps we need to have a different approach here to handle all reminders are sent
    G -- Yes -->A 
    G -- No --> H[Call Activity: Send the Reminder]
    H -->I{Followup Task Already Exists?}
    I -- No --> J[Call Activity: Create Followup Task]
    I -- Yes --> K[Call Activity: Update Followup Task Priority]
    J -->L{Form Filled?}
    K -->L
    L -- Yes -->C
    L -- No --> M{Has formFilingReminderDuration expired?}
    M -- No --> L
    M -- Yes -->G

