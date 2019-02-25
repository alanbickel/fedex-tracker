## FedEx Tracking App

A simple one-page Electron app for retrieving the status of multiple FedEx tracking numbers, running puppeteer to scrape FedEx website.
Ingests either a tab-delimited CSV or an Excel spreadsheet.  For either file format, there may or may not be one header row - (user will be prompted to confirm header row presence on ingest).  Both file formats must list tracking numbers in the first column, any additional columns of data will be politely ignored.  XLSX may contain multiple sheets, all will be processed.  


Tracking numbers split into three groups: Delivered, In Transit, and Action Required.  User may export to either an XLSX or tab-delimited CSV.  Both export formats can easily be re-processed by the app.  User-facing data is fancied-up for display using jQuery DataTables.

### running locally
 - Requires Node.Js and NPM
 - run `npm install` to download dependencies 
 - tun `npm start` to build the project and run locally

### creating Windows executable

[Electron-packager](https://github.com/electron-userland/electron-packager) is a convenient wrapper for creating Windows executables, and will create a self-contained directory with all dependencies.  This can get rather large, since we're using Chromium behind the scenes.
 - follow the readme for building to your target architecture, or you can start with: 
 - `electron-packager <app root (relative path)> <new package name> --platform=win32 --arch=x64` 
 - use the `--overwrite` if you're compiling multiple times.

