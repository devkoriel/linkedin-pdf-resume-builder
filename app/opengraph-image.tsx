import { ImageResponse } from "next/og";

import { siteConfig, sitePreviewAlt } from "@/lib/site";

export const alt = sitePreviewAlt;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "radial-gradient(circle at top left, rgba(15,118,110,0.26), transparent 32%), radial-gradient(circle at 88% 20%, rgba(211,163,63,0.2), transparent 20%), linear-gradient(180deg, #f5f1e8 0%, #e6decf 100%)",
          color: siteConfig.accentDark,
          display: "flex",
          height: "100%",
          padding: "48px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.72)",
            borderRadius: 34,
            boxShadow: "0 30px 90px rgba(22,35,32,0.16)",
            display: "flex",
            flex: 1,
            overflow: "hidden",
            padding: "38px 42px",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1.15,
              flexDirection: "column",
              justifyContent: "space-between",
              paddingRight: 24,
            }}
          >
            <div
              style={{
                color: siteConfig.accentColor,
                display: "flex",
                fontFamily: "sans-serif",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              LinkedIn PDF to JSON Resume
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                marginTop: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "Georgia, serif",
                  fontSize: 64,
                  fontWeight: 700,
                  letterSpacing: -2,
                  lineHeight: 1.02,
                }}
              >
                Build an ATS-safe resume from a LinkedIn export.
              </div>
              <div
                style={{
                  color: "#4a5a54",
                  display: "flex",
                  fontFamily: "sans-serif",
                  fontSize: 28,
                  lineHeight: 1.45,
                  maxWidth: 620,
                }}
              >
                Upload the PDF, edit each field in a guided form, then export a
                polished resume PDF in a globally standardized format.
              </div>
            </div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: 14,
                marginTop: 28,
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  background: siteConfig.accentDark,
                  borderRadius: 999,
                  color: "white",
                  display: "flex",
                  fontFamily: "sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  height: 54,
                  justifyContent: "center",
                  padding: "0 22px",
                }}
              >
                resumebuilder.koriel.kr
              </div>
              <div
                style={{
                  color: "#4a5a54",
                  display: "flex",
                  fontFamily: "sans-serif",
                  fontSize: 22,
                }}
              >
                Built by Jinsoo Heo / devkoriel
              </div>
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              flex: 0.85,
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #162320 0%, #243631 100%)",
                borderRadius: 28,
                display: "flex",
                height: 460,
                padding: 18,
                width: 360,
              }}
            >
              <div
                style={{
                  background: "linear-gradient(180deg, #fffdf8 0%, #f7f0e3 100%)",
                  borderRadius: 20,
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  gap: 12,
                  padding: "30px 26px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    background: "#d3a33f",
                    borderBottomLeftRadius: 24,
                    borderTopRightRadius: 20,
                    height: 54,
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: 60,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      color: siteConfig.accentDark,
                      display: "flex",
                      fontFamily: "Georgia, serif",
                      fontSize: 34,
                      fontWeight: 700,
                    }}
                  >
                    Alex Morgan
                  </div>
                  <div
                    style={{
                      color: "#5f6d67",
                      display: "flex",
                      fontFamily: "sans-serif",
                      fontSize: 16,
                    }}
                  >
                    DevOps Engineer
                  </div>
                </div>
                <div
                  style={{
                    background: siteConfig.accentDark,
                    borderRadius: 999,
                    display: "flex",
                    height: 4,
                    marginTop: 8,
                    width: "100%",
                  }}
                />
                {[
                  "TECHNICAL SKILLS",
                  "PROFESSIONAL EXPERIENCE",
                  "EDUCATION",
                ].map((label, index) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginTop: index === 0 ? 8 : 0,
                    }}
                  >
                    <div
                      style={{
                        color: siteConfig.accentDark,
                        display: "flex",
                        fontFamily: "sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 1.6,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        background: "rgba(22,35,32,0.08)",
                        borderRadius: 999,
                        display: "flex",
                        height: 8,
                        width: index === 0 ? "82%" : "100%",
                      }}
                    />
                    <div
                      style={{
                        background: "rgba(22,35,32,0.08)",
                        borderRadius: 999,
                        display: "flex",
                        height: 8,
                        width: index === 1 ? "94%" : "70%",
                      }}
                    />
                    <div
                      style={{
                        background: "rgba(22,35,32,0.08)",
                        borderRadius: 999,
                        display: "flex",
                        height: 8,
                        width: index === 1 ? "88%" : "64%",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
