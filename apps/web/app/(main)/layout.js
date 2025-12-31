// apps/web/app/(main)/layout.js
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Full-width main */}
      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}
