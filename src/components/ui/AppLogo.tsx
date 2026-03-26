import Image from "next/image";
import Link from "next/link";

const AppLogo = () => {
  return (
    <Link
      href="/"
      className="mb-10 flex flex-col items-center gap-2 group transition-transform hover:scale-105"
    >
      <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-all duration-300">
        <Image src="/app-logo512x512-4.png" width={40} height={40} alt="Logo" />
      </div>
      <span className="text-xl font-black tracking-tighter uppercase">
        Golf<span className="text-primary">Giving</span>
      </span>
    </Link>
  );
};

export default AppLogo;
