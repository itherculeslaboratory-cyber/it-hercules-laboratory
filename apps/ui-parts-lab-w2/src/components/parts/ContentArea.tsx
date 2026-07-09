import type { ReactNode } from "react";

type ContentAreaProps = {
  children: ReactNode;
};

/** QUANTUM primitive · region ContentArea · mock viewport host */
export function ContentArea({ children }: ContentAreaProps) {
  return (
    <div className="part-content-area" data-part="ContentArea">
      {children}
    </div>
  );
}
