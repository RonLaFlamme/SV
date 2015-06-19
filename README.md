## Installing SV

*These steps assume you will be deploying this application to your GitHub page

1. Fork this repository and clone it to your Dropbox root folder
`git clone https://github.com/RonLaFlamme/sv.git`

2. Install the NodeJS libraries
`npm install`

3. Contact us to request your OAuth return URI by opening a new issue in this repository

4. Update the return URI in main.controller.js (search for "new Dropbox.AuthDriver.Popup(...)") to your GitHub pages location

4. Build the application
`gulp bulid`

5. Create a branch for gh-pages ([instructions](https://help.github.com/articles/creating-project-pages-manually/]))

5. Publish the application to your repository GitHub page
`gulp deploy`