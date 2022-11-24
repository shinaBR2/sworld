---
sidebar_position: 3
---

# Environment variables

This is an interesting and frustrating problem.

Imagine the scenario:

- In my main workspace, I will import some UI components from the `ui` workspace.
- In my `ui` workspace, I want to init something depending on the environment variables that I store in `.env` file obviously.
- My `ui` workspace is using [tsup](https://tsup.egoist.dev) for bundling.
- My `.env` won't be checked out into GitHub, so it won't be available for deploy process using Github actions.

Couple questions:

- Where should I put the `.env` file? In the root folder or in the `ui` workspace?
- How to get environment variables from the `.env` file?
- How to get environment variables during the deployment process using Github Actions?

It took me many hours to research, try, failed and re-try again, till now what I got so far:

- `tsup` support an `env` variable in the [config](https://paka.dev/npm/tsup@6.4.0/api#52abb457a2067745) which totally works when I hard code the values in `package.json` file or in any `tsup` config file. But I need to load environment variables from `.env` file instead.
- Using `dotenv` inside the `ui` workspace does seem not to work since there is no NodeJS process during run time. I expected `tsup` will inject the environment variables whenever it see the `process.env` in the code base, but it was not 🤔
- I follow [turbo docs](https://turbo.build/repo/docs/handbook/dev#using-environment-variables) and put my `.env` file into root folder, and still not working. Other than that, there are some weird errors regarding wrong syntax in the built files of my `ui` workspace.

Things I will need to take a look:

- https://github.com/vercel/turbo/discussions/1799
- https://turbo.build/blog/turbo-1-1-0#environment-variable-dependencies
- https://github.com/vercel/turbo/discussions/320

# Solution

Finally, I ended up with a solution of putting the environment variables into the `apps` workspaces instead of `packages` workspaces. Even though this is not my intention by default, I have re-think about the dependency relation.

Initially, my idea is to try to put the `firebase` as the dependency of `ui` workspace, not my main workspace. But it seems wrong because I use Firebase CLI to deploy, it requires some firebase-liked files in the main workspace. So firebase should be the dependency of my main workspace no matter what!

Good thing I learnt from this:

- How turbo, vite and tsup handle the environment variables
- Vite library mode does not tree shakable at least at this moment
- Building a library with tsup requires lots of hacks if I am going to read some environment variables especially deployment process in the CI system
