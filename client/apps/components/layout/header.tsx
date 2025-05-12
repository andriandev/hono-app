import Navbar from "@/components/layout/navbar";

export type NavLink = {
  title: string;
  link: string;
};

export default function Header() {
  const navLinks: NavLink[] = [
    { title: "Login", link: "/auth/login" },
    { title: "Link", link: "/link" },
    { title: "Post", link: "/post" },
    { title: "Parse", link: "/parse" },
    { title: "Downloader", link: "/downloader" },
  ];

  return (
    <header>
      <Navbar data={navLinks} />
    </header>
  );
}
