import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const PublicLayout = () => (
  <>
    <Navbar />
    <main className="pt-16">
      <Outlet />
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default PublicLayout;
