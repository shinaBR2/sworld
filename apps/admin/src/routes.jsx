import { Navigate, useRoutes } from "react-router-dom";
import DashboardLayout from "./layouts/dashboard";
import SimpleLayout from "./layouts/simple";
import BlogPage from "./pages/BlogPage";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";
import Page404 from "./pages/Page404";
import ProductsPage from "./pages/ProductsPage";
import DashboardAppPage from "./pages/DashboardAppPage";
import ListenHomeConfigAudioList from "./pages/listen/HomeConfigAudioList";
import ListenHomeConfigFeelingList from "./pages/listen/HomeConfigFeelingList";
import EntityFeelingPage from "./pages/entity/feeling/";
import EntityAudioPage from "./pages/entity/audio";
import FeatureFlags from "./pages/featureFlags";

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: "feature-flag", element: <FeatureFlags /> },
        { path: "app", element: <DashboardAppPage /> },
        {
          path: "listen",
          // element: <ListenHomeConfigAudioList />,
          children: [
            {
              path: "homepage-audio-list",
              element: <ListenHomeConfigAudioList />,
              index: true,
            },
            {
              path: "homepage-feeling-list",
              element: <ListenHomeConfigFeelingList />,
              index: true,
            },
          ],
        },
        {
          path: "entity",
          children: [
            {
              path: "audio",
              element: <EntityAudioPage />,
              index: true,
            },
            {
              path: "feeling",
              element: <EntityFeelingPage />,
              index: true,
            },
          ],
        },
        { path: "user", element: <UserPage /> },
        { path: "products", element: <ProductsPage /> },
        { path: "blog", element: <BlogPage /> },
      ],
    },
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: "404", element: <Page404 /> },
        { path: "*", element: <Navigate to="/404" /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
