/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as GameSlugImport } from './routes/$gameSlug'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const GameSlugRoute = GameSlugImport.update({
  id: '/$gameSlug',
  path: '/$gameSlug',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/$gameSlug.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/$gameSlug': {
      id: '/$gameSlug'
      path: '/$gameSlug'
      fullPath: '/$gameSlug'
      preLoaderRoute: typeof GameSlugImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/$gameSlug': typeof GameSlugRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/$gameSlug': typeof GameSlugRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/$gameSlug': typeof GameSlugRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/$gameSlug'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/$gameSlug'
  id: '__root__' | '/' | '/$gameSlug'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  GameSlugRoute: typeof GameSlugRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  GameSlugRoute: GameSlugRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/$gameSlug"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/$gameSlug": {
      "filePath": "$gameSlug.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
