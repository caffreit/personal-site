import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Portraits, Patterns, Opinions — Photo stories and interactive explainers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(140deg, #f5efe6 0%, #ede3d3 45%, #c8b8a8 100%)",
          color: "#1f1a17",
          padding: "72px",
          position: "relative",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "42px",
            border: "2px solid rgba(31, 26, 23, 0.28)",
          }}
        />
        <div
          style={{
            zIndex: 1,
            textAlign: "center",
            maxWidth: "88%",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "26px",
              lineHeight: 0.96,
            }}
          >
            Portraits, Patterns, Opinions
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 500,
              lineHeight: 1.3,
              opacity: 0.8,
            }}
          >
            Photo stories and interactive explainers
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "54px",
            fontSize: 24,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.65,
          }}
        >
          Portraits, Patterns, Opinions
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
