import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 shadow-footer dark:shadow-footer-dark text-primary dark:text-primary-dark">
      <div className="max-w-4xl mx-auto px-6 flex justify-between items-center text-center text-xs">
        <p>© {currentYear} Learn&Share. All rights reserved.</p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="transition-colors">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="#" className="transition-colors">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>
    </footer>
  );
}
