import fs from "fs/promises";

const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Handle any errors during file deletion
    throw error;
  }
};

export default deleteFile;
