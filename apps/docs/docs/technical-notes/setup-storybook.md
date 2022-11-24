---
sidebar_position: 4
---

# Setup storybook

Setting up the storybook is just a tech debt, but it is important because:

- I do it only once
- It will boost the UI development time in the future, saving my time to test the UI component
- It forces my mind to follow my rule of thumb regarding how to write a reactjs UI component.

# Installation

What I actually did is follow the official docs and run exact commands, and of course it will never work as expected.

Storybook official docs: https://storybook.js.org/docs/react/get-started/install

There are two problem here: I am using monorepo and pnpm.
So is what I actually did, thanks to [this comment](https://github.com/storybookjs/storybook/issues/12995#issuecomment-813630999)

**Important!** if it asked "Do you want to run the 'eslintPlugin' migration on your project?" choose **NO**.

```
cd packages/ui             # this is my current UI workspace
pnpx sb init -s            # Init only
pnpm i -D @storybook/cli   # Still inside the UI workspace
pnpm storybook
```

And thanks to [this comment](https://github.com/vercel/turbo/discussions/374#discussioncomment-1865933), I modified the `scripts` part in `packages/ui/package.json` file

```
"scripts": {
  "storybook": "start-storybook --ci -p 6006",
  "build-storybook": "build-storybook --quiet -o dist"
}
```

The next problem when running `pnpm storybook` is the NodeJS issue here: https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported

So I get back to the terminal and `export NODE_OPTIONS=--openssl-legacy-provider`

Now run `pnpm storybook` working. Thanks to the community! 🙏

# Writing stories

Just follow the examples, copy my UI component into a new story and got tons of this error message: `Can't import the named export 'useEffect' from non EcmaScript module (only default export is available)`. For me, [this comment](https://github.com/storybookjs/storybook/issues/16690#issuecomment-971579785) does not resolve the problem but [this](https://github.com/storybookjs/storybook/issues/16690#issuecomment-1102663989) does. It leads to the new page: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#webpack-5

So what I did

```
pnpm add -D @storybook/builder-webpack5 @storybook/manager-webpack5
```

Then add to the `.storybook/main.js`

```
core: {
  builder: 'webpack5',
}
```

Re-run the `storybook` command again and I got this where `XXX` is a package I used in my `core` workspace (in this case is `react-firebase-hooks/firestore`).

```
ModuleNotFoundError: Module not found: Error: Can't resolve 'XXX' in 'MY_PROJECT_PATH/packages/core/dist'
Did you mean 'index.esm.js'?
BREAKING CHANGE: The request 'XXX' failed to resolve only because it was resolved as fully specified
(probably because the origin is strict EcmaScript Module, e. g. a module with javascript mimetype, a '*.mjs' file, or a '*.js' file where the package.json contains '"type": "module"').
The extension in the request is mandatory for it to be fully specified.
Add the extension to the request.
```

So that means the webpack has some problems with resolve modules in the monorepo structure because the current package here I has no use at all in my UI component. But somewhere else in my `ui` workspace uses that package from the `core` workspace.

Here are the links that I have taken a look:

- https://github.com/vercel/next.js/issues/13197
- https://stackoverflow.com/questions/60907111/using-tsconfig-paths-webpack-plugin-gives-module-not-found-error-for-fs-and
- https://storybook.js.org/docs/react/builders/webpack#typescript-module-resolution
  Still does not work, to be updated

---

# Installation again

I end up with the decision to use the storybook inside the `apps` folder instead of `packages/ui` even though it makes no sense to me. The root cause is storybook used webpack internally and webpack has some problems with pnpm and monorepo structure, so I want to try to vite. Here is an example from turborepo: https://github.com/vercel/turbo/blob/main/examples/design-system/apps/docs/package.json

Follow the [my docs](https://github.com/shinaBR2/shinabr2-world/wiki/How-to-add-new-workspace-from-scratch) to setup a new workspace inside the `apps` folder.

I ran through the above process again and of course, the initialization won't easily work.

The first error I encountered is `Failed to resolve import "@storybook/preview-web"` when try to run `pnpm storybook` and I ended up with the solution from [this comment](https://github.com/storybookjs/builder-vite/issues/423#issuecomment-1172985938), basically manually install below packages

```
"@storybook/preview-web": "6.5.9",
"@storybook/addon-docs": "6.5.9",
"@storybook/client-api": "6.5.9",
"@storybook/addon-backgrounds": "6.5.9",
"@storybook/addon-measure": "6.5.9",
"@storybook/addon-outline": "6.5.9",
"@storybook/channel-postmessage": "6.5.9",
"@storybook/channel-websocket": "6.5.9",
"@storybook/addons": "6.5.9",
```

The next error was `Failed to fetch dynamically imported module: http://localhost:6006/stories/Introduction.stories.mdx?import` which is the root cause is maybe related to `.mdx` extension. So I just rename the file `Introduction.stories.mdx` to something not supported by storybook and it worked. Finally I can see the default Button view from the official docs of storybook 🙏 🎉🎉🎉

# Writing stories

I tried to write a simple story again and still got the issue `Failed to fetch dynamically imported module`. My bad, I forget to build the `ui` workspace first.

Finally, it works! Now I can see my component in the `ui` workspace with my storybook 🎉🎉🎉
