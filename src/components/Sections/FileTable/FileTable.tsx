import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  FaDownload,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { CgUnavailable } from "react-icons/cg";

import axios from "axios";

import { useToast } from "@/hooks/use-toast";
import { File } from "@/types/FileType";
import { SortConfig, SortDirection, SortKey } from "@/types/TableType";
import { ClipLoader } from "react-spinners";

const FileTable = () => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const [files, setFiles] = useState<File[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    getData();
  }, []);

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
        getData();
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
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  

  const getData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/files/all");
      const fileResponse: File[] = response.data;
      console.log(fileResponse);
      setFiles(
        fileResponse.map((file) => ({
          id: file.id,
          filename: file.filename,
          contentType: file.contentType.split("/")[1].toUpperCase(),
          size: (parseInt(file.size) / 1000000).toFixed(2),
          uploadDate: new Date(file.uploadDate).toUTCString(),
          downloadUrl: file.downloadUrl,
        }))
      );
    } catch (error: any) {
      console.error("Failed to fetch data", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.response.data,
        duration: 3000,
      });
    }
  };

  const handleDelete = (fileId: string, index: any) => {
    const response = confirm("Are you sure you want to delete this file?");
    if (!response) return;
    axios
      .delete(`http://localhost:8080/files/${fileId}`)
      .then(() => {
        toast({
          variant: "default",
          title: "File Deleted Successfully",
          duration: 3000,
        });
        setFiles(files.filter((_, i) => i !== index));
      })
      .catch((error: any) => {
        console.error("Failed to delete file", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.response.data,
          duration: 3000,
        });
      });
  };

  const handleSort = (clickedKey: keyof File) => {
    const newDirection: SortDirection =
      sortConfig.key === clickedKey && sortConfig.direction === "asc"
        ? "desc"
        : "asc";

    setSortConfig({
      key: clickedKey as SortKey, // explicitly cast the key
      direction: newDirection,
    });

    setFiles(
      [...files].sort((a, b) => {
        if (!a[clickedKey] || !b[clickedKey]) return 0;

        if (clickedKey === "uploadDate") {
          const dateA = new Date(a[clickedKey]);
          const dateB = new Date(b[clickedKey]);
          return newDirection === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        } else {
          const valueA = a[clickedKey].toString().toLowerCase();
          const valueB = b[clickedKey].toString().toLowerCase();

          return newDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
      })
    );
  };
  const getSortIcon = (key: keyof File) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="inline ml-1" />
    ) : (
      <FaSortDown className="inline ml-1" />
    );
  };

  return (
    <>
      {" "}
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
                <ClipLoader color="white" size={24} />
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
      {files.length !== 0 ? (
      <Table className="w-full border rounded-lg shadow mt-2">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead
              onClick={() => handleSort("filename")}
              className="cursor-pointer"
            >
              File Name {getSortIcon("filename")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("contentType")}
              className="cursor-pointer"
            >
              File Type {getSortIcon("contentType")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("size")}
              className="cursor-pointer"
            >
              File Size {getSortIcon("size")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("uploadDate")}
              className="cursor-pointer"
            >
              Date Created {getSortIcon("uploadDate")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={file.id} className="border-b">
              <TableCell>{file.filename}</TableCell>
              <TableCell>{file.contentType}</TableCell>
              <TableCell>{file.size} MB</TableCell>
              <TableCell>{file.uploadDate}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => window.open(file.downloadUrl)}
                >
                  <FaDownload />
                </Button>
                <Button
                  className="cursor-pointer"
                  size="icon"
                  variant="outline"
                  onClick={() => handleDelete(file.id, index)}
                >
                  <FaTrash />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      ) : (
      <div className="flex flex-col justify-center items-center w-full h-96">
        <CgUnavailable className="text-6xl text-gray-400" size={128} />
        <h2 className="text-2xl">No files found</h2>
      </div>
      )};
    </>
  );
};

export default FileTable;
