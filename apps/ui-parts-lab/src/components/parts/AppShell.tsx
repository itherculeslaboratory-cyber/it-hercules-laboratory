import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

/** QUANTUM primitive · region AppShell · token --civ-bg-card */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="part-appshell" data-part="AppShell">
      <header className="part-appshell-top">
        <img className="mark" src="/brand/logo-mark.png" alt="" />
        <img className="logo" src="/brand/logo-primary.png" alt="IT Hercules Laboratory" />
        <span className="lab-badge" style={{ marginLeft: "auto" }}>
          UI Parts Lab
        </span>
      </header>
      {children}
    </div>
  );
}
