import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUser, getUserSession, requireUserSession } from "~/models/auth";
import invariant from "tiny-invariant";
import {
  Form,
  useLoaderData,
  Link,
  useActionData,
  useTransition,
} from "@remix-run/react";
import { Button, Input, Label, Separator, Switch } from "~/components/ui";
import { CopyClipboard, UserDropdown } from "~/components/custom";
import { ExternalLink, Loader2 } from "lucide-react";
import { isURL } from "../helpers/regex";
import { createLink, getLinks } from "~/models/links";
import { useEffect, useRef } from "react";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserSession(request);
  invariant(userId, "A user id is needed");
  const user = await getUser(userId);
  const links = await getLinks(userId);

  return json({ user, links });
}

export async function action({ request }: ActionArgs) {
  const userId = await getUserSession(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const url = formData.get("url");
  const slug = formData.get("slug");
  const publish = formData.get("publish");

  invariant(typeof url === "string", "URL is required");
  invariant(typeof title === "string", "Title is required");
  invariant(typeof slug === "string", "Slug is required");
  invariant(typeof userId === "string", "You must be logged in");

  const errors: {
    title: null | string;
    url: null | string;
    slug: null | string;
  } = {
    title: null,
    url: null,
    slug: null,
  };

  if (!isURL(url)) {
    errors.url = "Please provide a valid URL";
  }

  if (!title || title.length === 0) {
    errors.title = "Please provide a title";
  }

  if (!url || url.length === 0) {
    errors.url = "Please provide a URL";
  }

  if (!slug || slug.length === 0) {
    errors.slug = "Please provide a slug";
  }

  if (Object.values(errors).find((value) => value)) {
    return json({ errors });
  }

  try {
    await createLink({ slug, publish: publish === "on", title, url, userId });
  } catch (e) {
    const err = e as Error;
    return json({
      errors: {
        slug: err.message,
        title: null,
        url: null,
      },
    });
  }

  return json(null);
}

interface CreationFormCollections extends HTMLFormControlsCollection {
  title?: HTMLInputElement;
  url?: HTMLInputElement;
  slug?: HTMLInputElement;
}
interface CreationForm extends HTMLFormElement {
  readonly elements: CreationFormCollections;
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const formRef = useRef<CreationForm>(null);
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  useEffect(() => {
    if (!actionData) {
      formRef.current?.reset();
      formRef.current?.elements.title?.focus();
      return;
    }

    if (!actionData.errors.title) {
      formRef.current?.elements.title?.focus();
      return;
    }

    if (actionData?.errors.url) {
      formRef.current?.elements.url?.focus();
      return;
    }
    if (actionData?.errors.slug) {
      formRef.current?.elements.slug?.focus();
      return;
    }
  }, [actionData]);

  return (
    <div>
      <header className="flex justify-between p-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors">
            Dashboard
          </h1>
        </div>
        <div>
          <UserDropdown name={data.user?.name ?? ""} />
        </div>
      </header>
      <Separator />

      <main className="m-4">
        <div className="flex items-start">
          <Form
            method="post"
            className="border-[1px] border-slate-200 p-3 w-full max-w-xs"
            ref={formRef}
          >
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Quick creation
            </h2>

            <fieldset className="mt-4">
              <Label
                htmlFor="title"
                className={actionData?.errors.title ? " text-red-600" : ""}
              >
                Title *
              </Label>
              <Input
                placeholder="Amazon product"
                name="title"
                id="title"
                className={`mt-2 ${
                  actionData?.errors.title
                    ? " text-red-600 border-red-600 focus:ring-red-400 placeholder-red-300"
                    : ""
                }`}
              />
            </fieldset>

            {actionData?.errors.title ? (
              <p className="text-sm text-red-600 mt-1">
                {actionData?.errors.title}
              </p>
            ) : null}

            <fieldset className="mt-4">
              <Label
                htmlFor="url"
                className={actionData?.errors.url ? " text-red-600" : ""}
              >
                URL *
              </Label>
              <Input
                placeholder="https://amazon.com/p/..."
                name="url"
                id="url"
                className={`mt-2 ${
                  actionData?.errors.url
                    ? " text-red-600 border-red-600 focus:ring-red-400 placeholder-red-300"
                    : ""
                }`}
              />
            </fieldset>

            {actionData?.errors.url ? (
              <p className="text-sm text-red-600 mt-1 ">
                {actionData?.errors.url}
              </p>
            ) : null}

            <fieldset className="mt-4">
              <Label
                htmlFor="slug"
                className={actionData?.errors.slug ? " text-red-600" : ""}
              >
                Slug *
              </Label>
              <div className="flex items-center text-sm mt-2">
                <div
                  className={`mr-3 ${
                    actionData?.errors.slug ? " text-red-600" : ""
                  }`}
                >
                  qool.ink/
                </div>
                <Input
                  placeholder="amz-prod"
                  name="slug"
                  id="slug"
                  className={
                    actionData?.errors.slug
                      ? " text-red-600 border-red-600 focus:ring-red-400 placeholder-red-300"
                      : ""
                  }
                />
              </div>

              {actionData?.errors.slug ? (
                <p className="text-sm text-red-600 mt-1">
                  {actionData?.errors.slug}
                </p>
              ) : null}
            </fieldset>
            <div className="flex items-center space-x-2 my-5">
              <Switch id="publish" name="publish" />
              <Label htmlFor="publish">Publish</Label>
            </div>
            <Button className="w-full mb-3" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </Form>
          <ul className="flex flex-wrap ml-10 items-start gap-x-10 gap-y-4 w-full">
            {data.links.map((link) => (
              <li
                className="border-[1px] border-slate-200 p-3 max-w-xs w-full"
                key={link.id}
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-bold">{link.title}</h2>
                  <Link to="/">
                    <ExternalLink width={15} height={15} />
                  </Link>
                </div>
                <div className="flex items-end [&:hover>button]:block">
                  <p className="font-light text-sm mt-2">
                    qool.ink/{link.slug}
                  </p>
                  <CopyClipboard url={`qool.ink/${link.slug}`} />
                </div>
                <p
                  className={`text-xs ${
                    link.publish ? "text-lime-600" : "text-blue-500"
                  } mt-4`}
                >
                  {link.publish ? "Published" : "Draft"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
