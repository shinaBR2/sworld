---
sidebar_position: 2
---

# Working with theme

Let's say I am working on a new site call 'new_site', it may contains some different styles. Here is the example structure in the `ui` package which `style1`, `style2` and `style3` are folders for different layout styles.

```
.
+-- new_site
| +-- style1
| | +-- theme.ts
| +-- style2
| | +-- theme.ts
| +-- style3
| | +-- theme.ts
+-- sui-base
| +-- baseTheme.ts
```

All `theme.ts` files in the folder `new_site/style**` will be extends the `baseTheme.ts` file
