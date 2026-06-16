"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "./icons";

// Password field with a show/hide toggle. Spread any standard input props
// (value/onChange, name/defaultValue, autoComplete, required, etc.).
export default function PasswordInput(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className="input pr-10" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label={show ? "Hide password" : "Show password"}
      >
        <Icon name={show ? "eyeOff" : "eye"} size={18} />
      </button>
    </div>
  );
}
