---
slug: how-did-I-build-the-admin-site
title: How did I build the admin site
authors: [ShinaBR2]
tags: [admin]
---

The admin site is crucial in my business logic. But unlike user-facing pages, I don't need a fancy UI with tons of complexity in state management and styling. I want a simple, quick solution that can be up and running in a few hours.

Here is the template I chose: https://minimal-kit-react.vercel.app/dashboard/app.
The Github repository: https://github.com/devias-io/material-kit-react
I like its simplicity and smoothness. Let's get started!

Before going further, there are some notes:

- Currently, I use turborepo with already Vite setup as a build tool. So it won't be easy like just cloning the above repository and `npm start`. I am not sure if Vite automatically works with the code base or not.
- Second, TypeScript sucks! Why spend time fixing or adding new types to the code base that already works? The current free version of the template uses js, and that's enough for me, why spend money just for typescript???
- Everything I want is, cloning the template and making it works with the current monorepo structure without any hassle, that's it.

Here are the steps that I did:

- First, go to GitHub and download the source code as a zip: https://github.com/devias-io/material-kit-react
- Then, copy and paste all files and folders in the `src` folder into my current site (which is already set up with vite)
- Start the dev server, and of course, tons of bugs in the console.

## The problem

The current vite config does not allow `*.js` file in the code base, it requires `*.jsx`. I am not sure if that is the intention of the Vite team but for me, it sucks. Googling a couple of minutes in this issue: https://github.com/vitejs/vite/discussions/3448

1 hour, still not working after trying many combinations in the vite config file.

Finally, the solution is here: https://github.com/jyash97/cra-to-vite. Thanks!

All it does is convert all `.js` files to `.jsx` and that's exactly the thing I need because:

- Modify the vite config file as [the workaround here](https://github.com/vitejs/vite/discussions/3448#discussioncomment-749919) is not optimal, and in the future, I will never want to solve the bundler problem anymore, never. Every file I put in the workspace, should automatically work regardless of js or ts files.
- Since it just converts all the files from the template, so I can make sure it's working. I don't really care what is going on under the hood since the "devias-io" (author of the template) has already taken care of it.

After 2 hours, the admin site is up and running in my local dev. There are some errors in the console about missing some asset files, but that's fine.

The missing files come from the `public` folder that I forgot to copy, and just copy all, now my admin page is totally the same as the live demo 🎉🎉🎉 Now I can close the tab of the live demo and start working on the real site.

## Authentication

This is the next step and really important for the functionality of the site. Fortunately, I have experience with almost Authentication providers and Firebase Authentication is the easiest one. Just follow the docs!

For now, I duplicate all the files that Firebase requires and that's okay since I need to release the site as soon as possible. I will go back to the Firebase issue: https://github.com/shinaBR2/shinabr2-world/issues/14

1 hour and everything for Authentication is completed! So excited!

## Authorization

This is the next critical problem that I need to resolve obviously. Not all users will have permission to access the admin site. The solution should be using the [custom claim](https://firebase.google.com/docs/auth/admin/custom-claims#defining_roles_via_firebase_functions_on_user_creation).

In order to do that, I need a backend to let Firebase Admin SDK play the role: https://github.com/shinaBR2/shinabr2-world/issues/15

After that, I can come back to this admin site and continue with the basic CRUD features.

Completed! Now time to move on to the admin features.

---

Total time: around 8 hours
