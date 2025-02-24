export default function Footer() {
  return (
    <footer className="bg-dark-teal-2 text-light-teal py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Powered by Kevin shah</p>
        <nav className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Us</a>
        </nav>
      </div>
    </footer>
  );
} 