import type { Metadata } from "next";
import FormParse from "@/components/parse/form-parse";

export const metadata: Metadata = {
  title: "Parse Link",
  description: "Parse Link",
};

export default async function Link() {
  return (
    <>
      <h1 className="font-semi-bold text-2xl">Parse Link</h1>
      <FormParse />
    </>
  );
}
