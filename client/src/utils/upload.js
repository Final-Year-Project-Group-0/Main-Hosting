// import axios from "axios";


// const upload = async (file) => {
//     const data = new FormData();
//     data.append("file", file);
//     data.append("upload_preset", "freelan")
    
//     try{
//         const res = await axios.post("https://api.cloudinary.com/v1_1/diuv74411/image/upload", data);

//         const {url} = res.data;
//         return url;
//     } catch(err){
//         console.log(err)
//     }
//   }

//   export default upload;


import axios from "axios";

// Upload a profile image
const uploadImage = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "freelan");

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/diuv74411/image/upload",
      data
    );

    const { url } = res.data;
    return url;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// Upload a certification document (PDF)
const uploadCertification = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "freelancify_certificates");
  data.append("resource_type", "raw"); // Important for PDF uploads

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dop6ilnyq/raw/upload",
      data
    );

    const { url } = res.data;
    return url;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// Upload multiple certification files
const uploadMultipleCertifications = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = Array.from(files).map((file) =>
    uploadCertification(file)
  );

  try {
    const urls = await Promise.all(uploadPromises);
    return urls.filter((url) => url !== null); // Filter out any failed uploads
  } catch (err) {
    console.log(err);
    return [];
  }
};

// Export all functions, with the original 'upload' as default for backward compatibility
export default uploadImage;
export { uploadImage, uploadCertification, uploadMultipleCertifications };
