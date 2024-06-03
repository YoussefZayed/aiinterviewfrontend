import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InterviewPage from "@/pages/interview";
import App from "./App";
import PreInterviewPage from "./pages/preInterview";
import InterviewFeedBackPage from "./pages/feedback";
import AdminPage from "./pages/admin";

const router = createBrowserRouter([
  {
    path: "/admin31231",
    element: <AdminPage />,
  },
  {
    path: "/:interviewId/:userInterviewId/feedback",
    element: <InterviewFeedBackPage />,
  },
  {
    path: "/:interviewId/:userInterviewId",
    element: <InterviewPage />,
  },
  {
    path: "/:interviewId",
    element: <PreInterviewPage />,
  },

  {
    path: "/",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
