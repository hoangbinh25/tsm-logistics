import MainLayout from "@/components/layout/MainLayout";
import AboutUs from "@/pages/AboutUs";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import Page from "@/pages/Page";
import Services from "@/pages/Services";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
    {
        path:"/",
        element: <MainLayout/>,
        children: [
            {index: true, element: <Home/>},
            {path: "about", element: <AboutUs/>},
            {path: "services", element: <Services/>},
            {path: "blog", element: <Blog/>},
            {path: "page", element: <Page/>},
            {path: "contact", element: <Contact/>},

            
        ]
    }
])