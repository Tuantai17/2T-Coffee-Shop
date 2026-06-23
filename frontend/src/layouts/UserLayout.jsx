import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function UserLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <main className="flex-grow-1 pb-5">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
