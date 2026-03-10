import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CertiRecicla — Certificados de reciclaje con CO₂ verificable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #f4f7f4 0%, #ebe7df 50%, #f4f7f4 100%)",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#5a7d5e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "28px",
            }}
          >
            CR
          </div>
          <span style={{ fontSize: "40px", fontWeight: 700, color: "#2d3a2e" }}>
            CertiRecicla
          </span>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#5a7d5e",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Certificados de reciclaje con CO₂ verificable para gestoras en Chile
        </div>
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "48px",
            fontSize: "16px",
            color: "#7c9a82",
          }}
        >
          <span>GHG Protocol</span>
          <span>Ley REP</span>
          <span>SINADER</span>
          <span>ISO 14064</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
