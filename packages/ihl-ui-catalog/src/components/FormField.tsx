import type { ReactNode } from "react";
import type { W2ComponentProps } from "../types/w2";
import "./form-field.css";

type FormFieldProps = W2ComponentProps & {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
};

/** catalog id: ihl-primitive-form-field */
export function FormField({ id, label, required, hint, children, className }: FormFieldProps) {
  return (
    <div
      className={["ihl-form-field", className].filter(Boolean).join(" ")}
      data-component-id="ihl-primitive-form-field"
    >
      <div className="ihl-form-field__label-row">
        <label className="ihl-form-field__label" htmlFor={id}>
          {label}
        </label>
        {required && <span className="ihl-form-field__required">必須</span>}
      </div>
      {children}
      {hint && <p className="ihl-form-field__hint">{hint}</p>}
    </div>
  );
}
