import type { Metadata } from "next";
import FormDownloader from "@/components/downloader/form-downloader";

export const metadata: Metadata = {
  title: "Downloader App",
  description: "Downloader App",
};

export default async function Downloader() {
  return (
    <>
      <h1 className="font-semi-bold text-2xl">Downloader App</h1>
      <FormDownloader />
    </>
  );
}
