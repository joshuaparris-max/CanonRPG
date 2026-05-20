# Sourcebook Data Guide

This guide explains how to use the Canon Table Engine sourcebook workflow.

## Local-only sourcebook entries

- All monster, NPC, item, spell, and trap data entered here is private.
- Required fields: `sourceBook`, `sourceId`, `pageRef`.
- `localOnly` and `enteredByUser` are set automatically.

## Official PDF import

The app supports importing official PDFs locally using `pdfjs-dist`.
- Imported PDFs are stored in browser localStorage.
- Index entries are generated to help map PDF pages to adventure content.
- The PDF library is not shared automatically and should remain private.
