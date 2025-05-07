"use client";

import { useState } from "react";
import {
  parseLinks,
  getLinksByQuality,
  formatQualityResult,
  getAvailableQualities,
  copyToClipboard,
} from "@/helpers/function";
import { toast } from "@/components/shared/toast";

export default function FormParse() {
  const [data, setData] = useState("");
  const [result, setResult] = useState("");
  const [quality, setQuality] = useState("ALL");
  const [qualityList, setQualityList] = useState(["ALL"]);

  function handleParse() {
    const linkObj = parseLinks(data);
    const linkByQualityObj = getLinksByQuality(linkObj, quality);
    const linkByQuality = formatQualityResult(linkByQualityObj);
    const qualityAvailable = getAvailableQualities(linkObj);

    if (linkByQuality) {
      toast({
        message: "Parse link success",
        type: "success",
      });
    } else {
      setQuality("ALL");
      setQualityList(["ALL"]);
      toast({
        message: "Parse link failed",
        type: "error",
      });
    }

    setQualityList(qualityAvailable);
    setResult(linkByQuality);
  }

  function handleCopy() {
    copyToClipboard(result);
  }

  return (
    <>
      <div className="scrollbar-thin scrollbar-thumb mt-5 flex flex-col justify-center gap-5">
        <textarea
          className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none"
          onChange={(e) => setData(e.target.value)}
          value={data}
          rows={12}
        ></textarea>
        <div className="flex flex-row justify-center gap-5">
          <button
            className="rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700 disabled:cursor-not-allowed"
            onClick={handleParse}
          >
            Parse
          </button>
          <select
            className="w-fit appearance-none rounded-lg bg-slate-800 p-2 pr-10 text-center focus:outline-none"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
          >
            {qualityList.map((quality, i) => (
              <option key={i} value={quality}>
                {quality}
              </option>
            ))}
          </select>
          <button
            className="rounded-md bg-indigo-600 px-3 py-1.5 hover:bg-indigo-700 disabled:cursor-not-allowed"
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
        <textarea
          className="w-full rounded-lg border-0 bg-slate-800 p-1.5 focus:outline-none"
          onChange={(e) => setResult(e.target.value)}
          value={result}
          rows={12}
        ></textarea>
      </div>
    </>
  );
}
