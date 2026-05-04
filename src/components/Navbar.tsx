import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Session } from "@supabase/supabase-js";

const Navbar = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-smooth hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <nav className="container flex items-center justify-between h-16">
        <Link to="/" className="font-display text-lg font-bold text-gradient" aria-label="Home"></Link>
        <div className="flex items-center gap-6">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/projects" className={linkCls}>Projects</NavLink>
          {session ? (
            <>
              <NavLink to="/admin" className={linkCls}>Admin</NavLink>
              <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
                Sign out
              </Button>
            </>
          ) : (
            <NavLink to="/auth" className={linkCls}>Sign in</NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
