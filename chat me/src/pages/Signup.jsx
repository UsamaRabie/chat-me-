import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
const Signup = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      //Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            //create user on firestore
           await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            //create empty user chats on firestore
          await setDoc(doc(db, "userChats", res.user.uid), {});
           navigate("/");
          } catch (err) {
            console.log(err);
            setErr(true);
            setLoading(false);
          }
        });
      });
    } catch (err) {
      setErr(true);
      setLoading(false);
    }
  };


  return (
   <div className="formContainer">
    <div className="formWrapper">
        <form  onSubmit={handleSubmit}>
            <p className='logo'>Chat me كلمني</p>
            <p className='title'>Sign Up</p>
            <input type="text" placeholder='Enter your name' required/>
            <input type="email" placeholder='Enter your E mail' required/>
            <input type="password" placeholder='Enter your password' required/> 
            <input type="file" id='file'/>
            <label htmlFor="file" >
              
                 <i className="fa-solid fa-image" >
                  </i>  select image            
                </label>


                 <button className="btn bg-success rounded-5" disabled={loading}>Sign up</button>
          {loading && "Uploading and compressing the image please wait..."}
          {err && <span>Something went wrong</span>}
           
        </form>
       <p>
          You do have an account? <Link to="/login">Login</Link>
        </p>
    </div>
   </div>
  )
}

export default Signup;