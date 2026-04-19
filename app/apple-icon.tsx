import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(180deg, #f7f3eb 0%, #ece4d6 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: siteConfig.accentDark,
            borderRadius: 46,
            boxShadow: "0 18px 40px rgba(22,35,32,0.2)",
            display: "flex",
            height: 132,
            justifyContent: "center",
            width: 132,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(180deg, #fffdf8 0%, #f3ecde 100%)",
              borderRadius: 28,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              height: 96,
              justifyContent: "center",
              width: 96,
            }}
          >
            <div
              style={{
                color: siteConfig.accentDark,
                display: "flex",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              JR
            </div>
            <div
              style={{
                background: "rgba(15,118,110,0.18)",
                borderRadius: 999,
                display: "flex",
                height: 6,
                width: 48,
              }}
            />
            <div
              style={{
                background: "rgba(22,35,32,0.12)",
                borderRadius: 999,
                display: "flex",
                height: 5,
                width: 36,
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
