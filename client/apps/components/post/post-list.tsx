"use client";

import { useState, useEffect } from "react";
import { fetchPostData } from "@/helpers/fetch";
import TablePost from "@/components/post/post-table";
import Pagination from "@/components/shared/pagination";

export function PostList() {
  const [isLoading, setIsLoading] = useState(true);
  const [postData, setPostData] = useState({
    data: [],
    paging: { current_page: 1, total_links: 0, total_pages: 0 },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [reload, setReload] = useState(false);
  const [statusCode, setStatusCode] = useState(200);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token") || "";
      const limit = 10;
      const offset = (currentPage - 1) * limit;

      if (!token) {
        setStatusCode(401);
        return;
      }

      fetchPostData(`/post/all?limit=${limit}&offset=${offset}`, token).then(
        (result) => {
          if (result.status !== 200) {
            setStatusCode(result.status);
            return;
          }
          setPostData({
            data: result.data.posts,
            paging: result.data.paging,
          });
          setIsLoading(false);
        },
      );
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      setIsLoading(false);
    }
  }, [currentPage, reload]);

  if (statusCode === 401) {
    return <p className="mt-5">You cannot access this page !</p>;
  }

  return (
    <>
      <div className="mt-5">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <TablePost
              data={postData.data}
              onPostChange={() => setReload((prev) => !prev)}
            />
            <Pagination
              currentPage={postData.paging.current_page}
              totalPages={postData.paging.total_pages}
              onPageChange={(page) => {
                setIsLoading(true);
                setCurrentPage(page);
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
