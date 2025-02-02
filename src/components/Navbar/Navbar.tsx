import { FaGithub } from "react-icons/fa"

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md">
      <div className="text-4xl font-bold">saveIt</div>
      <div className="flex space-x-4">
        <a
          href="https://github.com/manu-shukla"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400"
        >
          <FaGithub size={24} />
        </a>
      </div>
    </nav>
  )
}

export default Navbar