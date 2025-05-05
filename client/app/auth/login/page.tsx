import type { Metadata } from "next";
import FormLogin from "@/components/auth/form-login";

export const metadata: Metadata = {
  title: "Auth Login",
  description: "Auth Login",
};

export default async function Link() {
  return (
    <>
      <div className="mt-60 flex flex-col place-content-center place-items-center">
        <FormLogin />
      </div>
    </>
  );
}
