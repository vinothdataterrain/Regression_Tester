import {
  DateRangeRounded,
  Edit,
  Email,
  Person,
  Person2Rounded,
  Phone,
  TextSnippet,
} from "@mui/icons-material";
import { useEditMyProfileMutation, useGetMyProfileQuery } from "../services/profile";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function Profile() {
  const [edit, setEdit] = useState(false);
  const { data: profile,isLoading } = useGetMyProfileQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );
  const[editmyProfile] = useEditMyProfileMutation();
  const [form, setForm] = useState({});
  useEffect(()=>{
    setForm({
    username: profile?.username,
    bio: profile?.bio,
    phone: profile?.phone,
  });
  },[profile])
  if (!profile && isLoading) return <p>Loading...</p>;
  const Validate = ()=>{
    let error = false;
    let message ="";
    if(!form.username){
        error = true;
        message = "Username can't be empty"
    }
    else if (!form.phone || form.phone.length !== 10){
        error = true;
        message= "Enter valid mobile number"
    }
    return {error,message};
  }
  const handleSubmit = async (e) =>  {
    e.preventDefault();
   try { 
    const {error, message} = Validate();
    if(!error){
    await editmyProfile(form).then((_res)=> { if(_res)toast.success("Updated successfully!"); });
    
   }
   else{
    toast.error(message);
   }
   }
   catch(err){
    console.error(err);
   }
   finally{
    setEdit(false);
   }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white/80 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-xl">
      {/* Header */}
      <div className="flex justify-between">
        <h4 className="text-3xl font-extrabold mb-10 text-gray-900 dark:text-white tracking-tight">
          {edit ? "Edit" : "My"} Profile
        </h4>
        <div className="flex">
          {" "}
          <span className="inline-block px-4 h-8 w-max py-1.5 border border-blue-200 text-sm font-medium text-blue-700 bg-blue-100 dark:bg-blue-800 dark:text-blue-200 rounded-3xl shadow-sm">
            {profile?.role}
          </span>
          {!edit && (
            <div className="mx-2 border border-blue-200 bg-blue-100 rounded-full p-1.5 w-8 h-8 flex items-center justify-center">
              <Edit className="text-blue-700" onClick={() => setEdit(true)} />
            </div>
          )}
        </div>
      </div>
      {/* Profile Section */}
      {!edit && (
        <div className="flex items-center shadow-md bg-gray-50/80 rounded-xl p-3 gap-6">
          {profile?.avatar ? (
            <img
              src={profile?.avatar || "/default-avatar.png"}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-md hover:scale-105 transition-transform"
              alt="avatar"
            />
          ) : (
            <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center border-4 border-blue-500 shadow-md hover:scale-105 transition-transform">
              <Person2Rounded className="size-24 text-blue-600" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile?.username}
            </p>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="material-icons text-sm flex items-center">
                <Email className="size-0.5 mr-1 text-blue-500" /> Email:{" "}
              </span>{" "}
              {profile?.email}
            </p>
          </div>
        </div>
      )}
       {!edit && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm sm:col-span-2">
              <label className="flex text-sm  font-medium text-gray-500 mb-1 items-center">
                <TextSnippet className="w-4 h-4 mr-2 text-blue-600" /> Bio
              </label>
              <p className="text-gray-800 dark:text-gray-300">
                {profile?.bio || "—"}
              </p>
            </div>

            <div className="p-4 bg-gray-50  dark:bg-gray-800 rounded-xl shadow-sm">
              <label className="flex text-sm font-medium text-gray-500 mb-1 items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-600" /> Phone
              </label>
              <p className="text-gray-800 dark:text-gray-300">
                {profile?.phone || "—"}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm sm:col-span-1">
              <label className="flex text-sm font-medium text-gray-500 mb-1 items-center">
                <DateRangeRounded className="w-4 h-4 mr-2 text-blue-600" />{" "}
                Joined
              </label>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(profile?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
     {edit &&  <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto p-2 "
      >
        
          <div className="flex  shadow-md bg-gray-50/80 rounded-xl p-1">
              {/* Username (editable) */}
            <div className="w-full flex  flex-col  items-start  space-y-2 p-3"> 
              <label className="font-medium text-gray-500 mb-1  items-center flex"><Person className="w-4 h-4 mr-2 text-blue-600"/>Username</label>
              <input
                type="text"
                name="username"
                className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:text-white dark:border-gray-600 focus:outline-none focus:border-blue-600"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
           </div>
          </div>

        {/* Info Section */}
       
      
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm sm:col-span-2">
              <label className="flex text-sm font-medium text-gray-500 mb-1 items-center">
                <TextSnippet className="w-4 h-4 mr-2 text-blue-600" /> Bio
              </label>

              <textarea
                rows="3"
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-800 dark:text-gray-300 focus:outline-none focus:border-blue-500"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
              <label className="flex text-sm font-medium text-gray-500 mb-1 items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-600" /> Phone
              </label>

              <input
                type="number"
                maxLength={10}
                minLength={10}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 p-1 focus:outline-none focus:border-blue-500 text-gray-800 dark:text-gray-300"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
           
          </div>
          <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={()=>setEdit(false)}
                className="px-3 py-2 w-[100px] border border-blue-600 hover:border-blue-700 text-blue-400 font-semibold rounded-md shadow-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2  w-[100px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition"
              >
                Save 
              </button>
            </div>
      </form>}
    </div>
  );
}
