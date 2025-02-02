import { useEffect, useState } from "react";
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
} from "react-icons/fa";
import axios from "axios";

import { useToast } from "@/hooks/use-toast";
import { File } from "@/types/FileType";
import { SortConfig, SortDirection, SortKey } from "@/types/TableType";
import clsx from "clsx";

const FileTable = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    getData();
  }, []);

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
      });
    }
  };

  const handleDelete = (fileId: string, index: any) => {
   const response =  confirm("Are you sure you want to delete this file?")
    if(!response) return;
    axios
      .delete(`http://localhost:8080/files/${fileId}`)
      .then(() => {
        toast({
          variant: "default",
          title: "File Deleted Successfully",
        });
        setFiles(files.filter((_, i) => i !== index));
      })
      .catch((error: any) => {
        console.error("Failed to delete file", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.response.data,
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
  );
};

export default FileTable;
