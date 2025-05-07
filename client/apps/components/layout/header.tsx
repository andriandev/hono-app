import Link from "@/components/shared/link";

export default function Header() {
  const navLinks = [
    { title: "Login", link: "/auth/login" },
    { title: "Link", link: "/link" },
    { title: "Post", link: "/post" },
    { title: "Parse", link: "/parse" },
  ];

  return (
    <header>
      <nav className="flex flex-row flex-wrap gap-5">
        {navLinks.map((item) => (
          <Link
            key={item?.link}
            className="text-sky-500 hover:text-sky-600"
            href={item?.link}
          >
            {item?.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}
