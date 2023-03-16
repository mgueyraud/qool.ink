import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useTransition } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { Button, Input, Label } from "~/components";
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

  const user = await verifyLogin({ email, password });

  if (!user) {
    return json({
      errors: {
        email: "Invalid credentials",
        password: "Invalid credentials",
      },
    });
  }

  return await createUserSession(user.id, "/dashboard");
}

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  return (
    <div className="flex max-w-md mx-auto h-screen">
      <div className="m-auto px-3 py-10">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors text-center">
          Welcome to Qool Link
        </h1>
        <p className="text-sm mt-4 max-w-xs text-center">
          Start creating the best and most beautiful links only in one place
        </p>
        <Form className="mt-6 w-full flex flex-col" method="post">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            id="email"
            type="email"
            className="mt-3 mb-8"
            required
            ref={emailRef}
          />
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            className="mt-3"
            required
          />
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
            Dont have an account?{" "}
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
