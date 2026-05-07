import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 기반 자동 견적 플랫폼",
  description: "인테리어 AI 자동 견적 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider
          theme={{
            primaryColor: "dark",
            fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
            colors: {
              brand: [
                "#f0f4ff",
                "#dce4f5",
                "#b9c7e8",
                "#94a8db",
                "#758ed0",
                "#5f7ec9",
                "#5375c7",
                "#4363b1",
                "#3a589f",
                "#2e4b8e",
              ],
            },
            components: {
              Button: {
                defaultProps: {
                  radius: "md",
                },
              },
              Card: {
                defaultProps: {
                  radius: "lg",
                  shadow: "sm",
                },
              },
              TextInput: {
                defaultProps: {
                  radius: "md",
                },
              },
              Select: {
                defaultProps: {
                  radius: "md",
                },
              },
            },
          }}
        >
          <ModalsProvider>
            <Notifications position="top-right" />
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
