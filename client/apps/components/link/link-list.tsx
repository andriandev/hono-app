"use client";

import { useState, useEffect } from "react";
import { fetchLinkData } from "@/helpers/fetch";
import TableLink from "@/components/link/link-table";
import Pagination from "@/components/shared/pagination";

export function LinkList() {
  const [isLoading, setIsLoading] = useState(true);
  const [linkData, setLinkData] = useState({
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

      fetchLinkData(`/link/all?limit=${limit}&offset=${offset}`, token).then(
        (result) => {
          if (result.status !== 200) {
            setStatusCode(result.status);
            return;
          }
          setLinkData({
            data: result.data.links,
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
            <TableLink
              data={linkData.data}
              onLinkChange={() => setReload((prev) => !prev)}
            />
            <Pagination
              currentPage={linkData.paging.current_page}
              totalPages={linkData.paging.total_pages}
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
