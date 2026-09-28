import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { ToastHost } from "./components/ui/Toast";

export default function App() {
  return (
    <>
      <RouterProvider router={routes} />
      <ToastHost />
    </>
  );
}
