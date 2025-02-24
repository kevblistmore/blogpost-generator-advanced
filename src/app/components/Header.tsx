import Link from 'next/link';

export default function Header() {
  return (
    <header className="absolute top-0 right-0 z-50">
      <div className="px-4 py-3 flex justify-end items-center gap-6">
        <nav className="flex gap-6">
          <Link href="#" className="text-[#0FA4AF] hover:text-[#AFDDE5] font-light tracking-wide">
            About Us
          </Link>
          <Link href="#" className="text-[#0FA4AF] hover:text-[#AFDDE5] font-light tracking-wide">
            Contact
          </Link>
        </nav>
        <div className="flex gap-4">
          <button className="px-3 py-1 bg-[#024950] text-[#AFDDE5] rounded-md hover:bg-[#0FA4AF] text-sm font-light tracking-wider">
            Login
          </button>
          <button className="px-3 py-1 bg-[#964734] text-white rounded-md hover:bg-[#0FA4AF] text-sm font-light tracking-wider">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}