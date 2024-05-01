# Organic Data Pull from Plausible to Google Sheets using Google Apps Script

## Prerequisites
Before the script can be used, the following requirements must be met:

- Access to the Plausible API with a valid API token.
- A Google Sheet should be set up with the appropriate structure for receiving the data.


## Setup Instructions
### 1. Google Sheet Preparation
Create a Google Sheet with the following separate sheets:

- **Sheet name: Pages,** Headers: ["Date", "Entry Page", "Sessions", "Users", "Pageviews", "Events", "Bounce Rate", "Visit Duration",]
- **Sheet name: Date,** Headers: ["Date", "Sessions", "Users", "Pageviews", "Bounce Rate", "Visit Duration"]
- **Sheet name: Goals,** Headers: ["Date", "Page", "Goal", "Users", "Events"]
- **Sheet name: Pillar Management,** Headers: ["Article Group", "Article Page", "Full Page"]

The "Pillar Management" sheet is designated to manage the article groups and pages.

**Instructions for Pillar Management:**

- **Article Group:** This column should contain the name of the article group. If an article group includes multiple pages, merge the cells vertically in this column to span all associated article pages.
- **Article Page:** Enter individual article pages that fall under each article group.
- **Full Page:** This column is for the full path of each page, which is a concatenation of the Article Group and Article Page. Use a formula '=A2&B2' assuming A2 is part of the Article Group and B2 is the Article Page.

The link to the sheet was shared.

### 2. Script Properties
Store the following required properties in your script project:

- **sheet_id:** The ID of your Google Sheet.
- **api_key:** Your Plausible API key.
- **site_id:** Your Plausible site identifier.

These properties should be set in the Google Apps Script environment under **File > Project properties > Script properties**.

### 3. Deploying the Script
The script should be pasted into the script editor in Google Apps Script associated with the created Google Sheet.

### 4. Scheduling
To automate data fetching, use Google Apps Script's triggers:

- Go to the script editor.
- Click on Edit > Current project's triggers.
- Click on + Add Trigger and set up a daily time-driven trigger to run the main function.

### 5. Troubleshooting & Logs
Should any issues arise, consult the "Logs" tab in the Google Apps Script environment for error messages or debugging output. It is essential to ensure that your API key and site ID are correctly configured and that your Google Sheet is appropriately prepared with the correct permissions and structure.
