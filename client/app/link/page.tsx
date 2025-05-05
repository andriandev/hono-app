import type { Metadata } from "next";
import { LinkList } from "@/components/link/link-list";

export const metadata: Metadata = {
  title: "Link App List",
  description: "Link App List",
};

export default async function Link() {
  return (
    <>
      <h1 className="font-semi-bold text-2xl">Link App</h1>
      <LinkList />
    </>
  );
}
