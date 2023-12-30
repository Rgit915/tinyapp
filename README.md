# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product
### Tiny web application:
These screenshoots represent key screens in TinyApp web application, providing an overview of the user registration and login process, as well as the main functionalities related to URL shortening and management.


!["Screenshoot of main page showing user to register or login to shorten URLS"](https://github.com/Rgit915/tinyapp/blob/master/docs/mainPage.png?raw=true)
- **Main page:** This page shows users the main features of TinyApp and provides them with clear instrucions to either register or log in to start using the URL shortening service.

!["Screenshoot of the register Page showing user to create an account "](https://github.com/Rgit915/tinyapp/blob/master/docs/Register_form.png?raw=true)
- **Register page:** This page provides a registration form where users can input thier email address and password. This is mainly for users who do not have an account yet.


!["Screenshoot of the login Page "](https://github.com/Rgit915/tinyapp/blob/master/docs/Login_form.png?raw=true)
- **Login page:** For users who already have an account, the login section presents a login form with input fields for Email and password. Once users give valid credentials, the 'Login' button allows them to log in to their account.

!["Screenshoot of List of URLS "](https://github.com/Rgit915/tinyapp/blob/master/docs/UsersURL.png?raw=true)
- **My URLs:** For logged in users, My URLs page displays list of Long URL with their respective short URL IDs. This section allows registered and logged in users to create new shortend URL, edit and delete URLs.

!["Screenshoot of Add New URL Page"](https://github.com/Rgit915/tinyapp/blob/master/docs/addNewURL.png?raw=true)
- **New URL:** To create new shortened URLs, logged in users can enter a long url in the provided text field. Once  users click on the submit button it redirects them to a page which shows the shortend URL for their respective longURL


!["Edit URLS"](https://github.com/Rgit915/tinyapp/blob/master/docs/EditURL.png?raw=true)
- **Edit URL:** logged in users can update their URL by entering in the provided text field.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- Nodeman

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.