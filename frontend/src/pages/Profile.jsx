import React, { useEffect, useState, useRef } from "react";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import * as jwt_decode from "jwt-decode";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode.jwtDecode(token);
        setUser({
          name: decoded.name,
          email: decoded.email,
          userSince: new Date(decoded.iat * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          profilePic: decoded.profilePic || null, // Assuming profilePic exists in token
        });
        setProfilePhoto(decoded.profilePic || null);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB.");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Unsupported file format. Please upload a JPG or PNG.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
        setProfilePhoto(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!user?.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    // Simulate an API call
    setTimeout(() => {
      toast.success("Profile updated successfully!");
      setPhotoPreview(null); // Reset preview
      setIsSaving(false);
    }, 2000);
  };

  const handleNameClick = () => {
    if (nameInputRef.current) {
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length);
      nameInputRef.current.focus();
    }
  };

  if (!token) {
    return (
      <>
        <h1 className="text-center text-black text-2xl -mt-7 font-semi Please login to see your profilebold h-screen flex justify-center items-center">
          Please login to see your profile
        </h1>
      </>
    );
  }

  if (!user) {
    return (
      <h1 className="text-center text-black text-2xl -mt-7 font-semibold h-screen flex justify-center items-center">
        Loading profile...
      </h1>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col items-center mt-14">
      <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>

      {/* Profile Photo */}
      <div className="relative avatar">
        <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
          {photoPreview || profilePhoto ? (
            <img
              src={photoPreview || profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-xl bg-gray-200 text-gray-500">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("") || "No Photo"}
            </div>
          )}
        </div>

        {/* Camera Icon for Upload */}
        <label
          htmlFor="photo-upload"
          className="absolute bottom-0 right-2 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary-focus"
        >
          <Camera size={16} />
        </label>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Account Information */}
      <div className="card w-full max-w-lg bg-base-100 mt-6 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Account Information</h2>

          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              value={user.name}
              onClick={handleNameClick}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="input input-bordered"
              disabled
              ref={nameInputRef}
            />
          </div>

          {/* Email (Disabled) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input input-bordered input-disabled"
            />
          </div>

          {/* User Since (Disabled) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">User Since</span>
            </label>
            <input
              type="text"
              value={user.userSince}
              disabled
              className="input input-bordered input-disabled"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
