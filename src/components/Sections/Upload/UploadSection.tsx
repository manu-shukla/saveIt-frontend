import { Button } from "@/components/ui/button";
import {  useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRef, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const UploadSection = () => {
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8080/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      window.location.reload();
      toast({
         variant: "default",
         title: "File Uploaded Successfully",
         duration: 3000,
       });
    } catch (error: any) {
      console.error("Upload failed", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.response.data,
        });
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow">
      <h2 className="text-lg font-semibold">All Files</h2>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white"
        >
          {loading ? (
            <>
           <ClipLoader color="white" size={24}/>
           Uploading
            </>
          ) : (
            <>
              <FaUpload /> Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadSection;
