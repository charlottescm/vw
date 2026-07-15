import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Music } from "./components/Music";
import { Blog } from "./components/Blog";
import { BlogPost } from "./components/BlogPost";
import { Work } from "./components/Work";
import { ChannelPage } from "./components/ChannelPage";
import { Info } from "./components/Info";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "music", Component: Music },
      { path: "blog", Component: Blog },
      { path: "blog/:slug", Component: BlogPost },
      { path: "work", Component: Work },
      { path: "work/:slug", Component: ChannelPage },
      { path: "info", Component: Info },
    ],
  },
]);
