---
sidebar_position: 7
---

# Firebase bundle size

After build with Vite (rollup), the bundle size is big, see this PR: https://github.com/shinaBR2/shinabr2-world/pull/56

Firebase version: `9.15.0`
Environment: WSL2 Windows 10
Site: listen

## Play around

I tried to remove using Firebase Auth due to that's not the requirement for the project at this moment. The bundle size is reduced by 226.93KB (15.33% bundle size), the biggest file is still `@firebase+firestore@3.8.0_@firebase+app@0.9.0/node_modules/@firebase/firestore/dist/index.esm2017.js` that cost 486.885 KB (32.89% bundle size)

List of reference I read:

- https://github.com/firebase/firebase-js-sdk/issues/4916
- https://github.com/firebase/firebase-js-sdk/issues/6502
