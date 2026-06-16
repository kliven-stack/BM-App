import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blend Mode — Digital Growth Agency";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1120 0%, #1a0f0c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #e67e64, #cb4530)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            ✕
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>Blend Mode</div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Explode your visibility
          <br />
          on Google.
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#cbd5e1" }}>
          SEO · Google Ads · CRO · Automation — traffic that becomes sales.
        </div>
      </div>
    ),
    { ...size },
  );
}
