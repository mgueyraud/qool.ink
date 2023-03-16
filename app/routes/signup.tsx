import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { Button, Input, Label } from "~/components";
import {
  createUser,
  createUserSession,
  requireUserSession,
} from "~/models/auth";
import { isValidEmail } from "../helpers/regex";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUserSession(request);
  if (user) return redirect("/dashboard");
  return json(null);
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  invariant(typeof email === "string", "Email is required");
  invariant(typeof password === "string", "Password is required");
  invariant(
    typeof confirmPassword === "string",
    "Confirm Password is required"
  );

  const errors: {
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
  } = {
    email: null,
    password: null,
    confirmPassword: null,
  };

  if (!isValidEmail(email)) {
    errors.email = "The email should be valid";
  }

  if (password.length === 0) {
    errors.password = "Pleave provide a password";
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = "It's not equal to the password";
  }

  if (Object.values(errors).find((value) => value)) {
    return json({ errors });
  }

  try {
    const user = await createUser({ email, password });
    return await createUserSession(user.id, "/dashboard");
  } catch (err) {
    const error = err as Error;
    return json({
      errors: {
        email: error.message,
        password: null,
        confirmPassword: null,
      },
    });
  }
}

interface SignupFormCollections extends HTMLFormControlsCollection {
  email?: HTMLInputElement;
  password?: HTMLInputElement;
  confirmPassword?: HTMLInputElement;
}
interface SignupForm extends HTMLFormElement {
  readonly elements: SignupFormCollections;
}

export default function SignUp() {
  const formRef = useRef<SignupForm>(null);
  const data = useActionData<typeof action>();
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  useEffect(() => {
    if (!data) {
      formRef.current?.elements.email?.focus();
      return;
    }

    if (data?.errors.email) {
      formRef.current?.elements.email?.focus();
      return;
    }
    if (data?.errors.password) {
      formRef.current?.elements.password?.focus();
      return;
    }

    if (data?.errors.confirmPassword) {
      formRef.current?.elements.confirmPassword?.focus();
      return;
    }
  }, [data]);

  return (
    <div className="flex max-w-md mx-auto h-screen">
      <div className="m-auto px-3 py-10">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors text-center">
          Sign up to Qool Link
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
              data?.errors.email ? " text-red-600 border-red-600" : "mb-8"
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
          <Input
            id="password"
            name="password"
            type="password"
            className={`mt-3 ${
              data?.errors.password ? " text-red-600 border-red-600" : "mb-8"
            }`}
            required
          />

          {data?.errors.password ? (
            <p className="text-sm text-red-600 mt-1 mb-8">
              {data?.errors.password}
            </p>
          ) : null}

          <Label
            htmlFor="confirmPassword"
            className={data?.errors.confirmPassword ? " text-red-600" : ""}
          >
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className={`mt-3 ${
              data?.errors.confirmPassword ? " text-red-600 border-red-600" : ""
            }`}
            required
          />

          {data?.errors.confirmPassword ? (
            <p className="text-sm text-red-600 mt-1">
              {data?.errors.confirmPassword}
            </p>
          ) : null}

          <Button className="mt-8 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Creating user..." : "Sign up"}
          </Button>
          <p className="text-center leading-7 mt-4 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline-offset-4 underline text-slate-900 dark:text-slate-100"
            >
              Sign in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
