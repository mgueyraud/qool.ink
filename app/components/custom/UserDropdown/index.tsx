import { Form } from "@remix-run/react";
import {
  ChevronDown,
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui";

export function UserDropdown({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          {name}
          <ChevronDown className="ml-2" width={15} height={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onInteractOutside={() => setOpen(false)}
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Form method="post" action="/logout" className="w-full">
            <button
              type="submit"
              className="flex justify-between w-full items-center	"
            >
              <div className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </div>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
