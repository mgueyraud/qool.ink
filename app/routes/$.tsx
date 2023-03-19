import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getLinkBySlug } from "~/models/links";

export async function loader({ params }: LoaderArgs) {
  const slug = params["*"];
  invariant(typeof slug === "string", "Slug is required");

  const link = await getLinkBySlug(slug);

  if (!link) {
    return json(null);
  }

  return redirect(link.url);
}
