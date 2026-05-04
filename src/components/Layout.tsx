import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} — David Dyberg
    </footer>
  </div>
);

export default Layout;
