"use client";

import { useState } from "react";
import { SITE_SERVICE_URL } from "@/config/setting";
import { formatDateTime, copyToClipboard } from "@/helpers/function";
import {
  fetchLinkCreate,
  fetchLinkDelete,
  fetchLinkUpdate,
} from "@/helpers/fetch";
import Modal from "@/components/shared/modal";
import { toast } from "@/components/shared/toast";

type Link = {
  id: number;
  alias: string;
  destination: string;
  view: number;
  created_at: string;
};

type Props = {
  data: Link[];
  onLinkChange: () => void;
};

export default function TableLink({ data, onLinkChange }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
  });
  const [formData, setFormData] = useState({
    originalAlias: "",
    alias: "",
    destination: "",
  });
  const [message, setMessage] = useState({
    alias: "",
    destination: "",
    error: "",
  });

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage({ alias: "", destination: "", error: "" });
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUpdateLink() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const result = await fetchLinkUpdate(
      formData,
      `/link/${formData.originalAlias}`,
      token,
    );
    if (result?.status !== 200) {
      if (typeof result?.message == "object") {
        setMessage({
          alias: result.message?.alias,
          destination: result.message?.destination,
          error: "",
        });
      } else {
        setMessage({
          alias: "",
          destination: "",
          error: result?.message,
        });
      }
      setIsLoading(false);
      return;
    }
    toast({
      message: "Shortlink updated",
      type: "info",
    });
    setIsLoading(false);
    setModal({ isOpen: false, type: "" });
    onLinkChange();
  }

  async function handleDeleteLink() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const result = await fetchLinkDelete(
      `/link/${formData.originalAlias}`,
      token,
    );
    if (result?.status !== 200) {
      if (typeof result?.message == "object") {
        setMessage({
          alias: result.message?.alias,
          destination: result.message?.destination,
          error: "",
        });
      } else {
        setMessage({
          alias: "",
          destination: "",
          error: result?.message,
        });
      }
      setIsLoading(false);
      return;
    }
    toast({
      message: "Shortlink deleted",
      type: "warning",
    });
    setIsLoading(false);
    setModal({ isOpen: false, type: "" });
    onLinkChange();
  }

  async function handleCreateLink() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const result = await fetchLinkCreate(formData, `/link`, token);
    if (result?.status !== 200) {
      if (typeof result?.message == "object") {
        setMessage({
          alias: result.message?.alias,
          destination: result.message?.destination,
          error: "",
        });
      } else {
        setMessage({
          alias: "",
          destination: "",
          error: result?.message,
        });
      }
      setIsLoading(false);
      return;
    }
    toast({
      message: "Shortlink created",
      type: "success",
    });
    setIsLoading(false);
    setModal({ isOpen: false, type: "" });
    onLinkChange();
  }

  return (
    <>
      <button
        onClick={() => {
          setFormData({
            originalAlias: "",
            alias: "",
            destination: "",
          });
          setModal({ isOpen: true, type: "create" });
          setMessage({
            alias: "",
            destination: "",
            error: "",
          });
        }}
        className="mb-5 rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700"
      >
        Create Link
      </button>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-auto rounded-xl border border-slate-600 text-center whitespace-nowrap shadow-sm">
          <thead className="bg-slate-700 text-center">
            <tr>
              <th className="px-4 py-2">Alias</th>
              <th className="px-4 py-2">Destination</th>
              <th className="px-4 py-2">View</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((link) => (
              <tr
                className="border-t border-slate-700 hover:bg-slate-800"
                key={link.id}
              >
                <td className="px-4 py-2">
                  <a
                    className="text-indigo-500 hover:text-indigo-600"
                    href={`${SITE_SERVICE_URL}/${link.alias}`}
                    onClick={(e) => {
                      e.preventDefault();
                      copyToClipboard(e.currentTarget.href);
                    }}
                  >
                    {link.alias}
                  </a>
                </td>
                <td className="max-w-[25ch] truncate overflow-hidden px-4 py-2 md:max-w-[15ch]">
                  {link.destination}
                </td>
                <td className="px-4 py-2">{link.view}</td>
                <td className="px-4 py-2">{formatDateTime(link.created_at)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => {
                      setModal({ isOpen: true, type: "edit" });
                      setFormData({
                        originalAlias: link.alias,
                        alias: link.alias,
                        destination: link.destination,
                      });
                    }}
                    className="mr-3 rounded-lg bg-indigo-600 px-4 py-1 hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setModal({ isOpen: true, type: "delete" });
                      setFormData({
                        originalAlias: link.alias,
                        alias: link.alias,
                        destination: link.destination,
                      });
                    }}
                    className="rounded-lg bg-rose-600 px-4 py-1 hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal.isOpen && modal.type == "create" ? true : false}
        onClose={() => {
          setModal({ isOpen: false, type: "" });
          setMessage({ alias: "", destination: "", error: "" });
        }}
        title="Create Link"
        footer={
          <button
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-indigo-700"
            onClick={handleCreateLink}
          >
            Save
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input type="checkbox" id="toggle-alias" className="peer hidden" />
          <label
            htmlFor="toggle-alias"
            className="cursor-pointer text-indigo-400 select-none"
          >
            Custom Alias
          </label>
          <input
            name="alias"
            type="text"
            className="hidden w-full rounded-lg border-0 bg-slate-800 p-1.5 peer-checked:block focus:outline-none disabled:opacity-75"
            placeholder="Alias"
            value={formData.alias}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
          />
          {message?.alias ? (
            <p className="text-sm text-red-500">{message?.alias}</p>
          ) : (
            ""
          )}
          <input
            name="destination"
            type="text"
            className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75"
            placeholder="Destination"
            value={formData.destination}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
            required
          />
          {message?.destination ? (
            <p className="text-sm text-red-500">{message?.destination}</p>
          ) : (
            ""
          )}
          {message?.error ? (
            <p className="text-center text-sm text-red-500">{message?.error}</p>
          ) : (
            ""
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modal.isOpen && modal.type == "edit" ? true : false}
        onClose={() => {
          setModal({ isOpen: false, type: "" });
          setMessage({ alias: "", destination: "", error: "" });
        }}
        title="Edit Link"
        footer={
          <button
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-indigo-700"
            onClick={handleUpdateLink}
          >
            Save
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input
            name="alias"
            type="text"
            className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75"
            placeholder="Alias"
            value={formData.alias}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
            required
          />
          {message?.alias ? (
            <p className="text-sm text-red-500">{message?.alias}</p>
          ) : (
            ""
          )}
          <input
            name="destination"
            type="text"
            className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75"
            placeholder="Alias"
            value={formData.destination}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
            required
          />
          {message?.destination ? (
            <p className="text-sm text-red-500">{message?.destination}</p>
          ) : (
            ""
          )}
          {message?.error ? (
            <p className="text-center text-sm text-red-500">{message?.error}</p>
          ) : (
            ""
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modal.isOpen && modal.type == "delete" ? true : false}
        onClose={() => setModal({ isOpen: false, type: "" })}
        title="Delete Link"
        footer={
          <button
            disabled={isLoading}
            className="rounded-md bg-rose-600 px-3 py-1.5 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-rose-700"
            onClick={handleDeleteLink}
          >
            Delete
          </button>
        }
      >
        Are you sure want to delete shortlink alias {formData.alias} ?
        {message?.error ? (
          <p className="mt-3 text-center text-sm text-red-500">
            {message?.error}
          </p>
        ) : (
          ""
        )}
      </Modal>
    </>
  );
}
