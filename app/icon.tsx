import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at top left, rgba(15,118,110,0.34), transparent 38%), linear-gradient(180deg, #f6f2e8 0%, #e7decd 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            background: siteConfig.accentDark,
            borderRadius: 116,
            boxShadow: "0 32px 70px rgba(22,35,32,0.24)",
            display: "flex",
            height: 360,
            overflow: "hidden",
            padding: 28,
            position: "relative",
            width: 360,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #fffdf8 0%, #f3ecde 100%)",
              borderRadius: 64,
              display: "flex",
              flex: 1,
              flexDirection: "column",
              gap: 18,
              padding: "52px 44px 40px",
              position: "relative",
            }}
          >
            <div
              style={{
                background: "#d3a33f",
                borderBottomLeftRadius: 34,
                borderTopRightRadius: 64,
                height: 74,
                position: "absolute",
                right: 0,
                top: 0,
                width: 82,
              }}
            />
            <div
              style={{
                color: siteConfig.accentDark,
                display: "flex",
                fontSize: 116,
                fontWeight: 800,
                letterSpacing: -8,
                lineHeight: 1,
              }}
            >
              JR
            </div>
            <div
              style={{
                background: "rgba(15,118,110,0.16)",
                borderRadius: 999,
                display: "flex",
                height: 18,
                width: 176,
              }}
            />
            <div
              style={{
                background: "rgba(22,35,32,0.12)",
                borderRadius: 999,
                display: "flex",
                height: 14,
                width: 132,
              }}
            />
            <div
              style={{
                background: "rgba(22,35,32,0.12)",
                borderRadius: 999,
                display: "flex",
                height: 14,
                width: 188,
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
