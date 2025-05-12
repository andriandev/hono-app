import Link from "@/components/shared/link";
import { NavLink } from "@/components/layout/header";

export default function Navbar({ data }: { data: NavLink[] }) {
  return (
    <nav className="flex flex-row flex-wrap gap-5">
      {data.map((item) => (
        <Link
          key={item?.link}
          className="text-sky-500 hover:text-sky-600"
          href={item?.link}
        >
          {item?.title}
        </Link>
      ))}
    </nav>
  );
}
