"use client";

import { useState } from "react";
import { SITE_DOWNLOADER_URL } from "@/config/setting";
import { toast } from "@/components/shared/toast";

type MediaOption = {
  type: "audio" | "video";
  process: "direct" | "queue";
};

export default function FormDownloader() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    quality: "360p",
    format: "mp4",
  });
  const [option, setOption] = useState<MediaOption>({
    type: "video",
    process: "queue",
  });
  const [message, setMessage] = useState({
    url: "",
    quality: "",
    format: "",
  });
  const [data, setData] = useState({
    size: "",
    quality: "",
    format: "",
    link: "",
  });

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setMessage({ url: "", quality: "", format: "" });
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleChangeOptionInput(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name == "type") {
      if (value == "video") {
        setFormData((prev) => ({ ...prev, quality: "360p", format: "mp4" }));
      } else {
        setFormData((prev) => ({ ...prev, quality: "5", format: "mp3" }));
      }
    }

    setOption((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setData({
      size: "",
      quality: "",
      format: "",
      link: "",
    });
    try {
      setIsLoading(true);
      let path: string = "";

      if (
        formData.url.includes("youtube.com") ||
        formData.url.includes("youtu.be")
      ) {
        path = "/yt";
      }

      path = path + "/" + option.type;
      path = option.process == "queue" ? path + "-queue" : path + "";
      path = `${path}?url=${formData.url}&quality=${formData.quality}&format=${formData.format}`;

      const res = await fetch(SITE_DOWNLOADER_URL + path);
      const result = await res.json();

      if (result.status === 202) {
        toast({
          message: result.message,
          type: "info",
        });
        return;
      }

      if (result.status !== 200) {
        if (typeof result.message === "object") {
          setMessage((prev) => ({ ...prev, ...result.message }));
        } else {
          toast({
            message: result.message,
            type: "error",
          });
        }
        return;
      }

      setData(result.data);
      toast({
        message: `Generate ${option.type} success`,
        type: "success",
      });
    } catch (err) {
      const error = err as Error;
      toast({
        message: error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        className="my-5 grid grid-cols-1 gap-3 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <input
          name="url"
          type="text"
          className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none disabled:opacity-75 md:col-span-2"
          placeholder="Url"
          value={formData.url}
          onChange={handleChangeInput}
          disabled={isLoading}
          autoComplete="off"
          required
        />
        <select
          name="type"
          className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none disabled:opacity-75"
          value={option.type}
          onChange={handleChangeOptionInput}
          disabled={isLoading}
        >
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>
        <select
          name="process"
          className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none disabled:opacity-75"
          value={option.process}
          onChange={handleChangeOptionInput}
          disabled={isLoading}
        >
          <option value="queue">Queue</option>
          <option value="direct">Direct</option>
        </select>

        {option.type == "video" ? (
          <>
            {formData.url.includes("youtube.com") ||
            formData.url.includes("youtu.be") ||
            formData.url == "" ? (
              <select
                name="quality"
                className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none disabled:opacity-75"
                value={formData.quality}
                onChange={handleChangeInput}
                disabled={isLoading}
              >
                <option value="360p">360p</option>
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            ) : (
              ""
            )}
            <select
              name="format"
              className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none disabled:opacity-75"
              value={formData.format}
              onChange={handleChangeInput}
              disabled={isLoading}
            >
              <option value="mp4">Mp4</option>
              <option value="mkv">Mkv</option>
            </select>
          </>
        ) : (
          <>
            <select
              name="quality"
              className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none disabled:opacity-75"
              value={formData.quality}
              onChange={handleChangeInput}
              disabled={isLoading}
            >
              <option value="0">320 kbps</option>
              <option value="5">160 kbps</option>
              <option value="9">64 kbps</option>
            </select>
            <select
              name="format"
              className="w-full appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-white focus:outline-none disabled:opacity-75"
              value={formData.format}
              onChange={handleChangeInput}
              disabled={isLoading}
            >
              <option value="mp3">Mp3</option>
              <option value="m4a">M4a</option>
              <option value="flac">Flac</option>
              <option value="opus">Opus</option>
            </select>
          </>
        )}

        <button
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:bg-indigo-700 md:col-span-2"
          type="submit"
        >
          Generate {option.type}
        </button>
      </form>

      {Object.entries(message).map((message, i) => {
        if (!message[1]) return;
        return (
          <p key={i} className="text-red-500 capitalize">
            {message[0]} : {message[1]}
          </p>
        );
      })}

      {Object.entries(data).map((item, i) => {
        if (!item[1]) return;
        if (item[0] == "link") {
          return (
            <p className="capitalize" key={i}>
              {item[0]} :{" "}
              <a
                className="text-indigo-400 hover:text-indigo-500"
                href={item[1]}
              >
                Download
              </a>
            </p>
          );
        }
        return (
          <p className="capitalize" key={i}>
            {item[0]} : {item[1]}
          </p>
        );
      })}

      <div className="mt-5">
        <p>Supported sites youtube, tiktok, facebook, instagram.</p>
      </div>
    </>
  );
}
