import { redirect } from "next/navigation";

// Landing on the site sends the user straight to the login screen.
export default function Page() {
  redirect("/login");
}
