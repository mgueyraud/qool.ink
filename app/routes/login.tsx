import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useTransition, useActionData } from "@remix-run/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { Button, Input, Label } from "~/components/ui";
import { isValidEmail } from "../helpers/regex";
import {
  verifyLogin,
  createUserSession,
  requireUserSession,
} from "~/models/auth";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUserSession(request);
  if (user) return redirect("/dashboard");
  return json(null);
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = await formData.get("email");
  const password = await formData.get("password");

  invariant(typeof email === "string", "Email is required");
  invariant(typeof password === "string", "Password is required");

  const errors: { email: string | null; password: string | null } = {
    email: null,
    password: null,
  };

  if (!isValidEmail(email)) {
    errors.email = "Provide a valid email";

    return json({
      errors,
    });
  }

  const user = await verifyLogin({ email, password });

  if (!user) {
    errors.email = "Invalid credentials";
    errors.password = "Invalid credentials";

    return json({
      errors,
    });
  }

  return await createUserSession(user.id, "/dashboard");
}

interface LoginFormCollections extends HTMLFormControlsCollection {
  email?: HTMLInputElement;
  password?: HTMLInputElement;
}
interface LoginForm extends HTMLFormElement {
  readonly elements: LoginFormCollections;
}

export default function Login() {
  const data = useActionData<typeof action>();
  const formRef = useRef<LoginForm>(null);
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!data) formRef.current?.elements.email?.focus();

    if (data?.errors.email) {
      formRef.current?.elements.email?.focus();
      return;
    }

    if (data?.errors.password) {
      formRef.current?.elements.password?.focus();
    }
  }, [data]);

  return (
    <div className="flex max-w-md mx-auto h-screen">
      <div className="m-auto px-3 py-10">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors text-center">
          Welcome to Qool Link
        </h1>
        <p className="text-sm mt-4 max-w-xs text-center">
          Start creating the best and most beautiful links only in one place
        </p>
        <Form className="mt-6 w-full flex flex-col" method="post" ref={formRef}>
          <Label
            htmlFor="email"
            className={data?.errors.email ? " text-red-600" : ""}
          >
            Email
          </Label>
          <Input
            name="email"
            id="email"
            type="email"
            className={`mt-3 ${
              data?.errors.email
                ? " text-red-600 border-red-600 focus:ring-red-400"
                : "mb-8"
            }`}
            required
          />

          {data?.errors.email ? (
            <p className="text-sm text-red-600 mt-1 mb-8">
              {data?.errors.email}
            </p>
          ) : null}

          <Label
            htmlFor="password"
            className={data?.errors.password ? " text-red-600" : ""}
          >
            Password
          </Label>
          <div className="relative mt-3">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className={`pr-10 ${
                data?.errors.password
                  ? " text-red-600 border-red-600 focus:ring-red-400"
                  : ""
              }`}
              required
            />
            <div
              className="absolute bottom-0 top-0 right-3 flex flex-col justify-center z-20"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? (
                <Eye
                  width={20}
                  height={20}
                  className={data?.errors.password ? "text-red-600" : ""}
                />
              ) : (
                <EyeOff
                  width={20}
                  height={20}
                  className={data?.errors.password ? "text-red-600" : ""}
                />
              )}
            </div>
          </div>

          {data?.errors.password ? (
            <p className="text-sm text-red-600 mt-1 mb-3">
              {data?.errors.password}
            </p>
          ) : null}

          <Link
            to="/forgot-password"
            className="underline-offset-4 underline text-xs	text-slate-900 dark:text-slate-100 block ml-auto mt-2 focus:ring-offset-2"
          >
            Forgot Password?
          </Link>

          <Button className="mt-8 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
          <p className="text-center leading-7 mt-4 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="underline-offset-4 underline text-slate-900 dark:text-slate-100"
            >
              Sign up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
