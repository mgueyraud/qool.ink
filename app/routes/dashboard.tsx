import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getUser, requireUserSession } from "~/models/auth";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { Separator } from "~/components/ui";
import { UserDropdown } from "~/components/custom";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserSession(request);
  invariant(userId, "A user id is needed");
  const user = await getUser(userId);

  return json({ user });
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <header className="flex justify-between">
        <div></div>
        <div className="p-4">
          <UserDropdown name={data.user?.name ?? ""} />
        </div>
      </header>
      <Separator />
    </div>
  );
}
