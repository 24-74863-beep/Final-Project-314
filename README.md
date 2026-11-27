# Bobby's Repair System (MySQL edition)

## Folder structure
```
bobbys-repair-system/
├── app.js                    starts the Express server (API under /api, serves the frontend folder)
├── package.json
├── .env.example              copy to .env and edit
├── .gitignore                node_modules/ and .env are NOT committed
├── backend/
│   ├── config/               db.js (MySQL connection, runs the files in /database)
│   ├── controllers/          read the request, call a service, send the response
│   ├── middleware/           asyncHandler, revision counter
│   ├── models/               SQL queries and the table map (tableMap.js)
│   ├── routes/               URL -> controller (dataRoute, partRoute, recordRoute)
│   ├── services/             business rules (recordService, dataService, partService, seedService)
│   └── utils/                errors, hash
├── database/                 one SQL file per feature, run in number order on start-up
│   ├── 1_account_tables.sql      customers, users
│   ├── 2_mechanic_table.sql
│   ├── 3_motorcycle_table.sql
│   ├── 4_catalog_tables.sql      services, parts
│   ├── 5_repair_table.sql
│   ├── 6_emergency_table.sql
│   └── 7_payment_table.sql
└── frontend/                 plain HTML + JavaScript (no build step)
    ├── index.html            login and customer sign-up (sends each person to their own app)
    ├── owner/                OWNER app
    │   ├── html/owner.html
    │   └── js/               App.js, main.js, pages/, services/, components/
    ├── customer/             CUSTOMER app
    │   ├── html/customer.html
    │   └── js/               App.js, main.js, pages/
    └── shared/               used by both apps
        ├── css/style.css
        ├── images/favicon.svg
        └── js/               ui/core.js, services/, components/, pages/ (login, sign-up), config/, utils/
```
Rule: owner code never goes in `frontend/customer`, and customer code never goes in `frontend/owner`. Anything both need goes in `frontend/shared`.
After login, `Auth.homePage(user)` picks `/owner/html/owner.html` or `/customer/html/customer.html`. If someone opens the wrong page, they are redirected to their own.
Script order in the three HTML files matters (shared services first, then `core.js`, then the app's `App.js`, then pages, then `main.js`).

## Run it
1. Install **Node.js 18+** and **MySQL 8 / MariaDB 10.4+**. Start MySQL.
2. In the project folder (the one with `app.js`):
   ```
   cp .env.example .env        (Windows: copy .env.example .env)
   npm install
   npm start
   ```
3. Open **http://localhost:3000**. The server also serves the `frontend` folder.

The database and tables are created automatically from the files in `database/`. Default login: `owner` / `owner123`.

GitHub only stores the code. It does not run the server, so everyone who clones the repo runs steps 1 to 3 on their own computer.

## Known limits
- Login, password hashing and business rules (daily job limit, stock check) still run in the browser (`frontend/shared/js/services` and `frontend/owner/js/services`). For public use, move them into `backend/services` with bcrypt and sessions.
- Changes made on another device appear within about 10 seconds.
