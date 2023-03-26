import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "message/:id",
        element: <App />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin/register",
    element: <Register />,
  },
]);

export default routes;
