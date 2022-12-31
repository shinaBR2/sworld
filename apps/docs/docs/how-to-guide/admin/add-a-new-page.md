---
sidebar_position: 1
---

# How to add a new page in the admin site

A new page will appear in these places:

- Left menu
- Routing

Requirements for each page:

- URL
- Icon

For all kinds of pages, do the following first:

- Add new item in `apps/admin/src/layouts/dashboard/nav/config.jsx`
- Add a new route in `apps/admin/src/routes.jsx`
- Add new component in `apps/admin/src/pages`

## CRUD page

Steps:

- Copy all content from `apps/admin/src/components/_mockForDev/MockCRUDPage.jsx` into the newly created page component, and fix all imports if needed. Now I can access the page that shows a full-page loading
- Build hooks for CRUD operations
- Build the `ListComponent`
- Build the `FormComponent` component
