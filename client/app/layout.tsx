import { Poppins } from "next/font/google";
import Header from "@/components/layout/header";
import Main from "@/components/layout/main";
import Footer from "@/components/layout/footer";
import ToastProvider from "@/components/global/toast-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export async function generateMetadata() {
  return {
    title: "Client App",
    description: "Client for hono app",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`antialiased`}>
        <Header />
        <Main>
          {children}
          <ToastProvider />
        </Main>
        <Footer />
      </body>
    </html>
  );
}
