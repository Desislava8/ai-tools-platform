"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    setResponse("AI мисли...");
    
    setTimeout(() => {
      setResponse("Това е примерен AI отговор за: " + prompt);
    }, 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-6">
Платформа за AI инструменти 🚀
</h1>
<p className="text-gray-600 mb-6">
Добре дошли в платформата за споделяне на AI инструменти между екипите
</p>

      <input
        className="border p-3 w-96 rounded mb-4"
        placeholder="Напиши нещо..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        className="bg-black text-white px-6 py-2 rounded"
        onClick={handleSubmit}
      >
        Генерирай
      </button>

<div className="mt-6">
  <Link href="/add-tool">
    <button className="bg-blue-600 text-white px-6 py-2 rounded">
      Добави AI инструмент
    </button>
  </Link>
</div>

{response && (
        <div className="mt-6 p-4 border rounded w-96">
          {response}
        </div>
      )}
    </main>
  );
}