"use client";

import { useState } from "react";
import { SITE_SERVICE_URL } from "@/config/setting";
import {
  formatDateTime,
  htmlToTextAreaContent,
  copyToClipboard,
} from "@/helpers/function";
import {
  fetchPostCreate,
  fetchPostDelete,
  fetchPostUpdate,
} from "@/helpers/fetch";
import Modal from "@/components/shared/modal";
import { toast } from "@/components/shared/toast";

export enum PostStatus {
  Draf = "draf",
  Publish = "publish",
}

type Post = {
  id: number;
  hash_id: string;
  title: string;
  status: PostStatus;
  content: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  data: Post[];
  onPostChange: () => void;
};

export default function TablePost({ data, onPostChange }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
  });
  const [formData, setFormData] = useState({
    hash_id: "",
    title: "",
    status: "",
    content: "",
  });
  const [message, setMessage] = useState({
    title: "",
    status: "",
    content: "",
    error: "",
  });

  function handleChangeInput(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setMessage({ title: "", status: "", content: "", error: "" });
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUpdatePost() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const result = await fetchPostUpdate(
      formData,
      `/post/${formData.hash_id}`,
      token,
    );
    if (result?.status !== 200) {
      if (typeof result?.message == "object") {
        setMessage({
          title: result.message.title,
          status: result.message.status,
          content: result.message.content,
          error: "",
        });
      } else {
        setMessage({
          title: "",
          status: "",
          content: "",
          error: result.message,
        });
      }
      setIsLoading(false);
      return;
    }
    toast({
      message: "Post updated",
      type: "info",
    });
    setIsLoading(false);
    setModal({ isOpen: false, type: "" });
    onPostChange();
  }

  async function handleDeletePost() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const result = await fetchPostDelete(`/post/${formData.hash_id}`, token);
    if (result?.status !== 200) {
      setMessage({
        title: "",
        status: "",
        content: "",
        error: result.message,
      });
      setIsLoading(false);
      return;
    }
    toast({
      message: "Post deleted",
      type: "warning",
    });
    setIsLoading(false);
    setModal({ isOpen: false, type: "" });
    onPostChange();
  }

  async function handleCreatePost() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const result = await fetchPostCreate(formData, `/post`, token);
    if (result?.status !== 200) {
      if (typeof result?.message == "object") {
        setMessage({
          title: result.message.title,
          status: result.message.status,
          content: result.message.content,
          error: "",
        });
      } else {
        setMessage({
          title: "",
          status: "",
          content: "",
          error: result.message,
        });
      }
      setIsLoading(false);
      return;
    }
    toast({
      message: "Post created",
      type: "success",
    });
    setIsLoading(false);
    setModal({ isOpen: false, type: "" });
    onPostChange();
  }

  return (
    <>
      <button
        onClick={() => {
          setFormData({
            hash_id: "",
            title: "",
            status: "publish",
            content: "",
          });
          setModal({ isOpen: true, type: "create" });
          setMessage({
            title: "",
            status: "",
            content: "",
            error: "",
          });
        }}
        className="mb-5 rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700"
      >
        Create Post
      </button>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-auto rounded-xl border border-slate-600 text-center whitespace-nowrap shadow-sm">
          <thead className="bg-slate-700 text-center">
            <tr>
              <th className="px-4 py-2">Hash Id</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Updated At</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((post) => (
              <tr
                className="border-t border-slate-700 hover:bg-slate-800"
                key={post.id}
              >
                <td className="px-4 py-2">
                  <a
                    className="text-indigo-500 hover:text-indigo-600"
                    href={`${SITE_SERVICE_URL}/post/${post.hash_id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      copyToClipboard(e.currentTarget.href);
                    }}
                  >
                    {post.hash_id}
                  </a>
                </td>
                <td className="max-w-[25ch] truncate overflow-hidden px-4 py-2 md:max-w-[15ch]">
                  {post.title}
                </td>
                <td className="px-4 py-2">{post.status}</td>
                <td className="px-4 py-2">{formatDateTime(post.created_at)}</td>
                <td className="px-4 py-2">{formatDateTime(post.updated_at)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => {
                      setModal({ isOpen: true, type: "edit" });
                      setFormData({
                        hash_id: post.hash_id,
                        title: post.title,
                        status: post.status,
                        content: htmlToTextAreaContent(post.content),
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
                        hash_id: post.hash_id,
                        title: post.title,
                        status: "",
                        content: "",
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
          setMessage({ title: "", status: "", content: "", error: "" });
        }}
        title="Create Post"
        footer={
          <button
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-indigo-700"
            onClick={handleCreatePost}
          >
            Save
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input
            name="title"
            type="text"
            className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75"
            placeholder="Title"
            value={formData.title}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
          />
          {message?.title ? (
            <p className="text-sm text-red-500">{message.title}</p>
          ) : (
            ""
          )}
          <select
            name="status"
            className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none"
            value={formData.status}
            onChange={handleChangeInput}
            disabled={isLoading}
          >
            <option value="publish">Publish</option>
            <option value="draf">Draf</option>
          </select>
          {message?.status ? (
            <p className="text-sm text-red-500">{message?.status}</p>
          ) : (
            ""
          )}
          <textarea
            name="content"
            className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75"
            value={formData.content}
            onChange={handleChangeInput}
            rows={13}
            placeholder="Content"
          >
            {formData.content}
          </textarea>
          {message?.content ? (
            <p className="text-sm text-red-500">{message?.content}</p>
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
          setMessage({ title: "", status: "", content: "", error: "" });
        }}
        title="Edit Post"
        footer={
          <button
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-indigo-700"
            onClick={handleUpdatePost}
          >
            Save
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input
            name="title"
            type="text"
            className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75"
            placeholder="Title"
            value={formData.title}
            onChange={handleChangeInput}
            disabled={isLoading}
            autoComplete="off"
          />
          {message?.title ? (
            <p className="text-sm text-red-500">{message.title}</p>
          ) : (
            ""
          )}
          <select
            name="status"
            className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none"
            value={formData.status}
            onChange={handleChangeInput}
            disabled={isLoading}
          >
            <option value="publish">Publish</option>
            <option value="draf">Draf</option>
          </select>
          {message?.status ? (
            <p className="text-sm text-red-500">{message?.status}</p>
          ) : (
            ""
          )}
          <textarea
            name="content"
            className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75"
            value={formData.content}
            onChange={handleChangeInput}
            rows={13}
            placeholder="Content"
          >
            {formData.content}
          </textarea>
          {message?.content ? (
            <p className="text-sm text-red-500">{message?.content}</p>
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
        title="Delete Post"
        footer={
          <button
            disabled={isLoading}
            className="rounded-md bg-rose-600 px-3 py-1.5 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-rose-700"
            onClick={handleDeletePost}
          >
            Delete
          </button>
        }
      >
        Are you sure want to delete post {formData.title} ?
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
