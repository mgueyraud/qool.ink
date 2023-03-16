import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserSession } from "~/models/auth";

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);
  return json(null);
}

export default function Dashboard() {
  return <p>is logged in</p>;
}
