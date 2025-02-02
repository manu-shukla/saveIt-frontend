import Navbar from "./components/Navbar/Navbar";
import FileTable from "./components/Sections/FileTable/FileTable";
import UploadSection from "./components/Sections/Upload/UploadSection";

const App = () => {
  return (
    <div>
      <Navbar />
      <UploadSection />
      <FileTable/>
    </div>
  );
};

export default App;
