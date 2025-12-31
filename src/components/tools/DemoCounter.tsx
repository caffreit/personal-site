'use client';

import React from "react";

export default function DemoCounter() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="inline-flex items-center gap-3 rounded-md border px-3 py-2">
      <span className="text-sm">Count: {count}</span>
      <button
        className="rounded bg-black px-2 py-1 text-white dark:bg-white dark:text-black"
        onClick={() => setCount((c) => c + 1)}
      >
        +1
      </button>
    </div>
  );
}


