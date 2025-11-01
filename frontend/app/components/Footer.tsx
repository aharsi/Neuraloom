import Link from "next/link";

export default function Footer() {
  return (
    <section className="py-8 bg-white/30 backdrop-blur-md border-t border-gray-200/50">
      <div className="container mx-auto px-6 text-center text-gray-600">
        <p className="mb-4">&copy; 2025 Neuraloom. All rights reserved.</p>
        <ul className="flex justify-center space-x-4">
          <li>
            <Link
              href="/privacy"
              className="hover:text-blue-600 transition-colors"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="hover:text-blue-600 transition-colors"
            >
              Terms
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
