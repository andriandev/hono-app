import type { Metadata } from "next";
import { PostList } from "@/components/post/post-list";

export const metadata: Metadata = {
  title: "Post App List",
  description: "Post App List",
};

export default async function Post() {
  return (
    <>
      <h1 className="font-semi-bold text-2xl">Post App</h1>
      <PostList />
    </>
  );
}
