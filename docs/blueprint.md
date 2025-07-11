# **App Name**: JSON Editor Pro

## Core Features:

- Fetch JSON: Read JSON data from a URL.
- Visual Render: Render the JSON data as an editable visual representation. Support viewing JSON in tree or table views.
- Edit JSON: Allow the user to edit existing JSON values, keys and datatypes. Also let user add, delete, or duplicate nodes in the tree. Retain correct JSON structure when inserting.
- AI-Assisted Suggestion: Suggest appropriate JSON structure (data types, common keys, etc.) when inserting new elements based on existing siblings in the object using an LLM tool. Make reasonable suggestions to reduce manual typing, based on other items in the same object or array.
- Copy & Paste: Allow copying and pasting of JSON values and key names.
- Duplicate Objects/Arrays: Enable duplicating an entire JSON object or array.
- Save/Download: Support export edited JSON to file for save/download. 

## Style Guidelines:

- Primary color: Sky blue (#7AD1FF), conveying trustworthiness and clarity for data representation.
- Background color: Light gray (#F0F4F8), offering a neutral and clean backdrop to improve content focus.
- Accent color: Electric purple (#8B3DFF), emphasizing key interactive elements such as active buttons and the AI-assistance feature.
- Font pairing: 'Space Grotesk' (sans-serif) for headers, and 'Inter' (sans-serif) for the body to combine readability with a modern aesthetic.
- Use minimalistic and clear icons to represent actions such as add, delete, and duplicate.
- The app has a clear division of workspace. A sidebar provides the functionality of file opening, setting, and exporting JSON. The main workspace is the data grid, and provides interactive JSON editing capabilities.
- Use subtle transitions and animations on interactive elements (e.g., hover effects on buttons, expanding/collapsing JSON nodes). Highlight diffs using animation and color.